-- ============================================================
-- GC Archive — Initial Schema
-- Phase 1: Volunteer tracker (profiles + sessions)
-- Phase 2 scaffolded: talks table (no CRUD yet)
-- ============================================================

-- Enable pgvector for Phase 2 semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Anonymous'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SESSIONS
-- ============================================================
CREATE TYPE era_type AS ENUM ('1830-1844', '1845-1850', '1850-1879', '1881-1896', '1897-present');
CREATE TYPE difficulty_type AS ENUM ('easy', 'medium', 'hard', 'detective-work');
CREATE TYPE session_status AS ENUM ('unclaimed', 'in_progress', 'in_review', 'complete');

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,                    -- e.g., '1876-10'
  label TEXT NOT NULL,                    -- e.g., 'October 1876 General Conference'
  conference_date DATE,                   -- first day of conference
  era era_type NOT NULL,
  difficulty difficulty_type NOT NULL,
  status session_status DEFAULT 'unclaimed',
  claimed_by UUID REFERENCES profiles(id),
  claimed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  talk_count INTEGER,
  notes TEXT,
  drive_link TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_era ON sessions(era);
CREATE INDEX idx_sessions_claimed_by ON sessions(claimed_by);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TALKS (Phase 2 — schema only)
-- ============================================================
CREATE TABLE talks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  speaker TEXT NOT NULL,
  talk_date DATE NOT NULL,
  conference TEXT NOT NULL,
  session_label TEXT,
  session_id TEXT REFERENCES sessions(id),

  -- Source & provenance
  source_title TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT NOT NULL,
  fidelity TEXT NOT NULL,
  fidelity_notes TEXT,
  alternate_sources JSONB DEFAULT '[]',

  -- Media (1971+)
  video_url TEXT,
  audio_url TEXT,

  -- Content
  transcript_text TEXT,
  transcript_markdown TEXT,

  -- Collection metadata
  collected_by TEXT,
  collected_date DATE,
  needs_review BOOLEAN DEFAULT TRUE,
  notes TEXT,

  -- Phase 2: search
  search_vector TSVECTOR,
  embedding VECTOR(1536),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_talks_search ON talks USING GIN(search_vector);
CREATE INDEX idx_talks_speaker ON talks(speaker);
CREATE INDEX idx_talks_date ON talks(talk_date);
CREATE INDEX idx_talks_session_id ON talks(session_id);
CREATE INDEX idx_talks_fidelity ON talks(fidelity);

CREATE OR REPLACE FUNCTION talks_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.speaker, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.conference, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.transcript_text, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER talks_search_vector_trigger
  BEFORE INSERT OR UPDATE ON talks
  FOR EACH ROW EXECUTE FUNCTION talks_search_vector_update();

CREATE TRIGGER talks_updated_at
  BEFORE UPDATE ON talks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sessions are viewable by authenticated users" ON sessions
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can claim unclaimed sessions" ON sessions
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      (status = 'unclaimed') OR
      (claimed_by = auth.uid()) OR
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    )
  );

-- Talks (read-only for Phase 1)
ALTER TABLE talks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Talks are viewable by authenticated users" ON talks
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
