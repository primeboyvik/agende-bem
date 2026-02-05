/*
  DEBUG SCRIPT: FORCE REBOOT
  Run this entire script to completely reset the private table and force visibility.
*/

-- 1. Drop the table if it exists (RESET)
DROP TABLE IF EXISTS public.profiles_private;

-- 2. Re-create the table from scratch
CREATE TABLE public.profiles_private (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    phone TEXT,
    cnpj TEXT,
    sex TEXT,
    gender TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.profiles_private ENABLE ROW LEVEL SECURITY;

-- 4. GRANT EVERYTHING (DEBUG MODE)
-- We grant access to 'anon' temporarily just to see if it fixes the "table not found" error.
-- Grants to authenticated and service_role as well.
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles_private TO postgres, anon, authenticated, service_role;

-- 5. Create Permissive Policies (DEBUG MODE)
-- Allow "authenticated" users to do ANYTHING for now to rule out RLS issues.
CREATE POLICY "Debug: Allow all for authenticated"
ON public.profiles_private
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. FORCE SCHEMA CACHE RELOAD
-- We run this multiple times just to be angry at it.
NOTIFY pgrst, 'reload config';
