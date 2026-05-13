import { useState, useEffect, useCallback } from 'react';
import { fetchAllMatches, fetchRecentDonors, fetchEmergencyRequests } from '../services/adminService';
import { useNotifications } from '../context/NotificationContext';
import { formatDate } from '../utils/formatDate';

const MOCK_CASES = [
  { id: 101, patientRef: 'PT-4921', organ: 'Kidney', matchScore: 98, status: 'Transporting',    eta: '2 hrs' },
  { id: 102, patientRef: 'PT-3304', organ: 'Heart',  matchScore: 92, status: 'Preparing Match', eta: 'N/A'   },
  { id: 103, patientRef: 'PT-8812', organ: 'Liver',  matchScore: 85, status: 'Pending Review',  eta: 'N/A'   },
  { id: 104, patientRef: 'PT-2201', organ: 'Lungs',  matchScore: 79, status: 'In Surgery',      eta: 'Now'   },
];

const MOCK_QUEUE = [
  { id: 1, name: 'Rahul Sharma', organ_type: 'Kidney',      blood_type: 'O+',  created_at: '2024-11-10T00:00:00Z', urgency: 'High'     },
  { id: 2, name: 'Priya Mehta',  organ_type: 'Liver',       blood_type: 'A-',  created_at: '2024-11-09T00:00:00Z', urgency: 'Medium'   },
  { id: 3, name: 'Amit Patel',   organ_type: 'Heart',       blood_type: 'AB+', created_at: '2024-11-08T00:00:00Z', urgency: 'Critical' },
  { id: 4, name: 'Sunita Rao',   organ_type: 'Bone Marrow', blood_type: 'O-',  created_at: '2024-11-07T00:00:00Z', urgency: 'High'     },
];

const MOCK_EMERGENCY = [
  { id: 'e1', patient_name: 'PT-2201', organ_needed: 'Lungs',  blood_type: 'O-',  urgency: 'Emergency', hospital_name: 'CMC Vellore'       },
  { id: 'e2', patient_name: 'PT-3304', organ_needed: 'Heart',  blood_type: 'AB+', urgency: 'Critical',  hospital_name: 'Apollo Bangalore'  },
];

const MOCK_ACTIVITY = [
  { id: 1, text: 'Kidney transplant case PT-4921 is now in transit.',          time: '30 min ago', dot: 'bg-blue-400'    },
  { id: 2, text: 'New donor Rahul Sharma submitted for verification.',         time: '2 hrs ago',  dot: 'bg-emerald-400' },
  { id: 3, text: 'Emergency heart request received from Apollo Bangalore.',    time: '3 hrs ago',  dot: 'bg-red-400'     },
  { id: 4, text: 'Liver match confirmed for PT-8812 — preparing surgery.',     time: '5 hrs ago',  dot: 'bg-amber-400'   },
];

export function useHospitalDashboard() {
  const { notifications } = useNotifications();

  const [cases,     setCases]     = useState([]);
  const [queue,     setQueue]     = useState([]);
  const [emergency, setEmergency] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [casesRes, queueRes, emergencyRes] = await Promise.allSettled([
        fetchAllMatches(10),
        fetchRecentDonors(10),
        fetchEmergencyRequests(10),
      ]);

      setCases(
        casesRes.status === 'fulfilled' && casesRes.value.length
          ? casesRes.value : MOCK_CASES
      );
      setQueue(
        queueRes.status === 'fulfilled' && queueRes.value.length
          ? queueRes.value : MOCK_QUEUE
      );
      setEmergency(
        emergencyRes.status === 'fulfilled' && emergencyRes.value.length
          ? emergencyRes.value : MOCK_EMERGENCY
      );
    } catch (err) {
      console.error('HospitalDashboard load error:', err);
      setError('Using demo data — database unavailable.');
      setCases(MOCK_CASES);
      setQueue(MOCK_QUEUE);
      setEmergency(MOCK_EMERGENCY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = {
    pendingVerifications: queue.length,
    activeCases:          cases.filter(c => c.status !== 'Pending Review').length,
    completedMatches:     cases.filter(c => c.status === 'Transporting' || c.status === 'In Surgery').length,
    emergencyRequests:    emergency.length,
  };

  const activity = notifications.length > 0
    ? notifications.slice(0, 5).map(n => ({
        id:   n.id,
        text: n.message || n.title,
        time: formatDate(n.created_at),
        dot:  n.type === 'emergency'        ? 'bg-red-400'
            : n.type === 'match'            ? 'bg-emerald-400'
            : n.type === 'request_accepted' ? 'bg-blue-400'
            : 'bg-slate-400',
      }))
    : MOCK_ACTIVITY;

  return { cases, queue, emergency, stats, activity, loading, error, refresh: load };
}
