-- Add document column to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS document TEXT;

-- Notify to reload schema cache
NOTIFY pgrst, 'reload config';
