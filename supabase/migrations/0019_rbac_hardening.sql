-- Migration 0019: RBAC hardening
-- ===========================================================================
-- Depends on 0018 (adds the 'super_admin' enum label). Fixes four things:
--
--   A. SECURITY DEFINER functions have no `SET search_path`. A definer function
--      runs as its owner; without a pinned search_path, a caller who can create
--      objects in a schema earlier on the resolution path can shadow `profiles`
--      and make `is_owner()` return whatever they like. This is the standard
--      Postgres definer-function hardening and Supabase's own linter flags it.
--
--   B. `is_staff()` currently means "a profiles row exists for auth.uid()" —
--      not "holds a staff role". Those are the same thing only for as long as
--      nobody adds a trigger that auto-creates a profile on signup. Since
--      `profiles.role` DEFAULTS TO 'staff', and is_staff() grants read on
--      orders, order_items, invoices and both enquiry tables, adding such a
--      trigger would hand every new signup the entire order book in one step.
--      Make the role test explicit so that landmine cannot be stepped on.
--
--   C. `super_admin` would otherwise have LESS access than `admin`, because
--      every existing policy routes through is_admin_or_owner(), which lists
--      only ('admin','owner'). Fold the new role into the helpers.
--
--   D. `profiles` has no way to deactivate an account short of deleting the row,
--      and nothing stops a user editing their own role. Add a status column and
--      a trigger that blocks self-elevation regardless of policy.

-- ---------------------------------------------------------------------------
-- D1. Account status — deactivate without deleting
-- ---------------------------------------------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'inactive', 'suspended'));

COMMENT ON COLUMN profiles.status IS
  'Account state. Only ''active'' passes the RBAC helper functions. Setting this '
  'to inactive/suspended revokes access at the next request; it does NOT revoke '
  'an already-issued JWT, so also call auth.admin.signOut() for the user.';

-- ---------------------------------------------------------------------------
-- A + B + C. Rebuild the helper functions: pinned search_path, explicit roles,
--            active-only, super_admin included.
-- ---------------------------------------------------------------------------

-- Any active staff-level account (staff, admin, owner, super_admin).
CREATE OR REPLACE FUNCTION is_staff() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
     WHERE id = auth.uid()
       AND status = 'active'
       AND role IN ('staff', 'admin', 'owner', 'super_admin')
  );
$$;

-- Elevated operational access. Named for history; now includes super_admin.
CREATE OR REPLACE FUNCTION is_admin_or_owner() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
     WHERE id = auth.uid()
       AND status = 'active'
       AND role IN ('admin', 'owner', 'super_admin')
  );
$$;

-- Owner-level: settings, GST toggle, role assignment. super_admin outranks owner.
CREATE OR REPLACE FUNCTION is_owner() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
     WHERE id = auth.uid()
       AND status = 'active'
       AND role IN ('owner', 'super_admin')
  );
$$;

-- Platform-wide. Reserve for cross-business surfaces only.
CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
     WHERE id = auth.uid()
       AND status = 'active'
       AND role = 'super_admin'
  );
$$;

-- Read the caller's role once, for RPCs that need to branch on it.
CREATE OR REPLACE FUNCTION auth_role() RETURNS user_role
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.profiles
   WHERE id = auth.uid() AND status = 'active';
$$;

-- ---------------------------------------------------------------------------
-- A (cont.). The one other definer function that was still unpinned
-- ---------------------------------------------------------------------------
-- Sweeping every SECURITY DEFINER function in the schema (not only the three
-- helpers) turns up exactly one more: `set_request_context` from 0011, which
-- declared SECURITY DEFINER and no search_path. Everything else defined in
-- 0004-0017 already pins it. Redefined here byte-for-byte plus the SET, so the
-- pg_proc.proconfig check below comes back clean for the whole schema rather
-- than for the helpers alone.
CREATE OR REPLACE FUNCTION set_request_context(p_request_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  PERFORM set_config('app.current_request_id', p_request_id, true);
END;
$$;

-- ---------------------------------------------------------------------------
-- D2. Block self-elevation at the table, not just in policy
-- ---------------------------------------------------------------------------
-- The 0005 policies already restrict profile writes to owners, and the comment
-- there documents the escalation bug that motivated it. This trigger is the
-- belt to that braces: it fires regardless of which policy, RPC, or definer
-- function performed the UPDATE, so a future SECURITY DEFINER helper that
-- forgets to check cannot reintroduce the hole.
CREATE OR REPLACE FUNCTION prevent_self_role_change() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- service_role / definer contexts with no JWT are trusted (seeding, admin API).
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.id = auth.uid() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'A user cannot change their own role.'
        USING ERRCODE = '42501';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'A user cannot change their own account status.'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_role_change ON profiles;
CREATE TRIGGER trg_prevent_self_role_change
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_self_role_change();

-- ---------------------------------------------------------------------------
-- Guard against the auto-profile landmine described in (B)
-- ---------------------------------------------------------------------------
-- If a `handle_new_user` trigger is ever added on auth.users, the column default
-- decides what a brand-new account can read. 'staff' grants the order book.
-- Drop the default so a profile row must state its role explicitly.
ALTER TABLE profiles ALTER COLUMN role DROP DEFAULT;

COMMENT ON COLUMN profiles.role IS
  'No default, deliberately. Every profile row must name its role explicitly so '
  'that an auto-provisioning trigger cannot silently mint staff-level accounts.';

-- ---------------------------------------------------------------------------
-- VERIFICATION (run against a live project; cannot be checked statically)
-- ---------------------------------------------------------------------------
--   -- every definer function has a pinned search_path:
--   SELECT p.proname, p.proconfig
--     FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--    WHERE n.nspname = 'public' AND p.prosecdef
--    ORDER BY 1;
--   -- expect {search_path=public,pg_temp} on every row
--
--   -- RLS is on for every table:
--   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
--   -- expect rowsecurity = true for all
--
--   -- self-elevation is refused (run as a signed-in non-owner):
--   UPDATE profiles SET role = 'owner' WHERE id = auth.uid();
--   -- expect: ERROR 42501 A user cannot change their own role.
