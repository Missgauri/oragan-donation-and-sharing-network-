import React from 'react';
import { Link } from 'react-router-dom';
import {
  HeartPulse, Search, ShieldCheck, Activity,
  Bell, MapPin, Star, ArrowRight, Phone,
  Users, Heart, Zap,
} from 'lucide-react';
import { ROUTES } from '../routes/routeConfig';
import './Home.css';

const FEATURES = [
  { icon: Zap,         title: 'Real-time Matching',    desc: 'AI-powered engine instantly matches donors with recipients based on blood type, organ compatibility, and location.', color: 'blue'   },
  { icon: Phone,       title: 'Emergency Support',     desc: '24/7 emergency helpline and priority routing for critical cases. Every second counts in organ transplantation.',    color: 'red'    },
  { icon: ShieldCheck, title: 'Trusted & Secure',      desc: 'End-to-end encrypted medical data with HIPAA-compliant storage. Your privacy is our top priority.',                color: 'green'  },
  { icon: ShieldCheck, title: 'Hospital Verified',     desc: 'Every hospital and medical professional on our platform is rigorously verified before gaining access.',             color: 'purple' },
  { icon: Bell,        title: 'Live Notifications',    desc: 'Instant alerts for match updates, emergency requests, and transplant status changes in real-time.',                 color: 'amber'  },
  { icon: MapPin,      title: 'Organ Tracking',        desc: 'Track organ transportation from donor to recipient with live GPS updates and ETA monitoring.',                      color: 'teal'   },
];

const STATS = [
  { value: '10,000+', label: 'Lives Saved',       icon: Heart,    color: 'text-red-500',   bg: 'bg-red-50'   },
  { value: '5,200+',  label: 'Active Donors',     icon: Users,    color: 'text-blue-600',  bg: 'bg-blue-50'  },
  { value: '320+',    label: 'Partner Hospitals', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
  { value: '24/7',    label: 'Emergency Support', icon: Phone,    color: 'text-amber-600', bg: 'bg-amber-50' },
];

const TESTIMONIALS = [
  { name: 'Dr. Priya Sharma',  role: 'Transplant Surgeon, AIIMS Delhi',  text: 'LifeGift Network has transformed how we coordinate organ transplants. The real-time matching system has saved critical hours in emergency cases.', rating: 5 },
  { name: 'Rahul Mehta',       role: 'Kidney Recipient',                  text: 'I received a kidney match within 48 hours of registering. The platform is incredibly easy to use and the support team was with me every step.', rating: 5 },
  { name: 'Anita Desai',       role: 'Registered Donor',                  text: 'Registering as a donor was simple and took less than 5 minutes. Knowing I could save up to 8 lives gives me immense peace of mind.', rating: 5 },
];

const Home = () => (
  <div className="home-page">

    {/* ── Hero ── */}
    <section className="hero-section">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Trusted by 320+ hospitals across India
          </div>
          <h1 className="hero-title">
            Give the Gift of Life.<br />
            <span className="highlight">Save a Future.</span>
          </h1>
          <p className="hero-subtitle">
            Join the LifeGift Network to connect donors with patients in critical need.
            One single organ donor can save up to <strong>8 lives</strong>.
          </p>
          <div className="hero-actions">
            <Link to={ROUTES.DONATE} className="btn btn-primary btn-lg">
              <Heart size={18} fill="currentColor" /> Register as Donor
            </Link>
            <Link to={ROUTES.FIND} className="btn btn-outline btn-lg">
              <Search size={18} /> Find a Match
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item"><span className="stat-number">10k+</span><span className="stat-label">Lives Saved</span></div>
            <div className="stat-divider" />
            <div className="stat-item"><span className="stat-number">5k+</span><span className="stat-label">Active Donors</span></div>
            <div className="stat-divider" />
            <div className="stat-item"><span className="stat-number">24/7</span><span className="stat-label">Emergency Support</span></div>
          </div>
        </div>

        <div className="hero-image-wrapper">
          <div className="hero-graphic-outer">
            <div className="hero-graphic-inner glass-panel">
              <HeartPulse size={72} className="hero-heart-icon" />
              <div className="pulse-ring pulse-ring-1" />
              <div className="pulse-ring pulse-ring-2" />
            </div>
            <div className="float-card float-card-top">
              <span className="float-card-dot bg-green-500" />
              <span>Match Found!</span>
            </div>
            <div className="float-card float-card-bottom">
              <span className="float-card-dot bg-blue-500" />
              <span>Organ En Route</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* ── Stats bar ── */}
    <section className="stats-bar">
      <div className="container stats-bar-grid">
        {STATS.map(({ value, label, icon: Icon, color, bg }) => (
          <div key={label} className="stats-bar-item">
            <div className={`stats-bar-icon ${bg}`}><Icon size={20} className={color} /></div>
            <div>
              <p className="stats-bar-value">{value}</p>
              <p className="stats-bar-label">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* ── Features ── */}
    <section className="features-section">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">How It Works</p>
          <h2 className="section-title">Everything you need to save lives</h2>
          <p className="section-subtitle">A complete platform built for donors, recipients, and hospitals — with the tools to make every match count.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className={`feature-card feature-card-${color}`}>
              <div className={`feature-icon-wrapper feature-icon-${color}`}><Icon size={22} /></div>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-desc">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Emergency CTA ── */}
    <section className="emergency-section">
      <div className="container emergency-container">
        <div className="emergency-content">
          <div className="emergency-icon-wrap"><Activity size={28} className="text-white" /></div>
          <div>
            <h3 className="emergency-title">Emergency Organ Request?</h3>
            <p className="emergency-subtitle">Our emergency team is available 24/7. Call us immediately or submit an urgent request online.</p>
          </div>
        </div>
        <div className="emergency-actions">
          <a href="tel:18001147770" className="btn btn-lg emergency-call-btn">
            <Phone size={18} /> Call 1800-11-4770
          </a>
          <Link to={ROUTES.EMERGENCY} className="btn btn-lg emergency-online-btn">
            Submit Request <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>

    {/* ── Testimonials ── */}
    <section className="testimonials-section">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">Testimonials</p>
          <h2 className="section-title">Trusted by thousands</h2>
          <p className="section-subtitle">Real stories from donors, recipients, and medical professionals who use LifeGift Network.</p>
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map(({ name, role, text, rating }) => (
            <div key={name} className="testimonial-card">
              <div className="testimonial-stars">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400" fill="currentColor" />
                ))}
              </div>
              <p className="testimonial-text">"{text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{name[0]}</div>
                <div>
                  <p className="testimonial-name">{name}</p>
                  <p className="testimonial-role">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── Final CTA ── */}
    <section className="cta-section">
      <div className="container cta-container">
        <HeartPulse size={40} className="cta-icon" />
        <h2 className="cta-title">Ready to make a difference?</h2>
        <p className="cta-subtitle">Join thousands of donors and help save lives today. Registration takes less than 5 minutes.</p>
        <div className="cta-actions">
          <Link to={ROUTES.DONATE} className="btn btn-primary btn-lg">
            <Heart size={18} fill="currentColor" /> Become a Donor
          </Link>
          <Link to={ROUTES.LOGIN} className="btn btn-outline btn-lg">
            Sign In to Dashboard
          </Link>
        </div>
      </div>
    </section>

  </div>
);

export default Home;
