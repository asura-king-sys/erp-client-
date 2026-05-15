-- ============================================================
-- 009_create_salary_structures.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS salary_structures (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id      UUID        NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    effective_from   DATE        NOT NULL,
    basic_salary     NUMERIC(12,2) NOT NULL DEFAULT 0,
    hra              NUMERIC(12,2) NOT NULL DEFAULT 0,   -- House Rent Allowance
    ta               NUMERIC(12,2) NOT NULL DEFAULT 0,   -- Travel Allowance
    da               NUMERIC(12,2) NOT NULL DEFAULT 0,   -- Dearness Allowance
    other_allowances NUMERIC(12,2) NOT NULL DEFAULT 0,
    pf_deduction     NUMERIC(12,2) NOT NULL DEFAULT 0,   -- Provident Fund
    esi_deduction    NUMERIC(12,2) NOT NULL DEFAULT 0,   -- ESI
    tds_deduction    NUMERIC(12,2) NOT NULL DEFAULT 0,   -- Tax Deducted at Source
    other_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
    gross_salary     NUMERIC(12,2) GENERATED ALWAYS AS (
                       basic_salary + hra + ta + da + other_allowances
                     ) STORED,
    net_salary       NUMERIC(12,2) GENERATED ALWAYS AS (
                       basic_salary + hra + ta + da + other_allowances
                       - pf_deduction - esi_deduction - tds_deduction - other_deductions
                     ) STORED,
    currency         CHAR(3)     NOT NULL DEFAULT 'INR',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FK index
CREATE INDEX IF NOT EXISTS idx_salary_structures_employee_id    ON salary_structures (employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_structures_effective_from ON salary_structures (effective_from);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_salary_structures'
  ) THEN
    CREATE TRIGGER set_updated_at_salary_structures
      BEFORE UPDATE ON salary_structures
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;
