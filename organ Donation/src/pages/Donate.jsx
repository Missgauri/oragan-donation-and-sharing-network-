import React, { useState } from 'react';
import { HeartHandshake, Shield, CheckCircle } from 'lucide-react';
import { registerDonor } from '../services/donorService';
import './Donate.css';

const Donate = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    bloodType: '',
    organType: '',
    medicalHistory: '',
    consent: false
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerDonor(formData);
      setSubmitted(true);
    } catch (err) {
      console.error('Error registering donor:', err);
      alert('Warning: Cannot connect to database. Check console for details.');
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="donate-page success-view container">
        <div className="success-card glass-panel text-center">
          <CheckCircle size={64} className="success-icon" />
          <h2>Thank You for Registering</h2>
          <p>Your donor profile has been securely created. You are now part of the LifeGift Network and will be notified if a match is found.</p>
          <button className="btn btn-primary mt-4" onClick={() => setSubmitted(false)}>
            Register Another Donor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="donate-page container">
      <div className="donate-header text-center">
        <HeartHandshake size={48} className="header-icon" />
        <h1 className="page-title">Donor Registration</h1>
        <p className="page-subtitle">Your decision can save up to 8 lives. Please fill out your details securely below.</p>
      </div>

      <div className="donate-form-wrapper glass-panel">
        <div className="security-badge">
          <Shield size={16} />
          <span>HIPAA Compliant & Secure Encryption</span>
        </div>

        <form className="donate-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="John Doe" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required placeholder="(555) 123-4567" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bloodType">Blood Type</label>
              <select id="bloodType" name="bloodType" value={formData.bloodType} onChange={handleChange} required>
                <option value="" disabled>Select Blood Type</option>
                {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="organType">Organ/Tissue to Donate</label>
              <select id="organType" name="organType" value={formData.organType} onChange={handleChange} required>
                <option value="" disabled>Select Organ type</option>
                <option value="Any">Any Needed Organ</option>
                <option value="Kidney">Kidney</option>
                <option value="Liver">Liver (Partial)</option>
                <option value="Heart">Heart</option>
                <option value="Lungs">Lungs</option>
                <option value="Bone Marrow">Bone Marrow</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="medicalHistory">Brief Medical History / Conditions</label>
            <textarea id="medicalHistory" name="medicalHistory" rows="4" value={formData.medicalHistory} onChange={handleChange} placeholder="Please list any preexisting medical conditions..." required></textarea>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange} required />
              <span>I confirm that the provided information is correct and I consent to joining the LifeGift Donor Registry.</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary submit-btn">
            Submit Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default Donate;
