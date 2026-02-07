
-- =============================================
-- FIX CLIENTS TABLE POLICIES
-- =============================================

-- Drop all existing INSERT policies (already handled the restrictive one)
DROP POLICY IF EXISTS "Authenticated users can create clients" ON public.clients;

-- Allow authenticated users to check if a client exists by email (needed for booking flow)
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;

CREATE POLICY "Admins can view all clients"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow authenticated users to SELECT their own client record by email
CREATE POLICY "Users can view client by email"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (email = (current_setting('request.jwt.claims', true)::json->>'email'));

-- Permissive INSERT for authenticated users with validation
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

-- Allow authenticated users to update their own client record
DROP POLICY IF EXISTS "Admins can update clients" ON public.clients;

CREATE POLICY "Admins can update clients"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own client record"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING (email = (current_setting('request.jwt.claims', true)::json->>'email'));

-- =============================================
-- FIX APPOINTMENTS TABLE POLICIES
-- =============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Clients can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Providers can view their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can delete appointments" ON public.appointments;

-- PERMISSIVE INSERT: authenticated users can create appointments
CREATE POLICY "Authenticated users can create appointments"
  ON public.appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IS NOT NULL
    AND appointment_date >= CURRENT_DATE
    AND EXISTS (SELECT 1 FROM clients WHERE clients.id = appointments.client_id)
  );

-- PERMISSIVE SELECT: clients can view their own appointments
CREATE POLICY "Clients can view their own appointments"
  ON public.appointments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clients
      WHERE clients.id = appointments.client_id
      AND clients.email = (current_setting('request.jwt.claims', true)::json->>'email')
    )
  );

-- PERMISSIVE SELECT: providers can view appointments where they are the provider
CREATE POLICY "Providers can view their appointments"
  ON public.appointments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = provider_id);

-- PERMISSIVE SELECT/UPDATE/DELETE for admins
CREATE POLICY "Admins can manage appointments"
  ON public.appointments
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
