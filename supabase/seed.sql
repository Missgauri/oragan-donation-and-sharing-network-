-- ============================================================
-- seed.sql — Demo data for development / staging
-- Run AFTER all migrations have been applied.
--
-- NOTE: This inserts data directly without auth users.
--       For production, users register via the app.
-- ============================================================

-- ── Seed profiles (no auth.users link — demo only) ───────────────────────────
-- We use fixed UUIDs so foreign keys are consistent across re-seeds.

INSERT INTO profiles (id, user_id, full_name, email, phone, role, city, state, country, is_verified)
VALUES
  -- Hospitals
  ('a1000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   'AIIMS Delhi',          'admin@aiims.edu',          '+91-11-26588500', 'hospital', 'New Delhi',  'Delhi',         'India', TRUE),
  ('a1000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000002',
   'KEM Hospital Mumbai',  'admin@kemhospital.org',    '+91-22-24136051', 'hospital', 'Mumbai',     'Maharashtra',   'India', TRUE),
  ('a1000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000003',
   'Manipal Hospital',     'admin@manipalhospital.org','+91-80-25024444', 'hospital', 'Bangalore',  'Karnataka',     'India', TRUE),
  -- Donors
  ('a1000000-0000-0000-0000-000000000010',
   '00000000-0000-0000-0000-000000000010',
   'Arjun Sharma',         'arjun@example.com',        '+91-9876543210',  'donor',    'Delhi',      'Delhi',         'India', FALSE),
  ('a1000000-0000-0000-0000-000000000011',
   '00000000-0000-0000-0000-000000000011',
   'Priya Patel',          'priya@example.com',        '+91-9876543211',  'donor',    'Mumbai',     'Maharashtra',   'India', FALSE),
  -- Receivers
  ('a1000000-0000-0000-0000-000000000020',
   '00000000-0000-0000-0000-000000000020',
   'Ravi Kumar',           'ravi@example.com',         '+91-9876543220',  'receiver', 'Bangalore',  'Karnataka',     'India', FALSE),
  ('a1000000-0000-0000-0000-000000000021',
   '00000000-0000-0000-0000-000000000021',
   'Sunita Reddy',         'sunita@example.com',       '+91-9876543221',  'receiver', 'Chennai',    'Tamil Nadu',    'India', FALSE)
ON CONFLICT (user_id) DO NOTHING;

-- ── Seed hospitals ────────────────────────────────────────────────────────────

INSERT INTO hospitals (id, profile_id, name, registration_number, license_number, email, phone,
  address, city, state, pincode, supported_organs, has_24h_emergency, status, latitude, longitude)
VALUES
  ('b1000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000001',
   'AIIMS Delhi', 'REG-DL-001', 'LIC-DL-001',
   'admin@aiims.edu', '+91-11-26588500',
   'Ansari Nagar East, New Delhi', 'New Delhi', 'Delhi', '110029',
   ARRAY['Kidney','Liver','Heart','Lungs','Bone Marrow']::organ_type[],
   TRUE, 'Verified', 28.5672, 77.2100),

  ('b1000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000002',
   'KEM Hospital Mumbai', 'REG-MH-001', 'LIC-MH-001',
   'admin@kemhospital.org', '+91-22-24136051',
   'Acharya Donde Marg, Parel, Mumbai', 'Mumbai', 'Maharashtra', '400012',
   ARRAY['Kidney','Liver','Heart']::organ_type[],
   TRUE, 'Verified', 19.0033, 72.8416),

  ('b1000000-0000-0000-0000-000000000003',
   'a1000000-0000-0000-0000-000000000003',
   'Manipal Hospital Bangalore', 'REG-KA-001', 'LIC-KA-001',
   'admin@manipalhospital.org', '+91-80-25024444',
   '98, HAL Airport Road, Bangalore', 'Bangalore', 'Karnataka', '560017',
   ARRAY['Kidney','Liver','Heart','Lungs','Cornea']::organ_type[],
   TRUE, 'Verified', 12.9592, 77.6489)
ON CONFLICT (registration_number) DO NOTHING;

-- ── Seed donors ───────────────────────────────────────────────────────────────

INSERT INTO donors (id, profile_id, blood_type, organ_type, medical_history, consent, consent_date,
  hospital_id, status)
VALUES
  ('c1000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000010',
   'O+', 'Kidney', 'No significant history', TRUE, NOW(),
   'b1000000-0000-0000-0000-000000000001', 'Active'),

  ('c1000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000011',
   'A-', 'Liver', 'Mild hypertension, controlled', TRUE, NOW(),
   'b1000000-0000-0000-0000-000000000002', 'Active')
ON CONFLICT (profile_id) DO NOTHING;

-- ── Seed receivers ────────────────────────────────────────────────────────────

INSERT INTO receivers (id, profile_id, blood_type, required_organ, diagnosis, urgency,
  waitlist_score, hospital_id, status)
VALUES
  ('d1000000-0000-0000-0000-000000000001',
   'a1000000-0000-0000-0000-000000000020',
   'O+', 'Kidney', 'Chronic kidney disease stage 5',
   'High', 78.5,
   'b1000000-0000-0000-0000-000000000003', 'Pending'),

  ('d1000000-0000-0000-0000-000000000002',
   'a1000000-0000-0000-0000-000000000021',
   'AB+', 'Heart', 'Dilated cardiomyopathy',
   'Critical', 95.0,
   'b1000000-0000-0000-0000-000000000002', 'Pending')
ON CONFLICT (profile_id) DO NOTHING;

-- ── Seed organ_requests ───────────────────────────────────────────────────────

INSERT INTO organ_requests (id, receiver_id, organ_type, blood_type, urgency,
  preferred_hospital_id, status)
VALUES
  ('e1000000-0000-0000-0000-000000000001',
   'd1000000-0000-0000-0000-000000000001',
   'Kidney', 'O+', 'High',
   'b1000000-0000-0000-0000-000000000003', 'Pending'),

  ('e1000000-0000-0000-0000-000000000002',
   'd1000000-0000-0000-0000-000000000002',
   'Heart', 'AB+', 'Critical',
   'b1000000-0000-0000-0000-000000000002', 'Pending')
ON CONFLICT DO NOTHING;

-- ── Seed matches ──────────────────────────────────────────────────────────────

INSERT INTO matches (id, donor_id, request_id, organ_type, match_score,
  blood_type_score, urgency_score, status, eta, coordinating_hospital)
VALUES
  ('f1000000-0000-0000-0000-000000000001',
   'c1000000-0000-0000-0000-000000000001',
   'e1000000-0000-0000-0000-000000000001',
   'Kidney', 98, 40, 24, 'Transporting', '2 hrs',
   'b1000000-0000-0000-0000-000000000003'),

  ('f1000000-0000-0000-0000-000000000002',
   'c1000000-0000-0000-0000-000000000002',
   'e1000000-0000-0000-0000-000000000002',
   'Heart', 92, 20, 30, 'Pending Review', 'N/A',
   'b1000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;
