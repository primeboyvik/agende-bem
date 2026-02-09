-- Add new columns for Company Profile
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_description TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Notify to reload schema cache
NOTIFY pgrst, 'reload config';
