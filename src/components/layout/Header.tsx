import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/tracker', label: 'Tracker' },
  { to: '/archive', label: 'Archive' },
  { to: '/guide', label: 'Guide' },
  { to: '/about', label: 'About' },
]

export function Header() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const isAdmin = profile?.is_admin === true

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'var(--color-paper)',
        borderBottom: '1px solid var(--color-border-light)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div
        style={{
          maxWidth: 'var(--width-page)',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem',
        }}
      >
        {/* Logo */}
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: '1.25rem',
            fontWeight: 400,
            color: 'var(--color-ink)',
            textDecoration: 'none',
            letterSpacing: '-0.01em',
            flexShrink: 0,
          }}
        >
          GC Archive
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {NAV_LINKS.map(link => {
            const active = link.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(link.to)
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  fontWeight: active ? 500 : 400,
                  color: active ? 'var(--color-accent)' : 'var(--color-ink-secondary)',
                  textDecoration: 'none',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '4px',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.color = 'var(--color-ink)'
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.color = 'var(--color-ink-secondary)'
                }}
              >
                {link.label}
              </Link>
            )
          })}
          {isAdmin && (
            <Link
              to="/review"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.875rem',
                fontWeight: location.pathname.startsWith('/review') ? 500 : 400,
                color: location.pathname.startsWith('/review') ? 'var(--color-accent)' : 'var(--color-ink-secondary)',
                textDecoration: 'none',
                padding: '0.375rem 0.75rem',
                borderRadius: '4px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!location.pathname.startsWith('/review')) e.currentTarget.style.color = 'var(--color-ink)'
              }}
              onMouseLeave={e => {
                if (!location.pathname.startsWith('/review')) e.currentTarget.style.color = 'var(--color-ink-secondary)'
              }}
            >
              Review
            </Link>
          )}
        </nav>

        {/* User area */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {profile?.avatar_url && (
              <img
                src={profile.avatar_url}
                alt={profile.display_name ?? 'User avatar'}
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
              />
            )}
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8125rem',
                color: 'var(--color-ink-secondary)',
              }}
            >
              {profile?.display_name ?? user.email}
            </span>
            <button
              onClick={signOut}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8125rem',
                color: 'var(--color-ink-tertiary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem 0',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
