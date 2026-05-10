import { useState, useEffect } from 'react';
import { fetchMatches, subscribeToMatches, unsubscribeChannel } from '../services/organService';
import { MOCK_MATCHES } from '../utils/mockData';

/**
 * useMatches
 * Fetches active organ matches and subscribes to real-time Supabase updates.
 * Falls back to MOCK_MATCHES if the DB is unreachable.
 *
 * @returns {{ matches: Array, isLoading: boolean }}
 */
export function useMatches() {
  const [matches, setMatches]     = useState(MOCK_MATCHES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const load = async () => {
      try {
        const { data } = await fetchMatches();
        if (data && data.length > 0) setMatches(data);
      } catch {
        console.log('useMatches: using mock data.');
      } finally {
        setIsLoading(false);
      }
    };
    load();

    // Real-time subscription
    const channel = subscribeToMatches((payload) => {
      setMatches((current) => [
        payload.new,
        ...current.filter(
          (m) => m.id !== payload.old?.id && m.id !== payload.new?.id
        ),
      ]);
    });

    return () => {
      unsubscribeChannel(channel);
    };
  }, []);

  return { matches, isLoading };
}
