import React, { useState } from 'react';
import {
  ClipboardList, Activity, CheckCircle, AlertTriangle,
  Search, FileText, Phone, Users, ArrowRight, X, RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConfig';
import { useHospitalDashboard } from '../hooks/useHospitalDashboard';
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

const URGENCY_STYLE = {
  Critical:  'bg-red-100 text-red-700',
  Emergency: 'bg-orange-100 text-orange-700',
  High:      'bg-red-50 text-red-600',
  Medium:    'bg-amber-50 text-amber-600',
  Low:       'bg-slate-100 text-slate-500',
  Voluntary: 'bg-slate-100 text-slate-400',
};

const ACTIONS = [
  { label: 'Search Organ Registry', icon: Search,       to: ROUTES.FIND,      primary: true  },
  { label: 'Emergency Contacts',    icon: Phone,        to: ROUTES.EMERGENCY, danger: true   },
  { label: 'View All Donors',       icon: Users,        to: ROUTES.SEARCH,    primary: false },
  { label: 'Generate Report',       icon: FileText,     to: ROUTES.PROFILE,   primary: false },
];

// ── Component ─────────────────────────────────────────────────────────────────

const HospitalDashboard = () => {
  const { user } = useAuth();
  const { cases, queue, emergency, stats, activity, loading, error, refresh } = useHospitalDashboard();
  const [modal, setModal] = useState(null);

  if (loading) return <DashboardSkeleton cards={4} rows={4} />;

  return (
    <div className="max-w-6xl mx-auto space-y-5 sm:space-y-8">

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hospital Control Panel</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage transplant cases and donor verifications.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors" aria-label="Refresh">
            <RefreshCw size={15} />
          </button>
          <Link to={ROUTES.EMERGENCY}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
            <AlertTriangle size={15} /> Emergency Request
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && <ErrorBanner message={error} onRetry={refresh} />}

      {/* Emergency notice */}
      {emergency.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
          <span className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0 animate-pulse" />
          <p className="text-sm text-red-700 flex-1">
            <span className="font-semibold">{emergency.length} Emergency Request{emergency.length > 1 ? 's' : ''} Pending:</span>{' '}
            {emergency[0]?.patient_name} requires {emergency[0]?.organ_needed} ({emergency[0]?.blood_type}).
            Immediate coordinator review required.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Pending Verifications', value: stats.pendingVerifications, sub: 'Awaiting review',    icon: ClipboardList, iconBg: 'bg-amber-50',   iconColor: 'text-amber-500',  border: 'border-l-amber-400'   },
          { label: 'Active Cases',          value: stats.activeCases,          sub: 'In progress',        icon: Activity,      iconBg: 'bg-blue-50',    iconColor: 'text-blue-500',   border: 'border-l-blue-400'    },
          { label: 'Transporting',          value: stats.completedMatches,     sub: 'En route',           icon: CheckCircle,   iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500',border: 'border-l-emerald-400' },
          { label: 'Emergency Requests',    value: stats.emergencyRequests,    sub: 'Needs attention',    icon: AlertTriangle, iconBg: 'bg-red-50',     iconColor: 'text-red-500',    border: 'border-l-red-400'     },
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

      {/* Active cases */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Active Transplant Cases</h2>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Live
          </span>
        </div>
        {cases.length === 0 ? (
          <p className="px-6 py-8 text-sm text-slate-400 text-center">No active cases.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-400 uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Case ID</th>
                <th className="text-left px-4 py-3 font-medium">Patient</th>
                <th className="text-left px-4 py-3 font-medium">Organ</th>
                <th className="text-left px-4 py-3 font-medium">Match</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">ETA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {cases.map(row => (
                <tr key={row.id} onClick={() => setModal(row)}
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-600">#{row.id}</td>
                  <td className="px-4 py-3 text-slate-700">{row.patientRef}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{row.organ}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-600">{row.matchScore}%</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[row.status] || 'bg-slate-100 text-slate-600'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{row.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Verification queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700">Donor Verification Queue</h2>
          </div>
          {queue.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-400 text-center">No donors pending verification.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[440px]">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-medium">Donor</th>
                  <th className="text-left px-4 py-3 font-medium">Organ</th>
                  <th className="text-left px-4 py-3 font-medium">Blood</th>
                  <th className="text-left px-4 py-3 font-medium">Submitted</th>
                  <th className="text-left px-4 py-3 font-medium">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {queue.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700">{row.name}</td>
                    <td className="px-4 py-3 text-slate-500">{row.organ_type || row.organ}</td>
                    <td className="px-4 py-3 text-slate-500">{row.blood_type || row.blood}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(row.created_at || row.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${URGENCY_STYLE[row.urgency] || 'bg-slate-100 text-slate-500'}`}>
                        {row.urgency}
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
                  danger  ? 'bg-red-50 text-red-600 hover:bg-red-100' :
                  primary ? 'bg-blue-700 text-white hover:bg-blue-800' :
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

      {/* Case modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-800">Case #{modal.id}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[['Patient', modal.patientRef], ['Organ', modal.organ], ['Match Score', `${modal.matchScore}%`], ['ETA', modal.eta]].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">{k}</p>
                  <p className="text-sm font-semibold text-slate-700">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Close
              </button>
              <button onClick={() => { alert('Opening transport logs...'); setModal(null); }}
                className="flex-1 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-medium hover:bg-blue-800">
                Transport Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;
