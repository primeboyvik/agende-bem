-- Check policies on companys table
SELECT * FROM pg_policies WHERE tablename = 'companys';

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'companys';

-- Try to select as anon (simulation)
-- Note: This simulation is limited in SQL editor, strict test is via API.
SET ROLE anon;
SELECT count(*) FROM public.companys;
RESET ROLE;
