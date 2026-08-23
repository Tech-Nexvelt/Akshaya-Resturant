-- Migration 0006: Production settings system (GST / notifications / Sheets config)
--
-- DESIGN: typed singleton row, NOT key-value and NOT a JSONB blob. Rationale in
-- TRD.md § Settings. The short version: gst_rate multiplies money on a legal tax
-- document. In a key-value or JSONB design a mistyped or absent key returns NULL,
-- the app coalesces it to a default, and the failure is SILENT — you discover it in
-- a tax audit. Typed columns with CHECK constraints fail loudly, at migration time.
--
-- A `extras JSONB` column is provided for genuinely non-critical future settings
-- (UI preferences, feature flags). Nothing that affects money, tax, or access
-- control may live there — those get a real column and a real constraint.

-- ---------------------------------------------------------------------------
-- 1. HELPER: is_owner()
-- ---------------------------------------------------------------------------
-- Defined in 0005 as well; repeated idempotently so this migration is
-- self-contained if 0005 is ever reordered.
CREATE OR REPLACE FUNCTION is_owner() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner');
$$;

-- ---------------------------------------------------------------------------
-- 2. TABLE
-- ---------------------------------------------------------------------------
-- Singleton enforced structurally: BOOLEAN primary key + CHECK(id) means the only
-- value that satisfies the check is `true`, and the PK makes `true` unique. A second
-- row is not "discouraged", it is impossible — no trigger or application rule needed.
CREATE TABLE settings (
  id  BOOLEAN PRIMARY KEY DEFAULT true,

  -- ---- Tax / GST (money-critical: typed, constrained, never nullable) ----
  gst_enabled          BOOLEAN      NOT NULL DEFAULT false,
  gst_rate             NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  gst_number           TEXT,
  legal_business_name  TEXT,

  -- ---- Notifications (optional; failures must never block an order) ----
  notifications_enabled        BOOLEAN NOT NULL DEFAULT true,
  notification_whatsapp_number TEXT,
  notification_sms_number      TEXT,

  -- ---- Google Sheets export (optional; .xlsx works without it) ----
  sheets_sync_enabled          BOOLEAN NOT NULL DEFAULT false,
  google_sheets_id             TEXT,
  -- Reference only. The PRIVATE KEY lives in a server-only environment secret and
  -- must never be stored in this table.
  google_service_account_email TEXT,

  -- ---- Extensibility: non-money settings only ----
  extras JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- ---- Concurrency + audit ----
  version    INT         NOT NULL DEFAULT 1,
  updated_by UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Singleton
  CONSTRAINT settings_singleton CHECK (id),

  -- Rate must be a sane percentage.
  CONSTRAINT gst_rate_range CHECK (gst_rate >= 0 AND gst_rate <= 100),

  -- 15-character GSTIN format (state code, PAN, entity, Z, checksum).
  CONSTRAINT gst_number_format CHECK (
    gst_number IS NULL OR
    gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$'
  ),

  -- A tax invoice without a GSTIN is not a valid tax invoice. This makes it
  -- impossible to switch GST on before the number that must appear on the document
  -- exists — the constraint is the point, not an inconvenience.
  CONSTRAINT gst_requires_number CHECK (
    NOT gst_enabled OR (gst_number IS NOT NULL AND legal_business_name IS NOT NULL)
  ),

  -- Same principle for integrations: no "enabled" flag without its config.
  CONSTRAINT sheets_requires_config CHECK (
    NOT sheets_sync_enabled OR
    (google_sheets_id IS NOT NULL AND google_service_account_email IS NOT NULL)
  ),

  CONSTRAINT whatsapp_e164 CHECK (
    notification_whatsapp_number IS NULL OR notification_whatsapp_number ~ '^\+[1-9][0-9]{7,14}$'
  ),
  CONSTRAINT sms_e164 CHECK (
    notification_sms_number IS NULL OR notification_sms_number ~ '^\+[1-9][0-9]{7,14}$'
  )
);

COMMENT ON TABLE settings IS
  'Singleton platform configuration. Owner-writable only. GST fields are read by '
  'staff via get_gst_config(), never by direct select.';

