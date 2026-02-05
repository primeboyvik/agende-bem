/*
  RPC Workaround Script
  Run this in Supabase SQL Editor.
  This creates functions to handle the private data, bypassing the standard API table cache.
*/

-- 1. Create a function to GET private profile
CREATE OR REPLACE FUNCTION get_private_profile(user_id_input UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with high privileges (be careful!)
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT row_to_json(p) INTO result
    FROM public.profiles_private p
    WHERE p.user_id = user_id_input; -- Allow reading ONLY if matches input
    
    -- Security Check: Ensure the requester is the owner
    -- (auth.uid() is the logged in user)
    IF result IS NOT NULL AND (auth.uid() IS NULL OR auth.uid() != user_id_input) THEN
       -- If security strictness is needed, return NULL or Error.
       -- For now, returning NULL if mismatch to be safe.
       RETURN NULL;
    END IF;

    RETURN result;
END;
$$;

-- 2. Create a function to UPSERT private profile
CREATE OR REPLACE FUNCTION upsert_private_profile(
    p_phone TEXT,
    p_cnpj TEXT,
    p_sex TEXT,
    p_gender TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user ID securely
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    INSERT INTO public.profiles_private (user_id, phone, cnpj, sex, gender, updated_at)
    VALUES (current_user_id, p_phone, p_cnpj, p_sex, p_gender, now())
    ON CONFLICT (user_id)
    DO UPDATE SET
        phone = EXCLUDED.phone,
        cnpj = EXCLUDED.cnpj,
        sex = EXCLUDED.sex,
        gender = EXCLUDED.gender,
        updated_at = now();
END;
$$;

-- 3. Grant access to these functions
GRANT EXECUTE ON FUNCTION get_private_profile(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION upsert_private_profile(TEXT, TEXT, TEXT, TEXT) TO authenticated, service_role;

-- 4. Reload just in case, though RPCs usually appear instantly
NOTIFY pgrst, 'reload config';
