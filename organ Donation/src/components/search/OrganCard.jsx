import React from 'react';
import { Droplet, MapPin, Calendar, HeartHandshake } from 'lucide-react';

const URGENCY_STYLE = {
  Critical:  { pill: 'bg-red-600 text-white',    border: 'border-red-200 ring-1 ring-red-100' },
  Emergency: { pill: 'bg-orange-500 text-white',  border: 'border-orange-200 ring-1 ring-orange-100' },
  High:      { pill: 'bg-red-50 text-red-600',    border: 'border-red-100' },
  Medium:    { pill: 'bg-amber-50 text-amber-700', border: 'border-amber-100' },
  Low:       { pill: 'bg-slate-100 text-slate-500',border: 'border-slate-100' },
  Voluntary: { pill: 'bg-slate-100 text-slate-400',border: 'border-slate-100' },
};

// Highlight matching text
function Highlight({ text = '', query = '' }) {
  if (!query || !text) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

/**
 * OrganCard
 *
 * Displays a single organ registry entry.
 *
 * @param {Object}   organ      - organ record
 * @param {string}   query      - search query for highlight
 * @param {Function} onRequest  - called when "Request Match" is clicked
 */
const OrganCard = ({ organ, query = '', onRequest }) => {
  const urgency = organ.urgency || 'Voluntary';
  const style   = URGENCY_STYLE[urgency] || URGENCY_STYLE.Voluntary;
  const isPriority = urgency === 'Critical' || urgency === 'Emergency';

  return (
    <article
      className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${style.border}`}
      aria-label={`Organ: ${organ.organ}`}
    >
      {/* Priority banner */}
      {isPriority && (
        <div className={`px-4 py-1.5 text-xs font-bold flex items-center gap-2 ${
          urgency === 'Critical' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
        }`}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          {urgency} Priority
        </div>
      )}

      <div className="p-5">
        {/* Organ name + urgency badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-base font-bold text-slate-800">
            <Highlight text={organ.organ} query={query} />
          </h3>
          {!isPriority && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${style.pill}`}>
              {urgency}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Droplet size={12} className="text-red-400 shrink-0" aria-hidden="true" />
            Blood Type: <span className="font-semibold text-slate-700 ml-0.5">
              <Highlight text={organ.bloodType} query={query} />
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin size={12} className="text-blue-400 shrink-0" aria-hidden="true" />
            <Highlight text={organ.location} query={query} />
          </div>
          {(organ.dateAdded || organ.date_added) && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar size={12} aria-hidden="true" />
              Added: {organ.dateAdded || organ.date_added}
            </div>
          )}
        </div>

        {/* Action */}
        <button
          type="button"
          onClick={() => onRequest?.(organ)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-blue-700 hover:bg-blue-800 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <HeartHandshake size={13} aria-hidden="true" />
          Request Match
        </button>
      </div>
    </article>
  );
};

export default OrganCard;
