import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';

/**
 * Sidebar UI component
 *
 * @param {Array}     links       - [{ label, to, icon?, badge? }]
 * @param {Array}     bottomLinks - links pinned to bottom (sign out, settings)
 * @param {ReactNode} header      - custom header content (logo, user info)
 * @param {ReactNode} footer      - custom footer content
 * @param {boolean}   collapsed   - icon-only mode
 * @param {boolean}   mobile      - mobile overlay mode (shows X button)
 * @param {Function}  onClose     - called when X is clicked in mobile mode
 * @param {string}    theme       - dark | light
 */
const Sidebar = ({
  links = [],
  bottomLinks = [],
  header,
  footer,
  collapsed = false,
  mobile = false,
  onClose,
  theme = 'dark',
  className = '',
}) => {
  const location = useLocation();
  const isActive = (to) => location.pathname === to;

  const isDark = theme === 'dark';

  const linkBase = `
    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
    transition-colors duration-150 relative
    ${collapsed ? 'justify-center' : ''}
  `;

  const activeClass = isDark
    ? 'bg-blue-700 text-white'
    : 'bg-blue-50 text-blue-700';

  const inactiveClass = isDark
    ? 'text-blue-200 hover:bg-blue-800 hover:text-white'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';

  const wrapperClass = isDark
    ? 'bg-blue-900 text-white'
    : 'bg-white text-slate-800 border-r border-slate-200';

  return (
    <aside
      className={`
        flex flex-col h-full
        ${collapsed ? 'w-16' : 'w-64'}
        ${wrapperClass}
        transition-all duration-300
        ${className}
      `}
      aria-label="Sidebar navigation"
    >
      {/* Header */}
      {header && (
        <div className={`px-4 py-4 border-b ${isDark ? 'border-blue-800' : 'border-slate-100'} flex items-center justify-between`}>
          {header}
          {mobile && onClose && (
            <button
              onClick={onClose}
              aria-label="Close sidebar"
              className={`p-1 rounded-lg ${isDark ? 'text-blue-300 hover:text-white hover:bg-blue-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Sidebar links">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            title={collapsed ? link.label : undefined}
            aria-current={isActive(link.to) ? 'page' : undefined}
            className={`${linkBase} ${isActive(link.to) ? activeClass : inactiveClass}`}
          >
            {link.icon && (
              <span className="shrink-0" aria-hidden="true">{link.icon}</span>
            )}
            {!collapsed && (
              <>
                <span className="flex-1 truncate">{link.label}</span>
                {link.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
                {isActive(link.to) && (
                  <ChevronRight size={14} className="ml-auto shrink-0" aria-hidden="true" />
                )}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom links */}
      {bottomLinks.length > 0 && (
        <div className={`px-3 py-3 border-t ${isDark ? 'border-blue-800' : 'border-slate-100'} space-y-1`}>
          {bottomLinks.map((link, i) =>
            link.onClick ? (
              <button
                key={i}
                onClick={link.onClick}
                title={collapsed ? link.label : undefined}
                className={`w-full ${linkBase} ${inactiveClass}`}
              >
                {link.icon && <span className="shrink-0" aria-hidden="true">{link.icon}</span>}
                {!collapsed && <span className="flex-1 text-left truncate">{link.label}</span>}
              </button>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                title={collapsed ? link.label : undefined}
                className={`${linkBase} ${isActive(link.to) ? activeClass : inactiveClass}`}
              >
                {link.icon && <span className="shrink-0" aria-hidden="true">{link.icon}</span>}
                {!collapsed && <span className="flex-1 truncate">{link.label}</span>}
              </Link>
            )
          )}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className={`px-4 py-3 border-t ${isDark ? 'border-blue-800' : 'border-slate-100'}`}>
          {footer}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
