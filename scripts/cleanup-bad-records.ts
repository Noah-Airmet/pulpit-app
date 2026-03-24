
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

const badSpeakers = [
  'Oaks', 'Larson', 'Eyring', 'Jergensen', 'Monson', 'Hinckley', 'Nelson', 'Ballard',
  'Uchtdorf', 'Bednar', 'Cook', 'Christofferson', 'Andersen', 'Rasband', 'Stevenson',
  'Renlund', 'Gong', 'Soares'
]

async function cleanup() {
  console.log('🧹 Cleaning up bad speaker records from DB...')
  
  // Also check for paragraph speakers (length > 50)
  const { data: allTalks, error: fetchError } = await supabase
    .from('talks')
    .select('id, speaker')
  
  if (fetchError) {
    console.error('Error fetching talks:', fetchError.message)
    return
  }

  const idsToDelete = allTalks
    .filter(t => badSpeakers.includes(t.speaker) || t.speaker.length > 50)
    .map(t => t.id)

  if (idsToDelete.length === 0) {
    console.log('✨ No bad records found in DB.')
    return
  }

  console.log(`🗑 Found ${idsToDelete.length} records to delete.`)
  
  const { error: deleteError } = await supabase
    .from('talks')
    .delete()
    .in('id', idsToDelete)

  if (deleteError) {
    console.error('Error deleting records:', deleteError.message)
  } else {
    console.log('✅ Successfully deleted bad records.')
  }
}

cleanup()
