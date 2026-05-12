/**
 * useRealtimeTable
 *
 * Low-level primitive hook. Subscribes to postgres_changes on a single
 * table and calls the appropriate handler for INSERT / UPDATE / DELETE.
 *
 * Features:
 *   - Uses the centralized RealtimeManager (no duplicate channels)
 *   - Stable subscription across re-renders (handlers wrapped in refs)
 *   - Automatic cleanup on unmount
 *   - Optional row-level filter (e.g. `user_id=eq.${userId}`)
 *
 * @param {Object}   options
 * @param {string}   options.table      - Supabase table name
 * @param {string}   [options.filter]   - Postgres filter string
 * @param {string}   [options.schema]   - DB schema (default 'public')
 * @param {string}   [options.event]    - '*' | 'INSERT' | 'UPDATE' | 'DELETE'
 * @param {Function} [options.onInsert] - (newRow) => void
 * @param {Function} [options.onUpdate] - (newRow, oldRow) => void
 * @param {Function} [options.onDelete] - (oldRow) => void
 * @param {boolean}  [options.enabled]  - Set false to skip subscription
 *
 * @example
 *   useRealtimeTable({
 *     table: 'matches',
 *     onInsert: (row) => setMatches(prev => [row, ...prev]),
 *     onUpdate: (row) => setMatches(prev => prev.map(m => m.id === row.id ? row : m)),
 *     onDelete: (row) => setMatches(prev => prev.filter(m => m.id !== row.id)),
 *   });
 */

import { useEffect, useRef } from 'react';
import { realtimeManager } from '../lib/realtimeManager';

export function useRealtimeTable({
  table,
  filter,
  schema  = 'public',
  event   = '*',
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}) {
  // Keep handlers in refs so the subscription builder never needs to change
  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);

  useEffect(() => { onInsertRef.current = onInsert; }, [onInsert]);
  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);
  useEffect(() => { onDeleteRef.current = onDelete; }, [onDelete]);

  useEffect(() => {
    if (!enabled || !table) return;

    // Channel name includes filter so filtered/unfiltered channels don't collide
    const channelName = filter
      ? `rt:${table}:${filter}`
      : `rt:${table}`;

    const pgConfig = { event, schema, table };
    if (filter) pgConfig.filter = filter;

    const builder = (channel) => {
      channel.on('postgres_changes', pgConfig, (payload) => {
        const { eventType, new: newRow, old: oldRow } = payload;

        if (eventType === 'INSERT' && onInsertRef.current) {
          onInsertRef.current(newRow);
        } else if (eventType === 'UPDATE' && onUpdateRef.current) {
          onUpdateRef.current(newRow, oldRow);
        } else if (eventType === 'DELETE' && onDeleteRef.current) {
          onDeleteRef.current(oldRow);
        }
      });
    };

    const unsub = realtimeManager.subscribe(channelName, builder);
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, filter, schema, event, enabled]);
}
