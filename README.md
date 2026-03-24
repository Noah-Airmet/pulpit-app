# Pulpit — LDS General Conference Archive

A volunteer coordination app for building a comprehensive, searchable archive of every General Conference talk from 1830 to present.

**Phase 1 (this app):** Volunteer tracker + landing page + collection guide
**Phase 2 (future):** Full-text and semantic search over the collected corpus

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase project

The Supabase project (`gc-archive`) has already been created. Credentials are in `.env`.

If setting up fresh, get your keys from **Supabase Dashboard → Project Settings → API**:
- `VITE_SUPABASE_URL` — Project URL
- `VITE_SUPABASE_ANON_KEY` — anon/public key

Copy `.env.example` to `.env` and fill in the values.

### 3. Run the database migration

The schema is already applied via the Supabase MCP. If you need to re-apply manually,
run the SQL in `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor.

### 4. Enable Google OAuth

In the Supabase Dashboard:

1. Go to **Authentication → Providers → Google**
2. Enable the Google provider
3. Create a Google OAuth app at [console.cloud.google.com](https://console.cloud.google.com):
   - Authorized JavaScript origins: `https://your-project.vercel.app` and `http://localhost:5173`
   - Authorized redirect URIs: `https://jkefxmwrtsphgiwwaprw.supabase.co/auth/v1/callback`
4. Copy the **Client ID** and **Client Secret** into the Supabase Google provider settings
5. Save

### 5. Seed conference sessions

Get your **service role key** from Supabase Dashboard → Project Settings → API, add it to `.env`:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Then run:

```bash
npm run seed
```

This populates all ~400+ conference sessions from 1830 to present. Safe to run multiple times.

### 6. Make yourself an admin (optional)

After signing in for the first time, run this SQL in the Supabase SQL editor to grant admin access:

```sql
UPDATE profiles SET is_admin = TRUE WHERE id = auth.uid();
```

Or from the Table Editor: find your row in `profiles` and flip `is_admin` to `true`.

---

## Development

```bash
npm run dev
```

Site runs at [http://localhost:5173](http://localhost:5173).

---

## Deploy to Vercel

### First deploy

```bash
npx vercel
```

Follow the prompts. When asked about framework, select **Vite**.

### Set environment variables

In the Vercel dashboard (or via CLI):

```bash
npx vercel env add VITE_SUPABASE_URL
npx vercel env add VITE_SUPABASE_ANON_KEY
```

These need to be set for **Production**, **Preview**, and **Development**.

### Production deploy

```bash
npx vercel --prod
```

### Auto-deploys

Connect the GitHub repo in Vercel for automatic deploys on every push to `main`.

---

## Repo Structure

```
pulpit-app/
├── data/
│   ├── early-sessions.json     # Hardcoded pre-1848 conference dates
│   └── README.md
├── design-docs/                # Source design documents (not served)
├── public/
│   └── volunteer-guide.md      # Served as static file for the Guide page
├── scripts/
│   ├── seed-sessions.ts        # Populates sessions table
│   └── README.md
├── src/
│   ├── components/
│   │   ├── auth/               # AuthProvider, ProtectedRoute
│   │   ├── layout/             # Header, Footer, Layout
│   │   └── tracker/            # TrackerBoard, SessionRow, ClaimModal, etc.
│   ├── hooks/                  # useSessions, useSessionActions, useAuth
│   ├── lib/                    # supabase.ts client
│   ├── pages/                  # Home, Tracker, Guide, About
│   ├── styles/                 # globals.css (Tailwind v4 + design tokens)
│   └── types/                  # TypeScript types matching DB schema
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql
```

---

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for the full schema.

Key tables:
- `profiles` — auto-created on first sign-in via trigger
- `sessions` — conference sessions (the unit of work for volunteers)
- `talks` — Phase 2 schema, empty for now

Realtime is enabled on `sessions` — all connected clients see claim/complete updates live.
