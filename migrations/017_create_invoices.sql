DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_payment_status') THEN
    CREATE TYPE invoice_payment_status AS ENUM ('pending', 'partial', 'paid', 'overdue');
  END IF;
END $$;

CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL DEFAULT 'INV' || LPAD(nextval('invoice_seq')::text, 3, '0'),
  sales_order_id UUID UNIQUE REFERENCES sales_orders(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(15, 2) DEFAULT 0 CHECK (subtotal >= 0),
  tax NUMERIC(15, 2) DEFAULT 0 CHECK (tax >= 0),
  total_amount NUMERIC(15, 2) DEFAULT 0 CHECK (total_amount >= 0),
  amount_paid NUMERIC(15, 2) DEFAULT 0 CHECK (amount_paid >= 0),
  payment_status invoice_payment_status DEFAULT 'pending',
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);
