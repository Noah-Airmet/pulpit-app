/**
 * Seed script: populates the sessions table in Supabase
 * with all known General Conference sessions from 1830 to present.
 *
 * Usage:
 *   npm run seed
 *   (requires VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env)
 *
 * Idempotent — uses upsert on the primary key (id).
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load env
const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required env vars: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

// ── Types ──────────────────────────────────────────────────────────────────────

type EraType = '1830-1844' | '1845-1850' | '1850-1879' | '1881-1896' | '1897-present'
type DifficultyType = 'easy' | 'medium' | 'hard' | 'detective-work'

interface SessionRow {
  id: string
  label: string
  conference_date: string | null
  era: EraType
  difficulty: DifficultyType
  notes?: string
}

// ── Era / difficulty assignment ────────────────────────────────────────────────

function getEra(year: number): EraType {
  if (year <= 1844) return '1830-1844'
  if (year <= 1850) return '1845-1850'
  if (year <= 1880) return '1850-1879' // intentionally includes 1880 jubilee
  if (year <= 1896) return '1881-1896'
  return '1897-present'
}

function getDifficulty(era: EraType): DifficultyType {
  switch (era) {
    case '1830-1844':  return 'hard'
    case '1845-1850':  return 'detective-work'
    case '1850-1879':  return 'medium'
    case '1881-1896':  return 'medium'
    case '1897-present': return 'easy'
  }
}

// ── Generate semiannual sessions 1848–present ─────────────────────────────────

const EXCLUDED = new Set(['1957-10']) // October 1957 cancelled (Asian flu epidemic)

function generateSemiannual(): SessionRow[] {
  const sessions: SessionRow[] = []
  const currentYear = new Date().getFullYear()

  for (let year = 1848; year <= currentYear; year++) {
    for (const month of [4, 10] as const) {
      const id = `${year}-${String(month).padStart(2, '0')}`
      if (EXCLUDED.has(id)) continue

      const monthName = month === 4 ? 'April' : 'October'
      const label = `${monthName} ${year} General Conference`
      const conferenceDate = `${year}-${String(month).padStart(2, '0')}-06`

      const era = getEra(year)
      const difficulty = getDifficulty(era)

      sessions.push({ id, label, conference_date: conferenceDate, era, difficulty })
    }
  }

  return sessions
}

// ── Load early sessions (pre-1848) ────────────────────────────────────────────

function loadEarlySessions(): SessionRow[] {
  const path = join(__dirname, '../data/early-sessions.json')
  const raw = readFileSync(path, 'utf-8')
  const data = JSON.parse(raw) as Array<{
    id: string
    label: string
    conference_date: string
    era: EraType
    difficulty: DifficultyType
    notes?: string
  }>
  return data.map(s => ({
    id: s.id,
    label: s.label,
    conference_date: s.conference_date,
    era: s.era,
    difficulty: s.difficulty,
    notes: s.notes,
  }))
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Loading sessions...')
  const early = loadEarlySessions()
  const generated = generateSemiannual()
  const all = [...early, ...generated]

  console.log(`   Early sessions (pre-1848): ${early.length}`)
  console.log(`   Generated sessions (1848–present): ${generated.length}`)
  console.log(`   Total: ${all.length}`)

  // Upsert in batches of 100
  const BATCH = 100
  let upserted = 0

  for (let i = 0; i < all.length; i += BATCH) {
    const batch = all.slice(i, i + BATCH)
    const { error } = await supabase
      .from('sessions')
      .upsert(batch, { onConflict: 'id' })

    if (error) {
      console.error(`❌ Error on batch ${Math.floor(i / BATCH) + 1}:`, error.message)
      process.exit(1)
    }
    upserted += batch.length
    console.log(`   ✓ Upserted ${upserted}/${all.length}`)
  }

  console.log(`\n✅ Done! ${all.length} sessions seeded.`)
}

seed()
