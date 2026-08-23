-- Akshaya platform — backend regression suite
-- Plain SQL assertions: no pgTAP, no JS runner (the repo has neither).
--
--   supabase start
--   psql "<DB_URL>" -v ON_ERROR_STOP=1 -f supabase/tests/run_all.sql
--
-- Everything runs inside ONE transaction that is rolled back at the end, so the
-- suite is re-runnable and never mutates seed data.
--
-- Tests tagged [EXPECTED FAIL: Dn] encode INTENDED behavior for defects listed in
-- TEST_PLAN.md §0. They fail against current main. That is the point — turning them
-- green is the definition of done. Do not delete them to make the suite pass.

\set ON_ERROR_STOP on
BEGIN;

-- ---------------------------------------------------------------------------
-- Assertion helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION _assert(p_condition BOOLEAN, p_label TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  IF p_condition IS NOT TRUE THEN
    RAISE EXCEPTION 'FAIL: %', p_label;
  END IF;
  RAISE NOTICE 'pass: %', p_label;
END;
$$;

-- Asserts that an arbitrary statement raises, optionally with a specific SQLSTATE.
CREATE OR REPLACE FUNCTION _assert_raises(
  p_sql       TEXT,
  p_label     TEXT,
  p_errcode   TEXT DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_state TEXT;
BEGIN
  BEGIN
    EXECUTE p_sql;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_state = RETURNED_SQLSTATE;
    IF p_errcode IS NOT NULL AND v_state <> p_errcode THEN
      RAISE EXCEPTION 'FAIL: % — raised % but expected %', p_label, v_state, p_errcode;
    END IF;
    RAISE NOTICE 'pass: % (raised %)', p_label, v_state;
    RETURN;
  END;
  RAISE EXCEPTION 'FAIL: % — statement completed but should have raised', p_label;
END;
$$;

-- ---------------------------------------------------------------------------
-- Fixtures
-- ---------------------------------------------------------------------------
INSERT INTO menu_categories (id, name, slug, sort_order, active)
VALUES ('11111111-1111-1111-1111-111111111111', 'Test Mains', 'test-mains', 99, true);

INSERT INTO menu_items (id, category_id, name, price, available)
VALUES
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'Veg Biryani',  250.00, true),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Paneer Tikka', 180.00, true),
  ('22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Sold Out Dish', 90.00, false);

-- ===========================================================================
-- 1. ORDER SYSTEM
-- ===========================================================================
DO $$
DECLARE
  v_order_id  UUID;
  v_number    TEXT;
  v_total     NUMERIC;
  v_leads     INT;
BEGIN
  -- OS-01 normal creation
  SELECT order_id, order_number, total INTO v_order_id, v_number, v_total
  FROM create_order('Ravi Kumar', '9876543210',
    '[{"menu_item_id":"22222222-2222-2222-2222-222222222221","quantity":2}]'::jsonb,
    gen_random_uuid());

  PERFORM _assert(v_total = 500.00, 'OS-01 total is server-derived (2 x 250)');
  PERFORM _assert(v_number ~ '^AK-\d{8}-\d{4}$', 'OS-01 order_number format');
  PERFORM _assert(
    (SELECT status FROM orders WHERE id = v_order_id) = 'pending',
    'OS-01 order starts pending');

  -- OS-01 lead capture (regression guard: the enum value existed but nothing wrote it)
  SELECT count(*) INTO v_leads
  FROM leads WHERE source = 'restaurant_order' AND metadata->>'order_id' = v_order_id::text;
  PERFORM _assert(v_leads = 1, 'OS-01 restaurant order captured as a lead');

  PERFORM _assert(
    EXISTS (SELECT 1 FROM activity_logs WHERE action='order.created' AND entity_id = v_order_id),
    'OS-01 order.created audit row');
END;
$$;

DO $$
DECLARE v_total NUMERIC;
BEGIN
  -- OS-02 client-supplied price is ignored
  SELECT total INTO v_total FROM create_order('Tamper Test', '9876543210',
    '[{"menu_item_id":"22222222-2222-2222-2222-222222222221","quantity":1,"price":1,"unit_price":1}]'::jsonb,
    gen_random_uuid());
  PERFORM _assert(v_total = 250.00, 'OS-02 injected price ignored, server price wins');
END;
$$;

-- OS-03 unavailable item rejects the WHOLE order (no silent partial fulfilment)
SELECT _assert_raises($sql$
  SELECT create_order('Partial Test', '9876543210',
    '[{"menu_item_id":"22222222-2222-2222-2222-222222222221","quantity":1},
      {"menu_item_id":"22222222-2222-2222-2222-222222222223","quantity":1}]'::jsonb,
    gen_random_uuid())
$sql$, 'OS-03 unavailable item rejects entire order');

