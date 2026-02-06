-- Create a stored procedure (RPC) to delete a service securely
-- Updated to handle type casting (UUID vs TEXT) robustly

CREATE OR REPLACE FUNCTION public.delete_own_service(p_service_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres), bypassing table RLS
AS $$
DECLARE
    v_rows_deleted INT;
    v_user_id UUID;
BEGIN
    -- Get the current authenticated user ID
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
    END IF;

    -- Perform the delete
    -- We cast everything to TEXT to ensure compatibility whether columns are UUID or TEXT
    -- The error 'operator does not exist: text = uuid' happened because user_id column likely is TEXT
    
    DELETE FROM public.services 
    WHERE id::text = p_service_id 
    AND user_id::text = v_user_id::text; 

    GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;

    IF v_rows_deleted > 0 THEN
        RETURN jsonb_build_object('success', true, 'message', 'Service deleted');
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Service not found or permission denied');
    END IF;

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.delete_own_service TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_own_service TO service_role;

-- Reload config
NOTIFY pgrst, 'reload config';
