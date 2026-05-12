import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { fetchOrgans }         from '../services/organService';
import { fetchDonorProfiles }  from '../services/matchService';
import { normaliseOrgan }      from '../utils/matchingEngine';

// ── Constants ─────────────────────────────────────────────────────────────────

export const ORGAN_OPTIONS   = ['All', 'Kidney', 'Liver', 'Heart', 'Lungs', 'Bone Marrow', 'Pancreas', 'Cornea'];
export const BLOOD_OPTIONS   = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
export const URGENCY_OPTIONS = ['All', 'Critical', 'Emergency', 'High', 'Medium', 'Low', 'Voluntary'];
export const SORT_OPTIONS    = [
  { value: 'default',    label: 'Default'         },
  { value: 'urgency',    label: 'Urgency (High→Low)' },
  { value: 'name_asc',   label: 'Name (A→Z)'      },
  { value: 'name_desc',  label: 'Name (Z→A)'      },
  { value: 'date_desc',  label: 'Newest First'     },
  { value: 'date_asc',   label: 'Oldest First'     },
];

const URGENCY_RANK = {
  Critical: 5, Emergency: 4, High: 3, Medium: 2, Low: 1, Voluntary: 0,
};

// ── Mock data fallbacks ───────────────────────────────────────────────────────

export const MOCK_DONORS = [
  { id: 'd1',  name: 'Rahul Sharma',   organType: 'Kidney',     bloodType: 'O+',  location: 'Delhi, IN',      urgency: 'Voluntary', isAvailable: true,  registeredAt: '2024-10-25' },
  { id: 'd2',  name: 'Priya Mehta',    organType: 'Liver',      bloodType: 'A-',  location: 'Mumbai, MH',     urgency: 'Voluntary', isAvailable: true,  registeredAt: '2024-10-26' },
  { id: 'd3',  name: 'Amit Patel',     organType: 'Heart',      bloodType: 'AB+', location: 'Bangalore, KA',  urgency: 'High',      isAvailable: true,  registeredAt: '2024-10-27' },
  { id: 'd4',  name: 'Sunita Rao',     organType: 'Lungs',      bloodType: 'O-',  location: 'Chennai, TN',    urgency: 'High',      isAvailable: true,  registeredAt: '2024-10-28' },
  { id: 'd5',  name: 'Vikram Singh',   organType: 'Kidney',     bloodType: 'B+',  location: 'Hyderabad, TS',  urgency: 'Voluntary', isAvailable: false, registeredAt: '2024-10-29' },
  { id: 'd6',  name: 'Ananya Iyer',    organType: 'Kidney',     bloodType: 'O-',  location: 'Pune, MH',       urgency: 'Voluntary', isAvailable: true,  registeredAt: '2024-11-01' },
  { id: 'd7',  name: 'Deepak Nair',    organType: 'Liver',      bloodType: 'B-',  location: 'Kochi, KL',      urgency: 'Medium',    isAvailable: true,  registeredAt: '2024-11-02' },
  { id: 'd8',  name: 'Kavya Reddy',    organType: 'Kidney',     bloodType: 'A+',  location: 'Vizag, AP',      urgency: 'Voluntary', isAvailable: true,  registeredAt: '2024-11-03' },
  { id: 'd9',  name: 'Mohan Das',      organType: 'Heart',      bloodType: 'O+',  location: 'Kolkata, WB',    urgency: 'Critical',  isAvailable: true,  registeredAt: '2024-11-04' },
  { id: 'd10', name: 'Ritu Kapoor',    organType: 'Lungs',      bloodType: 'AB-', location: 'Jaipur, RJ',     urgency: 'Medium',    isAvailable: true,  registeredAt: '2024-11-05' },
  { id: 'd11', name: 'Arjun Verma',    organType: 'Cornea',     bloodType: 'B+',  location: 'Lucknow, UP',    urgency: 'Low',       isAvailable: true,  registeredAt: '2024-11-06' },
  { id: 'd12', name: 'Meena Pillai',   organType: 'Bone Marrow',bloodType: 'O+',  location: 'Trivandrum, KL', urgency: 'High',      isAvailable: true,  registeredAt: '2024-11-07' },
];

export const MOCK_EMERGENCY = [
  { id: 'e1', patientName: 'PT-4921', organNeeded: 'Kidney',  bloodType: 'O+',  urgency: 'Critical',  hospitalName: 'AIIMS Delhi',       location: 'Delhi, IN',     postedAt: '2024-11-10T08:00:00Z' },
  { id: 'e2', patientName: 'PT-3304', organNeeded: 'Heart',   bloodType: 'AB+', urgency: 'Emergency', hospitalName: 'Apollo Bangalore',  location: 'Bangalore, KA', postedAt: '2024-11-10T09:30:00Z' },
  { id: 'e3', patientName: 'PT-8812', organNeeded: 'Liver',   bloodType: 'A-',  urgency: 'High',      hospitalName: 'Fortis Mumbai',     location: 'Mumbai, MH',    postedAt: '2024-11-09T14:00:00Z' },
  { id: 'e4', patientName: 'PT-2201', organNeeded: 'Lungs',   bloodType: 'O-',  urgency: 'Emergency', hospitalName: 'CMC Vellore',       location: 'Vellore, TN',   postedAt: '2024-11-10T06:00:00Z' },
  { id: 'e5', patientName: 'PT-5512', organNeeded: 'Kidney',  bloodType: 'B+',  urgency: 'High',      hospitalName: 'PGI Chandigarh',    location: 'Chandigarh, PB',postedAt: '2024-11-08T11:00:00Z' },
];

// ── Default filter state ──────────────────────────────────────────────────────

