import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useTalks } from '../hooks/useTalks'
import { useTalkActions } from '../hooks/useTalkActions'
import { useSessionActions } from '../hooks/useSessionActions'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { SessionInfo } from '../components/tracker/SessionDetail/SessionInfo'
import { TalkReviewCard } from '../components/review/TalkReviewCard'
import type { Session, Profile } from '../types'

function ReviewSessionContent() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [session, setSession] = useState<Session | null>(null)
  const [claimedByProfile, setClaimedByProfile] = useState<Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [completing, setCompleting] = useState(false)
  const [completeError, setCompleteError] = useState('')

  const { talks, loading: talksLoading } = useTalks(sessionId)
  const { approveTalk, rejectTalk, updateReviewedTalk, pending: talkPending } = useTalkActions()
  const { adminMarkFinal } = useSessionActions()

  useEffect(() => {
    if (profile && !profile.is_admin) navigate('/tracker')
  }, [profile])

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

  async function handleMarkComplete() {
    if (!sessionId) return
    setCompleting(true)
    setCompleteError('')
    const result = await adminMarkFinal(sessionId)
    setCompleting(false)
    if (result.error) {
      setCompleteError(result.error)
    } else {
      await loadSession()
      navigate('/review')
    }
  }

  if (!profile?.is_admin) return null

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
        <Link to="/review" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-accent)' }}>
          ← Back to Review
        </Link>
      </div>
    )
  }

  const submittedTalks = talks.filter(t => t.status === 'submitted')
  const approvedTalks = talks.filter(t => t.status === 'approved')
  const allResolved = talks.length > 0 && submittedTalks.length === 0
  const canComplete = allResolved && session.status === 'in_review'

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Link
          to="/review"
          style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-ink-tertiary)', textDecoration: 'none' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-ink-tertiary)'}
        >
          ← Review Queue
        </Link>
      </nav>

      <SessionInfo session={session} claimedByProfile={claimedByProfile} />

      {/* Progress summary */}
      {talks.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          marginBottom: '1.5rem',
          padding: '0.875rem 1rem',
          background: 'var(--color-paper-warm)',
          borderRadius: 6,
          border: '1px solid var(--color-border-light)',
        }}>
          {[
            { label: 'Total', value: talks.length, color: 'var(--color-ink)' },
            { label: 'Pending', value: submittedTalks.length, color: '#6b7de0' },
            { label: 'Approved', value: approvedTalks.length, color: '#4a8c5c' },
            { label: 'Returned', value: talks.filter(t => t.status === 'rejected').length, color: '#c17817' },
          ].map(s => (
            <div key={s.label}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.25rem',
                fontWeight: 500,
                color: s.color,
                lineHeight: 1,
              }}>
                {s.value}
              </div>
              <div style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.6875rem',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.04em',
                color: 'var(--color-ink-tertiary)',
                marginTop: '0.25rem',
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Talk cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {talks.length === 0 ? (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            color: 'var(--color-ink-tertiary)',
            textAlign: 'center',
            padding: '2rem',
          }}>
            No talks found for this session.
          </p>
        ) : (
          talks.map(talk => (
            <TalkReviewCard
              key={talk.id}
              talk={talk}
              onApprove={approveTalk}
              onReject={rejectTalk}
              onSaveEdits={updateReviewedTalk}
              pending={talkPending}
            />
          ))
        )}
      </div>

      {/* Complete session */}
      {canComplete && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '1rem',
          padding: '1.25rem',
          background: '#f0faf4',
          border: '1px solid #4a8c5c44',
          borderRadius: 8,
        }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4a8c5c',
              margin: 0,
            }}>
              All talks have been reviewed.
            </p>
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
              color: 'var(--color-ink-secondary)',
              margin: '0.25rem 0 0',
            }}>
              {approvedTalks.length} approved — mark session complete to finalize.
            </p>
          </div>
          {completeError && (
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: '#c17817' }}>
              {completeError}
            </span>
          )}
          <button
            onClick={handleMarkComplete}
            disabled={completing}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              fontWeight: 500,
              padding: '0.5625rem 1.5rem',
              border: 'none',
              borderRadius: 4,
              background: '#4a8c5c',
              color: 'white',
              cursor: completing ? 'wait' : 'pointer',
              opacity: completing ? 0.6 : 1,
              whiteSpace: 'nowrap' as const,
            }}
          >
            {completing ? 'Completing…' : 'Mark Session Complete'}
          </button>
        </div>
      )}
    </div>
  )
}

export function ReviewSession() {
  return (
    <ProtectedRoute>
      <ReviewSessionContent />
    </ProtectedRoute>
  )
}
