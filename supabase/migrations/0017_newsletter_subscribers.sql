-- Migration 0017: real storage for the storefront newsletter signup
-- ===========================================================================
-- `components/restaurant/ContactSection.tsx` rendered an email field, showed a
-- "subscribed" confirmation, and threw the address away. The visitor believes
-- they are on a list they are not on.
--
-- WHY NOT `leads`: that table is the right instinct but the wrong shape here.
-- `leads.name` and `leads.phone` are both NOT NULL and `lead_source` has no
-- newsletter member, so an email-only signup can only be forced in by inventing a
-- phone number — which would also corrupt `check_lead_rate_limit`, whose whole
-- mechanism is counting lead rows per phone in a window. A separate, correctly
-- shaped table is cheaper and honest.

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL,
  -- Store the address case-insensitively unique. Citext isn't enabled here, so
  -- normalise on write and enforce uniqueness on the normalised value.
  email_norm    TEXT NOT NULL GENERATED ALWAYS AS (lower(btrim(email))) STORED,
  source        TEXT NOT NULL DEFAULT 'restaurant_contact',
  unsubscribed_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_email_shape CHECK (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_email_norm
  ON newsletter_subscribers(email_norm);

-- Same posture as idempotency_keys / webhook_events / invoice_counters: RLS on,
-- zero policies. The subscriber list is a marketing asset and a privacy liability;
-- no browser session should be able to enumerate it. Writes go through the
-- definer function below, reads through the admin console's service_role.
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE newsletter_subscribers FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- The only write path.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION subscribe_newsletter(
  p_email  TEXT,
  p_source TEXT DEFAULT 'restaurant_contact'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  IF p_email IS NULL OR btrim(p_email) = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  IF btrim(p_email) !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' THEN
    RAISE EXCEPTION 'A valid email address is required';
  END IF;

  IF length(btrim(p_email)) > 254 THEN
    RAISE EXCEPTION 'Email address is too long';
  END IF;

  INSERT INTO newsletter_subscribers (email, source)
  VALUES (btrim(p_email), COALESCE(NULLIF(btrim(p_source), ''), 'restaurant_contact'))
  ON CONFLICT (email_norm) DO UPDATE
    -- Re-subscribing after an unsubscribe should reinstate, not error.
    SET unsubscribed_at = NULL
  RETURNING id INTO v_id;

  INSERT INTO activity_logs (action, entity_type, entity_id, metadata)
  VALUES ('newsletter.subscribed', 'newsletter_subscriber', v_id,
          jsonb_build_object('source', p_source));

  RETURN v_id;
END;
$$;

-- Called from the route handler with the service-role client, not from browsers,
-- so `anon` deliberately gets no EXECUTE here — unlike the enquiry RPCs, this has
-- no rate limiter of its own yet and a public grant would be a free spam endpoint.
GRANT EXECUTE ON FUNCTION subscribe_newsletter(TEXT, TEXT) TO service_role;

-- VERIFICATION (needs a live project):
--   SELECT subscribe_newsletter('a@b.com');            -- returns a uuid
--   SELECT subscribe_newsletter('A@B.com');            -- same row, no duplicate
--   SELECT subscribe_newsletter('nope');               -- raises
--   SELECT count(*) FROM newsletter_subscribers;       -- 1
