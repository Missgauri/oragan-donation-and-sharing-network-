/**
 * context/RealtimeContext.jsx
 * ─────────────────────────────────────────────────────────────
 * App-wide realtime state provider.
 *
 * Aggregates all four realtime hooks into one context so any
 * component can access live data without prop-drilling or
 * creating duplicate subscriptions.
 *
 * Usage:
 *   const { notifications, unreadCount, emergencies, matches } = useRealtime();
 *
 * Wrap your app:
 *   <RealtimeProvider>
 *     <App />
 *   </RealtimeProvider>
 *
 * Note: RealtimeProvider must be inside AuthProvider because
 * useRealtimeNotifications depends on useAuth().
 * ─────────────────────────────────────────────────────────────
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { useAuth }                       from './AuthContext';
import { useRealtimeMatches }            from '../hooks/useRealtimeMatches';
import { useRealtimeEmergencies }        from '../hooks/useRealtimeEmergencies';
import { useRealtimeNotifications }      from '../hooks/useRealtimeNotifications';
import { useRealtimeDonors }             from '../hooks/useRealtimeDonors';
import { getActiveChannels, removeAllChannels }
                                         from '../lib/realtimeManager';
import { CHANNEL_STATUS }                from '../services/realtimeService';

// ─── Context ──────────────────────────────────────────────────────────────────

const RealtimeContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const RealtimeProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // ── Matches ─────────────────────────────────────────────────
  const matchesState = useRealtimeMatches();

  // ── Emergencies ─────────────────────────────────────────────
  const emergenciesState = useRealtimeEmergencies();

  // ── Notifications (only when signed in) ─────────────────────
  const notificationsState = useRealtimeNotifications({ limit: 30 });

  // ── Donor availability (admin / hospital view) ───────────────
  const donorsState = useRealtimeDonors();

  // ── Cleanup all channels on sign-out ────────────────────────
  const wasAuthenticated = useRef(isAuthenticated);
  useEffect(() => {
    if (wasAuthenticated.current && !isAuthenticated) {
      // User just signed out — tear down all realtime channels
      removeAllChannels();
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  // ── Connection health summary ────────────────────────────────
  const connectionHealth = {
    matches:       matchesState.connectionStatus,
    emergencies:   emergenciesState.connectionStatus,
    notifications: notificationsState.connectionStatus,
    donors:        donorsState.connectionStatus,
    allConnected: [
      matchesState.connectionStatus,
      emergenciesState.connectionStatus,
      notificationsState.connectionStatus,
      donorsState.connectionStatus,
    ].every((s) => s === CHANNEL_STATUS.SUBSCRIBED),
    activeChannels: getActiveChannels(),
  };

  // ─── Value ──────────────────────────────────────────────────
  const value = {
    // Matches
    matches:              matchesState.matches,
    matchesLoading:       matchesState.isLoading,
    matchesLive:          matchesState.isLive,
    reloadMatches:        matchesState.reload,

    // Emergencies
    emergencies:          emergenciesState.emergencies,
    activeEmergencyCount: emergenciesState.activeCount,
    emergenciesLoading:   emergenciesState.isLoading,
    emergenciesLive:      emergenciesState.isLive,
    reloadEmergencies:    emergenciesState.reload,

    // Notifications
    notifications:        notificationsState.notifications,
    unreadCount:          notificationsState.unreadCount,
    notificationsLoading: notificationsState.isLoading,
    notificationsLive:    notificationsState.isLive,
    markAsRead:           notificationsState.markAsRead,
    markAllAsRead:        notificationsState.markAllAsRead,
    dismissNotification:  notificationsState.dismiss,
    reloadNotifications:  notificationsState.reload,

    // Donors
    donors:               donorsState.donors,
    activeDonorCount:     donorsState.activeCount,
    matchedDonorCount:    donorsState.matchedCount,
    donorsLoading:        donorsState.isLoading,
    donorsLive:           donorsState.isLive,
    reloadDonors:         donorsState.reload,

    // Health
    connectionHealth,
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useRealtime = () => {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime must be used inside <RealtimeProvider>');
  return ctx;
};

export default RealtimeContext;
