-- ============================================================
-- 006_create_leave_balances.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS leave_balances (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID        NOT NULL REFERENCES employees(id)   ON DELETE CASCADE,
    leave_type_id   UUID        NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
    year            SMALLINT    NOT NULL,
    allocated_days  NUMERIC(5,2) NOT NULL DEFAULT 0,
    used_days       NUMERIC(5,2) NOT NULL DEFAULT 0,
    pending_days    NUMERIC(5,2) NOT NULL DEFAULT 0,  -- requested but not yet approved
    carry_forward   NUMERIC(5,2) NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_leave_balance UNIQUE (employee_id, leave_type_id, year)
);

-- FK + filter indexes
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee_id   ON leave_balances (employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_leave_type_id ON leave_balances (leave_type_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_year          ON leave_balances (year);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_leave_balances'
  ) THEN
    CREATE TRIGGER set_updated_at_leave_balances
      BEFORE UPDATE ON leave_balances
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;
