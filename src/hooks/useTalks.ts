import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Talk } from '../types'

export function useTalks(sessionId: string | undefined) {
  const [talks, setTalks] = useState<Talk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setTalks([])
      setLoading(false)
      return
    }
    load()

    const channel = supabase
      .channel(`talks-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'talks', filter: `session_id=eq.${sessionId}` },
        payload => {
          if (payload.eventType === 'INSERT') {
            setTalks(prev => [...prev, payload.new as Talk])
          } else if (payload.eventType === 'UPDATE') {
            setTalks(prev => prev.map(t => t.id === (payload.new as Talk).id ? payload.new as Talk : t))
          } else if (payload.eventType === 'DELETE') {
            setTalks(prev => prev.filter(t => t.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [sessionId])

  async function load() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('talks')
      .select('*')
      .eq('session_id', sessionId!)
      .order('talk_date', { ascending: true })
    if (err) setError(err.message)
    else setTalks(data ?? [])
    setLoading(false)
  }

  return { talks, loading, error, refetch: load }
}
