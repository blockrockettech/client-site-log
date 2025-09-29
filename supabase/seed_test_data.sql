-- Seed Test Data Script
-- Creates comprehensive test data for client and staff users
-- Run this after creating test users with create_test_users.sql

-- Clean up existing test data first
DELETE FROM public.visits WHERE site_id IN (SELECT id FROM public.sites WHERE site_name LIKE 'Test %');
DELETE FROM public.sites WHERE site_name LIKE 'Test %';
DELETE FROM public.checklists WHERE title LIKE 'Test %';

-- Create 3 test checklists
INSERT INTO public.checklists (title, items, created_at, updated_at) VALUES
(
  'Test Office Cleaning',
  '[
    {"id": 1, "task": "Vacuum all carpets", "completed": false},
    {"id": 2, "task": "Clean restrooms", "completed": false},
    {"id": 3, "task": "Empty trash bins", "completed": false},
    {"id": 4, "task": "Wipe down surfaces", "completed": false},
    {"id": 5, "task": "Clean windows", "completed": false}
  ]'::jsonb,
  NOW(),
  NOW()
),
(
  'Test Warehouse Cleaning',
  '[
    {"id": 1, "task": "Sweep floors", "completed": false},
    {"id": 2, "task": "Clean loading dock", "completed": false},
    {"id": 3, "task": "Empty trash bins", "completed": false},
    {"id": 4, "task": "Clean restrooms", "completed": false},
    {"id": 5, "task": "Organize storage areas", "completed": false}
  ]'::jsonb,
  NOW(),
  NOW()
),
(
  'Test Retail Cleaning',
  '[
    {"id": 1, "task": "Vacuum sales floor", "completed": false},
    {"id": 2, "task": "Clean fitting rooms", "completed": false},
    {"id": 3, "task": "Empty trash bins", "completed": false},
    {"id": 4, "task": "Clean restrooms", "completed": false},
    {"id": 5, "task": "Polish display cases", "completed": false}
  ]'::jsonb,
  NOW(),
  NOW()
);

-- Get client and staff user IDs
WITH user_ids AS (
  SELECT 
    (SELECT id FROM auth.users WHERE email = 'client@proclean1987.com') as client_id,
    (SELECT id FROM auth.users WHERE email = 'staff@proclean1987.com') as staff_id
)
-- Create 6 test sites for the client
INSERT INTO public.sites (
  site_name,
  site_address,
  profile_id,
  visit_day,
  visit_time,
  checklist_id,
  created_at,
  updated_at
)
SELECT 
  site_name,
  site_address,
  client_id,
  visit_day,
  visit_time,
  checklist_id,
  NOW(),
  NOW()
FROM user_ids,
(VALUES
  ('Test Corporate Office', '123 Business Ave, Downtown, NY 10001', 'mon'::visit_day_enum, '09:00'::time, (SELECT id FROM public.checklists WHERE title = 'Test Office Cleaning' LIMIT 1)),
  ('Test Medical Center', '456 Health St, Medical District, NY 10002', 'tue'::visit_day_enum, '10:00'::time, (SELECT id FROM public.checklists WHERE title = 'Test Office Cleaning' LIMIT 1)),
  ('Test Retail Store', '789 Shopping Blvd, Mall Area, NY 10003', 'wed'::visit_day_enum, '11:00'::time, (SELECT id FROM public.checklists WHERE title = 'Test Retail Cleaning' LIMIT 1)),
  ('Test Warehouse', '321 Industrial Way, Warehouse District, NY 10004', 'thu'::visit_day_enum, '08:00'::time, (SELECT id FROM public.checklists WHERE title = 'Test Warehouse Cleaning' LIMIT 1)),
  ('Test Restaurant', '654 Food Court, Dining District, NY 10005', 'fri'::visit_day_enum, '12:00'::time, (SELECT id FROM public.checklists WHERE title = 'Test Office Cleaning' LIMIT 1)),
  ('Test Gym Facility', '987 Fitness Lane, Sports Complex, NY 10006', 'sat'::visit_day_enum, '07:00'::time, (SELECT id FROM public.checklists WHERE title = 'Test Warehouse Cleaning' LIMIT 1))
) AS sites_data(site_name, site_address, visit_day, visit_time, checklist_id);

-- Create visits for Sarah Staff (staff@proclean1987.com)
-- Assign Sarah Staff to perform visits on 4 of the 6 test sites
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
)
SELECT 
  s.id as site_id,
  (SELECT id FROM auth.users WHERE email = 'staff@proclean1987.com') as profile_id,
  s.checklist_id,
  visit_date,
  visit_checkin_time,
  visit_checkout_time,
  notes,
  NOW(),
  NOW()
