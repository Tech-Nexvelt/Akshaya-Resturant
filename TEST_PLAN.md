# Akshaya Platform — Backend Test Plan

**Scope:** Orders, Payments, Idempotency, Leads, Webhooks (retry + DLQ), Invoices, Observability
**Target:** migrations `0001`–`0011`, `app/api/webhooks/razorpay`, `app/api/payments/verify`
**Doc version:** 1.0.0 · **Last updated:** 2026-08-21
**Runnable suite:** [`supabase/tests/`](./supabase/tests/) (plain SQL, `psql` — no extension required)

---

## 0. Defects found while writing this plan

These are not hypothetical test cases — each was confirmed by reading the shipped migration or route
handler. **D1 is exploitable by an anonymous internet user and blocks go-live.**

| ID | Severity | Defect | Location |
|---|---|---|---|
| **D1** | 🔴 **Critical** | `record_payment_success` is `GRANT EXECUTE ... TO anon` and performs **no signature verification of its own**. Supabase/PostgREST exposes every RPC at `/rest/v1/rpc/<name>`, so an anonymous caller who knows or guesses a `razorpay_order_id` can mark that payment `success` and flip the order to `confirmed` — **without paying**. The HMAC check in the route handler is bypassed entirely by calling the RPC directly. | [0008:~143](supabase/migrations/0008_architectural_hardening.sql) |
| **D2** | 🟠 High | `check_lead_rate_limit()` counts `activity_logs WHERE entity_type='lead' AND metadata->>'phone' = …`. **No code path ever writes that shape** — orders log `entity_type='order'` with no `phone`; enquiries log `'banquet_enquiry'`/`'catering_enquiry'` with no `phone`. The count is always 0, so the limiter never fires. It is also **never called from anywhere**. Rate limiting is a no-op. | [0009:115](supabase/migrations/0009_production_hardening.sql) |
| **D3** | 🟠 High | `record_payment_success` generates `receipt_number` with `random()*10000` against a **UNIQUE** column, with no retry. ~50% collision probability within ~118 receipts in one day. A collision raises *inside webhook processing* → the event is marked failed and retried even though money was captured. This is the same defect fixed for `order_number` in `0004`, reintroduced. | [0008:~180](supabase/migrations/0008_architectural_hardening.sql) |
| **D4** | 🟠 High | `update_settings` was redefined in `0009` as a **GST-only, 5-argument** function that `DROP`s the earlier `(INT, JSONB)` patch version. There is now **no write path** for `notification_whatsapp_number`, `notification_sms_number`, `sheets_sync_enabled`, `google_sheets_id`, `google_service_account_email`, or `extras`. The Settings UI cannot persist notification or Sheets config. `TRD.md`'s documented `PATCH /api/settings` contract is stale. | [0009:72](supabase/migrations/0009_production_hardening.sql) |
| **D5** | 🟡 Medium | `record_webhook_event` does `SELECT` → `INSERT` with no lock. Two concurrent deliveries of the same event both miss the `SELECT`, both `INSERT`, and the second violates `idx_webhook_events_provider_external_id` → raises `23505` instead of returning `is_duplicate = true`. The handler returns 500, which makes Razorpay retry harder. Fix: `INSERT … ON CONFLICT DO NOTHING RETURNING id`, then `SELECT` on miss. | [0010:116](supabase/migrations/0010_fintech_production_hardening.sql) |
| **D6** | 🟡 Medium | `crypto.timingSafeEqual` **throws** when buffers differ in length. A signature header of the wrong length produces an unhandled exception → **500**, not the documented **400**. Compare lengths first, or use a constant-time compare that tolerates length mismatch. | [route.ts:29](app/api/webhooks/razorpay/route.ts:29) |
| **D7** | 🟡 Medium | `generate_invoice_number(p_fy)` interpolates the FY into the string but draws from a **single global sequence** that never resets per FY, and sequences are non-transactional so a rolled-back invoice **burns a number**, leaving gaps in a tax series. | [0009:59](supabase/migrations/0009_production_hardening.sql) |

---

## 1. Order System

### OS-01 — Normal order creation
```sql
SELECT * FROM create_order(
  'Ravi Kumar', '9876543210',
  '[{"menu_item_id":"<uuid-veg-biryani>","quantity":2}]'::jsonb,
  gen_random_uuid()
);
```
**Expected:** one `orders` row (`status='pending'`), matching `order_items`, `total` = server-derived
sum, one `leads` row with `source='restaurant_order'`, one `activity_logs` row `action='order.created'`.
**Fails if:** `total` reflects any client-supplied price; the `leads` row is missing (regression guard
for the audit fix); `order_number` does not match `^AK-\d{8}-\d{4}$`.

