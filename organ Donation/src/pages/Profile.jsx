import React, { useState } from 'react';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/routeConfig';

const Profile = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOut();
    navigate(ROUTES.HOME);
  };

  return (
    <div className="container" style={{ padding: '4rem 2rem', maxWidth: '600px' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'var(--color-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem', color: 'white'
          }}>
            <User size={40} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary-dark)' }}>
            My Profile
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--color-bg-light)', borderRadius: '8px' }}>
            <Mail size={20} style={{ color: 'var(--color-primary)' }} />
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Email</p>
              <p style={{ fontWeight: '600' }}>{user?.email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--color-bg-light)', borderRadius: '8px' }}>
            <Shield size={20} style={{ color: 'var(--color-secondary)' }} />
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Role</p>
              <p style={{ fontWeight: '600', textTransform: 'capitalize' }}>{role || 'Not assigned'}</p>
            </div>
          </div>
        </div>

        <button
          className="btn btn-outline"
          style={{ width: '100%', marginTop: '2rem', gap: '0.5rem', borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
          onClick={handleSignOut}
          disabled={loggingOut}
        >
          <LogOut size={18} />
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </div>
  );
};

export default Profile;
