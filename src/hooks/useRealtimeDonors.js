/**
 * hooks/useRealtimeDonors.js
 * ─────────────────────────────────────────────────────────────
 * Tracks donor availability in real-time.
 *
 * Behaviour:
 *   • Fetches Active donors on mount
 *   • UPDATE → updates donor status in-place
 *             (Active → Matched → Transplanted etc.)
 *   • INSERT → adds newly registered donor
 *   • DELETE → removes donor (soft-delete handled via status)
 *
 * Scope:
 *   • No hospitalId → all active donors (admin / matching engine view)
 *   • hospitalId    → donors registered at that hospital
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase }                          from '../lib/supabase';
import { normaliseError }                    from '../lib/handleError';
import {
  subscribeToDonorAvailability,
  subscribeToDonorsAtHospital,
  CHANNEL_STATUS,
}                                            from '../services/realtimeService';

/**
 * @param {object}  [opts]
 * @param {string}  [opts.hospitalId]    - Scope to a specific hospital
 * @param {string}  [opts.organType]     - Filter by organ type
 * @param {string}  [opts.bloodType]     - Filter by blood type
 * @returns {{
 *   donors:           Array,
 *   activeCount:      number,
 *   matchedCount:     number,
 *   isLoading:        boolean,
 *   isLive:           boolean,
 *   connectionStatus: string,
 *   error:            string|null,
 *   reload:           Function,
 * }}
 */
export function useRealtimeDonors({ hospitalId, organType, bloodType } = {}) {
  const [donors,            setDonors]            = useState([]);
  const [isLoading,         setIsLoading]         = useState(true);
  const [isLive,            setIsLive]            = useState(false);
  const [connectionStatus,  setConnectionStatus]  = useState(CHANNEL_STATUS.CONNECTING);
  const [error,             setError]             = useState(null);

  // ── Derived counts ───────────────────────────────────────────
  const activeCount  = donors.filter((d) => d.status === 'Active').length;
  const matchedCount = donors.filter((d) => d.status === 'Matched').length;

  // ── State updater ────────────────────────────────────────────
  const applyChange = useCallback((payload) => {
    const { eventType, new: newRow, old: oldRow } = payload;

    setDonors((prev) => {
      switch (eventType) {
        case 'INSERT':
          if (prev.some((d) => d.id === newRow.id)) return prev;
          return [newRow, ...prev];

        case 'UPDATE':
          return prev.map((d) => (d.id === newRow.id ? { ...d, ...newRow } : d));

        case 'DELETE':
          return prev.filter((d) => d.id !== oldRow?.id);

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
        .from('donors')
        .select('*, profiles(full_name, city, state)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (hospitalId) query = query.eq('hospital_id', hospitalId);
      if (organType)  query = query.eq('organ_type', organType);
      if (bloodType)  query = query.eq('blood_type', bloodType);

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setDonors(data ?? []);
    } catch (err) {
      console.warn('[useRealtimeDonors] fetch failed:', err.message);
      setError(normaliseError(err)?.message ?? err.message);
    } finally {
      setIsLoading(false);
    }
  }, [hospitalId, organType, bloodType]);

  // ── Subscribe ────────────────────────────────────────────────
  useEffect(() => {
    load();

    const subscription = hospitalId
      ? subscribeToDonorsAtHospital(hospitalId, applyChange, handleStatus)
      : subscribeToDonorAvailability(applyChange, handleStatus);

    return () => subscription.unsubscribe();
  }, [hospitalId, load, applyChange, handleStatus]);

  return {
    donors,
    activeCount,
    matchedCount,
    isLoading,
    isLive,
    connectionStatus,
    error,
    reload: load,
  };
}
