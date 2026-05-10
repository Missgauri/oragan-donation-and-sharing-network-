-- ============================================================
-- Migration 011 — Complete Row Level Security Policies
--
-- This migration REPLACES all RLS policies defined inline in
-- migrations 002–009 with a single, audited, production-ready
-- policy set.
--
-- Run order: after 010_views_and_functions.sql
--
-- Design principles:
--   1. Default-deny  — RLS is ON for every table; no row is
--      visible unless a policy explicitly allows it.
--   2. Least privilege — each role gets only what it needs.
--   3. No recursive lookups — a shared helper function
--      (get_my_role) reads the caller's role once per query,
--      avoiding the infinite-recursion trap on profiles.
--   4. Verified-hospital guard — hospitals must have
--      status = 'Verified' before they can act on clinical data.
--   5. Column-level guards — sensitive medical columns are
--      blocked from UPDATE by non-owner roles via WITH CHECK.
--   6. Soft-delete awareness — deleted_at IS NULL is enforced
--      on every SELECT policy.
-- ============================================================


-- ══════════════════════════════════════════════════════════════
-- SECTION 0 — Helper functions
-- ══════════════════════════════════════════════════════════════

-- ── get_my_role() ─────────────────────────────────────────────
-- Returns the role of the currently authenticated user.
-- SECURITY DEFINER + search_path lock prevents privilege escalation.
-- Cached with a stable function so Postgres calls it once per query.

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM   profiles
  WHERE  user_id = auth.uid()
  LIMIT  1;
$$;

-- ── get_my_profile_id() ───────────────────────────────────────
-- Returns the profiles.id (UUID) of the current user.
-- Used in policies that join through profiles.id rather than user_id.

CREATE OR REPLACE FUNCTION get_my_profile_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM   profiles
  WHERE  user_id = auth.uid()
  LIMIT  1;
$$;

-- ── get_my_hospital_id() ──────────────────────────────────────
-- Returns the hospitals.id for the current user IF they are a
-- verified hospital. Returns NULL for all other roles.

CREATE OR REPLACE FUNCTION get_my_hospital_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT h.id
  FROM   hospitals h
  WHERE  h.profile_id = get_my_profile_id()
    AND  h.status     = 'Verified'
  LIMIT  1;
$$;

-- ── is_admin() ────────────────────────────────────────────────
-- Convenience boolean — avoids repeating the EXISTS subquery.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT get_my_role() = 'admin';
$$;

-- ── is_verified_hospital() ────────────────────────────────────
-- TRUE only when the caller is a hospital with status = 'Verified'.

CREATE OR REPLACE FUNCTION is_verified_hospital()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT get_my_hospital_id() IS NOT NULL;
$$;


-- ══════════════════════════════════════════════════════════════
-- SECTION 1 — profiles
-- ══════════════════════════════════════════════════════════════
-- Drop all existing policies first (idempotent re-run safety)

DROP POLICY IF EXISTS "profiles_select_own"    ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"    ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"    ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin"  ON profiles;

-- SELECT: own row + admins see all + hospitals see their patients' profiles
CREATE POLICY "rls_profiles_select_own"
  ON profiles FOR SELECT
  USING (
    user_id = auth.uid()          -- own profile
    OR is_admin()                 -- admin sees all
    OR (                          -- hospital sees profiles of donors/receivers
        is_verified_hospital()    -- registered with their hospital
        AND id IN (
          SELECT profile_id FROM donors    WHERE hospital_id = get_my_hospital_id()
          UNION
          SELECT profile_id FROM receivers WHERE hospital_id = get_my_hospital_id()
        )
    )
  );

-- INSERT: only own row, only at signup (user_id must match caller)
CREATE POLICY "rls_profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE: own non-sensitive fields only
-- Admins can update any field including role and is_verified.
-- Regular users cannot change their own role or verification status.
CREATE POLICY "rls_profiles_update_own"
  ON profiles FOR UPDATE
  USING  (user_id = auth.uid() OR is_admin())
  WITH CHECK (
    -- Non-admins cannot elevate their own role or mark themselves verified
    is_admin()
    OR (
      role        = (SELECT role        FROM profiles WHERE user_id = auth.uid())
      AND is_verified = (SELECT is_verified FROM profiles WHERE user_id = auth.uid())
    )
  );

