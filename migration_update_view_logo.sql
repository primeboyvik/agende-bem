-- Drop the existing view
DROP VIEW IF EXISTS public.profiles_public;

-- Recreate the view with the new column (logo_url)
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
    user_id, 
    full_name, 
    company_name, 
    city, 
    profession, 
    user_type,
    logo_url,
    business_description
FROM 
    public.profiles;

-- Notify pgrst to reload config
NOTIFY pgrst, 'reload config';
