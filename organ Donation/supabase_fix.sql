-- ============================================================
-- LifeGift Network — Database Fix Script
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. Create notifications table (missing) ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notifications (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL DEFAULT 'system',
  title      TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL DEFAULT '',
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id   ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop old policies first (safe to run multiple times)
DROP POLICY IF EXISTS "Users read own notifications"    ON public.notifications;
DROP POLICY IF EXISTS "Users update own notifications"  ON public.notifications;
DROP POLICY IF EXISTS "Users delete own notifications"  ON public.notifications;
DROP POLICY IF EXISTS "Service role insert notifications" ON public.notifications;

CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;


-- ── 2. Fix donor_profiles RLS ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "Donors insert own profile"                  ON public.donor_profiles;
DROP POLICY IF EXISTS "Users insert donor profile"                 ON public.donor_profiles;
DROP POLICY IF EXISTS "Authenticated users can register as donor"  ON public.donor_profiles;
DROP POLICY IF EXISTS "Anyone can read donor profiles"             ON public.donor_profiles;
DROP POLICY IF EXISTS "Users update own donor profile"             ON public.donor_profiles;

CREATE POLICY "Authenticated users can register as donor"
  ON public.donor_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read donor profiles"
  ON public.donor_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users update own donor profile"
  ON public.donor_profiles FOR UPDATE
  USING (auth.uid() = user_id);


-- ── 3. Fix recipient_requests RLS ────────────────────────────────────────────

DROP POLICY IF EXISTS "Receivers insert own request"               ON public.recipient_requests;
DROP POLICY IF EXISTS "Users insert recipient request"             ON public.recipient_requests;
DROP POLICY IF EXISTS "Authenticated users can submit requests"    ON public.recipient_requests;
DROP POLICY IF EXISTS "Anyone can read recipient requests"         ON public.recipient_requests;
DROP POLICY IF EXISTS "Users update own requests"                  ON public.recipient_requests;

CREATE POLICY "Authenticated users can submit requests"
  ON public.recipient_requests FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read recipient requests"
  ON public.recipient_requests FOR SELECT
  USING (true);

CREATE POLICY "Users update own requests"
  ON public.recipient_requests FOR UPDATE
  USING (auth.uid() = user_id);


-- ── 4. Fix donors table RLS ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "Donors insert own record"              ON public.donors;
DROP POLICY IF EXISTS "Authenticated users can register donor" ON public.donors;
DROP POLICY IF EXISTS "Anyone can read donors"                ON public.donors;

CREATE POLICY "Authenticated users can register donor"
  ON public.donors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read donors"
  ON public.donors FOR SELECT
  USING (true);


-- ── 5. Fix organs table RLS ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "Donors insert organs"                  ON public.organs;
DROP POLICY IF EXISTS "Authenticated users can add organs"    ON public.organs;
DROP POLICY IF EXISTS "Anon can add organs"                   ON public.organs;
DROP POLICY IF EXISTS "Anyone can read organs"                ON public.organs;

CREATE POLICY "Authenticated users can add organs"
  ON public.organs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anon can add organs"
  ON public.organs FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read organs"
  ON public.organs FOR SELECT
  USING (true);


-- ── 6. Fix matches table RLS ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "Anyone can read matches"                    ON public.matches;
DROP POLICY IF EXISTS "Authenticated users can insert matches"     ON public.matches;

CREATE POLICY "Anyone can read matches"
  ON public.matches FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert matches"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (true);


-- ── Done ──────────────────────────────────────────────────────────────────────
SELECT 'Database fix applied successfully!' AS status;
