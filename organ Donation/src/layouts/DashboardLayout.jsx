import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Heart, Menu, X, Home, HeartHandshake, Search,
  AlertTriangle, User, LogOut, LayoutDashboard,
  Settings, Activity, Stethoscope, Bell,
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConfig';
import NotificationDropdown from '../components/notifications/NotificationDropdown';

const SIDEBAR_LINKS = {
  [ROLES.DONOR]: [
    { icon: LayoutDashboard, label: 'Dashboard',      path: ROUTES.DONOR_DASHBOARD },
    { icon: HeartHandshake,  label: 'My Donations',   path: ROUTES.DONATE },
    { icon: Search,          label: 'Search Donors',  path: ROUTES.SEARCH },
    { icon: Stethoscope,     label: 'Find Organ',     path: ROUTES.FIND },
    { icon: Bell,            label: 'Notifications',  path: ROUTES.PROFILE },
    { icon: User,            label: 'My Profile',     path: ROUTES.PROFILE },
  ],
  [ROLES.RECEIVER]: [
    { icon: LayoutDashboard, label: 'Dashboard',      path: ROUTES.RECEIVER_DASHBOARD },
    { icon: Search,          label: 'Search Donors',  path: ROUTES.SEARCH },
    { icon: Stethoscope,     label: 'Find Organ',     path: ROUTES.FIND },
    { icon: AlertTriangle,   label: 'Emergency',      path: ROUTES.EMERGENCY },
    { icon: Bell,            label: 'Notifications',  path: ROUTES.PROFILE },
    { icon: User,            label: 'My Profile',     path: ROUTES.PROFILE },
  ],
  [ROLES.HOSPITAL]: [
    { icon: LayoutDashboard, label: 'Dashboard',      path: ROUTES.HOSPITAL_DASHBOARD },
    { icon: Activity,        label: 'Active Cases',   path: ROUTES.HOSPITAL_DASHBOARD },
    { icon: HeartHandshake,  label: 'Match Engine',   path: ROUTES.MATCHING },
    { icon: Search,          label: 'Search',         path: ROUTES.SEARCH },
    { icon: Stethoscope,     label: 'Organ Registry', path: ROUTES.FIND },
    { icon: AlertTriangle,   label: 'Emergency',      path: ROUTES.EMERGENCY },
    { icon: User,            label: 'Profile',        path: ROUTES.PROFILE },
  ],
  [ROLES.ADMIN]: [
    { icon: LayoutDashboard, label: 'Dashboard',      path: ROUTES.ADMIN_DASHBOARD },
    { icon: HeartHandshake,  label: 'Match Engine',   path: ROUTES.MATCHING },
    { icon: Search,          label: 'Search',         path: ROUTES.SEARCH },
    { icon: Stethoscope,     label: 'Organ Registry', path: ROUTES.FIND },
    { icon: AlertTriangle,   label: 'Emergency',      path: ROUTES.EMERGENCY },
    { icon: Settings,        label: 'Settings',       path: ROUTES.PROFILE },
  ],
};

const ROLE_LABELS = { donor: 'Donor', receiver: 'Receiver', hospital: 'Hospital', admin: 'Admin' };

const DashboardLayout = () => {
  const { user, role, signOut } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links    = SIDEBAR_LINKS[role] || [];
  const isActive = (path) => location.pathname === path;
  const initial  = user?.email?.[0]?.toUpperCase() ?? '?';
  const name     = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const handleSignOut = async () => { await signOut(); navigate(ROUTES.HOME); };

  const SidebarContent = ({ mobile = false }) => (
    <aside
      className={`${mobile ? 'flex' : 'hidden lg:flex'} flex-col w-60 shrink-0 h-full min-h-screen overflow-y-auto`}
      style={{ background: 'var(--color-sidebar)' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
            <Heart size={15} fill="white" className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">LifeGift</p>
            <p className="text-[10px] leading-tight" style={{ color: 'rgba(147,197,253,0.8)' }}>Organ Donation Platform</p>
          </div>
        </Link>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'rgba(147,197,253,0.8)' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: 'var(--color-primary)' }}>
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-xs capitalize" style={{ color: 'rgba(147,197,253,0.8)' }}>{ROLE_LABELS[role] || 'User'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ icon: Icon, label, path }) => (
          <Link
            key={`${path}-${label}`}
            to={path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isActive(path) ? 'bg-white shadow-sm' : 'hover:bg-white/10'
            }`}
            style={isActive(path) ? { color: 'var(--color-primary)' } : { color: 'rgba(186,230,253,0.85)' }}
          >
            <Icon size={16} style={isActive(path) ? { color: 'var(--color-primary)' } : { color: 'rgba(147,197,253,0.7)' }} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <Link to={ROUTES.HOME}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-white/10"
          style={{ color: 'rgba(186,230,253,0.85)' }}>
          <Home size={16} style={{ color: 'rgba(147,197,253,0.7)' }} />
          Back to site
        </Link>
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg-light)' }}>
      <SidebarContent />

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 h-full w-60"><SidebarContent mobile /></div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <p className="hidden sm:block text-sm font-semibold text-slate-800">
              {ROLE_LABELS[role] ? `${ROLE_LABELS[role]} Dashboard` : 'Dashboard'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <Link to={ROUTES.PROFILE}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold hover:opacity-90 transition-opacity"
              style={{ background: 'var(--color-primary)' }} aria-label="Profile">
              {initial}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
