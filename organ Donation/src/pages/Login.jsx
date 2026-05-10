import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Mail, Lock, HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
  const navigate   = useNavigate();
  const location   = useLocation();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || ROUTES.HOME;

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await signIn(form.email, form.password);
      const role = user?.user_metadata?.role;
      navigate(ROLE_REDIRECT[role] || from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        <div className="auth-logo">
          <HeartPulse size={40} className="auth-logo-icon" />
          <h1>LifeGift Network</h1>
        </div>

        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="field-icon" />
              <input
                id="email" name="email" type="email"
                value={form.email} onChange={handleChange}
                required placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="field-icon" />
              <input
                id="password" name="password" type="password"
                value={form.password} onChange={handleChange}
                required placeholder="••••••••"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to={ROUTES.SIGNUP}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
