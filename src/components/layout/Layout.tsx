import { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface Props {
  children: ReactNode
}

export function Layout({ children }: Props) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-paper)',
      }}
    >
      <Header />
      <main id="main-content" style={{ flex: 1, paddingTop: 104, position: 'relative', zIndex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}
