import { supabase } from '../lib/supabase';

/**
 * Fetch aggregate counts for the admin dashboard.
 * Runs parallel queries against all main tables.
 *
 * @returns {Promise<Object>} { donors, organs, matches, emergencies }
 */
export async function fetchAdminStats() {
  const [donorsRes, organsRes, matchesRes, emergencyRes] = await Promise.allSettled([
    supabase.from('donor_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('organs').select('id', { count: 'exact', head: true }),
    supabase.from('matches').select('id', { count: 'exact', head: true }),
    supabase
      .from('recipient_requests')
      .select('id', { count: 'exact', head: true })
      .in('urgency', ['Critical', 'Emergency'])
      .eq('status', 'active'),
  ]);

  return {
    donors:      donorsRes.status    === 'fulfilled' ? (donorsRes.value.count    ?? 0) : 0,
    organs:      organsRes.status    === 'fulfilled' ? (organsRes.value.count    ?? 0) : 0,
    matches:     matchesRes.status   === 'fulfilled' ? (matchesRes.value.count   ?? 0) : 0,
    emergencies: emergencyRes.status === 'fulfilled' ? (emergencyRes.value.count ?? 0) : 0,
  };
}

/**
 * Fetch recent donor registrations for the admin table.
 * Reads from donor_profiles (has user_id linkage).
 *
 * @param {number} limit
 */
export async function fetchRecentDonors(limit = 10) {
  const { data, error } = await supabase
    .from('donor_profiles')
    .select('id, name, organ_type, blood_type, location, urgency, is_available, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Fetch recent recipient requests for the admin table.
 *
 * @param {number} limit
 */
export async function fetchRecentRequests(limit = 10) {
  const { data, error } = await supabase
    .from('recipient_requests')
    .select('id, patient_name, organ_needed, blood_type, urgency, hospital_name, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Fetch all active matches for the admin overview.
 *
 * @param {number} limit
 */
export async function fetchAllMatches(limit = 20) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Fetch recent notifications across the system (admin view).
 * Returns the most recent notifications regardless of user.
 *
 * @param {number} limit
 */
export async function fetchSystemActivity(limit = 10) {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, message, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  // Graceful fallback — notifications table may not have admin read policy
  if (error) {
    console.warn('System activity fetch failed:', error.message);
    return [];
  }
  return data || [];
}

/**
 * Fetch all emergency requests (Critical + Emergency urgency).
 *
 * @param {number} limit
 */
export async function fetchEmergencyRequests(limit = 20) {
  const { data, error } = await supabase
    .from('recipient_requests')
    .select('*')
    .in('urgency', ['Critical', 'Emergency'])
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * Update a donor profile's availability (admin action).
 *
 * @param {number} id
 * @param {boolean} isAvailable
 */
export async function setDonorAvailability(id, isAvailable) {
  const { error } = await supabase
    .from('donor_profiles')
    .update({ is_available: isAvailable })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Close a recipient request (admin action).
 *
 * @param {number} id
 */
export async function closeRequest(id) {
  const { error } = await supabase
    .from('recipient_requests')
    .update({ status: 'closed' })
    .eq('id', id);

  if (error) throw error;
}
