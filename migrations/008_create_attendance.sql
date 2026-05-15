-- ============================================================
-- 008_create_attendance.sql
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'half_day', 'on_leave', 'holiday', 'weekend');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS attendance (
    id              UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID              NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    work_date       DATE              NOT NULL,
    check_in        TIMESTAMPTZ,
    check_out       TIMESTAMPTZ,
    work_hours      NUMERIC(4,2),     -- computed / overridden
    status          attendance_status NOT NULL DEFAULT 'present',
    notes           TEXT,
    created_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ       NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_attendance UNIQUE (employee_id, work_date),
    CONSTRAINT chk_checkout CHECK (check_out IS NULL OR check_out > check_in)
);

-- FK + filter indexes
CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance (employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_work_date   ON attendance (work_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status      ON attendance (status);
-- Composite: most common query pattern
CREATE INDEX IF NOT EXISTS idx_attendance_emp_date    ON attendance (employee_id, work_date);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_attendance'
  ) THEN
    CREATE TRIGGER set_updated_at_attendance
      BEFORE UPDATE ON attendance
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;
