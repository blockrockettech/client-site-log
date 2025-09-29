-- Cleanup Test Users
-- Removes all test users and their associated data

-- Delete test visits first (due to foreign key constraints)
DELETE FROM public.visits 
WHERE site_id IN (
  SELECT id FROM public.sites 
  WHERE site_name LIKE 'Test %'
);

-- Delete test sites
DELETE FROM public.sites 
WHERE site_name LIKE 'Test %';

-- Delete test checklists
DELETE FROM public.checklists 
WHERE title = 'Basic Clean';

-- Delete test profiles
DELETE FROM public.profiles 
WHERE full_name LIKE 'Test %';

-- Delete test users from auth.users
DELETE FROM auth.users 
WHERE email IN (
  'admin@proclean1987.com',
  'staff@proclean1987.com', 
  'client@proclean1987.com'
);

-- Display cleanup summary
SELECT 
  'Test data cleanup completed' as status,
  'All test users, sites, and visits have been removed' as message;
