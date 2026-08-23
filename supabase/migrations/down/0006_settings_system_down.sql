-- Rollback for 0006_settings_system.sql
--
-- Supabase's CLI does not generate down-migrations; this is hand-written per the
-- rollback note in IMPLEMENTATION_PLAN.md Phase 0.
--
-- ⚠️ READ BEFORE RUNNING. This DROPS the platform's GST configuration.
--
--   * Dropping `settings` destroys gst_enabled / gst_rate / gst_number. Invoices
--     already issued are unaffected — each one snapshots gst_applicable, gst_rate,
--     and gst_amount (see 0007) — but no NEW invoice can be issued correctly until
--     0006 is re-applied and the owner re-enters the GST configuration.
--   * Back the row up first:
--       CREATE TABLE settings_backup_YYYYMMDD AS SELECT * FROM settings;
--   * Prefer a point-in-time-recovery snapshot over this script on production.
--
-- Order matters: the delete-blocking trigger must go before the table can be dropped.

BEGIN;

DROP TRIGGER IF EXISTS trg_settings_block_delete  ON settings;
DROP TRIGGER IF EXISTS trg_settings_before_update ON settings;
DROP TRIGGER IF EXISTS trg_settings_audit         ON settings;

DROP FUNCTION IF EXISTS settings_block_delete();
DROP FUNCTION IF EXISTS settings_before_update();
DROP FUNCTION IF EXISTS settings_audit();

DROP FUNCTION IF EXISTS update_settings(INT, JSONB);
DROP FUNCTION IF EXISTS get_gst_config();

DROP TABLE IF EXISTS settings;

-- is_owner() is intentionally NOT dropped: 0005's profiles policies depend on it,
-- and dropping it would silently break role-management access control.

COMMIT;
