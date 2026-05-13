import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchDonorOrgans, fetchMatchesByOrgan } from '../services/profileService';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatDate';

const MOCK_ORGANS = [
  { id: 1, organ_type: 'Kidney',      blood_type: 'O+',  is_available: true,  created_at: '2024-10-25T00:00:00Z' },
  { id: 2, organ_type: 'Liver',       blood_type: 'A+',  is_available: true,  created_at: '2024-11-02T00:00:00Z' },
  { id: 3, organ_type: 'Bone Marrow', blood_type: 'O+',  is_available: false, created_at: '2024-11-05T00:00:00Z' },
];

const MOCK_MATCHES = [
  { id: 101, patientRef: 'PT-4921', organ: 'Kidney', matchScore: 98, status: 'Transporting',    eta: '2 hrs' },
  { id: 102, patientRef: 'PT-3304', organ: 'Kidney', matchScore: 85, status: 'Pending Review',  eta: 'N/A'   },
  { id: 103, patientRef: 'PT-7712', organ: 'Kidney', matchScore: 76, status: 'Preparing Match', eta: '6 hrs' },
];

const MOCK_ACTIVITY = [
  { id: 1, text: 'Your kidney donation was matched with a recipient in Delhi.',    time: '2 hrs ago',  dot: 'bg-blue-400'    },
  { id: 2, text: 'Donor profile verified by AIIMS Delhi hospital.',               time: '1 day ago',  dot: 'bg-emerald-400' },
  { id: 3, text: 'New compatibility request received for your registered organ.', time: '2 days ago', dot: 'bg-amber-400'   },
];

export function useDonorDashboard() {
  const { user } = useAuth();
  const { notifications } = useNotifications();

  const [organs,  setOrgans]  = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    try {
      const organData = await fetchDonorOrgans(user.id);
      const liveOrgans = organData.length ? organData : MOCK_ORGANS;
      setOrgans(liveOrgans);

      const primaryOrgan = liveOrgans[0]?.organ_type || liveOrgans[0]?.organType || 'Kidney';
      const matchData = await fetchMatchesByOrgan(primaryOrgan);
      setMatches(matchData.length ? matchData : MOCK_MATCHES);
    } catch (err) {
      console.error('DonorDashboard load error:', err);
      setError('Using demo data — database unavailable.');
      setOrgans(MOCK_ORGANS);
      setMatches(MOCK_MATCHES);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const stats = {
    organsRegistered: organs.length,
    activeOrgans:     organs.filter(o => o.is_available !== false).length,
    pendingMatches:   matches.filter(m => m.status === 'Pending Review').length,
    activeMatches:    matches.filter(m => m.status !== 'Pending Review').length,
  };

  // Use real notifications if available, else show meaningful mock activity
  const activity = notifications.length > 0
    ? notifications.slice(0, 5).map(n => ({
        id:   n.id,
        text: n.message || n.title,
        time: formatDate(n.created_at),
        dot:  n.type === 'match'            ? 'bg-blue-400'
            : n.type === 'request_accepted' ? 'bg-emerald-400'
            : n.type === 'emergency'        ? 'bg-red-400'
            : 'bg-slate-400',
      }))
    : MOCK_ACTIVITY;

  return { organs, matches, stats, activity, loading, error, refresh: load };
}
