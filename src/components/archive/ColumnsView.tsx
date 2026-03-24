import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface ColumnProps {
  items: { id: string; label: string; subLabel?: string }[]
  selectedId: string | null
  onSelect: (id: string) => void
  loading?: boolean
  title: string
  isActive?: boolean
}

function Column({ items, selectedId, onSelect, loading, title, isActive }: ColumnProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedId && scrollRef.current) {
      const selectedEl = scrollRef.current.querySelector(`[data-id="${selectedId}"]`) as HTMLElement
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [selectedId])

  return (
    <div
      style={{
        flex: 1,
        minWidth: '220px',
        maxWidth: '320px',
        borderRight: '1px solid var(--color-border-light)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: isActive ? 'white' : 'var(--color-paper)',
        transition: 'background 0.2s ease',
      }}
    >
      <div
        style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--color-border-light)',
          background: 'var(--color-ink-faint)',
          fontSize: '0.6875rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color: 'var(--color-ink-tertiary)',
          position: 'sticky',
          top: 0,
        }}
      >
        {title}
      </div>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0.25rem' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-ink-tertiary)', fontSize: '0.8125rem' }}>
            Loading...
          </div>
        ) : (
          items.map(item => (
            <button
              key={item.id}
              data-id={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.625rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                background: selectedId === item.id ? 'var(--color-accent)' : 'transparent',
                color: selectedId === item.id ? 'white' : 'var(--color-ink)',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.875rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.1s ease',
                margin: '0.125rem 0',
              }}
            >
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.label}
                {item.subLabel && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      opacity: 0.7,
                      marginTop: '0.125rem',
                      color: selectedId === item.id ? 'white' : 'var(--color-ink-secondary)',
                    }}
                  >
                    {item.subLabel}
                  </div>
                )}
              </div>
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                <path
                  d="M1 1L5 5L1 9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export function ColumnsView() {
  const [selectedDecade, setSelectedDecade] = useState<string | null>(null)
  const [selectedConference, setSelectedConference] = useState<string | null>(null)
  const [activeCol, setActiveCol] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [conferences, setConferences] = useState<{ id: string; label: string; subLabel?: string }[]>([])
  const [talks, setTalks] = useState<{ id: string; label: string; subLabel?: string }[]>([])
  
  const [loadingConferences, setLoadingConferences] = useState(false)
  const [loadingTalks, setLoadingTalks] = useState(false)

  // Generate decades (1830s to 2020s)
  const decades = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const currentDecade = Math.floor(currentYear / 10) * 10
    const results = []
    for (let d = currentDecade; d >= 1830; d -= 10) {
      results.push({ id: d.toString(), label: `${d}s` })
    }
    return results
  }, [])

  // Load conferences when decade changes
  useEffect(() => {
    if (!selectedDecade) return
    
    async function fetchConferences() {
      setLoadingConferences(true)
      const startYear = parseInt(selectedDecade as string)
      const endYear = startYear + 9
      
      const { data, error } = await supabase
        .from('talks')
        .select('conference')
        .gte('talk_date', `${startYear}-01-01`)
        .lte('talk_date', `${endYear}-12-31`)
        .order('talk_date', { ascending: false })
      
      if (!error && data) {
        // Unique conferences
        const unique = Array.from(new Set(data.map(d => d.conference)))
          .map(c => ({ id: c, label: c.replace(' General Conference', '') }))
        setConferences(unique)
      }
      setLoadingConferences(false)
    }
    
    fetchConferences()
  }, [selectedDecade])

  // Load talks when conference changes
  useEffect(() => {
    if (!selectedConference) return
    
    async function fetchTalks() {
      setLoadingTalks(true)
      const { data, error } = await supabase
        .from('talks')
        .select('id, speaker, source_title')
        .eq('conference', selectedConference)
        .order('talk_date', { ascending: true })
      
      if (!error && data) {
        setTalks(data.map(t => ({
          id: t.id,
          label: t.source_title,
          subLabel: t.speaker
        })))
      }
      setLoadingTalks(false)
    }
    
    fetchTalks()
  }, [selectedConference])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
      if (e.altKey || e.ctrlKey || e.metaKey) return
      
      e.preventDefault()
      
      if (e.key === 'ArrowRight') {
        setActiveCol(c => Math.min(2, c + 1))
      } else if (e.key === 'ArrowLeft') {
        setActiveCol(c => Math.max(0, c - 1))
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const dir = e.key === 'ArrowDown' ? 1 : -1
        
        if (activeCol === 0) {
          const idx = decades.findIndex(d => d.id === selectedDecade)
          let nextIdx = idx === -1 ? 0 : idx + dir
          if (nextIdx < 0) nextIdx = 0
          if (nextIdx >= decades.length) nextIdx = decades.length - 1
          setSelectedDecade(decades[nextIdx].id)
          setSelectedConference(null)
        } else if (activeCol === 1 && conferences.length > 0) {
          const idx = conferences.findIndex(c => c.id === selectedConference)
          let nextIdx = idx === -1 ? 0 : idx + dir
          if (nextIdx < 0) nextIdx = 0
          if (nextIdx >= conferences.length) nextIdx = conferences.length - 1
          setSelectedConference(conferences[nextIdx].id)
        } else if (activeCol === 2 && talks.length > 0) {
          const links = containerRef.current?.querySelectorAll<HTMLAnchorElement>('.talk-link')
          if (!links || links.length === 0) return
          let focused = document.activeElement as HTMLAnchorElement | null
          const idx = Array.from(links).findIndex(l => l === focused)
          let nextIdx = idx === -1 ? 0 : idx + dir
          if (nextIdx < 0) nextIdx = 0
          if (nextIdx >= links.length) nextIdx = links.length - 1
          links[nextIdx].focus()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeCol, selectedDecade, selectedConference, decades, conferences, talks])

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        height: '600px',
        border: '1px solid var(--color-border-light)',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--color-paper)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        outline: 'none',
      }}
    >
      <Column
        title="Decade"
        isActive={activeCol === 0}
        items={decades}
        selectedId={selectedDecade}
        onSelect={(id) => {
          setSelectedDecade(id)
          setSelectedConference(null)
          setTalks([])
          setActiveCol(1)
        }}
      />
      
      {selectedDecade && (
        <Column
          title="Conference"
          isActive={activeCol === 1}
          items={conferences}
          selectedId={selectedConference}
          onSelect={(id) => {
            setSelectedConference(id)
            setActiveCol(2)
          }}
          loading={loadingConferences}
        />
      )}
      
      {selectedConference && (
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', minWidth: '300px', background: activeCol === 2 ? 'white' : 'transparent', transition: 'background 0.2s ease' }}>
          <div
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--color-border-light)',
              background: 'var(--color-ink-faint)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--color-ink-tertiary)',
            }}
          >
            Talks
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {loadingTalks ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-ink-tertiary)' }}>Loading talks...</div>
            ) : talks.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-ink-tertiary)' }}>Select a conference</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {talks.map(talk => (
                  <Link
                    key={talk.id}
                    to={`/talk/${talk.id}`}
                    className="talk-link"
                    style={{
                      padding: '0.875rem',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border-light)',
                      textDecoration: 'none',
                      color: 'inherit',
                      background: 'white',
                      transition: 'all 0.1s ease',
                      outline: 'none',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                    onMouseLeave={e => {
                      if (document.activeElement !== e.currentTarget) {
                        e.currentTarget.style.borderColor = 'var(--color-border-light)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'var(--color-border-light)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem', color: 'var(--color-ink)' }}>
                      {talk.label}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-ink-secondary)' }}>
                      {talk.subLabel}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedDecade && (
        <div style={{ flex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background-faint)' }}>
          <div style={{ textAlign: 'center', opacity: 0.5 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '1rem' }}>
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem' }}>Select a decade to begin browsing</div>
          </div>
        </div>
      )}
    </div>
  )
}
