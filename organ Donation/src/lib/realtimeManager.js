/**
 * Supabase Realtime Channel Manager
 *
 * Solves three problems:
 *   1. Duplicate subscriptions — multiple hooks subscribing to the same
 *      channel name get the same channel instance (ref-counted).
 *   2. Stale subscriptions — channels are properly cleaned up when the
 *      last subscriber unregisters.
 *   3. Visibility-based reconnection — channels are paused when the tab
 *      is hidden and resumed when it becomes visible again.
 *
 * Usage:
 *   const unsub = realtimeManager.subscribe(
 *     'my-channel',
 *     (channel) => channel.on('postgres_changes', config, handler),
 *     () => console.log('channel removed')
 *   );
 *   // later:
 *   unsub();
 */

import { supabase } from './supabase';

class RealtimeManager {
  constructor() {
    /** @type {Map<string, { channel: any, refCount: number, builders: Set<Function> }>} */
    this._registry = new Map();

    // Reconnect all active channels when the tab regains focus.
    // Bind once so we can remove the exact same reference later.
    this._boundHandleVisibility = this._handleVisibility.bind(this);
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this._boundHandleVisibility);
    }
  }

  /**
   * Subscribe to a named channel.
   *
   * @param {string}   name     - Unique channel name (e.g. 'matches-realtime')
   * @param {Function} builder  - (channel) => channel — attaches .on() listeners
   * @param {Function} [onRemove] - Called when the channel is fully removed
   * @returns {Function} Unsubscribe function — call on component unmount
   */
  subscribe(name, builder, onRemove) {
    if (this._registry.has(name)) {
      // Reuse existing channel — just increment ref count
      const entry = this._registry.get(name);
      entry.refCount += 1;
      entry.builders.add(builder);
    } else {
      // Create a new channel and attach the first listener
      const channel = supabase.channel(name);
      builder(channel);
      channel.subscribe((status, err) => {
        if (err) console.error(`[Realtime] ${name} error:`, err);
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`[Realtime] ${name} status: ${status} — will retry on next visibility`);
        }
      });

      this._registry.set(name, {
        channel,
        refCount: 1,
        builders: new Set([builder]),
        onRemove,
      });
    }

    // Return unsubscribe function
    return () => this._unsubscribe(name, builder);
  }

  /**
   * Decrement ref count and remove channel when it reaches zero.
   */
  _unsubscribe(name, builder) {
    const entry = this._registry.get(name);
    if (!entry) return;

    entry.builders.delete(builder);
    entry.refCount -= 1;

    if (entry.refCount <= 0) {
      entry.channel.unsubscribe();
      this._registry.delete(name);
      entry.onRemove?.();
    }
  }

  /**
   * Reconnect all channels when the tab becomes visible.
   */
  _handleVisibility() {
    if (document.visibilityState !== 'visible') return;

    for (const [name, entry] of this._registry.entries()) {
      const state = entry.channel.state;
      if (state === 'closed' || state === 'errored') {
        // Rebuild the channel from scratch
        entry.channel.unsubscribe();
        const newChannel = supabase.channel(name);
        for (const builder of entry.builders) {
          builder(newChannel);
        }
        newChannel.subscribe();
        entry.channel = newChannel;
      }
    }
  }

  /**
   * Remove all channels — useful for testing or full logout cleanup.
   */
  removeAll() {
    for (const [, entry] of this._registry.entries()) {
      entry.channel.unsubscribe();
    }
    this._registry.clear();
    // Also remove the visibility listener
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this._boundHandleVisibility);
    }
  }

  /** Expose registry size for debugging */
  get size() {
    return this._registry.size;
  }
}

// Singleton — one manager for the entire app
export const realtimeManager = new RealtimeManager();
