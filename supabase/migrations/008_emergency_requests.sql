-- ============================================================
-- Migration 008 — emergency_requests
-- Time-critical organ requests that bypass normal waitlist scoring.
-- Triggers immediate notifications to all verified hospitals.
-- Depends on: 005 (receivers), 003 (hospitals), 006 (organ_requests)
-- ============================================================

CREATE TABLE IF NOT EXISTS emergency_requests (
  id                    UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- ── Who raised it ─────────────────────────────────────────
  -- Can be raised by a receiver, hospital, or admin
  raised_by_profile     UUID           NOT NULL
                                       REFERENCES profiles(id) ON DELETE RESTRICT,
  -- The receiver this emergency is for
  receiver_id           UUID           REFERENCES receivers(id) ON DELETE SET NULL,
  -- Linked standard request (if one exists)
  organ_request_id      UUID           REFERENCES organ_requests(id) ON DELETE SET NULL,

  -- ── What is needed ────────────────────────────────────────
  organ_type            organ_type     NOT NULL,
  blood_type            blood_type     NOT NULL,
  -- Free-text for additional medical constraints
  medical_notes         TEXT,

  -- ── Urgency ───────────────────────────────────────────────
  -- Time window before patient condition becomes irreversible
  required_within_hours INTEGER        NOT NULL DEFAULT 24
                                       CHECK (required_within_hours BETWEEN 1 AND 168),
  -- Absolute deadline
  deadline_at           TIMESTAMPTZ    NOT NULL
                                       GENERATED ALWAYS AS
                                         (created_at + (required_within_hours || ' hours')::INTERVAL)
                                       STORED,

  -- ── Location ──────────────────────────────────────────────
  hospital_id           UUID           REFERENCES hospitals(id) ON DELETE SET NULL,
  -- Broadcast radius for notifications (km)
  broadcast_radius_km   INTEGER        NOT NULL DEFAULT 500,

  -- ── Status ────────────────────────────────────────────────
  status                emergency_status NOT NULL DEFAULT 'Active',
  fulfilled_at          TIMESTAMPTZ,
  fulfilled_by_match    UUID           REFERENCES matches(id) ON DELETE SET NULL,
  cancelled_at          TIMESTAMPTZ,
  cancellation_reason   TEXT,

  -- ── Broadcast tracking ────────────────────────────────────
  -- How many hospitals were notified
  hospitals_notified    INTEGER        NOT NULL DEFAULT 0,
  -- How many responded
  hospitals_responded   INTEGER        NOT NULL DEFAULT 0,

  -- ── Timestamps ────────────────────────────────────────────
  created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_emergency_raised_by    ON emergency_requests(raised_by_profile);
CREATE INDEX idx_emergency_receiver_id  ON emergency_requests(receiver_id);
CREATE INDEX idx_emergency_organ_type   ON emergency_requests(organ_type);
CREATE INDEX idx_emergency_blood_type   ON emergency_requests(blood_type);
CREATE INDEX idx_emergency_status       ON emergency_requests(status);
CREATE INDEX idx_emergency_hospital_id  ON emergency_requests(hospital_id);
CREATE INDEX idx_emergency_deadline     ON emergency_requests(deadline_at)
  WHERE status = 'Active';

-- ── Auto updated_at ───────────────────────────────────────────────────────────
CREATE TRIGGER emergency_requests_updated_at
  BEFORE UPDATE ON emergency_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Auto-expire emergencies ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION expire_emergency_requests()
RETURNS void AS $$
BEGIN
  UPDATE emergency_requests
  SET    status = 'Expired', updated_at = NOW()
  WHERE  status = 'Active'
    AND  deadline_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ── Realtime ──────────────────────────────────────────────────────────────────
-- Emergency requests broadcast to all connected clients immediately
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_requests;

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read active emergencies (broadcast intent)
CREATE POLICY "emergency_select_authenticated"
  ON emergency_requests FOR SELECT
  TO authenticated
  USING (status = 'Active');

-- Receivers can read their own emergencies regardless of status
CREATE POLICY "emergency_select_own_receiver"
  ON emergency_requests FOR SELECT
  USING (
    receiver_id IN (
      SELECT r.id FROM receivers r
      JOIN profiles p ON p.id = r.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Hospitals and admins can raise emergencies
CREATE POLICY "emergency_insert_hospital_admin"
  ON emergency_requests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid()
        AND role IN ('hospital', 'admin')
    )
  );

-- Receivers can raise their own emergencies
CREATE POLICY "emergency_insert_receiver"
  ON emergency_requests FOR INSERT
  WITH CHECK (
    raised_by_profile IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Hospitals can update emergencies at their facility
CREATE POLICY "emergency_update_hospital"
  ON emergency_requests FOR UPDATE
  USING (
    hospital_id IN (
      SELECT h.id FROM hospitals h
      JOIN profiles p ON p.id = h.profile_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "emergency_all_admin"
  ON emergency_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
