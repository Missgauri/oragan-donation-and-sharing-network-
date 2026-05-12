import React, { useState } from 'react';
import {
  SlidersHorizontal, ChevronDown, ChevronUp,
  Droplet, Heart, AlertTriangle, Activity,
  ToggleLeft, ToggleRight, X,
} from 'lucide-react';
import {
  ORGAN_OPTIONS, BLOOD_OPTIONS, URGENCY_OPTIONS, SORT_OPTIONS,
} from '../../hooks/useSearch';

/**
 * FilterPanel
 *
 * Collapsible filter panel with organ, blood type, urgency,
 * availability, emergency toggle, and sort controls.
 *
 * @param {Object}   filters       - current filter state
 * @param {Function} updateFilter  - (key, value) => void
 * @param {Function} resetFilters  - clears all filters
 * @param {number}   activeCount   - number of active filters
 * @param {boolean}  showEmergencyToggle - show the emergency-only toggle
 * @param {boolean}  showAvailability    - show availability filter
 * @param {boolean}  showSort            - show sort dropdown
 * @param {boolean}  defaultOpen         - start expanded
 */

// ── Blood type button grid ────────────────────────────────────────────────────
const BloodTypeGrid = ({ value, onChange }) => (
  <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Blood type filter">
    {BLOOD_OPTIONS.map((bt) => (
      <button
        key={bt}
        type="button"
        onClick={() => onChange(bt === value ? 'All' : bt)}
        className={`
          py-1.5 rounded-lg text-xs font-bold border transition-all
          ${value === bt
            ? 'bg-red-500 border-red-500 text-white shadow-sm'
            : 'bg-white border-slate-200 text-slate-600 hover:border-red-300 hover:text-red-600'
          }
        `}
        aria-pressed={value === bt}
        aria-label={bt === 'All' ? 'All blood types' : `Blood type ${bt}`}
      >
        {bt === 'All' ? 'All' : bt}
      </button>
    ))}
  </div>
);

// ── Organ pill buttons ────────────────────────────────────────────────────────
const OrganPills = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-1.5" role="group" aria-label="Organ type filter">
    {ORGAN_OPTIONS.map((organ) => (
      <button
        key={organ}
        type="button"
        onClick={() => onChange(organ === value ? 'All' : organ)}
        className={`
          px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
          ${value === organ
            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
          }
        `}
        aria-pressed={value === organ}
      >
        {organ === 'All' ? 'All Organs' : organ}
      </button>
    ))}
  </div>
);

// ── Urgency select ────────────────────────────────────────────────────────────
const URGENCY_COLORS = {
  Critical:  'text-red-700  bg-red-50  border-red-200',
  Emergency: 'text-orange-700 bg-orange-50 border-orange-200',
  High:      'text-red-600  bg-red-50  border-red-100',
  Medium:    'text-amber-700 bg-amber-50 border-amber-200',
  Low:       'text-slate-600 bg-slate-50 border-slate-200',
  Voluntary: 'text-slate-500 bg-slate-50 border-slate-200',
};

const UrgencySelect = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-1.5" role="group" aria-label="Urgency filter">
    {URGENCY_OPTIONS.map((u) => (
      <button
        key={u}
        type="button"
        onClick={() => onChange(u === value ? 'All' : u)}
        className={`
          px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
          ${value === u
            ? (URGENCY_COLORS[u] || 'bg-slate-100 text-slate-700 border-slate-300') + ' ring-2 ring-offset-1 ring-current'
            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
          }
        `}
        aria-pressed={value === u}
      >
        {u === 'All' ? 'All Urgency' : u}
      </button>
    ))}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const FilterPanel = ({
  filters,
  updateFilter,
  resetFilters,
  activeCount = 0,
  showEmergencyToggle = true,
  showAvailability    = true,
  showSort            = true,
  defaultOpen         = true,
}) => {
  // On mobile default to closed to save vertical space
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors"
        aria-expanded={open}
        aria-controls="filter-panel-body"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-blue-500" aria-hidden="true" />
          <span className="text-sm font-semibold text-slate-700">Filters & Sort</span>
          {activeCount > 0 && (
            <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); resetFilters(); }}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
              aria-label="Reset all filters"
            >
              <X size={11} /> Reset
            </button>
          )}
          {open
            ? <ChevronUp   size={16} className="text-slate-400" aria-hidden="true" />
            : <ChevronDown size={16} className="text-slate-400" aria-hidden="true" />
          }
        </div>
      </button>

      {/* Body */}
      {open && (
        <div id="filter-panel-body" className="px-5 pb-5 space-y-5 border-t border-slate-100">

          {/* Organ type */}
          <div className="pt-4">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">
              <Heart size={12} className="text-blue-400" aria-hidden="true" />
              Organ Type
            </label>
            <OrganPills
              value={filters.organType}
              onChange={(v) => updateFilter('organType', v)}
            />
          </div>

          {/* Blood type */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">
              <Droplet size={12} className="text-red-400" aria-hidden="true" />
              Blood Type
            </label>
            <BloodTypeGrid
              value={filters.bloodType}
              onChange={(v) => updateFilter('bloodType', v)}
            />
          </div>

          {/* Urgency */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">
              <AlertTriangle size={12} className="text-amber-400" aria-hidden="true" />
              Urgency Level
            </label>
            <UrgencySelect
              value={filters.urgency}
              onChange={(v) => updateFilter('urgency', v)}
            />
          </div>

          {/* Bottom row: availability + emergency toggle + sort */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-1">

            {/* Availability */}
            {showAvailability && (
              <div className="flex-1 min-w-[130px]">
                <label
                  htmlFor="filter-availability"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2"
                >
                  <Activity size={12} className="text-emerald-400" aria-hidden="true" />
                  Availability
                </label>
                <select
                  id="filter-availability"
                  value={filters.availability}
                  onChange={(e) => updateFilter('availability', e.target.value)}
                  className={`
                    w-full px-3 py-2 text-xs rounded-xl border appearance-none cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${filters.availability !== 'All'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                    }
                  `}
                >
                  <option value="All">All Donors</option>
                  <option value="Available">Available Only</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>
            )}

            {/* Sort */}
            {showSort && (
              <div className="flex-1 min-w-[150px]">
                <label
                  htmlFor="filter-sort"
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2"
                >
                  Sort By
                </label>
                <select
                  id="filter-sort"
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className={`
                    w-full px-3 py-2 text-xs rounded-xl border appearance-none cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${filters.sortBy !== 'default'
                      ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                    }
                  `}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Emergency only toggle */}
            {showEmergencyToggle && (
              <div className="flex items-end pb-0.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={filters.emergencyOnly}
                  onClick={() => updateFilter('emergencyOnly', !filters.emergencyOnly)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all
                    ${filters.emergencyOnly
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'bg-white border-slate-200 text-slate-500 hover:border-red-300 hover:text-red-600'
                    }
                  `}
                >
                  {filters.emergencyOnly
                    ? <ToggleRight size={15} aria-hidden="true" />
                    : <ToggleLeft  size={15} aria-hidden="true" />
                  }
                  Emergency Only
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
