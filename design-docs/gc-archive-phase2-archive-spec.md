# Pulpit GC Archive — Phase 2: Archive & Search Specification

## Status: Planning
## Author: Noah Airmet
## Last updated: 2026-03-24

---

## 1. What Phase 2 Is

Phase 1 built the volunteer coordination tool — the tracker, claim workflow, and ingestion pipeline. Phase 2 is the product that was always the point: a publicly browsable, searchable archive of every General Conference talk ever given.

The database schema was designed for this from the start. The `talks` table has:
- `search_vector TSVECTOR` — already indexed with a GIN index, auto-updated by trigger on insert/update
- `speaker`, `talk_date`, `conference`, `session_id` — all indexed for faceted filtering
- `fidelity`, `source_type`, `source_url` — provenance metadata, first-class fields
- `transcript_markdown` — the full original file, stored verbatim

Nothing new is needed in the database schema for Phase 2 core features. Semantic search (pgvector + embeddings) is a stretch goal and is deferred to Phase 3.

---

## 2. New Pages

### 2.1 Archive Browser (`/archive`)

The main entry point for site visitors. Browse the corpus by filtering and sorting.

**Primary layout:**
- Two-column on desktop: narrow left sidebar with filters, main content area with talk list
- Single column on mobile: filters collapse into a "Filters" button/drawer at top

**Left sidebar — filters:**
- **Era:** pill buttons (All | 1830-1844 | 1845-1850 | 1850-1879 | 1881-1896 | 1897-present)
- **Conference:** dropdown or search-as-you-type input (e.g. "April 2025")
- **Speaker:** text input with autocomplete from distinct speaker values in DB
- **Fidelity:** checkboxes (verbatim | near_verbatim | edited | summary | reconstructed | normalized)
- **Date range:** two year inputs (From / To), optional
- Active filter count badge on the "Filters" button when collapsed on mobile

**Main content area:**
- **Sort controls:** dropdown — "Newest first" (default) | "Oldest first" | "Speaker A–Z" | "Relevance" (only when searching)
- **Result count:** "Showing 34 talks" in IBM Plex Mono, small, muted
- **Talk cards** (see below)
- **Pagination:** 50 talks per page, simple prev/next with page number. No infinite scroll — this is a research tool, not a feed.

**Talk card (in list):**
Each card is a horizontal row. Dense but not cramped — this is a reference list, not a reading view.
```
[ Date ]   [ Speaker ]                  [ Talk Title ]              [ Fidelity badge ]
Oct 1876   Brigham Young                The Law of Consecration     NEAR VERBATIM
           October 1876 General Conference · Saturday Morning
```
- Date: IBM Plex Mono, muted
- Speaker: Newsreader, slightly prominent
- Title: Source Serif 4, linked to the talk viewer
- Session label: small, tertiary
- Fidelity badge: colored pill per the design spec's fidelity color system — this is the distinguishing feature
- Clicking anywhere on the row navigates to `/talk/:id`
- No action buttons on this view — it's read-only

**Empty state:** *"No talks match your current filters."* in Source Serif italic, centered.

**Supabase query pattern:**
```typescript
supabase
  .from('talks')
  .select('id, speaker, talk_date, conference, session_label, source_title, fidelity')
  .eq('status', 'approved')           // only show approved talks
  .eq('needs_review', false)          // and not pending review
  .gte('talk_date', fromDate)
  .lte('talk_date', toDate)
  .ilike('speaker', `%${speakerQuery}%`)
  .in('fidelity', selectedFidelities)
  .order('talk_date', { ascending: false })
  .range(offset, offset + 49)
```

---

### 2.2 Talk Viewer (`/talk/:id`)

The reading view for a single talk. This is the product's most important page — where the scholarly value lives.

**Layout:**
- Two-column on desktop: main content (transcript, ~780px wide) + right sidebar (provenance metadata)
- Single column on mobile: metadata collapses below the transcript

**Main content — left/center:**
1. **Talk header:**
   - Speaker name: Newsreader, large (h1-level visually)
   - Talk title: Newsreader italic, slightly smaller
   - Conference + session label: IBM Plex Mono, muted
   - Date: IBM Plex Mono, muted
   - Fidelity badge: prominent, colored, with a short plain-English explanation (see below)

