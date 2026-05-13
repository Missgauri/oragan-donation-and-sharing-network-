/**
 * useAsync — reusable async state hook
 *
 * Manages loading / error / data state for any async operation.
 * Prevents setState on unmounted components via a mounted ref.
 *
 * @param {Function} asyncFn          - The async function to run
 * @param {Object}   [options]
 * @param {boolean}  [options.immediate=false]  - Run on mount automatically
 * @param {any}      [options.initialData=null] - Initial data value
 * @param {Function} [options.onSuccess]        - Called with result on success
 * @param {Function} [options.onError]          - Called with error on failure
 *
 * @returns {{ execute, data, loading, error, reset }}
 *
 * @example
 *   const { execute, data, loading, error } = useAsync(fetchOrgans, {
 *     immediate: true,
 *     onError: (err) => handleApiError(err),
 *   });
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export function useAsync(asyncFn, options = {}) {
  const { immediate = false, initialData = null, onSuccess, onError } = options;

  const [data,    setData]    = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error,   setError]   = useState(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async (...args) => {
    if (mountedRef.current) { setLoading(true); setError(null); }
    try {
      const result = await asyncFn(...args);
      if (mountedRef.current) { setData(result); setLoading(false); }
      onSuccess?.(result);
      return result;
    } catch (err) {
      if (mountedRef.current) { setError(err); setLoading(false); }
      onError?.(err);
      throw err;
    }
  }, [asyncFn, onSuccess, onError]);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  // Run on mount if immediate
  useEffect(() => {
    if (immediate) execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { execute, data, loading, error, reset };
}

/**
 * useAsyncCallback — simpler variant for form submissions / button actions.
 * No immediate execution, no retry. Just wraps a callback with loading/error.
 *
 * @example
 *   const { run, loading, error } = useAsyncCallback(async (formData) => {
 *     await registerDonor(formData);
 *   }, { onError: handleApiError });
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
    if (mountedRef.current) { setLoading(true); setError(null); }
    try {
      const result = await fn(...args);
      if (mountedRef.current) setLoading(false);
      onSuccess?.(result);
      return result;
    } catch (err) {
      if (mountedRef.current) { setError(err); setLoading(false); }
      onError?.(err);
      throw err;
    }
  }, [fn, onSuccess, onError]);

  const reset = useCallback(() => { setLoading(false); setError(null); }, []);

  return { run, loading, error, reset };
}
