import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Unauthorised = () => {
  const { role } = useAuth();

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel text-center">
        <ShieldAlert size={56} style={{ color: 'var(--color-accent)', marginBottom: '1rem' }} />
        <h1 className="auth-title">Access Denied</h1>
        <p className="auth-subtitle">
          Your account role (<strong>{role || 'unknown'}</strong>) does not have
          permission to view this page.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
          <Link to="/" className="btn btn-primary">Go Home</Link>
          <Link to="/dashboard" className="btn btn-outline">Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorised;
