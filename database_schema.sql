/* 
  SQL Migration Script for Agende Bem / Pick a Boo
  Run this script in the Supabase SQL Editor.
*/

-- 1. Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'usuario',
ADD COLUMN IF NOT EXISTS sex TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS profession TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;

-- 2. Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS on services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for services
-- Allow everyone to view services (for search)
CREATE POLICY "Services are viewable by everyone" 
ON public.services FOR SELECT 
USING (true);

-- Allow authenticated users to insert their own services
CREATE POLICY "Users can insert their own services" 
ON public.services FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own services
CREATE POLICY "Users can update their own services" 
ON public.services FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow users to delete their own services
CREATE POLICY "Users can delete their own services" 
ON public.services FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Fix RLS for profiles (ensure public read is allowed for search results)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);
