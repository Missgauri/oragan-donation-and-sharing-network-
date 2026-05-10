import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Search, ShieldCheck, Activity } from 'lucide-react';
import './Home.css';

const FEATURES = [
  {
    icon: ShieldCheck,
    colorClass: 'bg-blue',
    title: 'Secure Registration',
    description:
      'Register safely with end-to-end encryption. Your medical data is securely stored and HIPAA compliant.',
  },
  {
    icon: Search,
    colorClass: 'bg-green',
    title: 'Smart Matching',
    description:
      'Our advanced ML algorithm matches donors and recipients based on urgency, age, blood type, and location.',
  },
  {
    icon: Activity,
    colorClass: 'bg-red',
    title: 'Real-Time Tracking',
    description:
      'Track the organ transportation and match status in real-time through the emergency medical dashboard.',
  },
];

const STATS = [
  { number: '10k+', label: 'Lives Saved'       },
  { number: '5k+',  label: 'Active Donors'     },
  { number: '24/7', label: 'Emergency Support' },
];

const Home = () => (
  <div className="home-page">
    {/* Hero */}
    <section className="hero-section">
      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="hero-title">
            Give the Gift of Life. <br />
            <span className="highlight">Save a Future.</span>
          </h1>
          <p className="hero-subtitle">
            Join the LifeGift Network to connect donors with patients in critical need.
            One single organ donor can save up to 8 lives.
          </p>
          <div className="hero-actions">
            <Link to="/donate" className="btn btn-primary btn-lg custom-shadow">
              Register as Donor
            </Link>
            <Link to="/find" className="btn btn-outline btn-lg custom-border">
              Find a Match
            </Link>
          </div>
          <div className="hero-stats">
            {STATS.map(({ number, label }) => (
              <div key={label} className="stat-item">
                <span className="stat-number">{number}</span>
                <span className="stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-image-wrapper">
          <div className="hero-graphics glass-panel">
            <HeartPulse size={80} className="floating-icon main-icon" />
            <div className="pulse-ring" />
          </div>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="features-section container">
      <h2 className="section-title text-center">How LifeGift Network Works</h2>
      <div className="features-grid">
        {FEATURES.map(({ icon: Icon, colorClass, title, description }) => (
          <div key={title} className="feature-card glass-panel">
            <div className={`feature-icon-wrapper ${colorClass}`}>
              <Icon size={32} />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default Home;
