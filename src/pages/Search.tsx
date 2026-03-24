import { useState } from 'react'
import { SearchBar } from '../components/archive/SearchBar'
import { TalkCard } from '../components/archive/TalkCard'
import { ArchiveFilters } from '../components/archive/ArchiveFilters'
import { useSearch, type SearchFilterParams } from '../hooks/useSearch'

const DEFAULT_FILTERS: SearchFilterParams = {
  query: '',
  era: '',
  speaker: '',
  fidelities: [],
  yearFrom: '',
  yearTo: '',
  page: 0,
}

export function Search() {
  const [filters, setFilters] = useState<SearchFilterParams>(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const { results, totalCount, loading, error, pageSize } = useSearch(filters)

  const totalPages = Math.ceil(totalCount / pageSize)

  function updateFilter<K extends keyof SearchFilterParams>(key: K, value: SearchFilterParams[K]) {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      ...(key !== 'page' ? { page: 0 } : {}),
    }))
  }

  function resetFilters() {
    setFilters(prev => ({ ...DEFAULT_FILTERS, query: prev.query }))
  }

  const activeFilterCount = [
    filters.era ? 1 : 0,
    filters.speaker ? 1 : 0,
    filters.fidelities.length > 0 ? 1 : 0,
    filters.yearFrom || filters.yearTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  return (
    <div style={{ maxWidth: 'var(--width-page)', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
      {/* Search header */}
      <div style={{ maxWidth: 680, margin: '0 auto 2rem', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.25rem',
            fontWeight: 600,
            color: 'var(--color-ink)',
            margin: '0 0 1.5rem',
            letterSpacing: '-0.01em',
          }}
        >
          Search
        </h1>
        <SearchBar
          value={filters.query}
          onChange={v => updateFilter('query', v)}
        />
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            fontStyle: 'italic',
            color: 'var(--color-ink-tertiary)',
            marginTop: '0.75rem',
            lineHeight: 1.7,
          }}
        >
          Use quotes for phrases: "law of consecration" · Combine terms: faith repentance ·
          Filter by speaker or era using the options on the left
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
        {/* Filter sidebar */}
        {showFilters && (
          <aside
            className="search-sidebar"
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
          {/* Controls */}
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
              {filters.query && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--color-ink-tertiary)',
                  }}
                >
                  {loading ? 'Searching...' : `${totalCount} result${totalCount !== 1 ? 's' : ''}`}
                </span>
              )}
            </div>
          </div>

          {/* No query state */}
          {!filters.query && (
            <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  color: 'var(--color-ink-tertiary)',
                  fontStyle: 'italic',
                }}
              >
                Enter a search term above to find talks.
              </p>
            </div>
          )}

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

          {/* Loading */}
          {loading && filters.query && (
            <div>
              {[...Array(5)].map((_, i) => (
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
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && filters.query && results.length === 0 && (
            <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  color: 'var(--color-ink-tertiary)',
                  fontStyle: 'italic',
                }}
              >
                No talks match your search. Try broadening your terms or adjusting the filters.
              </p>
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <>
              <div
                style={{
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: 'white',
                }}
              >
                {results.map(result => (
                  <TalkCard
                    key={result.id}
                    id={result.id}
                    speaker={result.speaker}
                    talk_date={result.talk_date}
                    conference={result.conference}
                    session_label={result.session_label}
                    source_title={result.source_title}
                    fidelity={result.fidelity}
                    snippet={
                      result.transcript_text
                        ? result.transcript_text.slice(0, 200) + '…'
                        : null
                    }
                  />
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
          .search-sidebar {
            position: static !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  )
}
