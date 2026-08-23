-- Migration 0020: append pg_temp to every SECURITY DEFINER function's search_path
-- ===========================================================================
-- 0019 pinned `SET search_path = public, pg_temp` on the RBAC helpers. Running
-- the audit query against a real database afterwards showed the rest of the
-- schema was only half-pinned:
--
--   SELECT p.proname, p.proconfig FROM pg_proc p
--     JOIN pg_namespace n ON n.oid = p.pronamespace
--    WHERE n.nspname='public' AND p.prosecdef ORDER BY 1;
--
--   auth_role                | {"search_path=public, pg_temp"}   <- 0019, correct
--   create_order             | {search_path=public}              <- 20 like this
--   record_payment_success   | {search_path=public}
--   ...
--
-- 20 of 26 definer functions set `search_path = public` and stop there. Grepping
-- the migrations for "SET search_path" says they are all fine; they are not, and
-- the difference is the whole point of the hardening.
--
-- WHY OMITTING pg_temp IS NOT A COSMETIC DIFFERENCE:
-- Postgres always searches the temporary schema. If pg_temp is NOT named in
-- search_path, it is searched IMPLICITLY AND FIRST — ahead of every schema you
-- did list. So inside a SECURITY DEFINER function running as its owner:
--
--   CREATE TEMP TABLE profiles (id uuid, role text, status text);
--   INSERT INTO profiles VALUES (auth.uid(), 'owner', 'active');
--
-- ...and `SELECT ... FROM profiles` inside is_owner() reads the attacker's temp
-- table instead of public.profiles. That is precisely the shadowing attack the
-- pinned search_path is supposed to prevent, still fully open on 20 functions,
-- including `record_payment_success` and `create_order`.
--
-- Naming pg_temp explicitly moves it to the END of the resolution order, where
-- it can no longer shadow anything. `public, pg_temp` is the Supabase-recommended
-- form and what their linter checks for.
--
-- WHY A DO BLOCK RATHER THAN A LIST OF ALTER STATEMENTS:
-- A hand-written list is a snapshot that goes stale the moment someone adds a
-- definer function — which is how the schema arrived in this state in the first
-- place. This states the RULE instead: every SECURITY DEFINER function in
-- `public` pins `public, pg_temp`. It is idempotent, safe to re-run, and re-runs
-- usefully after new functions are added. `oid::regprocedure` renders the full
-- argument signature, so the two `update_settings` overloads are both handled
-- and neither is ambiguous.
--
-- ALTER FUNCTION ... SET only touches proconfig; bodies, owners, and grants are
-- left exactly as they are.

DO $do$
DECLARE
  fn      record;
  n_fixed int := 0;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure AS sig, p.proconfig
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.prosecdef
       -- Already correct? Leave it alone. Matches with or without the space
       -- Postgres inserts when the value was written as a quoted list.
       AND NOT EXISTS (
         SELECT 1 FROM unnest(coalesce(p.proconfig, '{}')) AS cfg
          WHERE replace(cfg, ' ', '') = 'search_path=public,pg_temp'
       )
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', fn.sig);
    n_fixed := n_fixed + 1;
    RAISE NOTICE 'pinned search_path on %', fn.sig;
  END LOOP;

  RAISE NOTICE '0020: pinned search_path = public, pg_temp on % function(s)', n_fixed;
END;
$do$;

-- ---------------------------------------------------------------------------
-- Assert the invariant rather than trusting the loop
-- ---------------------------------------------------------------------------
-- If any definer function in `public` is still unpinned after the block above,
-- fail the migration. A hardening migration that silently half-applies is worse
-- than one that never ran, because the audit query is the only thing anyone
-- checks afterwards.
DO $do$
DECLARE
  offenders text;
BEGIN
  SELECT string_agg(p.oid::regprocedure::text, ', ' ORDER BY p.oid::regprocedure::text)
    INTO offenders
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public'
     AND p.prosecdef
     AND NOT EXISTS (
       SELECT 1 FROM unnest(coalesce(p.proconfig, '{}')) AS cfg
        WHERE replace(cfg, ' ', '') = 'search_path=public,pg_temp'
     );

  IF offenders IS NOT NULL THEN
    RAISE EXCEPTION 'SECURITY DEFINER functions still without a pinned search_path: %',
      offenders USING ERRCODE = '42501';
  END IF;
END;
$do$;

-- ---------------------------------------------------------------------------
-- VERIFICATION
-- ---------------------------------------------------------------------------
--   SELECT p.proname, p.proconfig FROM pg_proc p
--     JOIN pg_namespace n ON n.oid = p.pronamespace
--    WHERE n.nspname='public' AND p.prosecdef ORDER BY 1;
--   -- every row: {"search_path=public, pg_temp"}
