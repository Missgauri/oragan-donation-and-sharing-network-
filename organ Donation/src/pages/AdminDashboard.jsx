import React, { useState } from 'react';
import {
  Users, Database, CheckCircle, AlertTriangle,
  ShieldCheck, Activity, TrendingUp, Search,
  Settings, Bell, FileText, HeartHandshake,
  ArrowRight, X, RefreshCw, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../routes/routeConfig';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import DashboardSkeleton from '../components/common/DashboardSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import { formatDate } from '../utils/formatDate';

// ── Helpers ───────────────────────────────────────────────────────────────────

const URGENCY_STYLE = {
  Critical:  'bg-red-100 text-red-700',
  Emergency: 'bg-orange-100 text-orange-700',
  High:      'bg-red-50 text-red-600',
  Medium:    'bg-amber-50 text-amber-600',
  Low:       'bg-slate-100 text-slate-500',
  Voluntary: 'bg-slate-100 text-slate-400',
};

const STATUS_STYLE = {
  active:  'bg-emerald-50 text-emerald-600',
  matched: 'bg-blue-50 text-blue-600',
  closed:  'bg-slate-100 text-slate-400',
};

const ACTIONS = [
  { label: 'Advanced Search',    icon: Search,        to: ROUTES.SEARCH,          primary: true  },
  { label: 'Match Engine',       icon: HeartHandshake,to: ROUTES.MATCHING,        primary: false },
  { label: 'Emergency Requests', icon: AlertTriangle, to: ROUTES.EMERGENCY,       danger: true   },
  { label: 'System Settings',    icon: Settings,      to: ROUTES.PROFILE,         primary: false },
  { label: 'Organ Registry',     icon: Database,      to: ROUTES.FIND,            primary: false },
  { label: 'Send Notification',  icon: Bell,          to: ROUTES.ADMIN_DASHBOARD, primary: false },
];

// ── Component ─────────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const {
    stats, donors, requests, matches, activity,
    loading, error, refresh,
    toggleDonorAvailability, handleCloseRequest,
  } = useAdminDashboard();

  const [donorModal,   setDonorModal]   = useState(null);
  const [requestModal, setRequestModal] = useState(null);
  const [activeTab,    setActiveTab]    = useState('donors'); // 'donors' | 'requests'

  if (loading) return <DashboardSkeleton cards={4} rows={5} />;

  return (
    <div className="max-w-6xl mx-auto space-y-5 sm:space-y-8">

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck size={22} className="text-blue-600" /> Admin Control Center
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Full system access and oversight.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors" aria-label="Refresh">
            <RefreshCw size={15} />
          </button>
          <Link to={ROUTES.EMERGENCY}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm">
            <AlertTriangle size={15} /> View Emergencies
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {error && <ErrorBanner message={error} onRetry={refresh} />}

      {/* Primary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Registered Donors',  value: stats.donors.toLocaleString(),    sub: 'In donor_profiles',  icon: HeartHandshake,iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500',border: 'border-l-emerald-400' },
          { label: 'Organs in Registry', value: stats.organs.toLocaleString(),    sub: 'Available organs',   icon: Database,      iconBg: 'bg-blue-50',    iconColor: 'text-blue-500',   border: 'border-l-blue-400'    },
          { label: 'Active Matches',     value: stats.matches.toLocaleString(),   sub: 'Confirmed matches',  icon: CheckCircle,   iconBg: 'bg-teal-50',    iconColor: 'text-teal-500',   border: 'border-l-teal-400'    },
          { label: 'Emergency Cases',    value: stats.emergencies.toLocaleString(),sub: 'Critical + Emergency',icon: AlertTriangle,iconBg: 'bg-red-50',     iconColor: 'text-red-500',    border: 'border-l-red-400'     },
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

      {/* System stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Active Matches',   value: matches.length,                                                    icon: Activity,   bg: 'bg-orange-50', color: 'text-orange-500' },
          { label: 'Active Requests',  value: requests.filter(r => r.status === 'active').length,                icon: FileText,   bg: 'bg-purple-50', color: 'text-purple-500' },
          { label: 'Available Donors', value: donors.filter(d => d.is_available !== false).length,               icon: Users,      bg: 'bg-indigo-50', color: 'text-indigo-500' },
          { label: 'Emergency Active', value: requests.filter(r => ['Critical','Emergency'].includes(r.urgency)).length, icon: TrendingUp, bg: 'bg-pink-50',   color: 'text-pink-500'   },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
            <div className={`${bg} p-2.5 rounded-xl`}><Icon size={18} className={color} /></div>
            <div>
              <p className="text-xs text-slate-400">{label}</p>
              <p className="text-lg font-bold text-slate-700">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Tabbed data table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Tab header */}
          <div className="flex items-center gap-1 px-4 pt-4 border-b border-slate-100 pb-0">
            {[
              { key: 'donors',   label: `Donors (${donors.length})`   },
              { key: 'requests', label: `Requests (${requests.length})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Donors tab */}
          {activeTab === 'donors' && (
            donors.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-400 text-center">No donors found.</p>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-400 uppercase tracking-wide">
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium">Organ</th>
                    <th className="text-left px-4 py-3 font-medium">Blood</th>
                    <th className="text-left px-4 py-3 font-medium">Registered</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {donors.map(row => (
                    <tr key={row.id} onClick={() => setDonorModal(row)}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                      <td className="px-4 py-3 font-medium text-slate-700 truncate max-w-[120px]">{row.name}</td>
                      <td className="px-4 py-3 text-slate-500">{row.organ_type}</td>
                      <td className="px-4 py-3 text-slate-500">{row.blood_type}</td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(row.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          row.is_available !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {row.is_available !== false ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )
          )}

          {/* Requests tab */}
          {activeTab === 'requests' && (
            requests.length === 0 ? (
              <p className="px-6 py-8 text-sm text-slate-400 text-center">No requests found.</p>
            ) : (
              <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[440px]">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-400 uppercase tracking-wide">
                    <th className="text-left px-4 py-3 font-medium">Patient</th>
                    <th className="text-left px-4 py-3 font-medium">Organ</th>
                    <th className="text-left px-4 py-3 font-medium">Blood</th>
                    <th className="text-left px-4 py-3 font-medium">Urgency</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {requests.map(row => (
                    <tr key={row.id} onClick={() => setRequestModal(row)}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                      <td className="px-4 py-3 font-medium text-slate-700">{row.patient_name}</td>
                      <td className="px-4 py-3 text-slate-500">{row.organ_needed}</td>
                      <td className="px-4 py-3 text-slate-500">{row.blood_type}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${URGENCY_STYLE[row.urgency] || 'bg-slate-100 text-slate-500'}`}>
                          {row.urgency}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[row.status] || 'bg-slate-100 text-slate-500'}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )
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

      {/* Activity log */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">System Activity Log</h2>
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

      {/* Donor detail modal */}
      {donorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setDonorModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-800">Donor Details</h3>
              <button onClick={() => setDonorModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                ['Name',       donorModal.name],
                ['Organ',      donorModal.organ_type],
                ['Blood Type', donorModal.blood_type],
                ['Location',   donorModal.location],
                ['Urgency',    donorModal.urgency],
                ['Registered', formatDate(donorModal.created_at)],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">{k}</p>
                  <p className="text-sm font-semibold text-slate-700 truncate">{v || '—'}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDonorModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Close
              </button>
              <button
                onClick={() => { toggleDonorAvailability(donorModal.id, donorModal.is_available); setDonorModal(null); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5 ${
                  donorModal.is_available !== false
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}>
                {donorModal.is_available !== false
                  ? <><ToggleLeft size={14} /> Mark Unavailable</>
                  : <><ToggleRight size={14} /> Mark Available</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request detail modal */}
      {requestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setRequestModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-slate-800">Request Details</h3>
              <button onClick={() => setRequestModal(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                ['Patient',  requestModal.patient_name],
                ['Organ',    requestModal.organ_needed],
                ['Blood',    requestModal.blood_type],
                ['Urgency',  requestModal.urgency],
                ['Hospital', requestModal.hospital_name || '—'],
                ['Status',   requestModal.status],
              ].map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400 mb-1">{k}</p>
                  <p className="text-sm font-semibold text-slate-700 truncate capitalize">{v || '—'}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setRequestModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
                Close
              </button>
              {requestModal.status === 'active' && (
                <button
                  onClick={() => { handleCloseRequest(requestModal.id); setRequestModal(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100">
                  Close Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
