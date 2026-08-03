/*
# Create core application tables for OrçaFácil

## Overview
Creates the full schema for the BizFlow/OrçaFácil dashboard: clients, products,
company settings, quotes, and quote items. This is a single-tenant app with no
sign-in screen, so all policies allow anon + authenticated CRUD (the data is
intentionally shared/public).

## 1. New Tables

### clients
- `id` (uuid, primary key, auto-generated)
- `name` (text, not null) — full name of the customer
- `email` (text) — contact email
- `phone` (text) — phone number
- `address` (text) — street address
- `notes` (text) — free-form observations
- `created_at` (timestamptz, default now)

### products
- `id` (uuid, primary key, auto-generated)
- `name` (text, not null) — product title
- `description` (text) — detailed description
- `price` (numeric, not null, default 0) — unit price in BRL
- `image_url` (text) — URL to product image (Supabase Storage or external)
- `created_at` (timestamptz, default now)

### company_settings
- `id` (uuid, primary key, auto-generated)
- `company_name` (text) — trade name / legal name
- `cnpj` (text) — CNPJ or CPF
- `phone` (text) — contact phone
- `email` (text) — contact email
- `address` (text) — full address
- `logo_url` (text) — URL to company logo

### quotes
- `id` (uuid, primary key, auto-generated)
- `numero` (integer, not null) — sequential quote number for display
- `client_id` (uuid, foreign key → clients.id, ON DELETE CASCADE)
- `status` (text, not null, default 'Pendente') — one of Pendente/Aprovado/Recusado
- `total_amount` (numeric, not null, default 0) — snapshot of total value
- `data` (date, not null, default today) — issue date
- `valid_until` (date) — quote validity date
- `notes` (text) — payment conditions / observations
- `created_at` (timestamptz, default now)

### quote_items
- `id` (uuid, primary key, auto-generated)
- `quote_id` (uuid, foreign key → quotes.id, ON DELETE CASCADE)
- `product_id` (uuid, foreign key → products.id, ON DELETE CASCADE)
- `quantity` (integer, not null, default 1)
- `unit_price` (numeric, not null, default 0) — price snapshot at time of quote

## 2. Indexes
- `quotes.client_id` — frequent join/filter
- `quote_items.quote_id` — frequent join/filter
- `quote_items.product_id` — frequent join/filter

## 3. Security (RLS)
All tables have RLS enabled. Because this is a single-tenant app with no sign-in,
every policy uses `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
— the data is intentionally public/shared.

## 4. Notes
- `unit_price` and `total_amount` are snapshots stored at creation time so the
  quote document never changes even if product prices are updated later.
- `numero` auto-increments from 1001 via a trigger-safe application convention
  (the app computes the next number as max(existing) + 1).
*/

-- ============ clients ============
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_clients" ON clients;
CREATE POLICY "anon_select_clients" ON clients FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_clients" ON clients;
CREATE POLICY "anon_insert_clients" ON clients FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_clients" ON clients;
CREATE POLICY "anon_update_clients" ON clients FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_clients" ON clients;
CREATE POLICY "anon_delete_clients" ON clients FOR DELETE
  TO anon, authenticated USING (true);

-- ============ products ============
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(12,2) NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE
  TO anon, authenticated USING (true);

-- ============ company_settings ============
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text DEFAULT '',
  cnpj text DEFAULT '',
  phone text DEFAULT '',
  email text DEFAULT '',
  address text DEFAULT '',
  logo_url text DEFAULT ''
);

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_company" ON company_settings;
CREATE POLICY "anon_select_company" ON company_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_company" ON company_settings;
CREATE POLICY "anon_insert_company" ON company_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_company" ON company_settings;
CREATE POLICY "anon_update_company" ON company_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_company" ON company_settings;
CREATE POLICY "anon_delete_company" ON company_settings FOR DELETE
  TO anon, authenticated USING (true);

-- ============ quotes ============
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero integer NOT NULL DEFAULT 1001,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'Pendente',
  total_amount numeric(12,2) NOT NULL DEFAULT 0,
  data date NOT NULL DEFAULT CURRENT_DATE,
  valid_until date,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quotes" ON quotes;
CREATE POLICY "anon_select_quotes" ON quotes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_quotes" ON quotes;
CREATE POLICY "anon_insert_quotes" ON quotes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_quotes" ON quotes;
CREATE POLICY "anon_update_quotes" ON quotes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_quotes" ON quotes;
CREATE POLICY "anon_delete_quotes" ON quotes FOR DELETE
  TO anon, authenticated USING (true);

-- ============ quote_items ============
CREATE TABLE IF NOT EXISTS quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(12,2) NOT NULL DEFAULT 0
);

ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_quote_items" ON quote_items;
CREATE POLICY "anon_select_quote_items" ON quote_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_quote_items" ON quote_items;
CREATE POLICY "anon_insert_quote_items" ON quote_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_quote_items" ON quote_items;
CREATE POLICY "anon_update_quote_items" ON quote_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_quote_items" ON quote_items;
CREATE POLICY "anon_delete_quote_items" ON quote_items FOR DELETE
  TO anon, authenticated USING (true);

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_product_id ON quote_items(product_id);
