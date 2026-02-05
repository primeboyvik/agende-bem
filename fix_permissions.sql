/*
  Fix Permissions Script
  Run this in Supabase SQL Editor to ensure the API can access the new table.
*/

-- 1. Grant usage on schema (usually already there but good to be safe)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Grant access to the table
GRANT ALL ON TABLE public.profiles_private TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles_private TO authenticated;

-- 3. Force reload schema cache again
NOTIFY pgrst, 'reload config';
