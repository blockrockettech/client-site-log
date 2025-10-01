import { supabase } from '@/integrations/supabase/client';

/**
 * Utility function to fetch sites with their associated profiles and checklists
 * Handles the relationship ambiguity issue by using fallback queries
 */
export async function fetchSitesWithRelations() {
  try {
    // First try with explicit foreign key
    const { data, error } = await supabase
      .from('sites')
      .select(`
        *,
        profiles (
          full_name
        ),
        checklists!fk_sites_checklist (
          id,
          title,
          items
        )
      `)
      .order('created_at', { ascending: false });

    if (error && (error.message.includes('more than one relationship') || error.message.includes('Could not embed'))) {
      // Fallback: fetch sites and profiles first, then checklists separately
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (sitesError) throw sitesError;

      // Get checklist data separately for each site
      const sitesWithChecklists = await Promise.all(
        sitesData.map(async (site) => {
          if (site.checklist_id) {
            const { data: checklistData } = await supabase
              .from('checklists')
              .select('id, title, items')
              .eq('id', site.checklist_id)
              .single();
            
            return {
              ...site,
              checklists: checklistData
            };
          }
          return {
            ...site,
            checklists: null
          };
        })
      );

      return sitesWithChecklists;
    }

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching sites with relations:', error);
    throw error;
  }
}

/**
 * Utility function to fetch sites with profiles only (for cases where checklists aren't needed)
 */
export async function fetchSitesWithProfiles() {
  const { data, error } = await supabase
    .from('sites')
    .select(`
      *,
      profiles (
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
