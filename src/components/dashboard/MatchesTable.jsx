import React from 'react';
import { ArrowRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

/**
 * MatchesTable
 * Renders the active matches table with a "View" action per row.
 *
 * @param {{ matches: Array, onViewMatch: Function }} props
 */
const MatchesTable = ({ matches, onViewMatch }) => (
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
                <div
                  className="score-bar"
                  style={{
                    width: `${match.matchScore}%`,
                    backgroundColor:
                      match.matchScore > 90
                        ? 'var(--color-secondary)'
                        : 'var(--color-primary)',
                  }}
                />
                <span>{match.matchScore}%</span>
              </div>
            </td>
            <td><StatusBadge status={match.status} /></td>
            <td>{match.eta}</td>
            <td>
              <button
                className="btn btn-outline btn-sm action-btn"
                onClick={() => onViewMatch(match)}
              >
                View <ArrowRight size={14} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default MatchesTable;