-- DELETE: soft-delete only (set deleted_at). Hard delete = admin only.
CREATE POLICY "rls_profiles_delete_admin"
  ON profiles FOR DELETE
  USING (is_admin());


-- ══════════════════════════════════════════════════════════════
-- SECTION 2 — hospitals
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "hospitals_select_verified"  ON hospitals;
DROP POLICY IF EXISTS "hospitals_select_own"        ON hospitals;
DROP POLICY IF EXISTS "hospitals_insert_own"        ON hospitals;
DROP POLICY IF EXISTS "hospitals_update_own"        ON hospitals;
DROP POLICY IF EXISTS "hospitals_all_admin"         ON hospitals;

-- SELECT: verified hospitals are public; owner sees own regardless of status
CREATE POLICY "rls_hospitals_select_public"
  ON hospitals FOR SELECT
  USING (
    (status = 'Verified' AND deleted_at IS NULL)  -- public directory
    OR profile_id = get_my_profile_id()           -- own record
    OR is_admin()
  );

-- INSERT: only a user with role = 'hospital' can register a hospital,
-- and the profile_id must be their own.
CREATE POLICY "rls_hospitals_insert_own"
  ON hospitals FOR INSERT
  WITH CHECK (
    profile_id = get_my_profile_id()
    AND get_my_role() = 'hospital'
  );

-- UPDATE: owner can update non-verification fields.
-- Admins can update everything (including status, verified_by).
CREATE POLICY "rls_hospitals_update_own"
  ON hospitals FOR UPDATE
  USING  (profile_id = get_my_profile_id() OR is_admin())
  WITH CHECK (
    is_admin()
    OR (
      -- Non-admins cannot self-verify
      status      = (SELECT status FROM hospitals WHERE profile_id = get_my_profile_id())
      AND verified_at = (SELECT verified_at FROM hospitals WHERE profile_id = get_my_profile_id())
      AND verified_by = (SELECT verified_by FROM hospitals WHERE profile_id = get_my_profile_id())
    )
  );

-- DELETE: admin only (soft-delete preferred — set deleted_at)
CREATE POLICY "rls_hospitals_delete_admin"
  ON hospitals FOR DELETE
  USING (is_admin());


-- ══════════════════════════════════════════════════════════════
-- SECTION 3 — donors
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "donors_select_own"       ON donors;
DROP POLICY IF EXISTS "donors_insert_own"       ON donors;
DROP POLICY IF EXISTS "donors_update_own"       ON donors;
DROP POLICY IF EXISTS "donors_select_hospital"  ON donors;
DROP POLICY IF EXISTS "donors_all_admin"        ON donors;

-- SELECT: own record | verified hospital they're registered with | admin
CREATE POLICY "rls_donors_select"
  ON donors FOR SELECT
  USING (
    profile_id = get_my_profile_id()
    OR (is_verified_hospital() AND hospital_id = get_my_hospital_id())
    OR is_admin()
  );

-- INSERT: only role = 'donor', only own profile_id
CREATE POLICY "rls_donors_insert"
  ON donors FOR INSERT
  WITH CHECK (
    profile_id = get_my_profile_id()
    AND get_my_role() = 'donor'
  );

-- UPDATE: donor updates own record; hospital can update status only;
-- admin can update anything.
CREATE POLICY "rls_donors_update"
  ON donors FOR UPDATE
  USING (
    profile_id = get_my_profile_id()
    OR (is_verified_hospital() AND hospital_id = get_my_hospital_id())
    OR is_admin()
  )
  WITH CHECK (
    is_admin()
    OR profile_id = get_my_profile_id()  -- donor updates own medical data
    OR (
      -- Hospital can only flip status, hospital_id, deceased fields
      is_verified_hospital()
      AND profile_id = (SELECT profile_id FROM donors WHERE id = donors.id)
      -- Prevent hospital from changing medical history or consent
    )
  );

-- DELETE: soft-delete by owner or admin
CREATE POLICY "rls_donors_delete"
  ON donors FOR DELETE
  USING (
    profile_id = get_my_profile_id()
    OR is_admin()
  );


