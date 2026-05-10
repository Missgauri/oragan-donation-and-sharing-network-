import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, Eye, EyeOff, CheckCircle, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm, validatePassword } from '../../hooks/useAuthForm';
import './Auth.css';

const ResetPassword = () => {
  const { resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { values, errors, isSubmitting, handleChange, setError, setIsSubmitting } =
    useAuthForm({ password: '', confirmPassword: '' });

  const [showPassword, setShowPassword] = useState(false);
  const [serverError,  setServerError]  = useState('');
  const [success,      setSuccess]      = useState(false);

  // Supabase puts the recovery token in the URL hash — the client picks it up
  // automatically via detectSessionInUrl: true in the supabase client config.
  // We just need to wait for isAuthenticated to become true.
  useEffect(() => {
    // If user lands here without a valid recovery session, redirect to forgot-password
    const timer = setTimeout(() => {
      if (!isAuthenticated) navigate('/auth/forgot-password', { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const pwErr = validatePassword(values.password);
    if (pwErr) { setError('password', pwErr); return; }
    if (values.password !== values.confirmPassword) {
      setError('confirmPassword', 'Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await resetPassword(values.password);
    setIsSubmitting(false);

    if (error) { setServerError(error.message); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card glass-panel text-center">
          <CheckCircle size={56} className="auth-success-icon" />
          <h2 className="auth-title">Password updated</h2>
          <p className="auth-subtitle">Your password has been changed successfully.</p>
          <Link to="/auth/login" className="btn btn-primary auth-submit-btn" style={{ marginTop: '1.5rem' }}>
            Sign In with New Password
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

        <h1 className="auth-title">Set new password</h1>
        <p className="auth-subtitle">Choose a strong password for your account.</p>

        {serverError && (
          <div className="auth-alert auth-alert-error" role="alert">
            {serverError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="password">New password</label>
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
                aria-label={showPassword ? 'Hide' : 'Show'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm new password</label>
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

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><span className="btn-spinner" /> Updating...</>
            ) : (
              <><KeyRound size={18} /> Update Password</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
