import { supabase } from '../lib/supabase';

// ── Existing matches table ────────────────────────────────────────────────────

/**
 * Fetch all active matches from the database.
 * @returns {Promise<Array>}
 */
export async function fetchMatches() {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * Subscribe to realtime changes on the matches table.
 * @param {Function} onChange - receives the raw Supabase payload
 * @returns {Object} Supabase channel
 */
export function subscribeToMatches(onChange) {
  const channel = supabase
    .channel('matches-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, onChange)
    .subscribe();
  return channel;
}

// ── Donor profiles ────────────────────────────────────────────────────────────

/**
 * Fetch all donor profiles available for matching.
 * Normalises snake_case DB fields to camelCase for the matching engine.
 */
export async function fetchDonorProfiles() {
  const { data, error } = await supabase
    .from('donor_profiles')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('donor_profiles fetch failed:', error.message);
    return [];
  }

  // Normalise to camelCase so matching engine works with both DB and mock data
  return (data || []).map(d => ({
    ...d,
    organType:   d.organ_type   || d.organType   || '',
    bloodType:   d.blood_type   || d.bloodType   || '',
    isAvailable: d.is_available ?? true,
    name:        d.name         || d.full_name   || 'Anonymous',
    location:    d.location     || '—',
    urgency:     d.urgency      || 'Voluntary',
  }));
}

/**
 * Update a donor's availability status.
 * @param {number|string} id
 * @param {boolean}       isAvailable
 */
export async function updateDonorAvailability(id, isAvailable) {
  const { error } = await supabase
    .from('donor_profiles')
    .update({ is_available: isAvailable })
    .eq('id', id);
  if (error) throw error;
}

// ── Recipient requests ────────────────────────────────────────────────────────

/**
 * Fetch all active recipient requests.
 * @returns {Promise<Array>}
 */
export async function fetchRecipientRequests() {
  const { data, error } = await supabase
    .from('recipient_requests')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('recipient_requests fetch failed (table may not exist):', error.message);
    return [];
  }
  return data || [];
}

/**
 * Create a new recipient request.
 * @param {Object} request - { organNeeded, bloodType, urgency, patientName, hospitalName, notes }
 */
export async function createRecipientRequest(request) {
  const { data, error } = await supabase
    .from('recipient_requests')
    .insert([{ ...request, status: 'active' }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update a recipient request status.
 * @param {number|string} id
 * @param {string}        status - 'active' | 'matched' | 'closed'
 */
export async function updateRequestStatus(id, status) {
  const { error } = await supabase
    .from('recipient_requests')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

// ── Confirmed matches ─────────────────────────────────────────────────────────

/**
 * Persist a confirmed match between a donor and recipient.
 * @param {Object} match - { donorId, recipientId, organ, bloodType, score }
 */
export async function confirmMatch(match) {
  const { data, error } = await supabase
    .from('matches')
    .insert([{
      patientRef:  match.recipientId || `PT-${Date.now()}`,
      organ:       match.organ,
      matchScore:  match.score,
      status:      'Pending Review',
      eta:         'N/A',
    }])
    .select()
    .single();
  if (error) throw error;
  return data;
}
