export const FIDELITY_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  verbatim: {
    label: 'Verbatim',
    color: '#2d6a4f',
    description: 'Copied directly from an official source. Matches spoken and/or published text.',
  },
  near_verbatim: {
    label: 'Near Verbatim',
    color: '#4a7c59',
    description: 'Minor transcription differences (punctuation, minor edits). Faithful to the original.',
  },
  edited: {
    label: 'Edited',
    color: '#b8860b',
    description: 'The published version was editorially revised from what was spoken.',
  },
  summary: {
    label: 'Summary',
    color: '#c17817',
    description: 'A summary or abstract rather than the full talk. Significant content may be missing.',
  },
  reconstructed: {
    label: 'Reconstructed',
    color: '#a0522d',
    description: 'Assembled from partial or secondary sources. Treat as approximate.',
  },
  normalized: {
    label: 'Normalized',
    color: '#8b6914',
    description: 'Original language was modernized or normalized. Period characteristics may be lost.',
  },
}

interface Props {
  fidelity: string
  size?: 'sm' | 'md'
}

export function FidelityBadge({ fidelity, size = 'sm' }: Props) {
  const config = FIDELITY_CONFIG[fidelity] ?? { label: fidelity, color: '#9ca3af', description: '' }
  const fontSize = size === 'md' ? '0.75rem' : '0.6875rem'
  const padding = size === 'md' ? '3px 12px' : '2px 10px'

  return (
    <span
      style={{
        fontFamily: 'var(--font-ui)',
        fontSize,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        padding,
        borderRadius: '9999px',
        background: `${config.color}26`,
        color: config.color,
        display: 'inline-block',
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  )
}
