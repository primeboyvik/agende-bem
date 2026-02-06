
-- Add provider_id and service_name columns to appointments
ALTER TABLE public.appointments
  ADD COLUMN provider_id uuid,
  ADD COLUMN service_name text;

-- Make visit_type have a default so it's not required when booking services
ALTER TABLE public.appointments
  ALTER COLUMN visit_type SET DEFAULT 'inspiracao'::visit_type;

-- Update RLS: providers can view appointments made to them
CREATE POLICY "Providers can view their appointments"
  ON public.appointments
  FOR SELECT
  USING (auth.uid() = provider_id);

-- Update RLS: allow insert with provider_id
DROP POLICY IF EXISTS "Public can create appointment with valid data" ON public.appointments;
CREATE POLICY "Authenticated users can create appointments"
  ON public.appointments
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND client_id IS NOT NULL
    AND appointment_date >= CURRENT_DATE
    AND EXISTS (SELECT 1 FROM clients WHERE clients.id = appointments.client_id)
  );
