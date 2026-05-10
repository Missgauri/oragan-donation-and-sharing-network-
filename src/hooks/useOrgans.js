import { useState, useEffect } from 'react';
import { fetchOrgans } from '../services/organService';
import { MOCK_ORGANS } from '../utils/mockData';

/**
 * useOrgans
 * Loads the organ registry from Supabase on mount.
 * Falls back to MOCK_ORGANS if the DB is unreachable or empty.
 *
 * @returns {{ organs: Array, isLoading: boolean, error: string|null, reload: Function }}
 */
export function useOrgans() {
  const [organs, setOrgans]       = useState(MOCK_ORGANS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await fetchOrgans();
      if (fetchError) throw fetchError;
      if (data && data.length > 0) setOrgans(data);
    } catch (err) {
      console.warn('useOrgans: falling back to mock data.', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { organs, isLoading, error, reload: load };
}
