-- ============================================================
-- Migration 002 — profiles
-- Central identity table. Every authenticated user has exactly
-- one profile row. Role determines which other tables they appear in.
-- Depends on: 001 (user_role enum)
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  -- ── Identity ──────────────────────────────────────────────
  id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID         NOT NULL UNIQUE
                           REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ── Personal info ─────────────────────────────────────────
  full_name   TEXT         NOT NULL,
  email       TEXT         NOT NULL,
  phone       TEXT         NOT NULL DEFAULT '',
  date_of_birth DATE,
  gender      TEXT         CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  avatar_url  TEXT,
  address     TEXT,
  city        TEXT,
  state       TEXT,
  country     TEXT         NOT NULL DEFAULT 'India',
  pincode     TEXT,

  -- ── Role ──────────────────────────────────────────────────
  role        user_role    NOT NULL DEFAULT 'donor',

  -- ── Verification ──────────────────────────────────────────
  is_verified       BOOLEAN      NOT NULL DEFAULT FALSE,
  verified_at       TIMESTAMPTZ,
  verified_by       UUID         REFERENCES auth.users(id) ON DELETE SET NULL,

  -- ── Timestamps ────────────────────────────────────────────
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ  -- soft delete
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_profiles_user_id   ON profiles(user_id);
CREATE INDEX idx_profiles_role      ON profiles(role);
CREATE INDEX idx_profiles_email     ON profiles(email);
CREATE INDEX idx_profiles_city      ON profiles(city);
-- Full-text search on name
CREATE INDEX idx_profiles_name_trgm ON profiles USING gin(full_name gin_trgm_ops);

-- ── Auto updated_at ───────────────────────────────────────────────────────────
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can read all profiles
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- ── Auto-create profile on signup (DB-level guarantee) ────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'donor')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
