import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, HeartPulse, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';
import { ROUTES } from '../routes/routeConfig';
import './Auth.css';

const ROLE_REDIRECT = {
  donor:    ROUTES.DONOR_DASHBOARD,
  receiver: ROUTES.RECEIVER_DASHBOARD,
  hospital: ROUTES.HOSPITAL_DASHBOARD,
  admin:    ROUTES.ADMIN_DASHBOARD,
};

const Login = () => {
  const { signIn } = useAuth();
  const { handleApiError } = useError();
  const navigate  = useNavigate();
  const location  = useLocation();

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const successMsg = location.state?.message || '';
  const from       = location.state?.from?.pathname;

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await signIn(form.email, form.password);
      const role = user?.user_metadata?.role;
      const destination = ROLE_REDIRECT[role] || from || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const code = err?.code || err?.error_code || '';
      let msg = err?.message || 'Login failed. Please check your credentials.';
      if (code === 'invalid_credentials' || msg.includes('Invalid login credentials')) {
        msg = 'Incorrect email or password. Please try again.';
      } else if (code === 'email_not_confirmed' || msg.includes('Email not confirmed')) {
        msg = 'Please confirm your email before signing in. Check your inbox.';
      }
      setError(msg);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      {/* Logo */}
      <div className="auth-logo">
        <HeartPulse size={36} className="auth-logo-icon" />
        <h1>LifeGift Network</h1>
      </div>

      <h2 className="auth-title">Welcome Back</h2>
      <p className="auth-subtitle">Sign in to your account to continue</p>

      {/* Success message from signup */}
      {successMsg && (
        <div className="auth-success">
          <CheckCircle size={15} />
          {successMsg}
        </div>
      )}

      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="login-email">Email Address</label>
          <div className="input-icon-wrapper">
            <Mail size={17} className="field-icon" />
            <input
              id="login-email" name="email" type="email"
              value={form.email} onChange={handleChange}
              required placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <div className="input-icon-wrapper">
            <Lock size={17} className="field-icon" />
            <input
              id="login-password" name="password" type="password"
              value={form.password} onChange={handleChange}
              required placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
          <LogIn size={17} />
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="auth-footer">
        Don't have an account? <Link to={ROUTES.SIGNUP}>Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
