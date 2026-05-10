import React from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes/routeConfig';
import { Heart, Phone, Shield, Clock } from 'lucide-react';

const ROLE_REDIRECT = {
  donor:    ROUTES.DONOR_DASHBOARD,
  receiver: ROUTES.RECEIVER_DASHBOARD,
  hospital: ROUTES.HOSPITAL_DASHBOARD,
  admin:    ROUTES.ADMIN_DASHBOARD,
};

const TRUST_BADGES = [
  { icon: Shield, text: 'HIPAA Compliant' },
  { icon: Clock,  text: '24/7 Support' },
  { icon: Phone,  text: '1800-11-4770' },
];

/**
 * Two-column auth layout.
 * Left: branding panel (hidden on mobile)
 * Right: login / signup form
 * Redirects already-authenticated users to their dashboard.
 */
const AuthLayout = () => {
  const { user, role, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to={ROLE_REDIRECT[role] || ROUTES.HOME} replace />;

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Left branding panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex-col justify-between p-12 text-white">

        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-3">
          <Heart size={32} className="text-red-400" fill="currentColor" />
          <span className="text-2xl font-bold">LifeGift Network</span>
        </Link>

        {/* Hero text */}
        <div>
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Give the Gift<br />of Life.
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed mb-8">
            Join thousands of donors and recipients on India's most trusted organ donation platform.
            One donor can save up to 8 lives.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '10k+', label: 'Lives Saved' },
              { value: '5k+',  label: 'Active Donors' },
              { value: '24/7', label: 'Support' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-blue-200 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-4">
          {TRUST_BADGES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm backdrop-blur-sm">
              <Icon size={14} className="text-green-400" />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col bg-slate-50">

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 px-6 py-5 bg-white border-b border-slate-100">
          <Heart size={22} className="text-red-500" fill="currentColor" />
          <span className="font-bold text-blue-900 text-lg">LifeGift Network</span>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-center text-xs text-slate-400 border-t border-slate-100 bg-white">
          &copy; {new Date().getFullYear()} LifeGift Network &nbsp;·&nbsp;
          <a href="#" className="hover:text-blue-600">Privacy Policy</a> &nbsp;·&nbsp;
          <a href="#" className="hover:text-blue-600">Terms of Service</a>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
