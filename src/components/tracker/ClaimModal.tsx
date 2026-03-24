import { useState } from 'react'
import type { Session } from '../../types'

interface ClaimModalProps {
  session: Session
  mode: 'claim' | 'complete'
  onConfirm: (data?: { talk_count: number; notes?: string; drive_link?: string }) => Promise<void>
  onCancel: () => void
  isPending: boolean
}

export function ClaimModal({ session, mode, onConfirm, onCancel, isPending }: ClaimModalProps) {
  const [talkCount, setTalkCount] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [driveLink, setDriveLink] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (mode === 'complete') {
      const count = parseInt(talkCount, 10)
      if (!talkCount || isNaN(count) || count < 1) {
        setError('Please enter the number of talks found.')
        return
      }
      await onConfirm({ talk_count: count, notes: notes || undefined, drive_link: driveLink || undefined })
    } else {
      await onConfirm()
    }
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9375rem',
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--color-border)',
    borderRadius: 4,
    background: 'var(--color-paper)',
    color: 'var(--color-ink)',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backdropFilter: 'blur(4px)',
        background: 'rgba(26, 26, 26, 0.3)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div
        style={{
          background: 'var(--color-paper)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          boxShadow: 'var(--shadow-lg)',
          padding: '2rem',
          maxWidth: 460,
          width: '100%',
          animation: 'modalSlideUp 0.25s ease-out',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            marginTop: 0,
            marginBottom: '0.5rem',
            color: 'var(--color-ink)',
          }}
        >
          {mode === 'claim' ? 'Claim session' : 'Mark as complete'}
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.9375rem',
            color: 'var(--color-ink-secondary)',
            marginBottom: '1.5rem',
            lineHeight: 1.6,
          }}
        >
          {session.label}
        </p>

        {mode === 'complete' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--color-ink-secondary)',
                  display: 'block',
                  marginBottom: '0.375rem',
                }}
              >
                Number of talks found *
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 12"
                value={talkCount}
                onChange={e => { setTalkCount(e.target.value); setError('') }}
                style={{ ...inputStyle, width: 120 }}
              />
              {error && (
                <p style={{ color: '#c17817', fontSize: '0.8125rem', fontFamily: 'var(--font-ui)', marginTop: '0.25rem' }}>
                  {error}
                </p>
              )}
            </div>

            <div>
              <label
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--color-ink-secondary)',
                  display: 'block',
                  marginBottom: '0.375rem',
                }}
              >
                Google Drive folder link (optional)
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/…"
                value={driveLink}
                onChange={e => setDriveLink(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--color-ink-secondary)',
                  display: 'block',
                  marginBottom: '0.375rem',
                }}
              >
                Notes (optional)
              </label>
              <textarea
                placeholder="Any notes about sources used, gaps found, or issues…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            onClick={onCancel}
            disabled={isPending}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              fontWeight: 400,
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
            onClick={handleSubmit}
            disabled={isPending}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              fontWeight: 500,
              padding: '0.5rem 1.25rem',
              borderRadius: 4,
              border: 'none',
              background: 'var(--color-accent)',
              color: 'white',
              cursor: isPending ? 'wait' : 'pointer',
              opacity: isPending ? 0.7 : 1,
              transition: 'background 0.15s ease',
            }}
          >
            {isPending ? 'Saving…' : mode === 'claim' ? 'Claim' : 'Submit'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
