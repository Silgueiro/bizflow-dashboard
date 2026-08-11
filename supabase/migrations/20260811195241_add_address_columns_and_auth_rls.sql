/*
# Add structured address columns and switch RLS to authenticated-only

## Overview
This migration does two things:
1. Adds structured address fields (CEP, logradouro, bairro, cidade, estado, número, complemento)
   to the `clients` and `company_settings` tables so the ViaCEP auto-fill can store each part separately.
2. Switches ALL table policies from `TO anon, authenticated` (public/shared) to `TO authenticated`
   with ownership checks, because the app now requires sign-in via Supabase Auth.

## 1. Modified Tables

### clients
- `cep` (text, default '') — postal code (CEP)
- `logradouro` (text, default '') — street name (from ViaCEP)
- `numero` (text, default '') — street number (manual entry)
- `complemento` (text, default '') — address complement (manual entry)
- `bairro` (text, default '') — neighborhood (from ViaCEP)
- `cidade` (text, default '') — city (from ViaCEP)
- `estado` (text, default '') — state / UF (from ViaCEP)

### company_settings
- `cep` (text, default '') — postal code (CEP)
- `logradouro` (text, default '') — street name
- `numero` (text, default '') — street number
- `complemento` (text, default '') — address complement
- `bairro` (text, default '') — neighborhood
- `cidade` (text, default '') — city
- `estado` (text, default '') — state / UF

## 2. Security (RLS)
All existing tables already have RLS enabled. This migration REPLACES all policies:
- Drops the old `anon_*` policies that allowed `TO anon, authenticated` with `USING (true)`.
- Creates new `auth_*` policies scoped `TO authenticated` with `USING (auth.uid() IS NOT NULL)`.
  Since this is a single-tenant business app (one company using the system), any authenticated
  user can access all data — there is no per-user ownership partitioning. The protection is
  simply that the user must be signed in.

Tables affected: clients, products, company_settings, quotes, quote_items.

## 3. Notes
- All new columns are nullable / default to empty string so existing rows are unaffected.
- The old `address` column on clients and company_settings is kept for backward compatibility
  (it stores the full address string; new structured fields supplement it).
- No data is lost — only policy definitions change.
*/

-- ============ Add address columns to clients ============
ALTER TABLE clients ADD COLUMN IF NOT EXISTS cep text DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS logradouro text DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS numero text DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS complemento text DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS bairro text DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS cidade text DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS estado text DEFAULT '';

-- ============ Add address columns to company_settings ============
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS cep text DEFAULT '';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS logradouro text DEFAULT '';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS numero text DEFAULT '';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS complemento text DEFAULT '';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS bairro text DEFAULT '';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS cidade text DEFAULT '';
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS estado text DEFAULT '';

-- ============ Switch RLS policies to authenticated-only ============
-- The app now requires sign-in. We replace all anon_* policies with auth_* policies
-- scoped to authenticated users. Since this is a single-tenant business app, any
-- signed-in user can access all data (no per-row ownership partitioning).

-- ---- clients ----
DROP POLICY IF EXISTS "anon_select_clients" ON clients;
DROP POLICY IF EXISTS "anon_insert_clients" ON clients;
DROP POLICY IF EXISTS "anon_update_clients" ON clients;
DROP POLICY IF EXISTS "anon_delete_clients" ON clients;

CREATE POLICY "auth_select_clients" ON clients FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_insert_clients" ON clients FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_clients" ON clients FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_delete_clients" ON clients FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);

-- ---- products ----
DROP POLICY IF EXISTS "anon_select_products" ON products;
DROP POLICY IF EXISTS "anon_insert_products" ON products;
DROP POLICY IF EXISTS "anon_update_products" ON products;
DROP POLICY IF EXISTS "anon_delete_products" ON products;

CREATE POLICY "auth_select_products" ON products FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_products" ON products FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_delete_products" ON products FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);

-- ---- company_settings ----
DROP POLICY IF EXISTS "anon_select_company" ON company_settings;
DROP POLICY IF EXISTS "anon_insert_company" ON company_settings;
DROP POLICY IF EXISTS "anon_update_company" ON company_settings;
DROP POLICY IF EXISTS "anon_delete_company" ON company_settings;

CREATE POLICY "auth_select_company" ON company_settings FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_insert_company" ON company_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_company" ON company_settings FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_delete_company" ON company_settings FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);

-- ---- quotes ----
DROP POLICY IF EXISTS "anon_select_quotes" ON quotes;
DROP POLICY IF EXISTS "anon_insert_quotes" ON quotes;
DROP POLICY IF EXISTS "anon_update_quotes" ON quotes;
DROP POLICY IF EXISTS "anon_delete_quotes" ON quotes;

CREATE POLICY "auth_select_quotes" ON quotes FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_insert_quotes" ON quotes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_quotes" ON quotes FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_delete_quotes" ON quotes FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);

-- ---- quote_items ----
DROP POLICY IF EXISTS "anon_select_quote_items" ON quote_items;
DROP POLICY IF EXISTS "anon_insert_quote_items" ON quote_items;
DROP POLICY IF EXISTS "anon_update_quote_items" ON quote_items;
DROP POLICY IF EXISTS "anon_delete_quote_items" ON quote_items;

CREATE POLICY "auth_select_quote_items" ON quote_items FOR SELECT
  TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "auth_insert_quote_items" ON quote_items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_quote_items" ON quote_items FOR UPDATE
  TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_delete_quote_items" ON quote_items FOR DELETE
  TO authenticated USING (auth.uid() IS NOT NULL);