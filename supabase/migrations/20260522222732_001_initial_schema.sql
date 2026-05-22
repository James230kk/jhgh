/*
  # Initial Schema for SAM PRO Accounting System
  
  1. New Tables
    - `customers` - Customer management with credit limits and balances
    - `suppliers` - Supplier management with credit limits and balances
    - `products` - Product/Item inventory with stock tracking
    - `warehouses` - Warehouse locations
    - `inventory_transactions` - Stock movement tracking
    - `sales_invoices` - Sales invoice records
    - `sales_invoice_items` - Individual items in sales invoices
    - `purchase_invoices` - Purchase invoice records
    - `purchase_invoice_items` - Individual items in purchase invoices
    - `receipts` - Payment received from customers
    - `payments` - Payments made to suppliers
    - `journal_entries` - General journal entries
  
  2. Security
    - Enable RLS on all tables
    - Restrict access to authenticated users only
    - Users can only access their own data (based on user_id)
  
  3. Important Notes
    - All tables include created_at and updated_at timestamps
    - Soft delete using deleted_at column
    - Arabic-friendly text fields
    - Financial tracking with proper decimal precision
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sequences first
CREATE SEQUENCE IF NOT EXISTS customers_code_seq;
CREATE SEQUENCE IF NOT EXISTS suppliers_code_seq;

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE DEFAULT ('C-' || to_char(nextval('customers_code_seq'), 'FM00000')),
  phone text,
  email text,
  address text,
  city text,
  credit_limit numeric(15,2) DEFAULT 0,
  current_balance numeric(15,2) DEFAULT 0,
  notes text,
  is_active boolean DEFAULT true,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE DEFAULT ('S-' || to_char(nextval('suppliers_code_seq'), 'FM00000')),
  phone text,
  email text,
  address text,
  city text,
  credit_limit numeric(15,2) DEFAULT 0,
  current_balance numeric(15,2) DEFAULT 0,
  notes text,
  is_active boolean DEFAULT true,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  barcode text,
  description text,
  category text,
  unit text DEFAULT 'piece',
  cost_price numeric(15,2) DEFAULT 0,
  selling_price numeric(15,2) DEFAULT 0,
  current_stock numeric(15,2) DEFAULT 0,
  min_stock numeric(15,2) DEFAULT 0,
  max_stock numeric(15,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Warehouses Table
CREATE TABLE IF NOT EXISTS warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  location text,
  is_active boolean DEFAULT true,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Inventory Transactions Table
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id uuid REFERENCES warehouses(id) ON DELETE CASCADE,
  transaction_type text NOT NULL,
  quantity numeric(15,2) NOT NULL,
  unit_cost numeric(15,2) DEFAULT 0,
  reference_type text,
  reference_id uuid,
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Sales Invoices Table
CREATE TABLE IF NOT EXISTS sales_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  subtotal numeric(15,2) DEFAULT 0,
  discount numeric(15,2) DEFAULT 0,
  tax numeric(15,2) DEFAULT 0,
  total numeric(15,2) DEFAULT 0,
  paid_amount numeric(15,2) DEFAULT 0,
  status text DEFAULT 'pending',
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Sales Invoice Items Table
CREATE TABLE IF NOT EXISTS sales_invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES sales_invoices(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity numeric(15,2) NOT NULL,
  unit_price numeric(15,2) NOT NULL,
  discount numeric(15,2) DEFAULT 0,
  total numeric(15,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Purchase Invoices Table
CREATE TABLE IF NOT EXISTS purchase_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  subtotal numeric(15,2) DEFAULT 0,
  discount numeric(15,2) DEFAULT 0,
  tax numeric(15,2) DEFAULT 0,
  total numeric(15,2) DEFAULT 0,
  paid_amount numeric(15,2) DEFAULT 0,
  status text DEFAULT 'pending',
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

-- Purchase Invoice Items Table
CREATE TABLE IF NOT EXISTS purchase_invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES purchase_invoices(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity numeric(15,2) NOT NULL,
  unit_cost numeric(15,2) NOT NULL,
  discount numeric(15,2) DEFAULT 0,
  total numeric(15,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Receipts (سندات القبض)
CREATE TABLE IF NOT EXISTS receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  receipt_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric(15,2) NOT NULL,
  payment_method text DEFAULT 'cash',
  reference_type text,
  reference_id uuid,
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Payments (سندات الدفع)
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number text UNIQUE NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric(15,2) NOT NULL,
  payment_method text DEFAULT 'cash',
  reference_type text,
  reference_id uuid,
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Journal Entries (دفتر اليومية)
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number text UNIQUE NOT NULL,
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  description text NOT NULL,
  reference_type text,
  reference_id uuid,
  debit_account text,
  credit_account text,
  amount numeric(15,2) NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Users can view own customers"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for suppliers
CREATE POLICY "Users can view own suppliers"
  ON suppliers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own suppliers"
  ON suppliers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own suppliers"
  ON suppliers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own suppliers"
  ON suppliers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for products
CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for warehouses
CREATE POLICY "Users can view own warehouses"
  ON warehouses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own warehouses"
  ON warehouses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own warehouses"
  ON warehouses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own warehouses"
  ON warehouses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for inventory_transactions
CREATE POLICY "Users can view own inventory transactions"
  ON inventory_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory transactions"
  ON inventory_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for sales_invoices
CREATE POLICY "Users can view own sales invoices"
  ON sales_invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales invoices"
  ON sales_invoices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales invoices"
  ON sales_invoices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales invoices"
  ON sales_invoices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for sales_invoice_items
CREATE POLICY "Users can view own sales invoice items"
  ON sales_invoice_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales_invoices
      WHERE sales_invoices.id = sales_invoice_items.invoice_id
      AND sales_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own sales invoice items"
  ON sales_invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales_invoices
      WHERE sales_invoices.id = sales_invoice_items.invoice_id
      AND sales_invoices.user_id = auth.uid()
    )
  );

-- RLS Policies for purchase_invoices
CREATE POLICY "Users can view own purchase invoices"
  ON purchase_invoices FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchase invoices"
  ON purchase_invoices FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchase invoices"
  ON purchase_invoices FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own purchase invoices"
  ON purchase_invoices FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for purchase_invoice_items
CREATE POLICY "Users can view own purchase invoice items"
  ON purchase_invoice_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM purchase_invoices
      WHERE purchase_invoices.id = purchase_invoice_items.invoice_id
      AND purchase_invoices.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own purchase invoice items"
  ON purchase_invoice_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM purchase_invoices
      WHERE purchase_invoices.id = purchase_invoice_items.invoice_id
      AND purchase_invoices.user_id = auth.uid()
    )
  );

-- RLS Policies for receipts
CREATE POLICY "Users can view own receipts"
  ON receipts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts"
  ON receipts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own receipts"
  ON receipts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own receipts"
  ON receipts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payments"
  ON payments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for journal_entries
CREATE POLICY "Users can view own journal entries"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal entries"
  ON journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_is_active ON customers(is_active);

CREATE INDEX IF NOT EXISTS idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers(is_active);

CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);

CREATE INDEX IF NOT EXISTS idx_inventory_trans_product ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_trans_user ON inventory_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_sales_invoices_user ON sales_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_customer ON sales_invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_date ON sales_invoices(invoice_date);

CREATE INDEX IF NOT EXISTS idx_purchase_invoices_user ON purchase_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_invoices_supplier ON purchase_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_invoices_date ON purchase_invoices(invoice_date);

CREATE INDEX IF NOT EXISTS idx_receipts_user ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_customer ON receipts(customer_id);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(receipt_date);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_supplier ON payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
