/**
 * hooks/useAuthForm.js
 * Shared form state + validation for Login, Signup, ForgotPassword pages.
 */

import { useState } from 'react';

/**
 * @param {object} initialValues
 * @returns {{ values, errors, isSubmitting, handleChange, setError, setIsSubmitting, reset }}
 */
export function useAuthForm(initialValues) {
  const [values,       setValues]       = useState(initialValues);
  const [errors,       setErrors]       = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const setError = (field, message) =>
    setErrors((prev) => ({ ...prev, [field]: message }));

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  };

  return { values, errors, isSubmitting, handleChange, setError, setIsSubmitting, reset };
}

// ─── Validators ───────────────────────────────────────────────────────────────

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? null
    : 'Please enter a valid email address.';
}

export function validatePassword(password) {
  if (!password || password.length < 8)
    return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password))
    return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(password))
    return 'Password must contain at least one number.';
  return null;
}

export function validateRequired(value, label = 'This field') {
  return value?.trim() ? null : `${label} is required.`;
}
