import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { TrackerBoard } from '../components/tracker/TrackerBoard'

export function Tracker() {
  return (
    <ProtectedRoute>
      <div
        style={{
          maxWidth: 'var(--width-page)',
          margin: '0 auto',
          padding: '3rem 1.5rem 4rem',
        }}
      >
        <div style={{ marginBottom: '2.5rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.25rem',
              fontWeight: 600,
              color: 'var(--color-ink)',
              margin: '0 0 0.5rem',
              letterSpacing: '-0.01em',
            }}
          >
            Volunteer Tracker
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.0625rem',
              color: 'var(--color-ink-secondary)',
              margin: '0 0 1.25rem',
              lineHeight: 1.6,
            }}
          >
            Claim a conference session, collect the talks, and mark it complete when done.
            Updates appear live for all volunteers.
          </p>
          <a
            href="https://drive.google.com/drive/folders/12KwHNjiJGmxlUDAjWJyGuBwJ0w7TG1xp?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--color-accent)',
              background: 'var(--color-accent-subtle)',
              border: '1px solid var(--color-accent-light)',
              borderRadius: 6,
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent-subtle)')}
          >
            <span>📁</span> Upload completed files → Google Drive
          </a>
        </div>
        <TrackerBoard />
      </div>
    </ProtectedRoute>
  )
}
