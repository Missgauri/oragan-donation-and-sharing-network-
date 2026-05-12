import React from 'react';
import { RefreshCw } from 'lucide-react';
import { SORT_OPTIONS } from '../../hooks/useSearch';

/**
 * ResultsHeader
 *
 * Shows result count, active tab counts, and sort control.
 *
 * @param {string}   label        - section label e.g. "Donors"
 * @param {number}   total        - total records before filter
 * @param {number}   filtered     - records after filter
 * @param {string}   sortBy       - current sort value
 * @param {Function} onSortChange - (value) => void
 * @param {boolean}  loading      - show spinner
 * @param {Function} onRefresh    - refresh callback
 * @param {boolean}  showSort     - show sort dropdown (default true)
 */
const ResultsHeader = ({
  label = 'Results',
  total,
  filtered,
  sortBy,
  onSortChange,
  loading = false,
  onRefresh,
  showSort = true,
}) => {
  const isFiltered = filtered !== total;

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      {/* Left: label + count */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-700">{label}</h2>
        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          {filtered}
        </span>
        {isFiltered && (
          <span className="text-xs text-slate-400">
            of {total}
          </span>
        )}
      </div>

      {/* Right: sort + refresh */}
      <div className="flex items-center gap-2">
        {showSort && onSortChange && (
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className={`
              text-xs px-3 py-1.5 rounded-lg border appearance-none cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${sortBy !== 'default'
                ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-500'
              }
            `}
            aria-label="Sort results"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        )}

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-40"
            aria-label="Refresh results"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ResultsHeader;
