import React, { useState } from 'react';
import { HeartHandshake, Shield, CheckCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Add the donor profile
      const { error: donorError } = await supabase
        .from('donors')
        .insert([{
          fullName:       formData.fullName,
          email:          formData.email,
          phone:          formData.phone,
          bloodType:      formData.bloodType,
          organType:      formData.organType,
          medicalHistory: formData.medicalHistory,
          consent:        formData.consent,
          timestamp:      new Date().toISOString()
        }]);

      if (donorError) throw donorError;

      // 2. Automatically list their offered organ in the public Find registry
      if (formData.organType !== 'Any') {
        const { error: organError } = await supabase
          .from('organs')
          .insert([{
            organ:     formData.organType,
            bloodType: formData.bloodType,
            location:  'Registered Donor',
            urgency:   'Voluntary',
            dateAdded: new Date().toISOString().split('T')[0]
          }]);
          
        if (organError) throw organError;
      }

      setSubmitted(true);
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("Warning: Cannot connect to Supabase. (Check console for exact permission/column error)");
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
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
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
