CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(15, 2) NOT NULL CHECK (unit_price >= 0),
  line_total NUMERIC(15, 2) NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_sales_order_id ON order_items(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
