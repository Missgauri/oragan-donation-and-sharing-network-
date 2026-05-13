import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchOrgans }            from '../services/organService';
import { fetchDonorProfiles }     from '../services/matchService';
import { fetchEmergencyRequests } from '../services/adminService';
import { normaliseOrgan }         from '../utils/matchingEngine';

// ── Constants ─────────────────────────────────────────────────────────────────

export const ORGAN_OPTIONS   = ['All', 'Kidney', 'Liver', 'Heart', 'Lungs', 'Bone Marrow', 'Pancreas', 'Cornea'];
export const BLOOD_OPTIONS   = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
export const URGENCY_OPTIONS = ['All', 'Critical', 'Emergency', 'High', 'Medium', 'Low', 'Voluntary'];
export const SORT_OPTIONS    = [
  { value: 'default',   label: 'Default'            },
  { value: 'urgency',   label: 'Urgency (High→Low)' },
  { value: 'name_asc',  label: 'Name (A→Z)'         },
  { value: 'name_desc', label: 'Name (Z→A)'         },
  { value: 'date_desc', label: 'Newest First'        },
  { value: 'date_asc',  label: 'Oldest First'        },
];

const URGENCY_RANK = {
  Critical: 5, Emergency: 4, High: 3, Medium: 2, Low: 1, Voluntary: 0,
};

// ── Mock fallbacks ────────────────────────────────────────────────────────────

export const MOCK_DONORS = [
  { id: 'd1',  name: 'Rahul Sharma',  organType: 'Kidney',      bloodType: 'O+',  location: 'Delhi, IN',      urgency: 'Voluntary', isAvailable: true,  registeredAt: '2024-10-25' },
  { id: 'd2',  name: 'Priya Mehta',   organType: 'Liver',       bloodType: 'A-',  location: 'Mumbai, MH',     urgency: 'Voluntary', isAvailable: true,  registeredAt: '2024-10-26' },
  { id: 'd3',  name: 'Amit Patel',    organType: 'Heart',       bloodType: 'AB+', location: 'Bangalore, KA',  urgency: 'High',      isAvailable: true,  registeredAt: '2024-10-27' },
  { id: 'd4',  name: 'Sunita Rao',    organType: 'Lungs',       bloodType: 'O-',  location: 'Chennai, TN',    urgency: 'High',      isAvailable: true,  registeredAt: '2024-10-28' },
  { id: 'd5',  name: 'Vikram Singh',  organType: 'Kidney',      bloodType: 'B+',  location: 'Hyderabad, TS',  urgency: 'Voluntary', isAvailable: false, registeredAt: '2024-10-29' },
  { id: 'd6',  name: 'Ananya Iyer',   organType: 'Kidney',      bloodType: 'O-',  location: 'Pune, MH',       urgency: 'Voluntary', isAvailable: true,  registeredAt: '2024-11-01' },
  { id: 'd7',  name: 'Deepak Nair',   organType: 'Liver',       bloodType: 'B-',  location: 'Kochi, KL',      urgency: 'Medium',    isAvailable: true,  registeredAt: '2024-11-02' },
  { id: 'd8',  name: 'Kavya Reddy',   organType: 'Kidney',      bloodType: 'A+',  location: 'Vizag, AP',      urgency: 'Voluntary', isAvailable: true,  registeredAt: '2024-11-03' },
  { id: 'd9',  name: 'Mohan Das',     organType: 'Heart',       bloodType: 'O+',  location: 'Kolkata, WB',    urgency: 'Critical',  isAvailable: true,  registeredAt: '2024-11-04' },
  { id: 'd10', name: 'Ritu Kapoor',   organType: 'Lungs',       bloodType: 'AB-', location: 'Jaipur, RJ',     urgency: 'Medium',    isAvailable: true,  registeredAt: '2024-11-05' },
  { id: 'd11', name: 'Arjun Verma',   organType: 'Cornea',      bloodType: 'B+',  location: 'Lucknow, UP',    urgency: 'Low',       isAvailable: true,  registeredAt: '2024-11-06' },
  { id: 'd12', name: 'Meena Pillai',  organType: 'Bone Marrow', bloodType: 'O+',  location: 'Trivandrum, KL', urgency: 'High',      isAvailable: true,  registeredAt: '2024-11-07' },
];

export const MOCK_ORGANS = [
  { id: 1, organ: 'Kidney',          bloodType: 'O+',  location: 'Delhi, IN',      urgency: 'High',     dateAdded: '2024-10-25' },
  { id: 2, organ: 'Liver (Partial)', bloodType: 'A-',  location: 'Mumbai, MH',     urgency: 'Medium',   dateAdded: '2024-10-26' },
  { id: 3, organ: 'Heart',           bloodType: 'AB+', location: 'Bangalore, KA',  urgency: 'Critical', dateAdded: '2024-10-27' },
  { id: 4, organ: 'Lungs',           bloodType: 'O-',  location: 'Chennai, TN',    urgency: 'High',     dateAdded: '2024-10-28' },
  { id: 5, organ: 'Bone Marrow',     bloodType: 'B+',  location: 'Hyderabad, TS',  urgency: 'Medium',   dateAdded: '2024-10-29' },
  { id: 6, organ: 'Kidney',          bloodType: 'B+',  location: 'Pune, MH',       urgency: 'High',     dateAdded: '2024-11-01' },
  { id: 7, organ: 'Cornea',          bloodType: 'A+',  location: 'Jaipur, RJ',     urgency: 'Low',      dateAdded: '2024-11-02' },
  { id: 8, organ: 'Liver (Partial)', bloodType: 'O+',  location: 'Kolkata, WB',    urgency: 'High',     dateAdded: '2024-11-03' },
];

