import { useState } from 'react'

interface Props {
  talkCount: number
  sessionLabel: string
  onSubmit: () => Promise<{ error?: string }>
  disabled?: boolean
}

export function SubmitForReviewButton({ talkCount, sessionLabel, onSubmit, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setSubmitting(true)
    setError('')
    const result = await onSubmit()
    setSubmitting(false)
    if (result.error) {
      setError(result.error)
    } else {
      setOpen(false)
    }
  }

  if (talkCount === 0) {
    return (
      <button disabled style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '0.875rem',
        fontWeight: 500,
        padding: '0.5625rem 1.5rem',
        borderRadius: 4,
        border: 'none',
        background: 'var(--color-border)',
        color: 'var(--color-ink-tertiary)',
        cursor: 'default',
      }}>
        Submit for Review
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={disabled}
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.875rem',
          fontWeight: 500,
          padding: '0.5625rem 1.5rem',
          borderRadius: 4,
          border: 'none',
          background: 'var(--color-accent)',
          color: 'white',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'var(--color-accent-hover)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-accent)' }}
      >
        Submit for Review
      </button>

      {open && (
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
            maxWidth: 480,
            width: '100%',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: '1.25rem',
              fontWeight: 400,
              color: 'var(--color-ink)',
              margin: '0 0 1rem',
            }}>
              Submit for Review
            </h2>

            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              color: 'var(--color-ink)',
              lineHeight: 1.6,
              margin: '0 0 0.75rem',
            }}>
              You're submitting <strong>{talkCount} talk{talkCount !== 1 ? 's' : ''}</strong> from{' '}
              <em>{sessionLabel}</em> for review.
            </p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              color: 'var(--color-ink-secondary)',
              lineHeight: 1.6,
              margin: '0 0 1.5rem',
            }}>
              Once submitted, you won't be able to edit these talks until the reviewer has finished. Any talks returned for revision will be flagged with notes.
            </p>

            {error && (
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.875rem',
                color: '#c17817',
                margin: '0 0 1rem',
              }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setOpen(false); setError('') }}
                disabled={submitting}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  padding: '0.5rem 1.25rem',
                  borderRadius: 4,
                  border: '1px solid var(--color-border)',
                  background: 'transparent',
                  color: 'var(--color-ink-secondary)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  padding: '0.5rem 1.5rem',
                  borderRadius: 4,
                  border: 'none',
                  background: 'var(--color-accent)',
                  color: 'white',
                  cursor: submitting ? 'wait' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
