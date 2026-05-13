import React from 'react';

/**
 * DashboardSkeleton
 *
 * Reusable loading skeleton for dashboard pages.
 * Uses fixed grid classes (not dynamic) so Tailwind can purge correctly.
 *
 * @param {number}  cards - number of stat cards (1–4)
 * @param {number}  rows  - number of table rows
 * @param {boolean} table - show table skeleton
 */

// Fixed grid classes — Tailwind needs static strings to purge correctly
const GRID_COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
};

const DashboardSkeleton = ({ cards = 4, rows = 4, table = true }) => {
  const gridClass = GRID_COLS[Math.min(Math.max(cards, 1), 4)] || GRID_COLS[4];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-pulse">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2.5">
          <div className="h-7 bg-slate-200 rounded-xl w-52" />
          <div className="h-4 bg-slate-100 rounded-lg w-36" />
        </div>
        <div className="h-10 bg-slate-200 rounded-xl w-40 shrink-0" />
      </div>

      {/* Stat cards */}
      <div className={`grid ${gridClass} gap-4`}>
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-5 border border-slate-100 border-l-4 border-l-slate-200 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-3 bg-slate-200 rounded-lg w-24" />
              <div className="w-9 h-9 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-8 bg-slate-200 rounded-lg w-20 mb-2" />
            <div className="h-3 bg-slate-100 rounded-lg w-28" />
          </div>
        ))}
      </div>

      {/* Table card */}
      {table && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="h-4 bg-slate-200 rounded-lg w-40" />
            <div className="h-4 bg-slate-100 rounded-lg w-20" />
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100">
            <div className="h-3 bg-slate-200 rounded w-40 flex-shrink-0" />
            <div className="h-3 bg-slate-200 rounded w-28 flex-shrink-0" />
            <div className="h-3 bg-slate-200 rounded w-20 flex-shrink-0" />
            <div className="h-3 bg-slate-200 rounded w-16 flex-shrink-0" />
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
                {/* Main content */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="h-3.5 bg-slate-200 rounded-lg w-2/5" />
                  <div className="h-3 bg-slate-100 rounded-lg w-1/4" />
                </div>
                {/* Badge */}
                <div className="h-6 bg-slate-100 rounded-full w-20 shrink-0" />
                {/* Action */}
                <div className="h-8 bg-slate-100 rounded-xl w-16 shrink-0 hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Secondary card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="h-4 bg-slate-200 rounded-lg w-32" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-slate-200 shrink-0" />
                <div className="flex-1 h-3.5 bg-slate-100 rounded-lg" />
                <div className="h-3 bg-slate-100 rounded-lg w-16 shrink-0" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
          <div className="h-4 bg-slate-200 rounded-lg w-28 mb-4" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
