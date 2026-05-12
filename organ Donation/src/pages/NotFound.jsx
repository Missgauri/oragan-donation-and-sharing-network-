import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Home } from 'lucide-react';
import { ROUTES } from '../routes/routeConfig';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--color-bg-light) 0%, rgba(0,86,179,0.05) 100%)',
      textAlign: 'center', padding: '2rem'
    }}>
      <HeartPulse size={80} style={{ color: 'var(--color-accent)', marginBottom: '1.5rem' }} />
      <h1 style={{ fontSize: '6rem', fontWeight: '800', color: 'var(--color-primary-dark)', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '1.75rem', fontWeight: '600', margin: '1rem 0 0.5rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', marginBottom: '2rem' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to={ROUTES.HOME} className="btn btn-primary" style={{ gap: '0.5rem' }}>
        <Home size={18} /> Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
