# Phase 2 Build Handoff — Pulpit GC Archive

You are picking up an existing project mid-build. Read this entire document before touching any code.

---

## What This Project Is

A scholarly archive of every LDS General Conference talk from 1830 to present — "Every General Conference Talk, 1830 to Present." Built by Noah Airmet and friends as a private research tool. The distinguishing feature is honest **provenance metadata** (fidelity ratings, source links, collector info) — no other resource does this.

**Live site:** https://pulpit-app.vercel.app
**Supabase project:** `gc-archive` (ID: `jkefxmwrtsphgiwwaprw`, URL: `https://jkefxmwrtsphgiwwaprw.supabase.co`)

---

## What Has Been Built (Phase 1)

- Full Supabase backend: `profiles`, `sessions`, `talks` tables with RLS, realtime on `sessions`
- Google OAuth via Supabase Auth
- Vite + React + TypeScript + React Router frontend
- Pages: Home (`/`), Tracker (`/tracker`), Session Detail, Talk Editor, Review Queue, Guide (`/guide`), About (`/about`)
- Volunteer tracker: claim/unclaim sessions, mark complete, realtime updates
- Ingest script (`npm run ingest`) that bulk-imports scraped `.md` files into the `talks` table
- 387 sessions seeded (1830–2026); 34 talks from April 2025 already ingested

**What does NOT exist yet:** any public-facing archive — no browse page, no talk viewer, no search, no Archive nav tab.

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite, styled with inline CSS (not Tailwind — the project uses CSS custom properties defined in globals.css)
- **Router:** React Router v6 (`BrowserRouter`, `Routes`, `Route`)
- **Database/Auth:** Supabase JS client (`@supabase/supabase-js`)
- **Fonts:** Newsreader (display), Source Serif 4 (body), IBM Plex Mono (metadata), Inter (UI) — loaded from Google Fonts
- **Deploy:** Vercel (auto-deploys from git push to main)

**Important:** The project uses inline `style={{}}` props throughout, not Tailwind classes. Follow that pattern. CSS custom properties like `var(--color-ink)`, `var(--font-display)`, `var(--shadow-sm)` are already defined globally. Use them.

---

## Key Files to Read Before Writing Code

Read these before starting:

| File | Why |
|---|---|
| `src/App.tsx` | Current route list — you'll be adding to this |
| `src/types/index.ts` | TypeScript types — `Talk`, `Session`, etc. |
| `src/lib/supabase.ts` | Supabase client initialization |
| `src/components/layout/Header.tsx` | Nav bar — you'll add the Archive link here |
| `src/hooks/useTalks.ts` | Existing talks hook (scoped to sessionId — NOT reusable for archive; write new hooks) |
| `src/pages/Home.tsx` | Example of a full page using Supabase data with the correct style patterns |
| `src/components/tracker/SessionRow.tsx` | Example of a list row component with the correct style patterns |
| `design-docs/gc-archive-frontend-design-spec.md` | Full visual/design spec — follow this for all styling decisions |
| `design-docs/gc-archive-phase2-archive-spec.md` | **The Phase 2 spec — your primary build instructions** |

---

## Your Task: Build Phase 2

Follow the build order in `design-docs/gc-archive-phase2-archive-spec.md` Section 7:

### Step 1 — RLS Policy Update (do this first, via Supabase MCP)

The current `talks` table policy only allows authenticated users to read. Change it to allow public (anon) read for approved talks:

```sql
DROP POLICY "Talks are viewable by authenticated users" ON talks;
CREATE POLICY "Approved talks are publicly viewable" ON talks
  FOR SELECT USING (needs_review = false);
```

Run this via the Supabase MCP `execute_sql` tool or in the Supabase dashboard SQL editor.

### Step 2 — Tracker Fix (do this second, via Supabase MCP)

April 2025 was already ingested (34 talks) but the session row still shows `unclaimed`. Fix it:

```sql
UPDATE sessions
SET status = 'complete', talk_count = 34, completed_at = NOW()
WHERE id = '2025-04';
```

Also update `scripts/ingest-talks.ts` to auto-mark sessions complete after ingesting. After the upsert loop completes, derive the `session_id` from the ingested rows and do:
```typescript
const sessionIds = [...new Set(rows.map(r => r.session_id).filter(Boolean))]
for (const sid of sessionIds) {
  const count = rows.filter(r => r.session_id === sid).length
  await supabase
    .from('sessions')
    .update({ status: 'complete', talk_count: count, completed_at: new Date().toISOString() })
    .eq('id', sid)
}
```

### Step 3 — `/archive` Browse Page

Create `src/pages/Archive.tsx` and `src/components/archive/` directory.

Components to create:
- `src/components/archive/TalkCard.tsx` — a horizontal list row showing: date (mono), speaker, title (linked), fidelity badge
- `src/components/archive/FidelityBadge.tsx` — a reusable colored pill. The fidelity color system is in the design spec (Section 5.2 of the frontend spec)
- `src/components/archive/ArchiveFilters.tsx` — filter sidebar: era pills, speaker text input, fidelity checkboxes, date range inputs

The archive page should:
- Query `talks` filtered by `needs_review = false` (now readable by anon)
- Support filters: era (derived from talk_date), speaker (ilike), fidelity (in), date range
- Default sort: newest first
- Paginate 50 per page
- Be accessible without login

