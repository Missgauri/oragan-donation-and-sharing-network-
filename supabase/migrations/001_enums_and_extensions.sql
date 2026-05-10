-- ============================================================
-- Migration 001 — Extensions & Enums
-- Run this FIRST. All other migrations depend on these types.
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────────────────────

-- UUID generation (used for all primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pg_trgm: enables fast ILIKE / trigram text search on organ names, locations
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- btree_gist: enables exclusion constraints (e.g. prevent double-booking)
CREATE EXTENSION IF NOT EXISTS btree_gist;


-- ── Shared utility function ───────────────────────────────────────────────────
-- Auto-sets updated_at on every UPDATE. Reused by all tables.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ── Enums ─────────────────────────────────────────────────────────────────────
-- Using enums instead of CHECK constraints gives:
--   • Faster index scans
--   • Compile-time safety in typed clients
--   • Self-documenting schema

-- User roles
CREATE TYPE user_role AS ENUM ('donor', 'receiver', 'hospital', 'admin');

-- Blood types (ABO + Rh)
CREATE TYPE blood_type AS ENUM (
  'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'
);

-- Organ types
CREATE TYPE organ_type AS ENUM (
  'Kidney', 'Liver', 'Heart', 'Lungs', 'Pancreas',
  'Intestine', 'Bone Marrow', 'Cornea', 'Skin', 'Any'
);

-- Urgency levels (ordered low → critical)
CREATE TYPE urgency_level AS ENUM ('Voluntary', 'Low', 'Medium', 'High', 'Critical');

-- Donor availability status
CREATE TYPE donor_status AS ENUM (
  'Active',       -- available for matching
  'Matched',      -- currently matched to a receiver
  'Transplanted', -- donation completed
  'Withdrawn',    -- donor withdrew consent
  'Deceased'      -- posthumous donor
);

-- Receiver / request status
CREATE TYPE request_status AS ENUM (
  'Pending',      -- waiting for a match
  'Matched',      -- match found, awaiting confirmation
  'Confirmed',    -- match confirmed by hospital
  'Transporting', -- organ in transit
  'Completed',    -- transplant done
  'Cancelled',    -- request cancelled
  'Expired'       -- request timed out
);

-- Match status
CREATE TYPE match_status AS ENUM (
  'Proposed',     -- system suggested match
  'Pending Review',
  'Confirmed',
  'Preparing Match',
  'Transporting',
  'Completed',
  'Rejected',
  'Cancelled'
);

-- Hospital verification status
CREATE TYPE hospital_status AS ENUM (
  'Pending',      -- submitted, awaiting admin review
  'Verified',     -- approved transplant centre
  'Suspended',    -- temporarily suspended
  'Rejected'      -- application rejected
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'match_found',
  'match_confirmed',
  'match_rejected',
  'organ_available',
  'request_expired',
  'emergency_alert',
  'system_message',
  'profile_verified'
);

-- Emergency request status
CREATE TYPE emergency_status AS ENUM (
  'Active',
  'Fulfilled',
  'Expired',
  'Cancelled'
);
