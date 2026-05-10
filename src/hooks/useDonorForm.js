import { useState } from 'react';
import { insertDonor, insertOrgan } from '../services/organService';

const INITIAL_FORM = {
  fullName:       '',
  email:          '',
  phone:          '',
  bloodType:      '',
  organType:      '',
  medicalHistory: '',
  consent:        false,
};

/**
 * useDonorForm
 * Manages donor registration form state and submission logic.
 *
 * @returns {{ formData, submitted, handleChange, handleSubmit, reset }}
 */
export function useDonorForm() {
  const [formData,  setFormData]  = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Save donor profile
      const { error: donorError } = await insertDonor({
        fullName:       formData.fullName,
        email:          formData.email,
        phone:          formData.phone,
        bloodType:      formData.bloodType,
        organType:      formData.organType,
        medicalHistory: formData.medicalHistory,
        consent:        formData.consent,
        timestamp:      new Date().toISOString(),
      });
      if (donorError) throw donorError;

      // 2. List organ in public registry (skip if donor chose "Any")
      if (formData.organType !== 'Any') {
        const { error: organError } = await insertOrgan({
          organ:     formData.organType,
          bloodType: formData.bloodType,
          location:  'Registered Donor',
          urgency:   'Voluntary',
          dateAdded: new Date().toISOString().split('T')[0],
        });
        if (organError) throw organError;
      }

      setSubmitted(true);
    } catch (err) {
      console.error('useDonorForm submit error:', err);
      alert('Warning: Could not connect to Supabase. Check the console for details.');
      setSubmitted(true);
    }
  };

  const reset = () => {
    setFormData(INITIAL_FORM);
    setSubmitted(false);
  };

  return { formData, submitted, handleChange, handleSubmit, reset };
}
