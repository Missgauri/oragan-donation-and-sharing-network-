/**
 * context/AuthContext.jsx
 * ─────────────────────────────────────────────────────────────
 * Provides the current Supabase auth user and session to the
 * entire component tree via React Context.
 *
 * Usage:
 *   1. Wrap your app with <AuthProvider> (already done in main.jsx below)
 *   2. In any component: const { user, session, isLoading } = useAuth();
 *
 * The app currently works without authentication (public access via RLS).
 * This context is ready to activate when you add login/signup pages.
 * ─────────────────────────────────────────────────────────────
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase }          from '../lib/supabase';
import { onAuthStateChange } from '../services/authService';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext({
  user:      null,
  session:   null,
  isLoading: true,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * @param {{ children: React.ReactNode }} props
 */
export const AuthProvider = ({ children }) => {
  const [user,      setUser]      = useState(null);
  const [session,   setSession]   = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Load existing session on mount (handles page refresh)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // 2. Subscribe to future auth changes
    const unsubscribe = onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access the current auth state from any component.
 *
 * @returns {{ user: import('@supabase/supabase-js').User|null, session: import('@supabase/supabase-js').Session|null, isLoading: boolean }}
 *
 * @example
 * const { user, isLoading } = useAuth();
 * if (isLoading) return <Spinner />;
 * if (!user) return <Navigate to="/login" />;
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
};

export default AuthContext;
