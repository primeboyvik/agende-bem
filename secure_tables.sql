-- Security Hardening Script
-- Enables RLS on all public tables and enforces strict policies

-- 1. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companys ENABLE ROW LEVEL SECURITY;

-- 2. Clean up existing policies (to ensure no loop holes)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
DROP POLICY IF EXISTS "Users can insert services" ON public.services;
DROP POLICY IF EXISTS "Users can update their own services" ON public.services;
DROP POLICY IF EXISTS "Users can delete their own services" ON public.services;

DROP POLICY IF EXISTS "Companys are viewable by everyone" ON public.companys;
DROP POLICY IF EXISTS "Users can insert their own company" ON public.companys;
DROP POLICY IF EXISTS "Users can update own company" ON public.companys;

-- 3. PROFILES POLICIES
-- Public Read
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Owner Write (Insert/Update) - No Delete typically for profiles unless account deletion
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- 4. SERVICES POLICIES
-- Public Read
CREATE POLICY "Services are viewable by everyone" 
ON public.services FOR SELECT 
USING (true);

-- Owner Write
CREATE POLICY "Users can insert own services" 
ON public.services FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own services" 
ON public.services FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own services" 
ON public.services FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 5. COMPANYS POLICIES
-- Public Read
CREATE POLICY "Companys are viewable by everyone" 
ON public.companys FOR SELECT 
USING (true);

-- Owner Write
CREATE POLICY "Users can insert own company" 
ON public.companys FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company" 
ON public.companys FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- 6. Reload Config
NOTIFY pgrst, 'reload config';
