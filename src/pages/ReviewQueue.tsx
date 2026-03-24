import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { ReviewQueueTable } from '../components/review/ReviewQueueTable'
import { VolunteerRow } from '../components/review/VolunteerRow'
import type { SessionWithProfile, Profile } from '../types'

function ReviewQueueContent() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState<'queue' | 'volunteers'>('queue')
  const [sessions, setSessions] = useState<SessionWithProfile[]>([])
  const [volunteers, setVolunteers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [volPending, setVolPending] = useState<string | null>(null)

  // Redirect non-admins
  useEffect(() => {
    if (profile && !profile.is_admin) {
      navigate('/tracker')
    }
  }, [profile])

  useEffect(() => {
    loadQueue()
  }, [])

  useEffect(() => {
    if (tab === 'volunteers') loadVolunteers()
  }, [tab])

  async function loadQueue() {
    setLoading(true)
    const { data } = await supabase
      .from('sessions')
      .select('*, profiles(id, display_name, avatar_url)')
      .eq('status', 'in_review')
      .order('completed_at', { ascending: true })
    setSessions((data ?? []) as SessionWithProfile[])
    setLoading(false)
  }

  async function loadVolunteers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true })
    setVolunteers(data ?? [])
  }

  async function handleToggleAdmin(profileId: string, newValue: boolean): Promise<{ error?: string }> {
    setVolPending(profileId)
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: newValue })
      .eq('id', profileId)
    setVolPending(null)
    if (error) return { error: error.message }
    setVolunteers(prev => prev.map(p => p.id === profileId ? { ...p, is_admin: newValue } : p))
    return {}
  }

  if (!profile?.is_admin) {
    return null // redirect in progress
  }

  return (
    <div style={{ maxWidth: 'var(--width-page)', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: '2rem',
        fontWeight: 400,
        color: 'var(--color-ink)',
        margin: '0 0 0.5rem',
      }}>
        Review
      </h1>
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.9375rem',
        color: 'var(--color-ink-secondary)',
        margin: '0 0 2rem',
      }}>
        Review submitted sessions and manage volunteers.
      </p>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
        {([
          { key: 'queue', label: 'In Review' },
          { key: 'volunteers', label: 'Volunteers' },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              fontWeight: tab === t.key ? 500 : 400,
              padding: '0.5rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: tab === t.key ? 'var(--color-accent)' : 'var(--color-ink-tertiary)',
              borderBottom: `2px solid ${tab === t.key ? 'var(--color-accent)' : 'transparent'}`,
              marginBottom: -1,
              transition: 'color 0.15s',
            }}
          >
            {t.label}
            {t.key === 'queue' && sessions.length > 0 && (
              <span style={{
                display: 'inline-block',
                marginLeft: '0.5rem',
                background: 'var(--color-accent)',
                color: 'white',
                borderRadius: '9999px',
                padding: '1px 7px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                lineHeight: 1.4,
              }}>
                {sessions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'queue' && (
        loading ? (
          <div style={{ padding: '3rem 0', textAlign: 'center' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-ink-tertiary)' }}>
              Loading…
            </span>
          </div>
        ) : (
          <ReviewQueueTable sessions={sessions} />
        )
      )}

      {tab === 'volunteers' && (
        <div>
          {volunteers.length === 0 ? (
            <div style={{ padding: '3rem 0', textAlign: 'center' }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-ink-tertiary)' }}>
                Loading…
              </span>
            </div>
          ) : (
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto auto auto',
                gap: '1rem',
                padding: '0.625rem 1rem',
                background: 'var(--color-paper-warm)',
                borderBottom: '1px solid var(--color-border)',
              }}>
                {['', 'Name', 'Role', 'Joined', ''].map((h, i) => (
                  <span key={i} style={{
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
              {volunteers.map(vol => (
                <VolunteerRow
                  key={vol.id}
                  profile={vol}
                  currentUserId={user?.id ?? ''}
                  onToggleAdmin={handleToggleAdmin}
                  pending={volPending === vol.id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ReviewQueue() {
  return (
    <ProtectedRoute>
      <ReviewQueueContent />
    </ProtectedRoute>
  )
}
