-- Migration 0023 Down: Drop performance indexes
DROP INDEX IF EXISTS idx_orders_created_at;
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_payments_status;
DROP INDEX IF EXISTS idx_webhook_events_status_created;
