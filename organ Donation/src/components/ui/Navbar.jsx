import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Bell, User } from 'lucide-react';

/**
 * Navbar UI component — standalone, fully configurable
 *
 * @param {string}    brand       - brand name text
 * @param {ReactNode} brandIcon   - icon next to brand
 * @param {Array}     links       - [{ label, to, icon? }]
 * @param {Array}     actions     - right-side buttons/elements
 * @param {boolean}   sticky      - makes navbar sticky
 * @param {boolean}   transparent - transparent background (for hero sections)
 */
const Navbar = ({
  brand = 'LifeGift Network',
  brandIcon = <Heart size={24} className="text-red-500" fill="currentColor" />,
  brandTo = '/',
  links = [],
  actions = [],
  sticky = true,
  transparent = false,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isActive = (to) => location.pathname === to;

  return (
    <header
      className={`
        z-50 w-full
        ${sticky ? 'sticky top-0' : ''}
        ${transparent ? 'bg-transparent' : 'bg-white border-b border-slate-100 shadow-sm'}
        ${className}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link
            to={brandTo}
            className="flex items-center gap-2 font-bold text-lg text-blue-900 shrink-0"
            aria-label={`${brand} home`}
          >
            {brandIcon}
            <span>{brand}</span>
          </Link>

          {/* Desktop links */}
          {links.length > 0 && (
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive(link.to)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-blue-700 hover:bg-slate-50'
                    }
                  `}
                  aria-current={isActive(link.to) ? 'page' : undefined}
                >
                  {link.icon && <span aria-hidden="true">{link.icon}</span>}
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            {actions.map((action, i) => (
              <React.Fragment key={i}>{action}</React.Fragment>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden bg-white border-t border-slate-100 px-4 py-3 flex flex-col gap-1 shadow-lg"
        >
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`
                flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive(link.to)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
                }
              `}
              aria-current={isActive(link.to) ? 'page' : undefined}
            >
              {link.icon && <span aria-hidden="true">{link.icon}</span>}
              {link.label}
            </Link>
          ))}
          {actions.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 mt-1">
              {actions.map((action, i) => (
                <React.Fragment key={i}>{action}</React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
