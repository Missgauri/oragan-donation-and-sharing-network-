-- ============================================================
-- Organ Donation - Notifications Table Setup
--
-- HOW TO RUN:
-- 1. Go to https://supabase.com/dashboard/project/<your-project>/sql/new
-- 2. Copy and paste this entire file
-- 3. Click "Run"
-- ============================================================

-- ============================================================
-- TABLE: notifications
-- Stores per-user notifications for matches, requests, alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          BIGSERIAL    PRIMARY KEY,
  user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT         NOT NULL,   -- 'match' | 'request_accepted' | 'emergency' | 'system'
  title       TEXT         NOT NULL,
  message     TEXT         NOT NULL,
  is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
  metadata    JSONB,                   -- optional extra data (organ, patientRef, etc.)
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread  ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================
-- ROW LEVEL SECURITY
-- Users can only see and manage their own notifications
-- ============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own notifications
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can insert their own notifications
CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update (mark read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can insert notifications for any user (for server-side triggers)
CREATE POLICY "Service role can insert any notification"
  ON notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ============================================================
-- REALTIME
-- Enable live updates for the notifications table
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
