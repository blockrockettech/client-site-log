-- Remove unique constraint on sites.checklist_id to allow many sites to use the same checklist
ALTER TABLE public.sites DROP CONSTRAINT IF EXISTS sites_checklist_id_key;

-- Ensure we still have the foreign key constraint (but not unique)
ALTER TABLE public.sites DROP CONSTRAINT IF EXISTS sites_checklist_id_fkey;
ALTER TABLE public.sites ADD CONSTRAINT sites_checklist_id_fkey 
  FOREIGN KEY (checklist_id) REFERENCES public.checklists(id) ON DELETE SET NULL;
