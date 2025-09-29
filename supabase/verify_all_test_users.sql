-- Complete Test User Verification
-- Ensures all test users are properly configured for authentication

-- Update all test users to be fully verified
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  email_change_confirm_status = 1,
  last_sign_in_at = NOW(),
  updated_at = NOW()
WHERE email IN ('admin@proclean1987.com', 'staff@proclean1987.com', 'client@proclean1987.com');

-- Ensure profiles exist and are properly configured
INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
SELECT 
  u.id,
  CASE 
    WHEN u.email = 'admin@proclean1987.com' THEN 'Test Admin'
    WHEN u.email = 'staff@proclean1987.com' THEN 'Test Staff'
    WHEN u.email = 'client@proclean1987.com' THEN 'Test Client'
  END,
  CASE 
    WHEN u.email = 'admin@proclean1987.com' THEN 'admin'
    WHEN u.email = 'staff@proclean1987.com' THEN 'staff'
    WHEN u.email = 'client@proclean1987.com' THEN 'client'
  END,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email IN ('admin@proclean1987.com', 'staff@proclean1987.com', 'client@proclean1987.com')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Display verification results
SELECT 
  u.email,
  u.email_confirmed_at,
  u.email_change_confirm_status,
  p.full_name,
  p.role,
  u.last_sign_in_at,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('admin@proclean1987.com', 'staff@proclean1987.com', 'client@proclean1987.com')
ORDER BY p.role;
