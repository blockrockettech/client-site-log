-- Create helper function to assign sites to clients
-- This provides a flexible way to assign sites to clients by name

CREATE OR REPLACE FUNCTION assign_sites_to_client(client_name text)
RETURNS TABLE (
    message text,
    sites_updated integer,
    client_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_client_id uuid;
    updated_count integer;
BEGIN
    -- Find client by name (case insensitive, partial match)
    SELECT id INTO target_client_id
    FROM public.profiles 
    WHERE LOWER(full_name) LIKE LOWER('%' || client_name || '%')
    AND role = 'client'
    LIMIT 1;

    -- If not found, return error info
    IF target_client_id IS NULL THEN
        RETURN QUERY SELECT 
            'Client not found. Available clients: ' || 
            string_agg(full_name, ', ') OVER(),
            0::integer,
            NULL::uuid
        FROM public.profiles WHERE role = 'client';
        RETURN;
    END IF;

    -- Update unassigned sites
    UPDATE public.sites 
    SET profile_id = target_client_id,
        updated_at = NOW()
    WHERE profile_id IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;

    -- Return success info
    RETURN QUERY SELECT 
        'Successfully assigned ' || updated_count || ' sites to ' || 
        (SELECT full_name FROM public.profiles WHERE id = target_client_id),
        updated_count,
        target_client_id;
END;
$$;

-- Grant execution to authenticated users (will be restricted by RLS)
GRANT EXECUTE ON FUNCTION assign_sites_to_client(text) TO authenticated;

-- Also create a function to list current site assignments
CREATE OR REPLACE FUNCTION get_site_assignments()
RETURNS TABLE (
    site_id integer,
    site_name text,
    site_address text,
    client_name text,
    client_id uuid
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT 
        s.id as site_id,
        s.site_name,
        s.site_address,
        COALESCE(p.full_name, 'Unassigned') as client_name,
        s.profile_id as client_id
    FROM public.sites s
    LEFT JOIN public.profiles p ON s.profile_id = p.id
    ORDER BY s.site_name;
$$;

GRANT EXECUTE ON FUNCTION get_site_assignments() TO authenticated;
