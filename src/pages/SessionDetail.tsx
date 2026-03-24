import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useTalks } from '../hooks/useTalks'
import { useTalkActions } from '../hooks/useTalkActions'
import { useSessionActions } from '../hooks/useSessionActions'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { SessionInfo } from '../components/tracker/SessionDetail/SessionInfo'
import { TalkList } from '../components/tracker/SessionDetail/TalkList'
import { SubmitForReviewButton } from '../components/tracker/SessionDetail/SubmitForReviewButton'
import type { Session, Profile } from '../types'

function SessionDetailContent() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { user } = useAuth()

  const [session, setSession] = useState<Session | null>(null)
  const [claimedByProfile, setClaimedByProfile] = useState<Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const { talks, loading: talksLoading } = useTalks(sessionId)
  const { deleteDraft, pending: talkPending } = useTalkActions()
  const { submitSessionForReview, pending: sessionPending } = useSessionActions()

  useEffect(() => {
    if (!sessionId) return
    loadSession()
  }, [sessionId])

  async function loadSession() {
    setLoading(true)
    setLoadError(null)
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId!)
      .single()
    if (error || !data) {
      setLoadError(error?.message ?? 'Session not found')
      setLoading(false)
      return
    }
    setSession(data)
    if (data.claimed_by) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', data.claimed_by)
        .single()
      setClaimedByProfile(prof ?? null)
    }
    setLoading(false)
  }

  async function handleDelete(talkId: string) {
    if (!sessionId) return
    const result = await deleteDraft(talkId)
    if (result.error) alert(result.error)
  }

  async function handleSubmitForReview() {
    if (!sessionId || !session) return { error: 'No session' }
    const draftCount = talks.filter(t => t.status === 'draft').length
    const result = await submitSessionForReview(sessionId, draftCount + talks.filter(t => t.status === 'submitted').length)
    if (!result.error) {
      await loadSession()
    }
    return result
  }

  const isMySession = session?.claimed_by === user?.id
  const canEdit = isMySession && session?.status === 'in_progress'
  const draftCount = talks.filter(t => t.status === 'draft').length
  const totalCount = talks.length

  if (loading || talksLoading) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-ink-tertiary)' }}>
          Loading…
        </span>
      </div>
    )
  }

  if (loadError || !session) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: '#c17817' }}>{loadError ?? 'Session not found'}</p>
        <Link to="/tracker" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-accent)' }}>
          ← Back to Tracker
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/tracker"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.8125rem',
            color: 'var(--color-ink-tertiary)',
            textDecoration: 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-ink-tertiary)'}
        >
          ← Tracker
        </Link>
      </nav>

      <SessionInfo session={session} claimedByProfile={claimedByProfile} />

      {/* Talk count summary */}
      {totalCount > 0 && (
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.875rem',
          color: 'var(--color-ink-secondary)',
          marginBottom: '1rem',
        }}>
          {totalCount} talk{totalCount !== 1 ? 's' : ''} added
          {draftCount > 0 && canEdit && (
            <span style={{ color: 'var(--color-ink-tertiary)', marginLeft: '0.5rem' }}>
              ({draftCount} unsaved draft{draftCount !== 1 ? 's' : ''})
            </span>
          )}
        </div>
      )}

      <TalkList
        talks={talks}
        sessionId={session.id}
        canEdit={canEdit}
        onDelete={handleDelete}
        deletePending={talkPending}
      />

      {/* Bottom actions */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginTop: '1.5rem',
        justifyContent: 'flex-end',
        flexWrap: 'wrap',
      }}>
        {canEdit && (
          <>
            <Link
              to={`/tracker/session/${session.id}/talk/new`}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.875rem',
                fontWeight: 400,
                padding: '0.5625rem 1.25rem',
                borderRadius: 4,
                border: '1px solid var(--color-accent)',
                background: 'transparent',
                color: 'var(--color-accent)',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              + Add Talk
            </Link>
            {draftCount > 0 && (
              <SubmitForReviewButton
                talkCount={draftCount}
                sessionLabel={session.label}
                onSubmit={handleSubmitForReview}
                disabled={!!sessionPending}
              />
            )}
          </>
        )}

        {session.status === 'in_review' && (
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            color: '#d4a843',
            padding: '0.5625rem 0',
          }}>
            Submitted for review — awaiting approval
          </div>
        )}

        {session.status === 'complete' && (
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            color: '#4a8c5c',
            padding: '0.5625rem 0',
          }}>
            Session complete
          </div>
        )}
      </div>
    </div>
  )
}

export function SessionDetail() {
  return (
    <ProtectedRoute>
      <SessionDetailContent />
    </ProtectedRoute>
  )
}
