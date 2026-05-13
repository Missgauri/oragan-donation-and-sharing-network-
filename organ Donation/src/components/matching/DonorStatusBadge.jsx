import React from 'react';

/**
 * DonorStatusBadge
 *
 * Shows whether a donor is currently available for matching.
 *
 * @param {boolean} isAvailable
 * @param {boolean} compact      - smaller pill
 */
const DonorStatusBadge = ({ isAvailable = true, compact = false }) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-semibold rounded-full
        ${compact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}
        ${isAvailable
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-slate-100 text-slate-400'
        }
      `}
      aria-label={isAvailable ? 'Donor available' : 'Donor unavailable'}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
        }`}
        aria-hidden="true"
      />
      {isAvailable ? 'Available' : 'Unavailable'}
    </span>
  );
};

export default DonorStatusBadge;
