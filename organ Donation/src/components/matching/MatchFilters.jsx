import React from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';

const ORGAN_OPTIONS   = ['All', 'Kidney', 'Liver', 'Heart', 'Lungs', 'Bone Marrow', 'Pancreas'];
const BLOOD_OPTIONS   = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const URGENCY_OPTIONS = ['All', 'Critical', 'Emergency', 'High', 'Medium', 'Low'];
const AVAIL_OPTIONS   = ['All', 'Available', 'Unavailable'];

/**
 * MatchFilters
 *
 * Filter bar for the matching dashboard.
 *
 * @param {Object}   filters    - current filter state
 * @param {Function} setFilters - update filter state
 * @param {number}   total      - total matches before filtering
 * @param {number}   filtered   - matches after filtering
 */
const MatchFilters = ({ filters, setFilters, total, filtered }) => {
  const hasActiveFilters =
    filters.organType    !== 'All' ||
    filters.bloodType    !== 'All' ||
    filters.urgency      !== 'All' ||
    filters.availability !== 'All' ||
    filters.search       !== '';

  const reset = () =>
    setFilters({ organType: 'All', bloodType: 'All', urgency: 'All', availability: 'All', search: '' });

  const update = (key) => (e) =>
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <SlidersHorizontal size={15} className="text-blue-500" aria-hidden="true" />
          Filters
          {hasActiveFilters && (
            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-xs text-slate-400">
            Showing <span className="font-semibold text-slate-600">{filtered}</span> of{' '}
            <span className="font-semibold text-slate-600">{total}</span> matches
          </p>
          {hasActiveFilters && (
            <button
              onClick={reset}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
              aria-label="Clear all filters"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search by organ, blood type, location, patient…"
          value={filters.search}
          onChange={update('search')}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder:text-slate-400"
          aria-label="Search matches"
        />
        {filters.search && (
          <button
            onClick={() => setFilters((p) => ({ ...p, search: '' }))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Organ',        key: 'organType',    options: ORGAN_OPTIONS   },
          { label: 'Blood Type',   key: 'bloodType',    options: BLOOD_OPTIONS   },
          { label: 'Urgency',      key: 'urgency',      options: URGENCY_OPTIONS },
          { label: 'Availability', key: 'availability', options: AVAIL_OPTIONS   },
        ].map(({ label, key, options }) => (
          <div key={key} className="relative">
            <label htmlFor={`filter-${key}`} className="sr-only">{label}</label>
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Filter size={12} className="text-slate-400" aria-hidden="true" />
            </div>
            <select
              id={`filter-${key}`}
              value={filters[key]}
              onChange={update(key)}
              className={`
                w-full pl-7 pr-3 py-2 text-xs rounded-xl border appearance-none cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${filters[key] !== 'All'
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
                }
              `}
            >
              {options.map((o) => (
                <option key={o} value={o}>
                  {o === 'All' ? `All ${label}s` : o}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchFilters;
