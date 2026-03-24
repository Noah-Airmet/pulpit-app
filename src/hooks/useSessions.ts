import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Session } from '../types'

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Track which session IDs were recently updated for highlight animation
  const [updatedIds, setUpdatedIds] = useState<Set<string>>(new Set())
  const updatedIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Initial load
    loadSessions()

    // Realtime subscription
    const channel = supabase
      .channel('sessions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        payload => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Session
            setSessions(prev =>
              prev.map(s => (s.id === updated.id ? updated : s))
            )
            // Trigger highlight
            const newSet = new Set(updatedIdsRef.current)
            newSet.add(updated.id)
            updatedIdsRef.current = newSet
            setUpdatedIds(new Set(newSet))
            setTimeout(() => {
              updatedIdsRef.current.delete(updated.id)
              setUpdatedIds(new Set(updatedIdsRef.current))
            }, 1200)
          } else if (payload.eventType === 'INSERT') {
            setSessions(prev => [...prev, payload.new as Session])
          } else if (payload.eventType === 'DELETE') {
            setSessions(prev => prev.filter(s => s.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadSessions() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('sessions')
      .select('*')
      .order('conference_date', { ascending: true })
    if (err) {
      setError(err.message)
    } else {
      setSessions(data ?? [])
    }
    setLoading(false)
  }

  return { sessions, loading, error, updatedIds, refetch: loadSessions }
}
