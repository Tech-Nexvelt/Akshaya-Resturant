-- Migration 0023: Performance Indexes & Query Acceleration
-- Adds compound indexes for high-concurrency order creation, payment lookup, and webhook filtering.

-- 1. Accelerate order sorting and date range reporting
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
  ON orders(created_at DESC);

-- 2. Accelerate order filtering by status and tenant
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status 
  ON orders(tenant_id, status);

-- 3. Accelerate payment reconciliation queries
CREATE INDEX IF NOT EXISTS idx_payments_status 
  ON payments(status);

-- 4. Accelerate webhook dead-letter & retry processing
CREATE INDEX IF NOT EXISTS idx_webhook_events_state_created 
  ON webhook_events(state, created_at DESC);

-- 5. Accelerate activity log severity alerting
CREATE INDEX IF NOT EXISTS idx_activity_logs_severity_timestamp 
  ON activity_logs(severity, timestamp DESC);
