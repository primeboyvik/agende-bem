-- Add number_of_people column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS number_of_people INTEGER DEFAULT 1;

-- Notify to reload schema cache
NOTIFY pgrst, 'reload config';
