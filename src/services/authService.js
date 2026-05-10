/**
 * services/authService.js
 * ─────────────────────────────────────────────────────────────
 * All Supabase Auth operations in one place.
 *
 * Every function returns:  { data, error: AppError | null }
 *
 * The app currently uses anonymous/public access (no login required).
 * This service is ready to activate when you add user accounts.
 * ─────────────────────────────────────────────────────────────
 */

import { supabase }        from '../lib/supabase';
import { normaliseError, getFriendlyMessage } from '../lib/handleError';

// ─── Sign Up ──────────────────────────────────────────────────────────────────

/**
 * Register a new user with email + password.
 * Supabase sends a confirmation email automatically.
 *
 * @param {string} email
 * @param {string} password
 * @param {{ fullName?: string }} [metadata]
 * @returns {Promise<{ data: import('@supabase/supabase-js').AuthData|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function signUp(email, password, metadata = {}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.fullName || '',
        },
      },
    });

    if (error) {
      const appError = normaliseError(error);
      console.error('[authService.signUp]', appError);
      return { data: null, error: { ...appError, message: getFriendlyMessage(appError) } };
    }

    return { data, error: null };
  } catch (err) {
    const appError = normaliseError(err);
    console.error('[authService.signUp] unexpected:', appError);
    return { data: null, error: appError };
  }
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

/**
 * Sign in with email + password.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ data: import('@supabase/supabase-js').AuthData|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const appError = normaliseError(error);
      console.error('[authService.signIn]', appError);
      return { data: null, error: { ...appError, message: getFriendlyMessage(appError) } };
    }

    return { data, error: null };
  } catch (err) {
    const appError = normaliseError(err);
    console.error('[authService.signIn] unexpected:', appError);
    return { data: null, error: appError };
  }
}

// ─── Magic Link ───────────────────────────────────────────────────────────────

/**
 * Send a passwordless magic link to the user's email.
 *
 * @param {string} email
 * @returns {Promise<{ data: object|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function signInWithMagicLink(email) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    if (error) {
      const appError = normaliseError(error);
      console.error('[authService.signInWithMagicLink]', appError);
      return { data: null, error: { ...appError, message: getFriendlyMessage(appError) } };
    }

    return { data, error: null };
  } catch (err) {
    const appError = normaliseError(err);
    console.error('[authService.signInWithMagicLink] unexpected:', appError);
    return { data: null, error: appError };
  }
}

// ─── OAuth (Google, GitHub, etc.) ────────────────────────────────────────────

/**
 * Sign in with an OAuth provider (e.g. 'google', 'github').
 * Redirects the browser — no return value needed.
 *
 * @param {'google'|'github'|'facebook'} provider
 * @returns {Promise<{ data: object|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function signInWithOAuth(provider) {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      const appError = normaliseError(error);
      console.error('[authService.signInWithOAuth]', appError);
      return { data: null, error: { ...appError, message: getFriendlyMessage(appError) } };
    }

    return { data, error: null };
  } catch (err) {
    const appError = normaliseError(err);
    console.error('[authService.signInWithOAuth] unexpected:', appError);
    return { data: null, error: appError };
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

    if (error) {
      const appError = normaliseError(error);
      console.error('[authService.signOut]', appError);
      return { error: appError };
    }

    return { error: null };
  } catch (err) {
    const appError = normaliseError(err);
    console.error('[authService.signOut] unexpected:', appError);
    return { error: appError };
  }
}

// ─── Password Reset ───────────────────────────────────────────────────────────

/**
 * Send a password reset email.
 *
 * @param {string} email
 * @returns {Promise<{ data: object|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function resetPassword(email) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      const appError = normaliseError(error);
      console.error('[authService.resetPassword]', appError);
      return { data: null, error: { ...appError, message: getFriendlyMessage(appError) } };
    }

    return { data, error: null };
  } catch (err) {
    const appError = normaliseError(err);
    console.error('[authService.resetPassword] unexpected:', appError);
    return { data: null, error: appError };
  }
}

// ─── Update Password ──────────────────────────────────────────────────────────

/**
 * Update the current user's password (must be signed in).
 *
 * @param {string} newPassword
 * @returns {Promise<{ data: object|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function updatePassword(newPassword) {
  try {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      const appError = normaliseError(error);
      console.error('[authService.updatePassword]', appError);
      return { data: null, error: { ...appError, message: getFriendlyMessage(appError) } };
    }

    return { data, error: null };
  } catch (err) {
    const appError = normaliseError(err);
    console.error('[authService.updatePassword] unexpected:', appError);
    return { data: null, error: appError };
  }
}

// ─── Auth State Listener ──────────────────────────────────────────────────────

/**
 * Subscribe to auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.)
 * Returns an unsubscribe function — call it in useEffect cleanup.
 *
 * @param {(event: string, session: import('@supabase/supabase-js').Session|null) => void} callback
 * @returns {() => void} unsubscribe function
 *
 * @example
 * useEffect(() => {
 *   const unsubscribe = onAuthStateChange((event, session) => {
 *     setUser(session?.user ?? null);
 *   });
 *   return unsubscribe;
 * }, []);
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}

// ─── Get Current User ─────────────────────────────────────────────────────────

/**
 * Get the currently authenticated user.
 * Returns null if not signed in.
 *
 * @returns {Promise<{ data: import('@supabase/supabase-js').User|null, error: import('../lib/handleError').AppError|null }>}
 */
export async function getUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      const appError = normaliseError(error);
      return { data: null, error: appError };
    }

    return { data: user, error: null };
  } catch (err) {
    return { data: null, error: normaliseError(err) };
  }
}
