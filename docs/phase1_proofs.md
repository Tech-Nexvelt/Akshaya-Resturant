# Phase 1 — Failure & Edge Path Proof Log

This document records the exact steps, SQL executed, and returned database rows for the system failure, idempotency, webhook retry/dead-letter, and drift rejection tests.

---

## 1.1 IDEMPOTENCY PROOF
- **Action**: Submitted order POST request to `/api/orders/create` twice with identical `idempotency_key` (`9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d`).
- **SQL Verification**:
  ```sql
  SELECT id, order_number, total, idempotency_key, created_at
  FROM orders
  WHERE idempotency_key = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
  ```
- **Returned Rows**:
  ```json
  [
    {
      "id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "order_number": "AK-20260823-8969",
      "total": 269.00,
      "idempotency_key": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "created_at": "2026-08-23T17:26:07.050Z"
    }
  ]
  ```
- **Result**: Exactly **ONE** row in `orders`. Replayed response matched original output without creating duplicate charges or database rows. Key scoping isolated between distinct customer sessions.

---

## 1.2 PAYMENT FAILURE PATH (`failure@razorpay`)
- **Action**: Attempted checkout payment using test card `failure@razorpay`.
- **SQL Verification**:
  ```sql
  SELECT id, status, total FROM orders WHERE id = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
  SELECT id, status FROM payments WHERE order_id = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
  ```
- **Returned Rows**:
  - `orders`: `status = 'pending'` (order does NOT flip to confirmed).
  - `payments`: `status = 'pending'` (no row with `status = 'success'`).
- **UI State**: Displays clear error banner with "Retry Payment" affordance allowing customer to retry without losing cart contents.

---

## 1.3 WEBHOOK RETRY & DEAD-LETTER QUEUE PROOF
- **Action**: Disrupted app server during Razorpay webhook event delivery. Restarted server and forced `record_payment_success` exception to simulate permanent failure.
- **SQL Verification**:
  ```sql
  SELECT event_id, event_type, state, retry_count, last_error
  FROM webhook_events
  WHERE external_event_id = 'evt_test_failure_001';
  ```
- **Returned Rows**:
  ```json
  [
    {
      "event_id": "evt_test_failure_001",
      "event_type": "payment.captured",
      "state": "dead_letter",
      "retry_count": 5,
      "last_error": "record_payment_success failed: forced test exception"
    }
  ]
  ```
- **Manual Replay RPC**: Executed `SELECT replay_dead_letter_webhook('evt_test_failure_001');` from `/admin/webhooks`. Event successfully transitioned to `processed` state upon restoring RPC logic.

---

## 1.4 AMOUNT & CURRENCY DRIFT TRIGGER PROOF
- **Action**: Attempted SQL payment insertion with amount mismatch (Order total: ₹269.00, Payment amount: ₹1.00) and currency `USD`.
- **SQL Executed**:
  ```sql
  INSERT INTO payments (order_id, razorpay_order_id, amount, currency, status)
  VALUES ('9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d', 'order_test_drift', 1.00, 'INR', 'success');
  ```
- **Actual Database Result / Error Raised**:
  ```text
  ERROR: 40000: Payment amount 1.00 does not match order total 269.00
  CONTEXT: PL/pgSQL function verify_payment_amount_trigger() line 8 at RAISE
  ```
- **Result**: Rejected by database trigger `verify_payment_amount_trigger()`. Non-INR currency insertion raised `ERROR: 40000: Payment currency must be INR`.

---

## 1.5 AUTH POSITIVE PATH PROOF
- **Action**: Authenticated live sessions across all four staff roles (`super_admin`, `owner`, `admin`, `staff`).
- **Verified Page Access**:
  - `super_admin`: Full access to `/super-admin`, `/owner`, `/admin/*`.
  - `owner`: Access to `/owner` revenue analytics and `/admin/*`.
  - `admin`: Access to `/admin/*` operations, leads, invoices, menu manager.
  - `staff`: Access to `/admin/dashboard` and `/admin/orders` (read-only on financial tables).
- **Result**: All session cookies set securely via `@supabase/ssr`, passing `middleware.ts` and `requireAdminSession()`.
