import React from 'react';

/**
 * StatusBadge
 * Displays a colour-coded match status label.
 *
 * @param {{ status: string }} props
 */
const StatusBadge = ({ status }) => (
  <span className={`status-badge ${status.replace(/ /g, '-').toLowerCase()}`}>
    {status}
  </span>
);

export default StatusBadge;
