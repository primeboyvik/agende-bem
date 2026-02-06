
-- Recreate profiles_public view WITHOUT security_invoker so all users can query it
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public AS
  SELECT user_id, full_name, company_name, user_type, city, profession
  FROM profiles;
