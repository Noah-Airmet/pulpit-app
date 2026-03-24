import { Link } from 'react-router-dom'
import type { Session, Profile } from '../../types'

interface SessionWithProfile extends Session {
  profiles?: Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null
}

interface Props {
  sessions: SessionWithProfile[]
}

export function ReviewQueueTable({ sessions }: Props) {
  if (sessions.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '4rem 1rem',
        border: '1px dashed var(--color-border)',
        borderRadius: 8,
        background: 'var(--color-paper-warm)',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontStyle: 'italic',
          fontSize: '1rem',
          color: 'var(--color-ink-tertiary)',
          margin: 0,
        }}>
          No sessions awaiting review.
        </p>
      </div>
    )
  }

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto auto',
        gap: '1rem',
        padding: '0.625rem 1rem',
        background: 'var(--color-paper-warm)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {['Session', 'Era', 'Volunteer', 'Talks', ''].map(h => (
          <span key={h} style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.6875rem',
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.06em',
            color: 'var(--color-ink-tertiary)',
          }}>
            {h}
          </span>
        ))}
      </div>

      {sessions.map((session, i) => {
        const submittedDate = session.completed_at
          ? new Date(session.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '—'
        const isLast = i === sessions.length - 1

        return (
          <div
            key={session.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto auto',
              gap: '1rem',
              padding: '0.875rem 1rem',
              alignItems: 'center',
              borderBottom: isLast ? 'none' : '1px solid var(--color-border-light)',
            }}
          >
            <div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                color: 'var(--color-ink)',
                lineHeight: 1.3,
              }}>
                {session.label}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--color-ink-tertiary)',
                marginTop: '0.125rem',
              }}>
                Submitted {submittedDate}
              </div>
            </div>

            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
              color: 'var(--color-ink-secondary)',
              whiteSpace: 'nowrap' as const,
            }}>
              {session.era}
            </span>

            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
              color: 'var(--color-ink-secondary)',
              whiteSpace: 'nowrap' as const,
            }}>
              {session.profiles?.display_name ?? '—'}
            </span>

            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.875rem',
              color: 'var(--color-ink)',
              textAlign: 'right',
              whiteSpace: 'nowrap' as const,
            }}>
              {session.talk_count ?? '?'}
            </span>

            <Link
              to={`/review/session/${session.id}`}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--color-accent)',
                textDecoration: 'none',
                padding: '0.25rem 0.75rem',
                border: '1px solid var(--color-accent)',
                borderRadius: 4,
                whiteSpace: 'nowrap' as const,
              }}
            >
              Review
            </Link>
          </div>
        )
      })}
    </div>
  )
}