### OS-02 — Price tampering is ignored
Submit `[{"menu_item_id":"<uuid>","quantity":1,"price":1,"unit_price":1,"total":1}]`.
**Expected:** extra keys ignored; `total` equals the `menu_items.price`.
**Fails if:** total is 1.00.

### OS-03 — Unavailable item rejects the whole order
Precondition: set one item `available=false`. Submit a 2-item cart including it.
**Expected:** `RAISE` — `One or more items are unavailable or invalid (1 of 2 accepted)`; **zero**
`orders` rows persist (whole RPC rolls back).
**Fails if:** the order is created with only the available item — the silent-partial-fulfilment bug.

### OS-04 — Invalid item UUID
Submit a random UUID not present in `menu_items`.
**Expected:** same rejection as OS-03; nothing persisted.

### OS-05 — Empty cart / invalid phone / blank name
| Input | Expected exception |
|---|---|
| `'[]'::jsonb` | `Cart is empty` |
| phone `'abc'` / `'123'` | `A valid customer phone number is required` |
| name `'   '` | `Customer name is required` |

**Fails if:** any of these persists a row. Server-side validation must not depend on the client.

### OS-06 — Quantity boundaries
`quantity = 0` → rejected by `order_items` CHECK. `quantity = -1` → rejected.
`quantity = 40000` → **smallint overflow**; expect a clean error, not a 500 with a Postgres stack.

---

## 2. Payment System

### PS-01 — Happy path
Insert `payments` (`pending`, `amount` = order total, `currency='INR'`), then
`record_payment_success(rzp_order, rzp_pay, sig, '{}')`.
**Expected:** `payments.status='success'`, `receipt_number` matches `^AK-RCPT-\d{8}-\d{4}$`,
`orders.status='confirmed'`, `activity_logs` gains `payment.captured`.

### PS-02 — Amount mismatch is blocked
Insert a payment with `amount = order.total - 1`.
**Expected:** `AMOUNT_MISMATCH` (`ERRCODE 22000`) from `verify_payment_drift_guard`, **plus** a
`payment.amount_mismatch` row in `activity_logs` at `severity='critical'`.
**Fails if:** the payment inserts, or the critical log is absent (the alerting path depends on it).

### PS-03 — Partial payment
Insert `amount = order.total / 2`. **Expected:** identical rejection to PS-02 — the system has no
partial-payment concept and must not acquire one by accident.

### PS-04 — Invalid currency
Insert with `currency='USD'`. **Expected:** `CURRENCY_MISMATCH` (`22000`) + `payment.currency_mismatch`
critical log.

### PS-05 — Payment against a cancelled order
Set `orders.status='cancelled'`, then insert a payment.
**Expected:** `INVALID_ORDER_STATE`. Also assert the **update** path: a payment already `pending` on an
order cancelled afterwards cannot be driven to `success` (the trigger is `BEFORE INSERT OR UPDATE`).
**Operational note:** this is the money-captured-but-unrecordable case. Razorpay has the funds; the
DB refuses the write. It must surface as a `critical` log and a DLQ entry, not a silent 500.

### PS-06 — Double-charge prevention
Two distinct successful payments for one order.
**Expected:** second insert violates `idx_payments_one_success_per_order`.
**Fails if:** both succeed — the guest is charged twice.

### PS-07 — Webhook signature (route level)
| Case | Expected |
|---|---|
| Valid HMAC | `200` |
| Tampered body, valid-format signature | `400 Invalid webhook signature` |
| Missing `x-razorpay-signature` | `400 Missing webhook signature` |
| **Signature of wrong length** (e.g. `"abc"`) | `400` — **currently 500, see D6** |
| `RAZORPAY_WEBHOOK_SECRET` unset | `500 Webhook secret unconfigured` |

### PS-08 — Webhook delayed, client verify first
Call `/api/payments/verify` (optimistic path) **before** the webhook arrives.
**Expected:** UI may show success, but `orders.status` stays `pending` until the webhook lands. The
verify route must never be the writer of `success`.

---

## 3. Idempotency

### ID-01 — Same key returns the same order
Call `create_order` twice with an identical `p_idempotency_key`.
**Expected:** identical `order_id`/`order_number`/`total` both times; **exactly one** `orders` row,
one `leads` row, one `activity_logs` row.
**Fails if:** a second order, a duplicate lead, or a second audit entry appears.

### ID-02 — Null key is not a dedup bucket
Two calls with `p_idempotency_key = NULL`.
**Expected:** two distinct orders — the partial unique index excludes NULLs, and two genuine
walk-in orders must not collapse into one.

