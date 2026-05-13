import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConfig';
import { Heart, Shield, Clock, Phone, HeartHandshake } from 'lucide-react';

const ROLE_REDIRECT = {
  donor:    ROUTES.DONOR_DASHBOARD,
  receiver: ROUTES.RECEIVER_DASHBOARD,
  hospital: ROUTES.HOSPITAL_DASHBOARD,
  admin:    ROUTES.ADMIN_DASHBOARD,
};

const AuthLayout = () => {
  const { user, role, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="spinner-ring" />
    </div>
  );
  // Already logged in — send to their dashboard, not home
  if (user) return <Navigate to={ROLE_REDIRECT[role] || '/dashboard'} replace />;

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-10 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg,#1E3A5F 0%,#1D4ED8 60%,#2563EB 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle,#93C5FD,transparent)', transform: 'translate(30%,-30%)' }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle,#BFDBFE,transparent)', transform: 'translate(-30%,30%)' }} />
        </div>

        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/20">
            <Heart size={20} fill="white" className="text-white" />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">LifeGift</p>
            <p className="text-xs leading-tight" style={{ color: 'rgba(147,197,253,0.8)' }}>Organ Donation Platform</p>
          </div>
        </Link>

        {/* Hero */}
        <div className="relative z-10">
          <div className="w-44 h-44 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-8 border border-white/20">
            <HeartHandshake size={64} style={{ color: 'rgba(186,230,253,0.9)' }} />
          </div>
          <h2 className="text-3xl font-extrabold leading-tight mb-3">
            Give the gift of life.<br />
            <span style={{ color: 'rgba(147,197,253,0.9)' }}>Be someone's tomorrow.</span>
          </h2>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(186,230,253,0.8)' }}>
            LifeGift connects donors and recipients in real-time to make organ donation faster, transparent and more effective.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[{ value: '10k+', label: 'Lives Saved' }, { value: '5k+', label: 'Active Donors' }, { value: '24/7', label: 'Support' }].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(147,197,253,0.8)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-2 relative z-10">
          {[{ icon: Shield, text: 'Secure & Trusted' }, { icon: Clock, text: '24/7 Support' }, { icon: Phone, text: '1800-11-4770' }].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5 text-xs border border-white/10">
              <Icon size={12} style={{ color: 'rgba(147,197,253,0.8)' }} />
              <span style={{ color: 'rgba(186,230,253,0.85)' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 px-5 py-4 bg-white border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
            <Heart size={15} fill="white" className="text-white" />
          </div>
          <span className="font-bold text-slate-800">LifeGift Network</span>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md"><Outlet /></div>
        </div>

        <div className="px-6 py-3 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
          &copy; {new Date().getFullYear()} LifeGift Network &nbsp;·&nbsp;
          <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a> &nbsp;·&nbsp;
          <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
