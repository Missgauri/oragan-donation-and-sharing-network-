/**
 * components/ui/LiveIndicator.jsx
 * Shows a pulsing dot + label reflecting the realtime connection status.
 *
 * @param {{ isLive: boolean, label?: string, size?: 'sm'|'md' }} props
 */
import React from 'react';
import './LiveIndicator.css';

const LiveIndicator = ({ isLive, label = 'Live', size = 'md' }) => (
  <span className={`live-indicator live-indicator--${size} ${isLive ? 'live-indicator--on' : 'live-indicator--off'}`}>
    <span className="live-dot" />
    {isLive ? label : 'Connecting…'}
  </span>
);

export default LiveIndicator;
