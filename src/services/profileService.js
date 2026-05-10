/**
 * services/profileService.js
 * All profile + role operations for the auth system.
 * Profiles table mirrors auth.users 1-to-1 via user_id (UUID).
 */

import { supabase }       from '../lib/supabase';
import { normaliseError } from '../lib/handleError';

export const ROLES = {
  DONOR:    'donor',
  RECEIVER: 'receiver',
  HOSPITAL: 'hospital',
  ADMIN:    'admin',
};

// ─── Fetch profile ────────────────────────────────────────────────────────────

/**
 * Fetch the profile row for a given user_id.
 * @param {string} userId
 * @returns {Promise<{ data: object|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function fetchProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return { data: null, error: normaliseError(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

// ─── Create profile ───────────────────────────────────────────────────────────

/**
 * Create a new profile row after signup.
 * @param {{ userId: string, fullName: string, email: string, role: string, phone?: string }} profile
 * @returns {Promise<{ data: object|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function createProfile({ userId, fullName, email, role, phone = '' }) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        user_id:    userId,
        full_name:  fullName,
        email,
        role,
        phone,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) return { data: null, error: normaliseError(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

// ─── Update profile ───────────────────────────────────────────────────────────

/**
 * Update fields on an existing profile.
 * @param {string} userId
 * @param {Partial<{ fullName: string, phone: string, avatarUrl: string }>} updates
 * @returns {Promise<{ data: object|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function updateProfile(userId, updates) {
  try {
    const mapped = {};
    if (updates.fullName  !== undefined) mapped.full_name   = updates.fullName;
    if (updates.phone     !== undefined) mapped.phone       = updates.phone;
    if (updates.avatarUrl !== undefined) mapped.avatar_url  = updates.avatarUrl;
    mapped.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(mapped)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) return { data: null, error: normaliseError(error) };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}
