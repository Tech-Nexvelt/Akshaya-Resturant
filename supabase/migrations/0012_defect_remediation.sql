-- Migration 0012: Remediation of defects D1–D7 (2026-08-21 test-plan audit)
--
-- D1 🔴 record_payment_success executable by anon  -> privilege revoked
-- D2 🟠 rate limiter matched nothing, never called -> rewritten + wired in
-- D3 🟠 receipt_number collisions, no retry        -> bounded retry loop
-- D4 🟠 notification/Sheets settings unwritable    -> full JSONB patch restored
-- D5 🟡 record_webhook_event TOCTOU race           -> INSERT ... ON CONFLICT
-- D7 🟡 invoice numbers not per-FY, not gapless    -> per-FY gapless counter
--
-- D6 (webhook returns 500 instead of 400 on a malformed signature) is a
-- TypeScript defect, fixed in app/api/webhooks/razorpay/route.ts and
-- app/api/payments/verify/route.ts — not in this file.

-- ===========================================================================
-- D1 [CRITICAL] — Revoke anonymous execution of payment confirmation
-- ===========================================================================
-- record_payment_success marks a payment successful and confirms the order. It
-- performs no signature verification of its own — verification lives in the two
-- route handlers. But PostgREST exposes every RPC at /rest/v1/rpc/<name>, so the
-- GRANT to anon let any internet caller with a razorpay_order_id confirm an
-- unpaid order, bypassing the HMAC check entirely.
--
-- Both legitimate callers (app/api/webhooks/razorpay, app/api/payments/verify)
-- use the service-role client, so service_role alone is sufficient.
REVOKE EXECUTE ON FUNCTION record_payment_success(TEXT, TEXT, TEXT, JSONB) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION record_payment_success(TEXT, TEXT, TEXT, JSONB) TO service_role;

-- Same exposure class: these mutate or read privileged state and are only ever
-- called server-side. create_order / create_*_enquiry deliberately KEEP anon
-- (guest checkout and public enquiry submission are the product).
REVOKE EXECUTE ON FUNCTION record_webhook_event(webhook_direction, TEXT, TEXT, TEXT, JSONB) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION record_webhook_event(webhook_direction, TEXT, TEXT, TEXT, JSONB) TO service_role;

REVOKE EXECUTE ON FUNCTION update_webhook_outcome(UUID, BOOLEAN, TEXT) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION update_webhook_outcome(UUID, BOOLEAN, TEXT) TO service_role;

