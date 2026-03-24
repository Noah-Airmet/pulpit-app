import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'

interface TocItem {
  id: string
  text: string
  level: number
}

function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split('\n')
  const items: TocItem[] = []
  for (const line of lines) {
    const m = line.match(/^(#{1,3})\s+(.+)$/)
    if (m) {
      const level = m[1].length
      const text = m[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      items.push({ id, text, level })
    }
  }
  return items
}

export function Guide() {
  const [content, setContent] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    fetch('/volunteer-guide.md')
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.text()
      })
      .then(setContent)
      .catch(() => setError(true))
  }, [])

  const toc = content ? extractToc(content).filter(item => item.level === 2) : []

  // Track active heading as user scrolls
  useEffect(() => {
    if (!toc.length) return
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px' }
    )
    setTimeout(() => {
      toc.forEach(item => {
        const el = document.getElementById(item.id)
        if (el) observer.observe(el)
      })
    }, 100)
    return () => observer.disconnect()
  }, [toc.length]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div style={{ maxWidth: 'var(--width-prose)', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink-tertiary)', fontStyle: 'italic' }}>
          Guide not found. Make sure volunteer-guide.md is in the public folder.
        </p>
      </div>
    )
  }

  if (!content) {
    return (
      <div style={{ maxWidth: 'var(--width-prose)', margin: '0 auto', padding: '4rem 1.5rem' }}>
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{ marginBottom: '0.75rem' }}>
            <div className="skeleton" style={{ height: 18, width: `${60 + Math.random() * 35}%` }} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 'var(--width-page)', margin: '0 auto', padding: '4rem 1.5rem 5rem' }}>
      <div style={{ display: 'flex', gap: '4rem', alignItems: 'flex-start' }}>
        {/* TOC sidebar */}
        {toc.length > 0 && (
          <aside
            style={{
              width: 220,
              flexShrink: 0,
              position: 'sticky',
              top: 76,
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto',
              display: 'none',
            }}
            className="guide-toc"
          >
            <div
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.6875rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-ink-tertiary)',
                marginBottom: '0.75rem',
              }}
            >
              Contents
            </div>
            <nav>
              {toc.map(item => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.8125rem',
                    lineHeight: 1.5,
                    padding: '0.25rem 0',
                    paddingLeft: `${(item.level - 2) * 12 + 8}px`,
                    color: activeId === item.id ? 'var(--color-accent)' : 'var(--color-ink-secondary)',
                    textDecoration: 'none',
                    borderLeft: `2px solid ${activeId === item.id ? 'var(--color-accent)' : 'transparent'}`,
                    transition: 'color 0.15s ease',
                  }}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </aside>
        )}

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, maxWidth: 'var(--width-prose)' }}>
          {/* Header + download button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '2.25rem',
                fontWeight: 600,
                margin: 0,
                color: 'var(--color-ink)',
                letterSpacing: '-0.01em',
              }}
            >
              Collection Guide
            </h1>
            <a
              href="/volunteer-guide.md"
              download="gc-archive-volunteer-collection-guide.md"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.8125rem',
                color: 'var(--color-ink-tertiary)',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
                alignSelf: 'center',
              }}
            >
              Download .md
            </a>
          </div>

          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug]}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Show TOC on desktop via media query */}
      <style>{`
        @media (min-width: 1024px) {
          .guide-toc { display: block !important; }
        }
      `}</style>
    </div>
  )
}
