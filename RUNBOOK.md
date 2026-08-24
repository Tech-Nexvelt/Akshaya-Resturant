# Akshaya Platform Operational Runbook

This runbook documents standard operating procedures (SOPs) for incident management, payment reconciliation, dead-letter webhook replays, database migration rollbacks, and the go-live transition protocol.

---

## 1. Customer Paid But Order Remains `pending`

### Incident Symptoms
Customer reports money deducted via UPI/Card on Razorpay, but the restaurant portal displays order status as `pending`.

### Diagnosis & Resolution Protocol
1. **Check Gateway Status**:
   Log into Razorpay Dashboard -> Payments -> Search by customer phone or order ID. Confirm status is `captured`.
2. **Inspect Activity Logs**:
   Open `/admin/activity` or query database:
   ```sql
   SELECT * FROM activity_logs
   WHERE metadata->>'order_id' = '<ORDER_ID>'
      OR metadata->>'razorpay_order_id' = '<RAZORPAY_ORDER_ID>';
   ```
3. **Verify Payments Row**:
   ```sql
   SELECT * FROM payments WHERE razorpay_order_id = '<RAZORPAY_ORDER_ID>';
   ```
4. **Manual Settlement**:
   If payment is `captured` on Razorpay but missing in Supabase, execute the service-role RPC:
   ```sql
   SELECT record_payment_success(
     p_razorpay_order_id  => '<RAZORPAY_ORDER_ID>',
     p_razorpay_payment_id => '<RAZORPAY_PAYMENT_ID>',
     p_razorpay_signature  => 'manual_reconciliation_override',
     p_gateway_response    => '{"reconciled_by": "operator"}'::jsonb
   );
   ```
   Confirm order status transitions to `confirmed` and receipt is generated.

---

## 2. Webhook Dead-Letter Queue Replay Procedure

### Symptoms
Alert emitted for `webhook_events` in `dead_letter` state (`retry_count >= 5`).

### Replay Protocol
1. Open `/admin/webhooks` console (requires `admin` or `owner` role).
2. Filter table by status `dead_letter`.
3. Review the `last_error` field to identify root cause (e.g. transient DB lock, service key unavailability).
4. Resolve underlying issue (e.g. restore service key, fix network outage).
5. Click **Replay Event** button, or execute SQL (note: the RPC is `replay_webhook_event`, keyed
   by the internal `webhook_events.id` UUID — not the gateway's `external_event_id` string; look
   it up first if you only have the external ID):
   ```sql
   SELECT replay_webhook_event('<WEBHOOK_EVENTS.ID>');
   ```
6. Verify `retry_count` resets to 0 and `status` moves to `pending` (the next scheduled retry then
   picks it up and moves it to `processed` on success).

---

## 3. Database Migration Rollback Procedure

### Standard Migration Rollback
To roll back a migration (e.g., `0022_guard_super_admin_assignment.sql`):
1. Locate down-migration file in `supabase/migrations/down/0022_guard_super_admin_assignment_down.sql`.
2. Execute SQL against database:
   ```sql
   \i supabase/migrations/down/0022_guard_super_admin_assignment_down.sql
   ```

### One-Way Migration & Enum Rollback Policy (`0018`)
> [!WARNING]
> PostgreSQL enum type modifications (e.g. `user_role` additions in `0018`) cannot be reverted via SQL scripts because PostgreSQL does not support `ALTER TYPE ... DROP VALUE`.

**Rollback Procedure for Enum Changes**:
1. Trigger Supabase Point-In-Time-Recovery (PITR) from Supabase Dashboard -> Database -> Backups.
2. Select target recovery timestamp preceding `0018` migration execution.
3. Confirm point-in-time restore completes and verify `user_role` enum state.

---

## 4. Supabase PITR & Backup Configuration

- **Point-in-Time Recovery (PITR)**: Enabled with a **7-day rolling window** (1-second granularity).
- **Daily Backups**: Automated daily snapshots retained for **30 days**.
- **WAL Archiving**: Continuous Write-Ahead Log streaming to S3 cold storage.

---

## 5. Go-Live Transition Protocol (Test -> Live Mode)

1. **Environment Variables Switch**:
   - Update `NEXT_PUBLIC_RAZORPAY_KEY_ID` to live key `rzp_live_xxxxxxx`.
   - Update `RAZORPAY_KEY_SECRET` to live secret.
   - Update `RAZORPAY_WEBHOOK_SECRET` to live secret.
2. **Register Live Webhook Endpoint**:
   - Log into Razorpay Dashboard (Live Mode) -> Settings -> Webhooks.
   - Add URL: `https://akshaya.restaurant/api/webhooks/razorpay`.
   - Enable events: `payment.captured`, `payment.failed`, `order.paid`.
3. **Verification Test**:
   - Perform ONE real ₹1.00 payment transaction using UPI on `https://akshaya.restaurant`.
   - Confirm order status transitions to `confirmed`, receipt is generated, and payment appears in Razorpay Live Dashboard.
   - Refund the ₹1.00 test payment from Razorpay Dashboard.
