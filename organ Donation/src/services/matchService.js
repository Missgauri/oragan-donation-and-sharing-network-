import { supabase } from '../lib/supabase';

/**
 * Fetch all active matches from the database.
 * @returns {Promise<Array>} Array of match records
 */
export async function fetchMatches() {
  const { data, error } = await supabase.from('matches').select('*');
  if (error) throw error;
  return data || [];
}

/**
 * Subscribe to real-time changes on the matches table.
 * @param {Function} onChange - Callback receiving the updated matches array
 * @returns {Object} Supabase channel (call .unsubscribe() to clean up)
 */
export function subscribeToMatches(onChange) {
  const channel = supabase
    .channel('matches-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
      onChange(payload);
    })
    .subscribe();

  return channel;
}
