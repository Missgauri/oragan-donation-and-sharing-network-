import React, { useState } from 'react';
import { Activity, Users, Clock, ShieldAlert, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useMatches } from '../hooks/useMatches';
import './Dashboard.css';

const Dashboard = () => {
  const { matches, loading, error } = useMatches();
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Safe status class — guards against null/undefined status
  const statusClass = (status) =>
    status ? status.replace(/\s+/g, '-').toLowerCase() : 'unknown';

  return (
    <div className="dashboard-page container">
      <div className="dashboard-header text-center">
        <Activity size={48} className="header-icon" />
        <h1 className="page-title">Matching & Logistics Dashboard</h1>
        <p className="page-subtitle">Real-time overview of current active matches and network statistics.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel text-center">
          <div className="stat-icon-wrapper bg-blue"><Users size={28} /></div>
          <h3 className="stat-value">5,204</h3>
          <p className="stat-label">Active Waitlist</p>
        </div>
        <div className="stat-card glass-panel text-center">
          <div className="stat-icon-wrapper bg-green"><CheckCircle size={28} /></div>
          <h3 className="stat-value">142</h3>
          <p className="stat-label">Successful Transplants (Month)</p>
        </div>
        <div className="stat-card glass-panel text-center">
          <div className="stat-icon-wrapper bg-red"><Clock size={28} /></div>
          <h3 className="stat-value">24m</h3>
          <p className="stat-label">Avg. Match Time (Critical)</p>
        </div>
      </div>

      <div className="dashboard-main glass-panel">
        <div className="main-header">
          <h2>Active Matches in Progress</h2>
          <span className="live-indicator">
            <span className="live-dot" />
            Live Updates
          </span>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm">Loading matches…</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-5 py-4 mx-4 mb-4">
            <ShieldAlert size={16} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700">
              Could not load live matches. Showing cached data.
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="table-responsive">
            <table className="matches-table">
              <thead>
                <tr>
                  <th>Match ID</th>
                  <th>Patient Ref</th>
                  <th>Organ</th>
                  <th>Compatibility Score</th>
                  <th>Status</th>
                  <th>ETA</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {matches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400 text-sm">
                      No active matches found.
                    </td>
                  </tr>
                ) : (
                  matches.map((match) => (
                    <tr key={match.id}>
                      <td><strong>#{match.id}</strong></td>
                      <td>{match.patientRef ?? '—'}</td>
                      <td>{match.organ ?? '—'}</td>
                      <td>
                        <div className="score-bar-wrapper">
                          <div
                            className="score-bar"
                            style={{
                              width: `${match.matchScore ?? 0}%`,
                              backgroundColor: (match.matchScore ?? 0) > 90
                                ? 'var(--color-secondary)'
                                : 'var(--color-primary)',
                            }}
                          />
                          <span>{match.matchScore ?? 0}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${statusClass(match.status)}`}>
                          {match.status ?? 'Unknown'}
                        </span>
                      </td>
                      <td>{match.eta ?? 'N/A'}</td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm action-btn"
                          onClick={() => setSelectedMatch(match)}
                        >
                          View <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="alert-section glass-panel">
        <ShieldAlert size={24} className="alert-icon" />
        <div className="alert-content">
          <h4>System Alert: High Demand in Delhi NCR Region</h4>
          <p>O-Negative blood type requests have surged by 15% in the last 48 hours for kidney and liver needs. Expediting matching algorithms.</p>
        </div>
        <button className="btn btn-primary btn-sm">Review Policy</button>
      </div>

      {selectedMatch && (
        <div className="modal-backdrop" onClick={() => setSelectedMatch(null)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <h2>Match #{selectedMatch.id} Logs</h2>
            <div className="modal-body">
              <p><strong>Patient Ref:</strong> {selectedMatch.patientRef ?? '—'}</p>
              <p><strong>Organ Needed:</strong> {selectedMatch.organ ?? '—'}</p>
              <p><strong>Compatibility Score:</strong> <span className="highlight-text">{selectedMatch.matchScore ?? 0}%</span></p>
              <p><strong>Current Status:</strong>{' '}
                <span className={`status-badge ${statusClass(selectedMatch.status)}`}>
                  {selectedMatch.status ?? 'Unknown'}
                </span>
              </p>
              <p><strong>ETA:</strong> {selectedMatch.eta ?? 'N/A'}</p>
              <hr />
              <p className="text-muted">Full logistical tracking and patient histories are securely locked to authorized transplant coordinators in accordance with HIPAA data privacy guidelines.</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => { setSelectedMatch(null); }}>View Transport Logs</button>
              <button className="btn btn-outline" onClick={() => setSelectedMatch(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
