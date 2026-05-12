import { supabase } from '../lib/supabase';

/**
 * Notification types used across the platform.
 */
export const NOTIFICATION_TYPES = {
  MATCH:            'match',
  REQUEST_ACCEPTED: 'request_accepted',
  EMERGENCY:        'emergency',
  SYSTEM:           'system',
};

/**
 * Fetch all notifications for the current authenticated user,
 * ordered newest-first.
 *
 * @returns {Promise<Array>} Array of notification records
 */
export async function fetchNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

/**
 * Mark a single notification as read.
 *
 * @param {number|string} id - Notification ID
 */
export async function markAsRead(id) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw error;
}

/**
 * Mark all notifications for the current user as read.
 */
export async function markAllAsRead() {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);

  if (error) throw error;
}

/**
 * Delete a single notification.
 *
 * @param {number|string} id - Notification ID
 */
export async function deleteNotification(id) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Create a notification for a specific user.
 * Typically called server-side or by admin/hospital roles.
 *
 * @param {string} userId   - Target user UUID
 * @param {string} type     - NOTIFICATION_TYPES value
 * @param {string} title    - Short heading
 * @param {string} message  - Full message body
 * @param {Object} metadata - Optional extra data
 */
export async function createNotification(userId, type, title, message, metadata = null) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([{ user_id: userId, type, title, message, metadata }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Subscribe to realtime INSERT events on the notifications table
 * for the current authenticated user.
 *
 * @param {string}   userId   - Current user UUID (used as channel name)
 * @param {Function} onInsert - Callback receiving the new notification record
 * @returns {Object} Supabase channel — call .unsubscribe() to clean up
 */
export function subscribeToNotifications(userId, onInsert) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new) onInsert(payload.new);
      }
    )
    .subscribe();

  return channel;
}
