import { Link } from 'react-router-dom'
import { FidelityBadge } from './FidelityBadge'

interface Props {
  id: string
  speaker: string
  talk_date: string
  conference: string
  session_label?: string | null
  source_title: string
  fidelity: string
  snippet?: string | null
}

export function TalkCard({ id, speaker, talk_date, conference, session_label, source_title, fidelity, snippet }: Props) {
  const date = new Date(talk_date + 'T00:00:00')
  const displayDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  return (
    <Link
      to={`/talk/${id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          padding: '0.875rem 1rem',
          borderBottom: '1px solid var(--color-border-light)',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-accent-subtle)' }}
        onMouseLeave={e => { e.currentTarget.style.background = '' }}
      >
        {/* Date */}
        <div style={{ minWidth: 80, flexShrink: 0, paddingTop: 2 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              color: 'var(--color-ink-tertiary)',
              letterSpacing: '0.02em',
            }}
          >
            {displayDate}
          </span>
        </div>

        {/* Speaker */}
        <div style={{ minWidth: 160, flexShrink: 0 }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.9375rem',
              color: 'var(--color-ink)',
            }}
          >
            {speaker}
          </span>
        </div>

        {/* Title + session + snippet */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              color: 'var(--color-accent)',
              marginBottom: '0.25rem',
            }}
          >
            {source_title}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--color-ink-tertiary)',
            }}
          >
            {conference}
            {session_label ? ` · ${session_label}` : ''}
          </div>
          {snippet && (
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                color: 'var(--color-ink-secondary)',
                marginTop: '0.375rem',
                lineHeight: 1.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {snippet}
            </div>
          )}
        </div>

        {/* Fidelity badge */}
        <div style={{ flexShrink: 0, paddingTop: 2 }}>
          <FidelityBadge fidelity={fidelity} />
        </div>
      </div>
    </Link>
  )
}
