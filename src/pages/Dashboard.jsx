import React, { useState } from 'react';
import { Activity, ShieldAlert, Bell } from 'lucide-react';
import { useRealtime }  from '../context/RealtimeContext';
import StatsGrid        from '../components/dashboard/StatsGrid';
import MatchesTable     from '../components/dashboard/MatchesTable';
import StatusBadge      from '../components/ui/StatusBadge';
import Modal            from '../components/ui/Modal';
import LiveIndicator    from '../components/ui/LiveIndicator';
import './Dashboard.css';

const Dashboard = () => {
  const {
    // Matches
    matches, matchesLoading, matchesLive,
    // Emergencies
    emergencies, activeEmergencyCount, emergenciesLive,
    // Notifications
    unreadCount,
  } = useRealtime();

  const [selectedMatch, setSelectedMatch] = useState(null);

  return (
    <div className="dashboard-page container">
      {/* Header */}
      <div className="dashboard-header text-center">
        <Activity size={48} className="header-icon" />
        <h1 className="page-title">Matching &amp; Logistics Dashboard</h1>
        <p className="page-subtitle">
          Real-time overview of current active matches and network statistics.
        </p>
      </div>

      {/* Stats */}
      <StatsGrid />

      {/* Active Emergency Banner */}
      {activeEmergencyCount > 0 && (
        <div className="emergency-banner glass-panel">
          <ShieldAlert size={22} className="emergency-banner-icon" />
          <div className="emergency-banner-content">
            <strong>{activeEmergencyCount} Active Emergency{activeEmergencyCount > 1 ? ' Requests' : ' Request'}</strong>
            <span>{emergencies[0]?.organ_type} ({emergencies[0]?.blood_type}) — needed within {emergencies[0]?.required_within_hours}h</span>
          </div>
          <LiveIndicator isLive={emergenciesLive} label="Live" size="sm" />
        </div>
      )}

      {/* Matches Table */}
      <div className="dashboard-main glass-panel">
        <div className="main-header">
          <h2>Active Matches in Progress</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {unreadCount > 0 && (
              <span className="notif-badge">
                <Bell size={14} /> {unreadCount}
              </span>
            )}
            <LiveIndicator isLive={matchesLive} label="Live Updates" />
          </div>
        </div>

        {matchesLoading ? (
          <div className="loading-state" style={{ padding: '3rem', textAlign: 'center' }}>
            <Activity size={32} className="spinner" style={{ color: 'var(--color-primary)' }} />
            <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>Loading matches…</p>
          </div>
        ) : (
          <MatchesTable matches={matches} onViewMatch={setSelectedMatch} />
        )}
      </div>

      {/* System Alert */}
      <div className="alert-section glass-panel">
        <ShieldAlert size={24} className="alert-icon" />
        <div className="alert-content">
          <h4>System Alert: High Demand in Delhi NCR Region</h4>
          <p>
            O-Negative blood type requests have surged by 15% in the last 48 hours for kidney
            and liver needs. Expediting matching algorithms.
          </p>
        </div>
        <button className="btn btn-primary btn-sm">Review Policy</button>
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <Modal onClose={() => setSelectedMatch(null)}>
          <h2>Match #{selectedMatch.id} Logs</h2>
          <div className="modal-body">
            <p><strong>Patient Ref:</strong> {selectedMatch.patientRef}</p>
            <p><strong>Organ Needed:</strong> {selectedMatch.organ}</p>
            <p>
              <strong>Compatibility Score:</strong>{' '}
              <span className="highlight-text">{selectedMatch.matchScore}%</span>
            </p>
            <p>
              <strong>Current Status:</strong>{' '}
              <StatusBadge status={selectedMatch.status} />
            </p>
            <p><strong>ETA:</strong> {selectedMatch.eta}</p>
            <hr />
            <p className="text-muted">
              Full logistical tracking and patient histories are securely locked to authorized
              transplant coordinators in accordance with HIPAA data privacy guidelines.
            </p>
          </div>
          <div className="modal-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                alert('Opening full secure transport logs...');
                setSelectedMatch(null);
              }}
            >
              View Transport Logs
            </button>
            <button className="btn btn-outline" onClick={() => setSelectedMatch(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;
