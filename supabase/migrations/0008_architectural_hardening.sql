-- Migration 0008: Architectural Hardening & Production Idempotency
-- Adds idempotency key support, payment webhook RPC, and public settings sanitizer.

-- ---------------------------------------------------------------------------
-- 1. SCHEMA UPDATE: Add idempotency_key to orders
-- ---------------------------------------------------------------------------
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS idempotency_key UUID;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_idempotency_key 
ON orders(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. RPC: create_order (with client idempotency & lead deduplication)
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS create_order(TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS create_order(TEXT, TEXT, JSONB, UUID);

CREATE OR REPLACE FUNCTION create_order(
  p_customer_name   TEXT,
  p_customer_phone  TEXT,
  p_items           JSONB,
  p_idempotency_key UUID DEFAULT NULL
)
RETURNS TABLE (order_id UUID, order_number TEXT, total NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id     UUID;
  v_order_number TEXT;
  v_subtotal     NUMERIC(10,2) := 0;
  v_requested    INT;
  v_inserted     INT;
  v_attempt      INT := 0;
BEGIN
  -- Idempotency check: Return existing order if retried with same idempotency key
  IF p_idempotency_key IS NOT NULL THEN
    SELECT o.id, o.order_number, o.total 
    INTO v_order_id, v_order_number, v_subtotal
    FROM orders o
    WHERE o.idempotency_key = p_idempotency_key;

    IF FOUND THEN
      RETURN QUERY SELECT v_order_id, v_order_number, v_subtotal;
      RETURN;
    END IF;
  END IF;

  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  IF p_customer_name IS NULL OR btrim(p_customer_name) = '' THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;
  IF p_customer_phone IS NULL
     OR regexp_replace(p_customer_phone, '\D', '', 'g') !~ '^[0-9]{10,13}$' THEN
    RAISE EXCEPTION 'A valid customer phone number is required';
  END IF;

  -- Generate order number and insert with idempotency_key
  LOOP
    v_attempt := v_attempt + 1;
    v_order_number := 'AK-' || to_char(now(), 'YYYYMMDD') || '-' ||
                       lpad(floor(random() * 10000)::text, 4, '0');
    BEGIN
      INSERT INTO orders (order_number, customer_name, customer_phone, subtotal, total, idempotency_key)
      VALUES (v_order_number, btrim(p_customer_name), p_customer_phone, 0, 0, p_idempotency_key)
      RETURNING id INTO v_order_id;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      IF p_idempotency_key IS NOT NULL THEN
        SELECT o.id, o.order_number, o.total 
        INTO v_order_id, v_order_number, v_subtotal
        FROM orders o WHERE o.idempotency_key = p_idempotency_key;

        IF FOUND THEN
          RETURN QUERY SELECT v_order_id, v_order_number, v_subtotal;
          RETURN;
        END IF;
      END IF;

      IF v_attempt >= 10 THEN
        RAISE EXCEPTION 'Could not allocate a unique order number after % attempts', v_attempt;
      END IF;
    END;
  END LOOP;

  -- Insert order items
  INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price, quantity)
  SELECT v_order_id, m.id, m.name, m.price, (elem->>'quantity')::SMALLINT
  FROM jsonb_array_elements(p_items) elem
  JOIN menu_items m
    ON m.id = (elem->>'menu_item_id')::UUID
   AND m.available;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  SELECT count(*) INTO v_requested FROM jsonb_array_elements(p_items);

  IF v_inserted <> v_requested THEN
    RAISE EXCEPTION 'One or more items are unavailable or invalid (% of % accepted)',
      v_inserted, v_requested;
  END IF;

  -- Derive subtotal & total.
  -- order_items.order_id MUST be table-qualified: this function's RETURNS TABLE
  -- declares an OUT variable also named order_id, and an unqualified reference
  -- raises "column reference order_id is ambiguous" at runtime — which made every
  -- single create_order call fail. plpgsql bodies are not name-checked at CREATE
  -- time, so the migration applied cleanly and the break only showed up on use.
  SELECT coalesce(sum(oi.line_total), 0) INTO v_subtotal
  FROM order_items oi WHERE oi.order_id = v_order_id;

  IF v_subtotal = 0 THEN
    RAISE EXCEPTION 'No valid items in cart';
  END IF;

  UPDATE orders SET subtotal = v_subtotal, total = v_subtotal, updated_at = now()
  WHERE id = v_order_id;

  -- Capture the order as a lead, append-only.
  --
  -- This was an ON CONFLICT (phone) DO UPDATE upsert touching last_active_at and
  -- interaction_count. Three separate runtime failures: there is no unique index
  -- on leads.phone (so ON CONFLICT had nothing to infer), and neither column
  -- exists on the table. It also contradicted the rest of the system — the
  -- enquiry RPCs insert append-only, check_lead_rate_limit counts lead rows per
  -- phone inside a time window (an upsert would cap that at 1 and the limiter
  -- could never fire), and the PRD's goal is capturing every distinct intent.
  --
  -- If per-customer aggregation is wanted later, it belongs in a `customers`
  -- table keyed by phone, or a dashboard view over leads — not by collapsing the
  -- intent ledger itself.
  INSERT INTO leads (name, phone, source, metadata)
  VALUES (
    btrim(p_customer_name),
    p_customer_phone,
    'restaurant_order',
    jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number, 'total', v_subtotal)
  );

  INSERT INTO activity_logs (action, entity_type, entity_id, metadata)
  VALUES ('order.created', 'order', v_order_id, jsonb_build_object('total', v_subtotal, 'customer_name', btrim(p_customer_name)));

  RETURN QUERY SELECT v_order_id, v_order_number, v_subtotal;
END;
$$;

GRANT EXECUTE ON FUNCTION create_order TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. RPC: record_payment_success (Idempotent Webhook Processing)
-- ---------------------------------------------------------------------------
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
BEGIN
  -- Acquire FOR UPDATE lock on the payment record
  SELECT id, order_id, status, receipt_number 
  INTO v_payment_id, v_order_id, v_payment_status, v_receipt_number
  FROM payments
  WHERE razorpay_order_id = p_razorpay_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment record not found for Razorpay order ID %', p_razorpay_order_id;
  END IF;

  -- Idempotency check: If already marked success, return existing receipt details without re-processing
  IF v_payment_status = 'success' THEN
    RETURN QUERY SELECT v_payment_id, v_order_id, v_receipt_number;
    RETURN;
  END IF;

  -- Generate receipt number: AK-RCPT-YYYYMMDD-####
  v_receipt_number := 'AK-RCPT-' || to_char(now(), 'YYYYMMDD') || '-' ||
                      lpad(floor(random() * 10000)::text, 4, '0');

  -- Update payments record
  UPDATE payments
  SET razorpay_payment_id = p_razorpay_payment_id,
      razorpay_signature  = p_razorpay_signature,
      status              = 'success',
      gateway_response    = p_gateway_response,
      receipt_number      = v_receipt_number,
      updated_at          = now()
  WHERE id = v_payment_id;

  -- Monotonic state update on order
  UPDATE orders
  SET status = 'confirmed', updated_at = now()
  WHERE id = v_order_id AND status = 'pending';

  -- Audit Log
  INSERT INTO activity_logs (action, entity_type, entity_id, metadata)
  VALUES (
    'payment.captured',
    'payment',
    v_payment_id,
    jsonb_build_object('order_id', v_order_id, 'razorpay_payment_id', p_razorpay_payment_id, 'receipt_number', v_receipt_number)
  );

  RETURN QUERY SELECT v_payment_id, v_order_id, v_receipt_number;
END;
$$;

GRANT EXECUTE ON FUNCTION record_payment_success TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. RPC: get_public_settings (Sanitized Public Settings Reader)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_public_settings()
RETURNS TABLE (gst_enabled BOOLEAN, gst_rate NUMERIC)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.gst_enabled, s.gst_rate
  FROM settings s
  WHERE s.id = true;
$$;

GRANT EXECUTE ON FUNCTION get_public_settings TO anon, authenticated;
