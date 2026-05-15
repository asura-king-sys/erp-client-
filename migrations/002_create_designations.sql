-- ============================================================
-- 002_create_designations.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS designations (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    title         VARCHAR(150) NOT NULL UNIQUE,
    department_id UUID         NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    level         SMALLINT     NOT NULL DEFAULT 1,  -- seniority level
    description   TEXT,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- FK index
CREATE INDEX IF NOT EXISTS idx_designations_department_id ON designations (department_id);
CREATE INDEX IF NOT EXISTS idx_designations_is_active     ON designations (is_active);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_designations'
  ) THEN
    CREATE TRIGGER set_updated_at_designations
      BEFORE UPDATE ON designations
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;
