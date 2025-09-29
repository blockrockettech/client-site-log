-- Test Users Creation Script
-- Creates test users for development and testing
-- Run this in the Supabase SQL Editor

-- Clean up any existing test data
DELETE FROM public.visits WHERE site_id IN (SELECT id FROM public.sites WHERE site_name LIKE 'Test %');
DELETE FROM public.sites WHERE site_name LIKE 'Test %';
DELETE FROM public.checklists WHERE title = 'Basic Clean';
DELETE FROM public.profiles WHERE full_name LIKE 'Test %';
DELETE FROM auth.users WHERE email IN ('admin@proclean1987.com', 'staff@proclean1987.com', 'client@proclean1987.com');

-- Create test users with minimal required fields
-- Admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@proclean1987.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Test Admin", "role": "admin"}',
  false,
  NOW()
);

-- Staff user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'staff@proclean1987.com',
  crypt('staff123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Test Staff", "role": "staff"}',
  false,
  NOW()
);

-- Client user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'client@proclean1987.com',
  crypt('client123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Test Client", "role": "client"}',
  false,
  NOW()
);

-- Ensure profiles exist (in case trigger doesn't fire)
-- Admin profile
INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
SELECT 
  u.id,
  'Test Admin',
  'admin',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'admin@proclean1987.com'
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Test Admin',
  role = 'admin',
  updated_at = NOW();

-- Staff profile
INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
SELECT 
  u.id,
  'Test Staff',
  'staff',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'staff@proclean1987.com'
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Test Staff',
  role = 'staff',
  updated_at = NOW();

-- Client profile
INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
SELECT 
  u.id,
  'Test Client',
  'client',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'client@proclean1987.com'
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Test Client',
  role = 'client',
  updated_at = NOW();

-- Create test data
-- Test sites for the client
INSERT INTO public.sites (
  site_name,
  site_address,
  profile_id,
  visit_day,
  visit_time,
  created_at,
  updated_at
) VALUES (
  'Test Office Building',
  '123 Business Street, City, State 12345',
  (SELECT id FROM auth.users WHERE email = 'client@proclean1987.com'),
  'mon',
  '09:00',
  NOW(),
  NOW()
), (
  'Test Warehouse',
  '456 Industrial Ave, City, State 12345',
  (SELECT id FROM auth.users WHERE email = 'client@proclean1987.com'),
  'wed',
  '14:00',
  NOW(),
  NOW()
);

-- Test checklist
INSERT INTO public.checklists (
  title,
  items,
  created_at,
  updated_at
) VALUES (
  'Basic Clean',
  '[
    {"id": 1, "task": "Vacuum all carpets", "completed": false},
    {"id": 2, "task": "Clean restrooms", "completed": false},
    {"id": 3, "task": "Empty trash bins", "completed": false},
    {"id": 4, "task": "Wipe down surfaces", "completed": false}
  ]'::jsonb,
  NOW(),
  NOW()
);

-- Assign checklist to test sites
UPDATE public.sites 
SET checklist_id = (SELECT id FROM public.checklists WHERE title = 'Basic Clean' LIMIT 1)
WHERE site_name IN ('Test Office Building', 'Test Warehouse');

-- Test visit
INSERT INTO public.visits (
  site_id,
  profile_id,
  checklist_id,
  visit_date,
  visit_checkin_time,
  visit_checkout_time,
  notes,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM public.sites WHERE site_name = 'Test Office Building' LIMIT 1),
  (SELECT id FROM auth.users WHERE email = 'staff@proclean1987.com'),
  (SELECT id FROM public.checklists WHERE title = 'Basic Clean' LIMIT 1),
  CURRENT_DATE,
  NOW(),
  NOW() + INTERVAL '2 hours',
  'Completed: 2/4 items
- Vacuumed all carpets ✓
- Cleaned restrooms ✓
- Trash bins need attention
- Surfaces wiped down

Overall: Good progress, will complete remaining tasks next visit.',
  NOW(),
  NOW()
);

-- Display the created test users
SELECT 
  u.email,
  p.full_name,
  p.role,
  u.created_at as user_created,
  u.email_confirmed_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('admin@proclean1987.com', 'staff@proclean1987.com', 'client@proclean1987.com')
ORDER BY p.role;

-- Display test data summary
SELECT 
  'Test Users Created' as summary,
  COUNT(*) as count
FROM public.profiles 
WHERE full_name LIKE 'Test %'

UNION ALL

SELECT 
  'Test Sites Created' as summary,
  COUNT(*) as count
FROM public.sites 
WHERE site_name LIKE 'Test %'

UNION ALL

SELECT 
  'Test Visits Created' as summary,
  COUNT(*) as count
FROM public.visits v
JOIN public.sites s ON v.site_id = s.id
WHERE s.site_name LIKE 'Test %';
