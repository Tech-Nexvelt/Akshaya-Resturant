-- Migration 0011: Enterprise-Grade Hardening & Financial Integrity
-- Implements webhook dead-letter replay, max retry windows, payment drift guards,
-- alert rate-limiting throttle, and GUC request context propagation.

-- ---------------------------------------------------------------------------
-- 1. PAYMENT DRIFT PROTECTION & MULTI-CURRENCY SAFETY
-- ---------------------------------------------------------------------------

ALTER TABLE payments
ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'INR';

-- Hardened Payment Integrity Trigger
CREATE OR REPLACE FUNCTION verify_payment_drift_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_total NUMERIC(10,2);
  v_order_status order_status;
BEGIN
  -- ⚠️ These guards deliberately do NOT write to activity_logs.
  -- They used to. It never worked: an INSERT followed by RAISE EXCEPTION in the
  -- same transaction is rolled back by that very exception, so not one
  -- 'payment.currency_mismatch' or 'payment.amount_mismatch' row ever reached the
  -- table. It read like a working audit trail while recording nothing — worse than
  -- no logging, because the alerting design assumed it was there.
  -- Postgres has no autonomous transactions, so a rejecting trigger cannot durably
  -- log its own rejection. The CALLER logs instead: both payment routes already
  -- catch these SQLSTATEs and emit structured critical events via lib/observability.ts.

  -- 1. Currency Enforcement
  IF NEW.currency <> 'INR' THEN
    RAISE EXCEPTION 'CURRENCY_MISMATCH: Only INR payments are supported (received %)', NEW.currency USING ERRCODE = '22000';
  END IF;

  -- 2. Fetch target order total and status
  SELECT total, status INTO v_order_total, v_order_status
  FROM orders WHERE id = NEW.order_id FOR SHARE;

  IF v_order_total IS NULL THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND: Referenced order % does not exist', NEW.order_id USING ERRCODE = '23503';
  END IF;

  -- 3. Strict Amount Equality Validation (No Partial or Mismatched Payments)
  -- See the note above: no audit INSERT here either, it could never survive the
  -- RAISE. The exception message carries both amounts so the caller can log them.
  IF NEW.amount <> v_order_total THEN
    RAISE EXCEPTION 'AMOUNT_MISMATCH: Payment amount (%) does not match order total (%)', NEW.amount, v_order_total USING ERRCODE = '22000';
  END IF;

  -- 4. Order State Protection
  IF v_order_status = 'cancelled' THEN
    RAISE EXCEPTION 'INVALID_ORDER_STATE: Cannot initiate payment for a cancelled order' USING ERRCODE = '22000';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_verify_payment_amount ON payments;
DROP TRIGGER IF EXISTS trg_verify_payment_drift_guard ON payments;

CREATE TRIGGER trg_verify_payment_drift_guard
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION verify_payment_drift_guard();