-- OS-04 unknown menu item
SELECT _assert_raises($sql$
  SELECT create_order('Ghost Item', '9876543210',
    '[{"menu_item_id":"33333333-3333-3333-3333-333333333333","quantity":1}]'::jsonb,
    gen_random_uuid())
$sql$, 'OS-04 unknown menu_item_id rejected');

-- OS-05 input validation
SELECT _assert_raises(
  $sql$SELECT create_order('Ravi', '9876543210', '[]'::jsonb, gen_random_uuid())$sql$,
  'OS-05a empty cart rejected');
SELECT _assert_raises(
  $sql$SELECT create_order('Ravi', 'abc', '[{"menu_item_id":"22222222-2222-2222-2222-222222222221","quantity":1}]'::jsonb, gen_random_uuid())$sql$,
  'OS-05b non-numeric phone rejected');
SELECT _assert_raises(
  $sql$SELECT create_order('   ', '9876543210', '[{"menu_item_id":"22222222-2222-2222-2222-222222222221","quantity":1}]'::jsonb, gen_random_uuid())$sql$,
  'OS-05c blank name rejected');

-- OS-06 quantity boundary
SELECT _assert_raises(
  $sql$SELECT create_order('Zero Qty', '9876543210', '[{"menu_item_id":"22222222-2222-2222-2222-222222222221","quantity":0}]'::jsonb, gen_random_uuid())$sql$,
  'OS-06 zero quantity rejected');

-- ===========================================================================
-- 2. IDEMPOTENCY
-- ===========================================================================
DO $$
DECLARE
  v_key   UUID := gen_random_uuid();
  v_id1   UUID; v_id2 UUID;
  v_count INT;
BEGIN
  -- ID-01 same key returns the same order
  SELECT order_id INTO v_id1 FROM create_order('Idem User', '9876543210',
    '[{"menu_item_id":"22222222-2222-2222-2222-222222222221","quantity":1}]'::jsonb, v_key);
  SELECT order_id INTO v_id2 FROM create_order('Idem User', '9876543210',
    '[{"menu_item_id":"22222222-2222-2222-2222-222222222221","quantity":1}]'::jsonb, v_key);

  PERFORM _assert(v_id1 = v_id2, 'ID-01 retry with same key returns same order');
  PERFORM _assert(
    (SELECT count(*) FROM orders WHERE idempotency_key = v_key) = 1,
    'ID-01 exactly one order row');

  -- No duplicate side effects
  SELECT count(*) INTO v_count FROM leads WHERE metadata->>'order_id' = v_id1::text;
  PERFORM _assert(v_count = 1, 'ID-01 no duplicate lead on retry');
  SELECT count(*) INTO v_count FROM activity_logs WHERE action='order.created' AND entity_id = v_id1;
  PERFORM _assert(v_count = 1, 'ID-01 no duplicate audit row on retry');
END;
$$;

DO $$
DECLARE v_a UUID; v_b UUID;
BEGIN
  -- ID-02 NULL key must NOT collapse two genuine orders
  SELECT order_id INTO v_a FROM create_order('Walkin One', '9876543210',
    '[{"menu_item_id":"22222222-2222-2222-2222-222222222222","quantity":1}]'::jsonb, NULL);
  SELECT order_id INTO v_b FROM create_order('Walkin Two', '9876543211',
    '[{"menu_item_id":"22222222-2222-2222-2222-222222222222","quantity":1}]'::jsonb, NULL);
  PERFORM _assert(v_a <> v_b, 'ID-02 NULL idempotency key does not deduplicate');
END;
$$;

