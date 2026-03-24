import { Link } from 'react-router-dom'
import { FidelityBadge, FIDELITY_CONFIG } from './FidelityBadge'
import type { Talk, AlternateSource } from '../../types'

interface Props {
  talk: Talk
}

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.6875rem',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-ink-tertiary)',
  marginBottom: '0.75rem',
}

export function ProvenanceSidebar({ talk }: Props) {
  const fidelityConfig = FIDELITY_CONFIG[talk.fidelity]
  const fidelityDescription = fidelityConfig?.description ?? ''

  const hasNotes =
    talk.fidelity_notes &&
    talk.fidelity_notes !== 'No notes.' &&
    talk.fidelity_notes.trim() !== ''

  const alternates = (talk.alternate_sources ?? []) as AlternateSource[]

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Fidelity */}
      <div>
        <div style={sectionLabel}>Fidelity</div>
        <FidelityBadge fidelity={talk.fidelity} size="md" />
        {fidelityDescription && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              color: 'var(--color-ink-secondary)',
              lineHeight: 1.6,
              margin: '0.75rem 0 0',
            }}
          >
            {fidelityDescription}
          </p>
        )}
      </div>

      {/* Source */}
      <div>
        <div style={sectionLabel}>Source</div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            color: 'var(--color-ink)',
            marginBottom: '0.375rem',
          }}
        >
          {talk.source_type}
        </div>
        {talk.source_url && (
          <a
            href={talk.source_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
              color: 'var(--color-accent)',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
            }}
          >
            View original source →
          </a>
        )}
        {talk.collected_by && (
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--color-ink-tertiary)',
              marginTop: '0.75rem',
            }}
          >
            Collected by {talk.collected_by}
            {talk.collected_date &&
              ` · ${new Date(talk.collected_date + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}`}
          </div>
        )}
      </div>

      {/* Fidelity notes */}
      {hasNotes && (
        <div>
          <div style={sectionLabel}>Fidelity Notes</div>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              color: 'var(--color-ink-secondary)',
              lineHeight: 1.6,
              margin: 0,
              fontStyle: 'italic',
            }}
          >
            {talk.fidelity_notes}
          </p>
        </div>
      )}

      {/* Alternate sources */}
      {alternates.length > 0 && (
        <div>
          <div style={sectionLabel}>Alternate Sources</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {alternates.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-accent)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                }}
              >
                {src.title} ({src.type})
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Session context */}
      {talk.session_id && (
        <div>
          <div style={sectionLabel}>Session</div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              color: 'var(--color-ink-secondary)',
              marginBottom: '0.375rem',
            }}
          >
            {talk.conference}
            {talk.session_label ? ` · ${talk.session_label}` : ''}
          </div>
          <Link
            to="/archive"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8125rem',
              color: 'var(--color-accent)',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
            }}
          >
            Browse archive →
          </Link>
        </div>
      )}
    </aside>
  )
}
