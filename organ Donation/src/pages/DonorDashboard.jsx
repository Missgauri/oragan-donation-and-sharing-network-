import React from 'react';
import {
  HeartHandshake, CheckCircle, Activity,
  ArrowRight, Eye, FileText, Bell, Heart,
  RefreshCw, Droplet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConfig';
import { useDonorDashboard } from '../hooks/useDonorDashboard';
import DashboardSkeleton from '../components/common/DashboardSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import { formatDate } from '../utils/formatDate';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  'Transporting':    'bg-blue-50 text-blue-600',
  'Preparing Match': 'bg-amber-50 text-amber-600',
  'Pending Review':  'bg-slate-100 text-slate-500',
  'In Surgery':      'bg-red-50 text-red-600',
};

const ACTIONS = [
  { label: 'Register New Organ', icon: HeartHandshake, to: ROUTES.DONATE,    primary: true  },
  { label: 'View Matches',       icon: Eye,            to: ROUTES.MATCHING,  primary: false },
  { label: 'Update Profile',     icon: FileText,       to: ROUTES.PROFILE,   primary: false },
  { label: 'Emergency Contact',  icon: Bell,           to: ROUTES.EMERGENCY, primary: false },
];

// ── Component ─────────────────────────────────────────────────────────────────

const DonorDashboard = () => {
  const { user } = useAuth();
  const { organs, matches, stats, activity, loading, error, refresh } = useDonorDashboard();
  const name = user?.email?.split('@')[0] ?? 'Donor';

  if (loading) return <DashboardSkeleton cards={4} rows={3} />;

  return (
    <div className="max-w-6xl mx-auto space-y-5 sm:space-y-8">

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Good morning, <span className="text-blue-700 capitalize">{name}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Here's an overview of your donor activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"
            aria-label="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          <Link
            to={ROUTES.DONATE}
            className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <HeartHandshake size={16} /> Register Organ <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && <ErrorBanner message={error} onRetry={refresh} />}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Registration',       value: stats.activeOrgans > 0 ? 'Active' : 'Pending', sub: 'Verified donor',       icon: CheckCircle,   iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500', border: 'border-l-emerald-400' },
          { label: 'Organs Registered',  value: stats.organsRegistered,                         sub: 'In national registry', icon: HeartHandshake,iconBg: 'bg-blue-50',    iconColor: 'text-blue-500',    border: 'border-l-blue-400'    },
          { label: 'Pending Matches',    value: stats.pendingMatches,                            sub: 'Under review',         icon: Activity,      iconBg: 'bg-amber-50',   iconColor: 'text-amber-500',   border: 'border-l-amber-400'   },
          { label: 'Active Matches',     value: stats.activeMatches,                             sub: 'In progress',          icon: Heart,         iconBg: 'bg-red-50',     iconColor: 'text-red-400',     border: 'border-l-red-400'     },
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

        {/* Registered organs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Registered Organs</h2>
            <Link to={ROUTES.DONATE} className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
              Add new <ArrowRight size={12} />
            </Link>
          </div>

          {organs.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-400">
              <HeartHandshake size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No organs registered yet.</p>
              <Link to={ROUTES.DONATE} className="text-xs text-blue-600 hover:underline mt-1 inline-block">Register your first organ →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-6 py-3 font-medium">Organ</th>
                  <th className="text-left px-6 py-3 font-medium">Blood Type</th>
                  <th className="text-left px-6 py-3 font-medium">Registered</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {organs.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700">{o.organ_type || o.organType}</td>
                    <td className="px-6 py-4 text-slate-500 flex items-center gap-1.5">
                      <Droplet size={12} className="text-red-400" />{o.blood_type || o.bloodType}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{formatDate(o.registered_at || o.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        o.is_available !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${o.is_available !== false ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {o.is_available !== false ? 'Active' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}

          {/* Active matches */}
          {matches.length > 0 && (
            <>
              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Matches</p>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-400 uppercase tracking-wide">
                    <th className="text-left px-6 py-3 font-medium">Patient</th>
                    <th className="text-left px-6 py-3 font-medium">Organ</th>
                    <th className="text-left px-6 py-3 font-medium">Score</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                    <th className="text-left px-6 py-3 font-medium">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {matches.slice(0, 3).map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-600">{m.patientRef}</td>
                      <td className="px-6 py-4 font-medium text-slate-700">{m.organ}</td>
                      <td className="px-6 py-4 font-semibold text-emerald-600">{m.matchScore}%</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[m.status] || 'bg-slate-100 text-slate-500'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{m.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Quick Actions</h2>
          </div>
          <div className="p-4 space-y-2">
            {ACTIONS.map(({ label, icon: Icon, to, primary }) => (
              <Link key={label} to={to}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  primary ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}>
                <Icon size={16} />{label}
                <ArrowRight size={13} className="ml-auto opacity-50" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Activity feed */}
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

export default DonorDashboard;
