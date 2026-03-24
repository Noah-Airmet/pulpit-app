import { useState } from 'react'
import type { Profile } from '../../types'

interface Props {
  profile: Profile
  currentUserId: string
  onToggleAdmin: (profileId: string, newValue: boolean) => Promise<{ error?: string }>
  pending: boolean
}

export function VolunteerRow({ profile, currentUserId, onToggleAdmin, pending }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [error, setError] = useState('')
  const isSelf = profile.id === currentUserId

  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  async function handleToggle() {
    setError('')
    const result = await onToggleAdmin(profile.id, !profile.is_admin)
    if (result.error) {
      setError(result.error)
    }
    setConfirmOpen(false)
  }

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto auto auto',
        gap: '1rem',
        padding: '0.875rem 1rem',
        alignItems: 'center',
        borderBottom: '1px solid var(--color-border-light)',
      }}>
        {/* Avatar */}
        <div style={{ width: 36, height: 36, flexShrink: 0 }}>
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name ?? 'User'}
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              color: 'var(--color-ink-tertiary)',
            }}>
              {(profile.display_name ?? '?')[0]}
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.9375rem', color: 'var(--color-ink)' }}>
            {profile.display_name ?? 'Unknown'}
            {isSelf && (
              <span style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.6875rem',
                color: 'var(--color-ink-tertiary)',
                marginLeft: '0.5rem',
              }}>
                (you)
              </span>
            )}
          </div>
          {error && (
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: '#c17817', marginTop: '0.125rem' }}>
              {error}
            </div>
          )}
        </div>

        {/* Admin badge */}
        <div>
          {profile.is_admin && (
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.6875rem',
              fontWeight: 500,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.04em',
              padding: '2px 10px',
              borderRadius: '9999px',
              background: '#6b7de022',
              color: '#6b7de0',
            }}>
              Admin
            </span>
          )}
        </div>

        {/* Joined */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          color: 'var(--color-ink-tertiary)',
          whiteSpace: 'nowrap' as const,
        }}>
          {joinedDate}
        </div>

        {/* Toggle */}
        <button
          onClick={() => isSelf ? undefined : setConfirmOpen(true)}
          disabled={isSelf || pending}
          title={isSelf ? 'Cannot remove your own admin access' : profile.is_admin ? 'Remove admin' : 'Grant admin'}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            padding: '0.3125rem 0.875rem',
            border: '1px solid var(--color-border)',
            borderRadius: 4,
            background: 'transparent',
            color: isSelf ? 'var(--color-ink-tertiary)' : 'var(--color-ink-secondary)',
            cursor: isSelf || pending ? 'default' : 'pointer',
            opacity: isSelf || pending ? 0.5 : 1,
            whiteSpace: 'nowrap' as const,
          }}
        >
          {profile.is_admin ? 'Remove Admin' : 'Make Admin'}
        </button>
      </div>

      {/* Confirm dialog */}
      {confirmOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}>
          <div style={{
            background: 'var(--color-paper)',
            borderRadius: 8,
            padding: '2rem',
            maxWidth: 400,
            width: '100%',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: '1.125rem',
              fontWeight: 400,
              color: 'var(--color-ink)',
              margin: '0 0 0.75rem',
            }}>
              {profile.is_admin ? 'Remove admin access?' : 'Grant admin access?'}
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              color: 'var(--color-ink)',
              lineHeight: 1.6,
              margin: '0 0 1.5rem',
            }}>
              {profile.is_admin
                ? `Remove admin access for ${profile.display_name ?? 'this user'}? They will no longer see the Review tab.`
                : `Grant admin access to ${profile.display_name ?? 'this user'}? They will be able to review and approve submitted talks.`}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  padding: '0.5rem 1.25rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: 4,
                  background: 'transparent',
                  color: 'var(--color-ink-secondary)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleToggle}
                disabled={pending}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  padding: '0.5rem 1.5rem',
                  border: 'none',
                  borderRadius: 4,
                  background: 'var(--color-accent)',
                  color: 'white',
                  cursor: pending ? 'wait' : 'pointer',
                  opacity: pending ? 0.6 : 1,
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
