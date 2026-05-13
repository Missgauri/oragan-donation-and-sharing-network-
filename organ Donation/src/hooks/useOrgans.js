import { useState, useEffect } from 'react';
import { fetchOrgans } from '../services/organService';

const MOCK_ORGANS = [
  { id: 1, organ: 'Kidney',         bloodType: 'O+',  location: 'Delhi, IN',      urgency: 'High',     dateAdded: '2024-10-25' },
  { id: 2, organ: 'Liver (Partial)',bloodType: 'A-',  location: 'Mumbai, MH',     urgency: 'Medium',   dateAdded: '2024-10-26' },
  { id: 3, organ: 'Heart',          bloodType: 'AB+', location: 'Bangalore, KA',  urgency: 'Critical', dateAdded: '2024-10-27' },
  { id: 4, organ: 'Lungs',          bloodType: 'O-',  location: 'Chennai, TN',    urgency: 'High',     dateAdded: '2024-10-28' },
  { id: 5, organ: 'Bone Marrow',    bloodType: 'B+',  location: 'Hyderabad, TS',  urgency: 'Medium',   dateAdded: '2024-10-29' },
  { id: 6, organ: 'Kidney',         bloodType: 'B+',  location: 'Pune, MH',       urgency: 'High',     dateAdded: '2024-11-01' },
  { id: 7, organ: 'Cornea',         bloodType: 'A+',  location: 'Jaipur, RJ',     urgency: 'Low',      dateAdded: '2024-11-02' },
  { id: 8, organ: 'Liver (Partial)',bloodType: 'O+',  location: 'Kolkata, WB',    urgency: 'High',     dateAdded: '2024-11-03' },
];

/**
 * Hook that loads organs from the database, falling back to mock data.
 */
export function useOrgans() {
  const [organs, setOrgans]   = useState(MOCK_ORGANS);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    fetchOrgans()
      .then(data => { if (data.length > 0) setOrgans(data); })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { organs, setOrgans, loading, error };
}
