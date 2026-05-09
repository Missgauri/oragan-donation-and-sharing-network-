import React from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, Search, ShieldCheck, Activity } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Give the Gift of Life. <br/><span className="highlight">Save a Future.</span></h1>
            <p className="hero-subtitle">
              Join the LifeGift Network to connect donors with patients in critical need. 
              One single organ donor can save up to 8 lives.
            </p>
            <div className="hero-actions">
              <Link to="/donate" className="btn btn-primary btn-lg custom-shadow">Register as Donor</Link>
              <Link to="/find" className="btn btn-outline btn-lg custom-border">Find a Match</Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Lives Saved</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">5k+</span>
                <span className="stat-label">Active Donors</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Emergency Support</span>
              </div>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="hero-graphics glass-panel">
               <HeartPulse size={80} className="floating-icon main-icon" />
               <div className="pulse-ring"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section container">
        <h2 className="section-title text-center">How LifeGift Network Works</h2>
        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper bg-blue">
              <ShieldCheck size={32} />
            </div>
            <h3>Secure Registration</h3>
            <p>Register safely with end-to-end encryption. Your medical data is securely stored and HIPAA compliant.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper bg-green">
              <Search size={32} />
            </div>
            <h3>Smart Matching</h3>
            <p>Our advanced ML algorithm matches donors and recipients based on urgency, age, blood type, and location.</p>
          </div>
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper bg-red">
              <Activity size={32} />
            </div>
            <h3>Real-Time Tracking</h3>
            <p>Track the organ transportation and match status in real-time through the emergency medical dashboard.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
