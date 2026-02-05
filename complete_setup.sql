/*
  COMPLETE SETUP SCRIPT (Run this in the new Supabase SQL Editor)
  
  This script sets up the entire database structure for the application.
  It includes:
  1. Tables (profiles, services, appointments, etc.)
  2. Functions (handle_new_user)
  3. Security Policies (RLS)
  4. Permissions (Grants)
*/

-- 1. Create PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  user_type TEXT DEFAULT 'usuario', -- 'usuario', 'empresa', 'prestador'
  company_name TEXT,
  profession TEXT,
  city TEXT,
  phone TEXT, -- Keeping these columns for structure, though we sync sensitive data to metadata too
  cnpj TEXT,
  sex TEXT,
  gender TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create SERVICES table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 4. Policies for PROFILES
-- Everyone can view profiles (needed for Search)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING ((select auth.uid()) = user_id);

-- 5. Policies for SERVICES
-- Everyone can view services
DROP POLICY IF EXISTS "Public services are viewable by everyone" ON public.services;
CREATE POLICY "Public services are viewable by everyone" 
ON public.services FOR SELECT USING (true);

-- Businesses can insert/update/delete their services
DROP POLICY IF EXISTS "Users can manage own services" ON public.services;
CREATE POLICY "Users can manage own services" 
ON public.services FOR ALL USING ((select auth.uid()) = user_id);

-- 6. Grant Permissions (Fixes "permission denied" / "table not found" for anonymous/public)
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO postgres, anon, authenticated, service_role;
GRANT ALL ON TABLE public.services TO postgres, anon, authenticated, service_role;

-- 7. Sync Trigger (Optional but good) - Syncs new users to profiles automatically
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, user_type)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE(new.raw_user_meta_data->>'user_type', 'usuario'))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Backfill Trigger (Run once for existing users)
INSERT INTO public.profiles (user_id, full_name, user_type, created_at, updated_at)
SELECT 
    id, 
    raw_user_meta_data->>'full_name', 
    COALESCE(raw_user_meta_data->>'user_type', 'usuario'), 
    now(), 
    now()
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT DO NOTHING;

-- Force Cache Reload
NOTIFY pgrst, 'reload config';
