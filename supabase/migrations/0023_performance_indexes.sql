-- Migration 0023: Performance Indexes & Query Acceleration
-- Adds compound indexes for high-concurrency order creation, payment lookup, and webhook filtering.

-- 1. Accelerate order sorting and date range reporting
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
  ON orders(created_at DESC);

-- 2. Accelerate order filtering by status
-- NOTE: an earlier version of this index included `tenant_id`, but no migration has ever
-- added that column to `orders` (the schema is single-tenant — see lib/tenant.ts, which is
-- unused scaffolding with zero call sites). Indexing a nonexistent column fails at apply
-- time, so this is scoped to the column that actually exists. Add `tenant_id` back here only
-- once a migration actually creates it.
CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders(status);

-- 3. Accelerate payment reconciliation queries
CREATE INDEX IF NOT EXISTS idx_payments_status 
  ON payments(status);

-- 4. Accelerate webhook dead-letter & retry processing
-- NOTE: the column is `status` (webhook_status), not `state` — `webhook_events` has no
-- `state` column, which failed this migration outright. `idx_webhook_events_retry_queue`
-- (0011) is a *partial* index limited to pending/failed rows, so it doesn't serve the
-- /admin/webhooks "WHERE status = 'dead_letter' ORDER BY created_at DESC" query — this one
-- is not redundant with it.
CREATE INDEX IF NOT EXISTS idx_webhook_events_status_created
  ON webhook_events(status, created_at DESC);

-- 5. Activity log severity alerting
-- Dropped: `activity_logs` has no `timestamp` column (it's `created_at`, which failed this
-- migration outright), and the corrected version of this index already exists verbatim as
-- `idx_activity_logs_severity_created` (0010) — `(severity, created_at DESC)`. Re-adding it
-- under a new name would just be a duplicate index maintained on every write for no benefit.
