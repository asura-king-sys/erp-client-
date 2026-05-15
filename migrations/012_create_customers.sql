DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_status') THEN
    CREATE TYPE customer_status AS ENUM ('active', 'inactive');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100),
  credit_limit NUMERIC(15, 2) DEFAULT 0 CHECK (credit_limit >= 0),
  status customer_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON customers(id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
