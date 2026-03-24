import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Talk } from '../types'

export interface SearchFilterParams {
  query: string
  speaker: string
  fidelities: string[]
  yearFrom: string
  yearTo: string
  page: number
}

const PAGE_SIZE = 50

type SearchResult = Pick<Talk, 'id' | 'speaker' | 'talk_date' | 'conference' | 'session_label' | 'source_title' | 'fidelity' | 'transcript_text'>

export function useSearch(filters: SearchFilterParams) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filterKey = JSON.stringify(filters)

  useEffect(() => {
    if (!filters.query.trim()) {
      setResults([])
      setTotalCount(0)
      setLoading(false)
      return
    }

    let cancelled = false

    async function search() {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('talks')
        .select('id, speaker, talk_date, conference, session_label, source_title, fidelity, transcript_text', { count: 'exact' })
        .textSearch('search_vector', filters.query, { type: 'plain', config: 'english' })
        .eq('needs_review', false)

      if (filters.yearFrom) query = query.gte('talk_date', `${filters.yearFrom}-01-01`)
      if (filters.yearTo) query = query.lte('talk_date', `${filters.yearTo}-12-31`)

      if (filters.speaker) query = query.ilike('speaker', `%${filters.speaker}%`)
      if (filters.fidelities.length > 0) query = query.in('fidelity', filters.fidelities)

      query = query.order('talk_date', { ascending: false })

      const offset = filters.page * PAGE_SIZE
      query = query.range(offset, offset + PAGE_SIZE - 1)

      const { data, error: err, count } = await query
      if (cancelled) return

      if (err) setError(err.message)
      else {
        setResults(data ?? [])
        setTotalCount(count ?? 0)
      }
      setLoading(false)
    }

    search()
    return () => { cancelled = true }
  }, [filterKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return { results, totalCount, loading, error, pageSize: PAGE_SIZE }
}
