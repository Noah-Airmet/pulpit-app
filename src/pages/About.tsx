export function About() {
  return (
    <div
      style={{
        maxWidth: 'var(--width-prose)',
        margin: '0 auto',
        padding: '4rem 1.5rem 5rem',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.25rem',
          fontWeight: 600,
          color: 'var(--color-ink)',
          marginTop: 0,
          marginBottom: '2rem',
          letterSpacing: '-0.01em',
        }}
      >
        About the Project
      </h1>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-ink)' }}>
          What we're building
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', lineHeight: 1.7, color: 'var(--color-ink-secondary)', marginBottom: '1.5em' }}>
          Pulpit is a comprehensive, searchable archive of every General Conference talk in the history
          of The Church of Jesus Christ of Latter-day Saints — from the first conferences in 1830 to the
          present day.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', lineHeight: 1.7, color: 'var(--color-ink-secondary)', marginBottom: '1.5em' }}>
          No unified resource like this currently exists. The Church website goes back only to 1971. The
          BYU Scripture Citation Index reaches the 1940s. Earlier sources are fragmented across the
          Internet Archive, Journal of Discourses, Joseph Smith Papers, and various personal sites.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', lineHeight: 1.7, color: 'var(--color-ink-secondary)', marginBottom: 0 }}>
          Our goal is a single, honest, well-documented collection: full transcripts where they exist,
          faithful summaries where they don't, and transparent provenance metadata describing <em>how
          trustworthy</em> each transcript actually is.
        </p>
      </section>

      <div style={{ borderTop: '1px solid var(--color-border-light)', margin: '0 0 3rem', textAlign: 'center', paddingTop: '1.5rem' }}>
        <span style={{ color: 'var(--color-accent-light)', fontSize: '0.875rem' }}>❧</span>
      </div>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-ink)' }}>
          Who we are
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', lineHeight: 1.7, color: 'var(--color-ink-secondary)', marginBottom: '1.5em' }}>
          This is a private project built by a small group of LDS church history enthusiasts. We are not
          historians by profession — we're people who find this material fascinating and believe it
          deserves to be more accessible.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', lineHeight: 1.7, color: 'var(--color-ink-secondary)', marginBottom: 0 }}>
          This project is <strong>not affiliated with</strong> The Church of Jesus Christ of Latter-day
          Saints. It is intended for personal study only.
        </p>
      </section>

      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-ink)' }}>
          Acknowledgments
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', lineHeight: 1.7, color: 'var(--color-ink-secondary)', marginBottom: '1.5em' }}>
          This project would not be possible without the work of many institutions and individuals:
        </p>
        <ul style={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', lineHeight: 1.7, color: 'var(--color-ink-secondary)', paddingLeft: '1.75rem', marginBottom: 0 }}>
          <li style={{ marginBottom: '0.5em' }}>
            <strong>The Joseph Smith Papers Project</strong> — for their meticulous transcription and
            digitization of early Church records
          </li>
          <li style={{ marginBottom: '0.5em' }}>
            <strong>BYU Harold B. Lee Library</strong> — for digitizing the Journal of Discourses and
            maintaining the ContentDM collections
          </li>
          <li style={{ marginBottom: '0.5em' }}>
            <strong>The Internet Archive</strong> — for hosting Conference Reports and making them
            freely available
          </li>
          <li style={{ marginBottom: '0.5em' }}>
            <strong>The Utah Digital Newspapers project (University of Utah)</strong> — for the
            searchable Deseret News archive
          </li>
          <li style={{ marginBottom: '0.5em' }}>
            <strong>LaJean Purcell Carruth</strong> — for her lifetime of work transcribing George D.
            Watt's Pitman shorthand notebooks
          </li>
          <li style={{ marginBottom: '0.5em' }}>
            <strong>Elden Watson</strong> — whose conference talk index at{' '}
            <a
              href="https://www.eldenwatson.net/ECCRintro.htm"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-accent)', textDecoration: 'underline', textUnderlineOffset: '2px' }}
            >
              eldenwatson.net
            </a>{' '}
            has been an invaluable finding aid
          </li>
          <li style={{ marginBottom: 0 }}>
            <strong>The Wilford Woodruff Papers Foundation</strong> — for making Woodruff's journals
            searchable and accessible
          </li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-ink)' }}>
          Copyright & use
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', lineHeight: 1.7, color: 'var(--color-ink-secondary)', marginBottom: '1.5em' }}>
          Historical documents published before 1928 are in the public domain in the United States.
          Transcripts from 1971 onwards are copyrighted by The Church of Jesus Christ of Latter-day
          Saints and are used here for personal study purposes only under fair use provisions.
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.0625rem', lineHeight: 1.7, color: 'var(--color-ink-secondary)', marginBottom: 0 }}>
          This archive is private and not publicly distributed. If you have questions about this
          project, reach out through the group.
        </p>
      </section>
    </div>
  )
}
