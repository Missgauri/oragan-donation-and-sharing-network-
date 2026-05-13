import { supabase } from '../lib/supabase';

/**
 * Fetch all available organs from the registry.
 * Returns empty array on error so callers can fall back to mock data.
 */
export async function fetchOrgans() {
  const { data, error } = await supabase
    .from('organs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[organService] fetchOrgans failed:', error.message);
    return [];
  }
  return data || [];
}
