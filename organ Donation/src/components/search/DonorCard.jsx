import React, { useState } from 'react';
import {
  User, Droplet, MapPin, Heart,
  ChevronDown, ChevronUp, Calendar,
} from 'lucide-react';

const URGENCY_STYLE = {
  Critical:  'bg-red-100  text-red-700  border-red-200',
  Emergency: 'bg-orange-100 text-orange-700 border-orange-200',
  High:      'bg-red-50   text-red-600  border-red-100',
  Medium:    'bg-amber-50 text-amber-700 border-amber-100',
  Low:       'bg-slate-100 text-slate-500 border-slate-200',
  Voluntary: 'bg-slate-100 text-slate-400 border-slate-200',
};

/**
 * DonorCard
 *
 * Displays a single donor profile in the search results.
 *
 * @param {Object}   donor       - donor record
 * @param {string}   query       - current search query (for highlight)
 * @param {Function} onContact   - called when "Contact" is clicked
 */

// Highlight matching text
function Highlight({ text = '', query = '' }) {
  if (!query || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5 not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

const DonorCard = ({ donor, query = '', onContact }) => {
  const [expanded, setExpanded] = useState(false);
  const organ    = donor.organType || donor.organ || 'Unknown';
  const urgStyle = URGENCY_STYLE[donor.urgency] || URGENCY_STYLE.Voluntary;
  const isAvail  = donor.isAvailable !== false;

  return (
    <article
      className={`
        bg-white rounded-2xl border shadow-sm overflow-hidden
        transition-shadow hover:shadow-md
        ${!isAvail ? 'opacity-70' : ''}
        ${donor.urgency === 'Critical' || donor.urgency === 'Emergency'
          ? 'border-red-200 ring-1 ring-red-100'
          : 'border-slate-100'
        }
      `}
      aria-label={`Donor: ${donor.name}`}
    >
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0
              ${isAvail ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}
            `}>
              {donor.name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-tight">
                <Highlight text={donor.name} query={query} />
              </p>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin size={10} aria-hidden="true" />
                <Highlight text={donor.location} query={query} />
              </p>
            </div>
          </div>

          {/* Availability dot */}
          <span
            className={`
              inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full shrink-0
              ${isAvail ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}
            `}
            aria-label={isAvail ? 'Available' : 'Unavailable'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isAvail ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            {isAvail ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
            <Heart size={11} aria-hidden="true" />
            <Highlight text={organ} query={query} />
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-red-50 text-red-600 px-2.5 py-1 rounded-full">
            <Droplet size={11} aria-hidden="true" />
            <Highlight text={donor.bloodType} query={query} />
          </span>
          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${urgStyle}`}>
            {donor.urgency}
          </span>
        </div>

        {/* Expanded details */}
        {expanded && donor.registeredAt && (
          <div className="mb-4 flex items-center gap-1.5 text-xs text-slate-400 border-t border-slate-50 pt-3">
            <Calendar size={11} aria-hidden="true" />
            Registered: {donor.registeredAt}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onContact?.(donor)}
            disabled={!isAvail}
            className={`
              flex-1 py-2 rounded-xl text-xs font-semibold transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              ${isAvail
                ? 'bg-blue-700 hover:bg-blue-800 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {isAvail ? 'Contact Donor' : 'Unavailable'}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors"
            aria-expanded={expanded}
            aria-label={expanded ? 'Show less' : 'Show more'}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
    </article>
  );
};

export default DonorCard;
