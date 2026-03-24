import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Talk } from '../types'
import { applyTalkFilters } from './talkQueryFilters'

export interface SearchFilterParams {
  query: string
  era: string
  speaker: string
  fidelities: string[]
  callings: string[]
  editorTags: string[]
  yearFrom: string
  yearTo: string
  page: number
}

const PAGE_SIZE = 50

type SearchResult = Pick<Talk, 'id' | 'speaker' | 'talk_date' | 'conference' | 'session_label' | 'source_title' | 'fidelity' | 'transcript_text' | 'calling' | 'editor_tags'>

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
        .select('id, speaker, talk_date, conference, session_label, source_title, fidelity, transcript_text, calling, editor_tags', { count: 'exact' })
        .textSearch('search_vector', filters.query, { type: 'plain', config: 'english' })
        .eq('needs_review', false)

      query = applyTalkFilters(query, filters)

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
