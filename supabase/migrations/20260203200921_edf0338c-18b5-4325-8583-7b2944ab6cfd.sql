-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can create a client" ON public.clients;
DROP POLICY IF EXISTS "Anyone can create an appointment" ON public.appointments;

-- Create more controlled policies for public access
-- For clients: require valid client data
CREATE POLICY "Public can create client with valid data" ON public.clients 
FOR INSERT WITH CHECK (
    name IS NOT NULL AND 
    name <> '' AND 
    email IS NOT NULL AND 
    email <> '' AND
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);

-- For appointments: require valid appointment data with existing client
CREATE POLICY "Public can create appointment with valid data" ON public.appointments 
FOR INSERT WITH CHECK (
    client_id IS NOT NULL AND
    appointment_date >= CURRENT_DATE AND
    EXISTS (SELECT 1 FROM public.clients WHERE id = client_id)
);