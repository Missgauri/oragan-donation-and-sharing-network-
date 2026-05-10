import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, HeartPulse, User } from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConfig';
import './Auth.css';

const ROLE_LABELS = [
  { value: ROLES.DONOR,    label: '🫀 Organ Donor' },
  { value: ROLES.RECEIVER, label: '🏥 Organ Receiver' },
  { value: ROLES.HOSPITAL, label: '🏨 Hospital / Medical Staff' },
];

const Login = () => {
  const { signUp } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '', confirm: '', role: ROLES.DONOR });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.role);
      navigate(ROUTES.LOGIN, { state: { message: 'Account created! Please sign in.' } });
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
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

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join the network and save lives</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>I am a...</label>
            <div className="role-selector">
              {ROLE_LABELS.map(r => (
                <label key={r.value} className={`role-option ${form.role === r.value ? 'selected' : ''}`}>
                  <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={handleChange} />
                  {r.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="field-icon" />
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="field-icon" />
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Min. 8 characters" minLength={8} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="field-icon" />
              <input id="confirm" name="confirm" type="password" value={form.confirm} onChange={handleChange} required placeholder="Repeat password" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            <UserPlus size={18} />
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