### ID-03 — Concurrent identical keys
Two sessions, same key, committed simultaneously.
**Expected:** one wins; the other returns the same order (the RPC catches `unique_violation` and
re-selects). **Fails if:** either raises to the caller.

### ID-04 — Repeated webhook for one payment
`record_payment_success` twice with the same `razorpay_order_id`.
**Expected:** second call returns the **existing** `receipt_number` and makes no writes — no new
receipt, no duplicate `payment.captured` log, no second notification.

### ID-05 — TTL cleanup is bounded
Seed 5,000 expired `idempotency_keys`; run `cleanup_expired_idempotency_keys_batched(2000, 2)`.
**Expected:** `deleted_count = 4000`, `batches_processed = 2` — the cap is respected and the function
does not hold a long lock (`FOR UPDATE SKIP LOCKED`).

---

## 4. Lead System

### LS-01 — Enquiry writes enquiry + lead atomically
`create_banquet_enquiry('Priya','9876543211','Wedding','2026-12-01',300,'2-3L','Veg only')`
**Expected:** one `banquet_enquiries` row, one `leads` row (`source='banquet_enquiry'`, metadata
carrying `enquiry_id`), one `activity_logs` row — **or none of the three**.

### LS-02 — Direct insert is denied
As `anon`: `INSERT INTO banquet_enquiries …`
**Expected:** RLS denial. The public insert policies were dropped in `0007`; the RPC is the only path.

### LS-03 — Rate limit enforcement ⚠️ **currently fails**
Call `check_lead_rate_limit('9876543210', 5, 3600)` after 6 enquiries from that number.
**Expected:** `RATE_LIMIT_EXCEEDED` (`42900`).
**Actual:** returns cleanly — **see D2**. The function reads a log shape nothing writes, and no caller
invokes it. This test is written to fail until D2 is fixed; do not delete it to make the suite green.

### LS-04 — Event vs. lead separation
A `button_click` lead (no enquiry behind it) writes to `leads` only.
**Expected:** `leads` row with `source='button_click'`; no enquiry row. Confirms `leads` is the
intent ledger and enquiry tables are the fulfilment records.

### LS-05 — Duplicate lead is allowed, and that is correct
Same phone submits two genuine enquiries a week apart.
**Expected:** two `leads` rows. Deduplication belongs in the dashboard view, not the write path —
collapsing them would destroy the second enquiry's context.

---

## 5. Webhook System (retry + DLQ)

### WH-01 — Dedup on external event id
`record_webhook_event('inbound','razorpay','payment.captured','evt_123', '{}')` twice.
**Expected:** first `is_duplicate=false`, second `is_duplicate=true`, one row total.

### WH-02 — Concurrent dedup ⚠️ **currently fails**
Two sessions call WH-01's statement simultaneously.
**Expected:** one `false`, one `true`.
**Actual:** the loser raises `23505` — **see D5**.

### WH-03 — Failure → exponential backoff
`update_webhook_outcome(id, false, 'timeout')` repeatedly.
**Expected per `0011`:** `retry_count` 1→2→3…, `status='failed'`,
`next_retry_at ≈ now() + LEAST(3600, 60 * 2^(retry_count-1))` → 60s, 120s, 240s, 480s, capped at 3600s.

### WH-04 — Retry → success clears state
After two failures, call with `p_success=true`.
**Expected:** `status='success'`, `processed_at` set, `last_error` NULL, `next_retry_at` NULL.
`retry_count` is deliberately **not** reset — it is delivery history.

### WH-05 — Exhaustion → dead_letter
Fail `max_retries` (5) times.
**Expected:** `status='dead_letter'`, `next_retry_at` NULL, and a `webhook.dead_letter`
`activity_logs` row at `severity='critical'`.

### WH-06 — 24-hour window forces DLQ early
Backdate `created_at` to 25h ago, then fail once with `retry_count=0`.
**Expected:** straight to `dead_letter` with `last_error` = `'Max retries or 24h retry window exhausted'`
when no message is supplied — the age cap short-circuits the retry budget.

### WH-07 — Replay from DLQ
`replay_webhook_event(id)` as owner/admin.
**Expected:** `status='pending'`, `retry_count=0`, `next_retry_at=now()`, `last_error` NULL, plus a
`webhook.replayed` log.
**As `staff`:** `UNAUTHORIZED` (`42501`).
**Documented consequence:** replaying an event older than 24h grants exactly **one** attempt — the
next failure re-dead-letters immediately via WH-06's age check. Intended; assert it so it is not
mistaken for a regression.

### WH-08 — DLQ inspection
`get_dead_letter_webhooks(50, 0)` returns only `status='dead_letter'`, newest first.

