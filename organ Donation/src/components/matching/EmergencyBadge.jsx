import React from 'react';
import { AlertTriangle, Zap } from 'lucide-react';

/**
 * EmergencyBadge
 *
 * Shown on match cards when the recipient urgency is Critical or Emergency.
 *
 * @param {string}  urgency  - 'Critical' | 'Emergency' | 'High' | 'Medium' | 'Low'
 * @param {boolean} compact  - smaller pill variant (no icon text)
 */
const URGENCY_CONFIG = {
  Critical:  { label: 'Critical',  bg: 'bg-red-600',    text: 'text-white', ring: 'ring-red-300',   icon: AlertTriangle, pulse: true  },
  Emergency: { label: 'Emergency', bg: 'bg-orange-500', text: 'text-white', ring: 'ring-orange-300',icon: Zap,           pulse: true  },
  High:      { label: 'High',      bg: 'bg-red-50',     text: 'text-red-600',ring: '',              icon: AlertTriangle, pulse: false },
  Medium:    { label: 'Medium',    bg: 'bg-amber-50',   text: 'text-amber-600',ring: '',            icon: null,          pulse: false },
  Low:       { label: 'Low',       bg: 'bg-slate-100',  text: 'text-slate-500',ring: '',            icon: null,          pulse: false },
  Voluntary: { label: 'Voluntary', bg: 'bg-slate-100',  text: 'text-slate-500',ring: '',            icon: null,          pulse: false },
};

const EmergencyBadge = ({ urgency = 'Low', compact = false }) => {
  const config = URGENCY_CONFIG[urgency] ?? URGENCY_CONFIG.Low;
  const Icon   = config.icon;
  const isPriority = config.pulse;

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-semibold rounded-full
        ${compact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}
        ${config.bg} ${config.text}
        ${config.ring ? `ring-2 ${config.ring}` : ''}
      `}
      aria-label={`Urgency: ${config.label}`}
    >
      {isPriority && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            urgency === 'Critical' ? 'bg-red-300' : 'bg-orange-300'
          }`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            urgency === 'Critical' ? 'bg-red-200' : 'bg-orange-200'
          }`} />
        </span>
      )}
      {Icon && !isPriority && <Icon size={10} aria-hidden="true" />}
      {config.label}
    </span>
  );
};

export default EmergencyBadge;
