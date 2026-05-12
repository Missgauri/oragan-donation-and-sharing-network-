import React from 'react';

/**
 * DashboardSkeleton
 *
 * Reusable loading skeleton for dashboard pages.
 *
 * @param {number} cards   - number of stat cards to show
 * @param {number} rows    - number of table rows to show
 * @param {boolean} table  - show table skeleton
 */
const DashboardSkeleton = ({ cards = 4, rows = 4, table = true }) => (
  <div className="max-w-6xl mx-auto space-y-6 animate-pulse">

    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-7 bg-slate-200 rounded-lg w-56" />
        <div className="h-4 bg-slate-100 rounded w-40" />
      </div>
      <div className="h-10 bg-slate-200 rounded-xl w-36" />
    </div>

    {/* Stat cards */}
    <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-${Math.min(cards, 4)} gap-4`}>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 border-l-4 border-l-slate-200 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="h-3 bg-slate-200 rounded w-24" />
            <div className="w-8 h-8 bg-slate-100 rounded-lg" />
          </div>
          <div className="h-8 bg-slate-200 rounded w-16 mb-2" />
          <div className="h-3 bg-slate-100 rounded w-28" />
        </div>
      ))}
    </div>

    {/* Table */}
    {table && (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="h-4 bg-slate-200 rounded w-40" />
        </div>
        <div className="divide-y divide-slate-50">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
              <div className="h-6 bg-slate-100 rounded-full w-16" />
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default DashboardSkeleton;
