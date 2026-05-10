/**
 * context/AuthContext.jsx
 * Provides auth user, session, profile (with role), and auth actions
 * to the entire component tree.
 *
 * Shape exposed via useAuth():
 * {
 *   user,        — Supabase auth user (or null)
 *   session,     — Supabase session (or null)
 *   profile,     — profiles table row: { role, full_name, email, ... } (or null)
 *   role,        — shortcut: profile?.role (or null)
 *   isLoading,   — true while session + profile are being fetched
 *   isAuthenticated, — true when user is signed in
 *   signUp, signIn, signOut, forgotPassword, resetPassword
 * }
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase }          from '../lib/supabase';
import {
  signUp   as authSignUp,
  signIn   as authSignIn,
  signOut  as authSignOut,
  forgotPassword as authForgotPassword,
  resetPassword  as authResetPassword,
  onAuthStateChange,
} from '../services/authService';
import { fetchProfile } from '../services/profileService';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user,      setUser]      = useState(null);
  const [session,   setSession]   = useState(null);
  const [profile,   setProfile]   = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile whenever the user changes
  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null);
      return;
    }
    const { data } = await fetchProfile(authUser.id);
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    // 1. Restore existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      await loadProfile(session?.user ?? null);
      setIsLoading(false);
    });

    // 2. React to future auth events (login, logout, token refresh)
    const unsubscribe = onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      await loadProfile(session?.user ?? null);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [loadProfile]);

  // ─── Exposed actions ────────────────────────────────────────────────────────

  const signUp = useCallback(async (params) => {
    setIsLoading(true);
    const result = await authSignUp(params);
    setIsLoading(false);
    return result;
  }, []);

  const signIn = useCallback(async (email, password) => {
    setIsLoading(true);
    const result = await authSignIn(email, password);
    setIsLoading(false);
    return result;
  }, []);

  const signOut = useCallback(async () => {
    const result = await authSignOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    return result;
  }, []);

  const forgotPassword = useCallback((email) => authForgotPassword(email), []);
  const resetPassword  = useCallback((pwd)   => authResetPassword(pwd),    []);

  // ─── Value ──────────────────────────────────────────────────────────────────

  const value = {
    user,
    session,
    profile,
    role:            profile?.role ?? null,
    isLoading,
    isAuthenticated: !!user,
    // actions
    signUp,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;
