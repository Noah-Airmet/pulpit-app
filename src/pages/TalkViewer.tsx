import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useTalk } from '../hooks/useTalk'
import { supabase } from '../lib/supabase'
import { FidelityBadge } from '../components/archive/FidelityBadge'
import { ProvenanceSidebar } from '../components/archive/ProvenanceSidebar'

function stripFrontmatter(markdown: string): string {
  return markdown.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n*/, '')
}

export function TalkViewer() {
  const { id } = useParams<{ id: string }>()
  const { talk, loading, error } = useTalk(id)
  const [prevTalk, setPrevTalk] = useState<{ id: string; speaker: string } | null>(null)
  const [nextTalk, setNextTalk] = useState<{ id: string; speaker: string } | null>(null)

  useEffect(() => {
    if (!talk?.session_id) {
      setPrevTalk(null)
      setNextTalk(null)
      return
    }

    const sessionId = talk.session_id
    const talkId = talk.id

    async function loadNeighbors() {
      const { data } = await supabase
        .from('talks')
        .select('id, speaker, talk_date')
        .eq('session_id', sessionId)
        .eq('needs_review', false)
        .order('talk_date', { ascending: true })
        .order('speaker', { ascending: true })

      if (data && data.length > 1) {
        const idx = data.findIndex(t => t.id === talkId)
        setPrevTalk(idx > 0 ? { id: data[idx - 1].id, speaker: data[idx - 1].speaker } : null)
        setNextTalk(idx < data.length - 1 ? { id: data[idx + 1].id, speaker: data[idx + 1].speaker } : null)
      } else {
        setPrevTalk(null)
        setNextTalk(null)
      }
    }

    loadNeighbors()
  }, [talk?.id, talk?.session_id])

  if (loading) {
    return (
      <div style={{ maxWidth: 'var(--width-page)', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div className="skeleton" style={{ width: '60%', height: 36, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: '40%', height: 24, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: '30%', height: 18, marginBottom: 40 }} />
        {[...Array(10)].map((_, i) => (
          <div key={i} className="skeleton" style={{ width: `${70 + Math.random() * 25}%`, height: 18, marginBottom: 12 }} />
        ))}
      </div>
    )
  }

  if (error || !talk) {
    return (
      <div style={{ maxWidth: 'var(--width-prose)', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            color: 'var(--color-ink)',
            marginBottom: '1rem',
          }}
        >
          Talk not found
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink-secondary)' }}>
          {error ?? 'This talk may not exist or may still be under review.'}
        </p>
        <Link
          to="/archive"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.875rem',
            color: 'var(--color-accent)',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            marginTop: '1.5rem',
            display: 'inline-block',
          }}
        >
          ← Back to archive
        </Link>
      </div>
    )
  }

  const content = talk.transcript_markdown
    ? stripFrontmatter(talk.transcript_markdown)
    : talk.transcript_text ?? ''

  const talkDate = new Date(talk.talk_date + 'T00:00:00')
  const displayDate = talkDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div style={{ maxWidth: 'var(--width-page)', margin: '0 auto', padding: '2.5rem 1.5rem 4rem' }}>
      {/* Back link */}
      <Link
        to="/archive"
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.8125rem',
          color: 'var(--color-ink-tertiary)',
          textDecoration: 'none',
          marginBottom: '1.5rem',
          display: 'inline-block',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-accent)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-ink-tertiary)' }}
      >
        ← Back to archive
      </Link>

      <div style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
        {/* Main content */}
        <article style={{ flex: 1, minWidth: 0, maxWidth: 'var(--width-prose)' }}>
          {/* Talk header */}
          <header style={{ marginBottom: '2.5rem' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.25rem',
                fontWeight: 600,
                color: 'var(--color-ink)',
                margin: '0 0 0.375rem',
                letterSpacing: '-0.01em',
                lineHeight: 1.15,
              }}
            >
              {talk.speaker}
            </h1>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: '1.375rem',
                color: 'var(--color-ink-secondary)',
                marginBottom: '0.75rem',
                lineHeight: 1.3,
              }}
            >
              {talk.source_title}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: 'var(--color-ink-tertiary)',
                marginBottom: '0.5rem',
              }}
            >
              {talk.conference}
              {talk.session_label ? ` · ${talk.session_label}` : ''}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                color: 'var(--color-ink-tertiary)',
                marginBottom: '1rem',
              }}
            >
              {displayDate}
            </div>
            <FidelityBadge fidelity={talk.fidelity} size="md" />
          </header>

          {/* Transcript */}
          <div
            className="markdown-content"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1.125rem',
              lineHeight: 1.7,
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>

          {/* Navigation footer */}
          <nav
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--color-border-light)',
              marginTop: '3rem',
              paddingTop: '1.5rem',
            }}
          >
            {prevTalk ? (
              <Link
                to={`/talk/${prevTalk.id}`}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  color: 'var(--color-accent)',
                  textDecoration: 'none',
                }}
              >
                ← {prevTalk.speaker}
              </Link>
            ) : (
              <span />
            )}
            {nextTalk ? (
              <Link
                to={`/talk/${nextTalk.id}`}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  color: 'var(--color-accent)',
                  textDecoration: 'none',
                }}
              >
                {nextTalk.speaker} →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </article>

        {/* Provenance sidebar — desktop */}
        <div
          className="talk-sidebar"
          style={{
            width: 280,
            flexShrink: 0,
            position: 'sticky',
            top: 76,
            display: 'none',
          }}
        >
          <ProvenanceSidebar talk={talk} />
        </div>
      </div>

      {/* Provenance — mobile (below transcript) */}
      <div className="talk-sidebar-mobile" style={{ display: 'none' }}>
        <div
          style={{
            borderTop: '1px solid var(--color-border-light)',
            marginTop: '2rem',
            paddingTop: '2rem',
          }}
        >
          <ProvenanceSidebar talk={talk} />
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .talk-sidebar { display: block !important; }
        }
        @media (max-width: 1023px) {
          .talk-sidebar-mobile { display: block !important; }
        }
      `}</style>
    </div>
  )
}
