/**
 * useRealtimeNotifications
 *
 * Subscribes to realtime INSERT events on the notifications table
 * filtered to the current user. Calls onNew for each incoming notification.
 *
 * Replaces the inline subscription in NotificationContext with a
 * properly managed, deduplicated hook.
 *
 * @param {string}   userId  - Current user UUID (subscription is skipped if falsy)
 * @param {Function} onNew   - (notification) => void — called for each new row
 */

import { useRealtimeTable } from './useRealtimeTable';

export function useRealtimeNotifications(userId, onNew) {
  useRealtimeTable({
    table:    'notifications',
    filter:   userId ? `user_id=eq.${userId}` : undefined,
    event:    'INSERT',
    enabled:  Boolean(userId),
    onInsert: onNew,
  });
}
