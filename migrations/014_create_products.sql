DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
    CREATE TYPE product_status AS ENUM ('active', 'discontinued');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  description TEXT,
  unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
  quantity_in_stock INT DEFAULT 0 CHECK (quantity_in_stock >= 0),
  reorder_level INT DEFAULT 0 CHECK (reorder_level >= 0),
  status product_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_product_id ON products(id);
