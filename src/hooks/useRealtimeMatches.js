/**
 * hooks/useRealtimeMatches.js
 * ─────────────────────────────────────────────────────────────
 * Fetches active matches and keeps them live via Supabase Realtime.
 *
 * Handles all three event types:
 *   INSERT  → prepend new match
 *   UPDATE  → replace existing match in-place
 *   DELETE  → remove match from list
 *
 * Falls back to MOCK_MATCHES if Supabase is unreachable.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMatches }          from '../services/organService';
import {
  subscribeToAllMatches,
  subscribeToDonorMatches,
  subscribeToRequestMatches,
  CHANNEL_STATUS,
}                                from '../services/realtimeService';
import { MOCK_MATCHES }          from '../utils/mockData';

/**
 * @param {object}  [opts]
 * @param {string}  [opts.donorId]    - Scope to a specific donor's matches
 * @param {string}  [opts.requestId]  - Scope to a specific organ request's matches
 * @returns {{
 *   matches:       Array,
 *   isLoading:     boolean,
 *   isLive:        boolean,
 *   connectionStatus: string,
 *   error:         string|null,
 *   reload:        Function,
 * }}
 */
export function useRealtimeMatches({ donorId, requestId } = {}) {
  const [matches,           setMatches]           = useState(MOCK_MATCHES);
  const [isLoading,         setIsLoading]         = useState(true);
  const [isLive,            setIsLive]            = useState(false);
  const [connectionStatus,  setConnectionStatus]  = useState(CHANNEL_STATUS.CONNECTING);
  const [error,             setError]             = useState(null);

  // Stable ref so the realtime callback always sees the latest state
  const matchesRef = useRef(matches);
  matchesRef.current = matches;

  // ── Reducer-style state updater ──────────────────────────────
  const applyChange = useCallback((payload) => {
    const { eventType, new: newRow, old: oldRow } = payload;

    setMatches((prev) => {
      switch (eventType) {
        case 'INSERT':
          // Avoid duplicates (Supabase can fire twice on reconnect)
          if (prev.some((m) => m.id === newRow.id)) return prev;
          return [newRow, ...prev];

        case 'UPDATE':
          return prev.map((m) => (m.id === newRow.id ? { ...m, ...newRow } : m));

        case 'DELETE':
          return prev.filter((m) => m.id !== oldRow?.id);

        default:
          return prev;
      }
    });
  }, []);

  // ── Status handler ───────────────────────────────────────────
  const handleStatus = useCallback((status, err) => {
    setConnectionStatus(status);
    setIsLive(status === CHANNEL_STATUS.SUBSCRIBED);
    if (err) setError(err.message || 'Realtime connection error');
  }, []);

  // ── Initial fetch ────────────────────────────────────────────
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await fetchMatches();
      if (fetchError) throw fetchError;
      if (data && data.length > 0) setMatches(data);
    } catch (err) {
      console.warn('[useRealtimeMatches] fetch failed, using mock data:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Subscribe ────────────────────────────────────────────────
  useEffect(() => {
    load();

    let subscription;

    if (donorId) {
      subscription = subscribeToDonorMatches(donorId, applyChange, handleStatus);
    } else if (requestId) {
      subscription = subscribeToRequestMatches(requestId, applyChange, handleStatus);
    } else {
      subscription = subscribeToAllMatches(applyChange, handleStatus);
    }

    return () => subscription.unsubscribe();
  }, [donorId, requestId, load, applyChange, handleStatus]);

  return { matches, isLoading, isLive, connectionStatus, error, reload: load };
}
