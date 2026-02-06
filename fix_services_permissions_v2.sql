-- Comprehensive Fix for Service Deletion Permissions

-- 1. Ensure the table exists and permissions are granted
GRANT ALL ON TABLE public.services TO postgres;
GRANT ALL ON TABLE public.services TO authenticated;
GRANT ALL ON TABLE public.services TO service_role;

-- 2. Reset RLS (Disable and Re-enable to clear state)
ALTER TABLE public.services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 3. Drop ALL existing policies to ensure clean slate
DROP POLICY IF EXISTS "Services are viewable by everyone" ON public.services;
DROP POLICY IF EXISTS "Users can insert their own services" ON public.services;
DROP POLICY IF EXISTS "Users can update their own services" ON public.services;
DROP POLICY IF EXISTS "Users can delete their own services" ON public.services;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.services;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.services;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.services;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.services;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.services;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.services;

-- 4. Create Explicit Policies

-- VIEW: Everyone can see services
CREATE POLICY "Services are viewable by everyone" 
ON public.services FOR SELECT 
USING (true);

-- INSERT: Authenticated users can add services (automatically links user_id in app)
CREATE POLICY "Users can insert services" 
ON public.services FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own services
CREATE POLICY "Users can update their own services" 
ON public.services FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- DELETE: Users can delete their own services
CREATE POLICY "Users can delete their own services" 
ON public.services FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 5. Force configuration reload
NOTIFY pgrst, 'reload config';
