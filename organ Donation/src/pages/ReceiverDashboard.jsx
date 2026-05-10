import React from 'react';
import {
  Search, Clock, AlertCircle, Activity,
  Droplet, MapPin, ArrowRight, Phone, Eye, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConfig';
import { Card, Badge, Button, Alert, Table } from '../components/ui';

// ── Dummy data ────────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Match Status',        value: 'Searching', icon: Search,      color: 'bg-blue-100 text-blue-600',    trend: 'Active search' },
  { label: 'Compatible Donors',   value: '7',         icon: Activity,    color: 'bg-green-100 text-green-600',  trend: 'In your region' },
  { label: 'Requests Sent',       value: '2',         icon: FileText,    color: 'bg-yellow-100 text-yellow-600',trend: 'Awaiting response' },
  { label: 'Est. Wait Time',      value: '~3 wks',    icon: Clock,       color: 'bg-red-100 text-red-600',      trend: 'Based on urgency' },
];

const ACTIVITY = [
  { id: 1, event: 'Match request sent to donor in Mumbai',         time: '1 hour ago',  type: 'info' },
  { id: 2, event: 'Compatible donor found — Blood type O+',        time: '3 hours ago', type: 'success' },
  { id: 3, event: 'Medical urgency level updated to High',         time: '1 day ago',   type: 'warning' },
  { id: 4, event: 'Profile reviewed by AIIMS transplant team',     time: '2 days ago',  type: 'success' },
  { id: 5, event: 'Waitlist position updated: #142 → #138',        time: '3 days ago',  type: 'info' },
];

const AVAILABLE_MATCHES = [
  { id: 1, organ: 'Kidney',        bloodType: 'O+',  location: 'Delhi, IN',     urgency: 'High',     compatibility: '94%' },
  { id: 2, organ: 'Kidney',        bloodType: 'O+',  location: 'Noida, UP',     urgency: 'Medium',   compatibility: '88%' },
  { id: 3, organ: 'Liver (Partial)',bloodType: 'O+',  location: 'Gurgaon, HR',   urgency: 'High',     compatibility: '81%' },
];

const MATCH_COLUMNS = [
  { key: 'organ',         label: 'Organ' },
  { key: 'bloodType',     label: 'Blood Type', render: (v) => (
    <span className="flex items-center gap-1"><Droplet size={13} className="text-red-400" />{v}</span>
  )},
  { key: 'location',      label: 'Location', render: (v) => (
    <span className="flex items-center gap-1"><MapPin size={13} className="text-blue-400" />{v}</span>
  )},
  { key: 'compatibility', label: 'Match', render: (v) => (
    <span className="font-semibold text-green-600">{v}</span>
  )},
  { key: 'urgency', label: 'Urgency', render: (v) => (
    <Badge variant={v === 'High' ? 'danger' : v === 'Critical' ? 'critical' : 'warning'} dot>{v}</Badge>
  )},
];

const QUICK_ACTIONS = [
  { label: 'Search Organ Registry', icon: Search,  to: ROUTES.FIND,      variant: 'primary' },
  { label: 'Emergency Request',     icon: Phone,   to: ROUTES.EMERGENCY, variant: 'danger' },
  { label: 'View My Profile',       icon: Eye,     to: ROUTES.PROFILE,   variant: 'outline' },
  { label: 'Update Medical Info',   icon: FileText,to: ROUTES.PROFILE,   variant: 'outline' },
];

// ── Component ─────────────────────────────────────────────────────────────────
const ReceiverDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-500 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Hello, {user?.email?.split('@')[0]} 👋
            </h1>
            <p className="text-teal-100 text-sm">
              We are actively searching for a compatible organ match for you.
            </p>
          </div>
          <Link to={ROUTES.FIND}>
            <Button variant="secondary" rightIcon={<ArrowRight size={16} />}>
              Search Registry
            </Button>
          </Link>
        </div>
      </div>

      {/* Urgent alert */}
      <Alert variant="warning" title="Waitlist Update" dismissible>
        You are currently #138 on the national kidney waitlist. Your urgency level is set to <strong>High</strong>. Keep your medical documents up to date.
      </Alert>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color, trend }) => (
          <Card key={label} variant="default" padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
                {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
              </div>
              <div className={`p-2.5 rounded-xl ${color}`}>
                <Icon size={22} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Available matches table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Compatible Matches Near You</h2>
            <Link to={ROUTES.FIND} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <Table columns={MATCH_COLUMNS} data={AVAILABLE_MATCHES} />
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-slate-800">Quick Actions</h2>
          <Card variant="default" padding="md">
            <div className="space-y-2">
              {QUICK_ACTIONS.map(({ label, icon: Icon, to, variant }) => (
                <Link key={label} to={to}>
                  <Button variant={variant} fullWidth leftIcon={<Icon size={16} />}
                    className="justify-start mb-2">
                    {label}
                  </Button>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent activity */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-800">Recent Activity</h2>
        <Card variant="default" padding="none">
          <ul className="divide-y divide-slate-100">
            {ACTIVITY.map((item) => (
              <li key={item.id} className="flex items-start gap-3 px-5 py-4">
                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                  item.type === 'success' ? 'bg-green-500' :
                  item.type === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{item.event}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

    </div>
  );
};

export default ReceiverDashboard;
