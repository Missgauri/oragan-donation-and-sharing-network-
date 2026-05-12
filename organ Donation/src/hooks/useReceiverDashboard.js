import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchUserRecipientRequests } from '../services/profileService';
import { fetchDonorProfiles } from '../services/matchService';
import { findMatches } from '../utils/matchingEngine';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatDate';

/**
 * useReceiverDashboard
 *
 * Loads all data needed by ReceiverDashboard:
 *   - Recipient's active requests
 *   - Compatible donor matches (via matching engine)
 *   - Notification-based activity feed
 */

const MOCK_REQUEST = {
  id: 'r1', organ_needed: 'Kidney', blood_type: 'O+',
  urgency: 'High', hospital_name: 'AIIMS Delhi', status: 'active',
};

const MOCK_DONORS = [
  { id: 'd1', name: 'Rahul Sharma', organType: 'Kidney', bloodType: 'O+', location: 'Delhi, IN',   urgency: 'Voluntary', isAvailable: true },
  { id: 'd6', name: 'Ananya Iyer',  organType: 'Kidney', bloodType: 'O-', location: 'Pune, MH',    urgency: 'Voluntary', isAvailable: true },
  { id: 'd8', name: 'Kavya Reddy',  organType: 'Kidney', bloodType: 'A+', location: 'Vizag, AP',   urgency: 'Voluntary', isAvailable: true },
];

export function useReceiverDashboard() {
  const { user } = useAuth();
  const { notifications } = useNotifications();

  const [requests, setRequests] = useState([]);
  const [donors,   setDonors]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const [reqData, donorData] = await Promise.allSettled([
        fetchUserRecipientRequests(user.id),
        fetchDonorProfiles(),
      ]);

      const liveRequests = reqData.status === 'fulfilled' && reqData.value.length
        ? reqData.value
        : [MOCK_REQUEST];

      const liveDonors = donorData.status === 'fulfilled' && donorData.value.length
        ? donorData.value.map(d => ({
            ...d,
            organType:   d.organ_type   || d.organType,
            bloodType:   d.blood_type   || d.bloodType,
            isAvailable: d.is_available ?? true,
          }))
        : MOCK_DONORS;

      setRequests(liveRequests);
      setDonors(liveDonors);
    } catch (err) {
      console.error('ReceiverDashboard load error:', err);
      setError(err.message || 'Failed to load dashboard data');
      setRequests([MOCK_REQUEST]);
      setDonors(MOCK_DONORS);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Run matching engine for the primary active request
  const compatibleMatches = useMemo(() => {
    const activeReq = requests.find(r => r.status === 'active') || requests[0];
    if (!activeReq || !donors.length) return [];

    const recipient = {
      id:          activeReq.id,
      organNeeded: activeReq.organ_needed || activeReq.organNeeded,
      bloodType:   activeReq.blood_type   || activeReq.bloodType,
      urgency:     activeReq.urgency,
    };

    return findMatches(donors, recipient).slice(0, 5);
  }, [requests, donors]);

  const activeRequest = requests.find(r => r.status === 'active') || requests[0];

  const stats = {
    matchStatus:       compatibleMatches.length > 0 ? 'Matches Found' : 'Searching',
    compatibleDonors:  compatibleMatches.length,
    requestsSent:      requests.length,
    urgency:           activeRequest?.urgency || 'N/A',
  };

  const activity = notifications.slice(0, 5).map(n => ({
    id:   n.id,
    text: n.message,
    time: formatDate(n.created_at),
    dot:  n.type === 'match'            ? 'bg-emerald-400'
        : n.type === 'request_accepted' ? 'bg-blue-400'
        : n.type === 'emergency'        ? 'bg-red-400'
        : 'bg-slate-400',
  }));

  return {
    requests, donors, compatibleMatches,
    activeRequest, stats, activity,
    loading, error, refresh: load,
  };
}
