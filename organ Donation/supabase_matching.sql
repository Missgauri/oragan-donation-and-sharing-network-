-- ============================================================
-- Organ Donation - Matching System Tables
--
-- HOW TO RUN:
-- 1. Go to https://supabase.com/dashboard/project/<your-project>/sql/new
-- 2. Copy and paste this entire file
-- 3. Click "Run"
-- ============================================================

-- ============================================================
-- TABLE: donor_profiles
-- Extended donor records used by the matching engine.
-- Linked to auth.users for role-based access.
-- ============================================================
CREATE TABLE IF NOT EXISTS donor_profiles (
  id            BIGSERIAL    PRIMARY KEY,
  user_id       UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  name          TEXT         NOT NULL,
  organ_type    TEXT         NOT NULL,
  blood_type    TEXT         NOT NULL,
  location      TEXT         NOT NULL DEFAULT 'India',
  urgency       TEXT         NOT NULL DEFAULT 'Voluntary',
  is_available  BOOLEAN      NOT NULL DEFAULT TRUE,
  notes         TEXT,
  registered_at DATE         NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_donor_profiles_available
  ON donor_profiles(is_available) WHERE is_available = TRUE;

CREATE INDEX IF NOT EXISTS idx_donor_profiles_organ
  ON donor_profiles(organ_type);

-- ============================================================
-- TABLE: recipient_requests
-- Active organ requests from patients/hospitals.
-- ============================================================
CREATE TABLE IF NOT EXISTS recipient_requests (
  id             BIGSERIAL    PRIMARY KEY,
  user_id        UUID         REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name   TEXT         NOT NULL,
  organ_needed   TEXT         NOT NULL,
  blood_type     TEXT         NOT NULL,
  urgency        TEXT         NOT NULL DEFAULT 'Medium',
  hospital_name  TEXT,
  notes          TEXT,
  status         TEXT         NOT NULL DEFAULT 'active',  -- active | matched | closed
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipient_requests_active
  ON recipient_requests(status) WHERE status = 'active';

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE donor_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipient_requests ENABLE ROW LEVEL SECURITY;

-- donor_profiles: public read (matching engine needs it), authenticated insert/update
CREATE POLICY "Public read on donor_profiles"
  ON donor_profiles FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated insert on donor_profiles"
  ON donor_profiles FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Owner update on donor_profiles"
  ON donor_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- recipient_requests: public read, authenticated insert/update
CREATE POLICY "Public read on recipient_requests"
  ON recipient_requests FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated insert on recipient_requests"
  ON recipient_requests FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Owner update on recipient_requests"
  ON recipient_requests FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================
-- SEED DATA — mirrors the mock data in useMatchEngine.js
-- ============================================================

INSERT INTO donor_profiles (name, organ_type, blood_type, location, urgency, is_available, registered_at) VALUES
  ('Rahul Sharma',  'Kidney', 'O+',  'Delhi, IN',     'Voluntary', TRUE,  '2024-10-25'),
  ('Priya Mehta',   'Liver',  'A-',  'Mumbai, MH',    'Voluntary', TRUE,  '2024-10-26'),
  ('Amit Patel',    'Heart',  'AB+', 'Bangalore, KA', 'High',      TRUE,  '2024-10-27'),
  ('Sunita Rao',    'Lungs',  'O-',  'Chennai, TN',   'High',      TRUE,  '2024-10-28'),
  ('Vikram Singh',  'Kidney', 'B+',  'Hyderabad, TS', 'Voluntary', FALSE, '2024-10-29'),
  ('Ananya Iyer',   'Kidney', 'O-',  'Pune, MH',      'Voluntary', TRUE,  '2024-11-01'),
  ('Deepak Nair',   'Liver',  'B-',  'Kochi, KL',     'Medium',    TRUE,  '2024-11-02'),
  ('Kavya Reddy',   'Kidney', 'A+',  'Vizag, AP',     'Voluntary', TRUE,  '2024-11-03'),
  ('Mohan Das',     'Heart',  'O+',  'Kolkata, WB',   'Critical',  TRUE,  '2024-11-04'),
  ('Ritu Kapoor',   'Lungs',  'AB-', 'Jaipur, RJ',    'Medium',    TRUE,  '2024-11-05');

INSERT INTO recipient_requests (patient_name, organ_needed, blood_type, urgency, hospital_name, status) VALUES
  ('PT-4921', 'Kidney', 'O+',  'High',      'AIIMS Delhi',      'active'),
  ('PT-3304', 'Heart',  'AB+', 'Critical',  'Apollo Bangalore', 'active'),
  ('PT-8812', 'Liver',  'A-',  'Medium',    'Fortis Mumbai',    'active'),
  ('PT-2201', 'Lungs',  'O-',  'Emergency', 'CMC Vellore',      'active');

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE donor_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE recipient_requests;
