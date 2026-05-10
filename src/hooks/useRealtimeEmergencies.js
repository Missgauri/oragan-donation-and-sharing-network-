/**
 * hooks/useRealtimeEmergencies.js
 * ─────────────────────────────────────────────────────────────
 * Subscribes to active emergency organ requests in real-time.
 *
 * Behaviour:
 *   • On mount: fetches all currently Active emergencies
 *   • INSERT  → prepend to list (new emergency raised)
 *   • UPDATE  → update in-place (status change: Active → Fulfilled/Cancelled)
 *               and remove from list if no longer Active
 *   • DELETE  → remove from list
 *
 * Scope:
 *   • No hospitalId → all active emergencies (for donors, receivers, public)
 *   • hospitalId    → only emergencies at that hospital
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase }                          from '../lib/supabase';
import { normaliseError }                    from '../lib/handleError';
import {
  subscribeToActiveEmergencies,
  subscribeToHospitalEmergencies,
  CHANNEL_STATUS,
}                                            from '../services/realtimeService';

/**
 * @param {object}  [opts]
 * @param {string}  [opts.hospitalId]  - Scope to a specific hospital
 * @returns {{
 *   emergencies:      Array,
 *   activeCount:      number,
 *   isLoading:        boolean,
 *   isLive:           boolean,
 *   connectionStatus: string,
 *   error:            string|null,
 *   reload:           Function,
 * }}
 */
export function useRealtimeEmergencies({ hospitalId } = {}) {
  const [emergencies,       setEmergencies]       = useState([]);
  const [isLoading,         setIsLoading]         = useState(true);
  const [isLive,            setIsLive]            = useState(false);
  const [connectionStatus,  setConnectionStatus]  = useState(CHANNEL_STATUS.CONNECTING);
  const [error,             setError]             = useState(null);

  // ── State updater ────────────────────────────────────────────
  const applyChange = useCallback((payload) => {
    const { eventType, new: newRow, old: oldRow } = payload;

    setEmergencies((prev) => {
      switch (eventType) {
        case 'INSERT':
          if (prev.some((e) => e.id === newRow.id)) return prev;
          return [newRow, ...prev];

        case 'UPDATE':
          // Remove from list if no longer Active
          if (newRow.status !== 'Active') {
            return prev.filter((e) => e.id !== newRow.id);
          }
          return prev.map((e) => (e.id === newRow.id ? { ...e, ...newRow } : e));

        case 'DELETE':
          return prev.filter((e) => e.id !== oldRow?.id);

        default:
          return prev;
      }
    });
  }, []);

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
      let query = supabase
        .from('emergency_requests')
        .select('*')
        .eq('status', 'Active')
        .order('created_at', { ascending: false });

      if (hospitalId) query = query.eq('hospital_id', hospitalId);

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setEmergencies(data ?? []);
    } catch (err) {
      console.warn('[useRealtimeEmergencies] fetch failed:', err.message);
      setError(normaliseError(err)?.message ?? err.message);
    } finally {
      setIsLoading(false);
    }
  }, [hospitalId]);

  // ── Subscribe ────────────────────────────────────────────────
  useEffect(() => {
    load();

    const subscription = hospitalId
      ? subscribeToHospitalEmergencies(hospitalId, applyChange, handleStatus)
      : subscribeToActiveEmergencies(applyChange, handleStatus);

    return () => subscription.unsubscribe();
  }, [hospitalId, load, applyChange, handleStatus]);

  return {
    emergencies,
    activeCount:      emergencies.length,
    isLoading,
    isLive,
    connectionStatus,
    error,
    reload: load,
  };
}