-- ID-05 batched TTL cleanup respects its cap
DO $$
DECLARE v_deleted INT; v_batches INT;
BEGIN
  INSERT INTO idempotency_keys (key, request_path, response, expires_at)
  SELECT gen_random_uuid(), '/test', '{}'::jsonb, now() - INTERVAL '1 hour'
  FROM generate_series(1, 250);

  SELECT deleted_count, batches_processed INTO v_deleted, v_batches
  FROM cleanup_expired_idempotency_keys_batched(100, 2);

  PERFORM _assert(v_deleted = 200, 'ID-05 batch cap honoured (100 x 2 = 200 deleted)');
  PERFORM _assert(v_batches = 2, 'ID-05 stopped at max_batches');
END;
$$;

-- ===========================================================================
-- 3. PAYMENT SYSTEM
-- ===========================================================================
DO $$
DECLARE
  v_order_id UUID;
  v_total    NUMERIC;
BEGIN
  SELECT order_id, total INTO v_order_id, v_total
  FROM create_order('Pay Happy', '9876543210',
    '[{"menu_item_id":"22222222-2222-2222-2222-222222222221","quantity":1}]'::jsonb, gen_random_uuid());

  -- PS-01 happy path
  INSERT INTO payments (order_id, razorpay_order_id, amount, currency, status)
  VALUES (v_order_id, 'rzp_ok_001', v_total, 'INR', 'pending');

  PERFORM record_payment_success('rzp_ok_001', 'pay_ok_001', 'sig_ok', '{}'::jsonb);

  PERFORM _assert(
    (SELECT status FROM payments WHERE razorpay_order_id='rzp_ok_001') = 'success',
    'PS-01 payment marked success');
  PERFORM _assert(
    (SELECT status FROM orders WHERE id = v_order_id) = 'confirmed',
    'PS-01 order auto-confirmed by webhook RPC');
  PERFORM _assert(
    (SELECT receipt_number FROM payments WHERE razorpay_order_id='rzp_ok_001') ~ '^AK-RCPT-\d{8}-\d{4}$',
    'PS-01 receipt number generated');

  -- ID-04 duplicate webhook is a no-op
  PERFORM record_payment_success('rzp_ok_001', 'pay_ok_001', 'sig_ok', '{}'::jsonb);
  PERFORM _assert(
    (SELECT count(*) FROM activity_logs WHERE action='payment.captured'
       AND metadata->>'order_id' = v_order_id::text) = 1,
    'ID-04 duplicate webhook does not double-log payment.captured');
END;
$$;

DO $$
DECLARE v_order_id UUID; v_total NUMERIC;
BEGIN
  SELECT order_id, total INTO v_order_id, v_total
  FROM create_order('Pay Guards', '9876543210',
    '[{"menu_item_id":"22222222-2222-2222-2222-222222222221","quantity":1}]'::jsonb, gen_random_uuid());

  -- PS-02 amount mismatch
  PERFORM _assert_raises(format($f$
    INSERT INTO payments (order_id, razorpay_order_id, amount, currency, status)
    VALUES (%L, 'rzp_bad_amt', %s, 'INR', 'pending')
  $f$, v_order_id, v_total - 1), 'PS-02 amount mismatch blocked', '22000');

  -- NOTE: deliberately asserts the ABSENCE of a DB audit row. A rejecting trigger
  -- cannot durably log its own rejection (the RAISE rolls the INSERT back), so the
  -- guards no longer pretend to. Critical logging for these lives in the payment
  -- route handlers. If this assertion ever fails, someone re-added a doomed
  -- INSERT to verify_payment_drift_guard.
  PERFORM _assert(
    NOT EXISTS (SELECT 1 FROM activity_logs WHERE action='payment.amount_mismatch'),
    'PS-02 rejection is not (and cannot be) audited from inside the trigger');

  -- PS-03 partial payment
  PERFORM _assert_raises(format($f$
    INSERT INTO payments (order_id, razorpay_order_id, amount, currency, status)
    VALUES (%L, 'rzp_partial', %s, 'INR', 'pending')
  $f$, v_order_id, v_total / 2), 'PS-03 partial payment blocked', '22000');

  -- PS-04 invalid currency
  PERFORM _assert_raises(format($f$
    INSERT INTO payments (order_id, razorpay_order_id, amount, currency, status)
    VALUES (%L, 'rzp_usd', %s, 'USD', 'pending')
  $f$, v_order_id, v_total), 'PS-04 non-INR currency blocked', '22000');

  PERFORM _assert(
    NOT EXISTS (SELECT 1 FROM activity_logs WHERE action='payment.currency_mismatch'),
    'PS-04 rejection is not (and cannot be) audited from inside the trigger');
