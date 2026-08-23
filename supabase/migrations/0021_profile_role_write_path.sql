-- Migration 0021: make role/status writes go through a guarded RPC
-- ===========================================================================
-- Found by running the P1-1 verification against a database with Supabase's
-- DEFAULT GRANTS in place (ALTER DEFAULT PRIVILEGES ... GRANT ALL ON TABLES TO
-- anon, authenticated, service_role — which is what a real project has, and what
-- a bare local Postgres does not):
--
--   SET ROLE authenticated;
--   SET request.jwt.claim.sub = '<a staff account>';
--   UPDATE profiles SET role = 'owner' WHERE id = auth.uid();
--   -- UPDATE 0        <-- expected: ERROR 42501
--
-- The escalation IS blocked: `role` is unchanged. But it is blocked SILENTLY.
-- The BEFORE UPDATE trigger from 0019 never fires, because RLS evaluated
-- "owner update profiles" USING (is_owner()) first, matched no rows, and there
-- was no row left for a row trigger to run on. A trigger cannot defend a row
-- that RLS has already filtered away.
--
-- "Denied" and "succeeded, affected nothing" being indistinguishable is the
-- exact failure mode this schema has already been bitten by once: /admin/invoices
-- read `settings` without owner rights, RLS returned zero rows rather than an
-- error, and staff-generated tax invoices silently carried no tax (see 0006).
-- Same shape, different table.
--
-- FIX, and why this one:
-- Column-level privileges are checked BEFORE row level security, so moving
-- `role` and `status` out of `authenticated`'s UPDATE grant turns the silent
-- no-op into a hard 42501 for every authenticated caller, whatever their role
-- and whatever RLS would have decided. This is the mechanism 0005 already uses
-- to stop staff rewriting order totals ("RLS cannot restrict WHICH columns an
-- update touches") — the same problem, so the same tool.
--
-- That leaves owners needing a legitimate way to assign roles, which is what
-- `set_user_role()` below is for: SECURITY DEFINER, explicit `is_owner()` guard
-- (RLS does not apply inside a definer function), and it refuses to target the
-- caller. Identical in shape to `update_settings()` from 0006/0012 — every
-- sensitive write in this schema goes through a guarded definer RPC, and role
-- assignment was the one that had been left as a raw table write.
--
-- NOTHING IS WIDENED HERE. No policy is added, dropped, or loosened. A non-owner
-- could not update anyone's profile before this migration and still cannot; the
-- only change is that the attempt now says so out loud.
--
-- Nothing in the app writes profiles.role through PostgREST today (the settings
-- console is still on the mock Zustand store), so this narrows the write path
-- before there is a caller to migrate rather than after.

-- ---------------------------------------------------------------------------
-- 1. Take role/status out of the client-writable column set
-- ---------------------------------------------------------------------------
REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (full_name, phone) ON profiles TO authenticated;

-- anon never had a reason to write profiles at all.
REVOKE UPDATE ON profiles FROM anon;

COMMENT ON TABLE profiles IS
  'Staff accounts. `role` and `status` are NOT in authenticated''s UPDATE grant: '
  'change them through set_user_role(), which checks is_owner() and refuses to '
  'target the caller. Column-level privilege is checked before RLS, so a direct '
  'UPDATE of either column raises 42501 rather than silently affecting 0 rows.';

-- ---------------------------------------------------------------------------
-- 2. The one supported way to assign a role
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_user_role(
  p_user_id uuid,
  p_role    user_role,
  p_status  text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- RLS does not apply inside a SECURITY DEFINER function, so the guard has to
  -- be written out. is_owner() matches owner and super_admin, and requires
  -- status = 'active' (0019).
  IF NOT is_owner() THEN
    RAISE EXCEPTION 'Only an owner may assign roles.'
      USING ERRCODE = '42501';
  END IF;

  -- An owner promoting themselves is how a compromised owner session becomes
  -- permanent. The 0019 trigger blocks it too; this is the earlier, clearer
  -- error, and it keeps the rule visible at the RPC boundary.
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'A user cannot change their own role or status.'
      USING ERRCODE = '42501';
  END IF;

  IF p_status IS NOT NULL AND p_status NOT IN ('active', 'inactive', 'suspended') THEN
    RAISE EXCEPTION 'Invalid account status: %', p_status
      USING ERRCODE = '22023';
  END IF;

  UPDATE profiles
     SET role   = p_role,
         status = coalesce(p_status, status)
   WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No profile with id %', p_user_id
      USING ERRCODE = 'P0002';
  END IF;

  -- Role changes are exactly the events an audit trail exists for.
  PERFORM log_activity_event(
    p_action      => 'profile.role_assigned',
    p_entity_type => 'profile',
    p_entity_id   => p_user_id,
    p_severity    => 'critical',
    p_metadata    => jsonb_build_object(
                       'new_role',   p_role,
                       'new_status', coalesce(p_status, 'unchanged')
                     ),
    p_actor_id    => auth.uid()
  );
END;
$$;

REVOKE ALL ON FUNCTION set_user_role(uuid, user_role, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION set_user_role(uuid, user_role, text) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- VERIFICATION
-- ---------------------------------------------------------------------------
--   SET ROLE authenticated;
--   SET request.jwt.claim.sub = '<any non-owner>';
--   UPDATE profiles SET role = 'owner' WHERE id = auth.uid();
--   -- ERROR 42501: permission denied for table profiles
--
--   SELECT set_user_role('<someone else>', 'admin');   -- as non-owner -> 42501
--   SELECT set_user_role(auth.uid(), 'owner');         -- as owner     -> 42501
--   SELECT set_user_role('<someone else>', 'admin');   -- as owner     -> ok
