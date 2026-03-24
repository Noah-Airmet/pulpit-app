import type { OverallStats } from '../../types'

interface Props {
  stats: OverallStats
  onStatusFilter: (status: string) => void
  activeStatusFilter: string
}

const STATUS_CONFIG = [
  { key: 'unclaimed', label: 'Unclaimed', color: '#9ca3af' },
  { key: 'in_progress', label: 'In Progress', color: '#6b7de0' },
  { key: 'in_review', label: 'In Review', color: '#d4a843' },
  { key: 'complete', label: 'Complete', color: '#4a8c5c' },
] as const

const ERA_COLORS: Record<string, string> = {
  '1830-1844': '#c17817',
  '1845-1850': '#a0522d',
  '1850-1879': '#b8860b',
  '1881-1896': '#b8860b',
  '1897-present': '#4a8c5c',
}

export function StatsBar({ stats, onStatusFilter, activeStatusFilter }: Props) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Status pill filters */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--color-ink-tertiary)',
            letterSpacing: '0.02em',
            marginRight: '0.25rem',
          }}
        >
          {stats.total} sessions total
        </span>
        {STATUS_CONFIG.map(s => {
          const count = stats[s.key as keyof typeof stats] as number
          const isActive = activeStatusFilter === s.key
          return (
            <button
              key={s.key}
              onClick={() => onStatusFilter(isActive ? '' : s.key)}
              title={`Filter to ${s.label.toLowerCase()}`}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '3px 12px',
                borderRadius: '9999px',
                border: `1px solid ${s.color}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: isActive ? s.color : `${s.color}22`,
                color: isActive ? 'white' : s.color,
              }}
            >
              {count} {s.label}
            </button>
          )
        })}
      </div>

      {/* Era progress bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {stats.byEra.map(era => {
          const pct = era.total > 0 ? Math.round((era.complete / era.total) * 100) : 0
          const color = ERA_COLORS[era.era] ?? '#9ca3af'
          return (
            <div key={era.era}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '0.25rem',
                  gap: '1rem',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--color-ink-secondary)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {era.era}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--color-ink-tertiary)',
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {era.complete} / {era.total} complete
                </span>
              </div>
              <div
                style={{
                  height: 8,
                  background: 'var(--color-border-light)',
                  borderRadius: 9999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: color,
                    borderRadius: 9999,
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
