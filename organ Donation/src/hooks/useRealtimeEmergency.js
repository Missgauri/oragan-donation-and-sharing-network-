/**
 * useRealtimeEmergency
 *
 * Subscribes to realtime changes on the recipient_requests table,
 * filtered to Critical and Emergency urgency levels.
 *
 * Handles:
 *   - New emergency requests (INSERT)
 *   - Status changes — e.g. matched/closed (UPDATE)
 *   - Deleted requests (DELETE)
 *
 * Returns:
 *   requests  - live-updated array of active emergency requests
 *   loading   - true during initial fetch
 *   error     - fetch error if any
 *   refresh   - manually re-fetch
 *   newCount  - number of new requests received since last reset
 *   resetNew  - resets newCount to 0
 *
 * @param {Object}  [options]
 * @param {boolean} [options.enabled] - Set false to disable (default true)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchEmergencyRequests } from '../services/adminService';
import { useRealtimeTable } from './useRealtimeTable';

const MOCK_EMERGENCY = [
  { id: 'e1', patient_name: 'PT-4921', organ_needed: 'Kidney', blood_type: 'O+',  urgency: 'Critical',  hospital_name: 'AIIMS Delhi',      status: 'active', created_at: '2024-11-10T08:00:00Z' },
  { id: 'e2', patient_name: 'PT-3304', organ_needed: 'Heart',  blood_type: 'AB+', urgency: 'Emergency', hospital_name: 'Apollo Bangalore', status: 'active', created_at: '2024-11-10T09:30:00Z' },
];

const EMERGENCY_URGENCIES = ['Critical', 'Emergency'];

export function useRealtimeEmergency({ enabled = true } = {}) {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [newCount, setNewCount] = useState(0);

  // Track whether we've loaded real data (to avoid replacing live data with mock)
  const hasRealData = useRef(false);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEmergencyRequests(20);
      if (data.length) {
        hasRealData.current = true;
        setRequests(data);
      } else if (!hasRealData.current) {
        setRequests(MOCK_EMERGENCY);
      }
    } catch (err) {
      console.error('[useRealtimeEmergency] fetch error:', err);
      setError(err.message || 'Failed to load emergency requests');
      if (!hasRealData.current) setRequests(MOCK_EMERGENCY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (enabled) refresh(); }, [enabled, refresh]);

  // ── Realtime handlers ──────────────────────────────────────────────────────
  useRealtimeTable({
    table:   'recipient_requests',
    enabled,
    onInsert: (row) => {
      // Only track emergency/critical urgency
      if (!EMERGENCY_URGENCIES.includes(row.urgency)) return;
      if (row.status !== 'active') return;
      setRequests((prev) => {
        if (prev.some((r) => r.id === row.id)) return prev;
        return [row, ...prev];
      });
      setNewCount((c) => c + 1);
    },
    onUpdate: (row) => {
      setRequests((prev) => {
        // If status changed to non-active, remove from list
        if (row.status !== 'active') {
          return prev.filter((r) => r.id !== row.id);
        }
        // If urgency downgraded, remove from emergency list
        if (!EMERGENCY_URGENCIES.includes(row.urgency)) {
          return prev.filter((r) => r.id !== row.id);
        }
        return prev.map((r) => (r.id === row.id ? { ...r, ...row } : r));
      });
    },
    onDelete: (row) => setRequests((prev) => prev.filter((r) => r.id !== row.id)),
  });

  const resetNew = useCallback(() => setNewCount(0), []);

  return { requests, loading, error, refresh, newCount, resetNew };
}
