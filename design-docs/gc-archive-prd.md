# Pulpit, the LDS General Conference Archive — Project Requirements Document

## For Claude Code: Use this document to scaffold the full project repo.

---

## 1. Project Overview

We are building a comprehensive, searchable archive of every General Conference talk in the history of The Church of Jesus Christ of Latter-day Saints (1830–present). No unified resource like this currently exists — the church website only goes back to 1971, the BYU Scripture Citation Index to the 1940s, and earlier sources are fragmented across the Internet Archive, Journal of Discourses, Joseph Smith Papers, Utah Digital Newspapers, and various personal sites.

This is a personal/private project for a small group of friends who are LDS church history enthusiasts. The project has two phases:

**Phase 1 (MVP — build now):** A volunteer coordination app with progress tracking, plus a static landing page explaining the project and hosting the collection guide.

**Phase 2 (later):** A full-text and semantic search engine over the collected corpus, with faceted search, original source links, and fidelity metadata.

**Critical clarification on storage:** We are NOT hosting scans, images, PDFs, or video. The archive consists of plain-text transcripts (Markdown files) with metadata that *links to* original sources hosted by stable institutions (Internet Archive, BYU, the church website, Utah Digital Newspapers, Joseph Smith Papers). Even the complete corpus of every conference talk ever given is well under 500MB of text. The "heavy" media lives elsewhere.

---

## 2. Tech Stack

