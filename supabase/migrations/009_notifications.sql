-- ============================================================
-- Migration 009 — notifications
-- In-app notification inbox for every user.
-- Populated by DB triggers and Edge Functions.
-- Depends on: 002 (profiles)
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id              UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- ── Recipient ─────────────────────────────────────────────
  user_id         UUID               NOT NULL
                                     REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ── Content ───────────────────────────────────────────────
  type            notification_type  NOT NULL,
  title           TEXT               NOT NULL,
  message         TEXT               NOT NULL,

  -- ── Deep-link data ────────────────────────────────────────
  -- JSON payload for the frontend to navigate to the right page
  -- e.g. { "matchId": "uuid", "route": "/dashboard" }
  data            JSONB              NOT NULL DEFAULT '{}',

  -- ── Source entity ─────────────────────────────────────────
  -- Which record triggered this notification
  related_match_id     UUID          REFERENCES matches(id)            ON DELETE SET NULL,
  related_request_id   UUID          REFERENCES organ_requests(id)     ON DELETE SET NULL,
  related_emergency_id UUID          REFERENCES emergency_requests(id) ON DELETE SET NULL,

  -- ── State ─────────────────────────────────────────────────
  is_read         BOOLEAN            NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  -- Soft-delete: user can dismiss without losing audit trail
  is_dismissed    BOOLEAN            NOT NULL DEFAULT FALSE,
  dismissed_at    TIMESTAMPTZ,

  -- ── Delivery ──────────────────────────────────────────────
  -- For future push notification integration
  push_sent       BOOLEAN            NOT NULL DEFAULT FALSE,
  push_sent_at    TIMESTAMPTZ,

  -- ── Timestamps ────────────────────────────────────────────
  created_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ        -- auto-hide old notifications
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX idx_notifications_type       ON notifications(type);
CREATE INDEX idx_notifications_is_read    ON notifications(user_id, is_read)
  WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created    ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_match      ON notifications(related_match_id)
  WHERE related_match_id IS NOT NULL;
CREATE INDEX idx_notifications_emergency  ON notifications(related_emergency_id)
  WHERE related_emergency_id IS NOT NULL;

-- ── Auto mark read_at ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_read = TRUE AND OLD.is_read = FALSE THEN
    NEW.read_at = NOW();
  END IF;
  IF NEW.is_dismissed = TRUE AND OLD.is_dismissed = FALSE THEN
    NEW.dismissed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifications_read_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION set_notification_read_at();

-- ── Auto-notify on new match ──────────────────────────────────────────────────
-- Fires when a new match row is inserted.
-- Notifies both the donor and the receiver.
CREATE OR REPLACE FUNCTION notify_on_new_match()
RETURNS TRIGGER AS $$
DECLARE
  donor_user_id    UUID;
  receiver_user_id UUID;
  donor_name       TEXT;
BEGIN
  -- Get donor's auth user_id
  SELECT p.user_id, p.full_name
  INTO   donor_user_id, donor_name
  FROM   donors d
  JOIN   profiles p ON p.id = d.profile_id
  WHERE  d.id = NEW.donor_id;

  -- Get receiver's auth user_id
  SELECT p.user_id
  INTO   receiver_user_id
  FROM   organ_requests r
  JOIN   receivers rec ON rec.id = r.receiver_id
  JOIN   profiles p ON p.id = rec.profile_id
  WHERE  r.id = NEW.request_id;

  -- Notify donor
  IF donor_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data, related_match_id)
    VALUES (
      donor_user_id,
      'match_found',
      'A match has been found for your donation',
      'Your organ donation has been matched with a recipient. Please check your dashboard.',
      jsonb_build_object('matchId', NEW.id, 'route', '/dashboard'),
      NEW.id
    );
  END IF;

  -- Notify receiver
  IF receiver_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data, related_match_id)
    VALUES (
      receiver_user_id,
      'match_found',
      'An organ match has been found for you',
      'A compatible organ has been matched to your request. Your hospital will contact you shortly.',
      jsonb_build_object('matchId', NEW.id, 'route', '/dashboard'),
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_match_created
  AFTER INSERT ON matches
  FOR EACH ROW EXECUTE FUNCTION notify_on_new_match();

-- ── Auto-notify on emergency ──────────────────────────────────────────────────
-- Notifies all verified hospitals when an emergency request is raised.
CREATE OR REPLACE FUNCTION notify_on_emergency()
RETURNS TRIGGER AS $$
DECLARE
  hospital_record RECORD;
BEGIN
  FOR hospital_record IN
    SELECT p.user_id
    FROM   hospitals h
    JOIN   profiles p ON p.id = h.profile_id
    WHERE  h.status = 'Verified'
      AND  NEW.organ_type = ANY(h.supported_organs)
  LOOP
    INSERT INTO notifications (
      user_id, type, title, message, data, related_emergency_id
    ) VALUES (
      hospital_record.user_id,
      'emergency_alert',
      'EMERGENCY: Urgent organ needed',
      'An emergency organ request has been raised. ' ||
        NEW.organ_type::text || ' (' || NEW.blood_type::text || ') needed within ' ||
        NEW.required_within_hours || ' hours.',
      jsonb_build_object('emergencyId', NEW.id, 'route', '/dashboard'),
      NEW.id
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_emergency_created
  AFTER INSERT ON emergency_requests
  FOR EACH ROW EXECUTE FUNCTION notify_on_emergency();

-- ── Realtime ──────────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark their own notifications as read/dismissed
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System (triggers) can insert notifications for any user
-- This uses SECURITY DEFINER on the trigger functions above
CREATE POLICY "notifications_insert_system"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "notifications_all_admin"
  ON notifications FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));
