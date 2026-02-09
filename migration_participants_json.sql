-- Add participants column to appointments table
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS participants JSONB;

-- Notify to reload schema cache
NOTIFY pgrst, 'reload config';
