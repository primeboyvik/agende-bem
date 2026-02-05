/*
  Fix Profiles Script
  Run this in Supabase SQL Editor.
  
  Problem: If the Search is empty, it's likely that the 'profiles' table is missing rows 
  (maybe the automatic trigger failed) or Permissions (RLS) are blocking reading.
*/

-- 1. Backfill Profiles: Create a profile for any user that doesn't have one
INSERT INTO public.profiles (user_id, full_name, user_type, created_at, updated_at)
SELECT 
    id, 
    raw_user_meta_data->>'full_name', 
    COALESCE(raw_user_meta_data->>'user_type', 'usuario'), 
    now(), 
    now()
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles);

-- 2. Fix Permissions: Ensure EVERYONE (public/anon) can read profiles
-- (Search page needs to read profiles without being logged in sometimes, or just general access)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
ON public.profiles FOR SELECT
USING (true);

-- 3. Grant usage just in case
GRANT SELECT ON TABLE public.profiles TO anon, authenticated, service_role;

-- 4. Reload Schema
NOTIFY pgrst, 'reload config';
