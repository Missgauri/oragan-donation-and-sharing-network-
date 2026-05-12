import React, { useState } from 'react';
import { Search, Loader2, SearchX } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import {
  SearchBar, FilterPanel, FilterChips,
  OrganCard, ResultsHeader,
} from '../components/search';

// ── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-slate-100 rounded w-2/3" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
    </div>
    <div className="h-9 bg-slate-100 rounded-xl" />
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────
const Find = () => {
  const [selected, setSelected] = useState(null);

  const {
    filters, updateFilter, resetFilters, activeFilterCount,
    filteredOrgans, totalCounts, filteredCounts,
    loading, refresh,
  } = useSearch('organs');

  const handleRequest = (organ) => setSelected(organ);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-4">
          <Search size={26} className="text-blue-600" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">Organ & Tissue Finder</h1>
        <p className="text-slate-500 mt-2 text-sm">
          Search the national registry for compatible life-saving matches.
        </p>
      </div>

      {/* Search bar */}
      <SearchBar
        value={filters.query}
        onChange={(v) => updateFilter('query', v)}
        placeholder="Search by organ, blood type, location…"
        loading={loading}
        size="lg"
      />

      {/* Active chips */}
      <FilterChips
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        activeCount={activeFilterCount}
      />

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <FilterPanel
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            activeCount={activeFilterCount}
            showEmergencyToggle={false}
            showAvailability={false}
            showSort
            defaultOpen
          />
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0 space-y-4">
          <ResultsHeader
            label="Available Organs"
            total={totalCounts.organs}
            filtered={filteredCounts.organs}
            sortBy={filters.sortBy}
            onSortChange={(v) => updateFilter('sortBy', v)}
            loading={loading}
            onRefresh={refresh}
          />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredOrgans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredOrgans.map((organ) => (
                <OrganCard
                  key={organ.id}
                  organ={organ}
                  query={filters.query}
                  onRequest={handleRequest}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <SearchX size={40} className="opacity-40" aria-hidden="true" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-500">No organs found</p>
                <p className="text-xs mt-1">Try adjusting your filters or search terms.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.organ} details`}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-slate-800 mb-4">{selected.organ} Details</h2>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                ['Blood Type', selected.bloodType],
                ['Location',   selected.location],
                ['Urgency',    selected.urgency],
                ['Date Added', selected.dateAdded || selected.date_added || '—'],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{k}</p>
                  <p className="text-sm font-semibold text-slate-700">{v}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              This organ is available in the national registry. Authorized medical professionals
              may initiate a secure matching request pending verification.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => { alert('Match request sent to regional coordinator.'); setSelected(null); }}
                className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold"
              >
                Initiate Match Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Find;
