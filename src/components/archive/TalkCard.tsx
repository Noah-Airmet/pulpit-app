import { Link } from 'react-router-dom'
import { FidelityBadge } from './FidelityBadge'

interface Props {
  id: string
  speaker: string
  talk_date: string
  conference: string
  session_label?: string | null
  source_title: string
  fidelity: string
  snippet?: string | null
}

export function TalkCard({ id, speaker, talk_date, conference, session_label, source_title, fidelity, snippet }: Props) {
  const date = new Date(talk_date + 'T00:00:00')
  const displayDate = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  return (
    <Link
      to={`/talk/${id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div
        className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 p-4 border-b border-border-light transition-colors duration-150 hover:bg-accent-subtle"
      >
        {/* Date and Fidelity - Mobile top row */}
        <div className="flex justify-between items-center sm:hidden w-full mb-1">
          <span className="font-mono text-[0.8125rem] text-ink-tertiary tracking-wide">
            {displayDate}
          </span>
          <FidelityBadge fidelity={fidelity} />
        </div>

        {/* Date - Desktop */}
        <div className="hidden sm:block min-w-[80px] shrink-0 pt-[2px]">
          <span className="font-mono text-[0.8125rem] text-ink-tertiary tracking-wide">
            {displayDate}
          </span>
        </div>

        {/* Speaker */}
        <div className="sm:min-w-[160px] shrink-0">
          <span className="font-display text-[0.9375rem] text-ink">
            {speaker}
          </span>
        </div>

        {/* Title + session + snippet */}
        <div className="flex-1 min-w-0 w-full mt-1 sm:mt-0">
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.9375rem',
              color: 'var(--color-accent)',
              marginBottom: '0.25rem',
            }}
          >
            {source_title}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--color-ink-tertiary)',
            }}
          >
            {conference}
            {session_label ? ` · ${session_label}` : ''}
          </div>
          {snippet && (
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.8125rem',
                color: 'var(--color-ink-secondary)',
                marginTop: '0.375rem',
                lineHeight: 1.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {snippet}
            </div>
          )}
        </div>

        {/* Fidelity badge - Desktop */}
        <div className="hidden sm:block shrink-0 pt-[2px]">
          <FidelityBadge fidelity={fidelity} />
        </div>
      </div>
    </Link>
  )
}
