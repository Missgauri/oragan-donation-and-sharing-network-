/**
 * services/organService.js
 * ─────────────────────────────────────────────────────────────
 * Domain service for all organ-donation data operations.
 *
 * This is the ONLY layer pages and hooks should import from.
 * It delegates all raw DB calls to databaseService.js.
 *
 * Architecture:
 *   Hook / Page  →  organService  →  databaseService  →  supabase client
 * ─────────────────────────────────────────────────────────────
 */

import {
  getAll,
  insert,
  subscribeToTable,
  removeChannel,
} from './databaseService';

// ─── Table names ──────────────────────────────────────────────────────────────
const TABLES = {
  ORGANS:  'organs',
  DONORS:  'donors',
  MATCHES: 'matches',
};

// ─── Organs ───────────────────────────────────────────────────────────────────

/**
 * Fetch all available organs from the public registry.
 *
 * @returns {Promise<{ data: Array|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function fetchOrgans() {
  return getAll(TABLES.ORGANS);
}

/**
 * Insert a new organ into the public registry.
 * Called automatically when a donor registers with a specific organ type.
 *
 * @param {{ organ: string, bloodType: string, location: string, urgency: string, dateAdded: string }} organ
 * @returns {Promise<{ data: Array|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function insertOrgan(organ) {
  return insert(TABLES.ORGANS, organ);
}

// ─── Donors ───────────────────────────────────────────────────────────────────

/**
 * Register a new donor profile.
 *
 * @param {{ fullName: string, email: string, phone: string, bloodType: string, organType: string, medicalHistory: string, consent: boolean, timestamp: string }} donor
 * @returns {Promise<{ data: Array|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function insertDonor(donor) {
  return insert(TABLES.DONORS, donor);
}

// ─── Matches ──────────────────────────────────────────────────────────────────

/**
 * Fetch all active organ matches.
 *
 * @returns {Promise<{ data: Array|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function fetchMatches() {
  return getAll(TABLES.MATCHES);
}

/**
 * Subscribe to real-time changes on the matches table.
 * Returns the channel — pass it to unsubscribeChannel() in cleanup.
 *
 * @param {(payload: object) => void} onChange
 * @returns {import('@supabase/supabase-js').RealtimeChannel}
 */
export function subscribeToMatches(onChange) {
  return subscribeToTable('matches-realtime', TABLES.MATCHES, '*', onChange);
}

/**
 * Unsubscribe and clean up a realtime channel.
 *
 * @param {import('@supabase/supabase-js').RealtimeChannel} channel
 */
export function unsubscribeChannel(channel) {
  removeChannel(channel);
}
