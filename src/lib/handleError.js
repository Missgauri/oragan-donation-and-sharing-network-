/**
 * lib/handleError.js
 * ─────────────────────────────────────────────────────────────
 * Centralised error normaliser for all Supabase responses.
 *
 * Every service function returns a consistent shape:
 *   { data, error: AppError | null }
 *
 * This means callers never need to inspect raw Supabase error objects —
 * they always get a plain { message, code, status } they can display or log.
 * ─────────────────────────────────────────────────────────────
 */

/**
 * @typedef {Object} AppError
 * @property {string}      message  - Human-readable error message
 * @property {string|null} code     - Supabase/Postgres error code (e.g. '23505')
 * @property {number|null} status   - HTTP status code
 * @property {unknown}     original - The raw error for debugging
 */

/**
 * Normalises any Supabase error into a consistent AppError shape.
 * Returns null if there is no error.
 *
 * @param {import('@supabase/supabase-js').PostgrestError | Error | null | undefined} err
 * @returns {AppError | null}
 */
export function normaliseError(err) {
  if (!err) return null;

  // PostgrestError (from .from().select() etc.)
  if ('code' in err && 'message' in err) {
    return {
      message:  err.message  || 'A database error occurred.',
      code:     err.code     || null,
      status:   err.status   || null,
      original: err,
    };
  }

  // AuthError (from supabase.auth.*)
  if ('status' in err && 'message' in err) {
    return {
      message:  err.message || 'An authentication error occurred.',
      code:     null,
      status:   err.status  || null,
      original: err,
    };
  }

  // Generic JS Error
  if (err instanceof Error) {
    return {
      message:  err.message || 'An unexpected error occurred.',
      code:     null,
      status:   null,
      original: err,
    };
  }

  return {
    message:  'An unknown error occurred.',
    code:     null,
    status:   null,
    original: err,
  };
}

/**
 * Friendly messages for common Postgres/Supabase error codes.
 * Use this to show user-facing messages instead of raw DB errors.
 *
 * @param {AppError} appError
 * @returns {string}
 */
export function getFriendlyMessage(appError) {
  const CODE_MESSAGES = {
    '23505': 'This record already exists. Please check for duplicates.',
    '23503': 'This action references a record that does not exist.',
    '42501': 'You do not have permission to perform this action.',
    'PGRST116': 'No matching record was found.',
    'invalid_credentials': 'Incorrect email or password.',
    'email_not_confirmed': 'Please verify your email address before signing in.',
    'user_already_exists': 'An account with this email already exists.',
    'over_email_send_rate_limit': 'Too many emails sent. Please wait a few minutes and try again.',
  };

  return CODE_MESSAGES[appError.code] || appError.message;
}
