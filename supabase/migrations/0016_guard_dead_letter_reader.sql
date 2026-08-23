-- Migration 0016: authorize get_dead_letter_webhooks()
-- ===========================================================================
-- `replay_webhook_event` opens with
--     IF NOT is_admin_or_owner() THEN RAISE EXCEPTION 'UNAUTHORIZED: ...'
-- but its sibling reader `get_dead_letter_webhooks` has no check at all, while
-- being SECURITY DEFINER and GRANTed to `authenticated`.
--
-- That is the more damaging of the two. Replay only re-queues an event we already
-- own; the reader returns `webhook_events.payload` — the raw inbound Razorpay
-- bodies, with payment ids, amounts and customer contact details — to ANY
-- authenticated account, including plain `staff`, who are excluded from Payments
-- by the RBAC table. 0015 enabling RLS on `webhook_events` does not help here:
-- SECURITY DEFINER runs as the function owner and bypasses RLS by design, which
-- is precisely why the check has to live inside the function body.
--
-- The original is LANGUAGE sql, which cannot host an IF/RAISE, so this recreates
-- it as plpgsql. Signature, return columns, ordering and paging are unchanged —
-- `WebhooksTable` needs no edit.
--
-- STABLE is retained: it still only reads. SET search_path stays pinned so a
-- caller-controlled search_path cannot shadow `webhook_events` or the guard.

DROP FUNCTION IF EXISTS get_dead_letter_webhooks(INT, INT);

CREATE OR REPLACE FUNCTION get_dead_letter_webhooks(
  p_limit  INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  provider TEXT,
  event_type TEXT,
  external_event_id TEXT,
  payload JSONB,
  retry_count INT,
  last_error TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Same guard, same error code, same wording style as replay_webhook_event so
  -- the two fail identically for an unauthorized caller.
  IF NOT is_admin_or_owner() THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Only Admins or Owners can read dead-letter webhooks'
      USING ERRCODE = '42501';
  END IF;

  -- Clamp paging: p_limit is caller-supplied and this returns full payloads, so
  -- an unbounded value is a cheap way to dump the whole table in one call.
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 200 THEN
    p_limit := 50;
  END IF;
  IF p_offset IS NULL OR p_offset < 0 THEN
    p_offset := 0;
  END IF;

  RETURN QUERY
    SELECT
      w.id, w.provider, w.event_type, w.external_event_id,
      w.payload, w.retry_count, w.last_error, w.created_at, w.updated_at
    FROM webhook_events w
    WHERE w.status = 'dead_letter'
    ORDER BY w.updated_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- DROP removed the old grant; restore it. `authenticated` is correct here —
-- the function now authorizes the caller itself.
GRANT EXECUTE ON FUNCTION get_dead_letter_webhooks(INT, INT) TO authenticated;

-- VERIFICATION (needs a live project):
--   -- as a staff-role session:
--   SELECT * FROM get_dead_letter_webhooks();   -- expect SQLSTATE 42501
--   -- as an owner/admin session: expect rows (or none), not an error.
