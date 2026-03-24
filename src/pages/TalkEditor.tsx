import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useTalkActions } from '../hooks/useTalkActions'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { TalkEditorForm } from '../components/editor/TalkEditorForm'
import type { Session, Talk, TalkFormData } from '../types'

function TalkEditorContent() {
  const { sessionId, talkId } = useParams<{ sessionId: string; talkId?: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [session, setSession] = useState<Session | null>(null)
  const [existingTalk, setExistingTalk] = useState<Talk | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const { saveDraft, updateDraft, pending } = useTalkActions()
  const isEditing = !!talkId && talkId !== 'new'

  useEffect(() => {
    if (!sessionId) return
    loadData()
  }, [sessionId, talkId])

  async function loadData() {
    setLoading(true)
    setLoadError(null)

    const { data: sess, error: sessErr } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId!)
      .single()

    if (sessErr || !sess) {
      setLoadError(sessErr?.message ?? 'Session not found')
      setLoading(false)
      return
    }
    setSession(sess)

    // Verify this user can edit
    if (sess.claimed_by !== user?.id || sess.status !== 'in_progress') {
      setLoadError('You do not have permission to add talks to this session.')
      setLoading(false)
      return
    }

    if (isEditing) {
      const { data: talk, error: talkErr } = await supabase
        .from('talks')
        .select('*')
        .eq('id', talkId!)
        .single()
      if (talkErr || !talk) {
        setLoadError(talkErr?.message ?? 'Talk not found')
        setLoading(false)
        return
      }
      // Only allow editing draft or rejected talks
      if (talk.status !== 'draft' && talk.status !== 'rejected') {
        setLoadError('This talk cannot be edited.')
        setLoading(false)
        return
      }
      setExistingTalk(talk)
    }

    setLoading(false)
  }

  function talkToFormData(talk: Talk): Partial<TalkFormData> {
    return {
      speaker: talk.speaker,
      talk_date: talk.talk_date,
      session_label: talk.session_label ?? '',
      source_title: talk.source_title,
      source_url: talk.source_url ?? '',
      source_type: talk.source_type,
      fidelity: talk.fidelity,
      calling: talk.calling ?? 'none',
      editor_tags: (talk.editor_tags ?? []).join(', '),
      fidelity_notes: talk.fidelity_notes ?? '',
      transcript_text: talk.transcript_text ?? '',
      notes: talk.notes ?? '',
    }
  }

  async function handleSave(form: TalkFormData) {
    if (!session) return { error: 'Session not loaded' }
    if (isEditing && existingTalk) {
      const result = await updateDraft(existingTalk.id, session.conference_date ?? session.id, form)
      if (!result.error) {
        navigate(`/tracker/session/${session.id}`)
      }
      return result
    } else {
      const result = await saveDraft(session.id, session.conference_date ?? session.id, form)
      if (!result.error) {
        navigate(`/tracker/session/${session.id}`)
      }
      return result
    }
  }

  async function handleSaveAndAnother(form: TalkFormData) {
    if (!session) return { error: 'Session not loaded' }
    if (isEditing) return { error: 'Save & Add Another is only available for new talks' }
    const result = await saveDraft(session.id, session.conference_date ?? session.id, form)
    return result
  }

  if (loading) {
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
        <p style={{ fontFamily: 'var(--font-body)', color: '#c17817' }}>{loadError ?? 'Something went wrong.'}</p>
        <Link
          to={sessionId ? `/tracker/session/${sessionId}` : '/tracker'}
          style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: 'var(--color-accent)' }}
        >
          ← Back
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Breadcrumb */}
      <nav style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Link
          to="/tracker"
          style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-ink-tertiary)', textDecoration: 'none' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-ink-tertiary)'}
        >
          Tracker
        </Link>
        <span style={{ color: 'var(--color-ink-tertiary)', fontSize: '0.75rem' }}>›</span>
        <Link
          to={`/tracker/session/${session.id}`}
          style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-ink-tertiary)', textDecoration: 'none' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-ink-tertiary)'}
        >
          {session.label}
        </Link>
        <span style={{ color: 'var(--color-ink-tertiary)', fontSize: '0.75rem' }}>›</span>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: 'var(--color-ink-secondary)' }}>
          {isEditing ? 'Edit Talk' : 'Add Talk'}
        </span>
      </nav>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontStyle: 'italic',
        fontSize: '1.5rem',
        fontWeight: 400,
        color: 'var(--color-ink)',
        margin: '0 0 2rem',
      }}>
        {isEditing ? 'Edit Talk' : 'Add Talk'}
      </h1>

      <TalkEditorForm
        initialData={existingTalk ? talkToFormData(existingTalk) : undefined}
        defaultDate={session.conference_date ?? undefined}
        conference={session.label}
        rejectionNotes={existingTalk?.rejection_notes ?? null}
        onSave={handleSave}
        onSaveAndAnother={isEditing ? undefined : handleSaveAndAnother}
        isSaving={!!pending}
      />
    </div>
  )
}

export function TalkEditor() {
  return (
    <ProtectedRoute>
      <TalkEditorContent />
    </ProtectedRoute>
  )
}