-- ===========================================================================
-- D3 — Receipt number collision retry (inside record_payment_success)
-- ===========================================================================
-- 'AK-RCPT-YYYYMMDD-####' from random()*10000 against a UNIQUE column collides
-- with ~50% probability within ~118 receipts in one day. A collision raised
-- *after* Razorpay captured the money, failing the webhook and triggering retries
-- for a payment that actually succeeded.
CREATE OR REPLACE FUNCTION record_payment_success(
  p_razorpay_order_id   TEXT,
  p_razorpay_payment_id TEXT,
  p_razorpay_signature  TEXT,
  p_gateway_response    JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (payment_id UUID, order_id UUID, receipt_number TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment_id     UUID;
  v_order_id       UUID;
  v_receipt_number TEXT;
  v_payment_status payment_status;
  v_attempt        INT := 0;
BEGIN
  -- Every column is table-qualified deliberately: this function's RETURNS TABLE
  -- declares OUT variables named payment_id / order_id / receipt_number, which
  -- collide with column names of the same name. Unqualified references raise
  -- "column reference is ambiguous" at runtime under plpgsql's default
  -- variable_conflict handling.
  SELECT p.id, p.order_id, p.status, p.receipt_number
  INTO v_payment_id, v_order_id, v_payment_status, v_receipt_number
  FROM payments p
  WHERE p.razorpay_order_id = p_razorpay_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment record not found for Razorpay order ID %', p_razorpay_order_id;
  END IF;

  -- Idempotency: already captured, return the existing receipt untouched.
  IF v_payment_status = 'success' THEN
    RETURN QUERY SELECT v_payment_id, v_order_id, v_receipt_number;
    RETURN;
  END IF;

  -- Bounded retry on receipt-number collision.
  LOOP
    v_attempt := v_attempt + 1;
    v_receipt_number := 'AK-RCPT-' || to_char(now(), 'YYYYMMDD') || '-' ||
                        lpad(floor(random() * 10000)::text, 4, '0');
    BEGIN
      UPDATE payments
      SET razorpay_payment_id = p_razorpay_payment_id,
          razorpay_signature  = p_razorpay_signature,
          status              = 'success',
          gateway_response    = p_gateway_response,
          receipt_number      = v_receipt_number,
          updated_at          = now()
      WHERE id = v_payment_id;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      IF v_attempt >= 10 THEN
        RAISE EXCEPTION 'Could not allocate a unique receipt number after % attempts', v_attempt;
      END IF;
    END;
  END LOOP;

  -- Monotonic: only a pending order advances to confirmed.
  UPDATE orders
  SET status = 'confirmed', updated_at = now()
  WHERE id = v_order_id AND status = 'pending';

  INSERT INTO activity_logs (action, entity_type, entity_id, metadata)
  VALUES (
    'payment.captured', 'payment', v_payment_id,
    jsonb_build_object('order_id', v_order_id,
                       'razorpay_payment_id', p_razorpay_payment_id,
                       'receipt_number', v_receipt_number)
  );

  RETURN QUERY SELECT v_payment_id, v_order_id, v_receipt_number;
END;
$$;

REVOKE EXECUTE ON FUNCTION record_payment_success(TEXT, TEXT, TEXT, JSONB) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION record_payment_success(TEXT, TEXT, TEXT, JSONB) TO service_role;

-- ===========================================================================
-- D5 — Webhook dedup TOCTOU race
-- ===========================================================================
-- SELECT-then-INSERT let two concurrent deliveries of the same event both miss
-- the SELECT and both INSERT; the loser hit idx_webhook_events_provider_external_id
-- and raised 23505, which the route surfaced as a 500 — making Razorpay retry
-- harder. Now the unique index IS the concurrency primitive.
CREATE OR REPLACE FUNCTION record_webhook_event(
  p_direction         webhook_direction,
  p_provider          TEXT,
  p_event_type        TEXT,
  p_external_event_id TEXT,
  p_payload           JSONB
)
RETURNS TABLE (event_id UUID, is_duplicate BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  -- No external id => cannot deduplicate; always a fresh row.
  IF p_external_event_id IS NULL THEN
    INSERT INTO webhook_events (direction, provider, event_type, external_event_id, payload, status)
    VALUES (p_direction, p_provider, p_event_type, NULL, p_payload, 'processing')
    RETURNING id INTO v_event_id;
    RETURN QUERY SELECT v_event_id, false;
    RETURN;
  END IF;

  -- Atomic claim: exactly one concurrent caller gets a row back.
  -- The WHERE clause is required, not optional: idx_webhook_events_provider_external_id
  -- is a PARTIAL unique index, and ON CONFLICT inference only matches a partial
  -- index when the predicate is restated here. Without it Postgres raises
  -- "no unique or exclusion constraint matching the ON CONFLICT specification".
  INSERT INTO webhook_events (direction, provider, event_type, external_event_id, payload, status)
  VALUES (p_direction, p_provider, p_event_type, p_external_event_id, p_payload, 'processing')
  ON CONFLICT (provider, external_event_id) WHERE external_event_id IS NOT NULL DO NOTHING
  RETURNING id INTO v_event_id;

  IF v_event_id IS NOT NULL THEN
    RETURN QUERY SELECT v_event_id, false;
    RETURN;
  END IF;

  -- Lost the race (or a genuine redelivery): return the winner's id.
  SELECT id INTO v_event_id
  FROM webhook_events
  WHERE provider = p_provider AND external_event_id = p_external_event_id;

  RETURN QUERY SELECT v_event_id, true;
END;
$$;

REVOKE EXECUTE ON FUNCTION record_webhook_event(webhook_direction, TEXT, TEXT, TEXT, JSONB) FROM anon, authenticated, PUBLIC;
GRANT  EXECUTE ON FUNCTION record_webhook_event(webhook_direction, TEXT, TEXT, TEXT, JSONB) TO service_role;

-- ===========================================================================
-- D7 — Per-FY, gapless invoice numbering
-- ===========================================================================
-- invoice_number_seq was a single global sequence: it never reset per financial
-- year (FY2027 continued FY2026's count despite the FY appearing in the string),
-- and sequences are non-transactional, so a rolled-back invoice burned a number
-- and left a gap in a tax series.
--
-- Replaced with a per-FY counter row. UPDATE ... RETURNING takes a row lock, so
-- concurrent callers serialize on that one row and a rollback returns the number
-- to the pool. Trade-off accepted deliberately: invoice generation is low-volume
-- and gapless legal numbering matters more than write concurrency here.
CREATE TABLE IF NOT EXISTS invoice_counters (
  fy          TEXT PRIMARY KEY,
  last_number INT NOT NULL DEFAULT 0 CHECK (last_number >= 0),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE invoice_counters ENABLE ROW LEVEL SECURITY;
-- No policies: reachable only through the SECURITY DEFINER function below.

-- Indian financial year: 1 April – 31 March. 2026-08-21 falls in FY '2026-27'.
-- STABLE, not IMMUTABLE: the default argument is now(). Marking it IMMUTABLE
-- would licence the planner to fold a stale value into a cached plan.
CREATE OR REPLACE FUNCTION current_financial_year(p_at TIMESTAMPTZ DEFAULT now())
RETURNS TEXT
LANGUAGE sql STABLE AS $$
  SELECT CASE
    WHEN EXTRACT(MONTH FROM p_at)::INT >= 4
      THEN EXTRACT(YEAR FROM p_at)::INT::TEXT || '-' ||
           right((EXTRACT(YEAR FROM p_at)::INT + 1)::TEXT, 2)
    ELSE (EXTRACT(YEAR FROM p_at)::INT - 1)::TEXT || '-' ||
           right(EXTRACT(YEAR FROM p_at)::INT::TEXT, 2)
  END;
$$;

CREATE OR REPLACE FUNCTION generate_invoice_number(p_fy TEXT DEFAULT NULL)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fy   TEXT;
  v_next INT;
BEGIN
  v_fy := COALESCE(p_fy, current_financial_year());

  INSERT INTO invoice_counters (fy) VALUES (v_fy)
  ON CONFLICT (fy) DO NOTHING;

  UPDATE invoice_counters
  SET last_number = last_number + 1,
      updated_at  = now()
  WHERE fy = v_fy
  RETURNING last_number INTO v_next;

  RETURN 'AKSH/' || v_fy || '/' || lpad(v_next::text, 5, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION generate_invoice_number(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION current_financial_year(TIMESTAMPTZ) TO authenticated, service_role;

-- Seed the counters from invoices that already exist, so numbering continues
-- rather than restarting at 1 and colliding with documents already issued.
-- Each invoice's FY is parsed from its OWN number — bucketing them all under the
-- current FY would resume the wrong series after an FY rollover.
INSERT INTO invoice_counters (fy, last_number)
SELECT (regexp_match(invoice_number, '^AKSH/([0-9]{4}-[0-9]{2})/'))[1] AS fy,
       max(regexp_replace(invoice_number, '^.*/', '')::INT)
FROM invoices
WHERE invoice_number ~ '^AKSH/[0-9]{4}-[0-9]{2}/[0-9]+$'
GROUP BY 1
ON CONFLICT (fy) DO NOTHING;

DROP SEQUENCE IF EXISTS invoice_number_seq;

-- ===========================================================================
-- D4 — Restore the full settings write path
-- ===========================================================================
-- 0009 replaced update_settings with a GST-only 5-arg form and dropped the JSONB
-- patch version, leaving notification_*, sheets_*, google_*, and extras with no
-- write path at all — the Settings UI could not persist them.
--
-- Canonical function is the JSONB patch. The 5-arg signature is kept as a thin
-- wrapper so any existing caller keeps working, rather than silently 404-ing.
CREATE OR REPLACE FUNCTION update_settings(
  p_expected_version INT,
  p_patch            JSONB
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

  -- COALESCE against the existing column makes this a true PATCH: keys absent
  -- from p_patch are left alone, so a partial update cannot blank other fields.
  -- version/updated_at/updated_by are maintained by trg_settings_before_update.
  UPDATE settings SET
    gst_enabled                  = COALESCE((p_patch->>'gst_enabled')::BOOLEAN,           gst_enabled),
    gst_rate                     = COALESCE((p_patch->>'gst_rate')::NUMERIC,              gst_rate),
    gst_number                   = COALESCE( p_patch->>'gst_number',                      gst_number),
    legal_business_name          = COALESCE( p_patch->>'legal_business_name',             legal_business_name),
    notifications_enabled        = COALESCE((p_patch->>'notifications_enabled')::BOOLEAN, notifications_enabled),
    notification_whatsapp_number = COALESCE( p_patch->>'notification_whatsapp_number',    notification_whatsapp_number),
    notification_sms_number      = COALESCE( p_patch->>'notification_sms_number',         notification_sms_number),
    sheets_sync_enabled          = COALESCE((p_patch->>'sheets_sync_enabled')::BOOLEAN,   sheets_sync_enabled),
    google_sheets_id             = COALESCE( p_patch->>'google_sheets_id',                google_sheets_id),
    google_service_account_email = COALESCE( p_patch->>'google_service_account_email',    google_service_account_email),
    extras                       = COALESCE( p_patch->'extras',                           extras)
  WHERE id = true AND version = p_expected_version
  RETURNING version INTO v_new_version;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CONFLICT: Settings modified by another administrator (version mismatch)'
      USING ERRCODE = '40001';
  END IF;

  RETURN QUERY SELECT v_new_version;
END;
$$;

-- Backward-compatible wrapper for the 0009 signature.
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
BEGIN
  RETURN QUERY SELECT * FROM update_settings(
    p_expected_version,
    jsonb_build_object(
      'gst_enabled',         p_gst_enabled,
      'gst_rate',            p_gst_rate,
      'gst_number',          p_gst_number,
      'legal_business_name', p_legal_business_name
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION update_settings(INT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION update_settings(BOOLEAN, NUMERIC, TEXT, TEXT, INT) TO authenticated;

-- ===========================================================================
-- D2 — Make rate limiting real, and actually call it
-- ===========================================================================
-- The old implementation counted activity_logs rows with entity_type='lead' and
-- metadata->>'phone' — a shape nothing in the codebase writes — so the count was
-- always 0. It was also never invoked from any code path.
--
-- Now it counts the `leads` table directly (which is where intent actually lands,
-- and is indexed on phone), and it is called from both enquiry RPCs.
--
-- restaurant_order is deliberately EXCLUDED: those are paid transactions gated by
-- a real UPI payment, and a regular customer ordering repeatedly is legitimate,
-- not abuse. The throttle targets unauthenticated free-form submissions.
CREATE OR REPLACE FUNCTION check_lead_rate_limit(
  p_phone          TEXT,
  p_max_requests   INT DEFAULT 5,
  p_window_seconds INT DEFAULT 3600
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recent_count INT;
BEGIN
  SELECT count(*) INTO v_recent_count
  FROM leads
  WHERE phone = p_phone
    AND source <> 'restaurant_order'
    AND created_at > (now() - make_interval(secs => p_window_seconds));

  IF v_recent_count >= p_max_requests THEN
    INSERT INTO activity_logs (action, entity_type, entity_id, severity, metadata)
    VALUES ('lead.rate_limited', 'lead', NULL, 'warning',
            jsonb_build_object('phone', p_phone,
                               'count', v_recent_count,
                               'window_seconds', p_window_seconds));

    RAISE EXCEPTION 'RATE_LIMIT_EXCEEDED: Too many enquiries from this number. Please try again later.'
      USING ERRCODE = '42900';
  END IF;
END;
$$;

-- Supports the windowed count above.
CREATE INDEX IF NOT EXISTS idx_leads_phone_created ON leads(phone, created_at DESC);

-- Wire the limiter into both public enquiry paths.
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

  PERFORM check_lead_rate_limit(p_phone);

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

  PERFORM check_lead_rate_limit(p_phone);

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
-- check_lead_rate_limit is called from inside the definer functions above; no
-- direct grant to anon is needed or wanted.
REVOKE EXECUTE ON FUNCTION check_lead_rate_limit(TEXT, INT, INT) FROM anon, PUBLIC;
GRANT  EXECUTE ON FUNCTION check_lead_rate_limit(TEXT, INT, INT) TO authenticated, service_role;
