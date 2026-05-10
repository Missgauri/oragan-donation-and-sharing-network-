import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuthForm, validateEmail } from '../../hooks/useAuthForm';
import './Auth.css';

const Login = () => {
  const { signIn } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || '/dashboard';

  const { values, errors, isSubmitting, handleChange, setError, setIsSubmitting } =
    useAuthForm({ email: '', password: '' });

  const [showPassword, setShowPassword] = useState(false);
  const [serverError,  setServerError]  = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Client-side validation
    const emailErr = validateEmail(values.email);
    if (emailErr) { setError('email', emailErr); return; }
    if (!values.password) { setError('password', 'Password is required.'); return; }

    setIsSubmitting(true);
    const { error } = await signIn(values.email, values.password);
    setIsSubmitting(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        {/* Logo */}
        <div className="auth-logo">
          <Heart size={32} className="auth-logo-icon" />
          <span>LifeGift Network</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue.</p>

        {/* Server error */}
        {serverError && (
          <div className="auth-alert auth-alert-error" role="alert">
            {serverError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email" name="email" type="email"
              value={values.email} onChange={handleChange}
              placeholder="you@example.com"
              className={errors.email ? 'input-error' : ''}
              autoComplete="email"
              required
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <Link to="/auth/forgot-password" className="auth-link-sm">
                Forgot password?
              </Link>
            </div>
            <div className="input-icon-wrapper">
              <input
                id="password" name="password"
                type={showPassword ? 'text' : 'password'}
                value={values.password} onChange={handleChange}
                placeholder="••••••••"
                className={errors.password ? 'input-error' : ''}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-icon-btn"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><span className="btn-spinner" /> Signing in...</>
            ) : (
              <><LogIn size={18} /> Sign In</>
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          Don&apos;t have an account?{' '}
          <Link to="/auth/signup" className="auth-link">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
