import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-section">
          <div className="footer-logo">
            <Heart className="logo-icon" size={24} />
            <span>LifeGift Network</span>
          </div>
          <p className="footer-description">
            Connecting generous organ donors with patients in critical need.
            Every donation has the power to save up to 8 lives.
          </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/donate">Become a Donor</Link></li>
            <li><Link to="/find">Find an Organ</Link></li>
            <li><Link to="/dashboard">Matching Dashboard</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Resources</h3>
          <ul className="footer-links">
            <li><a href="#about">About Organ Donation</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#legal">Legal & Privacy</a></li>
            <li><a href="#support">Support Center</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Emergency Contact</h3>
          <ul className="footer-contact">
            <li><Phone size={18} /><span>1800-11-4770 (National Helpline)</span></li>
            <li><Mail size={18} /><span>support@lifegiftnetwork.in</span></li>
            <li><MapPin size={18} /><span>National Transplant Center, New Delhi</span></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} LifeGift Network. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
