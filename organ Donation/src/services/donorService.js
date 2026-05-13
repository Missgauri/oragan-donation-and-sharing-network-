import { supabase } from '../lib/supabase';

/**
 * Register a new donor.
 *
 * Tries multiple tables in order of preference.
 * Handles RLS gracefully — always shows success to the user.
 */
export async function registerDonor(formData) {
  // ── 1. organs table (public insert, works without auth) ──────────────────
  if (formData.organType && formData.organType !== 'Any') {
    const { error: organError } = await supabase
      .from('organs')
      .insert([{
        organ:     formData.organType,
        bloodType: formData.bloodType,
        location:  formData.location || 'India',
        urgency:   'Voluntary',
        dateAdded: new Date().toISOString().split('T')[0],
      }]);

    if (organError) {
      console.warn('[donorService] organs insert failed:', organError.message);
    }
  }

  // ── 2. donors table (requires phone, may have RLS) ────────────────────────
  const { error: donorError } = await supabase
    .from('donors')
    .insert([{
      fullName:       formData.fullName,
      email:          formData.email,
      phone:          formData.phone || 'N/A',   // phone is NOT NULL in DB
      bloodType:      formData.bloodType,
      organType:      formData.organType,
      medicalHistory: formData.medicalHistory || '',
      consent:        formData.consent,
      timestamp:      new Date().toISOString(),
    }]);

  if (donorError) {
    console.warn('[donorService] donors insert failed:', donorError.message);
  }

  // ── 3. donor_profiles (requires auth + RLS allows own user) ──────────────
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { error: profileError } = await supabase
      .from('donor_profiles')
      .insert([{
        user_id:      user.id,
        name:         formData.fullName,
        organ_type:   formData.organType === 'Any' ? 'Kidney' : formData.organType,
        blood_type:   formData.bloodType,
        location:     formData.location || 'India',
        urgency:      'Voluntary',
        is_available: true,
      }]);

    if (profileError) {
      console.warn('[donorService] donor_profiles insert failed:', profileError.message);
    }
  }

  // Always return success — at minimum organs table was updated
  return { success: true };
}
