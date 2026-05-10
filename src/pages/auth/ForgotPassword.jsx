import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm, validateEmail } from '../../hooks/useAuthForm';
import './Auth.css';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const { values, errors, isSubmitting, handleChange, setError, setIsSubmitting } =
    useAuthForm({ email: '' });

  const [sent,        setSent]        = useState(false);
  const [serverError, setServerError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const emailErr = validateEmail(values.email);
    if (emailErr) { setError('email', emailErr); return; }

    setIsSubmitting(true);
    const { error } = await forgotPassword(values.email);
    setIsSubmitting(false);

    if (error) { setServerError(error.message); return; }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card glass-panel text-center">
          <CheckCircle size={56} className="auth-success-icon" />
          <h2 className="auth-title">Email sent</h2>
          <p className="auth-subtitle">
            We sent a password reset link to <strong>{values.email}</strong>.
            Check your inbox and follow the instructions.
          </p>
          <p className="auth-subtitle" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Didn&apos;t receive it? Check your spam folder or{' '}
            <button
              className="auth-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={() => setSent(false)}
            >
              try again
            </button>.
          </p>
          <Link to="/auth/login" className="btn btn-outline" style={{ marginTop: '1.5rem' }}>
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        <div className="auth-logo">
          <Heart size={32} className="auth-logo-icon" />
          <span>LifeGift Network</span>
        </div>

        <h1 className="auth-title">Forgot your password?</h1>
        <p className="auth-subtitle">
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {serverError && (
          <div className="auth-alert auth-alert-error" role="alert">
            {serverError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <div className="input-icon-wrapper">
              <input
                id="email" name="email" type="email"
                value={values.email} onChange={handleChange}
                placeholder="you@example.com"
                className={errors.email ? 'input-error' : ''}
                autoComplete="email"
              />
              <Mail size={18} className="input-icon-static" />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><span className="btn-spinner" /> Sending...</>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          <Link to="/auth/login" className="auth-link">
            <ArrowLeft size={14} style={{ verticalAlign: 'middle' }} /> Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
