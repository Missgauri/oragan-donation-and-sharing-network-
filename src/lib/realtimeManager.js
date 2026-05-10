/**
 * lib/realtimeManager.js
 * ─────────────────────────────────────────────────────────────
 * Low-level Supabase Realtime channel manager.
 *
 * Responsibilities:
 *   • Creates and tracks every active channel by name
 *   • Prevents duplicate subscriptions (same channel name = reuse)
 *   • Centralises connection status tracking
 *   • Provides a single teardown point for all channels
 *
 * Architecture:
 *   useRealtimeXxx hook
 *     → realtimeService.js   (domain-specific subscriptions)
 *       → realtimeManager.js (channel lifecycle)
 *         → lib/supabase.js  (single client)
 * ─────────────────────────────────────────────────────────────
 */

import { supabase } from './supabase';

// ─── Channel registry ─────────────────────────────────────────────────────────
// Map<channelName, { channel, refCount, status }>
const _registry = new Map();

// ─── Connection status values ─────────────────────────────────────────────────
export const CHANNEL_STATUS = {
  CONNECTING:   'CONNECTING',
  SUBSCRIBED:   'SUBSCRIBED',
  CHANNEL_ERROR:'CHANNEL_ERROR',
  TIMED_OUT:    'TIMED_OUT',
  CLOSED:       'CLOSED',
};

// ─── Subscribe ────────────────────────────────────────────────────────────────

/**
 * Subscribe to postgres_changes on a table.
 * If a channel with the same name already exists, it is reused
 * and the listener is added to it (ref-counted).
 *
 * @param {object} opts
 * @param {string}   opts.channelName   - Unique identifier for this subscription
 * @param {string}   opts.table         - Postgres table name
 * @param {'INSERT'|'UPDATE'|'DELETE'|'*'} opts.event
 * @param {string}   [opts.schema='public']
 * @param {string}   [opts.filter]      - Postgres filter e.g. "status=eq.Active"
 * @param {Function} opts.onData        - Called with the RealtimePostgresChangesPayload
 * @param {Function} [opts.onStatus]    - Called with (status: CHANNEL_STATUS, error?)
 * @returns {{ unsubscribe: Function }}  - Call unsubscribe() in useEffect cleanup
 */
export function subscribeToChanges({
  channelName,
  table,
  event = '*',
  schema = 'public',
  filter,
  onData,
  onStatus,
}) {
  // Reuse existing channel if already open
  if (_registry.has(channelName)) {
    const entry = _registry.get(channelName);
    entry.refCount += 1;
    // Attach additional listener to the existing channel
    entry.channel.on(
      'postgres_changes',
      { event, schema, table, ...(filter ? { filter } : {}) },
      onData
    );
    return { unsubscribe: () => _unref(channelName) };
  }

  // Build a new channel
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event, schema, table, ...(filter ? { filter } : {}) },
      onData
    )
    .subscribe((status, err) => {
      const entry = _registry.get(channelName);
      if (entry) entry.status = status;

      if (onStatus) onStatus(status, err);

      if (err) {
        console.error(`[RealtimeManager] Channel "${channelName}" error:`, err);
      } else if (status === 'SUBSCRIBED') {
        console.debug(`[RealtimeManager] ✓ Subscribed: ${channelName}`);
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.warn(`[RealtimeManager] Channel "${channelName}" status: ${status}`);
      }
    });

  _registry.set(channelName, { channel, refCount: 1, status: CHANNEL_STATUS.CONNECTING });

  return { unsubscribe: () => _unref(channelName) };
}

/**
 * Subscribe to broadcast messages on a channel.
 * Used for presence and custom events (not postgres_changes).
 *
 * @param {object} opts
 * @param {string}   opts.channelName
 * @param {string}   opts.event        - Broadcast event name
 * @param {Function} opts.onData
 * @param {Function} [opts.onStatus]
 * @returns {{ unsubscribe: Function }}
 */
export function subscribeToBroadcast({ channelName, event, onData, onStatus }) {
  if (_registry.has(channelName)) {
    const entry = _registry.get(channelName);
    entry.refCount += 1;
    entry.channel.on('broadcast', { event }, onData);
    return { unsubscribe: () => _unref(channelName) };
  }

  const channel = supabase
    .channel(channelName)
    .on('broadcast', { event }, onData)
    .subscribe((status, err) => {
      const entry = _registry.get(channelName);
      if (entry) entry.status = status;
      if (onStatus) onStatus(status, err);
      if (err) console.error(`[RealtimeManager] Broadcast "${channelName}" error:`, err);
    });

  _registry.set(channelName, { channel, refCount: 1, status: CHANNEL_STATUS.CONNECTING });

  return { unsubscribe: () => _unref(channelName) };
}

// ─── Unref / cleanup ──────────────────────────────────────────────────────────

function _unref(channelName) {
  const entry = _registry.get(channelName);
  if (!entry) return;

  entry.refCount -= 1;

  if (entry.refCount <= 0) {
    supabase.removeChannel(entry.channel);
    _registry.delete(channelName);
    console.debug(`[RealtimeManager] ✗ Removed channel: ${channelName}`);
  }
}

// ─── Diagnostics ──────────────────────────────────────────────────────────────

/**
 * Returns a snapshot of all active channels and their status.
 * Useful for debugging in development.
 *
 * @returns {Array<{ name: string, status: string, refCount: number }>}
 */
export function getActiveChannels() {
  return Array.from(_registry.entries()).map(([name, entry]) => ({
    name,
    status:   entry.status,
    refCount: entry.refCount,
  }));
}

/**
 * Tear down ALL active channels.
 * Call this on app unmount or during testing teardown.
 */
export function removeAllChannels() {
  for (const [name, entry] of _registry.entries()) {
    supabase.removeChannel(entry.channel);
    console.debug(`[RealtimeManager] Removed all — closed: ${name}`);
  }
  _registry.clear();
}
