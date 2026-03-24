import type { Session, Profile } from '../../../types'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  unclaimed:   { label: 'Unclaimed',   color: '#9ca3af' },
  in_progress: { label: 'In Progress', color: '#6b7de0' },
  in_review:   { label: 'In Review',   color: '#d4a843' },
  complete:    { label: 'Complete',    color: '#4a8c5c' },
}

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  easy:             { label: 'Easy',      color: '#4a8c5c' },
  medium:           { label: 'Medium',    color: '#b8860b' },
  hard:             { label: 'Hard',      color: '#c17817' },
  'detective-work': { label: 'Detective', color: '#a0522d' },
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontFamily: 'var(--font-ui)',
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.04em',
      padding: '3px 12px',
      borderRadius: '9999px',
      background: `${color}22`,
      color,
      display: 'inline-block',
    }}>
      {label}
    </span>
  )
}

interface Props {
  session: Session
  claimedByProfile: Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null
}

export function SessionInfo({ session, claimedByProfile }: Props) {
  const status = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.unclaimed
  const difficulty = DIFFICULTY_CONFIG[session.difficulty] ?? DIFFICULTY_CONFIG.easy

  const displayDate = session.conference_date
    ? new Date(session.conference_date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : session.id

  return (
    <div style={{
      background: 'var(--color-paper-warm)',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      padding: '1.25rem 1.5rem',
      marginBottom: '2rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 400,
            fontStyle: 'italic',
            color: 'var(--color-ink)',
            margin: '0 0 0.375rem',
            lineHeight: 1.2,
          }}>
            {session.label}
          </h1>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            color: 'var(--color-ink-tertiary)',
            margin: 0,
          }}>
            {displayDate}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <Badge label={session.era} color={difficulty.color} />
          <Badge label={difficulty.label} color={difficulty.color} />
          <Badge label={status.label} color={status.color} />
        </div>
      </div>

      {claimedByProfile && (
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-border-light)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
        }}>
          {claimedByProfile.avatar_url && (
            <img
              src={claimedByProfile.avatar_url}
              alt={claimedByProfile.display_name ?? 'Volunteer'}
              style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.8125rem',
            color: 'var(--color-ink-secondary)',
          }}>
            Claimed by <strong>{claimedByProfile.display_name ?? 'Unknown'}</strong>
          </span>
        </div>
      )}

      {session.notes && (
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-border-light)',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            color: 'var(--color-ink-secondary)',
            margin: 0,
            lineHeight: 1.6,
          }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 500, marginRight: '0.375rem' }}>Note:</span>
            {session.notes}
          </p>
        </div>
      )}
    </div>
  )
}
