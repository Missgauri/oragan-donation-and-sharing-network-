-- ============================================================
-- run_all_migrations.sql
-- Master script — runs all migrations in order.
--
-- HOW TO RUN:
-- 1. Go to: https://supabase.com/dashboard/project/jizcvnzhipxuhsrotbui/sql/new
-- 2. Paste this entire file
-- 3. Click Run
--
-- Or run each migration file individually in numbered order.
-- ============================================================

-- ── Step 1: Extensions & Enums ────────────────────────────────────────────────
\i migrations/001_enums_and_extensions.sql

-- ── Step 2: Profiles ──────────────────────────────────────────────────────────
\i migrations/002_profiles.sql

-- ── Step 3: Hospitals ─────────────────────────────────────────────────────────
\i migrations/003_hospitals.sql

-- ── Step 4: Donors ────────────────────────────────────────────────────────────
\i migrations/004_donors.sql

-- ── Step 5: Receivers ─────────────────────────────────────────────────────────
\i migrations/005_receivers.sql

-- ── Step 6: Organ Requests ────────────────────────────────────────────────────
\i migrations/006_organ_requests.sql

-- ── Step 7: Matches ───────────────────────────────────────────────────────────
\i migrations/007_matches.sql

-- ── Step 8: Emergency Requests ────────────────────────────────────────────────
\i migrations/008_emergency_requests.sql

-- ── Step 9: Notifications ─────────────────────────────────────────────────────
\i migrations/009_notifications.sql

-- ── Step 10: Views & Functions ────────────────────────────────────────────────
\i migrations/010_views_and_functions.sql

-- ── Optional: Seed demo data ──────────────────────────────────────────────────
-- Uncomment the line below to insert sample data:
-- \i seed.sql
