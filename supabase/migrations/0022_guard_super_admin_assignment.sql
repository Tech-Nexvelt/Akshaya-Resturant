-- Migration 0022: Guard super_admin assignment & Revoke public RPC access
-- Security Hardening: Ensure only super_admin can assign super_admin role, and
-- revoke public execution on sensitive payment & webhook functions.

-- 1. Security-Hardened set_user_role()
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
  -- RLS does not apply inside SECURITY DEFINER. is_owner() matches owner and super_admin.
  IF NOT is_owner() THEN
    RAISE EXCEPTION 'Only an owner or super_admin may assign roles.'
      USING ERRCODE = '42501';
  END IF;

  -- TRUST BOUNDARY GUARD: Plain owner is per-business, super_admin is platform-wide.
  -- Restrict assigning p_role = 'super_admin' exclusively to callers where is_super_admin() is true.
  IF p_role = 'super_admin' AND NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only a super_admin can assign the super_admin role.'
      USING ERRCODE = '42501';
  END IF;

  -- Block self-targeting
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

-- 2. Revoke Public Execution on Sensitive RPCs
REVOKE EXECUTE ON FUNCTION record_payment_success FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION record_payment_success TO service_role;

REVOKE EXECUTE ON FUNCTION record_webhook_event FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION record_webhook_event TO service_role;

REVOKE EXECUTE ON FUNCTION update_webhook_outcome FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION update_webhook_outcome TO service_role;

-- NOTE: the actual function (0011) is named replay_webhook_event, not
-- replay_dead_letter_webhook — this migration originally referenced a name that
-- doesn't exist anywhere in the schema, which failed the migration outright.
REVOKE EXECUTE ON FUNCTION replay_webhook_event FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION replay_webhook_event TO authenticated, service_role;
