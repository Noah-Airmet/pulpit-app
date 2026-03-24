const ERAS = ['1830-1844', '1845-1850', '1850-1879', '1881-1896', '1897-present']

const FIDELITY_OPTIONS = [
  { value: 'verbatim', label: 'Verbatim' },
  { value: 'near_verbatim', label: 'Near Verbatim' },
  { value: 'edited', label: 'Edited' },
  { value: 'summary', label: 'Summary' },
  { value: 'reconstructed', label: 'Reconstructed' },
  { value: 'normalized', label: 'Normalized' },
]

interface Props {
  era: string
  speaker: string
  fidelities: string[]
  yearFrom: string
  yearTo: string
  onEraChange: (era: string) => void
  onSpeakerChange: (speaker: string) => void
  onFidelitiesChange: (fidelities: string[]) => void
  onYearFromChange: (year: string) => void
  onYearToChange: (year: string) => void
  onReset: () => void
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.6875rem',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-ink-tertiary)',
  marginBottom: '0.5rem',
  display: 'block',
}

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.8125rem',
  padding: '0.375rem 0.625rem',
  border: '1px solid var(--color-border)',
  borderRadius: 4,
  background: 'white',
  color: 'var(--color-ink)',
  width: '100%',
  outline: 'none',
}

export function ArchiveFilters({
  era, speaker, fidelities, yearFrom, yearTo,
  onEraChange, onSpeakerChange, onFidelitiesChange,
  onYearFromChange, onYearToChange, onReset,
}: Props) {
  const activeCount = [
    era ? 1 : 0,
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

  function handleEraClick(e: string) {
    onEraChange(era === e ? '' : e)
    onYearFromChange('')
    onYearToChange('')
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={sectionLabel}>
          Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </span>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              color: 'var(--color-ink-tertiary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              padding: 0,
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Era pills */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={sectionLabel}>Era</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {ERAS.map(e => {
            const active = era === e
            return (
              <button
                key={e}
                onClick={() => handleEraClick(e)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  padding: '0.25rem 0.625rem',
                  borderRadius: 9999,
                  border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                  background: active ? 'var(--color-accent)' : 'transparent',
                  color: active ? 'white' : 'var(--color-ink-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  letterSpacing: '0.02em',
                }}
              >
                {e}
              </button>
            )
          })}
        </div>
      </div>

      {/* Speaker */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={sectionLabel}>Speaker</span>
        <input
          type="text"
          value={speaker}
          onChange={e => onSpeakerChange(e.target.value)}
          placeholder="Search speakers..."
          style={inputStyle}
        />
      </div>

      {/* Fidelity checkboxes */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={sectionLabel}>Fidelity</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {FIDELITY_OPTIONS.map(opt => (
            <label
              key={opt.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8125rem',
                color: 'var(--color-ink-secondary)',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={fidelities.includes(opt.value)}
                onChange={() => handleFidelityToggle(opt.value)}
                style={{ accentColor: 'var(--color-accent)' }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Date range */}
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={sectionLabel}>Date range</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="number"
            value={yearFrom}
            onChange={e => {
              onYearFromChange(e.target.value)
              onEraChange('')
            }}
            placeholder="From"
            min={1830}
            max={2026}
            style={{ ...inputStyle, width: '50%' }}
          />
          <span style={{ color: 'var(--color-ink-tertiary)', fontSize: '0.75rem' }}>–</span>
          <input
            type="number"
            value={yearTo}
            onChange={e => {
              onYearToChange(e.target.value)
              onEraChange('')
            }}
            placeholder="To"
            min={1830}
            max={2026}
            style={{ ...inputStyle, width: '50%' }}
          />
        </div>
      </div>
    </div>
  )
}
