export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border-light)',
        marginTop: 'auto',
        padding: '2rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--color-ink-tertiary)',
          letterSpacing: '0.02em',
          margin: 0,
        }}
      >
        GC Archive · {year} · A private project for personal study · Not affiliated with The Church of Jesus Christ of Latter-day Saints
      </p>
    </footer>
  )
}
