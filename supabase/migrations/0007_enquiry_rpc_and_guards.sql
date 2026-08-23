-- Migration 0007: Enquiry capture RPCs and payment-integrity guards.
--
-- (Was part of 0006 until the 2026-08-21 settings redesign; settings now owns 0006
-- and this migration carries the rest unchanged.)
--
-- Closes two gaps found in the system audit:
--   1. Banquet/catering enquiries were specified as transactional enquiry+lead writes
--      but shipped as two unguarded client inserts (0005 grants anon INSERT on both).
--   2. orders.status could reach 'confirmed' with no successful payment behind it.

-- ---------------------------------------------------------------------------
-- 1. INVOICE GST RATE SNAPSHOT
-- ---------------------------------------------------------------------------
-- Invoices must record the RATE they were generated with, not just the amount.
-- Without it, an invoice created at 5% and one at 18% are indistinguishable after
-- the fact except by dividing back out — ambiguous on rounded totals, and these are
-- tax documents. This is also what lets `settings` stay a current-state singleton
-- instead of a versioned config table: every past invoice is self-describing.
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS gst_rate NUMERIC(5,2) NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------------------
-- 2. ENQUIRY CAPTURE RPCs (transactional enquiry + lead)
-- ---------------------------------------------------------------------------
-- The architecture spec's Phase 5 says these must be RPCs for the same reason as
-- create_order ("never trust two separate unguarded inserts from the client"), and
-- the PRD says the enquiry row and the lead row are written in one transaction or
-- neither is. Neither was true: 0005 grants anon direct INSERT on both enquiry
-- tables and on leads, so a client crash between the two calls loses the lead while
-- keeping the enquiry (or the reverse).

CREATE OR REPLACE FUNCTION create_banquet_enquiry(
  p_name         TEXT,
  p_phone        TEXT,
  p_event_type   TEXT,
  p_event_date   DATE    DEFAULT NULL,
  p_guest_count  INT     DEFAULT NULL,
  p_budget_range TEXT    DEFAULT NULL,
  p_notes        TEXT    DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RAISE EXCEPTION 'Name is required';
  END IF;
  IF p_phone IS NULL OR regexp_replace(p_phone, '\D', '', 'g') !~ '^[0-9]{10,13}$' THEN
    RAISE EXCEPTION 'A valid phone number is required';
  END IF;
  IF p_event_type IS NULL OR btrim(p_event_type) = '' THEN
    RAISE EXCEPTION 'Event type is required';
  END IF;

  INSERT INTO banquet_enquiries (name, phone, event_type, event_date, guest_count, budget_range, notes)
  VALUES (btrim(p_name), p_phone, p_event_type, p_event_date, p_guest_count, p_budget_range, p_notes)
  RETURNING id INTO v_id;

  INSERT INTO leads (name, phone, source, metadata)
  VALUES (btrim(p_name), p_phone, 'banquet_enquiry',
          jsonb_build_object('enquiry_id', v_id, 'event_type', p_event_type,
                             'event_date', p_event_date, 'guest_count', p_guest_count));

  INSERT INTO activity_logs (action, entity_type, entity_id, metadata)
  VALUES ('enquiry.created', 'banquet_enquiry', v_id, jsonb_build_object('event_type', p_event_type));

  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION create_catering_enquiry(
  p_name         TEXT,
  p_phone        TEXT,
  p_event_type   TEXT,
  p_location     TEXT,
  p_guest_count  INT   DEFAULT NULL,
  p_event_date   DATE  DEFAULT NULL,
  p_requirements TEXT  DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RAISE EXCEPTION 'Name is required';
  END IF;
  IF p_phone IS NULL OR regexp_replace(p_phone, '\D', '', 'g') !~ '^[0-9]{10,13}$' THEN
    RAISE EXCEPTION 'A valid phone number is required';
  END IF;
  IF p_event_type IS NULL OR btrim(p_event_type) = '' THEN
    RAISE EXCEPTION 'Event type is required';
  END IF;
  IF p_location IS NULL OR btrim(p_location) = '' THEN
    RAISE EXCEPTION 'Location is required';
  END IF;

  INSERT INTO catering_enquiries (name, phone, event_type, location, guest_count, event_date, requirements)
  VALUES (btrim(p_name), p_phone, p_event_type, btrim(p_location), p_guest_count, p_event_date, p_requirements)
  RETURNING id INTO v_id;

  INSERT INTO leads (name, phone, source, metadata)
  VALUES (btrim(p_name), p_phone, 'catering_enquiry',
          jsonb_build_object('enquiry_id', v_id, 'event_type', p_event_type,
                             'location', p_location, 'guest_count', p_guest_count));

  INSERT INTO activity_logs (action, entity_type, entity_id, metadata)
  VALUES ('enquiry.created', 'catering_enquiry', v_id, jsonb_build_object('event_type', p_event_type));

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_banquet_enquiry  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_catering_enquiry TO anon, authenticated;

-- Now that a controlled write path exists, revoke the unguarded direct inserts.
DROP POLICY IF EXISTS "public submit banquet enquiry"  ON banquet_enquiries;
DROP POLICY IF EXISTS "public submit catering enquiry" ON catering_enquiries;

-- leads keeps a public INSERT policy: button-click intent capture writes to it
-- directly with no enquiry row behind it. It is the one genuinely unguarded public
-- write in the system, which is exactly why Phase 9's rate limiting is not optional.

-- ---------------------------------------------------------------------------
-- 3. PAYMENT INTEGRITY GUARD
-- ---------------------------------------------------------------------------
-- The PRD states an order is confirmed if and only if a successful payment exists.
-- Nothing enforced that: any staff account (or a bug in a route handler) could set
-- status='confirmed' on an unpaid order. Triggers apply to the service-role webhook
-- too, so this also forces the webhook to write payments.status='success' BEFORE
-- flipping the order — the correct ordering regardless.
CREATE OR REPLACE FUNCTION enforce_paid_before_confirmed() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status IS DISTINCT FROM 'confirmed' THEN
    IF NOT EXISTS (
      SELECT 1 FROM payments
      WHERE order_id = NEW.id AND status = 'success'
    ) THEN
      RAISE EXCEPTION 'Order % cannot be confirmed without a successful payment', NEW.order_number;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_orders_paid_before_confirmed
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION enforce_paid_before_confirmed();