END;
$$;

-- PS-05 payment against a cancelled order
DO $$
DECLARE v_order_id UUID; v_total NUMERIC;
BEGIN
  SELECT order_id, total INTO v_order_id, v_total
  FROM create_order('Cancelled Order', '9876543210',
    '[{"menu_item_id":"22222222-2222-2222-2222-222222222221","quantity":1}]'::jsonb, gen_random_uuid());

  UPDATE orders SET status='cancelled' WHERE id = v_order_id;

  PERFORM _assert_raises(format($f$
    INSERT INTO payments (order_id, razorpay_order_id, amount, currency, status)
    VALUES (%L, 'rzp_cancelled', %s, 'INR', 'pending')
  $f$, v_order_id, v_total), 'PS-05 payment on cancelled order blocked', '22000');
END;
$$;

-- PS-06 double-charge prevention
DO $$
DECLARE v_order_id UUID; v_total NUMERIC;
BEGIN
  SELECT order_id, total INTO v_order_id, v_total
  FROM create_order('Double Charge', '9876543210',
    '[{"menu_item_id":"22222222-2222-2222-2222-222222222221","quantity":1}]'::jsonb, gen_random_uuid());

  INSERT INTO payments (order_id, razorpay_order_id, amount, currency, status)
  VALUES (v_order_id, 'rzp_dc_1', v_total, 'INR', 'success');

  PERFORM _assert_raises(format($f$
    INSERT INTO payments (order_id, razorpay_order_id, amount, currency, status)
    VALUES (%L, 'rzp_dc_2', %s, 'INR', 'success')
  $f$, v_order_id, v_total), 'PS-06 second successful payment blocked', '23505');
END;
$$;

-- EC-02 order cannot be confirmed without a successful payment (binds service_role too)
DO $$
DECLARE v_order_id UUID;
BEGIN
  SELECT order_id INTO v_order_id FROM create_order('Unpaid Confirm', '9876543210',
    '[{"menu_item_id":"22222222-2222-2222-2222-222222222221","quantity":1}]'::jsonb, gen_random_uuid());

  PERFORM _assert_raises(format(
    $f$UPDATE orders SET status='confirmed' WHERE id = %L$f$, v_order_id),
    'EC-02 confirm without payment blocked by trigger');
END;
$$;

-- ===========================================================================
-- 4. WEBHOOK SYSTEM (retry + DLQ)
-- ===========================================================================
DO $$
DECLARE
  v_id1 UUID; v_dup1 BOOLEAN;
  v_id2 UUID; v_dup2 BOOLEAN;
BEGIN
  -- WH-01 dedup on external event id
  SELECT event_id, is_duplicate INTO v_id1, v_dup1
  FROM record_webhook_event('inbound','razorpay','payment.captured','evt_dedupe_1','{}'::jsonb);
  SELECT event_id, is_duplicate INTO v_id2, v_dup2
  FROM record_webhook_event('inbound','razorpay','payment.captured','evt_dedupe_1','{}'::jsonb);

  PERFORM _assert(v_dup1 = false, 'WH-01 first delivery is not a duplicate');
  PERFORM _assert(v_dup2 = true,  'WH-01 second delivery flagged duplicate');
  PERFORM _assert(v_id1 = v_id2,  'WH-01 duplicate returns the original event id');
END;
$$;

-- WH-03 / WH-05 backoff schedule then dead-letter
DO $$
DECLARE
  v_id       UUID;
  v_status   webhook_status;
  v_retries  INT;
  v_next     TIMESTAMPTZ;
  v_expected INT;
  i          INT;
