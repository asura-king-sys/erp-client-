-- ============================================================
-- 001_create_departments.sql
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() (idempotent)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS departments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL UNIQUE,
    code        VARCHAR(20)  NOT NULL UNIQUE,
    description TEXT,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index on name for lookups / searches
CREATE INDEX IF NOT EXISTS idx_departments_name      ON departments (name);
CREATE INDEX IF NOT EXISTS idx_departments_is_active ON departments (is_active);

-- Trigger: keep updated_at fresh on every UPDATE
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_updated_at_departments'
  ) THEN
    CREATE TRIGGER set_updated_at_departments
      BEFORE UPDATE ON departments
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;
