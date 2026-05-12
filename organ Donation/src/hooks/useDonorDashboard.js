import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDonorOrgans, fetchMatchesByOrgan } from '../services/profileService';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatDate';

/**
 * useDonorDashboard
 *
 * Loads all data needed by DonorDashboard:
 *   - Donor's registered organs (from donor_profiles)
 *   - Active matches for those organs (from matches)
 *   - Notification-based activity feed
 *
 * Falls back to mock data when tables are empty or unavailable.
 */

const MOCK_ORGANS = [
  { id: 1, organ_type: 'Kidney', blood_type: 'O+', is_available: true,  created_at: '2024-10-25T00:00:00Z' },
  { id: 2, organ_type: 'Liver',  blood_type: 'O+', is_available: false, created_at: '2024-11-02T00:00:00Z' },
];

const MOCK_MATCHES = [
  { id: 101, patientRef: 'PT-4921', organ: 'Kidney', matchScore: 98, status: 'Transporting',    eta: '2 hrs' },
  { id: 102, patientRef: 'PT-3304', organ: 'Kidney', matchScore: 85, status: 'Pending Review',  eta: 'N/A'   },
];

export function useDonorDashboard() {
  const { user } = useAuth();
  const { notifications } = useNotifications();

  const [organs,  setOrgans]  = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch organs registered by this donor
      const organData = await fetchDonorOrgans(user.id);
      const liveOrgans = organData.length ? organData : MOCK_ORGANS;
      setOrgans(liveOrgans);

      // Fetch matches for the first registered organ type
      const primaryOrgan = liveOrgans[0]?.organ_type || liveOrgans[0]?.organType || 'Kidney';
      const matchData = await fetchMatchesByOrgan(primaryOrgan);
      setMatches(matchData.length ? matchData : MOCK_MATCHES);
    } catch (err) {
      console.error('DonorDashboard load error:', err);
      setError(err.message || 'Failed to load dashboard data');
      setOrgans(MOCK_ORGANS);
      setMatches(MOCK_MATCHES);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Derive stats from live data
  const stats = {
    organsRegistered: organs.length,
    activeOrgans:     organs.filter(o => o.is_available !== false).length,
    pendingMatches:   matches.filter(m => m.status === 'Pending Review').length,
    activeMatches:    matches.filter(m => m.status !== 'Pending Review').length,
  };

  // Use notifications as activity feed
  const activity = notifications.slice(0, 5).map(n => ({
    id:   n.id,
    text: n.message,
    time: formatDate(n.created_at),
    dot:  n.type === 'match'            ? 'bg-blue-400'
        : n.type === 'request_accepted' ? 'bg-emerald-400'
        : n.type === 'emergency'        ? 'bg-red-400'
        : 'bg-slate-400',
  }));

  return { organs, matches, stats, activity, loading, error, refresh: load };
}
