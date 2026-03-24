
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'
import matter from 'gray-matter'

const inputDir = process.argv[2] || './ingest'

function findMarkdownFiles(dir: string): string[] {
  if (statSync(dir).isFile()) return [dir]
  const results: string[] = []
  const entries = readdirSync(dir)
  for (const entry of entries) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...findMarkdownFiles(full))
    } else if (extname(entry) === '.md') {
      results.push(full)
    }
  }
  return results
}

const mapping: Record<string, string> = {
  'Oaks': 'Dallin H. Oaks',
  'Larson': 'Jared B. Larson',
  'Eyring': 'Henry B. Eyring',
  'Jergensen': 'Kevin R. Jergensen',
  'Monson': 'Thomas S. Monson',
  'Hinckley': 'Gordon B. Hinckley',
  'Nelson': 'Russell M. Nelson',
  'Ballard': 'M. Russell Ballard',
  'Uchtdorf': 'Dieter F. Uchtdorf',
  'Bednar': 'David A. Bednar',
  'Cook': 'Quentin L. Cook',
  'Christofferson': 'D. Todd Christofferson',
  'Andersen': 'Neil L. Andersen',
  'Rasband': 'Ronald A. Rasband',
  'Stevenson': 'Gary E. Stevenson',
  'Renlund': 'Dale G. Renlund',
  'Gong': 'Gerrit W. Gong',
  'Soares': 'Ulisses Soares',
}

async function fixMetadata() {
  console.log(`\n📂 Scanning: ${inputDir}`)
  const files = findMarkdownFiles(inputDir)
  console.log(`   Found ${files.length} .md files\n`)

  let fixedCount = 0

  for (const f of files) {
    let raw: string
    try {
      raw = readFileSync(f, 'utf-8')
    } catch {
      continue
    }

    const { data: fm, content } = matter(raw)
    let speaker = fm.speaker?.toString().trim()
    let changed = false

    // Fix explicit mapping
    if (mapping[speaker]) {
      fm.speaker = mapping[speaker]
      changed = true
    } else if (speaker && speaker.length > 50) {
      // Fix paragraph speakers (usually first line of talk)
      // Look for a name at the end (Respectfully submitted pattern)
      const auditMatch = content.match(/Respectfully submitted,\s*(?:\n\s*)*(?:Church )?Auditing Department\s*(?:\n\s*)*([A-Z][A-Za-z.\s]+)/i);
      if (auditMatch && auditMatch[1]) {
        const foundName = auditMatch[1].trim().split('\n')[0].trim();
        fm.speaker = foundName;
        changed = true;
      }
    }

    if (changed) {
      const updated = matter.stringify(content, fm)
      writeFileSync(f, updated)
      fixedCount++
      console.log(`   ✓ Fixed: ${f.split('/').pop()} -> ${fm.speaker}`)
    }
  }

  console.log(`\n✅ Done! Fixed ${fixedCount} files.`)
}

fixMetadata()
