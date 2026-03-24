import { Link } from 'react-router-dom'
import type { Talk } from '../../../types'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft:     { label: 'Draft',     color: '#9ca3af' },
  submitted: { label: 'Submitted', color: '#6b7de0' },
  approved:  { label: 'Approved',  color: '#4a8c5c' },
  rejected:  { label: 'Returned',  color: '#c17817' },
}

const FIDELITY_SHORT: Record<string, string> = {
  verbatim:      'Verbatim',
  near_verbatim: 'Near Verbatim',
  edited:        'Edited',
  summary:       'Summary',
  reconstructed: 'Reconstructed',
  normalized:    'Normalized',
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
  return (
    <span style={{
      fontFamily: 'var(--font-ui)',
      fontSize: '0.6875rem',
      fontWeight: 500,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.04em',
      padding: '2px 10px',
      borderRadius: '9999px',
      background: `${cfg.color}22`,
      color: cfg.color,
      display: 'inline-block',
      whiteSpace: 'nowrap' as const,
    }}>
      {cfg.label}
    </span>
  )
}

interface Props {
  talks: Talk[]
  sessionId: string
  canEdit: boolean     // true if this is the claimer and session is in_progress
  onDelete: (talkId: string) => void
  deletePending: string | null
}

export function TalkList({ talks, sessionId, canEdit, onDelete, deletePending }: Props) {
  if (talks.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem 1rem',
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
          No talks added yet.
        </p>
        {canEdit && (
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            color: 'var(--color-ink-tertiary)',
            margin: '0.5rem 0 0',
          }}>
            Click "Add Talk" below to get started.
          </p>
        )}
      </div>
    )
  }

  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto auto',
        gap: '1rem',
        padding: '0.625rem 1rem',
        background: 'var(--color-paper-warm)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {['Speaker', 'Date', 'Fidelity', 'Status', ''].map(h => (
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

      {/* Rows */}
      {talks.map((talk, i) => {
        const isEditable = canEdit && (talk.status === 'draft' || talk.status === 'rejected')
        const isLast = i === talks.length - 1
        const talkDate = talk.talk_date
          ? new Date(talk.talk_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '—'

        return (
          <div
            key={talk.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto auto',
              gap: '1rem',
              padding: '0.75rem 1rem',
              alignItems: 'center',
              borderBottom: isLast ? 'none' : '1px solid var(--color-border-light)',
              background: talk.status === 'rejected' ? '#fff8f0' : undefined,
            }}
          >
            {/* Speaker */}
            <div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.9375rem',
                color: 'var(--color-ink)',
                lineHeight: 1.3,
              }}>
                {talk.speaker}
              </div>
              {talk.rejection_notes && (
                <div style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.75rem',
                  color: '#c17817',
                  marginTop: '0.25rem',
                  lineHeight: 1.4,
                }}>
                  Returned: {talk.rejection_notes}
                </div>
              )}
            </div>

            {/* Date */}
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              color: 'var(--color-ink-secondary)',
              whiteSpace: 'nowrap' as const,
            }}>
              {talkDate}
            </div>

            {/* Fidelity */}
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
              color: 'var(--color-ink-secondary)',
              whiteSpace: 'nowrap' as const,
            }}>
              {FIDELITY_SHORT[talk.fidelity] ?? talk.fidelity}
            </div>

            {/* Status */}
            <StatusBadge status={talk.status} />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              {isEditable ? (
                <>
                  <Link
                    to={`/tracker/session/${sessionId}/talk/${talk.id}`}
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'var(--color-accent)',
                      textDecoration: 'none',
                      padding: '0.25rem 0.625rem',
                      border: '1px solid var(--color-accent)',
                      borderRadius: 4,
                      whiteSpace: 'nowrap' as const,
                    }}
                  >
                    Edit
                  </Link>
                  {talk.status === 'draft' && (
                    <button
                      onClick={() => onDelete(talk.id)}
                      disabled={deletePending === talk.id}
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.75rem',
                        color: 'var(--color-ink-tertiary)',
                        background: 'none',
                        border: 'none',
                        cursor: deletePending === talk.id ? 'default' : 'pointer',
                        opacity: deletePending === talk.id ? 0.5 : 1,
                        padding: '0.25rem 0.375rem',
                        textDecoration: 'underline',
                        textUnderlineOffset: '2px',
                        whiteSpace: 'nowrap' as const,
                      }}
                    >
                      Delete
                    </button>
                  )}
                </>
              ) : (
                <Link
                  to={`/tracker/session/${sessionId}/talk/${talk.id}`}
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.75rem',
                    color: 'var(--color-ink-secondary)',
                    textDecoration: 'underline',
                    textUnderlineOffset: '2px',
                    whiteSpace: 'nowrap' as const,
                  }}
                >
                  View
                </Link>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
