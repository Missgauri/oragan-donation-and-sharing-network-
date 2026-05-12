import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchDonorProfiles, fetchRecipientRequests } from '../services/matchService';
import { findMatches, buildMatchMap } from '../utils/matchingEngine';

// ── Mock data (used when DB tables don't exist yet) ───────────────────────────

const MOCK_DONORS = [
  { id: 'd1', name: 'Rahul Sharma',   organType: 'Kidney',  bloodType: 'O+',  location: 'Delhi, IN',      urgency: 'Voluntary', isAvailable: true,  registeredAt: '2024-10-25' },
  { id: 'd2', name: 'Priya Mehta',    organType: 'Liver',   bloodType: 'A-',  location: 'Mumbai, MH',     urgency: 'Voluntary', isAvailable: true,  registeredAt: '2024-10-26' },
  { id: 'd3', name: 'Amit Patel',     organType: 'Heart',   bloodType: 'AB+', location: 'Bangalore, KA',  urgency: 'High',      isAvailable: true,  registeredAt: '2024-10-27' },
  { id: 'd4', name: 'Sunita Rao',     organType: 'Lungs',   bloodType: 'O-',  location: 'Chennai, TN',    urgency: 'High',      isAvailable: true,  registeredAt: '2024-10-28' },
  { id: 'd5', name: 'Vikram Singh',   organType: 'Kidney',  bloodType: 'B+',  location: 'Hyderabad, TS',  urgency: 'Voluntary', isAvailable: false, registeredAt: '2024-10-29' },
  { id: 'd6', name: 'Ananya Iyer',    organType: 'Kidney',  bloodType: 'O-',  location: 'Pune, MH',       urgency: 'Voluntary', isAvailable: true,  registeredAt: '2024-11-01' },
  { id: 'd7', name: 'Deepak Nair',    organType: 'Liver',   bloodType: 'B-',  location: 'Kochi, KL',      urgency: 'Medium',    isAvailable: true,  registeredAt: '2024-11-02' },
  { id: 'd8', name: 'Kavya Reddy',    organType: 'Kidney',  bloodType: 'A+',  location: 'Vizag, AP',      urgency: 'Voluntary', isAvailable: true,  registeredAt: '2024-11-03' },
  { id: 'd9', name: 'Mohan Das',      organType: 'Heart',   bloodType: 'O+',  location: 'Kolkata, WB',    urgency: 'Critical',  isAvailable: true,  registeredAt: '2024-11-04' },
  { id: 'd10',name: 'Ritu Kapoor',    organType: 'Lungs',   bloodType: 'AB-', location: 'Jaipur, RJ',     urgency: 'Medium',    isAvailable: true,  registeredAt: '2024-11-05' },
];

const MOCK_RECIPIENTS = [
  { id: 'r1', patientName: 'PT-4921', organNeeded: 'Kidney',  bloodType: 'O+',  urgency: 'High',      hospitalName: 'AIIMS Delhi',       status: 'active' },
  { id: 'r2', patientName: 'PT-3304', organNeeded: 'Heart',   bloodType: 'AB+', urgency: 'Critical',  hospitalName: 'Apollo Bangalore',  status: 'active' },
  { id: 'r3', patientName: 'PT-8812', organNeeded: 'Liver',   bloodType: 'A-',  urgency: 'Medium',    hospitalName: 'Fortis Mumbai',     status: 'active' },
  { id: 'r4', patientName: 'PT-2201', organNeeded: 'Lungs',   bloodType: 'O-',  urgency: 'Emergency', hospitalName: 'CMC Vellore',       status: 'active' },
];

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useMatchEngine
 *
 * Loads donors + recipients, runs the matching engine, and exposes
 * filtering + sorting controls.
 *
 * Returns:
 *   donors          - all donor profiles
 *   recipients      - all recipient requests
 *   matchMap        - { recipientId: [{ donor, score, reasons, isEmergency }] }
 *   allMatches      - flat array of all matches across all recipients
 *   filteredMatches - allMatches after applying active filters
 *   filters         - current filter state
 *   setFilters      - update filters
 *   loading         - true while fetching
 *   error           - fetch error if any
 *   refresh         - re-fetch data
 */
export function useMatchEngine() {
  const [donors,     setDonors]     = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const [filters, setFilters] = useState({
    organType:   'All',
    bloodType:   'All',
    urgency:     'All',
    availability:'All',   // 'All' | 'Available' | 'Unavailable'
    search:      '',
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [donorData, recipientData] = await Promise.all([
        fetchDonorProfiles(),
        fetchRecipientRequests(),
      ]);

      setDonors(donorData.length     ? donorData     : MOCK_DONORS);
      setRecipients(recipientData.length ? recipientData : MOCK_RECIPIENTS);
    } catch (err) {
      setError(err);
      // Fall back to mock data so the UI is never empty
      setDonors(MOCK_DONORS);
      setRecipients(MOCK_RECIPIENTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Run engine ─────────────────────────────────────────────────────────────
  const matchMap = useMemo(
    () => buildMatchMap(donors, recipients),
    [donors, recipients]
  );

  // Flatten all matches into one array, attaching recipient info
  const allMatches = useMemo(() => {
    const flat = [];
    for (const recipient of recipients) {
      const matches = matchMap[recipient.id] || [];
      for (const m of matches) {
        flat.push({ ...m, recipient });
      }
    }
    // Emergency first, then score desc
    return flat.sort((a, b) => {
      if (a.isEmergency !== b.isEmergency) return a.isEmergency ? -1 : 1;
      return b.score - a.score;
    });
  }, [matchMap, recipients]);

  // ── Apply filters ──────────────────────────────────────────────────────────
  const filteredMatches = useMemo(() => {
    return allMatches.filter((m) => {
      const { donor, recipient } = m;
      const organType  = donor.organType || donor.organ || '';
      const search     = filters.search.toLowerCase();

      if (filters.organType !== 'All' && organType !== filters.organType) return false;
      if (filters.bloodType !== 'All' && donor.bloodType !== filters.bloodType) return false;
      if (filters.urgency   !== 'All' && recipient.urgency !== filters.urgency) return false;
      if (filters.availability === 'Available'   && donor.isAvailable === false) return false;
      if (filters.availability === 'Unavailable' && donor.isAvailable !== false) return false;

      if (search) {
        const haystack = [
          organType,
          donor.bloodType,
          donor.location,
          donor.name,
          recipient.patientName,
          recipient.hospitalName,
        ].join(' ').toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      return true;
    });
  }, [allMatches, filters]);

  return {
    donors,
    recipients,
    matchMap,
    allMatches,
    filteredMatches,
    filters,
    setFilters,
    loading,
    error,
    refresh: load,
  };
}
