/**
 * services/realtimeService.js
 * ─────────────────────────────────────────────────────────────
 * Domain-specific realtime subscriptions for the organ donation platform.
 *
 * Each function wraps realtimeManager.subscribeToChanges() with:
 *   • A stable, unique channel name
 *   • The correct table + event + filter
 *   • JSDoc describing the payload shape
 *
 * All functions return { unsubscribe } — call it in useEffect cleanup.
 * ─────────────────────────────────────────────────────────────
 */

import { subscribeToChanges, CHANNEL_STATUS } from '../lib/realtimeManager';

export { CHANNEL_STATUS };

// ─── Channel name constants ───────────────────────────────────────────────────
// Centralised so hooks and tests reference the same strings.
export const CHANNELS = {
  MATCHES:            'rt:matches',
  MATCHES_DONOR:      (donorId)    => `rt:matches:donor:${donorId}`,
  MATCHES_REQUEST:    (requestId)  => `rt:matches:request:${requestId}`,
  EMERGENCY_ACTIVE:   'rt:emergency:active',
  EMERGENCY_HOSPITAL: (hospitalId) => `rt:emergency:hospital:${hospitalId}`,
  NOTIFICATIONS:      (userId)     => `rt:notifications:${userId}`,
  DONORS_STATUS:      'rt:donors:status',
  DONORS_HOSPITAL:    (hospitalId) => `rt:donors:hospital:${hospitalId}`,
  ORGAN_REQUESTS:     'rt:organ_requests:pending',
};

// ══════════════════════════════════════════════════════════════
// 1. MATCHES
// ══════════════════════════════════════════════════════════════

/**
 * Subscribe to ALL match changes (INSERT / UPDATE / DELETE).
 * Used by the admin dashboard and hospital coordinators.
 *
 * Payload shape:
 *   { eventType: 'INSERT'|'UPDATE'|'DELETE', new: Match, old: Match }
 *
 * @param {Function} onData    - (payload) => void
 * @param {Function} [onStatus]
 * @returns {{ unsubscribe: Function }}
 */
export function subscribeToAllMatches(onData, onStatus) {
  return subscribeToChanges({
    channelName: CHANNELS.MATCHES,
    table:       'matches',
    event:       '*',
    onData,
    onStatus,
  });
}

/**
 * Subscribe to matches involving a specific donor.
 * Used on the donor's personal dashboard.
 *
 * @param {string}   donorId
 * @param {Function} onData
 * @param {Function} [onStatus]
 * @returns {{ unsubscribe: Function }}
 */
export function subscribeToDonorMatches(donorId, onData, onStatus) {
  return subscribeToChanges({
    channelName: CHANNELS.MATCHES_DONOR(donorId),
    table:       'matches',
    event:       '*',
    filter:      `donor_id=eq.${donorId}`,
    onData,
    onStatus,
  });
}

/**
 * Subscribe to matches for a specific organ request.
 * Used on the receiver's dashboard.
 *
 * @param {string}   requestId
 * @param {Function} onData
 * @param {Function} [onStatus]
 * @returns {{ unsubscribe: Function }}
 */
export function subscribeToRequestMatches(requestId, onData, onStatus) {
  return subscribeToChanges({
    channelName: CHANNELS.MATCHES_REQUEST(requestId),
    table:       'matches',
    event:       '*',
    filter:      `request_id=eq.${requestId}`,
    onData,
    onStatus,
  });
}

// ══════════════════════════════════════════════════════════════
// 2. EMERGENCY REQUESTS
// ══════════════════════════════════════════════════════════════

/**
 * Subscribe to all ACTIVE emergency requests (INSERT + UPDATE).
 * Broadcast to all authenticated users — powers the emergency banner.
 *
 * @param {Function} onData
 * @param {Function} [onStatus]
 * @returns {{ unsubscribe: Function }}
 */
export function subscribeToActiveEmergencies(onData, onStatus) {
  return subscribeToChanges({
    channelName: CHANNELS.EMERGENCY_ACTIVE,
    table:       'emergency_requests',
    event:       '*',
    filter:      'status=eq.Active',
    onData,
    onStatus,
  });
}

/**
 * Subscribe to emergency requests at a specific hospital.
 * Used by hospital coordinators.
 *
 * @param {string}   hospitalId
 * @param {Function} onData
 * @param {Function} [onStatus]
 * @returns {{ unsubscribe: Function }}
 */
export function subscribeToHospitalEmergencies(hospitalId, onData, onStatus) {
  return subscribeToChanges({
    channelName: CHANNELS.EMERGENCY_HOSPITAL(hospitalId),
    table:       'emergency_requests',
    event:       '*',
    filter:      `hospital_id=eq.${hospitalId}`,
    onData,
    onStatus,
  });
}

// ══════════════════════════════════════════════════════════════
// 3. NOTIFICATIONS
// ══════════════════════════════════════════════════════════════

/**
 * Subscribe to notifications for a specific user.
 * Only INSERT events — we don't need to react to read/dismiss updates.
 *
 * @param {string}   userId   - auth.users.id (UUID)
 * @param {Function} onData
 * @param {Function} [onStatus]
 * @returns {{ unsubscribe: Function }}
 */
export function subscribeToUserNotifications(userId, onData, onStatus) {
  return subscribeToChanges({
    channelName: CHANNELS.NOTIFICATIONS(userId),
    table:       'notifications',
    event:       'INSERT',
    filter:      `user_id=eq.${userId}`,
    onData,
    onStatus,
  });
}

// ══════════════════════════════════════════════════════════════
// 4. DONOR AVAILABILITY
// ══════════════════════════════════════════════════════════════

/**
 * Subscribe to donor status changes across the entire network.
 * Used by the matching engine and admin dashboard.
 * Only UPDATE events — we care when status changes (Active → Matched etc.)
 *
 * @param {Function} onData
 * @param {Function} [onStatus]
 * @returns {{ unsubscribe: Function }}
 */
export function subscribeToDonorAvailability(onData, onStatus) {
  return subscribeToChanges({
    channelName: CHANNELS.DONORS_STATUS,
    table:       'donors',
    event:       'UPDATE',
    onData,
    onStatus,
  });
}

/**
 * Subscribe to donor status changes at a specific hospital.
 * Used by hospital coordinators.
 *
 * @param {string}   hospitalId
 * @param {Function} onData
 * @param {Function} [onStatus]
 * @returns {{ unsubscribe: Function }}
 */
export function subscribeToDonorsAtHospital(hospitalId, onData, onStatus) {
  return subscribeToChanges({
    channelName: CHANNELS.DONORS_HOSPITAL(hospitalId),
    table:       'donors',
    event:       '*',
    filter:      `hospital_id=eq.${hospitalId}`,
    onData,
    onStatus,
  });
}

// ══════════════════════════════════════════════════════════════
// 5. ORGAN REQUESTS (public registry — /find page)
// ══════════════════════════════════════════════════════════════

/**
 * Subscribe to new pending organ requests.
 * Powers the live /find page — new requests appear without refresh.
 *
 * @param {Function} onData
 * @param {Function} [onStatus]
 * @returns {{ unsubscribe: Function }}
 */
export function subscribeToPendingOrganRequests(onData, onStatus) {
  return subscribeToChanges({
    channelName: CHANNELS.ORGAN_REQUESTS,
    table:       'organ_requests',
    event:       '*',
    filter:      'status=eq.Pending',
    onData,
    onStatus,
  });
}
