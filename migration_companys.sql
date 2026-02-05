-- Migration: Strict 'companys' table
-- Holds only identification for companies, linked to auth.users.

DROP TABLE IF EXISTS public.companys;

CREATE TABLE public.companys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name text NOT NULL,
  cnpj text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT companys_user_id_key UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.companys ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Public Read (For Search visibility)
CREATE POLICY "Public companys are viewable by everyone"
  ON public.companys FOR SELECT
  USING (true);

-- 2. Owner Write (Insert/Update from Profile.tsx)
CREATE POLICY "Compnanies management"
  ON public.companys FOR ALL
  USING (auth.uid() = user_id);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companys TO anon, authenticated, service_role;

-- Force Cache Reload
NOTIFY pgrst, 'reload config';
