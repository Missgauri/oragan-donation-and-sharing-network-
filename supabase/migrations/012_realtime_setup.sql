-- ============================================================
-- Migration 012 — Supabase Realtime Setup
--
-- Enables postgres_changes replication for all tables that
-- need live updates in the frontend.
--
-- Run after: 011_rls_policies.sql
-- ============================================================


-- ── Enable realtime on all required tables ────────────────────────────────────
-- supabase_realtime is the default Supabase publication.
-- Tables must be added here before postgres_changes subscriptions work.

ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE emergency_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE donors;
ALTER PUBLICATION supabase_realtime ADD TABLE organ_requests;

-- profiles and hospitals are intentionally excluded:
--   • profiles contain PII — realtime would broadcast changes to all subscribers
--   • hospitals change infrequently — polling is sufficient


-- ── Replica identity ──────────────────────────────────────────────────────────
-- REPLICA IDENTITY FULL means DELETE payloads include the full old row.
-- Without this, DELETE events only contain the primary key.
-- Required for the frontend to remove the correct row from state.

ALTER TABLE matches           REPLICA IDENTITY FULL;
ALTER TABLE emergency_requests REPLICA IDENTITY FULL;
ALTER TABLE notifications     REPLICA IDENTITY FULL;
ALTER TABLE donors            REPLICA IDENTITY FULL;
ALTER TABLE organ_requests    REPLICA IDENTITY FULL;


-- ── Verify publication ────────────────────────────────────────────────────────
-- Run this query to confirm which tables are in the publication:
--
-- SELECT schemaname, tablename
-- FROM   pg_publication_tables
-- WHERE  pubname = 'supabase_realtime'
-- ORDER  BY tablename;


-- ── RLS note ─────────────────────────────────────────────────────────────────
-- Supabase Realtime respects RLS policies automatically.
-- A user subscribed to 'matches' will only receive rows they are
-- allowed to SELECT per the policies in 011_rls_policies.sql.
--
-- Filter subscriptions (e.g. donor_id=eq.xxx) are applied server-side
-- BEFORE the row is sent to the client — no data leakage.


-- ── Channel naming convention (for reference) ─────────────────────────────────
-- These match the CHANNELS constants in src/services/realtimeService.js:
--
--   rt:matches                        — all matches (admin/hospital)
--   rt:matches:donor:{donorId}        — donor-scoped matches
--   rt:matches:request:{requestId}    — request-scoped matches
--   rt:emergency:active               — all active emergencies
--   rt:emergency:hospital:{id}        — hospital-scoped emergencies
--   rt:notifications:{userId}         — user inbox (INSERT only)
--   rt:donors:status                  — all donor status changes
--   rt:donors:hospital:{id}           — hospital-scoped donors
--   rt:organ_requests:pending         — pending organ requests (/find page)
