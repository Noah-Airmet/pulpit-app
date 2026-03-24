import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useArchiveTalks, type ArchiveFilterParams } from '../hooks/useArchiveTalks'
import { TalkCard } from '../components/archive/TalkCard'
import { ArchiveFilters } from '../components/archive/ArchiveFilters'

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
  const [showFilters, setShowFilters] = useState(true)
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

  const activeFilterCount = [
    filters.era ? 1 : 0,
    filters.speaker ? 1 : 0,
    filters.fidelities.length > 0 ? 1 : 0,
    filters.yearFrom || filters.yearTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

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

      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
        {/* Filter sidebar */}
        {showFilters && (
          <aside
            className="archive-sidebar"
            style={{
              width: 240,
              flexShrink: 0,
              position: 'sticky',
              top: 76,
            }}
          >
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
          </aside>
        )}

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
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
              <button
                onClick={() => setShowFilters(prev => !prev)}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.8125rem',
                  padding: '0.375rem 0.75rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 4,
                  background: 'transparent',
                  color: 'var(--color-ink-secondary)',
                  cursor: 'pointer',
                }}
              >
                {showFilters ? 'Hide filters' : `Filters${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
              </button>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  color: 'var(--color-ink-tertiary)',
                }}
              >
                {loading ? '...' : `Showing ${totalCount} talk${totalCount !== 1 ? 's' : ''}`}
              </span>
            </div>

            <select
              value={filters.sort}
              onChange={e => updateFilter('sort', e.target.value as ArchiveFilterParams['sort'])}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8125rem',
                padding: '0.375rem 0.625rem',
                border: '1px solid var(--color-border)',
                borderRadius: 4,
                background: 'white',
                color: 'var(--color-ink)',
                cursor: 'pointer',
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="speaker_az">Speaker A–Z</option>
            </select>
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

          {/* Empty state */}
          {!loading && talks.length === 0 && (
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
          )}

          {/* Talk list */}
          {!loading && talks.length > 0 && (
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
                      padding: '0.375rem 0.75rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 4,
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
                      padding: '0.375rem 0.75rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 4,
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
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .archive-sidebar {
            position: static !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}
