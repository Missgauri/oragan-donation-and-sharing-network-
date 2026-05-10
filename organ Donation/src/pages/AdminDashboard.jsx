import React, { useState } from 'react';
import {
  ShieldCheck, Users, Database, Activity,
  AlertTriangle, CheckCircle, TrendingUp, Eye,
  UserCheck, Trash2, Settings, Bell, ArrowRight,
  HeartHandshake, Search, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConfig';
import { Card, Badge, Button, Alert, Table, Modal } from '../components/ui';

// ── Dummy data ────────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Total Users',        value: '1,284', icon: Users,        color: 'bg-blue-100 text-blue-600',   trend: '+24 this week' },
  { label: 'Registered Donors',  value: '847',   icon: HeartHandshake,color:'bg-green-100 text-green-600', trend: '+12 this week' },
  { label: 'Successful Matches', value: '312',   icon: CheckCircle,  color: 'bg-teal-100 text-teal-600',   trend: '+8 this month' },
  { label: 'Flagged Records',    value: '6',     icon: AlertTriangle,color: 'bg-red-100 text-red-600',     trend: 'Needs review' },
];

const SYSTEM_STATS = [
  { label: 'Organs in Registry', value: '1,102', icon: Database,    color: 'bg-purple-100 text-purple-600' },
  { label: 'Hospitals Onboarded',value: '48',    icon: ShieldCheck, color: 'bg-indigo-100 text-indigo-600' },
  { label: 'Active Matches',     value: '23',    icon: Activity,    color: 'bg-orange-100 text-orange-600' },
  { label: 'Avg Match Time',     value: '24 min',icon: TrendingUp,  color: 'bg-pink-100 text-pink-600' },
];

const RECENT_USERS = [
  { id: 1, email: 'rahul.sharma@gmail.com', role: 'donor',    status: 'Active',  joinedOn: 'Nov 10, 2024' },
  { id: 2, email: 'priya.mehta@yahoo.com',  role: 'receiver', status: 'Active',  joinedOn: 'Nov 09, 2024' },
  { id: 3, email: 'apollo@hospital.in',     role: 'hospital', status: 'Pending', joinedOn: 'Nov 08, 2024' },
  { id: 4, email: 'amit.patel@gmail.com',   role: 'donor',    status: 'Active',  joinedOn: 'Nov 07, 2024' },
  { id: 5, email: 'sunita.rao@gmail.com',   role: 'receiver', status: 'Flagged', joinedOn: 'Nov 06, 2024' },
];

const FLAGGED_RECORDS = [
  { id: 1, type: 'Donor',    name: 'Sunita Rao',    reason: 'Duplicate registration',  severity: 'Medium' },
  { id: 2, type: 'Hospital', name: 'City Clinic',   reason: 'Unverified credentials',  severity: 'High' },
  { id: 3, type: 'Organ',    name: 'Kidney #4821',  reason: 'Expired listing',          severity: 'Low' },
];

const ACTIVITY = [
  { id: 1, event: 'New hospital Apollo Delhi onboarded',           time: '1 hour ago',  type: 'success' },
  { id: 2, event: 'Flagged record: duplicate donor registration',  time: '2 hours ago', type: 'warning' },
  { id: 3, event: 'System backup completed successfully',          time: '6 hours ago', type: 'success' },
  { id: 4, event: 'Emergency request escalated to admin review',   time: '8 hours ago', type: 'warning' },
  { id: 5, event: '50 new donor registrations processed',          time: '1 day ago',   type: 'info' },
];

const USER_COLUMNS = [
  { key: 'email',    label: 'Email' },
  { key: 'role',     label: 'Role', render: (v) => (
    <Badge variant={v === 'admin' ? 'primary' : v === 'hospital' ? 'info' : 'default'} className="capitalize">{v}</Badge>
  )},
  { key: 'joinedOn', label: 'Joined' },
  { key: 'status',   label: 'Status', render: (v) => (
    <Badge variant={v === 'Active' ? 'success' : v === 'Flagged' ? 'danger' : 'warning'} dot>{v}</Badge>
  )},
];

const FLAG_COLUMNS = [
  { key: 'type',     label: 'Type' },
  { key: 'name',     label: 'Name' },
  { key: 'reason',   label: 'Reason' },
  { key: 'severity', label: 'Severity', render: (v) => (
    <Badge variant={v === 'High' ? 'danger' : v === 'Medium' ? 'warning' : 'default'} dot>{v}</Badge>
  )},
];

const QUICK_ACTIONS = [
  { label: 'Manage Users',       icon: Users,        to: ROUTES.ADMIN_DASHBOARD, variant: 'primary' },
  { label: 'View Organ Registry',icon: Search,       to: ROUTES.FIND,            variant: 'outline' },
  { label: 'Emergency Requests', icon: AlertTriangle,to: ROUTES.EMERGENCY,       variant: 'danger' },
  { label: 'System Settings',    icon: Settings,     to: ROUTES.PROFILE,         variant: 'outline' },
  { label: 'Generate Report',    icon: FileText,     to: ROUTES.PROFILE,         variant: 'outline' },
  { label: 'Send Notification',  icon: Bell,         to: ROUTES.PROFILE,         variant: 'outline' },
];

// ── Component ─────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <ShieldCheck size={24} className="text-green-400" />
              Admin Control Center
            </h1>
            <p className="text-slate-300 text-sm">
              {user?.email} — Full system access and oversight.
            </p>
          </div>
          <Link to={ROUTES.EMERGENCY}>
            <Button variant="danger" leftIcon={<AlertTriangle size={16} />}>
              View Emergencies
            </Button>
          </Link>
        </div>
      </div>

      {/* Alert */}
      <Alert variant="warning" title="6 Flagged Records Require Review" dismissible>
        There are flagged records including duplicate registrations and unverified hospital credentials. Please review them below.
      </Alert>

      {/* Primary stat cards */}
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

      {/* Secondary system stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {SYSTEM_STATS.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} variant="flat" padding="md">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${color}`}>
                <Icon size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-lg font-bold text-slate-700">{value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent users */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">Recent User Registrations</h2>
            <span className="text-sm text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
              View all <ArrowRight size={14} />
            </span>
          </div>
          <Table
            columns={USER_COLUMNS}
            data={RECENT_USERS}
            onRowClick={(row) => setSelectedUser(row)}
          />
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

      {/* Flagged records */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-800">Flagged Records</h2>
        <Table columns={FLAG_COLUMNS} data={FLAGGED_RECORDS} />
      </div>

      {/* Recent activity */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-800">System Activity Log</h2>
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

      {/* User detail modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Details"
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>
            <Button variant="danger" leftIcon={<Trash2 size={15} />}
              onClick={() => { alert('User flagged for review.'); setSelectedUser(null); }}>
              Flag User
            </Button>
            <Button variant="primary" leftIcon={<UserCheck size={15} />}
              onClick={() => { alert('User verified.'); setSelectedUser(null); }}>
              Verify
            </Button>
          </>
        }
      >
        {selectedUser && (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Email</p>
                <p className="font-semibold truncate">{selectedUser.email}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Role</p>
                <p className="font-semibold capitalize">{selectedUser.role}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <Badge variant={selectedUser.status === 'Active' ? 'success' : selectedUser.status === 'Flagged' ? 'danger' : 'warning'} dot>
                  {selectedUser.status}
                </Badge>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Joined</p>
                <p className="font-semibold">{selectedUser.joinedOn}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default AdminDashboard;
