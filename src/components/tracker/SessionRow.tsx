import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Session, Profile } from '../../types'

interface Props {
  session: Session
  claimedByProfile: Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null
  currentUserId: string | undefined
  isAdmin: boolean
  isUpdated: boolean
  onClaim: () => void
  onUnclaim: () => void
  onMarkComplete: () => void
  onAdminUnclaim: () => void
  isPending: boolean
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  unclaimed:   { label: 'Unclaimed',   color: '#9ca3af' },
  in_progress: { label: 'In Progress', color: '#6b7de0' },
  in_review:   { label: 'In Review',   color: '#d4a843' },
  complete:    { label: 'Complete',    color: '#4a8c5c' },
}

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  easy:             { label: 'Easy',       color: '#4a8c5c' },
  medium:           { label: 'Medium',     color: '#b8860b' },
  hard:             { label: 'Hard',       color: '#c17817' },
  'detective-work': { label: 'Detective',  color: '#a0522d' },
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.6875rem',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        padding: '2px 10px',
        borderRadius: '9999px',
        background: `${color}22`,
        color,
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

function ActionButton({
  label,
  onClick,
  disabled,
  variant = 'primary',
}: {
  label: string
  onClick: () => void
  disabled: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}) {
  const [hovered, setHovered] = useState(false)

  const styles = {
    primary: {
      background: hovered ? 'var(--color-accent-hover)' : 'var(--color-accent)',
      color: 'white',
      border: 'none',
    },
    secondary: {
      background: 'transparent',
      color: 'var(--color-accent)',
      border: '1px solid var(--color-accent)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-ink-tertiary)',
      border: 'none',
      textDecoration: hovered ? 'underline' : 'none',
      textUnderlineOffset: '2px',
    },
  }[variant]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.75rem',
        fontWeight: 500,
        padding: '0.3125rem 0.875rem',
        borderRadius: 4,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
        ...styles,
      }}
    >
      {label}
    </button>
  )
}

export function SessionRow({
  session,
  claimedByProfile,
  currentUserId,
  isAdmin,
  isUpdated,
  onClaim,
  onUnclaim,
  onMarkComplete: _onMarkComplete,
  onAdminUnclaim,
  isPending,
}: Props) {
  const status = STATUS_CONFIG[session.status] ?? STATUS_CONFIG.unclaimed
  const difficulty = DIFFICULTY_CONFIG[session.difficulty] ?? DIFFICULTY_CONFIG.easy

  const isMySession = session.claimed_by === currentUserId
  const canClaim = session.status === 'unclaimed'
  const canUnclaim = isMySession && session.status === 'in_progress'

  // Format the date for display
  const displayDate = session.conference_date
    ? new Date(session.conference_date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : session.id

  return (
    <div
      className={isUpdated ? 'row-updated' : ''}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--color-border-light)',
        transition: 'background 0.15s ease',
        flexWrap: 'wrap',
      }}
      onMouseEnter={e => {
        if (!isUpdated) e.currentTarget.style.background = 'var(--color-accent-subtle)'
      }}
      onMouseLeave={e => {
        if (!isUpdated) e.currentTarget.style.background = ''
      }}
    >
      {/* Date */}
      <div style={{ minWidth: 72, flexShrink: 0 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.875rem',
            color: 'var(--color-ink-secondary)',
            letterSpacing: '0.02em',
          }}
        >
          {displayDate}
        </span>
      </div>

      {/* Label */}
      <div style={{ flex: 1, minWidth: 180 }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.9375rem',
            color: 'var(--color-ink)',
            lineHeight: 1.4,
          }}
        >
          {session.label}
        </span>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', flexShrink: 0 }}>
        <Badge label={session.era} color={difficulty.color} />
        <Badge label={difficulty.label} color={difficulty.color} />
        <Badge label={status.label} color={status.color} />
      </div>

      {/* Claimed by */}
      <div style={{ minWidth: 120, flexShrink: 0 }}>
        {claimedByProfile ? (
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
              color: 'var(--color-ink-secondary)',
            }}
          >
            {claimedByProfile.display_name ?? 'Someone'}
          </span>
        ) : (
          <span style={{ color: 'var(--color-ink-tertiary)', fontSize: '0.75rem' }}>—</span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, alignItems: 'center' }}>
        {canClaim && (
          <ActionButton label="Claim" onClick={onClaim} disabled={isPending} variant="primary" />
        )}
        {(isMySession || isAdmin) && (session.status === 'in_progress' || session.status === 'in_review') && (
          <Link
            to={`/tracker/session/${session.id}`}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '0.3125rem 0.875rem',
              borderRadius: 4,
              border: '1px solid var(--color-accent)',
              background: 'transparent',
              color: 'var(--color-accent)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            View Session
          </Link>
        )}
        {canUnclaim && (
          <ActionButton label="Release" onClick={onUnclaim} disabled={isPending} variant="ghost" />
        )}
        {isAdmin && !canUnclaim && session.claimed_by && session.status === 'in_progress' && (
          <ActionButton label="Admin: Release" onClick={onAdminUnclaim} disabled={isPending} variant="ghost" />
        )}
      </div>
    </div>
  )
}
