import { DropdownFilter } from '../ui/DropdownFilter'

const FIDELITY_OPTIONS = [
  { value: 'verbatim', label: 'Verbatim' },
  { value: 'near_verbatim', label: 'Near Verbatim' },
  { value: 'edited', label: 'Edited' },
  { value: 'summary', label: 'Summary' },
  { value: 'reconstructed', label: 'Reconstructed' },
  { value: 'normalized', label: 'Normalized' },
]

interface Props {
  speaker: string
  fidelities: string[]
  yearFrom: string
  yearTo: string
  onSpeakerChange: (speaker: string) => void
  onFidelitiesChange: (fidelities: string[]) => void
  onYearFromChange: (year: string) => void
  onYearToChange: (year: string) => void
  onReset: () => void
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.6875rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-ink-tertiary)',
  marginBottom: '0.75rem',
  display: 'block',
}

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.8125rem',
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--color-border)',
  borderRadius: 6,
  background: 'white',
  color: 'var(--color-ink)',
  width: '100%',
  outline: 'none',
}

export function ArchiveFilters({
  speaker, fidelities, yearFrom, yearTo,
  onSpeakerChange, onFidelitiesChange,
  onYearFromChange, onYearToChange, onReset,
}: Props) {
  const activeCount = [
    speaker ? 1 : 0,
    fidelities.length > 0 ? 1 : 0,
    yearFrom || yearTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0)

  function handleFidelityToggle(value: string) {
    if (fidelities.includes(value)) {
      onFidelitiesChange(fidelities.filter(f => f !== value))
    } else {
      onFidelitiesChange([...fidelities, value])
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
      {/* Speaker Filter */}
      <DropdownFilter label="Speaker" activeCount={speaker ? 1 : 0}>
        <span style={sectionLabel}>Filter by Speaker</span>
        <div style={{ minWidth: '220px' }}>
          <input
            type="text"
            value={speaker}
            onChange={e => onSpeakerChange(e.target.value)}
            placeholder="E.g. Russell M. Nelson"
            autoFocus
            style={inputStyle}
          />
        </div>
      </DropdownFilter>

      {/* Fidelity Filter */}
      <DropdownFilter label="Fidelity" activeCount={fidelities.length}>
        <span style={sectionLabel}>Transcript Fidelity</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {FIDELITY_OPTIONS.map(opt => (
            <label
              key={opt.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8125rem',
                color: 'var(--color-ink-secondary)',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
              }}
            >
              <input
                type="checkbox"
                checked={fidelities.includes(opt.value)}
                onChange={() => handleFidelityToggle(opt.value)}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--color-accent)',
                  cursor: 'pointer'
                }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </DropdownFilter>

      {/* Date Range Filter */}
      <DropdownFilter label="Date Range" activeCount={yearFrom || yearTo ? 1 : 0}>
        <span style={sectionLabel}>Custom Date Range</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="number"
            value={yearFrom}
            onChange={e => {
              onYearFromChange(e.target.value)
            }}
            placeholder="From"
            min={1830}
            max={2026}
            style={{ ...inputStyle, width: '80px' }}
          />
          <span style={{ color: 'var(--color-ink-tertiary)', fontSize: '0.75rem' }}>–</span>
          <input
            type="number"
            value={yearTo}
            onChange={e => {
              onYearToChange(e.target.value)
            }}
            placeholder="To"
            min={1830}
            max={2026}
            style={{ ...inputStyle, width: '80px' }}
          />
        </div>
      </DropdownFilter>

      {/* Reset Button */}
      {activeCount > 0 && (
        <button
          onClick={onReset}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            fontWeight: 500,
            color: 'var(--color-ink-tertiary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem 0.75rem',
            marginLeft: '0.5rem',
            borderRadius: '6px',
            transition: 'color 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-ink)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-ink-tertiary)'}
        >
          Reset all
        </button>
      )}
    </div>
  )
}