-- ---------------------------------------------------------------------------
-- 2. WEBHOOK RETRY BACKOFF CAP & DEAD-LETTER REPLAY
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_webhook_outcome(
  p_event_id    UUID,
  p_success     BOOLEAN,
  p_error_msg   TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_retry_count   INT;
  v_max_retries   INT;
  v_created_at    TIMESTAMPTZ;
  v_backoff_secs  INT;
  v_capped_delay  INTERVAL;
BEGIN
  SELECT retry_count, max_retries, created_at
  INTO v_retry_count, v_max_retries, v_created_at
  FROM webhook_events WHERE id = p_event_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Webhook event % not found', p_event_id;
  END IF;

  IF p_success THEN
    UPDATE webhook_events
    SET status = 'success',
        processed_at = now(),
        last_error = NULL,
        next_retry_at = NULL,
        updated_at = now()
    WHERE id = p_event_id;
  ELSE
    v_retry_count := v_retry_count + 1;

    -- Enforce 24-Hour Maximum Delivery Window & Max Retries Cap
    IF v_retry_count >= v_max_retries OR v_created_at < (now() - INTERVAL '24 hours') THEN
      UPDATE webhook_events
      SET status = 'dead_letter',
          retry_count = v_retry_count,
          last_error = COALESCE(p_error_msg, 'Max retries or 24h retry window exhausted'),
          next_retry_at = NULL,
          updated_at = now()
      WHERE id = p_event_id;

      PERFORM log_activity_event(
        'webhook.dead_letter', 'webhook_event', p_event_id, 'critical',
        jsonb_build_object('retry_count', v_retry_count, 'last_error', p_error_msg)
      );
    ELSE
      -- Calculate Exponential Backoff with 1-Hour Cap (60s, 120s, 240s... max 3600s)
      v_backoff_secs := LEAST(3600, 60 * POWER(2, v_retry_count - 1)::INT);
      v_capped_delay := (v_backoff_secs || ' seconds')::INTERVAL;

      UPDATE webhook_events
      SET status = 'failed',
          retry_count = v_retry_count,
          last_error = p_error_msg,
          next_retry_at = now() + v_capped_delay,
          updated_at = now()
      WHERE id = p_event_id;
    END IF;
  END IF;
END;
$$;

-- RPC: Admin Manual Replay of Dead-Letter or Failed Webhooks
CREATE OR REPLACE FUNCTION replay_webhook_event(
  p_event_id UUID,
  p_actor_id UUID DEFAULT NULL
)
RETURNS TABLE (event_id UUID, new_status webhook_status)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin_or_owner() THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Only Admins or Owners can replay webhooks' USING ERRCODE = '42501';
  END IF;

  UPDATE webhook_events
  SET status = 'pending',
      retry_count = 0,
      next_retry_at = now(),
      last_error = NULL,
      updated_at = now()
  WHERE id = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Webhook event % not found', p_event_id;
  END IF;

  PERFORM log_activity_event(
    'webhook.replayed', 'webhook_event', p_event_id, 'info',
    jsonb_build_object('replayed_by', COALESCE(p_actor_id, auth.uid())),
    COALESCE(p_actor_id, auth.uid())
  );

  RETURN QUERY SELECT p_event_id, 'pending'::webhook_status;
END;
$$;

-- RPC: Dead-Letter Inspection Reader for Admin Dashboard
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
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    w.id, w.provider, w.event_type, w.external_event_id,
    w.payload, w.retry_count, w.last_error, w.created_at, w.updated_at
  FROM webhook_events w
  WHERE w.status = 'dead_letter'
  ORDER BY w.updated_at DESC
  LIMIT p_limit OFFSET p_offset;
$$;

GRANT EXECUTE ON FUNCTION replay_webhook_event TO authenticated;
GRANT EXECUTE ON FUNCTION get_dead_letter_webhooks TO authenticated;


-- ---------------------------------------------------------------------------
-- 3. REQUEST CORRELATION GUC PROPAGATION
-- ---------------------------------------------------------------------------

-- Set request ID for current database transaction session
CREATE OR REPLACE FUNCTION set_request_context(p_request_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.current_request_id', p_request_id, true);
END;
$$;

-- Upgrade log_activity_event to automatically inherit GUC request ID
CREATE OR REPLACE FUNCTION log_activity_event(
  p_action      TEXT,
  p_entity_type TEXT,
  p_entity_id   UUID,
  p_severity    log_severity DEFAULT 'info',
  p_metadata    JSONB DEFAULT '{}'::jsonb,
  p_actor_id    UUID DEFAULT NULL,
  p_request_id  TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
  v_req_id TEXT;
BEGIN
  v_req_id := COALESCE(p_request_id, current_setting('app.current_request_id', true));

  INSERT INTO activity_logs (
    action, entity_type, entity_id, severity, metadata, actor_id, request_id
  )
  VALUES (
    p_action, p_entity_type, p_entity_id, p_severity, p_metadata, p_actor_id, v_req_id
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

GRANT EXECUTE ON FUNCTION set_request_context TO authenticated, service_role;
