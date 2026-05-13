import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X, Phone } from 'lucide-react';
import { ROUTES } from '../routes/routeConfig';

const NAV_LINKS = [
  { name: 'Home',       path: ROUTES.HOME },
  { name: 'Donate',     path: ROUTES.DONATE },
  { name: 'Find Organ', path: ROUTES.FIND },
  { name: 'Emergency',  path: ROUTES.EMERGENCY },
];

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">

      {/* Emergency banner */}
      <div className="bg-red-600 text-white text-center text-sm py-2 px-4 flex items-center justify-center gap-2">
        <Phone size={14} />
        <span>24/7 Emergency Helpline: <strong>1800-11-4770</strong> — Free of charge</span>
      </div>

      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <Link to={ROUTES.HOME} className="flex items-center gap-2.5 text-slate-900 font-bold text-lg">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
                <Heart size={18} className="text-white" fill="currentColor" />
              </div>
              <span>LifeGift Network</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(link => (
                <Link key={link.path} to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.path) ? 'text-blue-700 border-b-2 border-blue-700 pb-0.5' : 'text-slate-600 hover:text-blue-700'
                  }`}>
                  {link.name}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link to={ROUTES.LOGIN} className="text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors">
                Sign In
              </Link>
              <Link to={ROUTES.DONATE}
                className="text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                style={{ background: 'var(--color-primary)' }}>
                Become a Donor
              </Link>
            </div>

            <button className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 flex flex-col gap-3 shadow-lg">
            {NAV_LINKS.map(link => (
              <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
                className={`text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                  isActive(link.path) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                }`}>
                {link.name}
              </Link>
            ))}
            <hr className="border-slate-100" />
            <Link to={ROUTES.LOGIN} onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors">
              Sign In
            </Link>
            <Link to={ROUTES.DONATE} onClick={() => setMobileOpen(false)}
              className="text-white text-sm font-semibold py-2 px-3 rounded-lg text-center transition-colors"
              style={{ background: 'var(--color-primary)' }}>
              Become a Donor
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 pt-12 pb-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 text-white font-bold text-lg mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
                  <Heart size={16} className="text-white" fill="currentColor" />
                </div>
                LifeGift Network
              </div>
              <p className="text-sm leading-relaxed text-slate-400">Connecting organ donors with patients in critical need. Every donation can save up to 8 lives.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {NAV_LINKS.map(l => <li key={l.path}><Link to={l.path} className="hover:text-white transition-colors">{l.name}</Link></li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Resources</h4>
              <ul className="space-y-2 text-sm">
                {['About Organ Donation','FAQ','Legal & Privacy','Support Center'].map(item => (
                  <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">Emergency</h4>
              <ul className="space-y-2 text-sm">
                <li className="text-red-400 font-bold text-base">1800-11-4770</li>
                <li>support@lifegiftnetwork.in</li>
                <li>National Transplant Center, New Delhi</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} LifeGift Network. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
