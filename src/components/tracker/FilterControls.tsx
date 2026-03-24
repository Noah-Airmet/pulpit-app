import type { TrackerFilters, EraType, DifficultyType, SessionStatus } from '../../types'

interface Props {
  filters: TrackerFilters
  onChange: (filters: TrackerFilters) => void
}

const ERAS: { value: EraType | ''; label: string }[] = [
  { value: '', label: 'All Eras' },
  { value: '1830-1844', label: '1830–1844' },
  { value: '1845-1850', label: '1845–1850' },
  { value: '1850-1879', label: '1850–1879' },
  { value: '1881-1896', label: '1881–1896' },
  { value: '1897-present', label: '1897–Present' },
]

const STATUSES: { value: SessionStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'unclaimed', label: 'Unclaimed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'complete', label: 'Complete' },
]

const DIFFICULTIES: { value: DifficultyType | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'detective-work', label: 'Detective' },
]

function PillGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <span
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.6875rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--color-ink-tertiary)',
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
        {options.map(opt => {
          const active = value === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                fontWeight: active ? 500 : 400,
                padding: '3px 10px',
                borderRadius: '9999px',
                border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: active ? 'var(--color-accent)' : 'transparent',
                color: active ? 'white' : 'var(--color-ink-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function FilterControls({ filters, onChange }: Props) {
  function set<K extends keyof TrackerFilters>(key: K, value: TrackerFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div
      style={{
        background: 'var(--color-paper-warm)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1.25rem',
        alignItems: 'flex-start',
      }}
    >
      {/* Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', minWidth: 160 }}>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.6875rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-ink-tertiary)',
          }}
        >
          Search
        </span>
        <input
          type="text"
          placeholder="Year or conference…"
          value={filters.search}
          onChange={e => set('search', e.target.value)}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.8125rem',
            padding: '0.3125rem 0.625rem',
            border: '1px solid var(--color-border)',
            borderRadius: 4,
            background: 'var(--color-paper)',
            color: 'var(--color-ink)',
            outline: 'none',
            width: 180,
          }}
        />
      </div>

      <PillGroup
        label="Era"
        options={ERAS}
        value={filters.era as EraType | ''}
        onChange={v => set('era', v)}
      />

      <PillGroup
        label="Status"
        options={STATUSES}
        value={filters.status as SessionStatus | ''}
        onChange={v => set('status', v)}
      />

      <PillGroup
        label="Difficulty"
        options={DIFFICULTIES}
        value={filters.difficulty as DifficultyType | ''}
        onChange={v => set('difficulty', v)}
      />

      {/* My Claims toggle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.6875rem',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-ink-tertiary)',
          }}
        >
          View
        </span>
        <button
          onClick={() => set('myClaimsOnly', !filters.myClaimsOnly)}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            fontWeight: filters.myClaimsOnly ? 500 : 400,
            padding: '3px 10px',
            borderRadius: '9999px',
            border: `1px solid ${filters.myClaimsOnly ? 'var(--color-accent)' : 'var(--color-border)'}`,
            background: filters.myClaimsOnly ? 'var(--color-accent)' : 'transparent',
            color: filters.myClaimsOnly ? 'white' : 'var(--color-ink-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          My Claims
        </button>
      </div>

      {/* Clear filters */}
      {(filters.era || filters.status || filters.difficulty || filters.myClaimsOnly || filters.search) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.6875rem', visibility: 'hidden' }}>x</span>
          <button
            onClick={() => onChange({ era: '', status: '', difficulty: '', myClaimsOnly: false, search: '' })}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              color: 'var(--color-ink-tertiary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '3px 4px',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
            }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
