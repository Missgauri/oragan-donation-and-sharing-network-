import React, { useState } from 'react';
import {
  Droplet, MapPin, HeartHandshake, ChevronDown,
  ChevronUp, CheckCircle, Hospital, User,
} from 'lucide-react';
import EmergencyBadge from './EmergencyBadge';
import DonorStatusBadge from './DonorStatusBadge';

/**
 * Score ring — circular progress indicator for match score.
 */
const ScoreRing = ({ score }) => {
  const radius      = 22;
  const circumference = 2 * Math.PI * radius;
  const filled      = (score / 100) * circumference;
  const color =
    score >= 90 ? '#10b981' :
    score >= 75 ? '#3b82f6' :
    score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-14 h-14 shrink-0" aria-label={`Match score: ${score}%`}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="4" />
        <circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-xs font-bold"
        style={{ color }}
      >
        {score}%
      </span>
    </div>
  );
};

/**
 * MatchCard
 *
 * Displays a single donor–recipient match with score, badges, and expandable details.
 *
 * @param {Object}   donor       - donor profile record
 * @param {Object}   recipient   - recipient request record
 * @param {number}   score       - 0–100 match score
 * @param {string[]} reasons     - human-readable match reasons
 * @param {boolean}  isEmergency - true if recipient is Critical/Emergency
 * @param {Function} onConfirm   - called when "Confirm Match" is clicked
 */
const MatchCard = ({ donor, recipient, score, reasons, isEmergency, onConfirm }) => {
  const [expanded, setExpanded] = useState(false);

  const organType = donor.organType || donor.organ || 'Unknown';
  const location  = donor.location  || 'Unknown';

  return (
    <article
      className={`
        bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md
        ${isEmergency ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-100'}
      `}
      aria-label={`Match: ${organType} for ${recipient.patientName}`}
    >
      {/* Emergency banner */}
      {isEmergency && (
        <div className="bg-red-600 text-white text-xs font-semibold px-4 py-1.5 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-200" />
          </span>
          Emergency Priority — Immediate Action Required
        </div>
      )}

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start gap-4">
          <ScoreRing score={score} />

          <div className="flex-1 min-w-0">
            {/* Organ + badges */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-800">{organType}</h3>
              <EmergencyBadge urgency={recipient.urgency} compact />
              <DonorStatusBadge isAvailable={donor.isAvailable !== false} compact />
            </div>

            {/* Donor info */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
              {donor.name && (
                <span className="flex items-center gap-1">
                  <User size={11} aria-hidden="true" />
                  {donor.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Droplet size={11} className="text-red-400" aria-hidden="true" />
                {donor.bloodType}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={11} className="text-blue-400" aria-hidden="true" />
                {location}
              </span>
            </div>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors shrink-0"
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {/* Recipient info strip */}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 bg-slate-50 rounded-xl px-3 py-2">
          <span className="flex items-center gap-1">
            <User size={11} aria-hidden="true" />
            <span className="font-medium text-slate-600">{recipient.patientName}</span>
          </span>
          {recipient.hospitalName && (
            <span className="flex items-center gap-1">
              <Hospital size={11} aria-hidden="true" />
              {recipient.hospitalName}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Droplet size={11} className="text-red-400" aria-hidden="true" />
            Needs: <span className="font-medium text-slate-600 ml-0.5">{recipient.bloodType}</span>
          </span>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            {/* Match reasons */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Why this matches
              </p>
              <ul className="space-y-1">
                {reasons.map((r, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle size={12} className="text-emerald-500 shrink-0" aria-hidden="true" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Donor extra info */}
            {donor.registeredAt && (
              <p className="text-xs text-slate-400">
                Registered: {donor.registeredAt}
              </p>
            )}
          </div>
        )}

        {/* Action row */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => onConfirm?.({ donor, recipient, score, organType })}
            disabled={donor.isAvailable === false}
            className={`
              flex-1 flex items-center justify-center gap-2
              py-2.5 rounded-xl text-sm font-semibold transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              ${donor.isAvailable === false
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : isEmergency
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-700 hover:bg-blue-800 text-white'
              }
            `}
          >
            <HeartHandshake size={15} aria-hidden="true" />
            {donor.isAvailable === false ? 'Donor Unavailable' : 'Confirm Match'}
          </button>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            {expanded ? 'Less' : 'Details'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default MatchCard;
