/**
 * services/authService.js
 * All Supabase Auth operations — signup, login, logout, password reset.
 * Every function returns { data, error: AppError | null }.
 */

import { supabase }                      from '../lib/supabase';
import { normaliseError, getFriendlyMessage } from '../lib/handleError';
import { createProfile }                 from './profileService';

// ─── Sign Up (with role) ──────────────────────────────────────────────────────

/**
 * Register a new user and create their profile row with a role.
 *
 * @param {{ email: string, password: string, fullName: string, role: string, phone?: string }} params
 * @returns {Promise<{ data: object|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function signUp({ email, password, fullName, role, phone = '' }) {
  try {
    // 1. Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (error) {
      const appError = normaliseError(error);
      return { data: null, error: { ...appError, message: getFriendlyMessage(appError) } };
    }

    // 2. Create profile row (user_id links to auth.users)
    if (data.user) {
      const { error: profileError } = await createProfile({
        userId:   data.user.id,
        fullName,
        email,
        role,
        phone,
      });
      if (profileError) {
        console.warn('[authService.signUp] Profile creation failed:', profileError);
        // Don't block signup — profile can be created on next login
      }
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

/**
 * Sign in with email + password.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ data: object|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const appError = normaliseError(error);
      return { data: null, error: { ...appError, message: getFriendlyMessage(appError) } };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

/**
 * Sign out the current user and clear the local session.
 *
 * @returns {Promise<{ error: import('../lib/handleError').AppError|null }>}
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { error: normaliseError(error) };
    return { error: null };
  } catch (err) {
    return { error: normaliseError(err) };
  }
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

/**
 * Send a password reset email.
 *
 * @param {string} email
 * @returns {Promise<{ data: object|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function forgotPassword(email) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      const appError = normaliseError(error);
      return { data: null, error: { ...appError, message: getFriendlyMessage(appError) } };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

// ─── Reset Password (after email link) ───────────────────────────────────────

/**
 * Set a new password. Call this on the /auth/reset-password page
 * after the user arrives via the email link.
 *
 * @param {string} newPassword
 * @returns {Promise<{ data: object|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function resetPassword(newPassword) {
  try {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      const appError = normaliseError(error);
      return { data: null, error: { ...appError, message: getFriendlyMessage(appError) } };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}

// ─── Auth State Listener ──────────────────────────────────────────────────────

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 *
 * @param {(event: string, session: object|null) => void} callback
 * @returns {() => void}
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}

// ─── Get current user ─────────────────────────────────────────────────────────

/**
 * @returns {Promise<{ data: object|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function getUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return { data: null, error: normaliseError(error) };
    return { data: user, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}