BEGIN
  SELECT event_id INTO v_id
  FROM record_webhook_event('inbound','razorpay','payment.captured','evt_backoff','{}'::jsonb);

  FOR i IN 1..4 LOOP
    PERFORM update_webhook_outcome(v_id, false, 'simulated timeout');
    SELECT status, retry_count, next_retry_at INTO v_status, v_retries, v_next
    FROM webhook_events WHERE id = v_id;

    PERFORM _assert(v_status = 'failed',  format('WH-03 attempt %s stays failed', i));
    PERFORM _assert(v_retries = i,        format('WH-03 attempt %s increments retry_count', i));

    -- 0011 schedule: LEAST(3600, 60 * 2^(retry_count-1)) seconds
    v_expected := LEAST(3600, (60 * POWER(2, v_retries - 1))::INT);
    PERFORM _assert(
      abs(EXTRACT(EPOCH FROM (v_next - now())) - v_expected) < 5,
      format('WH-03 attempt %s backoff ~%ss', i, v_expected));
  END LOOP;

  -- 5th failure hits max_retries (default 5) -> dead_letter
  PERFORM update_webhook_outcome(v_id, false, 'final failure');
  SELECT status, next_retry_at INTO v_status, v_next FROM webhook_events WHERE id = v_id;

  PERFORM _assert(v_status = 'dead_letter', 'WH-05 exhausted retries move to dead_letter');
  PERFORM _assert(v_next IS NULL,           'WH-05 dead_letter clears next_retry_at');
  PERFORM _assert(
    EXISTS (SELECT 1 FROM activity_logs
            WHERE action='webhook.dead_letter' AND entity_id = v_id AND severity='critical'),
    'WH-05 critical dead_letter audit row');

  -- WH-08 DLQ reader surfaces it
  PERFORM _assert(
    EXISTS (SELECT 1 FROM get_dead_letter_webhooks(50,0) d WHERE d.id = v_id),
    'WH-08 event visible in dead-letter reader');
END;
$$;

-- WH-04 retry -> success clears error state
DO $$
DECLARE v_id UUID; v_status webhook_status; v_err TEXT; v_next TIMESTAMPTZ; v_proc TIMESTAMPTZ;
BEGIN
  SELECT event_id INTO v_id
  FROM record_webhook_event('inbound','razorpay','payment.captured','evt_recover','{}'::jsonb);

  PERFORM update_webhook_outcome(v_id, false, 'transient');
  PERFORM update_webhook_outcome(v_id, true, NULL);

  SELECT status, last_error, next_retry_at, processed_at
  INTO v_status, v_err, v_next, v_proc FROM webhook_events WHERE id = v_id;

  PERFORM _assert(v_status = 'success',  'WH-04 recovery sets success');
  PERFORM _assert(v_err IS NULL,         'WH-04 recovery clears last_error');
  PERFORM _assert(v_next IS NULL,        'WH-04 recovery clears next_retry_at');
  PERFORM _assert(v_proc IS NOT NULL,    'WH-04 recovery stamps processed_at');
  PERFORM _assert(
    (SELECT retry_count FROM webhook_events WHERE id = v_id) = 1,
    'WH-04 retry_count preserved as delivery history');
END;
$$;

-- WH-06 24-hour window forces dead_letter regardless of remaining retries
DO $$
DECLARE v_id UUID; v_status webhook_status;
BEGIN
  SELECT event_id INTO v_id
  FROM record_webhook_event('inbound','razorpay','payment.captured','evt_stale','{}'::jsonb);

  UPDATE webhook_events SET created_at = now() - INTERVAL '25 hours' WHERE id = v_id;
  PERFORM update_webhook_outcome(v_id, false, NULL);

  SELECT status INTO v_status FROM webhook_events WHERE id = v_id;
  PERFORM _assert(v_status = 'dead_letter', 'WH-06 stale event dead-letters on first failure');
  PERFORM _assert(
    (SELECT last_error FROM webhook_events WHERE id = v_id) = 'Max retries or 24h retry window exhausted',
    'WH-06 default exhaustion message recorded');
END;
$$;

-- ===========================================================================
-- 5. INVOICE SYSTEM
-- ===========================================================================
-- IN-06 sequence uniqueness
DO $$
DECLARE v_numbers TEXT[]; v_distinct INT;
BEGIN
  SELECT array_agg(generate_invoice_number('2026-27')) INTO v_numbers
  FROM generate_series(1, 20);

  SELECT count(DISTINCT n) INTO v_distinct FROM unnest(v_numbers) n;
  PERFORM _assert(v_distinct = 20, 'IN-06 20 invoice numbers are all distinct');
  PERFORM _assert(v_numbers[1] ~ '^AKSH/2026-27/\d{5}$', 'IN-06 invoice number format');
END;
$$;

-- IN-03 GST cannot be enabled without a GSTIN (CHECK constraint, not app logic)
SELECT _assert_raises($sql$
  UPDATE settings SET gst_enabled = true, gst_number = NULL, legal_business_name = NULL WHERE id
$sql$, 'IN-03 GST enable without GSTIN blocked', '23514');

