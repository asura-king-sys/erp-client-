-- ============================================================
-- 005_create_leave_types.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS leave_types (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(100) NOT NULL UNIQUE,
    code           VARCHAR(20)  NOT NULL UNIQUE,
    days_allowed   SMALLINT     NOT NULL DEFAULT 0,
    description    TEXT,
    is_paid        BOOLEAN      NOT NULL DEFAULT TRUE,
    carry_forward  BOOLEAN      NOT NULL DEFAULT FALSE,
    is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leave_types_is_active ON leave_types (is_active);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_leave_types'
  ) THEN
    CREATE TRIGGER set_updated_at_leave_types
      BEFORE UPDATE ON leave_types
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;