### Hosting & Infrastructure
- **Supabase** (Database, Auth, Realtime, hosting of API layer)
  - Supabase Postgres for all data: volunteer tracker, session index, and eventually the full talk corpus + search
  - Supabase Auth with Google OAuth for volunteer login
  - Supabase Realtime for live updates on the tracker (volunteers see each other's claims instantly)
  - Supabase has built-in Postgres full-text search (`tsvector`/`tsquery`) — this means Phase 2 search is just SQL queries against the same database, no separate search service needed
  - Supabase also has `pgvector` for Phase 2 semantic/vector search — again, same database
- **Vercel** for frontend hosting (free tier, automatic deploys from Git, works great with Vite/React)
  - Alternative: Cloudflare Pages or Netlify — all equivalent for this use case

### Why Supabase over Firebase
- Postgres full-text search is dramatically better than Firestore for Phase 2 (phrase matching, ranking, stemming, boolean queries, faceted filtering — all built in)
- `pgvector` extension means semantic search lives in the same DB, no third-party vector store
- Row-level security (RLS) policies replace Firestore security rules and are more expressive
- The entire dataset (all talks + metadata) fits in the free tier (500MB database limit)
- Real-time subscriptions work the same as Firestore listeners
- SQL is more flexible than Firestore's query model for the complex filtering the tracker needs

### Frontend
- **React** (with Vite for build tooling)
- **TypeScript**
- **Tailwind CSS** for styling
- **Supabase JS client** (`@supabase/supabase-js`) for auth, database, and realtime
- **React Router** for page routing
- Clean, readable, editorial aesthetic: serif headings, muted accent colors, generous whitespace (think: a scholarly digital humanities project, not a SaaS dashboard)
- Responsive — works on mobile since volunteers may check progress on their phones

### Future Phase 2 Additions (do not build yet, but design the schema to accommodate)
- Full-text search via Postgres `tsvector` columns on the `talks` table
- Semantic/vector search via `pgvector` extension on the `talks` table
- Talk viewer page with source links, fidelity metadata display, and alternate source comparison
- Faceted search UI (filter by speaker, date range, era, fidelity level, topic)

---

## 3. Information Architecture

### Pages

#### 3.1 Landing Page (`/`)
- Project title, brief description of what we're building and why
- Current stats (auto-calculated from Supabase): total talks collected, percentage complete by era, number of active volunteers
- Links to: Collection Guide, Volunteer Tracker, About
- The volunteer collection guide (included as a separate file in the repo — `gc-archive-volunteer-collection-guide.md`) should be rendered as a page or downloadable from here

#### 3.2 Volunteer Tracker (`/tracker`)
- **Requires authentication** (Supabase Auth, Google sign-in)
- This is the core of the MVP — a collaborative progress board

**Tracker UI:**
- Default view: a filterable table/list of all conference sessions, sorted chronologically
- Filter by: era, status, difficulty, claimed-by-me
- Each row shows: date, label, era tag, difficulty badge, status badge, claimed-by name
- **Claim button:** Sets status to `in_progress` and records the volunteer's user ID. A volunteer can only claim a session if it's `unclaimed`. Volunteers can also unclaim/release sessions they've claimed.
- **Mark complete button:** Moves status to `in_review` and prompts for `talk_count` and optional `notes` and `drive_link`. Only the person who claimed it (or an admin) can mark complete.
- **Admin role:** One or two people (project owners) can reassign, unclaim, or mark sessions as `complete` (final). Use an `is_admin` column on a `profiles` table keyed to auth UID.
- **Stats summary at top:** Total sessions, claimed, in-progress, in-review, complete. Progress bar per era.
- **Supabase Realtime subscription** on the `sessions` table so all volunteers see updates live without refreshing.

#### 3.3 Collection Guide (`/guide`)
- Renders the Markdown collection guide as a nicely formatted page
- This is the `gc-archive-volunteer-collection-guide.md` file included in the repo
- Use a Markdown renderer (e.g., `react-markdown` with `remark-gfm` for tables)

#### 3.4 About (`/about`)
- Brief page: who we are, why we're doing this, acknowledgment of sources (Church History Library, JSP, BYU, Internet Archive, Watson, etc.)
- Note that this is a private project for personal study use, not affiliated with the Church

---

## 4. Database Schema (Supabase / Postgres)

### Table: `profiles`
Auto-created on first sign-in via a trigger. Stores volunteer display info and admin flag.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on signup
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
```

### Table: `sessions`
Each row is one conference session (unit of work for volunteers).

```sql
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

-- Index for common queries
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_era ON sessions(era);
CREATE INDEX idx_sessions_claimed_by ON sessions(claimed_by);

-- Auto-update updated_at
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
```

### Table: `talks` (Phase 2 — create the table now, don't build CRUD yet)

```sql
CREATE TABLE talks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  speaker TEXT NOT NULL,
  talk_date DATE NOT NULL,
  conference TEXT NOT NULL,               -- e.g., 'October 1876 General Conference'
  session_label TEXT,                     -- e.g., 'Saturday Morning'
  session_id TEXT REFERENCES sessions(id),

  -- Source & provenance
  source_title TEXT NOT NULL,
  source_url TEXT,
  source_type TEXT NOT NULL,              -- 'original_manuscript', 'shorthand_transcription', etc.
  fidelity TEXT NOT NULL,                 -- 'verbatim', 'near_verbatim', 'edited', etc.
  fidelity_notes TEXT,

  alternate_sources JSONB DEFAULT '[]',   -- [{title, url, type}]

  -- Media (1971+)
  video_url TEXT,
  audio_url TEXT,

  -- Content
  transcript_text TEXT,                   -- plain text for search indexing
  transcript_markdown TEXT,               -- raw .md file content

  -- Collection metadata
  collected_by TEXT,
  collected_date DATE,
  needs_review BOOLEAN DEFAULT TRUE,
  notes TEXT,

  -- Phase 2: search
  search_vector TSVECTOR,                 -- auto-generated for full-text search
  embedding VECTOR(1536),                 -- for semantic search via pgvector

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index (Phase 2 — create now so schema is ready)
CREATE INDEX idx_talks_search ON talks USING GIN(search_vector);

-- Auto-generate search vector on insert/update
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

-- Other useful indexes
CREATE INDEX idx_talks_speaker ON talks(speaker);
CREATE INDEX idx_talks_date ON talks(talk_date);
CREATE INDEX idx_talks_session_id ON talks(session_id);
CREATE INDEX idx_talks_fidelity ON talks(fidelity);
```

### Row-Level Security Policies

```sql
-- Profiles: users can read all, update only their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Sessions: authenticated users can read all; update rules enforce claim logic
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sessions are viewable by authenticated users" ON sessions
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can claim unclaimed sessions" ON sessions
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND (
      -- Claiming an unclaimed session
      (status = 'unclaimed') OR
      -- Updating own claimed session
      (claimed_by = auth.uid()) OR
      -- Admin override
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    )
  );

-- Talks: read-only for now (Phase 2 will add write policies)
ALTER TABLE talks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Talks are viewable by authenticated users" ON talks
  FOR SELECT USING (auth.role() = 'authenticated');
