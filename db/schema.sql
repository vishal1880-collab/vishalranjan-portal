-- Run this once on your Vercel Postgres database.
-- vercel env pull .env.local && psql $POSTGRES_URL_NON_POOLING -f db/schema.sql

CREATE TABLE IF NOT EXISTS email_requests (
  id              SERIAL PRIMARY KEY,
  desired_username TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  contact_email   TEXT NOT NULL,
  reason          TEXT NOT NULL,
  country         TEXT,
  status          TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected | provisioned
  admin_note      TEXT,
  ip              TEXT,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_requests_status_idx ON email_requests (status);
CREATE INDEX IF NOT EXISTS email_requests_created_idx ON email_requests (created_at DESC);