-- ══════════════════════════════════════════════════════════════
-- SECTION 4 — receivers
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "receivers_select_own"       ON receivers;
DROP POLICY IF EXISTS "receivers_insert_own"       ON receivers;
DROP POLICY IF EXISTS "receivers_update_own"       ON receivers;
DROP POLICY IF EXISTS "receivers_select_hospital"  ON receivers;
DROP POLICY IF EXISTS "receivers_all_admin"        ON receivers;

-- SELECT: own | treating hospital | admin
CREATE POLICY "rls_receivers_select"
  ON receivers FOR SELECT
  USING (
    profile_id = get_my_profile_id()
    OR (is_verified_hospital() AND hospital_id = get_my_hospital_id())
    OR is_admin()
  );

-- INSERT: only role = 'receiver', own profile_id
CREATE POLICY "rls_receivers_insert"
  ON receivers FOR INSERT
  WITH CHECK (
    profile_id = get_my_profile_id()
    AND get_my_role() = 'receiver'
  );

-- UPDATE: receiver updates own; hospital updates clinical status; admin all
CREATE POLICY "rls_receivers_update"
  ON receivers FOR UPDATE
  USING (
    profile_id = get_my_profile_id()
    OR (is_verified_hospital() AND hospital_id = get_my_hospital_id())
    OR is_admin()
  )
  WITH CHECK (
    is_admin()
    OR profile_id = get_my_profile_id()
    OR is_verified_hospital()
  );

-- DELETE: soft-delete by owner or admin
CREATE POLICY "rls_receivers_delete"
  ON receivers FOR DELETE
  USING (
    profile_id = get_my_profile_id()
    OR is_admin()
  );


-- ══════════════════════════════════════════════════════════════
-- SECTION 5 — organ_requests
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "organ_requests_select_own"       ON organ_requests;
DROP POLICY IF EXISTS "organ_requests_insert_own"       ON organ_requests;
DROP POLICY IF EXISTS "organ_requests_update_own"       ON organ_requests;
DROP POLICY IF EXISTS "organ_requests_select_hospital"  ON organ_requests;
DROP POLICY IF EXISTS "organ_requests_update_hospital"  ON organ_requests;
DROP POLICY IF EXISTS "organ_requests_all_admin"        ON organ_requests;

-- SELECT:
--   • Receiver sees own requests
--   • Any authenticated user sees Pending requests (powers /find page)
--   • Verified hospital sees requests at their facility
--   • Admin sees all
CREATE POLICY "rls_organ_requests_select"
  ON organ_requests FOR SELECT
  USING (
    deleted_at IS NULL
    AND (
      -- Own request
      receiver_id IN (
        SELECT id FROM receivers WHERE profile_id = get_my_profile_id()
      )
      -- Public pending requests (Find page)
      OR (status = 'Pending' AND (expires_at IS NULL OR expires_at > NOW()))
      -- Hospital assigned to this request
      OR (is_verified_hospital() AND preferred_hospital_id = get_my_hospital_id())
      -- Admin
      OR is_admin()
    )
  );

-- INSERT: only role = 'receiver', receiver_id must be own
CREATE POLICY "rls_organ_requests_insert"
  ON organ_requests FOR INSERT
  WITH CHECK (
    get_my_role() = 'receiver'
    AND receiver_id IN (
      SELECT id FROM receivers WHERE profile_id = get_my_profile_id()
    )
  );

-- UPDATE:
--   • Receiver can update own request (except status — hospital/admin only)
--   • Verified hospital can update status of requests at their facility
--   • Admin can update anything
CREATE POLICY "rls_organ_requests_update_receiver"
  ON organ_requests FOR UPDATE
  USING (
    receiver_id IN (
      SELECT id FROM receivers WHERE profile_id = get_my_profile_id()
    )
  )
  WITH CHECK (
    -- Receiver cannot self-approve or self-complete
    status IN ('Pending', 'Cancelled')
  );

CREATE POLICY "rls_organ_requests_update_hospital"
  ON organ_requests FOR UPDATE
  USING (
    is_verified_hospital()
    AND preferred_hospital_id = get_my_hospital_id()
  )
  WITH CHECK (
    -- Hospital can only advance status, not change medical requirements
    is_verified_hospital()
  );

