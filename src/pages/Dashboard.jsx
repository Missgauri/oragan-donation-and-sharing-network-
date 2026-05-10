import React, { useState } from 'react';
import { Activity, ShieldAlert } from 'lucide-react';
import { useMatches } from '../hooks/useMatches';
import StatsGrid    from '../components/dashboard/StatsGrid';
import MatchesTable from '../components/dashboard/MatchesTable';
import StatusBadge  from '../components/ui/StatusBadge';
import Modal        from '../components/ui/Modal';
import './Dashboard.css';

const Dashboard = () => {
  const { matches } = useMatches();
  const [selectedMatch, setSelectedMatch] = useState(null);

  return (
    <div className="dashboard-page container">
      {/* Header */}
      <div className="dashboard-header text-center">
        <Activity size={48} className="header-icon" />
        <h1 className="page-title">Matching &amp; Logistics Dashboard</h1>
        <p className="page-subtitle">Real-time overview of current active matches and network statistics.</p>
      </div>

      {/* Stats */}
      <StatsGrid />

      {/* Matches Table */}
      <div className="dashboard-main glass-panel">
        <div className="main-header">
          <h2>Active Matches in Progress</h2>
          <span className="live-indicator">
            <span className="live-dot" />
            Live Updates
          </span>
        </div>
        <MatchesTable matches={matches} onViewMatch={setSelectedMatch} />
      </div>

      {/* Alert Banner */}
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