---

## 6. Invoice System

### IN-01 — Generation with GST OFF
Precondition: `settings.gst_enabled=false`.
**Expected:** `gst_applicable=false`, `gst_amount=0`, `gst_rate=0`, `total_amount = subtotal`.

### IN-02 — Generation with GST ON
Precondition: `update_settings(true, 5.00, '36ABCDE1234F1Z5', 'Akshaya Family Restaurant', <version>)`.
**Expected:** `gst_amount = round(subtotal * 0.05, 2)`, `gst_rate=5.00` **persisted on the invoice**,
`total_amount = subtotal + gst_amount`.

### IN-03 — GST cannot be enabled without a GSTIN
`update_settings(true, 5.00, NULL, NULL, <version>)`
**Expected:** CHECK violation `23514` (`gst_requires_number`). A tax invoice without a GSTIN is not a
valid tax invoice.

### IN-04 — Historical invoices are immune to later toggles
Generate at 5%, then change to 18%, then re-read the old invoice.
**Expected:** the original still reports `gst_rate=5.00` and its original `gst_amount`. This is the
property that lets `settings` remain a current-state singleton.

### IN-05 — Staff read path
As `staff`: `SELECT * FROM settings` → **0 rows**; `SELECT * FROM get_gst_config()` → the real config.
**Fails if:** invoice-generation code reads `settings` directly — under RLS that returns zero rows,
not an error, and would silently issue an untaxed invoice. Grep the codebase as part of this test.

### IN-06 — Sequence uniqueness under concurrency
20 parallel `generate_invoice_number('2026-27')` calls.
**Expected:** 20 distinct numbers, zero duplicates.
**Also assert (known gap, D7):** roll back a transaction that consumed a number — the number is
**burned**, leaving a gap in the series. Document the gap policy for the CA, or move to a gapless
per-FY allocator.

### IN-07 — Optimistic concurrency on settings
Two owners read `version=7`; both call `update_settings(..., 7)`.
**Expected:** first returns `updated_version=8`; second raises `CONFLICT … (version mismatch)`
(`40001`) → API maps to **409**. Neither silently overwrites the other.

### IN-08 — Non-owner settings write
As `admin` and as `staff`: `update_settings(...)` → `UNAUTHORIZED` (`42501`).
Confirms the RBAC boundary holds inside a `SECURITY DEFINER` function, where RLS does not apply.

---

## 7. Edge Cases & Cross-Cutting

### EC-01 — Payment after cancellation → see PS-05.
### EC-02 — Order confirmed without payment
`UPDATE orders SET status='confirmed'` on an unpaid order, **as `service_role`**.
**Expected:** trigger raises `Order … cannot be confirmed without a successful payment`. Triggers bind
service_role too — RLS does not.

### EC-03 — Staff cannot rewrite money
As `staff`: `UPDATE orders SET total = 0` → denied by column grant.
`UPDATE orders SET status='preparing'` → succeeds.

### EC-04 — Admin cannot self-promote
As `admin`: `UPDATE profiles SET role='owner' WHERE id = auth.uid()` → denied.
Regression guard for the privilege escalation fixed in the audit.

### EC-05 — Settings singleton is indestructible
`DELETE FROM settings` as `service_role` → trigger raises.
`INSERT INTO settings (id) VALUES (false)` → CHECK violation.

### EC-06 — Observability correlation
`set_request_context('req-abc')` then `log_activity_event(...)` with no explicit request id.
**Expected:** the row inherits `request_id='req-abc'` from the GUC. Assert the GUC is
transaction-scoped (`set_config(..., true)`) and does not leak across pooled connections.

### EC-07 — Concurrency soak
200 concurrent `create_order` calls with distinct idempotency keys.
**Expected:** 200 orders, 200 leads, **zero** `order_number` collisions (the retry loop absorbs them),
p95 ≤ 2s per `IMPLEMENTATION_PLAN.md` Phase 9.

---

## 8. Execution

```bash
supabase start && psql "$(supabase status -o env | grep DB_URL | cut -d= -f2-)" -v ON_ERROR_STOP=1 -f supabase/tests/run_all.sql
```

Every test runs inside a transaction that is **rolled back**, so the suite is re-runnable and never
mutates seed data. Tests covering D1–D7 are written to **fail against current `main`** — they encode
intended behavior, and turning them green is the definition of done for those defects.

**Not covered here:** front-end component tests, and any test requiring a live Razorpay sandbox
(PS-07's valid-HMAC case needs a fixture-generated signature, which the SQL suite cannot produce —
that one belongs in a route-handler test once a JS test runner exists; the repo currently has none).
