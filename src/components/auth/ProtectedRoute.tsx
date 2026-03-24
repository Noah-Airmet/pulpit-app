import { ReactNode } from 'react'
import { useAuth } from './AuthProvider'

interface Props {
  children: ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { session, loading, signInWithGoogle } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-paper)' }}>
        <div className="text-center">
          <div className="skeleton" style={{ width: 200, height: 20, margin: '0 auto 12px' }} />
          <div className="skeleton" style={{ width: 140, height: 16, margin: '0 auto' }} />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-paper)' }}>
        <div className="text-center max-w-sm">
          <h2
            className="mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.875rem',
              color: 'var(--color-ink)',
            }}
          >
            Sign in to continue
          </h2>
          <p
            className="mb-8"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-ink-secondary)',
              lineHeight: 1.7,
            }}
          >
            The volunteer tracker requires authentication. Sign in with your Google account to claim
            and track conference sessions.
          </p>
          <button
            onClick={signInWithGoogle}
            style={{
              background: 'var(--color-accent)',
              color: 'white',
              fontFamily: 'var(--font-ui)',
              fontWeight: 500,
              fontSize: '0.875rem',
              padding: '0.625rem 1.75rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
