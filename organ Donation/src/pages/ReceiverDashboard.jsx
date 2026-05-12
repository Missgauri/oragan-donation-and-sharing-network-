import React from 'react';
import {
  Search, Clock, Activity, FileText,
  ArrowRight, Phone, Eye, Droplet, MapPin, Heart, RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConfig';
import { useReceiverDashboard } from '../hooks/useReceiverDashboard';
import DashboardSkeleton from '../components/common/DashboardSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';

// ── Helpers ───────────────────────────────────────────────────────────────────

const URGENCY_STYLE = {
  High:      'bg-red-50 text-red-600',
  Medium:    'bg-amber-50 text-amber-600',
  Critical:  'bg-red-100 text-red-700',
  Emergency: 'bg-orange-100 text-orange-700',
  Low:       'bg-slate-100 text-slate-500',
};

const ACTIONS = [
  { label: 'Search Organ Registry', icon: Search,   to: ROUTES.FIND,      primary: true  },
  { label: 'Emergency Request',     icon: Phone,    to: ROUTES.EMERGENCY, danger: true   },
  { label: 'View My Profile',       icon: Eye,      to: ROUTES.PROFILE,   primary: false },
  { label: 'Update Medical Info',   icon: FileText, to: ROUTES.PROFILE,   primary: false },
];

// ── Component ─────────────────────────────────────────────────────────────────

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const {
    compatibleMatches, activeRequest, stats, activity,
    loading, error, refresh,
  } = useReceiverDashboard();
  const name = user?.email?.split('@')[0] ?? 'Receiver';

  if (loading) return <DashboardSkeleton cards={4} rows={3} />;

  return (
    <div className="max-w-6xl mx-auto space-y-5 sm:space-y-8">

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Hello, <span className="text-blue-700 capitalize">{name}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            We're actively searching for a compatible organ match for you.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors" aria-label="Refresh">
            <RefreshCw size={15} />
          </button>
          <Link to={ROUTES.FIND}
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
            <Search size={15} /> Search Registry <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && <ErrorBanner message={error} onRetry={refresh} />}

      {/* Active request notice */}
      {activeRequest && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
          <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
          <p className="text-sm text-amber-700">
            <span className="font-semibold">Active request:</span> {activeRequest.organ_needed || activeRequest.organNeeded} —{' '}
            Blood type <span className="font-bold">{activeRequest.blood_type || activeRequest.bloodType}</span>.{' '}
            Urgency: <span className="font-bold">{activeRequest.urgency}</span>.
            {activeRequest.hospital_name && ` Hospital: ${activeRequest.hospital_name}.`}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Match Status',      value: stats.matchStatus,       sub: 'Live search',       icon: Search,   iconBg: 'bg-blue-50',   iconColor: 'text-blue-500',   border: 'border-l-blue-400'   },
          { label: 'Compatible Donors', value: stats.compatibleDonors,  sub: 'Found by engine',   icon: Heart,    iconBg: 'bg-red-50',    iconColor: 'text-red-400',    border: 'border-l-red-400'    },
          { label: 'Requests Sent',     value: stats.requestsSent,      sub: 'Total submitted',   icon: FileText, iconBg: 'bg-amber-50',  iconColor: 'text-amber-500',  border: 'border-l-amber-400'  },
          { label: 'Urgency Level',     value: stats.urgency,           sub: 'Current priority',  icon: Clock,    iconBg: 'bg-purple-50', iconColor: 'text-purple-500', border: 'border-l-purple-400' },
        ].map(({ label, value, sub, icon: Icon, iconBg, iconColor, border }) => (
          <div key={label} className={`bg-white rounded-2xl p-5 border border-slate-100 border-l-4 ${border} shadow-sm`}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
              <div className={`${iconBg} p-2 rounded-lg`}><Icon size={16} className={iconColor} /></div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Compatible matches */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Compatible Matches</h2>
            <Link to={ROUTES.MATCHING} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {compatibleMatches.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400">
              <Search size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No compatible matches found yet.</p>
              <Link to={ROUTES.FIND} className="text-xs text-blue-600 hover:underline mt-1 inline-block">Search the registry →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-medium">Donor</th>
                  <th className="text-left px-4 py-3 font-medium">Organ</th>
                  <th className="text-left px-4 py-3 font-medium">Blood</th>
                  <th className="text-left px-4 py-3 font-medium">Location</th>
                  <th className="text-left px-4 py-3 font-medium">Score</th>
                  <th className="text-left px-4 py-3 font-medium">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {compatibleMatches.map((m, i) => (
                  <tr key={m.donor.id || i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700 truncate max-w-[100px]">{m.donor.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{m.donor.organType || m.donor.organ_type}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Droplet size={11} className="text-red-400 shrink-0" />{m.donor.bloodType || m.donor.blood_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-slate-400 truncate max-w-[100px]">
                        <MapPin size={11} className="text-blue-400 shrink-0" />{m.donor.location || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-600">{m.score}%</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${URGENCY_STYLE[m.donor.urgency] || 'bg-slate-100 text-slate-500'}`}>
                        {m.donor.urgency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {ACTIONS.map(({ label, icon: Icon, to, primary, danger }) => (
              <Link key={label} to={to}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  danger   ? 'bg-red-50 text-red-600 hover:bg-red-100' :
                  primary  ? 'bg-blue-700 text-white hover:bg-blue-800' :
                             'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}>
                <Icon size={16} />{label}
                <ArrowRight size={13} className="ml-auto opacity-40" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Recent Activity</h2>
        </div>
        {activity.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-400 text-center">No recent activity.</p>
        ) : (
          <ul className="divide-y divide-slate-50">
            {activity.map(item => (
              <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                <span className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
                <p className="flex-1 text-sm text-slate-600">{item.text}</p>
                <span className="text-xs text-slate-300 whitespace-nowrap">{item.time}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ReceiverDashboard;
