import React, { useState, useEffect } from 'react';
import { Activity, Users, Clock, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

const MATCHES = [
  { id: 101, patientRef: 'PT-4921', organ: 'Kidney', matchScore: 98, status: 'Transporting', eta: '2 hrs' },
  { id: 102, patientRef: 'PT-3304', organ: 'Heart', matchScore: 92, status: 'Preparing Match', eta: 'N/A' },
  { id: 103, patientRef: 'PT-8812', organ: 'Liver', matchScore: 85, status: 'Pending Review', eta: 'N/A' },
];

const Dashboard = () => {
  const [matches, setMatches] = useState(MATCHES);
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    // Initial fetch
    const fetchMatches = async () => {
      try {
        const { data, error } = await supabase.from('matches').select('*');
        if (data && data.length > 0) setMatches(data);
      } catch (e) {
        console.log("Supabase not configured for real-time matches yet. Using mock data.");
      }
    };
    fetchMatches();

    // Set up realtime subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (payload) => {
        setMatches(current => {
          return [payload.new, ...current.filter(m => m.id !== payload.old?.id && m.id !== payload.new?.id)];
        });
      })
      .subscribe((status, err) => {
         if(err) console.log("Supabase subscription error:", err);
      });
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="dashboard-page container">
      <div className="dashboard-header text-center">
        <Activity size={48} className="header-icon" />
        <h1 className="page-title">Matching & Logistics Dashboard</h1>
        <p className="page-subtitle">Real-time overview of current active matches and network statistics.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel text-center">
          <div className="stat-icon-wrapper bg-blue">
            <Users size={28} />
          </div>
          <h3 className="stat-value">5,204</h3>
          <p className="stat-label">Active Waitlist</p>
        </div>
        <div className="stat-card glass-panel text-center">
          <div className="stat-icon-wrapper bg-green">
            <CheckCircle size={28} />
          </div>
          <h3 className="stat-value">142</h3>
          <p className="stat-label">Successful Transplants (Month)</p>
        </div>
        <div className="stat-card glass-panel text-center">
          <div className="stat-icon-wrapper bg-red">
            <Clock size={28} />
          </div>
          <h3 className="stat-value">24m</h3>
          <p className="stat-label">Avg. Match Time (Critical)</p>
        </div>
      </div>

      <div className="dashboard-main glass-panel">
        <div className="main-header">
          <h2>Active Matches in Progress</h2>
          <span className="live-indicator">
            <span className="live-dot"></span>
            Live Updates
          </span>
        </div>
        
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
              {matches.map((match) => (
                <tr key={match.id}>
                  <td><strong>#{match.id}</strong></td>
                  <td>{match.patientRef}</td>
                  <td>{match.organ}</td>
                  <td>
                    <div className="score-bar-wrapper">
                      <div className="score-bar" style={{ width: `${match.matchScore}%`, backgroundColor: match.matchScore > 90 ? 'var(--color-secondary)' : 'var(--color-primary)' }}></div>
                      <span>{match.matchScore}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${match.status.replace(' ', '-').toLowerCase()}`}>
                      {match.status}
                    </span>
                  </td>
                  <td>{match.eta}</td>
                  <td>
                    <button className="btn btn-outline btn-sm action-btn" onClick={() => setSelectedMatch(match)}>
                      View <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="alert-section glass-panel">
        <ShieldAlert size={24} className="alert-icon" />
        <div className="alert-content">
          <h4>System Alert: High Demand in Delhi NCR Region</h4>
          <p>O-Negative blood type requests have surged by 15% in the last 48 hours for kidney and liver needs. Expediting matching algorithms.</p>
        </div>
        <button className="btn btn-primary btn-sm">Review Policy</button>
      </div>

      {/* Modal Popup */}
      {selectedMatch && (
        <div className="modal-backdrop" onClick={() => setSelectedMatch(null)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <h2>Match #{selectedMatch.id} Logs</h2>
            <div className="modal-body">
              <p><strong>Patient Ref:</strong> {selectedMatch.patientRef}</p>
              <p><strong>Organ Needed:</strong> {selectedMatch.organ}</p>
              <p><strong>Compatibility Score:</strong> <span className="highlight-text">{selectedMatch.matchScore}%</span></p>
              <p><strong>Current Status:</strong> <span className={`status-badge ${selectedMatch.status.replace(' ', '-').toLowerCase()}`}>{selectedMatch.status}</span></p>
              <p><strong>ETA:</strong> {selectedMatch.eta}</p>
              <hr />
              <p className="text-muted">Full logistical tracking and patient histories are securely locked to authorized transplant coordinators in accordance with HIPAA data privacy guidelines.</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => { alert('Opening full secure transport logs...'); setSelectedMatch(null); }}>View Transport Logs</button>
              <button className="btn btn-outline" onClick={() => setSelectedMatch(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
