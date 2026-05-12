import { useState, useEffect, useCallback } from 'react';
import {
  fetchAdminStats,
  fetchRecentDonors,
  fetchRecentRequests,
  fetchAllMatches,
  fetchSystemActivity,
  setDonorAvailability,
  closeRequest,
} from '../services/adminService';
import { formatDate } from '../utils/formatDate';

/**
 * useAdminDashboard
 *
 * Loads all data needed by AdminDashboard:
 *   - Aggregate stats (donor count, organ count, match count, emergencies)
 *   - Recent donor registrations
 *   - Recent recipient requests
 *   - Active matches
 *   - System activity feed (from notifications)
 */

const MOCK_STATS = { donors: 847, organs: 1102, matches: 312, emergencies: 6 };

const MOCK_DONORS = [
  { id: 1, name: 'Rahul Sharma', organ_type: 'Kidney', blood_type: 'O+',  location: 'Delhi, IN',     urgency: 'Voluntary', is_available: true,  created_at: '2024-11-10T00:00:00Z' },
  { id: 2, name: 'Priya Mehta',  organ_type: 'Liver',  blood_type: 'A-',  location: 'Mumbai, MH',    urgency: 'Voluntary', is_available: true,  created_at: '2024-11-09T00:00:00Z' },
  { id: 3, name: 'Amit Patel',   organ_type: 'Heart',  blood_type: 'AB+', location: 'Bangalore, KA', urgency: 'High',      is_available: true,  created_at: '2024-11-08T00:00:00Z' },
  { id: 4, name: 'Sunita Rao',   organ_type: 'Lungs',  blood_type: 'O-',  location: 'Chennai, TN',   urgency: 'High',      is_available: true,  created_at: '2024-11-07T00:00:00Z' },
  { id: 5, name: 'Vikram Singh', organ_type: 'Kidney', blood_type: 'B+',  location: 'Hyderabad, TS', urgency: 'Voluntary', is_available: false, created_at: '2024-11-06T00:00:00Z' },
];

const MOCK_REQUESTS = [
  { id: 'r1', patient_name: 'PT-4921', organ_needed: 'Kidney', blood_type: 'O+',  urgency: 'High',      hospital_name: 'AIIMS Delhi',      status: 'active', created_at: '2024-11-10T00:00:00Z' },
  { id: 'r2', patient_name: 'PT-3304', organ_needed: 'Heart',  blood_type: 'AB+', urgency: 'Critical',  hospital_name: 'Apollo Bangalore', status: 'active', created_at: '2024-11-09T00:00:00Z' },
  { id: 'r3', patient_name: 'PT-8812', organ_needed: 'Liver',  blood_type: 'A-',  urgency: 'Medium',    hospital_name: 'Fortis Mumbai',    status: 'active', created_at: '2024-11-08T00:00:00Z' },
  { id: 'r4', patient_name: 'PT-2201', organ_needed: 'Lungs',  blood_type: 'O-',  urgency: 'Emergency', hospital_name: 'CMC Vellore',      status: 'active', created_at: '2024-11-07T00:00:00Z' },
];

const MOCK_ACTIVITY = [
  { id: 1, type: 'system', title: 'New donor registered',          message: 'Rahul Sharma registered as a kidney donor.',    created_at: '2024-11-10T08:00:00Z' },
  { id: 2, type: 'emergency', title: 'Emergency request received', message: 'Critical heart request from Apollo Bangalore.', created_at: '2024-11-10T07:00:00Z' },
  { id: 3, type: 'match', title: 'Match confirmed',                message: 'Kidney match confirmed for PT-4921.',           created_at: '2024-11-09T18:00:00Z' },
];

export function useAdminDashboard() {
  const [stats,    setStats]    = useState(MOCK_STATS);
  const [donors,   setDonors]   = useState([]);
  const [requests, setRequests] = useState([]);
  const [matches,  setMatches]  = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsRes, donorsRes, requestsRes, matchesRes, activityRes] = await Promise.allSettled([
        fetchAdminStats(),
        fetchRecentDonors(10),
        fetchRecentRequests(10),
        fetchAllMatches(10),
        fetchSystemActivity(10),
      ]);

      if (statsRes.status === 'fulfilled')    setStats(statsRes.value);
      if (donorsRes.status === 'fulfilled')   setDonors(donorsRes.value.length   ? donorsRes.value   : MOCK_DONORS);
      if (requestsRes.status === 'fulfilled') setRequests(requestsRes.value.length ? requestsRes.value : MOCK_REQUESTS);
      if (matchesRes.status === 'fulfilled')  setMatches(matchesRes.value);

      const activityData = activityRes.status === 'fulfilled' && activityRes.value.length
        ? activityRes.value
        : MOCK_ACTIVITY;

      setActivity(activityData.map(n => ({
        id:   n.id,
        text: n.message || n.title,
        time: formatDate(n.created_at),
        dot:  n.type === 'emergency'        ? 'bg-red-400'
            : n.type === 'match'            ? 'bg-emerald-400'
            : n.type === 'request_accepted' ? 'bg-blue-400'
            : 'bg-slate-400',
      })));
    } catch (err) {
      console.error('AdminDashboard load error:', err);
      setError(err.message || 'Failed to load admin data');
      setDonors(MOCK_DONORS);
      setRequests(MOCK_REQUESTS);
      setActivity(MOCK_ACTIVITY.map(n => ({
        id: n.id, text: n.message, time: formatDate(n.created_at), dot: 'bg-slate-400',
      })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Admin actions
  const toggleDonorAvailability = useCallback(async (id, current) => {
    try {
      await setDonorAvailability(id, !current);
      setDonors(prev => prev.map(d => d.id === id ? { ...d, is_available: !current } : d));
    } catch (err) {
      console.error('Toggle availability failed:', err);
    }
  }, []);

  const handleCloseRequest = useCallback(async (id) => {
    try {
      await closeRequest(id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'closed' } : r));
    } catch (err) {
      console.error('Close request failed:', err);
    }
  }, []);

  return {
    stats, donors, requests, matches, activity,
    loading, error, refresh: load,
    toggleDonorAvailability, handleCloseRequest,
  };
}