-- INDEXES: deliberately none beyond the primary key. The table holds exactly one
-- row; any index would be dead weight the planner ignores. Noted explicitly so a
-- future reader does not mistake the absence for an oversight.

-- ---------------------------------------------------------------------------
-- 3. SEED
-- ---------------------------------------------------------------------------
-- GST defaults to OFF: the safe default is "not yet configured", and
-- gst_requires_number makes turning it on without a GSTIN impossible anyway.
INSERT INTO settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. TRIGGERS
-- ---------------------------------------------------------------------------

-- 4a. Maintain version / updated_at / updated_by, and pin the singleton id.
CREATE OR REPLACE FUNCTION settings_before_update() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.id         := true;                                  -- id is never reassignable
  NEW.version    := OLD.version + 1;                       -- monotonic, drives optimistic locking
  NEW.updated_at := now();
  NEW.updated_by := COALESCE(auth.uid(), OLD.updated_by);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_settings_before_update
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION settings_before_update();

-- 4b. The singleton row must never be deleted. A trigger (not just the absence of a
-- DELETE policy) because service_role bypasses RLS entirely — a stray admin script
-- or a bad migration would otherwise leave the platform with no GST configuration.
CREATE OR REPLACE FUNCTION settings_block_delete() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'The settings row is a singleton and cannot be deleted';
END;
$$;

CREATE TRIGGER trg_settings_block_delete
  BEFORE DELETE ON settings
  FOR EACH ROW EXECUTE FUNCTION settings_block_delete();

-- 4c. Audit every change, with GST changes logged under their own action so a tax
-- question can be answered from activity_logs alone: who changed the rate, when,
-- from what, to what.
CREATE OR REPLACE FUNCTION settings_audit() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  IF OLD.gst_enabled IS DISTINCT FROM NEW.gst_enabled
     OR OLD.gst_rate   IS DISTINCT FROM NEW.gst_rate
     OR OLD.gst_number IS DISTINCT FROM NEW.gst_number THEN
    INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (
      auth.uid(), 'settings.gst_changed', 'settings', NULL,
      jsonb_build_object(
        'from',    jsonb_build_object('gst_enabled', OLD.gst_enabled, 'gst_rate', OLD.gst_rate, 'gst_number', OLD.gst_number),
        'to',      jsonb_build_object('gst_enabled', NEW.gst_enabled, 'gst_rate', NEW.gst_rate, 'gst_number', NEW.gst_number),
        'version', NEW.version
      )
    );
  END IF;

  IF OLD.notifications_enabled IS DISTINCT FROM NEW.notifications_enabled
     OR OLD.notification_whatsapp_number IS DISTINCT FROM NEW.notification_whatsapp_number
     OR OLD.notification_sms_number      IS DISTINCT FROM NEW.notification_sms_number
     OR OLD.sheets_sync_enabled          IS DISTINCT FROM NEW.sheets_sync_enabled
     OR OLD.google_sheets_id             IS DISTINCT FROM NEW.google_sheets_id
     OR OLD.google_service_account_email IS DISTINCT FROM NEW.google_service_account_email
     OR OLD.extras                       IS DISTINCT FROM NEW.extras THEN
    INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (
      auth.uid(), 'settings.integrations_changed', 'settings', NULL,
      jsonb_build_object('version', NEW.version)
    );
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_settings_audit
  AFTER UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION settings_audit();

-- ---------------------------------------------------------------------------
-- 5. RLS
-- ---------------------------------------------------------------------------
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Owner only, read and write. No INSERT policy (the row exists, created above) and
-- no DELETE policy (see 4b). is_admin_or_owner() is deliberately NOT used — the RBAC
-- table gives admin no /admin/settings access.
CREATE POLICY "owner read settings"   ON settings FOR SELECT USING (is_owner());
CREATE POLICY "owner update settings" ON settings FOR UPDATE USING (is_owner()) WITH CHECK (is_owner());

