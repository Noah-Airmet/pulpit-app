
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function checkConstraints() {
  const { data, error } = await supabase.rpc('get_table_constraints', { table_name: 'talks' })
  if (error) {
    // If RPC doesn't exist, try alternative
    console.error('Error fetching constraints:', error.message)
    // Alternative: query pg_catalog
    const { data: data2, error: error2 } = await supabase.from('talks').select('*').limit(1)
    if (error2) console.error(error2)
    return
  }
  console.log(data)
}
checkConstraints()
