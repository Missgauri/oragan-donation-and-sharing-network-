-- ============================================================
-- Migration 005 — receivers
-- Medical profile for users with role = 'receiver'.
-- Depends on: 002 (profiles), 003 (hospitals)
-- ============================================================

CREATE TABLE IF NOT EXISTS receivers (
  id                    UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- ── Link to auth ────────────────────────────────────────────
  profile_id            UUID          NOT NULL UNIQUE
                                      REFERENCES profiles(id) ON DELETE CASCADE,

  -- ── Medical identity ────────────────────────────────────────
  blood_type            blood_type    NOT NULL,
  required_organ        organ_type    NOT NULL,

  -- ── Medical details ─────────────────────────────────────────
  diagnosis             TEXT          NOT NULL,   -- reason for transplant
  medical_history       TEXT,
  current_medications   TEXT,
  allergies             TEXT,
  hla_type              TEXT,
  weight_kg             NUMERIC(5,2),
  height_cm             NUMERIC(5,2),

  -- ── Urgency & waitlist ──────────────────────────────────────
  urgency               urgency_level NOT NULL DEFAULT 'Medium',
  -- UNOS-style waitlist score (0–100, higher = more urgent)
  waitlist_score        NUMERIC(5,2)  NOT NULL DEFAULT 0
                                      CHECK (waitlist_score BETWEEN 0 AND 100),
  waitlist_since        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  -- Estimated time patient can wait (NULL = indefinite)
  max_wait_days         INTEGER,

  -- ── Treating hospital ───────────────────────────────────────
  hospital_id           UUID          REFERENCES hospitals(id) ON DELETE SET NULL,
  treating_doctor       TEXT,

  -- ── Status ──────────────────────────────────────────────────
  status                request_status NOT NULL DEFAULT 'Pending',

  -- ── Timestamps ──────────────────────────────────────────────
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  deleted_at            TIMESTAMPTZ
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_receivers_profile_id      ON receivers(profile_id);
CREATE INDEX idx_receivers_blood_type      ON receivers(blood_type);
CREATE INDEX idx_receivers_required_organ  ON receivers(required_organ);
CREATE INDEX idx_receivers_urgency         ON receivers(urgency);
CREATE INDEX idx_receivers_status          ON receivers(status);
CREATE INDEX idx_receivers_hospital_id     ON receivers(hospital_id);
CREATE INDEX idx_receivers_waitlist_score  ON receivers(waitlist_score DESC);
-- Composite for matching engine: active receivers by blood + organ + urgency
CREATE INDEX idx_receivers_match_lookup    ON receivers(blood_type, required_organ, urgency, status)
  WHERE deleted_at IS NULL AND status = 'Pending';

-- ── Auto updated_at ───────────────────────────────────────────────────────────
CREATE TRIGGER receivers_updated_at
  BEFORE UPDATE ON receivers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE receivers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "receivers_select_own"
  ON receivers FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "receivers_insert_own"
  ON receivers FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "receivers_update_own"
  ON receivers FOR UPDATE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Hospitals can read receivers under their care
CREATE POLICY "receivers_select_hospital"
  ON receivers FOR SELECT
  USING (
    hospital_id IN (
      SELECT h.id FROM hospitals h
      JOIN profiles p ON p.id = h.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "receivers_all_admin"
  ON receivers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
