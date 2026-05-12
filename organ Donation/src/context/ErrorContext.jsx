/**
 * ErrorContext
 *
 * Global error toast queue — completely separate from the notification
 * system so that API/network errors are always visible regardless of
 * whether the user is logged in.
 *
 * Usage anywhere in the app:
 *   const { showError, showSuccess, showWarning, showInfo } = useError();
 *   showError('Something went wrong');
 *   showSuccess('Saved!');
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useId,
} from 'react';

const ErrorContext = createContext(null);

export const TOAST_TYPES = {
  ERROR:   'error',
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO:    'info',
};

const DEFAULT_DURATIONS = {
  error:   8000,
  success: 4000,
  warning: 6000,
  info:    5000,
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
    const title    = options.title ?? null;
    const action   = options.action ?? null; // { label, onClick }

    setToasts((prev) => {
      // Deduplicate — don't show the same message twice in a row
      if (prev.length > 0 && prev[prev.length - 1].message === message) return prev;
      // Cap at 5 toasts
      const capped = prev.length >= 5 ? prev.slice(1) : prev;
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
   * Parse a Supabase or generic error and show an appropriate toast.
   * Handles common Supabase error codes with user-friendly messages.
   */
  const handleApiError = useCallback((err, fallbackMessage = 'Something went wrong') => {
    if (!err) return;

    const code    = err?.code || err?.error_code || '';
    const message = err?.message || err?.error_description || '';

    // Map known Supabase error codes to friendly messages
    const friendly = {
      'invalid_credentials':          'Incorrect email or password.',
      'email_not_confirmed':          'Please verify your email before signing in.',
      'user_already_exists':          'An account with this email already exists.',
      'weak_password':                'Password is too weak. Use at least 8 characters with a number.',
      'over_request_rate_limit':      'Too many requests. Please wait a moment and try again.',
      'PGRST116':                     'Record not found.',
      '23505':                        'This record already exists.',
      '23503':                        'Cannot complete — a related record is missing.',
      '42501':                        'You do not have permission to perform this action.',
      'PGRST301':                     'Session expired. Please sign in again.',
      'JWT expired':                  'Your session has expired. Please sign in again.',
    }[code] || null;

    // Network / offline
    if (!navigator.onLine || message.toLowerCase().includes('fetch')) {
      showError('No internet connection. Please check your network.', { title: 'Offline' });
      return;
    }

    showError(friendly || message || fallbackMessage, {
      title: friendly ? null : 'Error',
    });
  }, [showError]);

  return (
    <ErrorContext.Provider value={{
      toasts,
      dismiss,
      showError,
      showSuccess,
      showWarning,
      showInfo,
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
