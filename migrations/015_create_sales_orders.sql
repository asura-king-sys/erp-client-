DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sales_order_status') THEN
    CREATE TYPE sales_order_status AS ENUM ('draft', 'confirmed', 'shipped', 'delivered', 'cancelled');
  END IF;
END $$;

CREATE SEQUENCE IF NOT EXISTS sales_order_seq START 1;

CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'SO' || LPAD(nextval('sales_order_seq')::text, 3, '0'),
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery_date DATE,
  subtotal NUMERIC(15, 2) DEFAULT 0 CHECK (subtotal >= 0),
  tax NUMERIC(15, 2) DEFAULT 0 CHECK (tax >= 0),
  total_amount NUMERIC(15, 2) DEFAULT 0 CHECK (total_amount >= 0),
  status sales_order_status DEFAULT 'draft',
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_order_date ON sales_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