2. **Transcript:**
   - Rendered from `transcript_markdown` using react-markdown + remark-gfm
   - Source Serif 4 at 1.125rem, line-height 1.7
   - Max-width 780px — optimal for reading
   - Block quotes styled with left border in `--color-accent-light`
   - No JS-powered "read aloud" or annotation — keep it simple

3. **Navigation footer:**
   - "← Previous talk in session" and "Next talk in session →"
   - Previous/next by session + talk order (sorted by talk_date, then speaker)

**Right sidebar — provenance:**
This is the differentiator. No other archive shows this.

- **Fidelity rating** (large, colored):
  ```
  VERBATIM
  Copied directly from the Church website. Matches the spoken and published text.
  ```
  Each fidelity level has a canonical plain-English description (see Fidelity Reference below).

- **Source:**
  - Source type (e.g. "Church website", "Journal of Discourses", "shorthand transcription")
  - Link to original: "View original source →" as an external link
  - Collected by: volunteer name + date collected

- **Fidelity notes:** (if any) — free-text field from the collector. If it says "No notes." hide it.

- **Alternate sources:** (if any — stored in `alternate_sources JSONB`) — list of additional sources with links

- **Session context:** link to browse other talks from this same session

**Fidelity color reference:**
| Value | Color | Plain-English Description |
|---|---|---|
| `verbatim` | Deep green | Copied directly from an official source. Matches spoken and/or published text. |
| `near_verbatim` | Medium green | Minor transcription differences (punctuation, minor edits). Faithful to the original. |
| `edited` | Dark goldenrod | The published version was editorially revised from what was spoken. |
| `summary` | Orange-brown | A summary or abstract rather than the full talk. Significant content may be missing. |
| `reconstructed` | Sienna | Assembled from partial or secondary sources. Treat as approximate. |
| `normalized` | Dark yellow | Original language was modernized or normalized. Period characteristics may be lost. |

---

### 2.3 Search (`/search`)

A dedicated search page. Not a dropdown or overlay — a full page, because this is the primary research workflow for a serious user.

**Structure:**
1. **Search bar:** Large, prominent, centered at top. Searches `search_vector` (full-text) across speaker + conference + transcript.
2. **Result filters (below bar):** Same filter sidebar as `/archive`, but "Relevance" is now the default sort.
3. **Result list:** Same talk card format as `/archive`, but with a **snippet** — a 1–2 sentence excerpt highlighting the matched terms (generated by Postgres `ts_headline()`).
4. **Empty state:** If no results, suggest broadening filters or alternative phrasing.

**Supabase query with full-text search:**
```sql
SELECT id, speaker, talk_date, conference, source_title, fidelity,
       ts_headline('english', transcript_text, query, 'MaxWords=30, MinWords=15') AS snippet,
       ts_rank(search_vector, query) AS rank
FROM talks, plainto_tsquery('english', $searchTerm) AS query
WHERE search_vector @@ query
  AND needs_review = false
ORDER BY rank DESC
LIMIT 50 OFFSET $offset;
```

This is a raw SQL query via `supabase.rpc()` or the Supabase JS client's `.textSearch()` method.

**Search tips:** Below the search bar, a small inline help block in Source Serif italic:
- *"Use quotes for phrases: "law of consecration""*
- *"Combine terms: faith repentance*"
- *"Filter by speaker or era using the options on the left"*

---

## 3. Navigation Update

Add **"Archive"** as the third nav item:

```
Home    Tracker    Archive    Guide    About
```

The `Review` tab (currently in nav for admins) should be admin-only and not shown in the main nav. Move it to a header dropdown under the user avatar for admin users.

---

## 4. Access Control

Currently the `talks` RLS policy is:
```sql
CREATE POLICY "Talks are viewable by authenticated users" ON talks
  FOR SELECT USING (auth.role() = 'authenticated');
```

For Phase 2 the archive needs to be publicly accessible (unauthenticated). Two options:

**Option A — Open everything to anon:**
Change the RLS policy to also allow `anon` role:
```sql
DROP POLICY "Talks are viewable by authenticated users" ON talks;
CREATE POLICY "Approved talks are publicly viewable" ON talks
  FOR SELECT USING (
    needs_review = false
    -- OR auth.role() = 'authenticated'  -- uncomment to also show in-review talks to logged-in users
  );
```
Simplest. The archive is a public resource; keeping it gated doesn't serve the project's mission.

