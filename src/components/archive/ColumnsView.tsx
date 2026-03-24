import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface ColumnProps {
  items: { id: string; label: string; subLabel?: string }[]
  selectedId: string | null
  onSelect: (id: string) => void
  loading?: boolean
  title: string
}

function Column({ items, selectedId, onSelect, loading, title }: ColumnProps) {
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
        background: 'white',
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
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.25rem' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-ink-tertiary)', fontSize: '0.8125rem' }}>
            Loading...
          </div>
        ) : (
          items.map(item => (
            <button
              key={item.id}
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
          .map(c => ({ id: c, label: c }))
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

  return (
    <div
      style={{
        display: 'flex',
        height: '600px',
        border: '1px solid var(--color-border-light)',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
      }}
    >
      <Column
        title="Decade"
        items={decades}
        selectedId={selectedDecade}
        onSelect={(id) => {
          setSelectedDecade(id)
          setSelectedConference(null)
          setTalks([])
        }}
      />
      
      {selectedDecade && (
        <Column
          title="Conference"
          items={conferences}
          selectedId={selectedConference}
          onSelect={(id) => setSelectedConference(id)}
          loading={loadingConferences}
        />
      )}
      
      {selectedConference && (
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', minWidth: '300px' }}>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem' }}>
                {talks.map(talk => (
                  <Link
                    key={talk.id}
                    to={`/talk/${talk.id}`}
                    style={{
                      padding: '0.875rem',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border-light)',
                      textDecoration: 'none',
                      color: 'inherit',
                      background: 'white',
                      transition: 'all 0.1s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                    onMouseLeave={e => {
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
