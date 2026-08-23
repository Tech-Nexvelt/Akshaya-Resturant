-- Migration 0002: Core Tables
-- Creates profiles, menu_categories, menu_items, orders, order_items, and payments tables.

-- Extends auth.users with role + contact info for staff/admin/owner accounts.
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'staff',
  full_name   TEXT NOT NULL,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Categories for restaurant menu
CREATE TABLE menu_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  sort_order  INT NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true
);

-- Items available in restaurant menu
CREATE TABLE menu_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID NOT NULL REFERENCES menu_categories(id) ON DELETE RESTRICT,
  name          TEXT NOT NULL,
  description   TEXT,
  price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url     TEXT,
  is_veg        BOOLEAN NOT NULL DEFAULT true,
  spice_level   SMALLINT NOT NULL DEFAULT 0 CHECK (spice_level BETWEEN 0 AND 3),
  available     BOOLEAN NOT NULL DEFAULT true,
  sort_order    INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_menu_items_category ON menu_items(category_id) WHERE available;

-- Customer Orders
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    TEXT NOT NULL UNIQUE,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT NOT NULL,
  status          order_status NOT NULL DEFAULT 'pending',
  subtotal        NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  total           NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_phone ON orders(customer_phone);

-- Order Items line table
CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id  UUID NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  item_name     TEXT NOT NULL,
  unit_price    NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  quantity      SMALLINT NOT NULL CHECK (quantity > 0),
  line_total    NUMERIC(10,2) GENERATED ALWAYS AS (unit_price * quantity) STORED
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Payment transactions table.
-- No cash/COD path exists by design: rows only originate from a Razorpay order, and
-- 'success' is written exclusively by the webhook handler.
CREATE TABLE payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_order_id   TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT,
  razorpay_signature  TEXT,
  amount              NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  status              payment_status NOT NULL DEFAULT 'pending',
  gateway_response    JSONB,
  receipt_number      TEXT UNIQUE,   -- AK-RCPT-YYYYMMDD-####, set only when status='success'
  receipt_url         TEXT,          -- signed Storage URL, generated in the same webhook call
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Webhook idempotency is claimed throughout the spec ("idempotent on razorpay_payment_id")
-- but a read-then-write check alone is a TOCTOU race: two concurrent retries of the same
-- Razorpay delivery can both read status='pending' and both proceed. This unique index is
-- what actually makes the guarantee hold — the second writer fails on conflict instead of
-- double-confirming the order, duplicating the receipt, or re-firing the admin notification.
CREATE UNIQUE INDEX idx_payments_razorpay_payment_id
  ON payments(razorpay_payment_id) WHERE razorpay_payment_id IS NOT NULL;

-- At most one successful payment per order. Without this, a guest who double-taps
-- "Pay Now" gets two Razorpay orders, pays twice, and both webhooks succeed —
-- idempotency on razorpay_payment_id does not catch it, because they are genuinely
-- two different payments.
CREATE UNIQUE INDEX idx_payments_one_success_per_order
  ON payments(order_id) WHERE status = 'success';
