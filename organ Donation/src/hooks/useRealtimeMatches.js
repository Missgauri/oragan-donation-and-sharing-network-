/**
 * useRealtimeMatches
 *
 * Subscribes to all changes on the matches table and keeps a local
 * state array in sync automatically.
 *
 * Returns:
 *   matches  - live-updated array of match records
 *   loading  - true during initial fetch
 *   error    - fetch error if any
 *   refresh  - manually re-fetch all matches
 *
 * @param {Object}  [options]
 * @param {boolean} [options.enabled] - Set false to disable (default true)
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchMatches } from '../services/matchService';
import { useRealtimeTable } from './useRealtimeTable';

const MOCK_MATCHES = [
  { id: 101, patientRef: 'PT-4921', organ: 'Kidney', matchScore: 98, status: 'Transporting',    eta: '2 hrs' },
  { id: 102, patientRef: 'PT-3304', organ: 'Heart',  matchScore: 92, status: 'Preparing Match', eta: 'N/A'   },
  { id: 103, patientRef: 'PT-8812', organ: 'Liver',  matchScore: 85, status: 'Pending Review',  eta: 'N/A'   },
];

export function useRealtimeMatches({ enabled = true } = {}) {
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMatches();
      if (data.length) setMatches(data);
    } catch (err) {
      console.error('[useRealtimeMatches] fetch error:', err);
      setError(err.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (enabled) refresh(); }, [enabled, refresh]);

  // ── Realtime handlers ──────────────────────────────────────────────────────
  useRealtimeTable({
    table:   'matches',
    enabled,
    onInsert: (row) => setMatches((prev) => {
      // Prevent duplicates
      if (prev.some((m) => m.id === row.id)) return prev;
      return [row, ...prev];
    }),
    onUpdate: (row) => setMatches((prev) =>
      prev.map((m) => (m.id === row.id ? { ...m, ...row } : m))
    ),
    onDelete: (row) => setMatches((prev) =>
      prev.filter((m) => m.id !== row.id)
    ),
  });

  return { matches, loading, error, refresh };
}
