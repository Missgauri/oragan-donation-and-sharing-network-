-- ============================================================
-- Migration 006 — organ_requests
-- A receiver's formal request for a specific organ.
-- One receiver can have multiple requests (e.g. kidney + cornea).
-- Replaces the old flat `organs` table from supabase_setup.sql.
-- Depends on: 004 (donors), 005 (receivers), 003 (hospitals)
-- ============================================================

CREATE TABLE IF NOT EXISTS organ_requests (
  id                  UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- ── Who is requesting ─────────────────────────────────────
  receiver_id         UUID           NOT NULL
                                     REFERENCES receivers(id) ON DELETE CASCADE,

  -- ── What is needed ────────────────────────────────────────
  organ_type          organ_type     NOT NULL,
  blood_type          blood_type     NOT NULL,
  urgency             urgency_level  NOT NULL DEFAULT 'Medium',

  -- ── Medical requirements ──────────────────────────────────
  -- Minimum acceptable compatibility score (0–100)
  min_compatibility   NUMERIC(5,2)   NOT NULL DEFAULT 60
                                     CHECK (min_compatibility BETWEEN 0 AND 100),
  -- Max donor age acceptable
  max_donor_age       INTEGER,
  -- Required HLA markers (comma-separated or JSON)
  hla_requirements    TEXT,
  -- Any contraindications
  contraindications   TEXT,

  -- ── Location preference ───────────────────────────────────
  preferred_hospital_id UUID         REFERENCES hospitals(id) ON DELETE SET NULL,
  -- Max distance from receiver's hospital (km)
  max_distance_km     INTEGER,

  -- ── Status & lifecycle ────────────────────────────────────
  status              request_status NOT NULL DEFAULT 'Pending',
  -- When this request expires if unfulfilled
  expires_at          TIMESTAMPTZ,
  fulfilled_at        TIMESTAMPTZ,
  -- Which donor fulfilled this request (set when matched)
  fulfilled_by_donor  UUID           REFERENCES donors(id) ON DELETE SET NULL,

  -- ── Notes ─────────────────────────────────────────────────
  notes               TEXT,

  -- ── Timestamps ────────────────────────────────────────────
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  deleted_at          TIMESTAMPTZ
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_organ_requests_receiver_id  ON organ_requests(receiver_id);
CREATE INDEX idx_organ_requests_organ_type   ON organ_requests(organ_type);
CREATE INDEX idx_organ_requests_blood_type   ON organ_requests(blood_type);
CREATE INDEX idx_organ_requests_urgency      ON organ_requests(urgency);
CREATE INDEX idx_organ_requests_status       ON organ_requests(status);
CREATE INDEX idx_organ_requests_hospital     ON organ_requests(preferred_hospital_id);
CREATE INDEX idx_organ_requests_expires      ON organ_requests(expires_at)
  WHERE expires_at IS NOT NULL AND status = 'Pending';
-- Composite for matching engine
CREATE INDEX idx_organ_requests_match_lookup ON organ_requests(organ_type, blood_type, urgency, status)
  WHERE deleted_at IS NULL AND status = 'Pending';

-- ── Auto updated_at ───────────────────────────────────────────────────────────
CREATE TRIGGER organ_requests_updated_at
  BEFORE UPDATE ON organ_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Auto-expire requests ──────────────────────────────────────────────────────
-- Marks requests as Expired when expires_at passes.
-- Run via pg_cron or Supabase Edge Function on a schedule.
CREATE OR REPLACE FUNCTION expire_organ_requests()
RETURNS void AS $$
BEGIN
  UPDATE organ_requests
  SET    status = 'Expired', updated_at = NOW()
  WHERE  status = 'Pending'
    AND  expires_at IS NOT NULL
    AND  expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE organ_requests ENABLE ROW LEVEL SECURITY;

-- Receivers can manage their own requests
CREATE POLICY "organ_requests_select_own"
  ON organ_requests FOR SELECT
  USING (
    receiver_id IN (
      SELECT r.id FROM receivers r
      JOIN profiles p ON p.id = r.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "organ_requests_insert_own"
  ON organ_requests FOR INSERT
  WITH CHECK (
    receiver_id IN (
      SELECT r.id FROM receivers r
      JOIN profiles p ON p.id = r.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "organ_requests_update_own"
  ON organ_requests FOR UPDATE
  USING (
    receiver_id IN (
      SELECT r.id FROM receivers r
      JOIN profiles p ON p.id = r.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Hospitals can read requests assigned to them
CREATE POLICY "organ_requests_select_hospital"
  ON organ_requests FOR SELECT
  USING (
    preferred_hospital_id IN (
      SELECT h.id FROM hospitals h
      JOIN profiles p ON p.id = h.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Hospitals can update status of requests at their facility
CREATE POLICY "organ_requests_update_hospital"
  ON organ_requests FOR UPDATE
  USING (
    preferred_hospital_id IN (
      SELECT h.id FROM hospitals h
      JOIN profiles p ON p.id = h.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "organ_requests_all_admin"
  ON organ_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
