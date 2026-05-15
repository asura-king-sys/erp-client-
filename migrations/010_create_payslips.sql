-- ============================================================
-- 010_create_payslips.sql
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payslip_status') THEN
    CREATE TYPE payslip_status AS ENUM ('draft', 'generated', 'paid');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS payslips (
    id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id      UUID           NOT NULL REFERENCES employees(id)          ON DELETE CASCADE,
    salary_struct_id UUID           NOT NULL REFERENCES salary_structures(id)  ON DELETE RESTRICT,
    month            SMALLINT       NOT NULL CHECK (month BETWEEN 1 AND 12),
    year             SMALLINT       NOT NULL,
    working_days     SMALLINT       NOT NULL DEFAULT 0,
    paid_days        SMALLINT       NOT NULL DEFAULT 0,
    basic_salary     NUMERIC(12,2)  NOT NULL,
    hra              NUMERIC(12,2)  NOT NULL DEFAULT 0,
    ta               NUMERIC(12,2)  NOT NULL DEFAULT 0,
    da               NUMERIC(12,2)  NOT NULL DEFAULT 0,
    other_allowances NUMERIC(12,2)  NOT NULL DEFAULT 0,
    pf_deduction     NUMERIC(12,2)  NOT NULL DEFAULT 0,
    esi_deduction    NUMERIC(12,2)  NOT NULL DEFAULT 0,
    tds_deduction    NUMERIC(12,2)  NOT NULL DEFAULT 0,
    other_deductions NUMERIC(12,2)  NOT NULL DEFAULT 0,
    gross_salary     NUMERIC(12,2)  NOT NULL,
    net_salary       NUMERIC(12,2)  NOT NULL,
    status           payslip_status NOT NULL DEFAULT 'draft',
    paid_on          DATE,
    remarks          TEXT,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_payslip UNIQUE (employee_id, month, year)
);

-- FK + filter indexes
CREATE INDEX IF NOT EXISTS idx_payslips_employee_id      ON payslips (employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_salary_struct_id ON payslips (salary_struct_id);
CREATE INDEX IF NOT EXISTS idx_payslips_status           ON payslips (status);
-- Composite for period-based queries
CREATE INDEX IF NOT EXISTS idx_payslips_year_month       ON payslips (year, month);
CREATE INDEX IF NOT EXISTS idx_payslips_emp_year_month   ON payslips (employee_id, year, month);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_payslips'
  ) THEN
    CREATE TRIGGER set_updated_at_payslips
      BEFORE UPDATE ON payslips
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;
