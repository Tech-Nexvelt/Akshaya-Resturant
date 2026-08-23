-- Migration 0009: Production Hardening & Security Enforcement
-- Adds idempotency cache table, invoice sequence, rate limiting, and OCC settings updates.

-- ---------------------------------------------------------------------------
-- 1. DB-LEVEL IDEMPOTENCY STORE
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key           UUID PRIMARY KEY,
  request_path  TEXT NOT NULL,
  response      JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires 
ON idempotency_keys(expires_at);

-- Clean up expired keys automatically
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys()
RETURNS VOID LANGUAGE sql AS $$
  DELETE FROM idempotency_keys WHERE expires_at < now();
$$;

-- ---------------------------------------------------------------------------
-- 2. PAYMENT-ORDER CONSTRAINTS
-- ---------------------------------------------------------------------------
-- At most one successful payment per order
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_one_success_per_order
ON payments(order_id) WHERE status = 'success';

-- Ensure payment amount exactly matches order total
CREATE OR REPLACE FUNCTION verify_payment_amount()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_order_total NUMERIC(10,2);
BEGIN
  SELECT total INTO v_order_total FROM orders WHERE id = NEW.order_id;
  IF v_order_total IS NULL THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND: Referenced order % does not exist', NEW.order_id USING ERRCODE = '23503';
  END IF;

  IF NEW.amount <> v_order_total THEN
    RAISE EXCEPTION 'AMOUNT_MISMATCH: Payment amount (%) does not match order total (%)', NEW.amount, v_order_total USING ERRCODE = '22000';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_verify_payment_amount ON payments;
CREATE TRIGGER trg_verify_payment_amount
  BEFORE INSERT ON payments
  FOR EACH ROW EXECUTE FUNCTION verify_payment_amount();

-- ---------------------------------------------------------------------------
-- 3. INVOICE NUMBERING SAFETY (Atomic Sequence)
-- ---------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1 INCREMENT 1 MINVALUE 1;

CREATE OR REPLACE FUNCTION generate_invoice_number(p_fy TEXT DEFAULT '2026-27')
RETURNS TEXT LANGUAGE plpgsql AS $$
BEGIN
  RETURN 'AKSH/' || p_fy || '/' || lpad(nextval('invoice_number_seq')::text, 5, '0');
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. SETTINGS CONSISTENCY (Optimistic Concurrency Control)
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS update_settings(INT, JSONB);
DROP FUNCTION IF EXISTS update_settings(BOOLEAN, NUMERIC, TEXT, TEXT, INT);

CREATE OR REPLACE FUNCTION update_settings(
  p_gst_enabled         BOOLEAN,
  p_gst_rate            NUMERIC,
  p_gst_number          TEXT,
  p_legal_business_name TEXT,
  p_expected_version    INT
)
RETURNS TABLE (updated_version INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_version INT;
BEGIN
  IF NOT is_owner() THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Only Owner can update platform settings' USING ERRCODE = '42501';
  END IF;

  UPDATE settings
  SET gst_enabled         = p_gst_enabled,
      gst_rate            = p_gst_rate,
      gst_number          = p_gst_number,
      legal_business_name = p_legal_business_name,
      version             = version + 1,
      updated_by          = auth.uid(),
      updated_at          = now()
  WHERE id = true AND version = p_expected_version
  RETURNING version INTO v_new_version;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CONFLICT: Settings modified by another administrator (version mismatch)' USING ERRCODE = '40001';
  END IF;

  RETURN QUERY SELECT v_new_version;
END;
$$;

GRANT EXECUTE ON FUNCTION update_settings TO authenticated;

-- ---------------------------------------------------------------------------
-- 5. LEAD WRITE THROTTLING (Rate Limiter)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_lead_rate_limit(
  p_phone           TEXT,
  p_max_requests    INT DEFAULT 5,
  p_window_seconds  INT DEFAULT 3600
)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_recent_count INT;
BEGIN
  SELECT count(*) INTO v_recent_count
  FROM activity_logs
  WHERE entity_type = 'lead'
    AND metadata->>'phone' = p_phone
    AND created_at > (now() - (p_window_seconds || ' seconds')::INTERVAL);

  IF v_recent_count >= p_max_requests THEN
    RAISE EXCEPTION 'RATE_LIMIT_EXCEEDED: Too many enquiries from this phone number. Please wait.' USING ERRCODE = '42900';
  END IF;
END;
$$;
