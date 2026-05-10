-- ============================================================
-- Organ Donation - Supabase Database Setup
-- 
-- HOW TO RUN:
-- 1. Go to https://supabase.com/dashboard/project/kpzccpvnjjkponxztdvz/sql/new
-- 2. Copy and paste this entire file
-- 3. Click "Run"
-- ============================================================


-- ============================================================
-- TABLE 1: donors
-- Stores registrations submitted from the /donate page
-- ============================================================
CREATE TABLE IF NOT EXISTS donors (
  id             BIGSERIAL    PRIMARY KEY,
  "fullName"     TEXT         NOT NULL,
  email          TEXT         NOT NULL,
  phone          TEXT         NOT NULL,
  "bloodType"    TEXT         NOT NULL,
  "organType"    TEXT         NOT NULL,
  "medicalHistory" TEXT,
  consent        BOOLEAN      NOT NULL DEFAULT FALSE,
  timestamp      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TABLE 2: organs
-- Public registry of available organs shown on the /find page
-- ============================================================
CREATE TABLE IF NOT EXISTS organs (
  id          BIGSERIAL  PRIMARY KEY,
  organ       TEXT       NOT NULL,
  "bloodType" TEXT       NOT NULL,
  location    TEXT       NOT NULL DEFAULT 'Registered Donor',
  urgency     TEXT       NOT NULL DEFAULT 'Voluntary',
  "dateAdded" DATE       NOT NULL DEFAULT CURRENT_DATE
);


-- ============================================================
-- TABLE 3: matches
-- Active organ matches shown on the /dashboard page
-- ============================================================
CREATE TABLE IF NOT EXISTS matches (
  id            BIGSERIAL  PRIMARY KEY,
  "patientRef"  TEXT       NOT NULL,
  organ         TEXT       NOT NULL,
  "matchScore"  INTEGER    NOT NULL DEFAULT 0,
  status        TEXT       NOT NULL DEFAULT 'Pending Review',
  eta           TEXT       NOT NULL DEFAULT 'N/A',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Required so the anon/publishable key used in the app can
-- read and write data without authentication
-- ============================================================

ALTER TABLE donors  ENABLE ROW LEVEL SECURITY;
ALTER TABLE organs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- donors: anyone can register (insert), no public read (private data)
CREATE POLICY "Allow public insert on donors"
  ON donors FOR INSERT TO anon WITH CHECK (true);

-- organs: anyone can read and insert
CREATE POLICY "Allow public read on organs"
  ON organs FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public insert on organs"
  ON organs FOR INSERT TO anon WITH CHECK (true);

-- matches: anyone can read (dashboard is public)
CREATE POLICY "Allow public read on matches"
  ON matches FOR SELECT TO anon USING (true);


-- ============================================================
-- SEED DATA
-- Sample rows so the Find and Dashboard pages show real data
-- immediately after setup
-- ============================================================

INSERT INTO organs (organ, "bloodType", location, urgency, "dateAdded") VALUES
  ('Kidney',         'O+',  'Delhi, IN',      'High',     '2024-10-25'),
  ('Liver (Partial)','A-',  'Mumbai, MH',     'Medium',   '2024-10-26'),
  ('Heart',          'AB+', 'Bangalore, KA',  'Critical', '2024-10-27'),
  ('Lungs',          'O-',  'Chennai, TN',    'High',     '2024-10-28'),
  ('Bone Marrow',    'B+',  'Hyderabad, TS',  'Medium',   '2024-10-29');

INSERT INTO matches ("patientRef", organ, "matchScore", status, eta) VALUES
  ('PT-4921', 'Kidney', 98, 'Transporting',    '2 hrs'),
  ('PT-3304', 'Heart',  92, 'Preparing Match', 'N/A'),
  ('PT-8812', 'Liver',  85, 'Pending Review',  'N/A');


-- ============================================================
-- REALTIME
-- Enables live updates on the Dashboard page
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
