import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

function navLinkStyle(active: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-ui)',
    fontSize: '0.875rem',
    fontWeight: active ? 500 : 400,
    color: active ? 'var(--color-accent)' : 'var(--color-ink-secondary)',
    textDecoration: 'none',
    padding: '0.375rem 0.75rem',
    borderRadius: '4px',
    transition: 'color 0.15s ease',
  }
}

export function Header() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const isAdmin = profile?.is_admin === true
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [dropdownOpen])

  useEffect(() => {
    setDropdownOpen(false)
  }, [location.pathname])

  const archiveActive = location.pathname.startsWith('/archive') || location.pathname.startsWith('/talk/') || location.pathname.startsWith('/search')
  const aboutActive = location.pathname === '/about'
  const contributeActive = ['/tracker', '/guide', '/review'].some(p => location.pathname.startsWith(p))

  const DROPDOWN_LINKS = [
    { to: '/tracker', label: 'Volunteer Tracker' },
    { to: '/guide', label: 'Collection Guide' },
    ...(isAdmin ? [{ to: '/review', label: 'Review Queue' }] : []),
  ]

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
          gap: '1.5rem',
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

        {/* Nav — always right-aligned */}
        <nav style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Link
            to="/archive"
            style={navLinkStyle(archiveActive)}
            onMouseEnter={e => { if (!archiveActive) e.currentTarget.style.color = 'var(--color-ink)' }}
            onMouseLeave={e => { if (!archiveActive) e.currentTarget.style.color = 'var(--color-ink-secondary)' }}
          >
            Archive
          </Link>
          <Link
            to="/about"
            style={navLinkStyle(aboutActive)}
            onMouseEnter={e => { if (!aboutActive) e.currentTarget.style.color = 'var(--color-ink)' }}
            onMouseLeave={e => { if (!aboutActive) e.currentTarget.style.color = 'var(--color-ink-secondary)' }}
          >
            About
          </Link>

          {/* Contribute dropdown */}
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(prev => !prev)}
              style={{
                ...navLinkStyle(contributeActive || dropdownOpen),
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
              onMouseEnter={e => {
                if (!contributeActive) e.currentTarget.style.color = 'var(--color-ink)'
              }}
              onMouseLeave={e => {
                if (!contributeActive && !dropdownOpen) e.currentTarget.style.color = 'var(--color-ink-secondary)'
              }}
            >
              Contribute
              <span style={{ fontSize: '0.625rem', marginTop: 1 }}>▾</span>
            </button>
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 4,
                  background: 'var(--color-paper)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  boxShadow: 'var(--shadow-md)',
                  padding: '0.375rem 0',
                  minWidth: 180,
                  zIndex: 200,
                }}
              >
                {DROPDOWN_LINKS.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.8125rem',
                      color: location.pathname.startsWith(link.to)
                        ? 'var(--color-accent)'
                        : 'var(--color-ink-secondary)',
                      textDecoration: 'none',
                      padding: '0.5rem 1rem',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-accent-subtle)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '' }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
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
