import React, { useState, useCallback } from 'react';
import {
  HeartHandshake, RefreshCw, AlertTriangle,
  CheckCircle, Activity, Users, Zap,
} from 'lucide-react';
import { useMatchEngine } from '../hooks/useMatchEngine';
import { confirmMatch }   from '../services/matchService';
import { MatchList, MatchFilters } from '../components/matching';

// ── Confirm modal ─────────────────────────────────────────────────────────────

const ConfirmModal = ({ match, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await confirmMatch({
        donorId:     match.donor.id,
        recipientId: match.recipient.patientName,
        organ:       match.organType,
        score:       match.score,
      });
      setDone(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 1500);
    } catch (err) {
      console.error('Failed to confirm match:', err);
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Confirm match"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <CheckCircle size={48} className="text-emerald-500" />
            <p className="text-base font-semibold text-slate-700">Match Confirmed!</p>
            <p className="text-sm text-slate-400">The match has been recorded and coordinators notified.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <HeartHandshake size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">Confirm Match</h3>
                <p className="text-xs text-slate-400">This will notify the transplant coordinator.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                ['Organ',      match.organType],
                ['Match Score',`${match.score}%`],
                ['Donor Blood',match.donor.bloodType],
                ['Patient',    match.recipient.patientName],
                ['Hospital',   match.recipient.hospitalName || '—'],
                ['Urgency',    match.recipient.urgency],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{k}</p>
                  <p className="text-sm font-semibold text-slate-700 truncate">{v}</p>
                </div>
              ))}
            </div>

            {(match.recipient.urgency === 'Critical' || match.recipient.urgency === 'Emergency') && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
                <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 font-medium">
                  This is a critical/emergency case. Confirming will immediately escalate to the transplant team.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><RefreshCw size={14} className="animate-spin" /> Confirming…</>
                ) : (
                  <><CheckCircle size={14} /> Confirm Match</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor, border }) => (
  <div className={`bg-white rounded-2xl p-5 border border-slate-100 border-l-4 ${border} shadow-sm`}>
    <div className="flex items-start justify-between mb-3">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <div className={`${iconBg} p-2 rounded-lg`}>
        <Icon size={16} className={iconColor} />
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-800">{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────

const MatchingDashboard = () => {
  const {
    donors, recipients,
    allMatches, filteredMatches,
    filters, setFilters,
    loading, error, refresh,
  } = useMatchEngine();

  const [confirmTarget, setConfirmTarget] = useState(null);

  const handleConfirm = useCallback((matchData) => {
    setConfirmTarget(matchData);
  }, []);

  const emergencyCount = allMatches.filter((m) => m.isEmergency).length;
  const availableDonors = donors.filter((d) => d.isAvailable !== false).length;
  const topScore = allMatches[0]?.score ?? 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HeartHandshake size={22} className="text-blue-600" aria-hidden="true" />
            Matching Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Live donor–recipient compatibility engine
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
          aria-label="Refresh matches"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-amber-700">
            <span className="font-semibold">Using demo data</span> — Could not connect to the database.
            Run <code className="bg-amber-100 px-1 rounded text-xs">supabase_matching.sql</code> to enable live data.
          </p>
        </div>
      )}

      {/* ── Emergency alert ── */}
      {emergencyCount > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <span className="relative flex h-3 w-3 mt-0.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </span>
          <p className="text-sm text-red-700">
            <span className="font-bold">{emergencyCount} emergency match{emergencyCount > 1 ? 'es' : ''} require immediate attention.</span>
            {' '}Scroll down to review critical cases first.
          </p>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Matches"
          value={allMatches.length}
          sub="Across all recipients"
          icon={Activity}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          border="border-l-blue-400"
        />
        <StatCard
          label="Emergency Cases"
          value={emergencyCount}
          sub="Needs immediate action"
          icon={Zap}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          border="border-l-red-400"
        />
        <StatCard
          label="Available Donors"
          value={availableDonors}
          sub={`of ${donors.length} registered`}
          icon={Users}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
          border="border-l-emerald-400"
        />
        <StatCard
          label="Best Match Score"
          value={topScore ? `${topScore}%` : '—'}
          sub="Highest compatibility"
          icon={HeartHandshake}
          iconBg="bg-purple-50"
          iconColor="text-purple-500"
          border="border-l-purple-400"
        />
      </div>

      {/* ── Filters ── */}
      <MatchFilters
        filters={filters}
        setFilters={setFilters}
        total={allMatches.length}
        filtered={filteredMatches.length}
      />

      {/* ── Match list ── */}
      <MatchList
        matches={filteredMatches}
        loading={loading}
        onConfirm={handleConfirm}
      />

      {/* ── Confirm modal ── */}
      {confirmTarget && (
        <ConfirmModal
          match={confirmTarget}
          onClose={() => setConfirmTarget(null)}
          onSuccess={refresh}
        />
      )}
    </div>
  );
};

export default MatchingDashboard;
