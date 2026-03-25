import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Talk } from '../../types'

const FIDELITY_SHORT: Record<string, string> = {
  verbatim:      'Verbatim',
  near_verbatim: 'Near Verbatim',
  edited:        'Edited',
  summary:       'Summary',
  reconstructed: 'Reconstructed',
  normalized:    'Normalized',
}

const SOURCE_LABELS: Record<string, string> = {
  original_manuscript:     'Original Manuscript',
  shorthand_transcription: 'Shorthand Transcription',
  newspaper_report:        'Newspaper Report',
  official_report:         'Official Report',
  church_website:          'Church Website',
  compiled_transcription:  'Compiled Transcription',
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  submitted: { label: 'Pending Review', color: '#6b7de0' },
  approved:  { label: 'Approved',       color: '#4a8c5c' },
  rejected:  { label: 'Returned',       color: '#c17817' },
}

interface Props {
  talk: Talk
  onApprove: (talkId: string) => Promise<{ error?: string }>
  onReject: (talkId: string, notes: string) => Promise<{ error?: string }>
  onSaveEdits: (
    talkId: string,
    frontmatter: Record<string, string | number | boolean | null>,
    body: string
  ) => Promise<{ error?: string }>
  pending: string | null
}

const SOURCE_OPTIONS = Object.entries(SOURCE_LABELS)
const FIDELITY_OPTIONS = Object.entries(FIDELITY_SHORT)

function parseTalkMarkdown(talk: Talk) {
  const defaultFrontmatter: Record<string, string | number | boolean | null> = {
    speaker: talk.speaker,
    date: talk.talk_date,
    conference: talk.conference,
    session: talk.session_label,
    source: talk.source_title,
    source_type: talk.source_type,
    fidelity: talk.fidelity,
    source_url: talk.source_url,
    fidelity_notes: talk.fidelity_notes,
    collected_by: talk.collected_by,
    collected_date: talk.collected_date,
    needs_review: talk.needs_review,
    notes: talk.notes,
  }

  const md = talk.transcript_markdown ?? ''
  const match = md.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { frontmatter: defaultFrontmatter, body: talk.transcript_text ?? '' }
  const rawFrontmatter = match[1]
  const body = match[2]
  const parsed: Record<string, string | number | boolean | null> = {}
  for (const line of rawFrontmatter.split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx < 1) continue
    const key = line.slice(0, idx).trim()
    const rawValue = line.slice(idx + 1).trim()
    if (rawValue === 'null') parsed[key] = null
    else if (rawValue === 'true') parsed[key] = true
    else if (rawValue === 'false') parsed[key] = false
    else if (/^-?\d+(\.\d+)?$/.test(rawValue)) parsed[key] = Number(rawValue)
    else if (/^".*"$/.test(rawValue)) parsed[key] = rawValue.slice(1, -1).replace(/\\"/g, '"')
    else parsed[key] = rawValue
  }
  return { frontmatter: { ...defaultFrontmatter, ...parsed }, body }
}

