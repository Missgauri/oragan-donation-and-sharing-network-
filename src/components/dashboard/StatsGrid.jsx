import React from 'react';
import { Users, CheckCircle, Clock } from 'lucide-react';

const STATS = [
  { icon: Users,        value: '5,204', label: 'Active Waitlist',                colorClass: 'bg-blue'  },
  { icon: CheckCircle,  value: '142',   label: 'Successful Transplants (Month)', colorClass: 'bg-green' },
  { icon: Clock,        value: '24m',   label: 'Avg. Match Time (Critical)',     colorClass: 'bg-red'   },
];

/**
 * StatsGrid
 * Three summary stat cards shown at the top of the Dashboard.
 */
const StatsGrid = () => (
  <div className="stats-grid">
    {STATS.map(({ icon: Icon, value, label, colorClass }) => (
      <div key={label} className="stat-card glass-panel text-center">
        <div className={`stat-icon-wrapper ${colorClass}`}>
          <Icon size={28} />
        </div>
        <h3 className="stat-value">{value}</h3>
        <p className="stat-label">{label}</p>
      </div>
    ))}
  </div>
);

export default StatsGrid;
