import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Heart, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES }   from '../../services/profileService';
import {
  useAuthForm,
  validateEmail,
  validatePassword,
  validateRequired,
} from '../../hooks/useAuthForm';
import './Auth.css';

const ROLE_OPTIONS = [
  { value: ROLES.DONOR,    label: 'Donor',    desc: 'I want to register as an organ donor'         },
  { value: ROLES.RECEIVER, label: 'Receiver', desc: 'I am looking for an organ transplant'         },
  { value: ROLES.HOSPITAL, label: 'Hospital', desc: 'I represent a hospital or medical institution' },
];

const Signup = () => {
  const { signUp }  = useAuth();
  const navigate    = useNavigate();

  const { values, errors, isSubmitting, handleChange, setError, setIsSubmitting } =
    useAuthForm({ fullName: '', email: '', phone: '', password: '', confirmPassword: '', role: '' });

  const [showPassword, setShowPassword]   = useState(false);
  const [serverError,  setServerError]    = useState('');
  const [success,      setSuccess]        = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Validate all fields
    let hasError = false;
    const nameErr  = validateRequired(values.fullName, 'Full name');
    const emailErr = validateEmail(values.email);
    const pwErr    = validatePassword(values.password);
    const roleErr  = validateRequired(values.role, 'Role');

    if (nameErr)  { setError('fullName', nameErr);  hasError = true; }
    if (emailErr) { setError('email',    emailErr);  hasError = true; }
    if (pwErr)    { setError('password', pwErr);     hasError = true; }
    if (roleErr)  { setError('role',     roleErr);   hasError = true; }

    if (values.password !== values.confirmPassword) {
      setError('confirmPassword', 'Passwords do not match.');
      hasError = true;
    }

    if (hasError) return;

    setIsSubmitting(true);
    const { error } = await signUp({
      email:    values.email,
      password: values.password,
      fullName: values.fullName,
      role:     values.role,
      phone:    values.phone,
    });
    setIsSubmitting(false);

    if (error) { setServerError(error.message); return; }

    setSuccess(true);
  };

  // ─── Success state ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card glass-panel text-center">
          <CheckCircle size={56} className="auth-success-icon" />
          <h2 className="auth-title">Check your email</h2>
          <p className="auth-subtitle">
            We sent a confirmation link to <strong>{values.email}</strong>.
            Click it to activate your account, then sign in.
          </p>
          <Link to="/auth/login" className="btn btn-primary auth-submit-btn" style={{ marginTop: '1.5rem' }}>
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide glass-panel">
        {/* Logo */}
        <div className="auth-logo">
          <Heart size={32} className="auth-logo-icon" />
          <span>LifeGift Network</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Join the network and help save lives.</p>

        {serverError && (
          <div className="auth-alert auth-alert-error" role="alert">
            {serverError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Role selector */}
          <div className="form-group">
            <label>I am joining as a</label>
            <div className="role-grid">
              {ROLE_OPTIONS.map(({ value, label, desc }) => (
                <label
                  key={value}
                  className={`role-card ${values.role === value ? 'role-card-active' : ''}`}
                >
                  <input
                    type="radio" name="role"
                    value={value} onChange={handleChange}
                    className="role-radio"
                  />
                  <span className="role-label">{label}</span>
                  <span className="role-desc">{desc}</span>
                </label>
              ))}
            </div>
            {errors.role && <span className="field-error">{errors.role}</span>}
          </div>

          {/* Full name */}
          <div className="form-group">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName" name="fullName" type="text"
              value={values.fullName} onChange={handleChange}
              placeholder="Jane Doe"
              className={errors.fullName ? 'input-error' : ''}
              autoComplete="name"
            />
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>

          {/* Email + Phone row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email" name="email" type="email"
                value={values.email} onChange={handleChange}
                placeholder="you@example.com"
                className={errors.email ? 'input-error' : ''}
                autoComplete="email"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone <span className="optional">(optional)</span></label>
              <input
                id="phone" name="phone" type="tel"
                value={values.phone} onChange={handleChange}
                placeholder="+91 98765 43210"
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Password + Confirm row */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-icon-wrapper">
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password} onChange={handleChange}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className={errors.password ? 'input-error' : ''}
                  autoComplete="new-password"
                />
                <button
                  type="button" className="input-icon-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword" name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={values.confirmPassword} onChange={handleChange}
                placeholder="Repeat password"
                className={errors.confirmPassword ? 'input-error' : ''}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><span className="btn-spinner" /> Creating account...</>
            ) : (
              <><UserPlus size={18} /> Create Account</>
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{' '}
          <Link to="/auth/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
