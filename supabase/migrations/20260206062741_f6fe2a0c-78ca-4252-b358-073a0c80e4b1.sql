
-- Fix 1: Improve client insert validation with length limits
DROP POLICY IF EXISTS "Public can create client with valid data" ON public.clients;
CREATE POLICY "Public can create client with valid data"
ON public.clients FOR INSERT
WITH CHECK (
  (name IS NOT NULL) 
  AND (name <> ''::text) 
  AND (length(name) <= 255)
  AND (email IS NOT NULL) 
  AND (email <> ''::text) 
  AND (length(email) <= 255)
  AND (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)
  AND (phone IS NULL OR length(phone) <= 20)
);
