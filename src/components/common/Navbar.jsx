import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { name: 'Home',       path: '/'          },
  { name: 'Donate',     path: '/donate'    },
  { name: 'Find Organ', path: '/find'      },
  { name: 'Dashboard',  path: '/dashboard' },
];

const ROLE_COLORS = {
  donor:    'role-badge-donor',
  receiver: 'role-badge-receiver',
  hospital: 'role-badge-hospital',
  admin:    'role-badge-admin',
};

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isUserMenuOpen,   setIsUserMenuOpen]   = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, profile, role, signOut } = useAuth();

  const toggleMenu  = () => setIsMobileMenuOpen((p) => !p);
  const closeMenu   = () => setIsMobileMenuOpen(false);
  const toggleUser  = () => setIsUserMenuOpen((p) => !p);

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <Heart className="logo-icon" size={28} />
          <span>LifeGift Network</span>
        </Link>

        {/* Desktop nav */}
        <div className="navbar-links desktop-menu">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}

          {isAuthenticated ? (
            /* ── User menu ── */
            <div className="user-menu-wrapper">
              <button className="user-menu-trigger" onClick={toggleUser}>
                <div className="user-avatar">
                  {profile?.full_name?.[0]?.toUpperCase() || <User size={16} />}
                </div>
                <span className="user-name">{profile?.full_name?.split(' ')[0] || 'Account'}</span>
                {role && (
                  <span className={`role-badge ${ROLE_COLORS[role] || ''}`}>
                    {role}
                  </span>
                )}
                <ChevronDown size={14} />
              </button>

              {isUserMenuOpen && (
                <div className="user-dropdown glass-panel">
                  <div className="user-dropdown-header">
                    <p className="user-dropdown-name">{profile?.full_name}</p>
                    <p className="user-dropdown-email">{profile?.email}</p>
                  </div>
                  <hr className="user-dropdown-divider" />
                  <button className="user-dropdown-item danger" onClick={handleSignOut}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ── Auth CTAs ── */
            <div className="auth-nav-btns">
              <Link to="/auth/login"  className="btn btn-outline nav-cta">Sign In</Link>
              <Link to="/auth/signup" className="btn btn-primary nav-cta">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle navigation">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu glass-panel">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={closeMenu}
            >
              {link.name}
            </Link>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />
          {isAuthenticated ? (
            <button className="btn btn-outline mobile-cta" onClick={handleSignOut}>
              <LogOut size={16} /> Sign Out
            </button>
          ) : (
            <>
              <Link to="/auth/login"  className="btn btn-outline mobile-cta" onClick={closeMenu}>Sign In</Link>
              <Link to="/auth/signup" className="btn btn-primary mobile-cta" onClick={closeMenu}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
