-- ============================================================
-- Migration 007 — matches
-- Links a donor to an organ_request. Tracks the full lifecycle
-- from proposal → transport → transplant completion.
-- Replaces the old flat `matches` table from supabase_setup.sql.
-- Depends on: 004 (donors), 006 (organ_requests), 003 (hospitals)
-- ============================================================

CREATE TABLE IF NOT EXISTS matches (
  id                    UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- ── Core relationship ─────────────────────────────────────
  donor_id              UUID          NOT NULL
                                      REFERENCES donors(id) ON DELETE RESTRICT,
  request_id            UUID          NOT NULL
                                      REFERENCES organ_requests(id) ON DELETE RESTRICT,

  -- ── Organ details ─────────────────────────────────────────
  organ_type            organ_type    NOT NULL,

  -- ── Compatibility scoring ─────────────────────────────────
  -- Overall match score (0–100). Computed by matching algorithm.
  match_score           NUMERIC(5,2)  NOT NULL DEFAULT 0
                                      CHECK (match_score BETWEEN 0 AND 100),
  -- Component scores for transparency
  blood_type_score      NUMERIC(5,2)  DEFAULT 0,
  hla_score             NUMERIC(5,2)  DEFAULT 0,
  age_score             NUMERIC(5,2)  DEFAULT 0,
  distance_score        NUMERIC(5,2)  DEFAULT 0,
  urgency_score         NUMERIC(5,2)  DEFAULT 0,

  -- ── Status & lifecycle ────────────────────────────────────
  status                match_status  NOT NULL DEFAULT 'Proposed',

  -- Timestamps for each status transition
  proposed_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  confirmed_at          TIMESTAMPTZ,
  rejected_at           TIMESTAMPTZ,
  transport_started_at  TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,

  -- ── Rejection / cancellation ──────────────────────────────
  rejected_by           UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  rejection_reason      TEXT,
  cancelled_by          UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  cancellation_reason   TEXT,

  -- ── Logistics ─────────────────────────────────────────────
  -- Hospital coordinating the transplant
  coordinating_hospital UUID          REFERENCES hospitals(id) ON DELETE SET NULL,
  -- Estimated time of arrival (free text for flexibility: "2 hrs", "45 min")
  eta                   TEXT          NOT NULL DEFAULT 'N/A',
  -- Actual transport duration in minutes
  transport_minutes     INTEGER,
  -- Organ viability window in hours
  viability_hours       INTEGER,

  -- ── Audit ─────────────────────────────────────────────────
  -- Who confirmed the match (hospital coordinator / admin)
  confirmed_by          UUID          REFERENCES profiles(id) ON DELETE SET NULL,
  notes                 TEXT,

  -- ── Timestamps ────────────────────────────────────────────
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- ── Constraints ───────────────────────────────────────────
  -- A donor can only have one active match at a time
  CONSTRAINT unique_active_donor_match UNIQUE (donor_id, status)
    DEFERRABLE INITIALLY DEFERRED
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_matches_donor_id      ON matches(donor_id);
CREATE INDEX idx_matches_request_id    ON matches(request_id);
CREATE INDEX idx_matches_status        ON matches(status);
CREATE INDEX idx_matches_organ_type    ON matches(organ_type);
CREATE INDEX idx_matches_match_score   ON matches(match_score DESC);
CREATE INDEX idx_matches_hospital      ON matches(coordinating_hospital);
CREATE INDEX idx_matches_proposed_at   ON matches(proposed_at DESC);
-- Composite for dashboard: active matches ordered by score
CREATE INDEX idx_matches_dashboard     ON matches(status, match_score DESC)
  WHERE status NOT IN ('Completed', 'Rejected', 'Cancelled');

-- ── Auto updated_at ───────────────────────────────────────────────────────────
CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Status transition guard ───────────────────────────────────────────────────
-- Prevents illegal status jumps (e.g. Completed → Proposed)
CREATE OR REPLACE FUNCTION validate_match_status_transition()
RETURNS TRIGGER AS $$
DECLARE
  allowed_transitions JSONB := '{
    "Proposed":        ["Pending Review", "Rejected", "Cancelled"],
    "Pending Review":  ["Confirmed", "Rejected", "Cancelled"],
    "Confirmed":       ["Preparing Match", "Cancelled"],
    "Preparing Match": ["Transporting", "Cancelled"],
    "Transporting":    ["Completed", "Cancelled"],
    "Completed":       [],
    "Rejected":        [],
    "Cancelled":       []
  }';
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF NOT (allowed_transitions->OLD.status @> to_jsonb(NEW.status::text)) THEN
    RAISE EXCEPTION 'Invalid match status transition: % → %', OLD.status, NEW.status;
  END IF;

  -- Set transition timestamps automatically
  CASE NEW.status
    WHEN 'Confirmed'       THEN NEW.confirmed_at          = NOW();
    WHEN 'Rejected'        THEN NEW.rejected_at           = NOW();
    WHEN 'Transporting'    THEN NEW.transport_started_at  = NOW();
    WHEN 'Completed'       THEN NEW.completed_at          = NOW();
    WHEN 'Cancelled'       THEN NEW.cancelled_at          = NOW();
    ELSE NULL;
  END CASE;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER matches_status_transition
  BEFORE UPDATE OF status ON matches
  FOR EACH ROW EXECUTE FUNCTION validate_match_status_transition();

-- ── Realtime ──────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Donors can see their own matches
CREATE POLICY "matches_select_donor"
  ON matches FOR SELECT
  USING (
    donor_id IN (
      SELECT d.id FROM donors d
      JOIN profiles p ON p.id = d.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Receivers can see matches for their requests
CREATE POLICY "matches_select_receiver"
  ON matches FOR SELECT
  USING (
    request_id IN (
      SELECT r.id FROM organ_requests r
      JOIN receivers rec ON rec.id = r.receiver_id
      JOIN profiles p ON p.id = rec.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Hospitals can see and update matches they coordinate
CREATE POLICY "matches_select_hospital"
  ON matches FOR SELECT
  USING (
    coordinating_hospital IN (
      SELECT h.id FROM hospitals h
      JOIN profiles p ON p.id = h.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "matches_update_hospital"
  ON matches FOR UPDATE
  USING (
    coordinating_hospital IN (
      SELECT h.id FROM hospitals h
      JOIN profiles p ON p.id = h.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "matches_all_admin"
  ON matches FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
