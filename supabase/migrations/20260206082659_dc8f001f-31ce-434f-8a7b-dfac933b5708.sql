
-- Drop the restrictive policy and create a permissive one
DROP POLICY IF EXISTS "Public can create client with valid data" ON public.clients;

CREATE POLICY "Authenticated users can create clients"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    name IS NOT NULL AND name <> '' AND length(name) <= 255
    AND email IS NOT NULL AND email <> '' AND length(email) <= 255
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND (phone IS NULL OR length(phone) <= 20)
  );
