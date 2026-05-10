-- ============================================================
-- Migration 003 — hospitals
-- Verified transplant centres. Must be approved by admin before
-- they can confirm matches or manage organ requests.
-- Depends on: 002 (profiles)
-- ============================================================

CREATE TABLE IF NOT EXISTS hospitals (
  id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- ── Link to auth ──────────────────────────────────────────
  profile_id          UUID          NOT NULL UNIQUE
                                    REFERENCES profiles(id) ON DELETE CASCADE,

  -- ── Hospital identity ─────────────────────────────────────
  name                TEXT          NOT NULL,
  registration_number TEXT          NOT NULL UNIQUE,  -- govt registration ID
  license_number      TEXT          NOT NULL UNIQUE,  -- transplant licence
  type                TEXT          NOT NULL DEFAULT 'General'
                                    CHECK (type IN (
                                      'General', 'Specialty', 'Teaching',
                                      'Government', 'Private', 'NGO'
                                    )),

  -- ── Contact ───────────────────────────────────────────────
  email               TEXT          NOT NULL,
  phone               TEXT          NOT NULL,
  emergency_phone     TEXT,
  website             TEXT,

  -- ── Location ──────────────────────────────────────────────
  address             TEXT          NOT NULL,
  city                TEXT          NOT NULL,
  state               TEXT          NOT NULL,
  country             TEXT          NOT NULL DEFAULT 'India',
  pincode             TEXT          NOT NULL,
  -- PostGIS-ready lat/lng for proximity matching
  latitude            NUMERIC(10,7),
  longitude           NUMERIC(10,7),

  -- ── Capabilities ──────────────────────────────────────────
  -- Which organ transplants this hospital is certified for
  supported_organs    organ_type[]  NOT NULL DEFAULT '{}',
  bed_count           INTEGER,
  icu_bed_count       INTEGER,
  has_24h_emergency   BOOLEAN       NOT NULL DEFAULT FALSE,

  -- ── Verification ──────────────────────────────────────────
  status              hospital_status NOT NULL DEFAULT 'Pending',
  verified_at         TIMESTAMPTZ,
  verified_by         UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  rejection_reason    TEXT,

  -- ── Timestamps ────────────────────────────────────────────
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_hospitals_profile_id ON hospitals(profile_id);
CREATE INDEX idx_hospitals_status     ON hospitals(status);
CREATE INDEX idx_hospitals_city       ON hospitals(city);
CREATE INDEX idx_hospitals_state      ON hospitals(state);
-- GIN index for array search: find hospitals that support a specific organ
CREATE INDEX idx_hospitals_organs     ON hospitals USING gin(supported_organs);
-- Trigram search on hospital name
CREATE INDEX idx_hospitals_name_trgm  ON hospitals USING gin(name gin_trgm_ops);

-- ── Auto updated_at ───────────────────────────────────────────────────────────
CREATE TRIGGER hospitals_updated_at
  BEFORE UPDATE ON hospitals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- Anyone can read verified hospitals (needed for Find page)
CREATE POLICY "hospitals_select_verified"
  ON hospitals FOR SELECT
  USING (status = 'Verified' AND deleted_at IS NULL);

-- Hospital owner can read their own record regardless of status
CREATE POLICY "hospitals_select_own"
  ON hospitals FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Hospital owner can insert their own record
CREATE POLICY "hospitals_insert_own"
  ON hospitals FOR INSERT
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Hospital owner can update their own record
CREATE POLICY "hospitals_update_own"
  ON hospitals FOR UPDATE
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Admins can do everything
CREATE POLICY "hospitals_all_admin"
  ON hospitals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
