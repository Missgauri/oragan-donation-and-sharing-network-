import React from 'react';
import { HeartHandshake, Loader2, SearchX } from 'lucide-react';
import MatchCard from './MatchCard';

/**
 * MatchList
 *
 * Renders the grid of MatchCards, with loading and empty states.
 *
 * @param {Array}    matches    - filtered match array from useMatchEngine
 * @param {boolean}  loading    - show skeleton loader
 * @param {Function} onConfirm  - passed down to each MatchCard
 */

// Skeleton placeholder card
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 rounded-full bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-2/3" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-3 bg-slate-100 rounded w-1/3" />
      </div>
    </div>
    <div className="mt-4 h-8 bg-slate-100 rounded-xl" />
  </div>
);

const MatchList = ({ matches, loading, onConfirm }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
        <SearchX size={40} className="opacity-40" aria-hidden="true" />
        <div className="text-center">
          <p className="text-base font-semibold text-slate-500">No matches found</p>
          <p className="text-sm mt-1">Try adjusting your filters or check back when new donors register.</p>
        </div>
      </div>
    );
  }

  // Separate emergency from regular for visual grouping
  const emergency = matches.filter((m) => m.isEmergency);
  const regular   = matches.filter((m) => !m.isEmergency);

  return (
    <div className="space-y-6">
      {/* Emergency section */}
      {emergency.length > 0 && (
        <section aria-label="Emergency matches">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <h2 className="text-sm font-bold text-red-600 uppercase tracking-wide">
              Emergency Matches ({emergency.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {emergency.map((m, i) => (
              <MatchCard
                key={`${m.donor.id}-${m.recipient.id}-${i}`}
                donor={m.donor}
                recipient={m.recipient}
                score={m.score}
                reasons={m.reasons}
                isEmergency={m.isEmergency}
                onConfirm={onConfirm}
              />
            ))}
          </div>
        </section>
      )}

      {/* Regular matches */}
      {regular.length > 0 && (
        <section aria-label="Standard matches">
          {emergency.length > 0 && (
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Standard Matches ({regular.length})
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {regular.map((m, i) => (
              <MatchCard
                key={`${m.donor.id}-${m.recipient.id}-${i}`}
                donor={m.donor}
                recipient={m.recipient}
                score={m.score}
                reasons={m.reasons}
                isEmergency={m.isEmergency}
                onConfirm={onConfirm}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MatchList;
