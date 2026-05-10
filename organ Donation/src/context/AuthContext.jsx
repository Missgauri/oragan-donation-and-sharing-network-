import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

/**
 * Roles supported by the platform.
 * Each user has one role stored in their profile metadata.
 */
export const ROLES = {
  DONOR:    'donor',
  RECEIVER: 'receiver',
  HOSPITAL: 'hospital',
  ADMIN:    'admin',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);   // Supabase auth user
  const [role, setRole]       = useState(null);   // donor | receiver | hospital | admin
  const [loading, setLoading] = useState(true);

  // Restore session on mount and listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setRole(session?.user?.user_metadata?.role ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setRole(session?.user?.user_metadata?.role ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, userRole) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role: userRole } },
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
