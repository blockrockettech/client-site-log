-- Verify Test User Emails
-- Marks all test user emails as confirmed

UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  email_change_confirm_status = 1,
  updated_at = NOW()
WHERE email IN ('admin@proclean1987.com', 'staff@proclean1987.com', 'client@proclean1987.com');

-- Verify the changes
SELECT 
  email,
  email_confirmed_at,
  email_change_confirm_status,
  created_at,
  updated_at
FROM auth.users 
WHERE email IN ('admin@proclean1987.com', 'staff@proclean1987.com', 'client@proclean1987.com')
ORDER BY email;
