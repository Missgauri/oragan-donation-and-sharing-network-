-- ============================================================
-- Supabase Auth Setup — profiles table with roles
--
-- HOW TO RUN:
-- 1. Go to https://supabase.com/dashboard/project/<your-project>/sql/new
-- 2. Paste this entire file and click Run
-- ============================================================


-- ── 1. Profiles table ────────────────────────────────────────────────────────
-- Mirrors auth.users 1-to-1. Created automatically on signup via the app.

CREATE TABLE IF NOT EXISTS profiles (
  id          BIGSERIAL    PRIMARY KEY,
  user_id     UUID         NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT         NOT NULL,
  email       TEXT         NOT NULL,
  phone       TEXT         DEFAULT '',
  role        TEXT         NOT NULL DEFAULT 'donor'
                           CHECK (role IN ('donor', 'receiver', 'hospital', 'admin')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);


-- ── 2. Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profile (called from app on signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );


-- ── 3. Auto-update updated_at ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ── 4. Optional: auto-create profile on signup via DB trigger ─────────────────
-- This is a fallback — the app also creates the profile from profileService.js.
-- Uncomment if you want the DB to guarantee profile creation even if the app fails.

/*
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'donor')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
*/
