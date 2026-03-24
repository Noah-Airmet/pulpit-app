import { useMemo, useState } from 'react'
import { useSessions } from '../../hooks/useSessions'
import { useSessionActions } from '../../hooks/useSessionActions'
import { useAuth } from '../auth/AuthProvider'
import { StatsBar } from './StatsBar'
import { FilterControls } from './FilterControls'
import { SessionRow } from './SessionRow'
import { ClaimModal } from './ClaimModal'
import type { TrackerFilters, Session, EraType, OverallStats, EraStats } from '../../types'

const ERA_ORDER: EraType[] = ['1830-1844', '1845-1850', '1850-1879', '1881-1896', '1897-present']

const ERA_LABELS: Record<EraType, string> = {
  '1830-1844': 'Early Church (1830–1844)',
  '1845-1850': 'Exodus Era (1845–1850)',
  '1850-1879': 'Pioneer Era (1850–1879)',
  '1881-1896': 'Late 19th Century (1881–1896)',
  '1897-present': 'Modern Era (1897–Present)',
}

const ERA_DIFFICULTY_COLORS: Record<EraType, string> = {
  '1830-1844': '#c17817',
  '1845-1850': '#a0522d',
  '1850-1879': '#b8860b',
  '1881-1896': '#b8860b',
  '1897-present': '#4a8c5c',
}

interface ModalState {
  session: Session
  mode: 'claim' | 'complete'
}

function computeStats(sessions: Session[]): OverallStats {
  const byEraMap: Record<string, EraStats> = {}

  for (const era of ERA_ORDER) {
    byEraMap[era] = { era, total: 0, unclaimed: 0, in_progress: 0, in_review: 0, complete: 0 }
  }

  let total = 0, unclaimed = 0, in_progress = 0, in_review = 0, complete = 0

  for (const s of sessions) {
    total++
    const eraStats = byEraMap[s.era]
    if (eraStats) {
      eraStats.total++
      eraStats[s.status as keyof EraStats]
    }

    switch (s.status) {
      case 'unclaimed':   unclaimed++;   if (eraStats) eraStats.unclaimed++;   break
      case 'in_progress': in_progress++; if (eraStats) eraStats.in_progress++; break
      case 'in_review':   in_review++;   if (eraStats) eraStats.in_review++;   break
      case 'complete':    complete++;    if (eraStats) eraStats.complete++;    break
    }
  }

  return {
    total, unclaimed, in_progress, in_review, complete,
    byEra: ERA_ORDER.map(e => byEraMap[e]),
  }
}

export function TrackerBoard() {
  const { sessions, loading, error, updatedIds } = useSessions()
  const { claimSession, unclaimSession, markComplete, adminUnclaim, pending } = useSessionActions()
  const { user, profile } = useAuth()
  const isAdmin = profile?.is_admin ?? false

  const [filters, setFilters] = useState<TrackerFilters>({
    era: '', status: '', difficulty: '', myClaimsOnly: false, search: '',
  })
  const [modal, setModal] = useState<ModalState | null>(null)

  const stats = useMemo(() => computeStats(sessions), [sessions])

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      if (filters.era && s.era !== filters.era) return false
      if (filters.status && s.status !== filters.status) return false
      if (filters.difficulty && s.difficulty !== filters.difficulty) return false
      if (filters.myClaimsOnly && s.claimed_by !== user?.id) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!s.label.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [sessions, filters, user])

  const groupedByEra = useMemo(() => {
    const groups: Record<EraType, Session[]> = {
      '1830-1844': [], '1845-1850': [], '1850-1879': [], '1881-1896': [], '1897-present': [],
    }
    for (const s of filtered) {
      groups[s.era]?.push(s)
    }
    return groups
  }, [filtered])

  // We'd need to load profiles for claimed_by display. For now, derive from sessions.
  // In a real app we'd join or cache profile data. We'll show the UUID shortened for now
  // but since we have the current user's profile, we can show "You" for own claims.
  function getClaimedByDisplay(session: Session) {
    if (!session.claimed_by) return null
    if (session.claimed_by === user?.id) {
      return { id: user.id, display_name: profile?.display_name ?? 'You', avatar_url: profile?.avatar_url ?? null }
    }
    return { id: session.claimed_by, display_name: 'Another volunteer', avatar_url: null }
  }

  async function handleConfirm(data?: { talk_count: number; notes?: string; drive_link?: string }) {
    if (!modal) return
    if (modal.mode === 'claim') {
      const { error } = await claimSession(modal.session.id)
      if (error) alert(error)
    } else {
      if (!data) return
      const { error } = await markComplete(modal.session.id, data)
      if (error) alert(error)
    }
    setModal(null)
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem 0' }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid var(--color-border-light)' }}>
            <div className="skeleton" style={{ width: 72, height: 18 }} />
            <div className="skeleton" style={{ flex: 1, height: 18 }} />
            <div className="skeleton" style={{ width: 160, height: 18 }} />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-ink-secondary)', fontFamily: 'var(--font-body)' }}>
        Failed to load sessions: {error}
      </div>
    )
  }

  return (
    <div>
      <StatsBar
        stats={stats}
        onStatusFilter={s => setFilters(f => ({ ...f, status: f.status === s ? '' : s }))}
        activeStatusFilter={filters.status}
      />
      <FilterControls filters={filters} onChange={setFilters} />

      {filtered.length === 0 ? (
        <p style={{ textAlign: 'center', fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--color-ink-tertiary)', padding: '3rem 0' }}>
          No sessions match your current filters.
        </p>
      ) : (
        <div>
          {ERA_ORDER.map(era => {
            const group = groupedByEra[era]
            if (!group || group.length === 0) return null
            const color = ERA_DIFFICULTY_COLORS[era]
            return (
              <div key={era}>
                {/* Sticky era header */}
                <div
                  style={{
                    position: 'sticky',
                    top: 56,
                    zIndex: 10,
                    background: 'var(--color-paper-cool)',
                    borderTop: '1px solid var(--color-border)',
                    borderBottom: '1px solid var(--color-border)',
                    padding: '0.5rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: 'var(--color-ink)',
                    }}
                  >
                    {ERA_LABELS[era]}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {group.length} session{group.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Session rows */}
                {group.map(session => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    claimedByProfile={getClaimedByDisplay(session)}
                    currentUserId={user?.id}
                    isAdmin={isAdmin}
                    isUpdated={updatedIds.has(session.id)}
                    onClaim={() => setModal({ session, mode: 'claim' })}
                    onUnclaim={async () => {
                      const { error } = await unclaimSession(session.id)
                      if (error) alert(error)
                    }}
                    onMarkComplete={() => setModal({ session, mode: 'complete' })}
                    onAdminUnclaim={async () => {
                      if (confirm('Admin: Release this claim?')) {
                        const { error } = await adminUnclaim(session.id)
                        if (error) alert(error)
                      }
                    }}
                    isPending={pending === session.id}
                  />
                ))}
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <ClaimModal
          session={modal.session}
          mode={modal.mode}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
          isPending={pending === modal.session.id}
        />
      )}
    </div>
  )
}
