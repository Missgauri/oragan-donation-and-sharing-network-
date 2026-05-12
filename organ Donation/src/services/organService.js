import { supabase } from '../lib/supabase';

/**
 * Fetch all available organs from the registry.
 * @returns {Promise<Array>} Array of organ records
 */
export async function fetchOrgans() {
  const { data, error } = await supabase.from('organs').select('*');
  if (error) throw error;
  return data || [];
}
