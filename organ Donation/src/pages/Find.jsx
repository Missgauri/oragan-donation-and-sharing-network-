import React, { useState } from 'react';
import { Search, X, Droplet, MapPin, Calendar, HeartHandshake, SearchX, Loader2 } from 'lucide-react';
import { useSearch, ORGAN_OPTIONS, BLOOD_OPTIONS } from '../hooks/useSearch';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes/routeConfig';

// ── Urgency config ────────────────────────────────────────────────────────────
const URGENCY_LABEL = {
  Critical:  { text: 'Critical Priority',  cls: 'bg-red-100 text-red-700'    },
  Emergency: { text: 'Emergency Priority', cls: 'bg-orange-100 text-orange-700' },
  High:      { text: 'High Priority',      cls: 'bg-red-50 text-red-600'     },
  Medium:    { text: 'Medium Priority',    cls: 'bg-amber-50 text-amber-700' },
  Low:       { text: 'Low Priority',       cls: 'bg-slate-100 text-slate-500' },
  Voluntary: { text: 'Voluntary',          cls: 'bg-slate-100 text-slate-400' },
};

// ── Skeleton card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="h-5 bg-slate-200 rounded w-24" />
      <div className="h-5 bg-slate-100 rounded-full w-20" />
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3.5 bg-slate-100 rounded w-32" />
      <div className="h-3.5 bg-slate-100 rounded w-28" />
      <div className="h-3.5 bg-slate-100 rounded w-24" />
    </div>
    <div className="h-9 bg-slate-100 rounded-xl" />
  </div>
);

// ── Organ card ────────────────────────────────────────────────────────────────
const OrganCard = ({ organ, onView }) => {
  const urgency = organ.urgency || 'Voluntary';
  const urg     = URGENCY_LABEL[urgency] || URGENCY_LABEL.Voluntary;

  return (
    <article className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-base font-bold text-slate-800">{organ.organ}</h3>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${urg.cls}`}>
            {urg.text}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Droplet size={13} className="text-red-400 shrink-0" />
            Blood Type: <span className="font-semibold text-slate-800 ml-0.5">{organ.bloodType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <MapPin size={13} className="text-blue-400 shrink-0" />
            {organ.location}
          </div>
          {(organ.dateAdded || organ.date_added) && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar size={12} />
              Added: {organ.dateAdded || organ.date_added}
            </div>
          )}
        </div>

        {/* Action */}
        <button
          onClick={() => onView(organ)}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}
        >
          View Details
        </button>
      </div>
    </article>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const Find = () => {
  const [selected, setSelected] = useState(null);

  const {
    filters, updateFilter, resetFilters,
    filteredOrgans, totalCounts,
    loading,
  } = useSearch('organs');

  // Only show organ type pills (All + main organs) and blood type dropdown
  const organPills = ['All', 'Kidney', 'Liver', 'Heart', 'Lungs'];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Header ── */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Organ & Tissue Finder</h1>
        <p className="text-slate-500 text-sm">
          Search the national database for compatible life-saving matches.
        </p>
      </div>

      {/* ── Filters row ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">

        {/* Organ type pills */}
        <div className="flex flex-wrap gap-2">
          {organPills.map(organ => (
            <button
              key={organ}
              onClick={() => updateFilter('organType', organ === filters.organType ? 'All' : organ)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                filters.organType === organ
                  ? 'text-white border-transparent shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
              }`}
              style={filters.organType === organ ? { background: 'var(--color-primary)', borderColor: 'var(--color-primary)' } : {}}
            >
              {organ === 'All' ? 'All Organs' : organ}
            </button>
          ))}
        </div>

        {/* Blood type select */}
        <select
          value={filters.bloodType}
          onChange={e => updateFilter('bloodType', e.target.value)}
          className="sm:ml-auto px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:border-transparent cursor-pointer"
          style={{ '--tw-ring-color': 'var(--color-primary)' }}
        >
          {BLOOD_OPTIONS.map(bt => (
            <option key={bt} value={bt}>{bt === 'All' ? 'All Blood Types' : bt}</option>
          ))}
        </select>
      </div>

      {/* ── Search bar ── */}
      <div className="relative mb-6">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          type="search"
          value={filters.query}
          onChange={e => updateFilter('query', e.target.value)}
          placeholder="Search by organ, blood type, location…"
          className="w-full h-12 pl-11 pr-10 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent hover:border-slate-300 transition-all"
          style={{ '--tw-ring-color': 'var(--color-primary)' }}
        />
        {filters.query && (
          <button
            onClick={() => updateFilter('query', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* ── Results count ── */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          {loading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 size={13} className="animate-spin text-blue-500" /> Loading…
            </span>
          ) : (
            <>
              <span className="font-semibold text-slate-700">{filteredOrgans.length}</span>
              {' '}Available Match{filteredOrgans.length !== 1 ? 'es' : ''}
              {totalCounts.organs !== filteredOrgans.length && (
                <span className="text-slate-400"> of {totalCounts.organs}</span>
              )}
            </>
          )}
        </p>
        {(filters.organType !== 'All' || filters.bloodType !== 'All' || filters.query) && (
          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
          >
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* ── Results grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredOrgans.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrgans.map(organ => (
            <OrganCard key={organ.id} organ={organ} onView={setSelected} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <SearchX size={36} className="opacity-30" />
          <p className="text-sm font-semibold text-slate-500">No organs found</p>
          <p className="text-xs">Try adjusting your filters or search terms.</p>
          <button onClick={resetFilters}
            className="mt-1 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
            Clear all filters
          </button>
        </div>
      )}

      {/* ── Emergency CTA ── */}
      <div className="mt-10 bg-red-50 border border-red-100 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <p className="text-sm font-bold text-red-700 mb-0.5">Need an organ urgently?</p>
          <p className="text-xs text-red-600">Submit an emergency request or call our 24/7 helpline immediately.</p>
        </div>
        <div className="flex gap-2 sm:ml-auto shrink-0">
          <a href="tel:18001147770"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">
            Call 1800-11-4770
          </a>
          <Link to={ROUTES.EMERGENCY}
            className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-100 text-sm font-semibold transition-colors">
            Submit Request
          </Link>
        </div>
      </div>

      {/* ── Detail modal ── */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">{selected.organ}</h2>
              <button onClick={() => setSelected(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              {[
                ['Blood Type', selected.bloodType],
                ['Location',   selected.location],
                ['Priority',   selected.urgency],
                ['Date Added', selected.dateAdded || selected.date_added || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">{k}</span>
                  <span className="text-sm font-semibold text-slate-800">{v}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              This organ is available in the national registry. Authorized medical professionals
              may initiate a secure matching request pending verification.
            </p>

            <div className="flex gap-2">
              <button onClick={() => setSelected(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                Close
              </button>
              <button
                onClick={() => { alert('Match request sent to regional coordinator.'); setSelected(null); }}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: 'var(--color-primary)' }}>
                <HeartHandshake size={15} />
                Request Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Find;
