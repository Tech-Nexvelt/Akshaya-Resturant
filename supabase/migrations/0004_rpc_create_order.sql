-- Migration 0004: RPC function create_order
-- Security definer function for guest order placement. Server-side price recalculation directly from menu_items table.

CREATE OR REPLACE FUNCTION create_order(
  p_customer_name  TEXT,
  p_customer_phone TEXT,
  p_items          JSONB   -- [{ "menu_item_id": "...", "quantity": 2 }, ...]
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
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  -- Server-side input validation. The client validates too, but the client is not a
  -- trust boundary — without this, a direct RPC call can persist an order and a lead
  -- with an empty or junk phone number, which silently breaks the entire
  -- lead-follow-up and WhatsApp-notification value chain.
  IF p_customer_name IS NULL OR btrim(p_customer_name) = '' THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;
  IF p_customer_phone IS NULL
     OR regexp_replace(p_customer_phone, '\D', '', 'g') !~ '^[0-9]{10,13}$' THEN
    RAISE EXCEPTION 'A valid customer phone number is required';
  END IF;

  -- Order number: AK-YYYYMMDD-#### with retry-on-conflict. The 4-digit random suffix
  -- collides far sooner than it looks (~50% chance within ~118 orders in a single day
  -- by the birthday bound); without this loop a collision surfaces to the guest as a
  -- raw unique-violation at checkout.
  LOOP
    v_attempt := v_attempt + 1;
    v_order_number := 'AK-' || to_char(now(), 'YYYYMMDD') || '-' ||
                       lpad(floor(random() * 10000)::text, 4, '0');
    BEGIN
      INSERT INTO orders (order_number, customer_name, customer_phone, subtotal, total)
      VALUES (v_order_number, btrim(p_customer_name), p_customer_phone, 0, 0)
      RETURNING id INTO v_order_id;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      IF v_attempt >= 10 THEN
        RAISE EXCEPTION 'Could not allocate a unique order number after % attempts', v_attempt;
      END IF;
    END;
  END LOOP;

  -- Set-based insert so unavailable/invalid items can be COUNTED, not silently dropped.
  -- The previous per-item loop inserted nothing when an item was unavailable and
  -- carried on, so a guest could be charged a smaller total for an order missing items
  -- they believed they had ordered — with no error shown anywhere.
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

  -- Re-derive subtotal from inserted items
  SELECT coalesce(sum(line_total), 0) INTO v_subtotal
  FROM order_items WHERE order_id = v_order_id;

  IF v_subtotal = 0 THEN
    RAISE EXCEPTION 'No valid items in cart';
  END IF;

  UPDATE orders SET subtotal = v_subtotal, total = v_subtotal, updated_at = now()
  WHERE id = v_order_id;

  -- Capture the order as a lead in the SAME transaction. The lead_source enum has
  -- carried 'restaurant_order' since 0001, but nothing ever wrote it — so every
  -- restaurant order was missing from /admin/leads and from both exports, while the
  -- PRD's "capture 100% of inbound intent" goal assumed it was there.
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
