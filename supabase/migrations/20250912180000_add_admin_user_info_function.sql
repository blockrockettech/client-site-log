-- Create a function that allows admins to get user auth information
CREATE OR REPLACE FUNCTION get_user_auth_info()
RETURNS TABLE (
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  email_confirmed_at timestamptz
)
LANGUAGE sql
SECURITY definer -- Run with function owner's privileges
AS $$
  SELECT 
    au.id as user_id,
    au.email::text,
    au.created_at,
    au.last_sign_in_at,
    au.email_confirmed_at
  FROM auth.users au
  WHERE EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  );
$$;

-- Grant execute permission to authenticated users (will be filtered by admin check inside function)
GRANT EXECUTE ON FUNCTION get_user_auth_info() TO authenticated;