-- ---------------------------------------------------------------------------
-- 6. GST READ PATH FOR STAFF  (fixes a silent wrong-tax bug)
-- ---------------------------------------------------------------------------
-- /admin/invoices is staff-accessible and invoice generation must read the current
-- GST configuration. With owner-only RLS, a staff SELECT on settings returns ZERO
-- ROWS rather than an error — application code then falls back to a default and
-- issues a tax invoice with NO TAX on a taxable sale, silently.
--
-- This function is the sanctioned read path: SECURITY DEFINER so it works for staff,
-- exposing ONLY the tax fields (never notification numbers or Sheets credentials),
-- and RAISING if the row is missing rather than returning an empty set. A tax
-- document is never generated from assumed values.
CREATE OR REPLACE FUNCTION get_gst_config()
RETURNS TABLE (
  gst_enabled         BOOLEAN,
  gst_rate            NUMERIC(5,2),
  gst_number          TEXT,
  legal_business_name TEXT,
  version             INT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT s.gst_enabled, s.gst_rate, s.gst_number, s.legal_business_name, s.version
    FROM settings s WHERE s.id;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'settings row is missing — refusing to generate a tax document from assumed GST values'
      USING ERRCODE = 'P0002';
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION get_gst_config() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION get_gst_config() TO authenticated;

-- ---------------------------------------------------------------------------
-- 7. WRITE PATH  (optimistic locking)
-- ---------------------------------------------------------------------------
-- Concurrency: two owners (or two browser tabs) editing settings would otherwise
-- last-write-wins, silently discarding the other's change — including a GST rate.
-- SELECT ... FOR UPDATE serializes concurrent callers; the version check then makes
-- the loser fail loudly with a 40001 the API maps to HTTP 409 instead of clobbering.
--
-- SECURITY DEFINER (needed to hold the row lock reliably), therefore the is_owner()
-- check is explicit and first — RLS does not apply inside a definer function.
CREATE OR REPLACE FUNCTION update_settings(
  p_expected_version INT,
  p_patch            JSONB
)
RETURNS settings
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
DECLARE
  v_row settings;
BEGIN
  IF NOT is_owner() THEN
    RAISE EXCEPTION 'Only the owner can change platform settings' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_row FROM settings WHERE id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'settings row is missing' USING ERRCODE = 'P0002';
  END IF;

  IF v_row.version <> p_expected_version THEN
    RAISE EXCEPTION
      'Settings were modified by someone else (expected version %, found %)',
      p_expected_version, v_row.version
      USING ERRCODE = '40001';
  END IF;

  -- COALESCE against the existing value makes this a true PATCH: keys absent from
  -- p_patch are left alone, so a partial update cannot blank unrelated fields.
  UPDATE settings SET
    gst_enabled                  = COALESCE((p_patch->>'gst_enabled')::BOOLEAN,          gst_enabled),
    gst_rate                     = COALESCE((p_patch->>'gst_rate')::NUMERIC(5,2),        gst_rate),
    gst_number                   = COALESCE( p_patch->>'gst_number',                     gst_number),
    legal_business_name          = COALESCE( p_patch->>'legal_business_name',            legal_business_name),
    notifications_enabled        = COALESCE((p_patch->>'notifications_enabled')::BOOLEAN, notifications_enabled),
    notification_whatsapp_number = COALESCE( p_patch->>'notification_whatsapp_number',   notification_whatsapp_number),
    notification_sms_number      = COALESCE( p_patch->>'notification_sms_number',        notification_sms_number),
    sheets_sync_enabled          = COALESCE((p_patch->>'sheets_sync_enabled')::BOOLEAN,  sheets_sync_enabled),
    google_sheets_id             = COALESCE( p_patch->>'google_sheets_id',               google_sheets_id),
    google_service_account_email = COALESCE( p_patch->>'google_service_account_email',   google_service_account_email),
    extras                       = COALESCE( p_patch->'extras',                          extras)
  WHERE id
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

REVOKE EXECUTE ON FUNCTION update_settings(INT, JSONB) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION update_settings(INT, JSONB) TO authenticated;
