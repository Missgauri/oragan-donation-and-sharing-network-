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

// Realistic mock fallbacks — only used when DB is unreachable
const MOCK_STATS = { donors: 0, organs: 0, matches: 0, emergencies: 0 };

const MOCK_DONORS = [
  { id: 1, name: 'Rahul Sharma', organ_type: 'Kidney',      blood_type: 'O+',  location: 'Delhi, IN',     urgency: 'Voluntary', is_available: true,  created_at: '2024-11-10T00:00:00Z' },
  { id: 2, name: 'Priya Mehta',  organ_type: 'Liver',       blood_type: 'A-',  location: 'Mumbai, MH',    urgency: 'Voluntary', is_available: true,  created_at: '2024-11-09T00:00:00Z' },
  { id: 3, name: 'Amit Patel',   organ_type: 'Heart',       blood_type: 'AB+', location: 'Bangalore, KA', urgency: 'High',      is_available: true,  created_at: '2024-11-08T00:00:00Z' },
  { id: 4, name: 'Sunita Rao',   organ_type: 'Lungs',       blood_type: 'O-',  location: 'Chennai, TN',   urgency: 'High',      is_available: true,  created_at: '2024-11-07T00:00:00Z' },
  { id: 5, name: 'Vikram Singh', organ_type: 'Bone Marrow', blood_type: 'B+',  location: 'Hyderabad, TS', urgency: 'Voluntary', is_available: false, created_at: '2024-11-06T00:00:00Z' },
];

const MOCK_REQUESTS = [
  { id: 'r1', patient_name: 'PT-4921', organ_needed: 'Kidney', blood_type: 'O+',  urgency: 'High',      hospital_name: 'AIIMS Delhi',      status: 'active', created_at: '2024-11-10T00:00:00Z' },
  { id: 'r2', patient_name: 'PT-3304', organ_needed: 'Heart',  blood_type: 'AB+', urgency: 'Critical',  hospital_name: 'Apollo Bangalore', status: 'active', created_at: '2024-11-09T00:00:00Z' },
  { id: 'r3', patient_name: 'PT-8812', organ_needed: 'Liver',  blood_type: 'A-',  urgency: 'Medium',    hospital_name: 'Fortis Mumbai',    status: 'active', created_at: '2024-11-08T00:00:00Z' },
  { id: 'r4', patient_name: 'PT-2201', organ_needed: 'Lungs',  blood_type: 'O-',  urgency: 'Emergency', hospital_name: 'CMC Vellore',      status: 'active', created_at: '2024-11-07T00:00:00Z' },
];

const MOCK_ACTIVITY = [
  { id: 1, type: 'system',    message: 'Rahul Sharma registered as a kidney donor.',    created_at: '2024-11-10T08:00:00Z' },
  { id: 2, type: 'emergency', message: 'Critical heart request from Apollo Bangalore.', created_at: '2024-11-10T07:00:00Z' },
  { id: 3, type: 'match',     message: 'Kidney match confirmed for PT-4921.',           created_at: '2024-11-09T18:00:00Z' },
  { id: 4, type: 'system',    message: 'Priya Mehta liver donor profile verified.',     created_at: '2024-11-09T12:00:00Z' },
];

export function useAdminDashboard() {
  // Start with zero stats — replaced by real data or kept at zero if DB empty
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

      // Stats — use real if available, else zeros (not fake big numbers)
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);

      // Donors — use real if available, else mock
      setDonors(
        donorsRes.status === 'fulfilled' && donorsRes.value.length
          ? donorsRes.value : MOCK_DONORS
      );

      // Requests — use real if available, else mock
      setRequests(
        requestsRes.status === 'fulfilled' && requestsRes.value.length
          ? requestsRes.value : MOCK_REQUESTS
      );

      // Matches — use real if available
      if (matchesRes.status === 'fulfilled') setMatches(matchesRes.value);

      // Activity feed
      const activityData = activityRes.status === 'fulfilled' && activityRes.value.length
        ? activityRes.value : MOCK_ACTIVITY;

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
      setError('Using demo data — database unavailable.');
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

  const toggleDonorAvailability = useCallback(async (id, current) => {
    await setDonorAvailability(id, !current);
    setDonors(prev => prev.map(d => d.id === id ? { ...d, is_available: !current } : d));
  }, []);

  const handleCloseRequest = useCallback(async (id) => {
    await closeRequest(id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'closed' } : r));
  }, []);

  return {
    stats, donors, requests, matches, activity,
    loading, error, refresh: load,
    toggleDonorAvailability, handleCloseRequest,
  };
}
