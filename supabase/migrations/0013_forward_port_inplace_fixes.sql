-- Migration 0013: Forward-port fixes that were made by editing already-applied migrations.
--
-- WHY THIS EXISTS
-- The D8 and D10 remediations were applied by editing 0008 and 0011 in place, which
-- is fine for a database built from scratch but useless for one that already ran the
-- old versions: `supabase db push` tracks migrations by filename and will never
-- re-run them. The live project (pfkzefzqpploxfxrrplo) is on 0001–0011 and is
-- demonstrably still running the BROKEN definitions — an anonymous probe of
-- record_payment_success returned 42702 "column reference order_id is ambiguous".
--
-- Everything here is CREATE OR REPLACE and safe to run repeatedly. It is also safe
-- on a from-scratch database, where it simply re-asserts what 0008/0011 already set.

-- ===========================================================================
-- D8 — create_order was broken three ways and could never execute
-- ===========================================================================
--   (a) unqualified order_id is ambiguous against the RETURNS TABLE OUT variable
--   (b) ON CONFLICT (phone) — no unique index on leads.phone exists
--   (c) that upsert set last_active_at / interaction_count — neither column exists
-- plpgsql bodies are not name-checked at CREATE time, which is why the migration
-- applied cleanly and only failed when actually called.
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
  -- Idempotency: return the existing order if retried with the same key.
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

  -- Order number with retry: the 4-digit random suffix collides sooner than it
  -- looks (~50% within ~118 orders in a day), and an unhandled collision would
  -- surface to the guest as a raw unique-violation at checkout.
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
      -- A concurrent call may have claimed the same idempotency key.
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

  -- Set-based insert so unavailable/invalid items are COUNTED, not silently dropped.
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

  -- D8(a): order_items.order_id MUST be alias-qualified — bare order_id is
  -- ambiguous against this function's RETURNS TABLE OUT variable of the same name.
  SELECT coalesce(sum(oi.line_total), 0) INTO v_subtotal
  FROM order_items oi WHERE oi.order_id = v_order_id;

  IF v_subtotal = 0 THEN
    RAISE EXCEPTION 'No valid items in cart';
  END IF;

  UPDATE orders SET subtotal = v_subtotal, total = v_subtotal, updated_at = now()
  WHERE id = v_order_id;

  -- D8(b)(c): append-only, no upsert. leads.phone has no unique index, and
  -- last_active_at / interaction_count do not exist. Append also keeps this
  -- consistent with the enquiry RPCs and with check_lead_rate_limit, which counts
  -- lead rows per phone in a window — an upsert would cap that at 1 and the
  -- limiter could never fire.
  INSERT INTO leads (name, phone, source, metadata)
  VALUES (
    btrim(p_customer_name),
    p_customer_phone,
    'restaurant_order',
    jsonb_build_object('order_id', v_order_id, 'order_number', v_order_number, 'total', v_subtotal)
  );

  INSERT INTO activity_logs (action, entity_type, entity_id, metadata)
  VALUES ('order.created', 'order', v_order_id,
          jsonb_build_object('total', v_subtotal, 'customer_name', btrim(p_customer_name)));

  RETURN QUERY SELECT v_order_id, v_order_number, v_subtotal;
END;
$$;

-- Guest checkout is the product: anon keeps EXECUTE here, deliberately.
GRANT EXECUTE ON FUNCTION create_order(TEXT, TEXT, JSONB, UUID) TO anon, authenticated;

-- ===========================================================================
-- D10 — a rejecting trigger cannot durably log its own rejection
-- ===========================================================================
-- The previous body did INSERT INTO activity_logs then RAISE EXCEPTION. The
-- exception rolls back its own INSERT, so no 'payment.amount_mismatch' or
-- 'payment.currency_mismatch' row was ever persisted. It read like a working audit
-- trail while recording nothing — worse than no logging, because the alerting
-- design assumed it was there. Postgres has no autonomous transactions; the CALLER
-- logs instead (both payment routes already emit structured critical events).
CREATE OR REPLACE FUNCTION verify_payment_drift_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_total  NUMERIC(10,2);
  v_order_status order_status;
BEGIN
  IF NEW.currency <> 'INR' THEN
    RAISE EXCEPTION 'CURRENCY_MISMATCH: Only INR payments are supported (received %)', NEW.currency
      USING ERRCODE = '22000';
  END IF;

  SELECT total, status INTO v_order_total, v_order_status
  FROM orders WHERE id = NEW.order_id FOR SHARE;

  IF v_order_total IS NULL THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND: Referenced order % does not exist', NEW.order_id
      USING ERRCODE = '23503';
  END IF;

  IF NEW.amount <> v_order_total THEN
    RAISE EXCEPTION 'AMOUNT_MISMATCH: Payment amount (%) does not match order total (%)',
      NEW.amount, v_order_total USING ERRCODE = '22000';
  END IF;

  IF v_order_status = 'cancelled' THEN
    RAISE EXCEPTION 'INVALID_ORDER_STATE: Cannot initiate payment for a cancelled order'
      USING ERRCODE = '22000';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_verify_payment_amount ON payments;
DROP TRIGGER IF EXISTS trg_verify_payment_drift_guard ON payments;
CREATE TRIGGER trg_verify_payment_drift_guard
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION verify_payment_drift_guard();

-- ===========================================================================
-- D2 (grant half) — the rate limiter must not be callable by anon
-- ===========================================================================
-- Verified live: an anonymous POST to /rest/v1/rpc/check_lead_rate_limit returned
-- 204. It is called from inside the SECURITY DEFINER enquiry RPCs and needs no
-- direct public grant.
REVOKE EXECUTE ON FUNCTION check_lead_rate_limit(TEXT, INT, INT) FROM anon, PUBLIC;
GRANT  EXECUTE ON FUNCTION check_lead_rate_limit(TEXT, INT, INT) TO authenticated, service_role;
