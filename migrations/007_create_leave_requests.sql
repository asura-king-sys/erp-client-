-- ============================================================
-- 007_create_leave_requests.sql
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'leave_request_status') THEN
    CREATE TYPE leave_request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS leave_requests (
    id              UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID                 NOT NULL REFERENCES employees(id)   ON DELETE CASCADE,
    leave_type_id   UUID                 NOT NULL REFERENCES leave_types(id) ON DELETE RESTRICT,
    from_date       DATE                 NOT NULL,
    to_date         DATE                 NOT NULL,
    days_requested  NUMERIC(5,2)         NOT NULL,
    reason          TEXT,
    status          leave_request_status NOT NULL DEFAULT 'pending',
    reviewed_by     UUID                 REFERENCES employees(id) ON DELETE SET NULL,
    reviewed_at     TIMESTAMPTZ,
    reviewer_note   TEXT,
    created_at      TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ          NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_leave_dates CHECK (to_date >= from_date)
);

-- FK + filter indexes
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee_id   ON leave_requests (employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_leave_type_id ON leave_requests (leave_type_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_reviewed_by   ON leave_requests (reviewed_by);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status        ON leave_requests (status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_from_date     ON leave_requests (from_date);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_leave_requests'
  ) THEN
    CREATE TRIGGER set_updated_at_leave_requests
      BEFORE UPDATE ON leave_requests
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;