Write a new hook `src/hooks/useArchiveTalks.ts` that accepts filter params and returns paginated results. Do NOT reuse the existing `useTalks` hook — it's scoped to session-level realtime and isn't appropriate here.

### Step 4 — `/talk/:id` Talk Viewer

Create `src/pages/TalkViewer.tsx`.

- Route: `/talk/:id` (UUID)
- Left/main: render `transcript_markdown` using `react-markdown` + `remark-gfm` (already in dependencies — check `package.json`)
- Right sidebar: `src/components/archive/ProvenanceSidebar.tsx` — shows fidelity badge + description, source type, source URL link, collected_by + collected_date, fidelity_notes (if not null/empty)
- Footer nav: "← Previous talk in session" / "Next talk in session →" — query talks with same `session_id` ordered by `talk_date`, find prev/next

Write a new hook `src/hooks/useTalk.ts` that fetches a single talk by UUID.

### Step 5 — Nav Update

Edit `src/components/layout/Header.tsx`:
- Add "Archive" as a nav link pointing to `/archive` — insert it between "Tracker" and "Guide"
- The "Review" link is currently always visible in the nav. Move it so it only shows for admin users. Check how `useAuth` exposes the profile — there should be an `is_admin` field. If not, you may need to update the auth hook to also fetch the profile.

### Step 6 — Routes

Edit `src/App.tsx` to add:
```tsx
import { Archive } from './pages/Archive'
import { TalkViewer } from './pages/TalkViewer'
// ...
<Route path="/archive" element={<Archive />} />
<Route path="/talk/:id" element={<TalkViewer />} />
```

### Step 7 — `/search` Page (build last)

Create `src/pages/Search.tsx`.

This uses Postgres full-text search. The `talks` table already has a `search_vector TSVECTOR` column with a GIN index and a trigger that keeps it updated. Use Supabase's `.textSearch()` method:

```typescript
supabase
  .from('talks')
  .select('id, speaker, talk_date, conference, source_title, fidelity, transcript_text')
  .textSearch('search_vector', query, { type: 'plain', config: 'english' })
  .eq('needs_review', false)
  .order('talk_date', { ascending: false })
  .range(0, 49)
```

For snippets, you'll need a Postgres function exposed via `supabase.rpc()` since `ts_headline()` isn't available through the JS client directly. Either skip snippets for now (show the first 200 chars of `transcript_text` instead), or create an RPC function in Supabase.

The search page shares the same filter sidebar as `/archive`. The search bar is an `<input>` at the top — debounce the query by 300ms before firing.

---

## Important Constraints

1. **Style with inline `style={{}}` props** — not Tailwind, not CSS modules. Use `var(--color-*)`, `var(--font-*)`, `var(--shadow-*)` custom properties as seen in existing components.
2. **No new dependencies without checking first.** `react-markdown` and `remark-gfm` are likely already installed — verify in `package.json` before adding.
3. **Do not modify the `sessions` table schema or the tracker workflow.** Phase 2 is additive.
4. **The `talks` RLS policy change is the unlock.** Without it, archive pages won't load for logged-out users.
5. **`transcript_markdown` stores the full original `.md` file including frontmatter.** When rendering, strip the YAML frontmatter before passing to react-markdown, or use `gray-matter` (already a dependency — it's used by the ingest script) to parse it and render only the content portion.
6. **Speaker names are stored exactly as they appear in the frontmatter** (e.g. `"D. Todd Christofferson"`, `"Benjamin M. Z. Tai"`, `"Hans T. Boom"`). Do not normalize or reformat them.

---

## Design Reference: Fidelity Colors

These are already defined in globals.css as CSS custom properties:

| Fidelity value | CSS var | Hex | Description |
|---|---|---|---|
| `verbatim` | `--fidelity-verbatim` | `#2d6a4f` | Copied directly from official source |
| `near_verbatim` | `--fidelity-near` | `#4a7c59` | Minor transcription differences |
| `edited` | `--fidelity-edited` | `#b8860b` | Editorially revised from spoken |
| `summary` | `--fidelity-summary` | `#c17817` | Summary, not full talk |
| `reconstructed` | `--fidelity-reconstructed` | `#a0522d` | Assembled from partial sources |
| `normalized` | `--fidelity-normalized` | `#8b6914` | Language was modernized |

The `FidelityBadge` component should render a small pill with background at 15% opacity and full-color text, matching the badge pattern used throughout the tracker.

---

## Questions to Resolve Before Building (Ask Noah)

1. Should the archive and talk viewer be accessible without login, or require Google sign-in? The design doc recommends **public access** (Option A, change RLS to anon). Confirm before updating RLS.
2. Should the `/search` page be built in this session or deferred? It can ship independently after the browse + viewer.

---

## Current State of `talks` Table

As of 2026-03-24, the `talks` table contains:
- **34 rows** — all from April 2025 General Conference
- All have `needs_review = false`, `status = 'approved'`, `fidelity = 'verbatim'`
- Collected by Samuel Baird, 2026-03-23

The `search_vector` column is auto-populated by trigger on insert, so full-text search is already working on these 34 rows.
