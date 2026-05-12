import React from 'react';
import { AlertTriangle, Droplet, MapPin, Hospital, Clock, Phone } from 'lucide-react';

const URGENCY_CONFIG = {
  Critical:  { banner: 'bg-red-600',    badge: 'bg-red-100 text-red-700',    pulse: true  },
  Emergency: { banner: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', pulse: true  },
  High:      { banner: null,            badge: 'bg-red-50 text-red-600',      pulse: false },
  Medium:    { banner: null,            badge: 'bg-amber-50 text-amber-700',  pulse: false },
  Low:       { banner: null,            badge: 'bg-slate-100 text-slate-500', pulse: false },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

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
 * EmergencyCard
 *
 * Displays a single emergency organ request.
 *
 * @param {Object}   request    - emergency request record
 * @param {string}   query      - search query for highlight
 * @param {Function} onRespond  - called when "Respond" is clicked
 */
const EmergencyCard = ({ request, query = '', onRespond }) => {
  const urgency = request.urgency || 'High';
  const config  = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.High;

  return (
    <article
      className={`
        bg-white rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md
        ${config.pulse ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-100'}
      `}
      aria-label={`Emergency request: ${request.organNeeded} for ${request.patientName}`}
    >
      {/* Priority banner */}
      {config.banner && (
        <div className={`${config.banner} text-white px-4 py-1.5 text-xs font-bold flex items-center gap-2`}>
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          {urgency} — Immediate Response Required
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <AlertTriangle size={14} className="text-red-500 shrink-0" aria-hidden="true" />
              <h3 className="text-sm font-bold text-slate-800">
                <Highlight text={request.organNeeded} query={query} /> Needed
              </h3>
            </div>
            <p className="text-xs text-slate-400 ml-5">
              Patient: <span className="font-semibold text-slate-600">
                <Highlight text={request.patientName} query={query} />
              </span>
            </p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${config.badge}`}>
            {urgency}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Droplet size={11} className="text-red-400 shrink-0" aria-hidden="true" />
            Blood Type: <span className="font-semibold text-slate-700 ml-0.5">
              <Highlight text={request.bloodType} query={query} />
            </span>
          </div>
          {request.hospitalName && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Hospital size={11} className="text-blue-400 shrink-0" aria-hidden="true" />
              <Highlight text={request.hospitalName} query={query} />
            </div>
          )}
          {request.location && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin size={11} className="text-slate-400 shrink-0" aria-hidden="true" />
              <Highlight text={request.location} query={query} />
            </div>
          )}
          {request.postedAt && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock size={11} aria-hidden="true" />
              Posted {timeAgo(request.postedAt)}
            </div>
          )}
        </div>

        {/* Action */}
        <button
          type="button"
          onClick={() => onRespond?.(request)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <Phone size={13} aria-hidden="true" />
          Respond to Request
        </button>
      </div>
    </article>
  );
};

export default EmergencyCard;