```

### Enable Realtime

```sql
-- Enable realtime on sessions table for live tracker updates
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
```

---

## 5. Seed Data — Conference Session Index

The tracker needs to be pre-populated with every known conference session from 1830 to present. Create a seed script (`scripts/seed-sessions.ts`) that connects to Supabase and upserts all sessions.

### Rules for generating sessions:
- **1830–1831:** Conferences were called as needed. Known dates: June 9, 1830; September 26, 1830; January 2, 1831; June 3, 1831; October 25, 1831. (Hardcoded.)
- **1832–1839:** Roughly quarterly, sometimes more often. Several held in Kirtland, some in Missouri. (Hardcode from a reference file `data/early-sessions.json`.)
- **1840–1844:** Semiannual pattern established (April and October). Nauvoo era.
- **1845–1847:** Irregular due to exodus. October 1845 in Nauvoo; no conference in 1846; conferences resumed along the trail in 1847.
- **1848–present:** Semiannual (April and October) with very few exceptions. **October 1957 was cancelled** (Asian flu epidemic — do not create a session for it).
- **Generate April and October sessions for 1848–present** unless specifically excluded.

### Era and difficulty assignments:
| Era | Dates | Difficulty |
|-----|-------|-----------|
| `1830-1844` | 1830–1844 | `hard` |
| `1845-1850` | 1845–1850 | `detective-work` |
| `1850-1879` | 1850–1879 (including the 1880 jubilee report) | `medium` |
| `1881-1896` | 1881–1896 | `medium` |
| `1897-present` | 1897–present | `easy` |

The seed script should:
1. Read hardcoded early sessions from `data/early-sessions.json`
2. Generate semiannual sessions from 1848–present
3. Upsert into Supabase (use `id` as the unique key so it's idempotent)
4. Use the Supabase JS client with a service role key (for seeding only)

---

## 6. Design Direction

### Visual Identity
- **Editorial/scholarly aesthetic.** Think: a well-designed digital humanities project, or a university press website.
- Serif font for headings (e.g., Playfair Display, Lora, or Merriweather from Google Fonts)
- Clean sans-serif for body text (e.g., Inter, Source Sans Pro)
- Muted color palette: deep navy or charcoal for text, a warm accent color (muted gold, terracotta, or deep teal), cream or off-white backgrounds
- Generous whitespace, clear typography hierarchy
- No flashy animations, no SaaS-style gradients, no stock photography

### Tracker UI Style
- The tracker should feel like a well-organized research tool, not a project management app
- Status badges should be subtle (filled pills with muted colors, not bright Trello-style labels)
- Era sections could use a timeline or accordion layout
- Progress bars should be understated — thin, muted color fills

---

## 7. Repo Structure

```
gc-archive/
├── README.md                          # Project overview, setup instructions
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json                        # Vercel config (SPA rewrites)
├── .env.example                       # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── public/
│   └── gc-archive-volunteer-collection-guide.md
├── scripts/
│   ├── seed-sessions.ts               # Supabase seed script for conference sessions
│   └── README.md                      # How to run the seed script
├── data/
│   ├── early-sessions.json            # Hardcoded pre-1848 conference dates
│   └── README.md                      # Explains data sources for session dates
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql     # All CREATE TABLE, RLS, triggers from Section 4
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── lib/
│   │   └── supabase.ts                # Supabase client initialization
│   ├── types/
│   │   ├── database.ts                # TypeScript types matching the Postgres schema
│   │   └── index.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   ├── tracker/
│   │   │   ├── TrackerBoard.tsx        # Main tracker view with filters + stats
│   │   │   ├── SessionRow.tsx          # Individual session row with claim/complete buttons
│   │   │   ├── StatsBar.tsx            # Summary stats + progress bars by era
│   │   │   ├── FilterControls.tsx      # Filter by era, status, difficulty, my-claims
│   │   │   └── ClaimModal.tsx          # Modal for claiming / completing a session
│   │   ├── guide/
│   │   │   └── GuideRenderer.tsx       # Renders the markdown collection guide
│   │   └── auth/
│   │       ├── AuthProvider.tsx        # Supabase Auth context
│   │       └── ProtectedRoute.tsx      # Route wrapper requiring auth
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Tracker.tsx
│   │   ├── Guide.tsx
│   │   └── About.tsx
│   ├── hooks/
│   │   ├── useAuth.ts                 # Auth hook (wraps Supabase auth)
│   │   ├── useSessions.ts            # Realtime subscription to sessions table
│   │   └── useSessionActions.ts      # Claim, unclaim, complete actions
│   └── styles/
│       └── globals.css                # Tailwind base + custom font imports
└── docs/
    ├── PRD.md                         # This document
    └── collection-guide.md            # Copy of the volunteer guide
```

---

## 8. MVP Feature Priorities

### Must Have (build first)
1. Supabase project setup: schema migration, RLS policies, Google OAuth provider
2. Vite + React + TypeScript + Tailwind project scaffolding
3. Supabase Auth integration with Google sign-in
4. Landing page with project description and live stats from Supabase
5. Tracker page with full session list, filtering, claim/complete workflow
6. Realtime subscriptions so volunteers see each other's claims instantly
7. Seed script that populates all conference sessions
8. Collection guide rendered as a page (Markdown → HTML)
9. About page
10. Deploy to Vercel

### Should Have (build if time allows)
1. Per-era progress bars on the landing page (query: `SELECT era, status, COUNT(*) FROM sessions GROUP BY era, status`)
2. "My Claims" quick-filter on the tracker
3. Admin override capability (unclaim/reassign) gated by `profiles.is_admin`
4. Activity log or recent claims feed on the landing page
5. Download collection guide as raw `.md` file

### Won't Have (Phase 2)
1. Talk ingestion / CRUD
2. Full-text search (schema is ready — just need the UI and the ingestion pipeline)
3. Semantic search with pgvector
4. Talk viewer with source scans and alternate source comparison
5. Public (unauthenticated) access

---

## 9. Phase 2 Search Architecture (reference only — do not build yet)

When Phase 2 arrives, the search system is already scaffolded in the database:

**Full-text search** is handled by the `search_vector` column on `talks`, which auto-updates via trigger. A search query is just:
```sql
SELECT speaker, talk_date, conference, 
       ts_headline('english', transcript_text, query) AS snippet,
       ts_rank(search_vector, query) AS rank
