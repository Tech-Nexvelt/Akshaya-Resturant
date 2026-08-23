-- Migration 0010: Fintech-Grade Production Hardening & Observability
-- Implements batched idempotency TTL cleanup, webhook observability store,
-- log severity levels, and high-performance indexing for audit and monitoring.

-- ---------------------------------------------------------------------------
-- 1. IDEMPOTENCY EXPIRY STRATEGY (Batched Deletion with Lock Safety)
-- ---------------------------------------------------------------------------

-- Batch-based idempotent key cleanup to prevent lock escalation and table bloat
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_keys_batched(
  p_batch_size INT DEFAULT 2000,
  p_max_batches INT DEFAULT 10
)
RETURNS TABLE (deleted_count INT, batches_processed INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_in_batch INT := 0;
  v_total_deleted    INT := 0;
  v_batch_count      INT := 0;
BEGIN
  LOOP
    EXIT WHEN v_batch_count >= p_max_batches;

    WITH keys_to_delete AS (
      SELECT key
      FROM idempotency_keys
      WHERE expires_at < now()
      ORDER BY expires_at ASC
      LIMIT p_batch_size
      FOR UPDATE SKIP LOCKED
    ),
    deleted_rows AS (
      DELETE FROM idempotency_keys
      WHERE key IN (SELECT key FROM keys_to_delete)
      RETURNING 1
    )
    SELECT count(*)::INT INTO v_deleted_in_batch FROM deleted_rows;

    v_total_deleted := v_total_deleted + v_deleted_in_batch;
    v_batch_count := v_batch_count + 1;

    -- If fewer rows were deleted than batch size, no more expired keys remain
    EXIT WHEN v_deleted_in_batch < p_batch_size;
  END LOOP;

  RETURN QUERY SELECT v_total_deleted, v_batch_count;
END;
$$;

GRANT EXECUTE ON FUNCTION cleanup_expired_idempotency_keys_batched TO authenticated;

-- Enable pg_cron schedule if extension exists, otherwise fallback to external trigger
--
-- NOTE: the outer block is $do$-tagged and the cron command body $cron$-tagged on
-- purpose. Both were plain $$ originally, so the inner $$ terminated the outer DO
-- block early and the whole migration failed with "syntax error at or near SELECT"
-- — meaning 0010 never applied, and 0011/0012 then cascade-failed on the missing
-- webhook_direction / webhook_status types. Nested dollar quotes must use distinct tags.
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Schedule hourly cleanup batch job
    PERFORM cron.schedule(
      'idempotency-key-cleanup-hourly',
      '0 * * * *',
      $cron$SELECT cleanup_expired_idempotency_keys_batched(2000, 5);$cron$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Handle gracefully if pg_cron is managed via Supabase UI or restricted
  RAISE NOTICE 'pg_cron schedule setup skipped (managed environment)';
END;
$do$;


-- ---------------------------------------------------------------------------
-- 2. WEBHOOK OBSERVABILITY TABLE & RETRY MECHANISM
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE webhook_direction AS ENUM ('inbound', 'outbound');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE webhook_status AS ENUM ('pending', 'processing', 'success', 'failed', 'dead_letter');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS webhook_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direction         webhook_direction NOT NULL DEFAULT 'inbound',
  provider          TEXT NOT NULL, -- e.g., 'razorpay', 'pos', 'whatsapp', 'crm'
  event_type        TEXT NOT NULL, -- e.g., 'payment.captured', 'payment.failed', 'order.created'
  external_event_id TEXT,          -- Unique event ID from provider (e.g. Razorpay event ID)
  payload           JSONB NOT NULL,
  status            webhook_status NOT NULL DEFAULT 'pending',
  retry_count       INT NOT NULL DEFAULT 0,
  max_retries       INT NOT NULL DEFAULT 5,
  last_error        TEXT,
  next_retry_at     TIMESTAMPTZ,
  processed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Deduplication index for external webhooks
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_events_provider_external_id
ON webhook_events(provider, external_event_id)
WHERE external_event_id IS NOT NULL;

-- Indexes for status monitoring and retry workers
CREATE INDEX IF NOT EXISTS idx_webhook_events_retry_queue
ON webhook_events(status, next_retry_at)
WHERE status IN ('pending', 'failed');

CREATE INDEX IF NOT EXISTS idx_webhook_events_created
ON webhook_events(created_at DESC);

-- RPC: Record incoming webhook event with deduplication guard
CREATE OR REPLACE FUNCTION record_webhook_event(
  p_direction         webhook_direction,
  p_provider          TEXT,
  p_event_type        TEXT,
  p_external_event_id TEXT,
  p_payload           JSONB
)
RETURNS TABLE (event_id UUID, is_duplicate BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  IF p_external_event_id IS NOT NULL THEN
    SELECT id INTO v_event_id
    FROM webhook_events
    WHERE provider = p_provider AND external_event_id = p_external_event_id;

    IF FOUND THEN
      RETURN QUERY SELECT v_event_id, true;
      RETURN;
    END IF;
  END IF;

  INSERT INTO webhook_events (
    direction, provider, event_type, external_event_id, payload, status
  )
  VALUES (
    p_direction, p_provider, p_event_type, p_external_event_id, p_payload, 'processing'
  )
  RETURNING id INTO v_event_id;

  RETURN QUERY SELECT v_event_id, false;
END;
$$;

-- RPC: Update webhook outcome with exponential backoff calculation
CREATE OR REPLACE FUNCTION update_webhook_outcome(
  p_event_id    UUID,
  p_success     BOOLEAN,
  p_error_msg   TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_retry_count INT;
  v_max_retries INT;
BEGIN
  SELECT retry_count, max_retries INTO v_retry_count, v_max_retries
  FROM webhook_events WHERE id = p_event_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Webhook event % not found', p_event_id;
  END IF;

  IF p_success THEN
    UPDATE webhook_events
    SET status = 'success',
        processed_at = now(),
        last_error = NULL,
        next_retry_at = NULL,
        updated_at = now()
    WHERE id = p_event_id;
  ELSE
    v_retry_count := v_retry_count + 1;
    IF v_retry_count >= v_max_retries THEN
      UPDATE webhook_events
      SET status = 'dead_letter',
          retry_count = v_retry_count,
          last_error = p_error_msg,
          next_retry_at = NULL,
          updated_at = now()
      WHERE id = p_event_id;
    ELSE
      UPDATE webhook_events
      SET status = 'failed',
          retry_count = v_retry_count,
          last_error = p_error_msg,
          -- Exponential backoff: 2^retry * 1 minute (1m, 2m, 4m, 8m, 16m)
          next_retry_at = now() + (POWER(2, v_retry_count) * INTERVAL '1 minute'),
          updated_at = now()
      WHERE id = p_event_id;
    END IF;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION record_webhook_event TO service_role;
GRANT EXECUTE ON FUNCTION update_webhook_outcome TO service_role;


-- ---------------------------------------------------------------------------
-- 3. ACTIVITY LOG ENHANCEMENT (Severity & High-Performance Indexing)
-- ---------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE log_severity AS ENUM ('info', 'warning', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE activity_logs
ADD COLUMN IF NOT EXISTS severity log_severity NOT NULL DEFAULT 'info',
ADD COLUMN IF NOT EXISTS request_id TEXT;

-- Optimized indexes for filtering & monitoring
CREATE INDEX IF NOT EXISTS idx_activity_logs_severity_created
ON activity_logs(severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_lookup
ON activity_logs(entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_metadata_gin
ON activity_logs USING gin (metadata);

-- Enhanced activity log helper function
CREATE OR REPLACE FUNCTION log_activity_event(
  p_action      TEXT,
  p_entity_type TEXT,
  p_entity_id   UUID,
  p_severity    log_severity DEFAULT 'info',
  p_metadata    JSONB DEFAULT '{}'::jsonb,
  p_actor_id    UUID DEFAULT NULL,
  p_request_id  TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO activity_logs (
    action, entity_type, entity_id, severity, metadata, actor_id, request_id
  )
  VALUES (
    p_action, p_entity_type, p_entity_id, p_severity, p_metadata, p_actor_id, p_request_id
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

GRANT EXECUTE ON FUNCTION log_activity_event TO authenticated, service_role;
