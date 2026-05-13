import React, { useState } from 'react';
import {
  ClipboardList, Activity, CheckCircle, AlertTriangle,
  ArrowRight, X, RefreshCw, TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes/routeConfig';
import { useHospitalDashboard } from '../hooks/useHospitalDashboard';
import DashboardSkeleton from '../components/common/DashboardSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import { formatDate } from '../utils/formatDate';

const STATUS_STYLE = {
  'Transporting':    'bg-blue-100 text-blue-700',
  'Preparing Match': 'bg-amber-100 text-amber-700',
  'Pending Review':  'bg-slate-100 text-slate-600',
  'In Surgery':      'bg-red-100 text-red-700',
};

const URGENCY_STYLE = {
  Critical:  'bg-red-100 text-red-700',
  Emergency: 'bg-orange-100 text-orange-700',
  High:      'bg-red-50 text-red-600',
  Medium:    'bg-amber-100 text-amber-700',
  Low:       'bg-slate-100 text-slate-600',
  Voluntary: 'bg-slate-100 text-slate-500',
};

const HospitalDashboard = () => {
  const { cases, queue, emergency, stats, activity, loading, error, refresh } = useHospitalDashboard();
  const [modal, setModal] = useState(null);

  if (loading) return <DashboardSkeleton cards={4} rows={4} />;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hospital Control Panel</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage transplant cases and donor verifications.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors" aria-label="Refresh">
            <RefreshCw size={14} />
          </button>
          <Link to={ROUTES.EMERGENCY}
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
            <AlertTriangle size={14} /> Emergency Request
          </Link>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={refresh} />}

      {emergency.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0 animate-pulse" />
          <p className="text-sm text-red-800 flex-1">
            <span className="font-semibold">{emergency.length} Emergency Request{emergency.length > 1 ? 's' : ''} Pending:</span>{' '}
            {emergency[0]?.patient_name} requires {emergency[0]?.organ_needed} ({emergency[0]?.blood_type}).
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Pending Verifications', value: stats.pendingVerifications, icon: ClipboardList, iconBg: 'bg-amber-50',   iconColor: 'text-amber-600',   trend: '3 urgent'       },
          { label: 'Active Cases',          value: stats.activeCases,          icon: Activity,      iconBg: 'bg-blue-50',    iconColor: 'text-blue-600',    trend: 'In progress'    },
          { label: 'Completed This Month',  value: stats.completedMatches,     icon: CheckCircle,   iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', trend: '+4 vs last month'},
          { label: 'Emergency Requests',    value: stats.emergencyRequests,    icon: AlertTriangle, iconBg: 'bg-red-50',     iconColor: 'text-red-500',     trend: 'Needs attention'},
        ].map(({ label, value, icon: Icon, iconBg, iconColor, trend }) => (
          <div key={label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}>
              <Icon size={18} className={iconColor} />
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-0.5">{value}</p>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
              <TrendingUp size={11} /> {trend}
            </p>
          </div>
        ))}
      </div>

      {/* Active cases */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Active Transplant Cases</h2>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /> Live
          </span>
        </div>
        {cases.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">No active cases.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-semibold">Case ID</th>
                  <th className="text-left px-5 py-3 font-semibold">Patient</th>
                  <th className="text-left px-5 py-3 font-semibold">Organ</th>
                  <th className="text-left px-5 py-3 font-semibold">Match</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 font-semibold">ETA</th>
                </tr>
              </thead>
              <tbody>
                {cases.map(row => (
                  <tr key={row.id} onClick={() => setModal(row)}
                    className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer">
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-600">#{row.id}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{row.patientRef}</td>
                    <td className="px-5 py-3.5 text-slate-600">{row.organ}</td>
                    <td className="px-5 py-3.5 font-bold text-emerald-600">{row.matchScore}%</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[row.status] || 'bg-slate-100 text-slate-600'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{row.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-5">

        {/* Verification queue — full width */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Verification Queue</h2>
          </div>
          {queue.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-400 text-center">No donors pending verification.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[440px]">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                    <th className="text-left px-5 py-3 font-semibold">Donor</th>
                    <th className="text-left px-5 py-3 font-semibold">Organ</th>
                    <th className="text-left px-5 py-3 font-semibold">Blood</th>
                    <th className="text-left px-5 py-3 font-semibold">Submitted</th>
                    <th className="text-left px-5 py-3 font-semibold">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map(row => (
                    <tr key={row.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{row.name}</td>
                      <td className="px-5 py-3.5 text-slate-600">{row.organ_type || row.organ}</td>
                      <td className="px-5 py-3.5 text-slate-600">{row.blood_type || row.blood}</td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">{formatDate(row.created_at || row.date)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${URGENCY_STYLE[row.urgency] || 'bg-slate-100 text-slate-600'}`}>
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
      </div>

      {/* Activity */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Recent Activity</h2>
        </div>
        {activity.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-400 text-center">No recent activity.</p>
        ) : (
          <ul className="divide-y divide-slate-50">
            {activity.map(item => (
              <li key={item.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                <span className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
                <p className="flex-1 text-sm text-slate-700">{item.text}</p>
                <span className="text-xs text-slate-400 whitespace-nowrap">{item.time}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Case modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800">Case #{modal.id}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {[['Patient', modal.patientRef], ['Organ', modal.organ], ['Match Score', `${modal.matchScore}%`], ['ETA', modal.eta]].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">{k}</p>
                  <p className="text-sm font-semibold text-slate-700">{v}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModal(null)} className="flex-1 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Close</button>
              <button onClick={() => { alert('Opening transport logs...'); setModal(null); }}
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90"
                style={{ background: 'var(--color-primary)' }}>Transport Logs</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;
