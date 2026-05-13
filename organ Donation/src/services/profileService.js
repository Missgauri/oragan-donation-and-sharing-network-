import { supabase } from '../lib/supabase';

/**
 * Fetch the donor_profile row for the currently authenticated user.
 */
export async function fetchDonorProfile(userId) {
  const { data, error } = await supabase
    .from('donor_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) { console.warn('[profileService] fetchDonorProfile:', error.message); return null; }
  return data;
}

/**
 * Fetch all organs registered by a specific user.
 */
export async function fetchDonorOrgans(userId) {
  const { data, error } = await supabase
    .from('donor_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) { console.warn('[profileService] fetchDonorOrgans:', error.message); return []; }
  return data || [];
}

/**
 * Fetch the active recipient_request for the current user.
 */
export async function fetchRecipientProfile(userId) {
  const { data, error } = await supabase
    .from('recipient_requests')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) { console.warn('[profileService] fetchRecipientProfile:', error.message); return null; }
  return data;
}

/**
 * Update user profile metadata in Supabase Auth.
 */
export async function updateUserProfile(updates) {
  const { data, error } = await supabase.auth.updateUser({ data: updates });
  if (error) throw error;
  return data;
}

/**
 * Fetch matches by organ type (for donor dashboard).
 */
export async function fetchMatchesByOrgan(organ) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .ilike('organ', `%${organ}%`)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) { console.warn('[profileService] fetchMatchesByOrgan:', error.message); return []; }
  return data || [];
}

/**
 * Fetch all recipient requests for a user.
 */
export async function fetchUserRecipientRequests(userId) {
  const { data, error } = await supabase
    .from('recipient_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) { console.warn('[profileService] fetchUserRecipientRequests:', error.message); return []; }
  return data || [];
}

/**
 * Create a new recipient request for the current user.
 */
export async function createRecipientRequest(userId, request) {
  const { data, error } = await supabase
    .from('recipient_requests')
    .insert([{ user_id: userId, status: 'active', ...request }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