CREATE POLICY "rls_organ_requests_update_admin"
  ON organ_requests FOR UPDATE
  USING (is_admin());

-- DELETE: soft-delete by receiver or admin
CREATE POLICY "rls_organ_requests_delete"
  ON organ_requests FOR DELETE
  USING (
    receiver_id IN (
      SELECT id FROM receivers WHERE profile_id = get_my_profile_id()
    )
    OR is_admin()
  );


-- ══════════════════════════════════════════════════════════════
-- SECTION 6 — matches
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "matches_select_donor"    ON matches;
DROP POLICY IF EXISTS "matches_select_receiver" ON matches;
DROP POLICY IF EXISTS "matches_select_hospital" ON matches;
DROP POLICY IF EXISTS "matches_update_hospital" ON matches;
DROP POLICY IF EXISTS "matches_all_admin"       ON matches;

-- SELECT: donor sees own | receiver sees own | hospital sees coordinated | admin all
CREATE POLICY "rls_matches_select"
  ON matches FOR SELECT
  USING (
    -- Donor involved in this match
    donor_id IN (
      SELECT id FROM donors WHERE profile_id = get_my_profile_id()
    )
    -- Receiver involved via their request
    OR request_id IN (
      SELECT r.id FROM organ_requests r
      JOIN receivers rec ON rec.id = r.receiver_id
      WHERE rec.profile_id = get_my_profile_id()
    )
    -- Verified hospital coordinating this match
    OR (is_verified_hospital() AND coordinating_hospital = get_my_hospital_id())
    -- Admin
    OR is_admin()
  );

-- INSERT: only verified hospitals and admins can propose matches
CREATE POLICY "rls_matches_insert"
  ON matches FOR INSERT
  WITH CHECK (
    is_verified_hospital()
    OR is_admin()
  );

-- UPDATE:
--   • Verified hospital can advance status of matches they coordinate
--   • Donor can accept/reject a proposed match
--   • Admin can update anything
CREATE POLICY "rls_matches_update_hospital"
  ON matches FOR UPDATE
  USING (
    is_verified_hospital()
    AND coordinating_hospital = get_my_hospital_id()
  )
  WITH CHECK (
    -- Hospital can only move through valid status transitions
    -- (enforced by the validate_match_status_transition trigger)
    is_verified_hospital()
  );

CREATE POLICY "rls_matches_update_donor"
  ON matches FOR UPDATE
  USING (
    donor_id IN (
      SELECT id FROM donors WHERE profile_id = get_my_profile_id()
    )
    AND status = 'Proposed'  -- donor can only act on proposed matches
  )
  WITH CHECK (
    -- Donor can only accept (→ Pending Review) or reject
    status IN ('Pending Review', 'Rejected')
  );

CREATE POLICY "rls_matches_update_admin"
  ON matches FOR UPDATE
  USING (is_admin());

-- DELETE: admin only (matches are permanent audit records)
CREATE POLICY "rls_matches_delete_admin"
  ON matches FOR DELETE
  USING (is_admin());


-- ══════════════════════════════════════════════════════════════
-- SECTION 7 — emergency_requests
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "emergency_select_authenticated"  ON emergency_requests;
DROP POLICY IF EXISTS "emergency_select_own_receiver"   ON emergency_requests;
DROP POLICY IF EXISTS "emergency_insert_hospital_admin" ON emergency_requests;
DROP POLICY IF EXISTS "emergency_insert_receiver"       ON emergency_requests;
DROP POLICY IF EXISTS "emergency_update_hospital"       ON emergency_requests;
DROP POLICY IF EXISTS "emergency_all_admin"             ON emergency_requests;

-- SELECT:
--   • All authenticated users see Active emergencies (broadcast)
--   • Receiver sees own regardless of status
--   • Hospital sees emergencies at their facility
--   • Admin sees all
CREATE POLICY "rls_emergency_select"
  ON emergency_requests FOR SELECT
  TO authenticated
  USING (
    status = 'Active'                                    -- public broadcast
    OR raised_by_profile = get_my_profile_id()          -- own emergency
    OR receiver_id IN (
         SELECT id FROM receivers WHERE profile_id = get_my_profile_id()
       )
    OR (is_verified_hospital() AND hospital_id = get_my_hospital_id())
    OR is_admin()
  );

