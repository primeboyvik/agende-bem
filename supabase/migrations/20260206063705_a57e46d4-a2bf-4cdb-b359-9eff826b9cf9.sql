
-- Revoke excessive privileges from anon role on all public tables
-- Only grant SELECT to anon; authenticated gets full CRUD
REVOKE INSERT, UPDATE, DELETE ON TABLE public.profiles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.services FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.clients FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.appointments FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.available_slots FROM anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.user_roles FROM anon;

-- Ensure anon can still SELECT (needed for public search)
GRANT SELECT ON TABLE public.profiles TO anon;
GRANT SELECT ON TABLE public.services TO anon;
GRANT SELECT ON TABLE public.available_slots TO anon;

-- Ensure authenticated has proper access
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.appointments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.available_slots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_roles TO authenticated;
