import { createClient } from '@supabase/supabase-js'
import { join } from 'path'


const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing required env vars: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function findSpeakers() {
  const { data, error } = await supabase
    .from('talks')
    .select('speaker')
  
  if (error) {
    console.error('Error fetching speakers:', error.message)
    return
  }

  const speakers = [...new Set(data.map(d => d.speaker))].sort()
  console.log('Unique speakers in DB:')
  speakers.forEach(s => console.log(`- "${s}"`))
}

findSpeakers()
