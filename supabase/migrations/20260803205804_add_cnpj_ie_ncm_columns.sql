/*
# Add CNPJ, IE, and NCM columns

## Overview
Adds tax/document fields to clients and company_settings, and an NCM (Mercosul
Common Nomenclature) code field to products.

## 1. Modified Tables

### clients
- `cnpj` (text, default '') — CNPJ or CPF of the customer
- `ie` (text, default '') — Inscrição Estadual (IE)

### company_settings
- `ie` (text, default '') — Inscrição Estadual (IE) of the company

### products
- `ncm` (text, default '') — NCM code (Nomenclatura Comum do Mercosul)

## 2. Security
No changes to RLS — existing policies already allow full CRUD for anon + authenticated.

## 3. Notes
- All new columns are nullable / default to empty string so existing rows are unaffected.
*/

ALTER TABLE clients ADD COLUMN IF NOT EXISTS cnpj text DEFAULT '';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ie text DEFAULT '';

ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS ie text DEFAULT '';

ALTER TABLE products ADD COLUMN IF NOT EXISTS ncm text DEFAULT '';
