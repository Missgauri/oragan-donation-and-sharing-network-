import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = [
  { name: 'Home',       path: '/'          },
  { name: 'Donate',     path: '/donate'    },
  { name: 'Find Organ', path: '/find'      },
  { name: 'Dashboard',  path: '/dashboard' },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMenu  = () => setIsMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <Heart className="logo-icon" size={28} />
          <span>LifeGift Network</span>
        </Link>

        {/* Desktop Menu */}
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
          <Link to="/donate" className="btn btn-primary nav-cta">
            Become a Donor
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle navigation">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
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
          <Link to="/donate" className="btn btn-primary mobile-cta" onClick={closeMenu}>
            Become a Donor
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
