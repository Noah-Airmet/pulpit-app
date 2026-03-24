# Scripts

## `seed-sessions.ts`

Populates the `sessions` table in Supabase with all known General Conference sessions
from 1830 to present.

### Requirements

You need the Supabase **service role key** (not the anon key). Get it from:
**Supabase Dashboard → Project Settings → API → service_role secret**

Add it to your `.env` file:
```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

The `VITE_SUPABASE_URL` must also be set (it's already in `.env` from project setup).

### Run

```bash
npm run seed
```

This runs `tsx --env-file=.env scripts/seed-sessions.ts`.

### What it does

1. Reads `data/early-sessions.json` (pre-1848 hardcoded sessions)
2. Generates semiannual April + October sessions for 1848 through the current year
3. Applies era and difficulty assignments per the project rules
4. Upserts all sessions into Supabase (idempotent — safe to run multiple times)

**Special cases handled:**
- October 1957: skipped (conference cancelled due to Asian flu epidemic)
- 1846: no session (exodus year; no conference was held)

### Re-seeding

The script is fully idempotent. Running it again will update existing sessions with the
same data and add any new sessions (e.g., when a new year's conferences are added).
It will NOT overwrite claim status, notes, or drive links.
