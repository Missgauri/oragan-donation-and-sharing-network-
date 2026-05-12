import { useState, useEffect } from 'react';
import { fetchMatches, subscribeToMatches } from '../services/matchService';
import { supabase } from '../lib/supabase';

const MOCK_MATCHES = [
  { id: 101, patientRef: 'PT-4921', organ: 'Kidney', matchScore: 98, status: 'Transporting', eta: '2 hrs' },
  { id: 102, patientRef: 'PT-3304', organ: 'Heart',  matchScore: 92, status: 'Preparing Match', eta: 'N/A' },
  { id: 103, patientRef: 'PT-8812', organ: 'Liver',  matchScore: 85, status: 'Pending Review', eta: 'N/A' },
];

/**
 * Hook that fetches matches and subscribes to real-time updates.
 */
export function useMatches() {
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    fetchMatches()
      .then(data => { if (data.length > 0) setMatches(data); })
      .catch(err => setError(err))
      .finally(() => setLoading(false));

    const channel = subscribeToMatches((payload) => {
      setMatches(current => [
        payload.new,
        ...current.filter(m => m.id !== payload.old?.id && m.id !== payload.new?.id)
      ]);
    });

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { matches, loading, error };
}