export const MOCK_EMERGENCY = [
  { id: 'e1', patientName: 'PT-4921', organNeeded: 'Kidney', bloodType: 'O+',  urgency: 'Critical',  hospitalName: 'AIIMS Delhi',      location: 'Delhi, IN',      postedAt: '2024-11-10T08:00:00Z' },
  { id: 'e2', patientName: 'PT-3304', organNeeded: 'Heart',  bloodType: 'AB+', urgency: 'Emergency', hospitalName: 'Apollo Bangalore', location: 'Bangalore, KA',  postedAt: '2024-11-10T09:30:00Z' },
  { id: 'e3', patientName: 'PT-8812', organNeeded: 'Liver',  bloodType: 'A-',  urgency: 'High',      hospitalName: 'Fortis Mumbai',    location: 'Mumbai, MH',     postedAt: '2024-11-09T14:00:00Z' },
  { id: 'e4', patientName: 'PT-2201', organNeeded: 'Lungs',  bloodType: 'O-',  urgency: 'Emergency', hospitalName: 'CMC Vellore',      location: 'Vellore, TN',    postedAt: '2024-11-10T06:00:00Z' },
  { id: 'e5', patientName: 'PT-5512', organNeeded: 'Kidney', bloodType: 'B+',  urgency: 'High',      hospitalName: 'PGI Chandigarh',   location: 'Chandigarh, PB', postedAt: '2024-11-08T11:00:00Z' },
];

// ── Default filters ───────────────────────────────────────────────────────────

export const DEFAULT_FILTERS = {
  query:         '',
  organType:     'All',
  bloodType:     'All',
  urgency:       'All',
  availability:  'All',
  emergencyOnly: false,
  sortBy:        'default',
};

// ── Debounce ──────────────────────────────────────────────────────────────────

function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Filter helpers ────────────────────────────────────────────────────────────

function matchesQuery(haystack, query) {
  if (!query) return true;
  return haystack.toLowerCase().includes(query.toLowerCase());
}

function filterDonors(donors, filters, q) {
  return donors.filter(d => {
    const organ = d.organType || d.organ || '';
    if (filters.organType !== 'All' && normaliseOrgan(organ) !== normaliseOrgan(filters.organType)) return false;
    if (filters.bloodType !== 'All' && d.bloodType !== filters.bloodType) return false;
    if (filters.urgency   !== 'All' && d.urgency   !== filters.urgency)   return false;
    if (filters.availability === 'Available'   && d.isAvailable === false) return false;
    if (filters.availability === 'Unavailable' && d.isAvailable !== false) return false;
    if (q && !matchesQuery([d.name, organ, d.bloodType, d.location, d.urgency].join(' '), q)) return false;
    return true;
  });
}

function filterOrgans(organs, filters, q) {
  return organs.filter(o => {
    const organ     = o.organ || '';
    const bloodType = o.bloodType || '';
    const urgency   = o.urgency   || '';
    if (filters.organType !== 'All' && normaliseOrgan(organ) !== normaliseOrgan(filters.organType)) return false;
    if (filters.bloodType !== 'All' && bloodType !== filters.bloodType) return false;
    if (filters.urgency   !== 'All' && urgency   !== filters.urgency)   return false;
    if (q && !matchesQuery([organ, bloodType, o.location, urgency].join(' '), q)) return false;
    return true;
  });
}

function filterEmergency(requests, filters, q) {
  return requests.filter(r => {
    const organNeeded = r.organNeeded || r.organ_needed || '';
    const bloodType   = r.bloodType   || r.blood_type   || '';
    const urgency     = r.urgency     || '';
    if (filters.organType !== 'All' && normaliseOrgan(organNeeded) !== normaliseOrgan(filters.organType)) return false;
    if (filters.bloodType !== 'All' && bloodType !== filters.bloodType) return false;
    if (filters.urgency   !== 'All' && urgency   !== filters.urgency)   return false;
    const name = r.patientName || r.patient_name || '';
    const hosp = r.hospitalName || r.hospital_name || '';
    if (q && !matchesQuery([name, organNeeded, bloodType, hosp, r.location, urgency].join(' '), q)) return false;
    return true;
  });
}

