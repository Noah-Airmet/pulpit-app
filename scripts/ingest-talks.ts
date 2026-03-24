/**
 * Ingest script: bulk-import scraped talk .md files into the talks table.
 *
 * Usage:
 *   npm run ingest -- /path/to/talks/directory
 *
 * Each .md file must have YAML frontmatter with at minimum:
 *   speaker, date, conference, source_title, source_type, fidelity
 *
 * Talks are inserted with status='approved' and needs_review=false —
 * bypassing the volunteer review queue since this data is scraped from
 * known-good sources (church website, official reports).
 *
 * Safe to re-run: upserts on (speaker, talk_date, conference).
 */

import { createClient } from '@supabase/supabase-js'
import matter from 'gray-matter'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

// ── Env ────────────────────────────────────────────────────────────────────────

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required env vars: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})

// ── Args ───────────────────────────────────────────────────────────────────────

const inputDir = process.argv[2]
if (!inputDir) {
  console.error('Usage: npm run ingest -- /path/to/talks/directory')
  process.exit(1)
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function findMarkdownFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...findMarkdownFiles(full))
    } else if (extname(entry) === '.md') {
      results.push(full)
    }
  }
  return results
}

// Derive the session_id (e.g. "1971-04") from a talk date string ("1971-04-03")
function sessionIdFromDate(date: string): string {
  const [year, month] = date.split('-')
  return `${year}-${month}`
}

// ── Parse one file ─────────────────────────────────────────────────────────────

interface TalkRow {
  speaker: string
  talk_date: string
  conference: string
  session_label: string | null
  session_id: string | null
  source_title: string
  source_url: string | null
  source_type: string
  fidelity: string
  fidelity_notes: string | null
  transcript_text: string | null
  transcript_markdown: string
  collected_by: string | null
  collected_date: string | null
  needs_review: boolean
  notes: string | null
  status: 'approved'
}

function parseFile(filePath: string): TalkRow | null {
  let raw: string
  try {
    raw = readFileSync(filePath, 'utf-8')
  } catch {
    console.warn(`  ⚠ Could not read: ${filePath}`)
    return null
  }

  const { data: fm, content } = matter(raw)

  // Required fields
  const speaker = fm.speaker?.toString().trim()
  const talkDate = fm.date?.toString().trim()
  const conference = fm.conference?.toString().trim()
  const sourceTitle = fm.source_title?.toString().trim()
  const sourceType = fm.source_type?.toString().trim()
  const fidelity = fm.fidelity?.toString().trim()

  if (!speaker || !talkDate || !conference || !sourceTitle || !sourceType || !fidelity) {
    console.warn(`  ⚠ Skipping ${filePath} — missing required fields`)
    return null
  }

  return {
    speaker,
    talk_date: talkDate,
    conference,
    session_label: fm.session?.toString().trim() || null,
    session_id: sessionIdFromDate(talkDate),
    source_title: sourceTitle,
    source_url: fm.source_url?.toString().trim() || null,
    source_type: sourceType,
    fidelity,
    fidelity_notes: fm.fidelity_notes?.toString().trim() || null,
    transcript_text: content.trim() || null,
    transcript_markdown: raw,          // store the full original file verbatim
    collected_by: fm.collected_by?.toString().trim() || null,
    collected_date: fm.collected_date?.toString().trim() || null,
    needs_review: false,               // auto-approved — scraped from known-good sources
    notes: fm.notes?.toString().trim() === 'No notes.' ? null : (fm.notes?.toString().trim() || null),
    status: 'approved',
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function ingest() {
  console.log(`\n📂 Scanning: ${inputDir}`)
  const files = findMarkdownFiles(inputDir)
  console.log(`   Found ${files.length} .md files\n`)

  if (files.length === 0) {
    console.log('Nothing to do.')
    process.exit(0)
  }

  // Parse all files
  const rows: TalkRow[] = []
  let skipped = 0
  for (const f of files) {
    const row = parseFile(f)
    if (row) rows.push(row)
    else skipped++
  }

  console.log(`✓ Parsed ${rows.length} talks (${skipped} skipped due to missing fields)\n`)

  if (rows.length === 0) process.exit(0)

  // Upsert in batches of 50
  const BATCH = 50
  let inserted = 0
  let errors = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH)
    const { error } = await supabase
      .from('talks')
      .upsert(batch, { onConflict: 'speaker,talk_date,conference' })

    if (error) {
      console.error(`  ❌ Batch ${Math.floor(i / BATCH) + 1} error:`, error.message)
      errors++
    } else {
      inserted += batch.length
      process.stdout.write(`\r  ✓ ${inserted}/${rows.length} talks upserted`)
    }
  }

  console.log(`\n\n✅ Done! ${inserted} talks inserted/updated, ${errors} batch errors, ${skipped} files skipped.`)

  if (errors > 0) {
    console.log('\n⚠  Some batches failed. Check your session_id values or RLS policies.')
    console.log('   If you hit a unique constraint error, the upsert key (speaker,talk_date,conference) may not be unique enough.')
    console.log('   In that case, run the script with --allow-duplicates (removes the onConflict clause) at your own risk.')
  }

  // Auto-mark sessions complete for any sessions that had talks ingested
  const sessionIds = [...new Set(rows.map(r => r.session_id).filter(Boolean))] as string[]
  for (const sid of sessionIds) {
    const count = rows.filter(r => r.session_id === sid).length
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ status: 'complete', talk_count: count, completed_at: new Date().toISOString() })
      .eq('id', sid)
    if (updateError) {
      console.warn(`  ⚠ Could not mark session ${sid} complete: ${updateError.message}`)
    } else {
      console.log(`  ✓ Session ${sid} marked complete (${count} talks)`)
    }
  }
}

ingest()
