-- Fix checklist relationship to allow many sites per checklist
-- Remove the site_id from checklists table to make checklists independent
-- This allows multiple sites to reference the same checklist

-- Drop the foreign key constraint first
ALTER TABLE public.checklists DROP CONSTRAINT IF EXISTS checklists_site_id_fkey;

-- Remove the site_id column from checklists
ALTER TABLE public.checklists DROP COLUMN IF EXISTS site_id;

-- Now sites.checklist_id can reference checklists.id for many-to-one relationship
-- (This column already exists and is properly configured)