export function TalkReviewCard({ talk, onApprove, onReject, onSaveEdits, pending }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const [frontmatter, setFrontmatter] = useState<Record<string, string | number | boolean | null>>({})
  const [body, setBody] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [saveError, setSaveError] = useState('')
  const [actionError, setActionError] = useState('')

  const status = STATUS_CONFIG[talk.status] ?? STATUS_CONFIG.submitted
  const isPending = pending === talk.id
  const snapshot = useMemo(() => JSON.stringify(parseTalkMarkdown(talk)), [talk])
  const isDirty = snapshot !== JSON.stringify({ frontmatter, body })

  const talkDate = talk.talk_date
    ? new Date(talk.talk_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—'

  useEffect(() => {
    const parsed = parseTalkMarkdown(talk)
    setFrontmatter(parsed.frontmatter)
    setBody(parsed.body)
    setSaveState('idle')
    setSaveError('')
  }, [snapshot])

  useEffect(() => {
    if (!expanded || !isDirty) return
    const handleUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [expanded, isDirty])

  function updateField(key: string, value: string | number | boolean | null) {
    setFrontmatter(prev => ({ ...prev, [key]: value }))
    setSaveState('idle')
  }

  async function handleSaveEdits() {
    if (!String(frontmatter.speaker ?? '').trim()) {
      setSaveError('Speaker is required before saving.')
      return
    }
    if (!String(frontmatter.date ?? '').trim()) {
      setSaveError('Date is required before saving.')
      return
    }
    if (!String(frontmatter.source ?? frontmatter.source_title ?? '').trim()) {
      setSaveError('Source is required before saving.')
      return
    }
    if (!String(frontmatter.source_type ?? '').trim()) {
      setSaveError('Source type is required before saving.')
      return
    }
    if (!String(frontmatter.fidelity ?? '').trim()) {
      setSaveError('Fidelity is required before saving.')
      return
    }
    setSaveError('')
    setSaveState('saving')
    const result = await onSaveEdits(talk.id, frontmatter, body)
    if (result.error) {
      setSaveState('idle')
      setSaveError(result.error)
      return
    }
    setSaveState('saved')
  }

  async function handleApprove() {
    setActionError('')
    if (isDirty) {
      const saved = await onSaveEdits(talk.id, frontmatter, body)
      if (saved.error) {
        setSaveError(saved.error)
        return
      }
    }
    const result = await onApprove(talk.id)
    if (result.error) setActionError(result.error)
  }

  async function handleReject() {
    if (!rejectNotes.trim()) return
    setActionError('')
    if (isDirty) {
      const saved = await onSaveEdits(talk.id, frontmatter, body)
      if (saved.error) {
        setSaveError(saved.error)
        return
      }
    }
    const result = await onReject(talk.id, rejectNotes.trim())
    if (result.error) {
      setActionError(result.error)
    } else {
      setRejecting(false)
      setRejectNotes('')
    }
  }

  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      overflow: 'hidden',
      background: talk.status === 'approved' ? '#f0faf4' : talk.status === 'rejected' ? '#fff8f0' : 'var(--color-paper)',
    }}>
      {/* Collapsed row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.875rem 1rem',
          cursor: 'pointer',
          userSelect: 'none' as const,
        }}
        onClick={() => {
          if (expanded && isDirty && !window.confirm('You have unsaved changes. Collapse anyway and discard local edits?')) return
          setExpanded(e => !e)
        }}
      >
        {/* Expand arrow */}
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--color-ink-tertiary)',
          flexShrink: 0,
          transform: expanded ? 'rotate(90deg)' : 'none',
          transition: 'transform 0.15s',
          display: 'inline-block',
        }}>
          ›
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--color-ink)' }}>
            {talk.speaker}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8125rem',
            color: 'var(--color-ink-tertiary)',
            marginLeft: '1rem',
          }}>
            {talkDate}
          </span>
        </div>

        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.8125rem',
          color: 'var(--color-ink-secondary)',
          whiteSpace: 'nowrap' as const,
        }}>
          {FIDELITY_SHORT[talk.fidelity] ?? talk.fidelity}
        </span>

        <span style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.6875rem',
          fontWeight: 500,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.04em',
          padding: '2px 10px',
          borderRadius: '9999px',
          background: `${status.color}22`,
          color: status.color,
          flexShrink: 0,
        }}>
          {status.label}
        </span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{
          borderTop: '1px solid var(--color-border-light)',
          padding: '1.25rem 1rem 1.25rem 1rem',
        }}>
          {/* Metadata grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem 2rem',
            background: 'var(--color-paper-warm)',
            borderRadius: 6,
            padding: '1rem',
            marginBottom: '1.25rem',
          }}>
            {Object.entries(frontmatter).map(([key, value]) => {
              const lower = key.toLowerCase()
              const isLongText = lower.includes('notes') || lower.includes('description')
              return (
                <label key={key} style={{ display: 'block' }}>
                  <div style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.6875rem',
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                    color: 'var(--color-ink-tertiary)',
                    marginBottom: '0.25rem',
                  }}>
                    {key}
                  </div>
                  {key === 'source_type' ? (
                    <select
                      value={String(value ?? '')}
                      onChange={e => updateField(key, e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 4 }}
                    >
                      {SOURCE_OPTIONS.map(([option, label]) => <option key={option} value={option}>{label}</option>)}
                    </select>
                  ) : key === 'fidelity' ? (
                    <select
                      value={String(value ?? '')}
                      onChange={e => updateField(key, e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 4 }}
                    >
                      {FIDELITY_OPTIONS.map(([option, label]) => <option key={option} value={option}>{label}</option>)}
                    </select>
                  ) : typeof value === 'boolean' ? (
                    <select
                      value={String(value)}
                      onChange={e => updateField(key, e.target.value === 'true')}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 4 }}
                    >
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : isLongText ? (
                    <textarea
                      value={String(value ?? '')}
                      onChange={e => updateField(key, e.target.value)}
                      rows={3}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 4, resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={String(value ?? '')}
                      onChange={e => updateField(key, e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 4 }}
                    />
                  )}
                </label>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', color: isDirty ? '#c17817' : 'var(--color-ink-tertiary)' }}>
              {isDirty ? 'Unsaved changes' : saveState === 'saved' ? 'All changes saved' : 'No local changes'}
            </span>
            <button
              onClick={handleSaveEdits}
              disabled={!isDirty || isPending || saveState === 'saving'}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8125rem',
                padding: '0.35rem 0.8rem',
                borderRadius: 4,
                border: '1px solid var(--color-border)',
                background: 'var(--color-paper)',
                opacity: (!isDirty || isPending || saveState === 'saving') ? 0.6 : 1,
                cursor: (!isDirty || isPending || saveState === 'saving') ? 'default' : 'pointer',
              }}
            >
              {saveState === 'saving' ? 'Saving…' : 'Save edits'}
            </button>
          </div>

          {/* Transcript */}
          <textarea
            value={body}
            onChange={e => { setBody(e.target.value); setSaveState('idle') }}
            rows={14}
            style={{
              width: '100%',
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              lineHeight: 1.5,
              padding: '1rem',
              background: 'var(--color-paper-warm)',
              borderRadius: 6,
              marginBottom: '0.75rem',
              border: '1px solid var(--color-border-light)',
              boxSizing: 'border-box',
            }}
          />
          {body ? (
            <div
              className="markdown-content"
              style={{
                maxHeight: 300,
                overflowY: 'auto' as const,
                padding: '1rem',
                background: 'var(--color-paper-warm)',
                borderRadius: 6,
                marginBottom: '1.25rem',
                border: '1px solid var(--color-border-light)',
              }}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
            </div>
          ) : (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: '0.9375rem',
              color: 'var(--color-ink-tertiary)',
              marginBottom: '1.25rem',
            }}>
              No transcript text.
            </p>
          )}

          {saveError && (
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              color: '#c17817',
              margin: '0 0 1rem',
            }}>
              {saveError}
            </p>
          )}

          {actionError && (
            <p style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              color: '#c17817',
              margin: '0 0 1rem',
            }}>
              {actionError}
            </p>
          )}

          {/* Actions — only shown for pending talks */}
          {talk.status === 'submitted' && (
            <>
              {rejecting ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'var(--color-ink-secondary)',
                  }}>
                    Reason for returning (shown to volunteer):
                  </label>
                  <textarea
                    value={rejectNotes}
                    onChange={e => setRejectNotes(e.target.value)}
                    rows={3}
                    placeholder="e.g. Missing source URL, transcript appears incomplete…"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.9375rem',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 4,
                      background: 'var(--color-paper)',
                      color: 'var(--color-ink)',
                      width: '100%',
                      outline: 'none',
                      resize: 'vertical' as const,
                      lineHeight: 1.5,
                      boxSizing: 'border-box' as const,
                    }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => { setRejecting(false); setRejectNotes('') }}
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.8125rem',
                        padding: '0.4375rem 1rem',
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
                      onClick={handleReject}
                      disabled={!rejectNotes.trim() || isPending}
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        padding: '0.4375rem 1rem',
                        border: 'none',
                        borderRadius: 4,
                        background: '#c17817',
                        color: 'white',
                        cursor: (!rejectNotes.trim() || isPending) ? 'default' : 'pointer',
                        opacity: (!rejectNotes.trim() || isPending) ? 0.6 : 1,
                      }}
                    >
                      {isPending ? 'Sending…' : 'Save changes and return for revision'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => setRejecting(true)}
                    disabled={isPending}
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.875rem',
                      padding: '0.5rem 1.25rem',
                      border: '1px solid var(--color-border)',
                      borderRadius: 4,
                      background: 'transparent',
                      color: 'var(--color-ink-secondary)',
                      cursor: isPending ? 'default' : 'pointer',
                      opacity: isPending ? 0.5 : 1,
                    }}
                  >
                    Return for Revision
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={isPending}
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      padding: '0.5rem 1.5rem',
                      border: 'none',
                      borderRadius: 4,
                      background: '#4a8c5c',
                      color: 'white',
                      cursor: isPending ? 'wait' : 'pointer',
                      opacity: isPending ? 0.6 : 1,
                    }}
                  >
                    {isPending ? 'Approving…' : 'Approve'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
