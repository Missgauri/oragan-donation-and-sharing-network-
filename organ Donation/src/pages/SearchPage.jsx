import React, { useState, useCallback } from 'react';
import { Search, Users, Heart, AlertTriangle, SearchX } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import {
  SearchBar, FilterPanel, FilterChips,
  DonorCard, OrganCard, EmergencyCard, ResultsHeader,
} from '../components/search';

// ── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'donors',    label: 'Donors',    icon: Users,         color: 'blue'   },
  { key: 'organs',    label: 'Organs',    icon: Heart,         color: 'purple' },
  { key: 'emergency', label: 'Emergency', icon: AlertTriangle, color: 'red'    },
];

const TAB_ACTIVE = {
  blue:   'border-blue-600 text-blue-700 bg-blue-50',
  purple: 'border-purple-600 text-purple-700 bg-purple-50',
  red:    'border-red-600 text-red-700 bg-red-50',
};

const TAB_COUNT = {
  blue:   'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  red:    'bg-red-100 text-red-700',
};

// ── Skeleton loader ───────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-slate-200 rounded w-2/3" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
    </div>
    <div className="flex gap-2 mb-4">
      <div className="h-6 bg-slate-100 rounded-full w-20" />
      <div className="h-6 bg-slate-100 rounded-full w-16" />
    </div>
    <div className="h-9 bg-slate-100 rounded-xl" />
  </div>
);

// ── Empty state ───────────────────────────────────────────────────────────────
const EmptyState = ({ query }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
    <SearchX size={40} className="opacity-40" aria-hidden="true" />
    <div className="text-center">
      <p className="text-sm font-semibold text-slate-500">No results found</p>
      <p className="text-xs mt-1">
        {query
          ? `No matches for "${query}". Try different keywords or clear filters.`
          : 'Try adjusting your filters.'}
      </p>
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState('donors');

  const {
    filters, updateFilter, resetFilters, activeFilterCount,
    filteredDonors, filteredOrgans, filteredEmergency,
    totalCounts, filteredCounts,
    loading, refresh,
  } = useSearch('all');

  const handleContact  = useCallback((donor)   => alert(`Contacting donor: ${donor.name}`), []);
  const handleRequest  = useCallback((organ)   => alert(`Requesting match for: ${organ.organ}`), []);
  const handleRespond  = useCallback((request) => alert(`Responding to emergency: ${request.patientName}`), []);

  const emergencyCount = filteredCounts.emergency;
  const hasEmergency   = totalCounts.emergency > 0;

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Search size={22} className="text-blue-600" aria-hidden="true" />
          Advanced Search
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Search donors, organ registry, and emergency requests in one place.
        </p>
      </div>

      {/* ── Search bar ── */}
      <SearchBar
        value={filters.query}
        onChange={(v) => updateFilter('query', v)}
        placeholder="Search by name, organ, blood type, location…"
        loading={loading}
        size="lg"
        autoFocus
      />

      {/* ── Active filter chips ── */}
      <FilterChips
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        activeCount={activeFilterCount}
      />

      {/* ── Main layout: filters sidebar + results ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* Sidebar filters */}
        <aside className="w-full lg:w-64 shrink-0" aria-label="Search filters">
          <FilterPanel
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            activeCount={activeFilterCount}
            showEmergencyToggle
            showAvailability
            showSort
            defaultOpen={false}
          />
        </aside>

        {/* Results area */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Tabs */}
          <div
            className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto"
            role="tablist"
            aria-label="Result categories"
          >
            {TABS.map(({ key, label, icon: Icon, color }) => {
              const count   = filteredCounts[key];
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${key}`}
                  onClick={() => setActiveTab(key)}
                  className={`
                    flex-1 flex items-center justify-center gap-1.5
                    py-2 px-3 rounded-lg text-xs font-semibold transition-all
                    ${isActive
                      ? `bg-white shadow-sm ${TAB_ACTIVE[color]}`
                      : 'text-slate-500 hover:text-slate-700'
                    }
                  `}
                >
                  <Icon size={13} aria-hidden="true" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? TAB_COUNT[color] : 'bg-slate-200 text-slate-500'
                  }`}>
                    {count}
                  </span>
                  {key === 'emergency' && hasEmergency && (
                    <span className="relative flex h-2 w-2 ml-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Donors tab ── */}
          {activeTab === 'donors' && (
            <section id="tabpanel-donors" role="tabpanel" aria-label="Donor results" className="space-y-4">
              <ResultsHeader
                label="Donors"
                total={totalCounts.donors}
                filtered={filteredCounts.donors}
                sortBy={filters.sortBy}
                onSortChange={(v) => updateFilter('sortBy', v)}
                loading={loading}
                onRefresh={refresh}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                  : filteredDonors.length
                    ? filteredDonors.map((d) => (
                        <DonorCard
                          key={d.id}
                          donor={d}
                          query={filters.query}
                          onContact={handleContact}
                        />
                      ))
                    : <EmptyState query={filters.query} />
                }
              </div>
            </section>
          )}

          {/* ── Organs tab ── */}
          {activeTab === 'organs' && (
            <section id="tabpanel-organs" role="tabpanel" aria-label="Organ results" className="space-y-4">
              <ResultsHeader
                label="Organ Registry"
                total={totalCounts.organs}
                filtered={filteredCounts.organs}
                sortBy={filters.sortBy}
                onSortChange={(v) => updateFilter('sortBy', v)}
                loading={loading}
                onRefresh={refresh}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                  : filteredOrgans.length
                    ? filteredOrgans.map((o) => (
                        <OrganCard
                          key={o.id}
                          organ={o}
                          query={filters.query}
                          onRequest={handleRequest}
                        />
                      ))
                    : <EmptyState query={filters.query} />
                }
              </div>
            </section>
          )}

          {/* ── Emergency tab ── */}
          {activeTab === 'emergency' && (
            <section id="tabpanel-emergency" role="tabpanel" aria-label="Emergency results" className="space-y-4">
              <ResultsHeader
                label="Emergency Requests"
                total={totalCounts.emergency}
                filtered={filteredCounts.emergency}
                sortBy={filters.sortBy}
                onSortChange={(v) => updateFilter('sortBy', v)}
                loading={loading}
                onRefresh={refresh}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                  : filteredEmergency.length
                    ? filteredEmergency.map((r) => (
                        <EmergencyCard
                          key={r.id}
                          request={r}
                          query={filters.query}
                          onRespond={handleRespond}
                        />
                      ))
                    : <EmptyState query={filters.query} />
                }
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default SearchPage;
