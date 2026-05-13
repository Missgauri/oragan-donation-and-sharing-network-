import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, HeartPulse, CheckCircle } from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';
import { ROUTES } from '../routes/routeConfig';
import './Auth.css';

const ROLE_LABELS = [
  { value: ROLES.DONOR,    label: '🫀 Organ Donor'             },
  { value: ROLES.RECEIVER, label: '🏥 Organ Receiver'          },
  { value: ROLES.HOSPITAL, label: '🏨 Hospital / Medical Staff' },
];

const ROLE_REDIRECT = {
  [ROLES.DONOR]:    ROUTES.DONOR_DASHBOARD,
  [ROLES.RECEIVER]: ROUTES.RECEIVER_DASHBOARD,
  [ROLES.HOSPITAL]: ROUTES.HOSPITAL_DASHBOARD,
};

const Signup = () => {
  const { signUp } = useAuth();
  const { handleApiError } = useError();
  const navigate = useNavigate();

  const [form,    setForm]    = useState({ email: '', password: '', confirm: '', role: ROLES.DONOR });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const data = await signUp(form.email, form.password, form.role);
      // If session returned immediately (email confirmation disabled) → go to dashboard
      if (data?.session) {
        navigate(ROLE_REDIRECT[form.role] || '/dashboard', { replace: true });
        return;
      }
      // Otherwise show confirmation screen
      setSuccess(true);
    } catch (err) {
      const msg = err?.message || 'Signup failed. Please try again.';
      setError(msg);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Email confirmation screen ──────────────────────────────────────────────
  if (success) {
    return (
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <CheckCircle size={52} style={{ color: 'var(--color-secondary)', margin: '0 auto 1rem' }} />
        <h2 className="auth-title">Account Created!</h2>
        <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
          Check your email <strong>{form.email}</strong> for a confirmation link,
          then sign in to access your dashboard.
        </p>
        <Link to={ROUTES.LOGIN} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <HeartPulse size={36} className="auth-logo-icon" />
        <h1>LifeGift Network</h1>
      </div>

      <h2 className="auth-title">Create Account</h2>
      <p className="auth-subtitle">Join the network and save lives</p>

      {error && <div className="auth-error">{error}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>I am a...</label>
          <div className="role-selector">
            {ROLE_LABELS.map(r => (
              <label key={r.value} className={`role-option ${form.role === r.value ? 'selected' : ''}`}>
                <input type="radio" name="role" value={r.value}
                  checked={form.role === r.value} onChange={handleChange} />
                {r.label}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="signup-email">Email Address</label>
          <div className="input-icon-wrapper">
            <Mail size={17} className="field-icon" />
            <input id="signup-email" name="email" type="email"
              value={form.email} onChange={handleChange}
              required placeholder="you@example.com" autoComplete="email" />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="signup-password">Password</label>
          <div className="input-icon-wrapper">
            <Lock size={17} className="field-icon" />
            <input id="signup-password" name="password" type="password"
              value={form.password} onChange={handleChange}
              required placeholder="Min. 8 characters" minLength={8}
              autoComplete="new-password" />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="signup-confirm">Confirm Password</label>
          <div className="input-icon-wrapper">
            <Lock size={17} className="field-icon" />
            <input id="signup-confirm" name="confirm" type="password"
              value={form.confirm} onChange={handleChange}
              required placeholder="Repeat password"
              autoComplete="new-password" />
          </div>
        </div>

        <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
          <UserPlus size={17} />
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
      </p>
    </div>
  );
};

export default Signup;
