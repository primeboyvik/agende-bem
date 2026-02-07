
-- Drop both restrictive INSERT policies
DROP POLICY IF EXISTS "Authenticated users can create clients" ON public.clients;
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON public.clients;

-- Create a single PERMISSIVE INSERT policy for authenticated users
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
