-- CI Test Database Initialization Script
-- Provision Supabase roles and auth schema primitives for standard Postgres:16 containers.

CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN;

CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Mock auth.uid() and auth.jwt() for SQL unit testing
CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),
    '00000000-0000-0000-0000-000000000000'
  )::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION auth.role() RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    NULLIF(current_setting('request.jwt.claim.role', true), ''),
    'anon'
  );
END;
$$ LANGUAGE plpgsql STABLE;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO anon, authenticated, service_role;
