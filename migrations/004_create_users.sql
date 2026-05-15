-- ============================================================
-- 004_create_users.sql
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'hr_manager', 'employee');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id     UUID        UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
    username        VARCHAR(100) NOT NULL UNIQUE,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   TEXT         NOT NULL,
    role            user_role    NOT NULL DEFAULT 'employee',
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    refresh_token   TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- FK + filter indexes
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users (employee_id);
CREATE INDEX IF NOT EXISTS idx_users_role        ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_is_active   ON users (is_active);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_users'
  ) THEN
    CREATE TRIGGER set_updated_at_users
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
  END IF;
END $$;
