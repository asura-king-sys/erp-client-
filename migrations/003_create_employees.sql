-- ============================================================
-- 003_create_employees.sql
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employee_status') THEN
    CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'on_leave', 'terminated');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
    CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS employees (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code   VARCHAR(20)     NOT NULL UNIQUE,
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    phone           VARCHAR(20),
    date_of_birth   DATE,
    gender          gender_type,
    address         TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100)    NOT NULL DEFAULT 'India',
    pin_code        VARCHAR(10),
    department_id   UUID            NOT NULL REFERENCES departments(id)  ON DELETE RESTRICT,
    designation_id  UUID            NOT NULL REFERENCES designations(id) ON DELETE RESTRICT,
    manager_id      UUID            REFERENCES employees(id)             ON DELETE SET NULL,
    date_of_joining DATE            NOT NULL,
    date_of_leaving DATE,
    status          employee_status NOT NULL DEFAULT 'active',
    profile_photo   TEXT,           -- URL / file path
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- FK indexes
CREATE INDEX IF NOT EXISTS idx_employees_department_id  ON employees (department_id);
CREATE INDEX IF NOT EXISTS idx_employees_designation_id ON employees (designation_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id     ON employees (manager_id);
-- Commonly filtered
CREATE INDEX IF NOT EXISTS idx_employees_status         ON employees (status);
CREATE INDEX IF NOT EXISTS idx_employees_email          ON employees (email);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_employees'
  ) THEN
    CREATE TRIGGER set_updated_at_employees
      BEFORE UPDATE ON employees
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;
