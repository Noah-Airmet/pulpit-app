import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useArchiveTalks, type ArchiveFilterParams } from '../hooks/useArchiveTalks'
import { TalkCard } from '../components/archive/TalkCard'
import { ArchiveFilters } from '../components/archive/ArchiveFilters'
import { ColumnsView } from '../components/archive/ColumnsView'

const DEFAULT_FILTERS: ArchiveFilterParams = {
  era: '',
  speaker: '',
  fidelities: [],
  yearFrom: '',
  yearTo: '',
  sort: 'newest',
  page: 0,
}

export function Archive() {
  const [filters, setFilters] = useState<ArchiveFilterParams>(DEFAULT_FILTERS)
  const [viewMode, setViewMode] = useState<'list' | 'columns'>('list')
  const { talks, totalCount, loading, error, pageSize } = useArchiveTalks(filters)

  const totalPages = Math.ceil(totalCount / pageSize)

  function updateFilter<K extends keyof ArchiveFilterParams>(key: K, value: ArchiveFilterParams[K]) {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' ? { page: 0 } : {}),
    }))
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
  }

  return (
    <div style={{ maxWidth: 'var(--width-page)', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.25rem',
              fontWeight: 600,
              color: 'var(--color-ink)',
              margin: '0 0 0.5rem',
              letterSpacing: '-0.01em',
            }}
          >
            Archive
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'var(--color-ink-secondary)',
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            Browse every General Conference talk in the collection.
          </p>
        </div>
        <Link
          to="/search"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--color-accent)',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            border: '1px solid var(--color-accent)',
            borderRadius: 6,
            alignSelf: 'center',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--color-accent)'
            e.currentTarget.style.color = 'white'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--color-accent)'
          }}
        >
          Search the archive
        </Link>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <ArchiveFilters
          era={filters.era}
          speaker={filters.speaker}
          fidelities={filters.fidelities}
          yearFrom={filters.yearFrom}
          yearTo={filters.yearTo}
          onEraChange={v => updateFilter('era', v)}
          onSpeakerChange={v => updateFilter('speaker', v)}
          onFidelitiesChange={v => updateFilter('fidelities', v)}
          onYearFromChange={v => updateFilter('yearFrom', v)}
          onYearToChange={v => updateFilter('yearTo', v)}
          onReset={resetFilters}
        />
      </div>

      <div style={{ minWidth: 0 }}>
        {/* Controls bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                background: 'var(--color-ink-faint)',
                padding: '2px',
                borderRadius: '10px',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'list' ? 'white' : 'transparent',
                  boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  color: viewMode === 'list' ? 'var(--color-ink)' : 'var(--color-ink-tertiary)',
                  fontSize: '0.8125rem',
                  fontWeight: viewMode === 'list' ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('columns')}
                style={{
                  padding: '0.375rem 0.875rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'columns' ? 'white' : 'transparent',
                  boxShadow: viewMode === 'columns' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  color: viewMode === 'columns' ? 'var(--color-ink)' : 'var(--color-ink-tertiary)',
                  fontSize: '0.8125rem',
                  fontWeight: viewMode === 'columns' ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
              >
                Columns
              </button>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--color-ink-tertiary)',
              }}
            >
              {loading ? '...' : `${totalCount} ${totalCount === 1 ? 'talk' : 'talks'}`}
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <select
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value as ArchiveFilterParams['sort'])}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8125rem',
                padding: '0.375rem 2rem 0.375rem 0.625rem',
                border: '1px solid var(--color-border-light)',
                borderRadius: 8,
                background: 'white',
                color: 'var(--color-ink)',
                cursor: 'pointer',
                appearance: 'none',
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="speaker_az">Speaker A–Z</option>
            </select>
            <div style={{ position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-ink-tertiary)' }}>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: '1rem',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              color: '#991b1b',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div>
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  padding: '0.875rem 1rem',
                  borderBottom: '1px solid var(--color-border-light)',
                  display: 'flex',
                  gap: '1rem',
                }}
              >
                <div className="skeleton" style={{ width: 80, height: 16 }} />
                <div className="skeleton" style={{ width: 140, height: 16 }} />
                <div className="skeleton" style={{ flex: 1, height: 16 }} />
                <div className="skeleton" style={{ width: 80, height: 20, borderRadius: 9999 }} />
              </div>
            ))}
          </div>
        )}

        {/* Content Views */}
        {!loading && (
          viewMode === 'columns' ? (
            <ColumnsView />
          ) : talks.length > 0 ? (
            <>
              <div
                style={{
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: 'white',
                }}
              >
                {talks.map(talk => (
                  <TalkCard key={talk.id} {...talk} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '1rem',
                    marginTop: '2rem',
                  }}
                >
                  <button
                    onClick={() => updateFilter('page', filters.page - 1)}
                    disabled={filters.page === 0}
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.8125rem',
                      padding: '0.375rem 1rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 6,
                      background: 'transparent',
                      color: 'var(--color-ink)',
                      cursor: filters.page === 0 ? 'default' : 'pointer',
                      opacity: filters.page === 0 ? 0.5 : 1,
                    }}
                  >
                    ← Previous
                  </button>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--color-ink-tertiary)',
                    }}
                  >
                    Page {filters.page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => updateFilter('page', filters.page + 1)}
                    disabled={filters.page >= totalPages - 1}
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.8125rem',
                      padding: '0.375rem 1rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 6,
                      background: 'transparent',
                      color: 'var(--color-ink)',
                      cursor: filters.page >= totalPages - 1 ? 'default' : 'pointer',
                      opacity: filters.page >= totalPages - 1 ? 0.5 : 1,
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  color: 'var(--color-ink-tertiary)',
                  fontStyle: 'italic',
                }}
              >
                No talks match your current filters.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
