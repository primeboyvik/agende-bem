-- Fix RLS Policies for 'services' table

-- 1. Enable RLS (just in case)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.services;
DROP POLICY IF EXISTS "Users can insert their own services" ON public.services;
DROP POLICY IF EXISTS "Users can update their own services" ON public.services;
DROP POLICY IF EXISTS "Users can delete their own services" ON public.services;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.services;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.services;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.services;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.services;

-- 3. Create permissive policies for development/production
-- Allow anyone to view services
CREATE POLICY "Services are viewable by everyone" 
ON public.services FOR SELECT 
USING (true);

-- Allow authenticated users to insert their own services
CREATE POLICY "Users can insert their own services" 
ON public.services FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own services
CREATE POLICY "Users can update their own services" 
ON public.services FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow users to delete their own services
CREATE POLICY "Users can delete their own services" 
ON public.services FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 4. Reload configuration
NOTIFY pgrst, 'reload config';