export const DEFAULT_FILTERS = {
  query:        '',
  organType:    'All',
  bloodType:    'All',
  urgency:      'All',
  availability: 'All',   // 'All' | 'Available' | 'Unavailable'
  emergencyOnly:false,
  sortBy:       'default',
};

// ── Debounce helper ───────────────────────────────────────────────────────────

function useDebounce(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Filtering helpers ─────────────────────────────────────────────────────────

function matchesQuery(haystack, query) {
  if (!query) return true;
  return haystack.toLowerCase().includes(query.toLowerCase());
}

function filterDonors(donors, filters, debouncedQuery) {
  return donors.filter((d) => {
    const organ = d.organType || d.organ || '';

    if (filters.organType !== 'All' && normaliseOrgan(organ) !== normaliseOrgan(filters.organType)) return false;
    if (filters.bloodType !== 'All' && d.bloodType !== filters.bloodType) return false;
    if (filters.urgency   !== 'All' && d.urgency   !== filters.urgency)   return false;
    if (filters.availability === 'Available'   && d.isAvailable === false) return false;
    if (filters.availability === 'Unavailable' && d.isAvailable !== false) return false;

    if (debouncedQuery) {
      const hay = [d.name, organ, d.bloodType, d.location, d.urgency].join(' ');
      if (!matchesQuery(hay, debouncedQuery)) return false;
    }
    return true;
  });
}

function filterOrgans(organs, filters, debouncedQuery) {
  return organs.filter((o) => {
    const organ = o.organ || '';

    if (filters.organType !== 'All' && normaliseOrgan(organ) !== normaliseOrgan(filters.organType)) return false;
    if (filters.bloodType !== 'All' && o.bloodType !== filters.bloodType) return false;
    if (filters.urgency   !== 'All' && o.urgency   !== filters.urgency)   return false;

    if (debouncedQuery) {
      const hay = [organ, o.bloodType, o.location, o.urgency].join(' ');
      if (!matchesQuery(hay, debouncedQuery)) return false;
    }
    return true;
  });
}

function filterEmergency(requests, filters, debouncedQuery) {
  return requests.filter((r) => {
    if (filters.organType !== 'All' && normaliseOrgan(r.organNeeded) !== normaliseOrgan(filters.organType)) return false;
    if (filters.bloodType !== 'All' && r.bloodType !== filters.bloodType) return false;
    if (filters.urgency   !== 'All' && r.urgency   !== filters.urgency)   return false;

    if (debouncedQuery) {
      const hay = [r.patientName, r.organNeeded, r.bloodType, r.hospitalName, r.location, r.urgency].join(' ');
      if (!matchesQuery(hay, debouncedQuery)) return false;
    }
    return true;
  });
}

// ── Sort helper ───────────────────────────────────────────────────────────────

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

// ── Main hook ─────────────────────────────────────────────────────────────────

/**
 * useSearch
 *
 * Unified search + filter hook for donors, organs, and emergency requests.
 *
 * @param {'donors'|'organs'|'emergency'|'all'} mode
 *
 * Returns:
 *   filters, setFilters, updateFilter, resetFilters
 *   donors, organs, emergencyRequests          — raw data
 *   filteredDonors, filteredOrgans, filteredEmergency — after filters
 *   totalCounts, filteredCounts
 *   loading, error, refresh
 *   activeFilterCount                          — number of non-default filters active
 */
export function useSearch(mode = 'all') {
  const [rawDonors,    setRawDonors]    = useState([]);
  const [rawOrgans,    setRawOrgans]    = useState([]);
  const [rawEmergency, setRawEmergency] = useState(MOCK_EMERGENCY);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [filters,      setFilters]      = useState(DEFAULT_FILTERS);

  const debouncedQuery = useDebounce(filters.query, 250);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const promises = [];
      if (mode === 'all' || mode === 'donors')  promises.push(fetchDonorProfiles());
      else                                       promises.push(Promise.resolve([]));
      if (mode === 'all' || mode === 'organs')  promises.push(fetchOrgans());
      else                                       promises.push(Promise.resolve([]));

      const [donorData, organData] = await Promise.all(promises);

      setRawDonors(donorData.length  ? donorData  : MOCK_DONORS);
      setRawOrgans(organData.length  ? organData  : []);
    } catch (err) {
      setError(err);
      setRawDonors(MOCK_DONORS);
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => { load(); }, [load]);

  // ── Filter ───────────────────────────────────────────────────────────────
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
      ? rawEmergency.filter((r) => r.urgency === 'Critical' || r.urgency === 'Emergency')
      : rawEmergency;
    return applySort(filterEmergency(base, filters, debouncedQuery), filters.sortBy, 'patientName');
  }, [rawEmergency, filters, debouncedQuery]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.query)                    count++;
    if (filters.organType    !== 'All')   count++;
    if (filters.bloodType    !== 'All')   count++;
    if (filters.urgency      !== 'All')   count++;
    if (filters.availability !== 'All')   count++;
    if (filters.emergencyOnly)            count++;
    return count;
  }, [filters]);

  return {
    // State
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    activeFilterCount,
    // Raw data
    donors:           rawDonors,
    organs:           rawOrgans,
    emergencyRequests:rawEmergency,
    // Filtered
    filteredDonors,
    filteredOrgans,
    filteredEmergency,
    // Counts
    totalCounts: {
      donors:    rawDonors.length,
      organs:    rawOrgans.length,
      emergency: rawEmergency.length,
    },
    filteredCounts: {
      donors:    filteredDonors.length,
      organs:    filteredOrgans.length,
      emergency: filteredEmergency.length,
    },
    // Async
    loading,
    error,
    refresh: load,
  };
}
