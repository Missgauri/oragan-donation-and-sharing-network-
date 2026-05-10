import { supabase } from '../lib/supabase';

/**
 * Register a new donor and optionally add their organ to the public registry.
 * @param {Object} formData - Donor form fields
 */
export async function registerDonor(formData) {
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
}
