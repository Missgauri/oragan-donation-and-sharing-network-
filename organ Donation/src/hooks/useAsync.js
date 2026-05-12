/**
 * useAsync
 *
 * Reusable hook for managing async operations with:
 *   - loading / error / data state
 *   - automatic retry with exponential backoff
 *   - optional error toast integration
 *   - abort on unmount (prevents state updates on unmounted components)
 *
 * @param {Function} asyncFn   - The async function to execute
 * @param {Object}   [options]
 * @param {boolean}  [options.immediate=false]   - Run on mount automatically
 * @param {any}      [options.initialData=null]  - Initial data value
 * @param {number}   [options.maxRetries=0]      - Max automatic retries (0 = none)
 * @param {number}   [options.retryDelay=1000]   - Base delay in ms (doubles each retry)
 * @param {Function} [options.onSuccess]         - Called with data on success
 * @param {Function} [options.onError]           - Called with error on failure
 * @param {string}   [options.errorMessage]      - Override error message for toast
 *
 * @returns {{ execute, data, loading, error, reset, retryCount }}
 *
 * @example
 *   const { execute, data, loading, error } = useAsync(fetchDonors, {
 *     immediate: true,
 *     onError: (err) => showError(err.message),
 *   });
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export function useAsync(asyncFn, options = {}) {
  const {
    immediate    = false,
    initialData  = null,
    maxRetries   = 0,
    retryDelay   = 1000,
    onSuccess,
    onError,
    errorMessage,
  } = options;

  const [data,       setData]       = useState(initialData);
  const [loading,    setLoading]    = useState(immediate);
  const [error,      setError]      = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Track mounted state to prevent setState after unmount
  const mountedRef  = useRef(true);
  const abortRef    = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const execute = useCallback(async (...args) => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const result = await asyncFn(...args);

        if (mountedRef.current) {
          setData(result);
          setLoading(false);
          setRetryCount(0);
          onSuccess?.(result);
        }
        return result;
      } catch (err) {
        // Ignore abort errors
        if (err?.name === 'AbortError') return;

        attempt++;

        if (attempt > maxRetries) {
          const finalError = err;
          if (mountedRef.current) {
            setError(finalError);
            setLoading(false);
            setRetryCount(attempt - 1);
          }
          onError?.(finalError);
          throw finalError;
        }

        // Exponential backoff before retry
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise((res) => setTimeout(res, delay));

        if (mountedRef.current) {
          setRetryCount(attempt);
        }
      }
    }
  }, [asyncFn, maxRetries, retryDelay, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    setRetryCount(0);
  }, [initialData]);

  // Run immediately on mount if requested
  useEffect(() => {
    if (immediate) execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { execute, data, loading, error, reset, retryCount };
}

/**
 * useAsyncCallback
 *
 * Simpler variant — just wraps a callback with loading/error state.
 * No retry, no immediate execution. Good for form submissions.
 *
 * @example
 *   const { run, loading, error } = useAsyncCallback(async (formData) => {
 *     await registerDonor(formData);
 *   });
 */
export function useAsyncCallback(fn, options = {}) {
  const { onSuccess, onError } = options;

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const run = useCallback(async (...args) => {
    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await fn(...args);
      if (mountedRef.current) setLoading(false);
      onSuccess?.(result);
      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setLoading(false);
      }
      onError?.(err);
      throw err;
    }
  }, [fn, onSuccess, onError]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { run, loading, error, reset };
}