FROM talks, plainto_tsquery('english', 'law of consecration') AS query
WHERE search_vector @@ query
  AND talk_date BETWEEN '1850-01-01' AND '1870-12-31'
  AND fidelity IN ('verbatim', 'near_verbatim')
ORDER BY rank DESC
LIMIT 20;
```

**Semantic search** uses the `embedding` column (1536-dim vector, matching OpenAI or similar embeddings). Query:
```sql
SELECT speaker, talk_date, conference,
       1 - (embedding <=> '[query_embedding]') AS similarity
FROM talks
WHERE embedding IS NOT NULL
ORDER BY embedding <=> '[query_embedding]'
LIMIT 20;
```

**Hybrid search** combines both, weighting keyword relevance and semantic similarity. This is a solved pattern in Supabase's documentation.

No additional services or infrastructure needed. It's all Postgres.

---

## 10. Context & Background

### The Five Collection Stages (by difficulty)

1. **1897–present (Easy):** Official Conference Reports scanned on Internet Archive (400 PPI, OCR available). Church website has digital text from 1971+ with video/audio. Volunteers download OCR text or copy from church site.

2. **1881–1896 (Medium):** No standalone Conference Reports. Sources: Journal of Discourses (through 1886), Deseret News on Utah Digital Newspapers, Watson's site as finding aid.

3. **1850–1879 (Medium):** Journal of Discourses (1854–1886) + Deseret News. Must cross-reference JD entries against conference dates to separate conference talks from regular sermons.

4. **1830–1844 (Hard):** Joseph Smith Papers website has transcribed conference minutes with manuscript images. Multiple parallel versions of same conferences often available. JSP has a Calendar of Documents and a Discourses database for finding conference-related documents.

5. **1845–1850 (Detective Work):** Most fragmentary era. No JD, no Conference Reports, no JSP coverage. Sources: Journal History of the Church, Wilford Woodruff Papers, Times and Seasons (through Feb 1846), Millennial Star, Deseret News (from June 1850).

### Why This Project Exists (Differentiators)
- **ChurchofJesusChrist.org:** Only back to 1971
- **BYU Scripture Citation Index:** Only back to ~1942
- **BYU General Conference Corpus (lds-general-conference.org):** Back to 1851, but terrible UX, limited search, no source scans, no provenance metadata
- **Internet Archive:** Has the scans but zero organization or search
- **Watson (eldenwatson.net):** Back to 1830, but normalized text, no scans, personal website that could disappear
- **Our differentiator:** Unified, searchable, with honest provenance metadata (fidelity ratings, links to original sources, alternate source tracking), and eventually both keyword and semantic search

---

## 11. For Claude Code

When setting up this repo:

1. Initialize a Vite + React + TypeScript project with Tailwind CSS
2. Create the Supabase migration file with the full schema from Section 4
3. Create all TypeScript types matching the Postgres schema
4. Set up Supabase client initialization (`src/lib/supabase.ts`) reading from env vars
5. Implement Supabase Auth with Google sign-in (AuthProvider context + ProtectedRoute wrapper)
6. Build the page routing with React Router
7. Build the tracker UI with Supabase Realtime subscriptions on `sessions`
8. Implement claim/unclaim/complete actions as Supabase update calls
9. Create the seed script for conference sessions (reads `data/early-sessions.json` + generates 1848–present)
10. Build the landing page with live stats (query sessions table for counts by status/era)
11. Build the guide page (render Markdown with react-markdown + remark-gfm)
12. Build the about page
13. Create `.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
14. Create `vercel.json` with SPA rewrite rules
15. Write a clear README with: Supabase project creation steps, how to run the migration, how to enable Google OAuth in Supabase dashboard, how to set env vars, how to run the seed script, how to deploy to Vercel

The human's name is Noah. He's a cybersecurity student at BYU with full-stack development experience including React, and he uses AI-assisted development tools (Cursor, Claude Code, Antigravity). He has a Supabase MCP connector already configured. He'll be able to handle Supabase setup and deployment — just give him clear instructions in the README.
