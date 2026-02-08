
-- Fix clients policies: drop restrictive, recreate as permissive
DROP POLICY IF EXISTS "Authenticated users can create clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view client by email" ON public.clients;
DROP POLICY IF EXISTS "Users can update own client record" ON public.clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can update clients" ON public.clients;
DROP POLICY IF EXISTS "Admins can delete clients" ON public.clients;

CREATE POLICY "Authenticated users can create clients"
ON public.clients FOR INSERT TO authenticated
WITH CHECK (
  (name IS NOT NULL) AND (name <> '') AND (length(name) <= 255)
  AND (email IS NOT NULL) AND (email <> '') AND (length(email) <= 255)
  AND (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
  AND ((phone IS NULL) OR (length(phone) <= 20))
);

CREATE POLICY "Users can view client by email"
ON public.clients FOR SELECT TO authenticated
USING (email = ((current_setting('request.jwt.claims', true))::json ->> 'email'));

CREATE POLICY "Users can update own client record"
ON public.clients FOR UPDATE TO authenticated
USING (email = ((current_setting('request.jwt.claims', true))::json ->> 'email'));

CREATE POLICY "Admins can view all clients"
ON public.clients FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update clients"
ON public.clients FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete clients"
ON public.clients FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Fix appointments policies: drop restrictive, recreate as permissive
DROP POLICY IF EXISTS "Authenticated users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Clients can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Providers can view their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can manage appointments" ON public.appointments;

CREATE POLICY "Authenticated users can create appointments"
ON public.appointments FOR INSERT TO authenticated
WITH CHECK (
  client_id IS NOT NULL
  AND appointment_date >= CURRENT_DATE
  AND EXISTS (SELECT 1 FROM clients WHERE clients.id = appointments.client_id)
);

CREATE POLICY "Clients can view their own appointments"
ON public.appointments FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM clients
  WHERE clients.id = appointments.client_id
  AND clients.email = ((current_setting('request.jwt.claims', true))::json ->> 'email')
));

CREATE POLICY "Providers can view their appointments"
ON public.appointments FOR SELECT TO authenticated
USING (auth.uid() = provider_id);

CREATE POLICY "Admins can manage appointments"
ON public.appointments FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Fix available_slots policies
DROP POLICY IF EXISTS "Anyone can view active slots" ON public.available_slots;
DROP POLICY IF EXISTS "Admins can manage all slots" ON public.available_slots;

CREATE POLICY "Anyone can view active slots"
ON public.available_slots FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage all slots"
ON public.available_slots FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'));
