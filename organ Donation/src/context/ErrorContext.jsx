/**
 * ErrorContext — Global error toast queue
 *
 * Completely separate from the notification system so API/network
 * errors are always visible regardless of login state.
 *
 * Usage anywhere in the app:
 *   const { showError, showSuccess, showWarning } = useError();
 *   showError('Something went wrong');
 *   showSuccess('Saved successfully!');
 *
 *   // Parse a raw Supabase / fetch error automatically:
 *   handleApiError(err);
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const ErrorContext = createContext(null);

export const TOAST_TYPES = {
  ERROR:   'error',
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO:    'info',
};

const DEFAULT_DURATIONS = {
  error:   7000,
  success: 3500,
  warning: 5000,
  info:    4500,
};

// ── Supabase / fetch error code → friendly message ────────────────────────────
const FRIENDLY_ERRORS = {
  invalid_credentials:        'Incorrect email or password.',
  email_not_confirmed:        'Please verify your email before signing in.',
  user_already_exists:        'An account with this email already exists.',
  weak_password:              'Password is too weak. Use at least 8 characters.',
  over_request_rate_limit:    'Too many requests. Please wait a moment and try again.',
  PGRST116:                   'Record not found.',
  '23505':                    'This record already exists.',
  '23503':                    'A required related record is missing.',
  '42501':                    'You do not have permission to do that.',
  'JWT expired':              'Your session has expired. Please sign in again.',
  'PGRST301':                 'Session expired. Please sign in again.',
};

export const ErrorProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, message, options = {}) => {
    if (!message) return;

    const id       = `err-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const duration = options.duration ?? DEFAULT_DURATIONS[type] ?? 5000;
    const title    = options.title   ?? null;
    const action   = options.action  ?? null; // { label, onClick }

    setToasts((prev) => {
      // Deduplicate — don't stack the same message twice
      if (prev.some((t) => t.message === message)) return prev;
      // Cap at 4 visible toasts
      const capped = prev.length >= 4 ? prev.slice(1) : prev;
      return [...capped, { id, type, message, title, action, duration }];
    });

    if (duration > 0) {
      setTimeout(() => dismiss(id), duration);
    }
    return id;
  }, [dismiss]);

  const showError   = useCallback((msg, opts) => push(TOAST_TYPES.ERROR,   msg, opts), [push]);
  const showSuccess = useCallback((msg, opts) => push(TOAST_TYPES.SUCCESS, msg, opts), [push]);
  const showWarning = useCallback((msg, opts) => push(TOAST_TYPES.WARNING, msg, opts), [push]);
  const showInfo    = useCallback((msg, opts) => push(TOAST_TYPES.INFO,    msg, opts), [push]);

  /**
   * Parse any Supabase or network error and show a friendly toast.
   * @param {Error|Object} err
   * @param {string}       fallback - shown if no friendly message found
   */
  const handleApiError = useCallback((err, fallback = 'Something went wrong. Please try again.') => {
    if (!err) return;

    // Offline check
    if (!navigator.onLine) {
      showError('No internet connection. Please check your network.', { title: 'Offline' });
      return;
    }

    const code    = err?.code || err?.error_code || '';
    const message = err?.message || err?.error_description || '';

    // Check friendly map by code first, then by message substring
    const friendly =
      FRIENDLY_ERRORS[code] ||
      Object.entries(FRIENDLY_ERRORS).find(([k]) => message.includes(k))?.[1] ||
      null;

    showError(friendly || message || fallback);
  }, [showError]);

  return (
    <ErrorContext.Provider value={{
      toasts, dismiss,
      showError, showSuccess, showWarning, showInfo,
      handleApiError,
    }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error('useError must be used inside ErrorProvider');
  return ctx;
};
