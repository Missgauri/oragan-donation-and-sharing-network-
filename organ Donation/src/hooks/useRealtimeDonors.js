/**
 * useRealtimeDonors
 *
 * Subscribes to all changes on the donor_profiles table and keeps a
 * local state array in sync automatically.
 *
 * Handles:
 *   - New donor registrations (INSERT)
 *   - Availability status changes (UPDATE)
 *   - Donor profile deletions (DELETE)
 *
 * Returns:
 *   donors   - live-updated array of donor profile records
 *   loading  - true during initial fetch
 *   error    - fetch error if any
 *   refresh  - manually re-fetch all donors
 *
 * @param {Object}  [options]
 * @param {boolean} [options.availableOnly] - Only fetch available donors (default true)
 * @param {boolean} [options.enabled]       - Set false to disable (default true)
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchDonorProfiles } from '../services/matchService';
import { useRealtimeTable } from './useRealtimeTable';

const MOCK_DONORS = [
  { id: 'd1', name: 'Rahul Sharma', organ_type: 'Kidney', blood_type: 'O+',  location: 'Delhi, IN',     urgency: 'Voluntary', is_available: true  },
  { id: 'd2', name: 'Priya Mehta',  organ_type: 'Liver',  blood_type: 'A-',  location: 'Mumbai, MH',    urgency: 'Voluntary', is_available: true  },
  { id: 'd3', name: 'Amit Patel',   organ_type: 'Heart',  blood_type: 'AB+', location: 'Bangalore, KA', urgency: 'High',      is_available: true  },
  { id: 'd4', name: 'Sunita Rao',   organ_type: 'Lungs',  blood_type: 'O-',  location: 'Chennai, TN',   urgency: 'High',      is_available: true  },
  { id: 'd5', name: 'Vikram Singh', organ_type: 'Kidney', blood_type: 'B+',  location: 'Hyderabad, TS', urgency: 'Voluntary', is_available: false },
];

export function useRealtimeDonors({ availableOnly = true, enabled = true } = {}) {
  const [donors,  setDonors]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDonorProfiles();
      setDonors(data.length ? data : MOCK_DONORS);
    } catch (err) {
      console.error('[useRealtimeDonors] fetch error:', err);
      setError(err.message || 'Failed to load donors');
      setDonors(MOCK_DONORS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (enabled) refresh(); }, [enabled, refresh]);

  // ── Realtime handlers ──────────────────────────────────────────────────────
  useRealtimeTable({
    table:   'donor_profiles',
    enabled,
    onInsert: (row) => {
      // If availableOnly, skip unavailable new donors
      if (availableOnly && !row.is_available) return;
      setDonors((prev) => {
        if (prev.some((d) => d.id === row.id)) return prev;
        return [row, ...prev];
      });
    },
    onUpdate: (row) => {
      setDonors((prev) => {
        // If availableOnly and donor became unavailable, remove from list
        if (availableOnly && !row.is_available) {
          return prev.filter((d) => d.id !== row.id);
        }
        // Otherwise update in place (or add if not present)
        const exists = prev.some((d) => d.id === row.id);
        if (exists) return prev.map((d) => (d.id === row.id ? { ...d, ...row } : d));
        return [row, ...prev];
      });
    },
    onDelete: (row) => setDonors((prev) => prev.filter((d) => d.id !== row.id)),
  });

  return { donors, loading, error, refresh };
}
