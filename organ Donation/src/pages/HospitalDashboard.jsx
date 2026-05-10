import React, { useState } from 'react';
import {
  Building2, Users, ClipboardList, Activity,
  AlertTriangle, CheckCircle, Clock, ArrowRight,
  Search, FileText, Phone, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConfig';
import { Card, Badge, Button, Alert, Table, Modal } from '../components/ui';

// ── Dummy data ────────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Pending Verifications', value: '12',  icon: ClipboardList, color: 'bg-yellow-100 text-yellow-600', trend: '3 urgent' },
  { label: 'Active Transplant Cases',value: '5',  icon: Activity,      color: 'bg-blue-100 text-blue-600',    trend: 'In progress' },
  { label: 'Completed This Month',   value: '18', icon: CheckCircle,   color: 'bg-green-100 text-green-600',  trend: '+4 vs last month' },
  { label: 'Emergency Requests',     value: '2',  icon: AlertTriangle, color: 'bg-red-100 text-red-600',      trend: 'Needs attention' },
];

const VERIFICATION_QUEUE = [
  { id: 1, donorName: 'Rahul Sharma',  organ: 'Kidney',  bloodType: 'O+',  submittedOn: 'Nov 10, 2024', priority: 'High' },
  { id: 2, donorName: 'Priya Mehta',   organ: 'Liver',   bloodType: 'A-',  submittedOn: 'Nov 09, 2024', priority: 'Medium' },
  { id: 3, donorName: 'Amit Patel',    organ: 'Heart',   bloodType: 'AB+', submittedOn: 'Nov 08, 2024', priority: 'Critical' },
  { id: 4, donorName: 'Sunita Rao',    organ: 'Lungs',   bloodType: 'B+',  submittedOn: 'Nov 07, 2024', priority: 'Low' },
];

const ACTIVE_CASES = [
  { id: 101, patient: 'PT-4921', organ: 'Kidney', matchScore: 98, status: 'Transporting', eta: '2 hrs' },
  { id: 102, patient: 'PT-3304', organ: 'Heart',  matchScore: 92, status: 'In Surgery',   eta: 'Ongoing' },
  { id: 103, patient: 'PT-8812', organ: 'Liver',  matchScore: 85, status: 'Prep Stage',   eta: '6 hrs' },
];

const ACTIVITY = [
  { id: 1, event: 'Kidney transplant completed — Patient PT-4102',  time: '30 min ago',  type: 'success' },
  { id: 2, event: 'Emergency request received from ICU Ward 3',     time: '1 hour ago',  type: 'warning' },
  { id: 3, event: 'Donor Rahul Sharma verification approved',       time: '3 hours ago', type: 'success' },
  { id: 4, event: 'Heart transport delayed — rerouting via air',    time: '5 hours ago', type: 'warning' },
  { id: 5, event: 'New donor registration received for review',     time: '1 day ago',   type: 'info' },
];

const QUEUE_COLUMNS = [
  { key: 'donorName',   label: 'Donor Name' },
  { key: 'organ',       label: 'Organ' },
  { key: 'bloodType',   label: 'Blood Type' },
  { key: 'submittedOn', label: 'Submitted' },
  {
    key: 'priority', label: 'Priority',
    render: (v) => (
      <Badge variant={v === 'Critical' ? 'critical' : v === 'High' ? 'danger' : v === 'Medium' ? 'warning' : 'default'} dot>
        {v}
      </Badge>
    )
  },
];

const CASES_COLUMNS = [
  { key: 'id',         label: 'Case ID', render: (v) => <span className="font-mono font-semibold">#{v}</span> },
  { key: 'patient',    label: 'Patient' },
  { key: 'organ',      label: 'Organ' },
  { key: 'matchScore', label: 'Match', render: (v) => <span className="font-semibold text-green-600">{v}%</span> },
  { key: 'status',     label: 'Status', render: (v) => (
    <Badge variant={v === 'In Surgery' ? 'danger' : v === 'Transporting' ? 'info' : 'warning'}>{v}</Badge>
  )},
  { key: 'eta', label: 'ETA' },
];

const QUICK_ACTIONS = [
  { label: 'Search Organ Registry', icon: Search,       to: ROUTES.FIND,      variant: 'primary' },
  { label: 'Emergency Contacts',    icon: Phone,        to: ROUTES.EMERGENCY, variant: 'danger' },
  { label: 'View All Donors',       icon: Users,        to: ROUTES.FIND,      variant: 'outline' },
  { label: 'Generate Report',       icon: FileText,     to: ROUTES.PROFILE,   variant: 'outline' },
];

// ── Component ─────────────────────────────────────────────────────────────────
const HospitalDashboard = () => {
  const { user } = useAuth();
  const [selectedCase, setSelectedCase] = useState(null);

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Hospital Control Panel</h1>
            <p className="text-indigo-100 text-sm">
              {user?.email} — Manage transplant cases and donor verifications.
            </p>
          </div>
          <Link to={ROUTES.EMERGENCY}>
            <Button variant="danger" leftIcon={<AlertTriangle size={16} />}>
              Emergency Request
            </Button>
          </Link>
        </div>
      </div>

      {/* Alert */}
      <Alert variant="danger" title="2 Emergency Requests Pending" dismissible>
        ICU Ward 3 has submitted an urgent O- kidney request. Immediate coordinator review required.
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

      {/* Active cases */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">Active Transplant Cases</h2>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            Live
          </span>
        </div>
        <Table
          columns={CASES_COLUMNS}
          data={ACTIVE_CASES}
          onRowClick={(row) => setSelectedCase(row)}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Verification queue */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-base font-semibold text-slate-800">Verification Queue</h2>
          <Table columns={QUEUE_COLUMNS} data={VERIFICATION_QUEUE} />
        </div>

        {/* Quick actions + activity */}
        <div className="space-y-4">
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

      {/* Case detail modal */}
      <Modal
        isOpen={!!selectedCase}
        onClose={() => setSelectedCase(null)}
        title={`Case #${selectedCase?.id} Details`}
        footer={
          <>
            <Button variant="outline" onClick={() => setSelectedCase(null)}>Close</Button>
            <Button variant="primary" onClick={() => { alert('Opening full transport logs...'); setSelectedCase(null); }}>
              View Transport Logs
            </Button>
          </>
        }
      >
        {selectedCase && (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Patient</p>
                <p className="font-semibold">{selectedCase.patient}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Organ</p>
                <p className="font-semibold">{selectedCase.organ}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Match Score</p>
                <p className="font-semibold text-green-600">{selectedCase.matchScore}%</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">ETA</p>
                <p className="font-semibold">{selectedCase.eta}</p>
              </div>
            </div>
            <p className="text-slate-400 text-xs pt-2">
              Full logistical tracking is available to authorized transplant coordinators only.
            </p>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default HospitalDashboard;
