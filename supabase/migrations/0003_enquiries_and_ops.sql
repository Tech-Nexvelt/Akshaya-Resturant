-- Migration 0003: Enquiries and Operational Tables
-- Creates banquet_enquiries, catering_enquiries, leads, invoices, and activity_logs tables.

CREATE TABLE banquet_enquiries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  event_type    TEXT NOT NULL,
  event_date    DATE,
  guest_count   INT CHECK (guest_count > 0),
  budget_range  TEXT,
  notes         TEXT,
  status        enquiry_status NOT NULL DEFAULT 'new',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_banquet_status ON banquet_enquiries(status);

CREATE TABLE catering_enquiries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  event_type    TEXT NOT NULL,
  location      TEXT NOT NULL,
  guest_count   INT CHECK (guest_count > 0),
  event_date    DATE,
  requirements  TEXT,
  status        enquiry_status NOT NULL DEFAULT 'new',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_catering_status ON catering_enquiries(status);

CREATE TABLE leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  source      lead_source NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

CREATE TABLE invoices (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID REFERENCES orders(id) ON DELETE SET NULL,
  banquet_enquiry_id    UUID REFERENCES banquet_enquiries(id) ON DELETE SET NULL,
  catering_enquiry_id   UUID REFERENCES catering_enquiries(id) ON DELETE SET NULL,
  invoice_type          invoice_type NOT NULL,
  invoice_number        TEXT NOT NULL UNIQUE,
  gst_applicable        BOOLEAN NOT NULL DEFAULT false,
  gst_amount            NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount          NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  pdf_url               TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT invoice_has_one_source CHECK (
    num_nonnulls(order_id, banquet_enquiry_id, catering_enquiry_id) = 1
  )
);

CREATE TABLE activity_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    UUID,
  metadata     JSONB NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_created_at ON activity_logs(created_at DESC);
