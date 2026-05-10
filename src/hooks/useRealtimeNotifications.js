/**
 * hooks/useRealtimeNotifications.js
 * ─────────────────────────────────────────────────────────────
 * Manages the current user's notification inbox with live updates.
 *
 * Behaviour:
 *   • Fetches unread notifications on mount
 *   • INSERT → prepend new notification + increment unread count
 *   • Exposes markAsRead, markAllAsRead, dismiss helpers
 *   • Plays a subtle sound on new notification (optional)
 *
 * Requires: user must be authenticated (uses useAuth internally)
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase }                          from '../lib/supabase';
import { normaliseError }                    from '../lib/handleError';
import { subscribeToUserNotifications, CHANNEL_STATUS }
                                             from '../services/realtimeService';
import { useAuth }                           from '../context/AuthContext';

/**
 * @param {object}  [opts]
 * @param {number}  [opts.limit=20]       - Max notifications to fetch
 * @param {boolean} [opts.unreadOnly=false] - Fetch only unread notifications
 * @returns {{
 *   notifications:   Array,
 *   unreadCount:     number,
 *   isLoading:       boolean,
 *   isLive:          boolean,
 *   connectionStatus: string,
 *   error:           string|null,
 *   markAsRead:      (id: string) => Promise<void>,
 *   markAllAsRead:   () => Promise<void>,
 *   dismiss:         (id: string) => Promise<void>,
 *   reload:          Function,
 * }}
 */
export function useRealtimeNotifications({ limit = 20, unreadOnly = false } = {}) {
  const { user } = useAuth();

  const [notifications,     setNotifications]     = useState([]);
  const [isLoading,         setIsLoading]         = useState(true);
  const [isLive,            setIsLive]            = useState(false);
  const [connectionStatus,  setConnectionStatus]  = useState(CHANNEL_STATUS.CONNECTING);
  const [error,             setError]             = useState(null);

  const unreadCount = notifications.filter((n) => !n.is_read && !n.is_dismissed).length;

  // ── New notification handler ─────────────────────────────────
  const handleNewNotification = useCallback((payload) => {
    const { eventType, new: newRow } = payload;
    if (eventType !== 'INSERT') return;

    setNotifications((prev) => {
      if (prev.some((n) => n.id === newRow.id)) return prev;
      return [newRow, ...prev];
    });
  }, []);

  const handleStatus = useCallback((status, err) => {
    setConnectionStatus(status);
    setIsLive(status === CHANNEL_STATUS.SUBSCRIBED);
    if (err) setError(err.message || 'Realtime connection error');
  }, []);

  // ── Initial fetch ────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (unreadOnly) query = query.eq('is_read', false);

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setNotifications(data ?? []);
    } catch (err) {
      console.warn('[useRealtimeNotifications] fetch failed:', err.message);
      setError(normaliseError(err)?.message ?? err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, limit, unreadOnly]);

  // ── Subscribe ────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    load();

    const subscription = subscribeToUserNotifications(
      user.id,
      handleNewNotification,
      handleStatus
    );

    return () => subscription.unsubscribe();
  }, [user?.id, load, handleNewNotification, handleStatus]);

  // ── Actions ──────────────────────────────────────────────────

  /**
   * Mark a single notification as read.
   * @param {string} id
   */
  const markAsRead = useCallback(async (id) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
    );
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    } catch (err) {
      // Rollback optimistic update on failure
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: false, read_at: null } : n))
      );
      console.error('[useRealtimeNotifications] markAsRead failed:', err);
    }
  }, [user?.id]);

  /**
   * Mark all unread notifications as read.
   */
  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (!unreadIds.length) return;

    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    );
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds)
        .eq('user_id', user.id);
      if (error) throw error;
    } catch (err) {
      // Reload to restore correct state
      load();
      console.error('[useRealtimeNotifications] markAllAsRead failed:', err);
    }
  }, [notifications, user?.id, load]);

  /**
   * Dismiss (soft-delete) a notification.
   * @param {string} id
   */
  const dismiss = useCallback(async (id) => {
    // Optimistic remove
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_dismissed: true })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    } catch (err) {
      // Reload to restore
      load();
      console.error('[useRealtimeNotifications] dismiss failed:', err);
    }
  }, [user?.id, load]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isLive,
    connectionStatus,
    error,
    markAsRead,
    markAllAsRead,
    dismiss,
    reload: load,
  };
}
