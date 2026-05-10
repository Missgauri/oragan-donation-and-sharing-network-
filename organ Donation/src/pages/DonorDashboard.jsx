import React, { useState } from 'react';
import {
  HeartHandshake, CheckCircle, Activity, Clock,
  FileText, Bell, ArrowRight, Droplet, MapPin, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConfig';
import { Card, Badge, Button, Alert, Table } from '../components/ui';

// ── Dummy data ────────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Registration Status', value: 'Active',   icon: CheckCircle, color: 'bg-green-100 text-green-600',  trend: null },
  { label: 'Organs Registered',   value: '2',        icon: HeartHandshake, color: 'bg-blue-100 text-blue-600', trend: '+1 this month' },
  { label: 'Pending Matches',     value: '3',        icon: Activity,    color: 'bg-yellow-100 text-yellow-600', trend: 'Under review' },
  { label: 'Lives Potentially Saved', value: '8',   icon: Clock,       color: 'bg-red-100 text-red-600',       trend: 'Est. impact' },
];

const ACTIVITY = [
  { id: 1, event: 'Donor profile verified by Apollo Hospital',   time: '2 hours ago',  type: 'success' },
  { id: 2, event: 'Kidney match request received from Delhi NCR', time: '5 hours ago', type: 'info' },
  { id: 3, event: 'Medical documents uploaded successfully',      time: '1 day ago',   type: 'success' },
  { id: 4, event: 'Blood type confirmation pending',             time: '2 days ago',   type: 'warning' },
  { id: 5, event: 'Registration submitted to national registry', time: '3 days ago',   type: 'success' },
];

const REGISTERED_ORGANS = [
  { id: 1, organ: 'Kidney',  bloodType: 'O+',  status: 'Active',  registeredOn: 'Oct 25, 2024' },
  { id: 2, organ: 'Liver',   bloodType: 'O+',  status: 'Pending', registeredOn: 'Nov 02, 2024' },
];

const ORGAN_COLUMNS = [
  { key: 'organ',        label: 'Organ' },
  { key: 'bloodType',    label: 'Blood Type' },
  { key: 'registeredOn', label: 'Registered On' },
  {
    key: 'status', label: 'Status',
    render: (val) => (
      <Badge variant={val === 'Active' ? 'success' : 'warning'} dot>{val}</Badge>
    )
  },
];

const QUICK_ACTIONS = [
  { label: 'Register New Organ', icon: HeartHandshake, to: ROUTES.DONATE,   variant: 'primary' },
  { label: 'View Matches',       icon: Eye,            to: ROUTES.FIND,     variant: 'outline' },
  { label: 'Update Profile',     icon: FileText,       to: ROUTES.PROFILE,  variant: 'outline' },
  { label: 'Emergency Contact',  icon: Bell,           to: ROUTES.EMERGENCY,variant: 'outline' },
];

// ── Component ─────────────────────────────────────────────────────────────────
const DonorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Welcome back, {user?.email?.split('@')[0]} 👋
            </h1>
            <p className="text-blue-100 text-sm">
              Your generosity can save up to 8 lives. Thank you for being a donor.
            </p>
          </div>
          <Link to={ROUTES.DONATE}>
            <Button variant="secondary" rightIcon={<ArrowRight size={16} />}>
              Register Organ
            </Button>
          </Link>
        </div>
      </div>

      {/* Alert */}
      <Alert variant="info" title="Action Required" dismissible>
        Your blood type confirmation is pending. Please upload your latest medical report to complete verification.
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

        {/* Registered organs table */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800">My Registered Organs</h2>
            <Link to={ROUTES.DONATE} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Add organ <ArrowRight size={14} />
            </Link>
          </div>
          <Table columns={ORGAN_COLUMNS} data={REGISTERED_ORGANS} />
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

export default DonorDashboard;