FROM public.sites s
CROSS JOIN (
  VALUES
    ('2024-01-15'::date, '2024-01-15 09:00:00+00'::timestamptz, '2024-01-15 11:00:00+00'::timestamptz, 'Sarah Staff - Completed: 4/5 items - Vacuumed all carpets ✓, Cleaned restrooms ✓, Emptied trash bins ✓, Wiped down surfaces ✓, Windows need attention'),
    ('2024-01-22'::date, '2024-01-22 09:15:00+00'::timestamptz, '2024-01-22 11:30:00+00'::timestamptz, 'Sarah Staff - Completed: 5/5 items - All tasks completed successfully ✓'),
    ('2024-01-29'::date, '2024-01-29 09:30:00+00'::timestamptz, '2024-01-29 11:15:00+00'::timestamptz, 'Sarah Staff - Completed: 3/5 items - Vacuumed carpets ✓, Cleaned restrooms ✓, Emptied trash ✓, Surfaces and windows pending'),
    ('2024-02-05'::date, '2024-02-05 09:00:00+00'::timestamptz, '2024-02-05 11:45:00+00'::timestamptz, 'Sarah Staff - Completed: 5/5 items - Excellent work, all areas spotless ✓')
) AS visits_data(visit_date, visit_checkin_time, visit_checkout_time, notes)
WHERE s.site_name LIKE 'Test %'
ORDER BY s.id
LIMIT 4;

-- Create additional visits for Sarah Staff on remaining sites
-- Sarah Staff will also visit the remaining 2 sites
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
)
SELECT 
  s.id as site_id,
  (SELECT id FROM auth.users WHERE email = 'staff@proclean1987.com') as profile_id,
  s.checklist_id,
  visit_date,
  visit_checkin_time,
  visit_checkout_time,
  notes,
  NOW(),
  NOW()
FROM public.sites s
CROSS JOIN (
  VALUES
    ('2024-01-16'::date, '2024-01-16 10:00:00+00'::timestamptz, '2024-01-16 12:00:00+00'::timestamptz, 'Sarah Staff - Completed: 4/5 items - Medical center cleaning, all areas sanitized ✓'),
    ('2024-01-23'::date, '2024-01-23 10:15:00+00'::timestamptz, '2024-01-23 12:30:00+00'::timestamptz, 'Sarah Staff - Completed: 5/5 items - Retail store spotless, ready for customers ✓')
) AS visits_data(visit_date, visit_checkin_time, visit_checkout_time, notes)
WHERE s.site_name LIKE 'Test %'
ORDER BY s.id
OFFSET 4
LIMIT 2;

-- Display summary of created data
SELECT 
  'Test Data Summary' as summary,
  COUNT(*) as count
FROM (
  SELECT 'Checklists' as type FROM public.checklists WHERE title LIKE 'Test %'
  UNION ALL
  SELECT 'Sites' as type FROM public.sites WHERE site_name LIKE 'Test %'
  UNION ALL
  SELECT 'Visits' as type FROM public.visits v
  JOIN public.sites s ON v.site_id = s.id
  WHERE s.site_name LIKE 'Test %'
) t

UNION ALL

SELECT 
  'Test Checklists Created' as summary,
  COUNT(*) as count
FROM public.checklists 
WHERE title LIKE 'Test %'

UNION ALL

SELECT 
  'Test Sites Created' as summary,
  COUNT(*) as count
FROM public.sites 
WHERE site_name LIKE 'Test %'

UNION ALL

SELECT 
  'Sarah Staff Visits Created' as summary,
  COUNT(*) as count
FROM public.visits v
JOIN public.sites s ON v.site_id = s.id
JOIN auth.users u ON v.profile_id = u.id
WHERE s.site_name LIKE 'Test %' 
AND u.email = 'staff@proclean1987.com';

-- Display detailed breakdown
SELECT 
  s.site_name,
  s.site_address,
  c.title as checklist_title,
  COUNT(v.id) as visit_count,
  MAX(v.visit_date) as last_visit,
  CASE 
    WHEN COUNT(v.id) > 0 THEN 'Sarah Staff assigned'
    ELSE 'No staff assigned'
  END as staff_assignment
FROM public.sites s
LEFT JOIN public.checklists c ON s.checklist_id = c.id
LEFT JOIN public.visits v ON s.id = v.site_id
WHERE s.site_name LIKE 'Test %'
GROUP BY s.id, s.site_name, s.site_address, c.title
ORDER BY s.site_name;
