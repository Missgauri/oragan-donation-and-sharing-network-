/**
 * useMatches
 *
 * Re-exports useRealtimeMatches as the canonical hook for match data.
 * Replaces the old implementation that used the deprecated
 * supabase.removeChannel() API and created an unmanaged second channel.
 */
export { useRealtimeMatches as useMatches } from './useRealtimeMatches';
