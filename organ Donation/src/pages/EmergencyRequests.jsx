import React from 'react';
import { AlertTriangle, Phone, MapPin, Clock } from 'lucide-react';

const EMERGENCY_CONTACTS = [
  { region: 'Delhi NCR',    phone: '011-2345-6789', available: true },
  { region: 'Mumbai',       phone: '022-9876-5432', available: true },
  { region: 'Bangalore',    phone: '080-1122-3344', available: false },
  { region: 'Chennai',      phone: '044-5566-7788', available: true },
];

const EmergencyRequests = () => {
  return (
    <div className="container" style={{ padding: '4rem 2rem' }}>
      <div className="text-center" style={{ marginBottom: '3rem' }}>
        <AlertTriangle size={48} style={{ color: 'var(--color-accent)', marginBottom: '1rem' }} />
        <h1 className="page-title" style={{ color: 'var(--color-accent)' }}>Emergency Organ Requests</h1>
        <p className="page-subtitle">Critical cases requiring immediate attention. Contact your regional coordinator now.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--color-accent)' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>🚨 National Emergency Helpline</h2>
        <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-accent)' }}>1800-11-4770</p>
        <p style={{ color: 'var(--color-text-muted)' }}>Available 24/7 — Free of charge</p>
      </div>

      <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Regional Coordinators</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {EMERGENCY_CONTACTS.map(contact => (
          <div key={contact.region} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={18} style={{ color: 'var(--color-primary)' }} />
                {contact.region}
              </h3>
              <span style={{
                padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                background: contact.available ? '#dcfce7' : '#fee2e2',
                color: contact.available ? '#15803d' : '#b91c1c'
              }}>
                {contact.available ? '● Online' : '○ Offline'}
              </span>
            </div>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
              <Phone size={16} /> {contact.phone}
            </p>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}
              onClick={() => alert(`Connecting to ${contact.region} coordinator...`)}>
              Contact Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmergencyRequests;
