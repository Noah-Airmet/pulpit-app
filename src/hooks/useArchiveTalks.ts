import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Talk } from '../types'

export interface ArchiveFilterParams {
  speaker: string
  fidelities: string[]
  yearFrom: string
  yearTo: string
  sort: 'newest' | 'oldest' | 'speaker_az'
  page: number
}

const PAGE_SIZE = 50

type ArchiveTalk = Pick<Talk, 'id' | 'speaker' | 'talk_date' | 'conference' | 'session_label' | 'source_title' | 'fidelity'>

export function useArchiveTalks(filters: ArchiveFilterParams) {
  const [talks, setTalks] = useState<ArchiveTalk[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('talks')
        .select('id, speaker, talk_date, conference, session_label, source_title, fidelity', { count: 'exact' })
        .eq('needs_review', false)

      if (filters.yearFrom) query = query.gte('talk_date', `${filters.yearFrom}-01-01`)
      if (filters.yearTo) query = query.lte('talk_date', `${filters.yearTo}-12-31`)

      if (filters.speaker) query = query.ilike('speaker', `%${filters.speaker}%`)
      if (filters.fidelities.length > 0) query = query.in('fidelity', filters.fidelities)

      if (filters.sort === 'oldest') {
        query = query.order('talk_date', { ascending: true })
      } else if (filters.sort === 'speaker_az') {
        query = query.order('speaker', { ascending: true })
      } else {
        query = query.order('talk_date', { ascending: false })
      }

      const offset = filters.page * PAGE_SIZE
      query = query.range(offset, offset + PAGE_SIZE - 1)

      const { data, error: err, count } = await query
      if (cancelled) return

      if (err) setError(err.message)
      else {
        setTalks(data ?? [])
        setTotalCount(count ?? 0)
      }
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [filterKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return { talks, totalCount, loading, error, pageSize: PAGE_SIZE }
}
