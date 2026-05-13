-- ============================================================
-- LifeGift Network — Database Fix Script
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. Create notifications table (missing) ──────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'system',
  title       TEXT NOT NULL DEFAULT '',
  message     TEXT NOT NULL DEFAULT '',
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast user-specific queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at
  ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY IF NOT EXISTS "Users read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark read) their own notifications
CREATE POLICY IF NOT EXISTS "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY IF NOT EXISTS "Users delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- System/service role can insert notifications for any user
CREATE POLICY IF NOT EXISTS "Service role insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;


-- ── 2. Fix donor_profiles RLS — allow any authenticated user to insert ──────
-- Drop existing restrictive policy if it exists
DROP POLICY IF EXISTS "Donors insert own profile" ON public.donor_profiles;
DROP POLICY IF EXISTS "Users insert donor profile" ON public.donor_profiles;

-- Allow any authenticated user to insert a donor profile
CREATE POLICY IF NOT EXISTS "Authenticated users can register as donor"
  ON public.donor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can read all donor profiles (needed for matching/search)
CREATE POLICY IF NOT EXISTS "Anyone can read donor profiles"
  ON public.donor_profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY IF NOT EXISTS "Users update own donor profile"
  ON public.donor_profiles FOR UPDATE
  USING (auth.uid() = user_id);


-- ── 3. Fix recipient_requests RLS — allow authenticated users to insert ─────
DROP POLICY IF EXISTS "Receivers insert own request" ON public.recipient_requests;
DROP POLICY IF EXISTS "Users insert recipient request" ON public.recipient_requests;

-- Allow any authenticated user to submit a request
CREATE POLICY IF NOT EXISTS "Authenticated users can submit requests"
  ON public.recipient_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Anyone can read active requests (needed for emergency page + matching)
CREATE POLICY IF NOT EXISTS "Anyone can read recipient requests"
  ON public.recipient_requests FOR SELECT
  USING (true);

-- Users can update their own requests
CREATE POLICY IF NOT EXISTS "Users update own requests"
  ON public.recipient_requests FOR UPDATE
  USING (auth.uid() = user_id);


-- ── 4. Fix donors table — allow any authenticated user to insert ─────────────
DROP POLICY IF EXISTS "Donors insert own record" ON public.donors;

CREATE POLICY IF NOT EXISTS "Authenticated users can register donor"
  ON public.donors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can read donors"
  ON public.donors FOR SELECT
  USING (true);


-- ── 5. Fix organs table — allow any authenticated user to insert ─────────────
DROP POLICY IF EXISTS "Donors insert organs" ON public.organs;

CREATE POLICY IF NOT EXISTS "Authenticated users can add organs"
  ON public.organs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also allow anon inserts for the public donation form
CREATE POLICY IF NOT EXISTS "Anon can add organs"
  ON public.organs FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can read organs"
  ON public.organs FOR SELECT
  USING (true);


-- ── 6. Fix matches table — allow reads ───────────────────────────────────────
CREATE POLICY IF NOT EXISTS "Anyone can read matches"
  ON public.matches FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can insert matches"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ── Done ─────────────────────────────────────────────────────────────────────
SELECT 'Database fix applied successfully!' AS status;
