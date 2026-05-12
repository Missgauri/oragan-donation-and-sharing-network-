import React from 'react';
import { X } from 'lucide-react';

/**
 * FilterChips
 *
 * Renders active filters as dismissible pill chips.
 * Shows nothing when no filters are active.
 *
 * @param {Object}   filters       - current filter state
 * @param {Function} updateFilter  - (key, value) => void
 * @param {Function} resetFilters  - clears all filters
 * @param {number}   activeCount   - number of active filters
 */

// Maps filter key → human-readable label prefix
const CHIP_LABELS = {
  organType:    'Organ',
  bloodType:    'Blood',
  urgency:      'Urgency',
  availability: 'Status',
};

const FilterChips = ({ filters, updateFilter, resetFilters, activeCount }) => {
  if (activeCount === 0) return null;

  const chips = [];

  // Text query chip
  if (filters.query) {
    chips.push({
      key:   'query',
      label: `"${filters.query}"`,
      onRemove: () => updateFilter('query', ''),
    });
  }

  // Dropdown filter chips
  Object.entries(CHIP_LABELS).forEach(([key, prefix]) => {
    if (filters[key] && filters[key] !== 'All') {
      chips.push({
        key,
        label: `${prefix}: ${filters[key]}`,
        onRemove: () => updateFilter(key, 'All'),
      });
    }
  });

  // Emergency only chip
  if (filters.emergencyOnly) {
    chips.push({
      key:   'emergencyOnly',
      label: 'Emergency Only',
      onRemove: () => updateFilter('emergencyOnly', false),
      danger: true,
    });
  }

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="group"
      aria-label="Active filters"
    >
      <span className="text-xs text-slate-400 font-medium shrink-0">Active:</span>

      {chips.map((chip) => (
        <span
          key={chip.key}
          className={`
            inline-flex items-center gap-1.5 text-xs font-semibold
            px-2.5 py-1 rounded-full
            ${chip.danger
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
            }
          `}
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            className={`
              rounded-full p-0.5 transition-colors
              ${chip.danger
                ? 'hover:bg-red-200 text-red-500'
                : 'hover:bg-blue-200 text-blue-500'
              }
            `}
            aria-label={`Remove filter: ${chip.label}`}
          >
            <X size={10} />
          </button>
        </span>
      ))}

      {/* Clear all */}
      {activeCount > 1 && (
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs text-slate-400 hover:text-red-500 font-medium underline underline-offset-2 transition-colors"
          aria-label="Clear all filters"
        >
          Clear all
        </button>
      )}
    </div>
  );
};

export default FilterChips;
