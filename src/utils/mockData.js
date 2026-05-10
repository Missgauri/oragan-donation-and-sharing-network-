/**
 * Fallback mock data used when Supabase is unavailable.
 * Mirrors the shape of the real DB rows.
 */

export const MOCK_ORGANS = [
  { id: 1, organ: 'Kidney',         bloodType: 'O+',  location: 'Delhi, IN',      urgency: 'High',     dateAdded: '2023-10-25' },
  { id: 2, organ: 'Liver (Partial)', bloodType: 'A-',  location: 'Mumbai, MH',     urgency: 'Medium',   dateAdded: '2023-10-26' },
  { id: 3, organ: 'Heart',           bloodType: 'AB+', location: 'Bangalore, KA',  urgency: 'Critical', dateAdded: '2023-10-27' },
  { id: 4, organ: 'Lungs',           bloodType: 'O-',  location: 'Chennai, TN',    urgency: 'High',     dateAdded: '2023-10-28' },
];

export const MOCK_MATCHES = [
  { id: 101, patientRef: 'PT-4921', organ: 'Kidney', matchScore: 98, status: 'Transporting',    eta: '2 hrs' },
  { id: 102, patientRef: 'PT-3304', organ: 'Heart',  matchScore: 92, status: 'Preparing Match', eta: 'N/A'   },
  { id: 103, patientRef: 'PT-8812', organ: 'Liver',  matchScore: 85, status: 'Pending Review',  eta: 'N/A'   },
];
