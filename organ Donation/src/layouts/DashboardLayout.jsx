import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Heart, Menu, X, Home, HeartHandshake, Search,
  AlertTriangle, User, LogOut, ChevronRight,
  LayoutDashboard, Bell, Settings
} from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConfig';

// Sidebar links per role
const SIDEBAR_LINKS = {
  [ROLES.DONOR]: [
    { icon: LayoutDashboard, label: 'My Dashboard',  path: ROUTES.DONOR_DASHBOARD },
    { icon: HeartHandshake,  label: 'Register Organ', path: ROUTES.DONATE },
    { icon: User,            label: 'My Profile',     path: ROUTES.PROFILE },
  ],
  [ROLES.RECEIVER]: [
    { icon: LayoutDashboard, label: 'My Dashboard',  path: ROUTES.RECEIVER_DASHBOARD },
    { icon: Search,          label: 'Find Organ',    path: ROUTES.FIND },
    { icon: AlertTriangle,   label: 'Emergency',     path: ROUTES.EMERGENCY },
    { icon: User,            label: 'My Profile',    path: ROUTES.PROFILE },
  ],
  [ROLES.HOSPITAL]: [
    { icon: LayoutDashboard, label: 'Hospital Panel', path: ROUTES.HOSPITAL_DASHBOARD },
    { icon: Search,          label: 'Organ Registry', path: ROUTES.FIND },
    { icon: AlertTriangle,   label: 'Emergency',      path: ROUTES.EMERGENCY },
    { icon: User,            label: 'Profile',        path: ROUTES.PROFILE },
  ],
  [ROLES.ADMIN]: [
    { icon: LayoutDashboard, label: 'Admin Panel',   path: ROUTES.ADMIN_DASHBOARD },
    { icon: HeartHandshake,  label: 'Donors',        path: ROUTES.DONATE },
    { icon: Search,          label: 'Organ Registry',path: ROUTES.FIND },
    { icon: AlertTriangle,   label: 'Emergency',     path: ROUTES.EMERGENCY },
    { icon: Settings,        label: 'Settings',      path: ROUTES.PROFILE },
  ],
};

const DashboardLayout = () => {
  const { user, role, signOut } = useAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = SIDEBAR_LINKS[role] || [];
  const isActive = (path) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate(ROUTES.HOME);
  };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`
      ${mobile ? 'flex' : 'hidden lg:flex'}
      flex-col w-64 bg-blue-900 text-white min-h-screen
    `}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-blue-800">
        <Heart size={22} className="text-red-400" fill="currentColor" />
        <span className="font-bold text-lg">LifeGift</span>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-blue-300 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-sm font-bold">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.email}</p>
            <p className="text-xs text-blue-300 capitalize">{role}</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(path)
                ? 'bg-blue-700 text-white'
                : 'text-blue-200 hover:bg-blue-800 hover:text-white'
            }`}
          >
            <Icon size={18} />
            {label}
            {isActive(path) && <ChevronRight size={14} className="ml-auto" />}
          </Link>
        ))}
      </nav>

      {/* Bottom links */}
      <div className="px-3 py-4 border-t border-blue-800 space-y-1">
        <Link to={ROUTES.HOME}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-blue-200 hover:bg-blue-800 hover:text-white transition-colors">
          <Home size={18} /> Back to Site
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-colors">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">

      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top header bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-slate-800 font-semibold text-base sm:text-lg capitalize">
              {role} Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Profile avatar */}
            <Link to={ROUTES.PROFILE}
              className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-white text-sm font-bold hover:bg-blue-800 transition-colors">
              {user?.email?.[0]?.toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
