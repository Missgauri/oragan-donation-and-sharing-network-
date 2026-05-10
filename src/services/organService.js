/**
 * organService.js
 * All Supabase data operations for the organ donation domain.
 * Pages and hooks import from here — never directly from the supabase client.
 */

import { supabase } from '../lib/supabase';

// ─── Organs ──────────────────────────────────────────────────────────────────

/**
 * Fetch all available organs from the public registry.
 * @returns {{ data: Array|null, error: Error|null }}
 */
export async function fetchOrgans() {
  const { data, error } = await supabase.from('organs').select('*');
  return { data, error };
}

/**
 * Insert a new organ into the public registry.
 * Called automatically when a donor registers with a specific organ type.
 * @param {{ organ: string, bloodType: string, location: string, urgency: string, dateAdded: string }} organ
 * @returns {{ error: Error|null }}
 */
export async function insertOrgan(organ) {
  const { error } = await supabase.from('organs').insert([organ]);
  return { error };
}

// ─── Donors ──────────────────────────────────────────────────────────────────

/**
 * Register a new donor profile.
 * @param {{ fullName: string, email: string, phone: string, bloodType: string, organType: string, medicalHistory: string, consent: boolean, timestamp: string }} donor
 * @returns {{ error: Error|null }}
 */
export async function insertDonor(donor) {
  const { error } = await supabase.from('donors').insert([donor]);
  return { error };
}

// ─── Matches ─────────────────────────────────────────────────────────────────

/**
 * Fetch all active organ matches.
 * @returns {{ data: Array|null, error: Error|null }}
 */
export async function fetchMatches() {
  const { data, error } = await supabase.from('matches').select('*');
  return { data, error };
}

/**
 * Subscribe to real-time changes on the matches table.
 * Returns the channel so the caller can unsubscribe on cleanup.
 *
 * @param {(payload: object) => void} onChange - Callback fired on any row change
 * @returns {RealtimeChannel} Supabase channel — call supabase.removeChannel(channel) to clean up
 */
export function subscribeToMatches(onChange) {
  const channel = supabase
    .channel('schema-db-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'matches' },
      onChange
    )
    .subscribe((status, err) => {
      if (err) console.error('Supabase subscription error:', err);
    });

  return channel;
}

/**
 * Unsubscribe and remove a Supabase realtime channel.
 * @param {RealtimeChannel} channel
 */
export function unsubscribeChannel(channel) {
  supabase.removeChannel(channel);
}
