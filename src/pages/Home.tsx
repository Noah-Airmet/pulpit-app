import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Session } from '../types'

interface Stats {
  total: number
  complete: number
  byEra: {
    era: string
    total: number
    complete: number
    in_progress: number
    in_review: number
  }[]
}

const ERA_ORDER = ['1830-1844', '1845-1850', '1850-1879', '1881-1896', '1897-present']
const ERA_COLORS: Record<string, string> = {
  '1830-1844': '#c17817',
  '1845-1850': '#a0522d',
  '1850-1879': '#b8860b',
  '1881-1896': '#b8860b',
  '1897-present': '#4a8c5c',
}

function computeStats(sessions: Session[]): Stats {
  const byEraMap: Record<string, { era: string; total: number; complete: number; in_progress: number; in_review: number }> = {}
  for (const era of ERA_ORDER) {
    byEraMap[era] = { era, total: 0, complete: 0, in_progress: 0, in_review: 0 }
  }

  let total = 0, complete = 0
  for (const s of sessions) {
    total++
    const era = byEraMap[s.era]
    if (era) {
      era.total++
      if (s.status === 'complete') { complete++; era.complete++ }
      else if (s.status === 'in_progress') era.in_progress++
      else if (s.status === 'in_review') era.in_review++
    }
  }
  return { total, complete, byEra: ERA_ORDER.map(e => byEraMap[e]) }
}

interface RecentActivity {
  id: string
  label: string
  status: string
  updated_at: string
}

const SECTION_CARDS = [
  {
    to: '/tracker',
    title: 'Volunteer Tracker',
    desc: 'Claim a conference session, collect the talks, and log your progress. See what others are working on in real time.',
    cta: 'Open tracker →',
  },
  {
    to: '/guide',
    title: 'Collection Guide',
    desc: 'Step-by-step instructions for finding and formatting talks from each era — from JSP to Internet Archive to the church website.',
    cta: 'Read the guide →',
  },
  {
    to: '/about',
    title: 'About the Project',
    desc: 'Why we\'re building this, who we are, and the sources and scholars who made it possible.',
    cta: 'Learn more →',
  },
]

export function Home() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [recent, setRecent] = useState<RecentActivity[]>([])

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('sessions').select('*')
      if (data) {
        setSessions(data)
        // Recent activity: last 5 updated sessions that are claimed/complete
        const activity = [...data]
          .filter(s => s.status !== 'unclaimed')
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
          .slice(0, 5)
        setRecent(activity.map(s => ({ id: s.id, label: s.label, status: s.status, updated_at: s.updated_at })))
      }
      setLoading(false)
    }
    load()
  }, [])

  const stats = computeStats(sessions)
  const completePct = stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const STATUS_VERB: Record<string, string> = {
    in_progress: 'claimed',
    in_review: 'submitted',
    complete: 'completed',
  }

  return (
    <div className="bg-historical-texture">
      {/* Hero */}
      <section
        style={{
          padding: '5rem 1.5rem 4rem',
          textAlign: 'center',
          background: 'transparent',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 'clamp(2.25rem, 6vw, 3.75rem)',
            color: 'var(--color-ink)',
            letterSpacing: '-0.01em',
            margin: '0 auto 1.25rem',
            maxWidth: 700,
            lineHeight: 1.15,
          }}
        >
          Every General Conference Talk, 1830 to Present
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1.1875rem',
            color: 'var(--color-ink-secondary)',
            lineHeight: 1.7,
            maxWidth: 580,
            margin: '0 auto',
          }}
        >
          A comprehensive archive with honest provenance metadata — who said it, where it was
          recorded, and how faithfully the text reflects the spoken word.
        </p>
        <Link
          to="/archive"
          style={{
            display: 'inline-block',
            fontFamily: 'var(--font-ui)',
            fontSize: '1rem',
            fontWeight: 500,
            color: 'white',
            background: 'var(--color-accent)',
            padding: '0.75rem 2rem',
            borderRadius: 8,
            textDecoration: 'none',
            transition: 'background 0.15s ease',
            marginTop: '2.5rem',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-accent-hover)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-accent)' }}
        >
          Browse the archive →
        </Link>
      </section>

      {/* Stats strip */}
      {!loading && (
        <section
          style={{
            padding: '2rem 1.5rem',
            textAlign: 'center',
            borderTop: '1px solid var(--color-border-light)',
            borderBottom: '1px solid var(--color-border-light)',
            background: 'var(--color-paper-warm)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2.5rem',
              flexWrap: 'wrap',
            }}
          >
            {[
              { number: stats.total, label: 'conference sessions' },
              { number: stats.complete, label: 'sessions complete' },
              { number: `${completePct}%`, label: 'overall progress' },
            ].map(item => (
              <div key={item.label}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.875rem',
                    fontWeight: 400,
                    color: 'var(--color-accent)',
                    letterSpacing: '-0.01em',
                    display: 'block',
                  }}
                >
                  {loading ? '—' : item.number}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                    color: 'var(--color-ink-secondary)',
                  }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Era progress bars */}
      <div style={{ background: 'var(--color-paper)' }}>
        <section
          style={{
          maxWidth: 680,
          margin: '0 auto',
          padding: '4rem 1.5rem',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            color: 'var(--color-ink)',
            marginTop: 0,
            marginBottom: '2rem',
          }}
        >
          Progress by Era
        </h2>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {ERA_ORDER.map(era => (
              <div key={era}>
                <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 8, width: '100%' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {stats.byEra.map(era => {
              const pct = era.total > 0 ? Math.round((era.complete / era.total) * 100) : 0
              const color = ERA_COLORS[era.era] ?? '#9ca3af'
              return (
                <div key={era.era}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '0.375rem',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8125rem',
                        color: 'var(--color-ink)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {era.era}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: 'var(--color-ink-tertiary)',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {era.complete} / {era.total}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: 'var(--color-border-light)',
                      borderRadius: 9999,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: color,
                        borderRadius: 9999,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Three cards */}
      <section
        style={{
          maxWidth: 'var(--width-page)',
          margin: '0 auto',
          padding: '0 1.5rem 5rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {SECTION_CARDS.map(card => (
            <Link
              key={card.to}
              to={card.to}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  background: 'var(--color-paper-warm)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  height: '100%',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.boxShadow = 'var(--shadow-md)'
                  el.style.borderColor = 'var(--color-accent-light)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.boxShadow = 'var(--shadow-sm)'
                  el.style.borderColor = 'var(--color-border)'
                }}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: 'var(--color-ink)',
                    margin: '0 0 0.75rem',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9375rem',
                    color: 'var(--color-ink-secondary)',
                    lineHeight: 1.65,
                    margin: '0 0 1.25rem',
                  }}
                >
                  {card.desc}
                </p>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--color-accent)',
                  }}
                >
                  {card.cta}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent activity */}
      {recent.length > 0 && (
        <section
          style={{
            maxWidth: 680,
            margin: '0 auto',
            padding: '0 1.5rem 5rem',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              color: 'var(--color-ink)',
              marginBottom: '1rem',
            }}
          >
            Recent activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recent.map(item => (
              <div
                key={item.id}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem',
                  color: 'var(--color-ink-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  borderBottom: '1px solid var(--color-border-light)',
                  paddingBottom: '0.5rem',
                }}
              >
                <span>
                  <em>{item.label}</em>
                  {' '}
                  <span style={{ color: 'var(--color-ink-tertiary)', fontSize: '0.875rem' }}>
                    {STATUS_VERB[item.status] ?? 'updated'}
                  </span>
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--color-ink-tertiary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {timeAgo(item.updated_at)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
      </div>
    </div>
  )
}
