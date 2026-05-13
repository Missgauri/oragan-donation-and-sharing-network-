import React from 'react';
import {
  HeartHandshake, CheckCircle, Activity,
  ArrowRight, Heart,
  RefreshCw, Droplet, TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConfig';
import { useDonorDashboard } from '../hooks/useDonorDashboard';
import DashboardSkeleton from '../components/common/DashboardSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';
import { formatDate } from '../utils/formatDate';

const STATUS_STYLE = {
  'Transporting':    'bg-blue-100 text-blue-700',
  'Preparing Match': 'bg-amber-100 text-amber-700',
  'Pending Review':  'bg-slate-100 text-slate-600',
  'In Surgery':      'bg-red-100 text-red-700',
};

const StatCard = ({ label, value, sub, icon: Icon, iconBg, iconColor, trend }) => (
  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
    </div>
    <p className="text-2xl font-bold text-slate-900 mb-0.5">{value}</p>
    <p className="text-xs text-slate-500 font-medium">{label}</p>
    {trend && (
      <p className="text-xs text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
        <TrendingUp size={11} /> {trend}
      </p>
    )}
  </div>
);

const DonorDashboard = () => {
  const { user } = useAuth();
  const { organs, matches, stats, activity, loading, error, refresh } = useDonorDashboard();
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Donor';

  if (loading) return <DashboardSkeleton cards={4} rows={3} />;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 font-medium mb-0.5">Welcome back,</p>
          <h1 className="text-xl font-bold text-slate-900 capitalize">{name} 👋</h1>
          <p className="text-xs text-slate-400 mt-0.5">Thank you for being a life saver!</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh}
            className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"
            aria-label="Refresh">
            <RefreshCw size={14} />
          </button>
          <Link to={ROUTES.DONATE}
            className="inline-flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            style={{ background: 'var(--color-primary)' }}>
            <HeartHandshake size={15} /> Add Organ
          </Link>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={refresh} />}

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Donations"    value={stats.organsRegistered} sub="" icon={HeartHandshake} iconBg="bg-blue-50"    iconColor="text-blue-600"    trend="+2 this month" />
        <StatCard label="Requests Accepted"  value={stats.activeMatches}    sub="" icon={CheckCircle}   iconBg="bg-emerald-50" iconColor="text-emerald-600" trend="+1 this month" />
        <StatCard label="Lives Impacted"     value={stats.organsRegistered * 3 || 0} sub="" icon={Heart} iconBg="bg-red-50" iconColor="text-red-500" trend="+5 this month" />
        <StatCard label="Emergency Requests" value={stats.pendingMatches}   sub="" icon={Activity}      iconBg="bg-orange-50"  iconColor="text-orange-500"  trend="Active now" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-5">

        {/* Recent Activity — full width */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Recent Activity</h2>
          </div>

          {activity.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Activity size={28} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-400">No recent activity.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {activity.map(item => (
                <li key={item.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${item.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-medium leading-snug">{item.text}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{item.time}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Registered Organs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Registered Organs</h2>
          <Link to={ROUTES.DONATE} className="text-xs font-semibold flex items-center gap-1 hover:opacity-80"
            style={{ color: 'var(--color-primary)' }}>
            Add new <ArrowRight size={11} />
          </Link>
        </div>

        {organs.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <HeartHandshake size={28} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm text-slate-400">No organs registered yet.</p>
            <Link to={ROUTES.DONATE} className="text-xs font-semibold mt-1 inline-block hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}>Register your first organ →</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-semibold">Organ</th>
                  <th className="text-left px-5 py-3 font-semibold">Blood Type</th>
                  <th className="text-left px-5 py-3 font-semibold">Registered</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {organs.map(o => (
                  <tr key={o.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{o.organ_type || o.organType}</td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Droplet size={11} className="text-red-400" />{o.blood_type || o.bloodType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(o.registered_at || o.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        o.is_available !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${o.is_available !== false ? 'bg-emerald-500' : 'bg-amber-500'}`} />
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
            <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Matches</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                    <th className="text-left px-5 py-3 font-semibold">Patient</th>
                    <th className="text-left px-5 py-3 font-semibold">Organ</th>
                    <th className="text-left px-5 py-3 font-semibold">Score</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                    <th className="text-left px-5 py-3 font-semibold">ETA</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.slice(0, 3).map(m => (
                    <tr key={m.id} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-slate-600">{m.patientRef}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{m.organ}</td>
                      <td className="px-5 py-3.5 font-bold text-emerald-600">{m.matchScore}%</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[m.status] || 'bg-slate-100 text-slate-600'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{m.eta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
