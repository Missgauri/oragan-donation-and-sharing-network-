import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Heart, Menu, X, Home, HeartHandshake, Search,
  AlertTriangle, User, LogOut, ChevronRight,
  LayoutDashboard, Settings, Activity, Stethoscope,
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConfig';
import NotificationDropdown from '../components/notifications/NotificationDropdown';

const SIDEBAR_LINKS = {
  [ROLES.DONOR]: [
    { icon: LayoutDashboard, label: 'Overview',       path: ROUTES.DONOR_DASHBOARD },
    { icon: HeartHandshake,  label: 'Register Organ', path: ROUTES.DONATE },
    { icon: Search,          label: 'Advanced Search',path: ROUTES.SEARCH },
    { icon: Stethoscope,     label: 'Find Matches',   path: ROUTES.FIND },
    { icon: User,            label: 'My Profile',     path: ROUTES.PROFILE },
  ],
  [ROLES.RECEIVER]: [
    { icon: LayoutDashboard, label: 'Overview',        path: ROUTES.RECEIVER_DASHBOARD },
    { icon: Search,          label: 'Advanced Search', path: ROUTES.SEARCH },
    { icon: Stethoscope,     label: 'Find Organ',      path: ROUTES.FIND },
    { icon: AlertTriangle,   label: 'Emergency',       path: ROUTES.EMERGENCY },
    { icon: User,            label: 'My Profile',      path: ROUTES.PROFILE },
  ],
  [ROLES.HOSPITAL]: [
    { icon: LayoutDashboard, label: 'Overview',        path: ROUTES.HOSPITAL_DASHBOARD },
    { icon: Activity,        label: 'Active Cases',    path: ROUTES.HOSPITAL_DASHBOARD },
    { icon: HeartHandshake,  label: 'Match Engine',    path: ROUTES.MATCHING },
    { icon: Search,          label: 'Advanced Search', path: ROUTES.SEARCH },
    { icon: Stethoscope,     label: 'Organ Registry',  path: ROUTES.FIND },
    { icon: AlertTriangle,   label: 'Emergency',       path: ROUTES.EMERGENCY },
    { icon: User,            label: 'Profile',         path: ROUTES.PROFILE },
  ],
  [ROLES.ADMIN]: [
    { icon: LayoutDashboard, label: 'Overview',        path: ROUTES.ADMIN_DASHBOARD },
    { icon: HeartHandshake,  label: 'Match Engine',    path: ROUTES.MATCHING },
    { icon: Search,          label: 'Advanced Search', path: ROUTES.SEARCH },
    { icon: Stethoscope,     label: 'Organ Registry',  path: ROUTES.FIND },
    { icon: AlertTriangle,   label: 'Emergency',       path: ROUTES.EMERGENCY },
    { icon: Settings,        label: 'Settings',        path: ROUTES.PROFILE },
  ],
};

const ROLE_LABELS = {
  donor:    'Donor Portal',
  receiver: 'Receiver Portal',
  hospital: 'Hospital Portal',
  admin:    'Admin Portal',
};

const DashboardLayout = () => {
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = SIDEBAR_LINKS[role] || [];
  const isActive = (path) => location.pathname === path;
  const initial = user?.email?.[0]?.toUpperCase() ?? '?';

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.HOME);
  };

  const SidebarContent = ({ mobile = false }) => (
    <aside className={`
      ${mobile ? 'flex' : 'hidden lg:flex'}
      flex-col w-64 bg-[#0f172a] text-white h-full min-h-screen shrink-0 overflow-y-auto
    `}>

      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Heart size={16} fill="white" className="text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">LifeGift</span>
        </Link>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div className="px-5 pt-5 pb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
          {ROLE_LABELS[role] || 'Dashboard'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {links.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive(path)
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={16} className={isActive(path) ? 'text-white' : 'text-slate-500'} />
            {label}
            {isActive(path) && <ChevronRight size={13} className="ml-auto opacity-70" />}
          </Link>
        ))}
      </nav>

      {/* User + sign out */}
      <div className="p-3 border-t border-white/5 mt-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
            {initial}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.email}</p>
            <p className="text-xs text-slate-500 capitalize">{role}</p>
          </div>
        </div>

        <Link to={ROUTES.HOME}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <Home size={14} /> Back to site
        </Link>
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

      {/* Desktop sidebar */}
      <SidebarContent />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 h-full w-64 max-w-[85vw]">
            <SidebarContent mobile />
          </div>
        </div>
      )}

      {/* Right side */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
              <span className="capitalize font-medium text-slate-700">{ROLE_LABELS[role]}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <NotificationDropdown />
            <Link to={ROUTES.PROFILE}
              className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold hover:bg-blue-700 transition-colors">
              {initial}
            </Link>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
