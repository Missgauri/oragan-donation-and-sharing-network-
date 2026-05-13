import React from 'react';
import {
  Search, Clock, Activity, FileText,
  ArrowRight, Droplet, MapPin, Heart,
  RefreshCw, TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConfig';
import { useReceiverDashboard } from '../hooks/useReceiverDashboard';
import DashboardSkeleton from '../components/common/DashboardSkeleton';
import ErrorBanner from '../components/common/ErrorBanner';

const StatCard = ({ label, value, icon: Icon, iconBg, iconColor, trend }) => (
  <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconBg}`}>
      <Icon size={18} className={iconColor} />
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

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const { compatibleMatches, activeRequest, stats, activity, loading, error, refresh } = useReceiverDashboard();
  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Receiver';

  if (loading) return <DashboardSkeleton cards={4} rows={3} />;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 font-medium mb-0.5">Welcome back,</p>
          <h1 className="text-xl font-bold text-slate-900 capitalize">{name} 👋</h1>
          <p className="text-xs text-slate-400 mt-0.5">We're actively searching for a compatible organ match for you.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh} className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors" aria-label="Refresh">
            <RefreshCw size={14} />
          </button>
          <Link to={ROUTES.FIND}
            className="inline-flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            style={{ background: 'var(--color-primary)' }}>
            <Search size={15} /> Find Organ
          </Link>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={refresh} />}

      {/* Active request notice */}
      {activeRequest && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <span className="w-2 h-2 rounded-full bg-amber-500 mt-1 shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">Active request:</span>{' '}
            {activeRequest.organ_needed} — Blood type <strong>{activeRequest.blood_type}</strong>.{' '}
            Urgency: <strong>{activeRequest.urgency}</strong>.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Match Status"      value={stats.matchStatus}      icon={Search}   iconBg="bg-blue-50"   iconColor="text-blue-600"   trend="Active search" />
        <StatCard label="Compatible Donors" value={stats.compatibleDonors} icon={Heart}    iconBg="bg-red-50"    iconColor="text-red-500"    trend="In your region" />
        <StatCard label="Requests Sent"     value={stats.requestsSent}     icon={FileText} iconBg="bg-amber-50"  iconColor="text-amber-600"  trend="Awaiting response" />
        <StatCard label="Urgency Level"     value={stats.urgency}          icon={Clock}    iconBg="bg-purple-50" iconColor="text-purple-600" trend="Based on urgency" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-5">

        {/* Compatible Matches — full width now */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Find Your Match, Save Your Life</h2>
            <Link to={ROUTES.MATCHING} className="text-xs font-semibold flex items-center gap-1 hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {compatibleMatches.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <Search size={28} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm text-slate-400">No compatible matches found yet.</p>
              <Link to={ROUTES.FIND} className="text-xs font-semibold mt-1 inline-block hover:opacity-80"
                style={{ color: 'var(--color-primary)' }}>Search the registry →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                    <th className="text-left px-5 py-3 font-semibold">Donor</th>
                    <th className="text-left px-5 py-3 font-semibold">Blood</th>
                    <th className="text-left px-5 py-3 font-semibold">Organ</th>
                    <th className="text-left px-5 py-3 font-semibold">Location</th>
                    <th className="text-left px-5 py-3 font-semibold">Match</th>
                    <th className="text-left px-5 py-3 font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {compatibleMatches.map((m, i) => (
                    <tr key={m.donor.id || i} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{m.donor.name || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Droplet size={11} className="text-red-400" />{m.donor.bloodType || m.donor.blood_type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{m.donor.organType || m.donor.organ_type}</td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1 text-slate-500 truncate max-w-[90px]">
                          <MapPin size={10} className="text-blue-400 shrink-0" />{m.donor.location || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-emerald-600">{m.score}%</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80"
                          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                          View
                        </button>
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
    </div>
  );
};

export default ReceiverDashboard;