**Option B — Keep archive auth-required for now:**
No policy change needed. Add a prompt to sign in with Google on the archive pages for unauthenticated visitors.

**Recommendation: Option A.** The whole point is to make this a public reference. Auth gating the reading experience makes no sense. The tracker (write operations) stays auth-required — that's handled by different policies.

---

## 5. Tracker Integration — Session Completion from Ingested Talks

**The problem:** When talks are ingested directly via `npm run ingest` (bypassing the volunteer workflow), the corresponding session row in `sessions` stays `unclaimed` forever. The progress tracker is misleading — April 2025 has 34 talks but shows 0% complete.

**Options:**

**Option A — Update session status automatically on ingest:**
Modify `ingest-talks.ts` to also update the `sessions` table after a successful batch upsert:
```typescript
// After upserting talks, mark the session complete
await supabase
  .from('sessions')
  .update({ status: 'complete', talk_count: rows.length, completed_at: new Date().toISOString() })
  .eq('id', sessionId)
```
Simple, but only works cleanly when an entire session is ingested in one run.

**Option B — Derived status from talks count:**
Add a computed field or view that shows "has talks" separately from the volunteer workflow status. The tracker could show a separate indicator: "34 talks ingested" even if status is `unclaimed`.
More complex, but more honest about the data model.

**Option C — Manual admin update:**
Admin runs a SQL update after ingesting:
```sql
UPDATE sessions SET status = 'complete', talk_count = 34
WHERE id = '2025-04';
```
No code changes needed. Works for now when ingestion is manual and occasional.

**Recommendation: Option A for any future ingestion runs; Option C right now for April 2025** since it's already been ingested. The ingest script should be updated to optionally auto-mark sessions complete.

---

## 6. New Hooks and Components

### Hooks
- `useTalks(filters)` — paginated query to `talks` table with filter params (already exists in `src/hooks/useTalks.ts` — verify its current state)
- `useTalk(id)` — single talk by UUID
- `useSearch(query, filters)` — full-text search via Supabase RPC or `.textSearch()`

### Pages
- `src/pages/Archive.tsx` — browse page
- `src/pages/TalkViewer.tsx` — single talk viewer
- `src/pages/Search.tsx` — search page

### Components
- `src/components/archive/TalkCard.tsx` — the list row card
- `src/components/archive/ArchiveFilters.tsx` — filter sidebar
- `src/components/archive/FidelityBadge.tsx` — colored fidelity pill with tooltip (reusable)
- `src/components/archive/ProvenanceSidebar.tsx` — right sidebar for the talk viewer
- `src/components/archive/SearchBar.tsx` — the search input

---

## 7. Build Order

Build in this order to ship value incrementally:

1. **RLS policy update** — open talks to anon read (2 min SQL change)
2. **`/archive` browse page** — filter + list, no search yet
3. **`/talk/:id` viewer** — transcript + provenance sidebar
4. **Nav update** — add Archive, move Review to admin dropdown
5. **Tracker fix** — Option C SQL for April 2025, Option A code update for future ingests
6. **`/search` page** — full-text search with snippets

Steps 1–4 can ship as a unit. Step 6 is independent and can follow.

---

## 8. Out of Scope for Phase 2

- **Semantic/vector search** (pgvector + embeddings) — Phase 3
- **Alternate source comparison view** — Phase 3
- **Talk annotations or comments** — not planned
- **Download/export** — not planned
- **Dark mode** — deferred per the original design spec
- **User-facing ingestion** (volunteers submitting directly through UI) — Phase 3; for now, ingestion is admin-only via the ingest script

---

## 9. Key Design Principles for Phase 2

The same principles from `gc-archive-frontend-design-spec.md` apply. Specifically for the archive:

- **Fidelity is the differentiator.** Every talk must show its fidelity badge, prominently. This is what makes this archive different from lds-general-conference.org and Watson's site.
- **The transcript is the product.** The talk viewer should be a calm, readable page. No clutter. The provenance sidebar is important but secondary to the reading experience.
- **Speed over features.** The browse and search queries hit well-indexed columns. Don't add features that require unindexed full-table scans.
- **A historian should feel comfortable using this.** Source citations, fidelity caveats, and links to originals are not optional.