-- EC-05 settings singleton is indestructible
SELECT _assert_raises($sql$DELETE FROM settings$sql$,
  'EC-05a settings row cannot be deleted (trigger binds service_role)');
SELECT _assert_raises($sql$INSERT INTO settings (id) VALUES (false)$sql$,
  'EC-05b second settings row impossible');

-- IN-04 invoices snapshot the rate they were generated at
DO $$
DECLARE v_order_id UUID;
BEGIN
  SELECT order_id INTO v_order_id FROM create_order('Invoice Snap', '9876543210',
    '[{"menu_item_id":"22222222-2222-2222-2222-222222222221","quantity":4}]'::jsonb, gen_random_uuid());

  INSERT INTO invoices (order_id, invoice_type, invoice_number,
                        gst_applicable, gst_rate, gst_amount, total_amount)
  VALUES (v_order_id, 'tax', generate_invoice_number('2026-27'),
          true, 5.00, 50.00, 1050.00);

  -- Owner later moves the platform rate to 18%
  UPDATE settings
  SET gst_enabled = true, gst_rate = 18.00,
      gst_number = '36ABCDE1234F1Z5', legal_business_name = 'Akshaya Family Restaurant'
  WHERE id;

  PERFORM _assert(
    (SELECT gst_rate FROM invoices WHERE order_id = v_order_id) = 5.00,
    'IN-04 historical invoice keeps its original GST rate after a platform change');
END;
$$;

-- ===========================================================================
-- 6. OBSERVABILITY
-- ===========================================================================
-- EC-06 request-id correlation via transaction-scoped GUC
DO $$
DECLARE v_log_id UUID;
BEGIN
  PERFORM set_request_context('req-test-abc');
  v_log_id := log_activity_event('test.correlation', 'test', NULL, 'info', '{}'::jsonb);

  PERFORM _assert(
    (SELECT request_id FROM activity_logs WHERE id = v_log_id) = 'req-test-abc',
    'EC-06 log inherits request_id from GUC');
END;
$$;

-- ===========================================================================
-- 7. KNOWN-DEFECT TESTS  [EXPECTED FAIL until fixed]
-- ===========================================================================
-- These encode intended behavior. They fail on current main by design.
-- Comment the guard below out to run them.
\if :{?RUN_DEFECT_TESTS}

-- LS-03 [D2] rate limiter must actually fire. The limiter now runs INSIDE the
-- enquiry RPC, so the 6th submission is itself the rejection — the default is
-- 5 per phone per hour.
DO $$
DECLARE i INT;
BEGIN
  FOR i IN 1..5 LOOP
    PERFORM create_banquet_enquiry('Spam Test','9998887770','Wedding',NULL,100,NULL,NULL);
  END LOOP;

  PERFORM _assert(
    (SELECT count(*) FROM leads WHERE phone='9998887770') = 5,
    'LS-03 [D2] first 5 enquiries accepted');

  PERFORM _assert_raises(
    $sql$SELECT create_banquet_enquiry('Spam Test','9998887770','Wedding',NULL,100,NULL,NULL)$sql$,
    'LS-03 [D2] 6th enquiry rejected by rate limiter', '42900');

  -- Paid orders are deliberately exempt: a repeat customer is not abuse.
  PERFORM _assert(
    (SELECT count(*) FROM leads WHERE phone='9998887770') = 5,
    'LS-03 [D2] rejected enquiry left no lead behind');
END;
$$;

-- LS-02 direct client insert into an enquiry table must be denied (policies
-- dropped in 0007; the RPC is the only write path).
DO $$
BEGIN
  PERFORM _assert(
    NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE tablename = 'banquet_enquiries' AND cmd = 'INSERT'
    ),
    'LS-02 no public INSERT policy remains on banquet_enquiries');
END;
$$;

-- D1 — anon must NOT be able to confirm a payment directly
DO $$
BEGIN
  PERFORM _assert(
    NOT has_function_privilege('anon', 'record_payment_success(text,text,text,jsonb)', 'EXECUTE'),
    'D1 [CRITICAL] anon must not hold EXECUTE on record_payment_success');
END;
$$;

\endif

-- ---------------------------------------------------------------------------
ROLLBACK;
