/*
  # Motorcycle Workshop Management System - Core Tables

  ## Summary
  Creates the three core tables for MotoShop: products (inventory), sales
  (transactions), and sale_items (line items per transaction).

  ## New Tables

  ### products
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK auth.users) - Owner/workshop account
  - `name` (text) - Product name (e.g., "Engine Oil 4T")
  - `category` (text) - Category (Engine Parts, Brake Parts, etc.)
  - `purchase_price` (numeric) - Cost price
  - `selling_price` (numeric) - Sale price
  - `quantity` (integer) - Current stock count
  - `low_stock_threshold` (integer) - Alert when stock falls below this
  - `supplier` (text) - Optional supplier name
  - `sku` (text) - Optional stock-keeping unit code
  - `description` (text) - Optional product description
  - `created_at`, `updated_at` (timestamptz)

  ### sales
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK auth.users)
  - `total_amount` (numeric) - Total sale value
  - `total_profit` (numeric) - Total profit from sale
  - `currency` (text) - Currency code (PKR, USD, EUR, GBP)
  - `notes` (text) - Optional sale notes
  - `created_at`, `updated_at` (timestamptz)

  ### sale_items
  - `id` (uuid, primary key)
  - `sale_id` (uuid, FK sales) - Parent sale
  - `product_id` (uuid, FK products, nullable) - Reference to product
  - `product_name` (text) - Denormalized product name for history
  - `quantity` (integer) - Quantity sold
  - `unit_price` (numeric) - Selling price at time of sale
  - `purchase_price` (numeric) - Purchase price at time of sale
  - `total` (numeric) - Line total
  - `profit` (numeric) - Line profit
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - products: full CRUD for owner (auth.uid() = user_id)
  - sales: full CRUD for owner
  - sale_items: accessible only through parent sale ownership

  ## Indexes
  - products: user_id, category, quantity
  - sales: user_id, created_at
  - sale_items: sale_id, product_id
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  purchase_price numeric(12,2) NOT NULL DEFAULT 0,
  selling_price numeric(12,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 0,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  supplier text DEFAULT '',
  sku text DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_user_id_idx ON products(user_id);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS products_quantity_idx ON products(quantity);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own products"
  ON products FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  total_profit numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'PKR',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sales_user_id_idx ON sales(user_id);
CREATE INDEX IF NOT EXISTS sales_created_at_idx ON sales(created_at);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sales"
  ON sales FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales"
  ON sales FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales"
  ON sales FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales"
  ON sales FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  purchase_price numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL,
  profit numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sale_items_sale_id_idx ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS sale_items_product_id_idx ON sale_items(product_id);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sale items"
  ON sale_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own sale items"
  ON sale_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own sale items"
  ON sale_items FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
      AND sales.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
    CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sales_updated_at') THEN
    CREATE TRIGGER update_sales_updated_at
      BEFORE UPDATE ON sales
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