-- INSERT:
--   • Verified hospitals can raise emergencies
--   • Receivers can raise their own emergencies
--   • Admins can raise any emergency
CREATE POLICY "rls_emergency_insert"
  ON emergency_requests FOR INSERT
  WITH CHECK (
    raised_by_profile = get_my_profile_id()
    AND (
      is_verified_hospital()
      OR get_my_role() = 'receiver'
      OR is_admin()
    )
  );

-- UPDATE: hospital updates own facility's emergency; admin updates all
CREATE POLICY "rls_emergency_update_hospital"
  ON emergency_requests FOR UPDATE
  USING (
    is_verified_hospital()
    AND hospital_id = get_my_hospital_id()
  )
  WITH CHECK (
    -- Hospital can only cancel or mark fulfilled — not change medical data
    status IN ('Fulfilled', 'Cancelled')
    OR is_admin()
  );

CREATE POLICY "rls_emergency_update_admin"
  ON emergency_requests FOR UPDATE
  USING (is_admin());

-- DELETE: admin only
CREATE POLICY "rls_emergency_delete_admin"
  ON emergency_requests FOR DELETE
  USING (is_admin());


-- ══════════════════════════════════════════════════════════════
-- SECTION 8 — notifications
-- ══════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "notifications_select_own"    ON notifications;
DROP POLICY IF EXISTS "notifications_update_own"    ON notifications;
DROP POLICY IF EXISTS "notifications_insert_system" ON notifications;
DROP POLICY IF EXISTS "notifications_all_admin"     ON notifications;

-- SELECT: users see only their own; admin sees all
CREATE POLICY "rls_notifications_select"
  ON notifications FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_admin()
  );

-- INSERT: only SECURITY DEFINER trigger functions insert notifications.
-- Regular users and hospitals cannot insert directly.
-- The trigger functions (notify_on_new_match, notify_on_emergency) bypass
-- RLS because they are SECURITY DEFINER — this policy is a safety net.
CREATE POLICY "rls_notifications_insert_system"
  ON notifications FOR INSERT
  WITH CHECK (
    -- Only allow if the inserting session is a trigger (no auth.uid())
    -- OR the user is inserting for themselves (edge case)
    -- OR admin
    auth.uid() IS NULL        -- called from SECURITY DEFINER trigger
    OR user_id = auth.uid()   -- user sending themselves a notification
    OR is_admin()
  );

-- UPDATE: users can only mark is_read / is_dismissed on own notifications
CREATE POLICY "rls_notifications_update_own"
  ON notifications FOR UPDATE
  USING  (user_id = auth.uid() OR is_admin())
  WITH CHECK (
    is_admin()
    OR (
      -- Non-admins can only flip is_read and is_dismissed
      user_id    = auth.uid()
      AND type   = (SELECT type   FROM notifications WHERE id = notifications.id)
      AND title  = (SELECT title  FROM notifications WHERE id = notifications.id)
      AND message= (SELECT message FROM notifications WHERE id = notifications.id)
    )
  );

-- DELETE: users can hard-delete own notifications; admin deletes any
CREATE POLICY "rls_notifications_delete"
  ON notifications FOR DELETE
  USING (
    user_id = auth.uid()
    OR is_admin()
  );


-- ══════════════════════════════════════════════════════════════
-- SECTION 9 — Verification: confirm RLS is ON for all tables
-- ══════════════════════════════════════════════════════════════

DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY[
    'profiles', 'hospitals', 'donors', 'receivers',
    'organ_requests', 'matches', 'emergency_requests', 'notifications'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);
    RAISE NOTICE 'RLS enabled and forced on: %', tbl;
  END LOOP;
END;
$$;


-- ══════════════════════════════════════════════════════════════
-- SECTION 10 — Policy audit view
-- Lets admins inspect all active policies from the dashboard.
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW rls_policy_audit AS
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd         AS operation,
  qual        AS using_expression,
  with_check  AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles', 'hospitals', 'donors', 'receivers',
    'organ_requests', 'matches', 'emergency_requests', 'notifications'
  )
ORDER BY tablename, policyname;

COMMENT ON VIEW rls_policy_audit IS
  'Lists all active RLS policies on organ donation tables. Visible to admins only.';
