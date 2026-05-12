import { supabase } from '../lib/supabase';

/**
 * Fetch the donor_profile row for the currently authenticated user.
 * Returns null if no profile exists yet.
 *
 * @param {string} userId - auth.users UUID
 */
export async function fetchDonorProfile(userId) {
  const { data, error } = await supabase
    .from('donor_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Fetch all organs registered by a specific user (via donor_profiles).
 *
 * @param {string} userId
 */
export async function fetchDonorOrgans(userId) {
  const { data, error } = await supabase
    .from('donor_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch the recipient_request row for the currently authenticated user.
 * Returns null if no request exists yet.
 *
 * @param {string} userId
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

  if (error) throw error;
  return data;
}

/**
 * Upsert a user's extended profile metadata.
 * Stores extra fields (full name, phone, etc.) in auth user_metadata.
 *
 * @param {Object} updates - { full_name, phone, location, ... }
 */
export async function updateUserProfile(updates) {
  const { data, error } = await supabase.auth.updateUser({
    data: updates,
  });
  if (error) throw error;
  return data;
}

/**
 * Fetch matches that involve a specific donor (by donor name or user_id).
 * Uses the matches table which stores patientRef and organ.
 *
 * @param {string} organ - organ type to filter by
 */
export async function fetchMatchesByOrgan(organ) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .ilike('organ', `%${organ}%`)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
}

/**
 * Fetch all active recipient requests (for receiver dashboard).
 *
 * @param {string} userId
 */
export async function fetchUserRecipientRequests(userId) {
  const { data, error } = await supabase
    .from('recipient_requests')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new recipient request for the current user.
 *
 * @param {string} userId
 * @param {Object} request - { organ_needed, blood_type, urgency, hospital_name, notes }
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
