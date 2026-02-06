-- migration_optimization.sql

-- 0. Enable pg_trgm extension for text search (Fixes "operator class does not exist" error)
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA public;

-- 1. Add location columns to profiles for faster filtering (avoiding JSON metadata scan)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS uf text;

-- 2. Create Indexes for search performance
CREATE INDEX IF NOT EXISTS idx_companys_name_trgm ON public.companys USING gin (company_name gin_trgm_ops); -- Efficient text search if pg_trgm available, using btree for now if not
CREATE INDEX IF NOT EXISTS idx_companys_name ON public.companys (company_name);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles (city);
CREATE INDEX IF NOT EXISTS idx_services_user_id ON public.services (user_id);
CREATE INDEX IF NOT EXISTS idx_services_title ON public.services (title);

-- 3. Create Server-Side Search Function
-- This function replaces multiple round-trips to the DB with a single efficient query
CREATE OR REPLACE FUNCTION public.search_companies(search_term text DEFAULT '')
RETURNS TABLE (
  id uuid,
  company_name text,
  full_name text,
  user_type text,
  rating numeric,
  city text,
  profession text,
  image text,
  services text[]
)
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of creator (ensure internal logic is safe)
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.user_id as id,
    c.company_name,
    p.full_name,
    p.user_type,
    5.0::numeric as rating, -- Placeholder for now
    COALESCE(p.city, 'Localização não informada') as city,
    COALESCE(p.profession, 'Prestador de Serviços') as profession,
    -- Try to get an image from their services, or a default
    COALESCE(
        (SELECT image_url FROM public.services s WHERE s.user_id = c.user_id AND image_url IS NOT NULL LIMIT 1),
        'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80'
    ) as image,
    -- Aggregate service titles
    COALESCE(
        ARRAY(
            SELECT title 
            FROM public.services s 
            WHERE s.user_id = c.user_id 
            LIMIT 5
        ),
        ARRAY[]::text[]
    ) as services
  FROM
    public.companys c
  JOIN
    public.profiles p ON c.user_id = p.user_id
  WHERE
    (search_term IS NULL OR search_term = '')
    OR (
      c.company_name ILIKE '%' || search_term || '%' 
      OR p.profession ILIKE '%' || search_term || '%'
      OR p.city ILIKE '%' || search_term || '%'
      OR EXISTS (
          SELECT 1 
          FROM public.services s 
          WHERE s.user_id = c.user_id 
          AND s.description ILIKE '%' || search_term || '%'
      )
    );
END;
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.search_companies(text) TO anon, authenticated, service_role;
