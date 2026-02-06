
-- Create a public view for profile discovery that excludes PII
CREATE VIEW public.profiles_public
WITH (security_invoker = on) AS
  SELECT user_id, full_name, company_name, user_type, city, profession
  FROM public.profiles;

-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create restrictive policies: users see only their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Grant anon SELECT on the public view (for search/discovery)
GRANT SELECT ON public.profiles_public TO anon;
GRANT SELECT ON public.profiles_public TO authenticated;