function applySort(items, sortBy, nameKey = 'name') {
  const arr = [...items];
  switch (sortBy) {
    case 'urgency':
      return arr.sort((a, b) => (URGENCY_RANK[b.urgency] ?? 0) - (URGENCY_RANK[a.urgency] ?? 0));
    case 'name_asc':
      return arr.sort((a, b) => (a[nameKey] || '').localeCompare(b[nameKey] || ''));
    case 'name_desc':
      return arr.sort((a, b) => (b[nameKey] || '').localeCompare(a[nameKey] || ''));
    case 'date_desc':
      return arr.sort((a, b) => new Date(b.registeredAt || b.dateAdded || b.postedAt || 0) - new Date(a.registeredAt || a.dateAdded || a.postedAt || 0));
    case 'date_asc':
      return arr.sort((a, b) => new Date(a.registeredAt || a.dateAdded || a.postedAt || 0) - new Date(b.registeredAt || b.dateAdded || b.postedAt || 0));
    default:
      return arr;
  }
}

// ── Normalise DB emergency rows to match mock shape ───────────────────────────
function normaliseEmergency(rows) {
  return rows.map(r => ({
    id:           r.id,
    patientName:  r.patient_name  || r.patientName  || '—',
    organNeeded:  r.organ_needed  || r.organNeeded  || '—',
    bloodType:    r.blood_type    || r.bloodType    || '—',
    urgency:      r.urgency       || 'High',
    hospitalName: r.hospital_name || r.hospitalName || '—',
    location:     r.location      || '—',
    postedAt:     r.created_at    || r.postedAt     || new Date().toISOString(),
  }));
}

// ── Main hook ─────────────────────────────────────────────────────────────────

export function useSearch(mode = 'all') {
  const [rawDonors,    setRawDonors]    = useState([]);
  const [rawOrgans,    setRawOrgans]    = useState([]);
  const [rawEmergency, setRawEmergency] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [filters,      setFilters]      = useState(DEFAULT_FILTERS);

  const debouncedQuery = useDebounce(filters.query, 250);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [donorData, organData, emergencyData] = await Promise.allSettled([
        (mode === 'all' || mode === 'donors')    ? fetchDonorProfiles()     : Promise.resolve([]),
        (mode === 'all' || mode === 'organs')    ? fetchOrgans()            : Promise.resolve([]),
        (mode === 'all' || mode === 'emergency') ? fetchEmergencyRequests() : Promise.resolve([]),
      ]);

      setRawDonors(
        donorData.status === 'fulfilled' && donorData.value.length
          ? donorData.value.map(d => ({
              ...d,
              organType:   d.organ_type   || d.organType,
              bloodType:   d.blood_type   || d.bloodType,
              isAvailable: d.is_available ?? true,
            }))
          : MOCK_DONORS
      );

      setRawOrgans(
        organData.status === 'fulfilled' && organData.value.length
          ? organData.value
          : MOCK_ORGANS
      );

      setRawEmergency(
        emergencyData.status === 'fulfilled' && emergencyData.value.length
          ? normaliseEmergency(emergencyData.value)
          : MOCK_EMERGENCY
      );
    } catch (err) {
      setError(err);
      setRawDonors(MOCK_DONORS);
      setRawOrgans(MOCK_ORGANS);
      setRawEmergency(MOCK_EMERGENCY);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => { load(); }, [load]);

  const filteredDonors = useMemo(
    () => applySort(filterDonors(rawDonors, filters, debouncedQuery), filters.sortBy, 'name'),
    [rawDonors, filters, debouncedQuery]
  );

  const filteredOrgans = useMemo(
    () => applySort(filterOrgans(rawOrgans, filters, debouncedQuery), filters.sortBy, 'organ'),
    [rawOrgans, filters, debouncedQuery]
  );

  const filteredEmergency = useMemo(() => {
    const base = filters.emergencyOnly
      ? rawEmergency.filter(r => r.urgency === 'Critical' || r.urgency === 'Emergency')
      : rawEmergency;
    return applySort(filterEmergency(base, filters, debouncedQuery), filters.sortBy, 'patientName');
  }, [rawEmergency, filters, debouncedQuery]);

  const updateFilter  = useCallback((key, value) => setFilters(p => ({ ...p, [key]: value })), []);
  const resetFilters  = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (filters.query)                   n++;
    if (filters.organType    !== 'All')  n++;
    if (filters.bloodType    !== 'All')  n++;
    if (filters.urgency      !== 'All')  n++;
    if (filters.availability !== 'All')  n++;
    if (filters.emergencyOnly)           n++;
    return n;
  }, [filters]);

  return {
    filters, setFilters, updateFilter, resetFilters, activeFilterCount,
    donors: rawDonors, organs: rawOrgans, emergencyRequests: rawEmergency,
    filteredDonors, filteredOrgans, filteredEmergency,
    totalCounts:    { donors: rawDonors.length,       organs: rawOrgans.length,       emergency: rawEmergency.length    },
    filteredCounts: { donors: filteredDonors.length,  organs: filteredOrgans.length,  emergency: filteredEmergency.length },
    loading, error, refresh: load,
  };
}
