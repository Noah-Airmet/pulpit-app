import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Talk } from '../types'

export function useTalk(id: string | undefined) {
  const [talk, setTalk] = useState<Talk | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setTalk(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('talks')
        .select('*')
        .eq('id', id!)
        .single()

      if (cancelled) return

      if (err) setError(err.message)
      else setTalk(data)
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [id])

  return { talk, loading, error }
}
