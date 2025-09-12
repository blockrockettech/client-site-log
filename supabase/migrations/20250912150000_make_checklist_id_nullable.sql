-- Make checklist_id nullable in visits table to allow visits without checklists
ALTER TABLE public.visits ALTER COLUMN checklist_id DROP NOT NULL;
