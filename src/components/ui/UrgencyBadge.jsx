import React from 'react';

/**
 * UrgencyBadge
 * Displays a colour-coded urgency label.
 *
 * @param {{ urgency: 'Critical'|'High'|'Medium'|'Low'|'Voluntary' }} props
 */
const UrgencyBadge = ({ urgency }) => (
  <span className={`urgency-badge ${urgency.toLowerCase()}`}>
    {urgency} Priority
  </span>
);

export default UrgencyBadge;
