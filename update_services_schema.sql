-- Migration script to update services table schema

-- 1. Rename 'title' to 'service_name'
ALTER TABLE public.services 
RENAME COLUMN title TO service_name;

-- 2. Rename 'price' to 'valor'
ALTER TABLE public.services 
RENAME COLUMN price TO valor;

-- 3. Add 'company_name' column
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- 4. Reload Schema Cache (optional but recommended for Supabase/PostgREST)
NOTIFY pgrst, 'reload config';
