import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { useAuth } from './AuthContext';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
  NOTIFICATION_TYPES,
} from '../services/notificationService';

const NotificationContext = createContext(null);

/**
 * How long (ms) each toast stays visible before auto-dismissing.
 */
const TOAST_DURATION = 5000;

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();

  // ── State ────────────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [toasts,        setToasts]        = useState([]);
  const [loading,       setLoading]       = useState(false);

  // Stable ref so the realtime callback always sees the latest setter
  const setNotificationsRef = useRef(setNotifications);
  setNotificationsRef.current = setNotifications;

  // ── Derived ──────────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // ── Toast helpers ────────────────────────────────────────────────────────
  const addToast = useCallback((notification) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...notification, toastId: id }]);

    // Auto-dismiss after TOAST_DURATION
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.toastId !== id));
    }, TOAST_DURATION);
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts((prev) => prev.filter((t) => t.toastId !== toastId));
  }, []);

  // ── Load notifications on login ──────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    fetchNotifications()
      .then((data) => setNotifications(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  // ── Realtime subscription ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const channel = subscribeToNotifications(user.id, (newNotification) => {
      // Prepend to list
      setNotificationsRef.current((prev) => [newNotification, ...prev]);
      // Show toast
      addToast(newNotification);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [user, addToast]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleMarkAsRead = useCallback(async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        loading,
        markAsRead:    handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        deleteNotification: handleDelete,
        dismissToast,
        NOTIFICATION_TYPES,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
};
