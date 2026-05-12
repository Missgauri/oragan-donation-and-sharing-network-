import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import { ROUTES } from '../routes/routeConfig';

const Unauthorized = () => {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '2rem'
    }}>
      <ShieldAlert size={80} style={{ color: 'var(--color-accent)', marginBottom: '1.5rem' }} />
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary-dark)' }}>Access Denied</h1>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '1rem 0 2rem' }}>
        You don't have permission to view this page. Please contact your administrator if you believe this is an error.
      </p>
      <Link to={ROUTES.HOME} className="btn btn-primary" style={{ gap: '0.5rem' }}>
        <Home size={18} /> Back to Home
      </Link>
    </div>
  );
};

export default Unauthorized;
