import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './components/auth/AuthProvider'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { Tracker } from './pages/Tracker'
import { Guide } from './pages/Guide'
import { About } from './pages/About'
import { SessionDetail } from './pages/SessionDetail'
import { TalkEditor } from './pages/TalkEditor'
import { ReviewQueue } from './pages/ReviewQueue'
import { ReviewSession } from './pages/ReviewSession'
import { Archive } from './pages/Archive'
import { TalkViewer } from './pages/TalkViewer'
import { Search } from './pages/Search'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/tracker/session/:sessionId" element={<SessionDetail />} />
            <Route path="/tracker/session/:sessionId/talk/new" element={<TalkEditor />} />
            <Route path="/tracker/session/:sessionId/talk/:talkId" element={<TalkEditor />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/talk/:id" element={<TalkViewer />} />
            <Route path="/search" element={<Search />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/about" element={<About />} />
            <Route path="/review" element={<ReviewQueue />} />
            <Route path="/review/session/:sessionId" element={<ReviewSession />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}
