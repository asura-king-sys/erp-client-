DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_type') THEN
    CREATE TYPE payment_method_type AS ENUM ('cash', 'cheque', 'bank_transfer', 'credit_card');
  END IF;
END $$;

CREATE SEQUENCE IF NOT EXISTS payment_seq START 1;

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
  payment_method payment_method_type NOT NULL,
  reference_number VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
