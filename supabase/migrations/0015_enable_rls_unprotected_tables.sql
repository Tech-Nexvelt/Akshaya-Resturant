-- Migration 0015: enable RLS on the two tables that never got it
-- ===========================================================================
-- `idempotency_keys` (added in 0009) and `webhook_events` (added in 0010) are the
-- only two tables in the schema without row level security. Every other table got
-- it in 0005, `settings` in 0006, `invoice_counters` in 0012.
--
-- In Supabase, PostgREST reaches tables as `anon` / `authenticated`. Without RLS,
-- those roles inherit whatever table-level privileges exist and read the rows
-- directly. That is materially worse than it sounds for these two in particular:
--
--   * `webhook_events.payload` holds raw inbound Razorpay bodies — payment ids,
--     amounts, contact details, and the gateway's own event envelope.
--   * `idempotency_keys.response` caches whole prior API responses, so reading it
--     replays other customers' order confirmations verbatim.
--
-- Both are infrastructure tables that no browser should ever query. They are
-- reached only by SECURITY DEFINER functions (which run as the function owner and
-- are unaffected by RLS) and by `service_role` from route handlers (which bypasses
-- RLS by design). So: enable RLS, add ZERO policies. This is exactly the
-- `invoice_counters` pattern established in 0012 — RLS on, no policy, definer-only.
--
-- VERIFICATION (needs a live project — cannot be confirmed statically):
--   SELECT tablename, rowsecurity FROM pg_tables
--    WHERE schemaname = 'public'
--      AND tablename IN ('idempotency_keys', 'webhook_events');
--   -- expect rowsecurity = true for both
--
--   SELECT tablename, count(*) FROM pg_policies
--    WHERE schemaname = 'public'
--      AND tablename IN ('idempotency_keys', 'webhook_events')
--    GROUP BY tablename;
--   -- expect zero rows
--
-- Idempotent: ENABLE ROW LEVEL SECURITY is a no-op if already enabled.

ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events   ENABLE ROW LEVEL SECURITY;

-- No policies, deliberately. Access is definer-function / service_role only.

-- Belt and braces: make sure the PostgREST-facing roles hold no direct table
-- privileges either, so this does not depend on RLS alone. `service_role` is
-- untouched — the webhook route handler and the admin console need it.
REVOKE ALL ON TABLE idempotency_keys FROM anon, authenticated;
REVOKE ALL ON TABLE webhook_events   FROM anon, authenticated;
