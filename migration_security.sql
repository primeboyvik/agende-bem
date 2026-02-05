/*
  Security Migration: Split Profiles into Public and Private Tables
  Run this in Supabase SQL Editor.
*/

-- 1. Create the private profiles table
CREATE TABLE IF NOT EXISTS public.profiles_private (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    phone TEXT,
    cnpj TEXT,
    sex TEXT,
    gender TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS on the new table
ALTER TABLE public.profiles_private ENABLE ROW LEVEL SECURITY;

-- 3. Create strict policies for the private table
-- Only the owner can view their own private data
CREATE POLICY "Users can view own private profile"
ON public.profiles_private FOR SELECT
USING (auth.uid() = user_id);

-- Only the owner can update their own private data
CREATE POLICY "Users can update own private profile"
ON public.profiles_private FOR UPDATE
USING (auth.uid() = user_id);

-- Only the owner can insert their own private data
CREATE POLICY "Users can insert own private profile"
ON public.profiles_private FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Migrate existing data (if any) from profiles to profiles_private
INSERT INTO public.profiles_private (user_id, phone, cnpj, sex, gender)
SELECT user_id, phone, cnpj, sex, gender
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- 5. Drop sensitive columns from the public profiles table
-- WARNING: This deletes the data from the public table. Ensure migration (Step 4) ran successfully.
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS cnpj,
DROP COLUMN IF EXISTS sex,
DROP COLUMN IF EXISTS gender;
