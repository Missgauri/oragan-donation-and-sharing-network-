import React, { useState, useMemo } from 'react';
import {
  Users, CheckCircle, AlertTriangle, ShieldCheck,
  Activity, TrendingUp, Search, Settings, Bell,
  HeartHandshake, ArrowRight, X, RefreshCw,
  ToggleLeft, ToggleRight, Droplet, MapPin,
  Clock, Filter, ChevronDown, Database,
  Heart, Zap, Eye, BarChart2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConfig';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { useError } from '../context/ErrorContext';
import DashboardSkeleton from '../components/common/DashboardSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import { formatDate } from '../utils/formatDate';

// ── Badge helpers ─────────────────────────────────────────────────────────────

const URGENCY_BADGE = {
  Critical:  'bg-red-100 text-red-700 border border-red-200',
  Emergency: 'bg-orange-100 text-orange-700 border border-orange-200',
  High:      'bg-red-50 text-red-600 border border-red-100',
  Medium:    'bg-amber-100 text-amber-700 border border-amber-200',
  Low:       'bg-slate-100 text-slate-500 border border-slate-200',
  Voluntary: 'bg-slate-100 text-slate-400 border border-slate-200',
};

const STATUS_BADGE = {
  active:  'bg-emerald-100 text-emerald-700 border border-emerald-200',
  matched: 'bg-blue-100 text-blue-700 border border-blue-200',
  closed:  'bg-slate-100 text-slate-500 border border-slate-200',
};

const ACTIVITY_ICON = {
  emergency:        { bg: 'bg-red-100',     color: 'text-red-600',     icon: AlertTriangle },
  match:            { bg: 'bg-emerald-100', color: 'text-emerald-600', icon: HeartHandshake },
  request_accepted: { bg: 'bg-blue-100',    color: 'text-blue-600',    icon: CheckCircle },
  system:           { bg: 'bg-slate-100',   color: 'text-slate-500',   icon: Activity },
};

// ── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, trend, trendUp = true, sub }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
        }`}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-slate-900 mb-0.5 tabular-nums">{value}</p>
    <p className="text-sm font-medium text-slate-500">{label}</p>
    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

const SectionHeader = ({ title, action, actionLabel, actionTo, live }) => (
  <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
    <div className="flex items-center gap-2.5">
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      {live && (
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          LIVE
        </span>
      )}
    </div>
    {action && (
      <Link to={actionTo} className="text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-primary)' }}>
        {actionLabel} <ArrowRight size={11} />
      </Link>
    )}
  </div>
);

const EmptyState = ({ icon: Icon, message, sub }) => (
  <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
    <Icon size={28} className="opacity-30" />
    <p className="text-sm font-medium text-slate-500">{message}</p>
    {sub && <p className="text-xs">{sub}</p>}
  </div>
);

// ── Detail Modal ──────────────────────────────────────────────────────────────

const DetailModal = ({ title, fields, onClose, actions }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    onClick={onClose}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
          <X size={16} />
        </button>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {fields.map(([k, v]) => (
            <div key={k} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-semibold">{k}</p>
              <p className="text-sm font-semibold text-slate-700 truncate">{v || '—'}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            Close
          </button>
          {actions?.map(({ label, onClick, variant }) => (
            <button key={label} onClick={onClick}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                variant === 'danger'   ? 'bg-red-50 text-red-600 hover:bg-red-100' :
                variant === 'warning' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' :
                variant === 'success' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' :
                'text-white hover:opacity-90'
              }`}
              style={!variant ? { background: 'var(--color-primary)' } : {}}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── Main AdminDashboard ───────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { user } = useAuth();
  const { stats, donors, requests, matches, activity, loading, error, refresh,
          toggleDonorAvailability, handleCloseRequest } = useAdminDashboard();
  const { handleApiError } = useError();

  const [donorModal,   setDonorModal]   = useState(null);
  const [requestModal, setRequestModal] = useState(null);
  const [activeTab,    setActiveTab]    = useState('donors');
  const [donorSearch,  setDonorSearch]  = useState('');
  const [reqSearch,    setReqSearch]    = useState('');

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';

  // Filtered tables
  const filteredDonors = useMemo(() =>
    donors.filter(d =>
      !donorSearch ||
      [d.name, d.organ_type, d.blood_type, d.location].join(' ')
        .toLowerCase().includes(donorSearch.toLowerCase())
    ), [donors, donorSearch]);

  const filteredRequests = useMemo(() =>
    requests.filter(r =>
      !reqSearch ||
      [r.patient_name, r.organ_needed, r.blood_type, r.hospital_name].join(' ')
        .toLowerCase().includes(reqSearch.toLowerCase())
    ), [requests, reqSearch]);

  const emergencyRequests = useMemo(() =>
    requests.filter(r => ['Critical', 'Emergency'].includes(r.urgency)),
    [requests]);

  if (loading) return <DashboardSkeleton cards={6} rows={5} />;

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Admin Control Panel</p>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {name}</h1>
          <p className="text-sm text-slate-400 mt-0.5">Full system access and real-time oversight.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
            aria-label="Refresh">
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to={ROUTES.EMERGENCY}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm">
            <AlertTriangle size={14} /> Emergencies
            {emergencyRequests.length > 0 && (
              <span className="bg-white text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5">
                {emergencyRequests.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={refresh} />}

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Total Donors"       value={stats.donors.toLocaleString()}      icon={Users}         iconBg="bg-blue-50"    iconColor="text-blue-600"    trend="Active" trendUp />
        <StatCard label="Organ Registry"     value={stats.organs.toLocaleString()}      icon={Heart}         iconBg="bg-pink-50"    iconColor="text-pink-600"    trend="Listed" trendUp />
        <StatCard label="Confirmed Matches"  value={stats.matches.toLocaleString()}     icon={CheckCircle}   iconBg="bg-emerald-50" iconColor="text-emerald-600" trend="Total"  trendUp />
        <StatCard label="Emergency Cases"    value={stats.emergencies.toLocaleString()} icon={Zap}           iconBg="bg-red-50"     iconColor="text-red-500"     trend="Active" trendUp={false} />
        <StatCard label="Active Requests"    value={requests.length.toLocaleString()}   icon={Database}      iconBg="bg-amber-50"   iconColor="text-amber-600"   trend="Open"   trendUp />
        <StatCard label="System Activity"    value={activity.length.toLocaleString()}   icon={BarChart2}     iconBg="bg-purple-50"  iconColor="text-purple-600"  trend="Recent" trendUp />
      </div>

      {/* ── Emergency Alert Banner ── */}
      {emergencyRequests.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-red-100">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <h2 className="text-sm font-bold text-red-700">
              {emergencyRequests.length} Emergency Request{emergencyRequests.length > 1 ? 's' : ''} Require Immediate Attention
            </h2>
            <Link to={ROUTES.EMERGENCY} className="ml-auto text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="bg-red-50/80 text-xs text-red-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-2.5 font-semibold">Patient</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Organ Needed</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Blood Type</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Hospital</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Priority</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody>
                {emergencyRequests.slice(0, 5).map(row => (
                  <tr key={row.id}
                    className="border-t border-red-100 hover:bg-red-50 transition-colors cursor-pointer"
                    onClick={() => setRequestModal(row)}>
                    <td className="px-5 py-3 font-semibold text-slate-800">{row.patient_name}</td>
                    <td className="px-5 py-3 text-slate-600">{row.organ_needed}</td>
                    <td className="px-5 py-3">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Droplet size={11} className="text-red-400" />{row.blood_type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">{row.hospital_name || '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${URGENCY_BADGE[row.urgency] || 'bg-slate-100 text-slate-600'}`}>
                        {row.urgency}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Main Grid: Tables + Activity ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── Management Tables (2/3 width) ── */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Tab bar */}
          <div className="flex items-center border-b border-slate-100 px-4 pt-1">
            {[
              { key: 'donors',   label: 'Donors',   count: donors.length,   icon: Users        },
              { key: 'requests', label: 'Requests',  count: requests.length, icon: Database     },
              { key: 'matches',  label: 'Matches',   count: matches.length,  icon: HeartHandshake },
            ].map(({ key, label, count, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all mr-1 ${
                  activeTab === key
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}>
                <Icon size={13} />
                {label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeTab === key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}>{count}</span>
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="px-4 py-3 border-b border-slate-50">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === 'donors' ? 'Search donors by name, organ, blood type…' : 'Search requests by patient, organ…'}
                value={activeTab === 'donors' ? donorSearch : reqSearch}
                onChange={e => activeTab === 'donors' ? setDonorSearch(e.target.value) : setReqSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': 'var(--color-primary)' }}
              />
            </div>
          </div>

          {/* Donors tab */}
          {activeTab === 'donors' && (
            filteredDonors.length === 0 ? (
              <EmptyState icon={Users} message="No donors found" sub="Try adjusting your search" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                      <th className="text-left px-5 py-3 font-semibold">Donor</th>
                      <th className="text-left px-5 py-3 font-semibold">Organ</th>
                      <th className="text-left px-5 py-3 font-semibold">Blood</th>
                      <th className="text-left px-5 py-3 font-semibold">Location</th>
                      <th className="text-left px-5 py-3 font-semibold">Registered</th>
                      <th className="text-left px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredDonors.map(row => (
                      <tr key={row.id} onClick={() => setDonorModal(row)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer group">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {(row.name || '?')[0].toUpperCase()}
                            </div>
                            <span className="font-semibold text-slate-800 truncate max-w-[100px]">{row.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{row.organ_type}</td>
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Droplet size={10} className="text-red-400" />{row.blood_type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-1 text-slate-500 text-xs">
                            <MapPin size={10} className="text-blue-400 shrink-0" />
                            <span className="truncate max-w-[80px]">{row.location || '—'}</span>
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-xs">{formatDate(row.created_at)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            row.is_available !== false
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {row.is_available !== false ? '● Available' : '○ Unavailable'}
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
            filteredRequests.length === 0 ? (
              <EmptyState icon={Database} message="No requests found" sub="Try adjusting your search" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                      <th className="text-left px-5 py-3 font-semibold">Patient</th>
                      <th className="text-left px-5 py-3 font-semibold">Organ</th>
                      <th className="text-left px-5 py-3 font-semibold">Blood</th>
                      <th className="text-left px-5 py-3 font-semibold">Hospital</th>
                      <th className="text-left px-5 py-3 font-semibold">Urgency</th>
                      <th className="text-left px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredRequests.map(row => (
                      <tr key={row.id} onClick={() => setRequestModal(row)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer">
                        <td className="px-5 py-3.5 font-semibold text-slate-800">{row.patient_name}</td>
                        <td className="px-5 py-3.5 text-slate-600">{row.organ_needed}</td>
                        <td className="px-5 py-3.5">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Droplet size={10} className="text-red-400" />{row.blood_type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs truncate max-w-[100px]">{row.hospital_name || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${URGENCY_BADGE[row.urgency] || 'bg-slate-100 text-slate-600'}`}>
                            {row.urgency}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_BADGE[row.status] || 'bg-slate-100 text-slate-600'}`}>
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

          {/* Matches tab */}
          {activeTab === 'matches' && (
            matches.length === 0 ? (
              <EmptyState icon={HeartHandshake} message="No matches recorded" sub="Matches will appear here once confirmed" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                      <th className="text-left px-5 py-3 font-semibold">Match ID</th>
                      <th className="text-left px-5 py-3 font-semibold">Patient</th>
                      <th className="text-left px-5 py-3 font-semibold">Organ</th>
                      <th className="text-left px-5 py-3 font-semibold">Score</th>
                      <th className="text-left px-5 py-3 font-semibold">Status</th>
                      <th className="text-left px-5 py-3 font-semibold">ETA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {matches.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500">#{row.id}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-800">{row.patientRef || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-600">{row.organ || '—'}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[60px]">
                              <div className="h-1.5 rounded-full bg-emerald-500"
                                style={{ width: `${row.matchScore || 0}%` }} />
                            </div>
                            <span className="text-xs font-bold text-emerald-600">{row.matchScore || 0}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            row.status === 'Transporting'    ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            row.status === 'In Surgery'      ? 'bg-red-100 text-red-700 border border-red-200' :
                            row.status === 'Preparing Match' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {row.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">{row.eta || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Table footer */}
          <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing {activeTab === 'donors' ? filteredDonors.length : activeTab === 'requests' ? filteredRequests.length : matches.length} records
            </p>
            <Link to={activeTab === 'donors' ? ROUTES.SEARCH : ROUTES.EMERGENCY}
              className="text-xs font-semibold flex items-center gap-1 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--color-primary)' }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
        </div>

        {/* ── Activity Feed (1/3 width) ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <SectionHeader title="Live Activity Feed" live />
          <div className="flex-1 overflow-y-auto max-h-[520px]">
            {activity.length === 0 ? (
              <EmptyState icon={Activity} message="No recent activity" sub="Activity will appear here in real-time" />
            ) : (
              <ul className="divide-y divide-slate-50">
                {activity.map(item => {
                  const cfg = ACTIVITY_ICON[item.type] || ACTIVITY_ICON.system;
                  const Icon = cfg.icon;
                  return (
                    <li key={item.id} className="flex items-start gap-3 px-4 py-3.5 hover:bg-slate-50/60 transition-colors">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                        <Icon size={13} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700 font-medium leading-snug">{item.text}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Clock size={9} />{item.time}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* ── Donor Detail Modal ── */}
      {donorModal && (
        <DetailModal
          title="Donor Details"
          fields={[
            ['Name',       donorModal.name],
            ['Organ',      donorModal.organ_type],
            ['Blood Type', donorModal.blood_type],
            ['Location',   donorModal.location],
            ['Urgency',    donorModal.urgency],
            ['Registered', formatDate(donorModal.created_at)],
          ]}
          onClose={() => setDonorModal(null)}
          actions={[{
            label: donorModal.is_available !== false ? 'Mark Unavailable' : 'Mark Available',
            variant: donorModal.is_available !== false ? 'warning' : 'success',
            onClick: () => {
              toggleDonorAvailability(donorModal.id, donorModal.is_available).catch(handleApiError);
              setDonorModal(null);
            },
          }]}
        />
      )}

      {/* ── Request Detail Modal ── */}
      {requestModal && (
        <DetailModal
          title="Request Details"
          fields={[
            ['Patient',  requestModal.patient_name],
            ['Organ',    requestModal.organ_needed],
            ['Blood',    requestModal.blood_type],
            ['Urgency',  requestModal.urgency],
            ['Hospital', requestModal.hospital_name || '—'],
            ['Status',   requestModal.status],
          ]}
          onClose={() => setRequestModal(null)}
          actions={requestModal.status === 'active' ? [{
            label: 'Close Request',
            variant: 'danger',
            onClick: () => {
              handleCloseRequest(requestModal.id).catch(handleApiError);
              setRequestModal(null);
            },
          }] : []}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
