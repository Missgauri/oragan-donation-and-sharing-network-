-- ============================================================
-- Migration 010 — Views, Functions & Seed Data
-- Convenience views for the app + matching algorithm function.
-- Depends on: all previous migrations
-- ============================================================


-- ── View: active_organ_registry ───────────────────────────────────────────────
-- Powers the /find page. Replaces the old `organs` table.
-- Joins organ_requests with receiver location for display.

CREATE OR REPLACE VIEW active_organ_registry AS
SELECT
  r.id                                    AS request_id,
  r.organ_type                            AS organ,
  r.blood_type                            AS "bloodType",
  COALESCE(h.city || ', ' || h.state, p.city || ', ' || p.state, 'India')
                                          AS location,
  r.urgency,
  r.created_at::DATE                      AS "dateAdded",
  r.status,
  r.expires_at
FROM organ_requests r
JOIN receivers rec ON rec.id = r.receiver_id
JOIN profiles p    ON p.id   = rec.profile_id
LEFT JOIN hospitals h ON h.id = r.preferred_hospital_id
WHERE r.status = 'Pending'
  AND r.deleted_at IS NULL
  AND (r.expires_at IS NULL OR r.expires_at > NOW());

-- ── View: dashboard_matches ───────────────────────────────────────────────────
-- Powers the /dashboard page. Replaces the old `matches` table shape.

CREATE OR REPLACE VIEW dashboard_matches AS
SELECT
  m.id,
  'PT-' || UPPER(SUBSTRING(rec_profile.id::text, 1, 4))
                                          AS "patientRef",
  m.organ_type                            AS organ,
  m.match_score                           AS "matchScore",
  m.status,
  COALESCE(m.eta, 'N/A')                  AS eta,
  m.created_at,
  m.updated_at,
  -- Donor info
  donor_profile.full_name                 AS donor_name,
  d.blood_type                            AS donor_blood_type,
  -- Receiver info
  rec_profile.full_name                   AS receiver_name,
  -- Hospital
  h.name                                  AS hospital_name
FROM matches m
JOIN donors d              ON d.id  = m.donor_id
JOIN profiles donor_profile ON donor_profile.id = d.profile_id
JOIN organ_requests r      ON r.id  = m.request_id
JOIN receivers rec         ON rec.id = r.receiver_id
JOIN profiles rec_profile  ON rec_profile.id = rec.profile_id
LEFT JOIN hospitals h      ON h.id  = m.coordinating_hospital
WHERE m.status NOT IN ('Completed', 'Rejected', 'Cancelled');

-- ── View: unread_notification_counts ─────────────────────────────────────────
-- Used by Navbar badge to show unread count per user.

CREATE OR REPLACE VIEW unread_notification_counts AS
SELECT
  user_id,
  COUNT(*) AS unread_count
FROM notifications
WHERE is_read = FALSE
  AND is_dismissed = FALSE
  AND (expires_at IS NULL OR expires_at > NOW())
GROUP BY user_id;

-- ── Function: compute_match_score ────────────────────────────────────────────
-- Scoring algorithm for donor ↔ receiver compatibility.
-- Returns a score 0–100. Higher = better match.
-- Called by the matching engine (Edge Function or admin trigger).

CREATE OR REPLACE FUNCTION compute_match_score(
  p_donor_id    UUID,
  p_request_id  UUID
)
RETURNS NUMERIC AS $$
DECLARE
  v_donor       donors%ROWTYPE;
  v_request     organ_requests%ROWTYPE;
  v_receiver    receivers%ROWTYPE;
  v_score       NUMERIC := 0;
  v_blood_score NUMERIC := 0;
  v_hla_score   NUMERIC := 0;
  v_urgency_score NUMERIC := 0;
BEGIN
  SELECT * INTO v_donor   FROM donors        WHERE id = p_donor_id;
  SELECT * INTO v_request FROM organ_requests WHERE id = p_request_id;
  SELECT * INTO v_receiver FROM receivers    WHERE id = v_request.receiver_id;

  -- ── Blood type compatibility (40 points) ──────────────────
  -- Exact match = 40, compatible = 20, incompatible = 0
  IF v_donor.blood_type = v_request.blood_type THEN
    v_blood_score := 40;
  ELSIF (
    -- O- is universal donor
    v_donor.blood_type = 'O-' OR
    -- O+ can donate to O+, A+, B+, AB+
    (v_donor.blood_type = 'O+' AND v_request.blood_type IN ('O+','A+','B+','AB+')) OR
    -- A can donate to A, AB
    (v_donor.blood_type = 'A-' AND v_request.blood_type IN ('A-','A+','AB-','AB+')) OR
    (v_donor.blood_type = 'A+' AND v_request.blood_type IN ('A+','AB+')) OR
    -- B can donate to B, AB
    (v_donor.blood_type = 'B-' AND v_request.blood_type IN ('B-','B+','AB-','AB+')) OR
    (v_donor.blood_type = 'B+' AND v_request.blood_type IN ('B+','AB+')) OR
    -- AB- can donate to AB-/AB+
    (v_donor.blood_type = 'AB-' AND v_request.blood_type IN ('AB-','AB+'))
  ) THEN
    v_blood_score := 20;
  ELSE
    -- Incompatible blood type — hard disqualifier
    RETURN 0;
  END IF;

  -- ── Urgency score (30 points) ─────────────────────────────
  v_urgency_score := CASE v_receiver.urgency
    WHEN 'Critical'  THEN 30
    WHEN 'High'      THEN 24
    WHEN 'Medium'    THEN 18
    WHEN 'Low'       THEN 12
    WHEN 'Voluntary' THEN 6
    ELSE 0
  END;

  -- ── Waitlist score (20 points) ────────────────────────────
  -- Normalise receiver's waitlist_score (0–100) to 0–20
  v_score := v_blood_score + v_urgency_score +
             (v_receiver.waitlist_score / 100.0 * 20);

  -- ── HLA compatibility (10 points) ────────────────────────
  -- Simple check: if both have HLA data and they match
  IF v_donor.hla_type IS NOT NULL AND v_receiver.hla_type IS NOT NULL THEN
    IF v_donor.hla_type = v_receiver.hla_type THEN
      v_score := v_score + 10;
    ELSIF v_donor.hla_type ILIKE '%' || SPLIT_PART(v_receiver.hla_type, ',', 1) || '%' THEN
      v_score := v_score + 5;
    END IF;
  END IF;

  RETURN LEAST(ROUND(v_score, 2), 100);
END;
$$ LANGUAGE plpgsql;


-- ── Seed data ─────────────────────────────────────────────────────────────────
-- Sample data so the app shows real content immediately.
-- Uses a DO block so it only inserts if tables are empty.

DO $$
BEGIN
  -- Only seed if matches table is empty
  IF NOT EXISTS (SELECT 1 FROM matches LIMIT 1) THEN

    -- Insert seed hospitals (no auth users — for display only)
    -- In production, hospitals register via the signup flow.
    -- These are inserted directly for demo purposes.

    RAISE NOTICE 'Seed data: tables are empty, skipping auto-seed.';
    RAISE NOTICE 'Run supabase/seed.sql to insert demo data.';

  END IF;
END;
$$;
