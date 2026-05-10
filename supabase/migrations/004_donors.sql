-- ============================================================
-- Migration 004 — donors
-- Medical profile for users with role = 'donor'.
-- Replaces the old flat `donors` table from supabase_setup.sql.
-- Depends on: 002 (profiles), 003 (hospitals)
-- ============================================================

CREATE TABLE IF NOT EXISTS donors (
  id                  UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- ── Link to auth ──────────────────────────────────────────
  profile_id          UUID          NOT NULL UNIQUE
                                    REFERENCES profiles(id) ON DELETE CASCADE,

  -- ── Medical identity ──────────────────────────────────────
  blood_type          blood_type    NOT NULL,
  organ_type          organ_type    NOT NULL,   -- primary organ offered
  -- Additional organs (e.g. donor offers kidney + cornea)
  additional_organs   organ_type[]  NOT NULL DEFAULT '{}',

  -- ── Medical details ───────────────────────────────────────
  medical_history     TEXT,
  current_medications TEXT,
  allergies           TEXT,
  -- HLA tissue typing for compatibility scoring
  hla_type            TEXT,
  -- BMI, weight, height for organ viability
  weight_kg           NUMERIC(5,2),
  height_cm           NUMERIC(5,2),

  -- ── Consent & legal ───────────────────────────────────────
  consent             BOOLEAN       NOT NULL DEFAULT FALSE,
  consent_date        TIMESTAMPTZ,
  -- Next of kin contact for deceased donation
  nok_name            TEXT,         -- next of kin
  nok_phone           TEXT,
  nok_relationship    TEXT,

  -- ── Linked hospital ───────────────────────────────────────
  -- Hospital where donor is registered / will be treated
  hospital_id         UUID          REFERENCES hospitals(id) ON DELETE SET NULL,

  -- ── Status ────────────────────────────────────────────────
  status              donor_status  NOT NULL DEFAULT 'Active',
  is_deceased         BOOLEAN       NOT NULL DEFAULT FALSE,
  deceased_at         TIMESTAMPTZ,

  -- ── Timestamps ────────────────────────────────────────────
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_donors_profile_id     ON donors(profile_id);
CREATE INDEX idx_donors_blood_type     ON donors(blood_type);
CREATE INDEX idx_donors_organ_type     ON donors(organ_type);
CREATE INDEX idx_donors_status         ON donors(status);
CREATE INDEX idx_donors_hospital_id    ON donors(hospital_id);
-- Composite: most common query — active donors by blood + organ
CREATE INDEX idx_donors_match_lookup   ON donors(blood_type, organ_type, status)
  WHERE deleted_at IS NULL AND status = 'Active';
-- GIN for additional_organs array search
CREATE INDEX idx_donors_add_organs     ON donors USING gin(additional_organs);

-- ── Auto updated_at ───────────────────────────────────────────────────────────
CREATE TRIGGER donors_updated_at
  BEFORE UPDATE ON donors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;

-- Donors can read/write their own record
CREATE POLICY "donors_select_own"
  ON donors FOR SELECT
  USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "donors_insert_own"
  ON donors FOR INSERT
  WITH CHECK (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "donors_update_own"
  ON donors FOR UPDATE
  USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Hospitals can read donors registered with them
CREATE POLICY "donors_select_hospital"
  ON donors FOR SELECT
  USING (
    hospital_id IN (
      SELECT h.id FROM hospitals h
      JOIN profiles p ON p.id = h.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Admins can do everything
CREATE POLICY "donors_all_admin"
  ON donors FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
