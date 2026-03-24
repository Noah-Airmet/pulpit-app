import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useSessionActions() {
  const { user } = useAuth()
  const [pending, setPending] = useState<string | null>(null)

  async function claimSession(sessionId: string): Promise<{ error?: string }> {
    if (!user) return { error: 'Not authenticated' }
    setPending(sessionId)
    const { error } = await supabase
      .from('sessions')
      .update({
        status: 'in_progress',
        claimed_by: user.id,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('status', 'unclaimed') // guard — only claim if still unclaimed
    setPending(null)
    if (error) return { error: error.message }
    return {}
  }

  async function unclaimSession(sessionId: string): Promise<{ error?: string }> {
    if (!user) return { error: 'Not authenticated' }
    setPending(sessionId)
    const { error } = await supabase
      .from('sessions')
      .update({
        status: 'unclaimed',
        claimed_by: null,
        claimed_at: null,
      })
      .eq('id', sessionId)
      .eq('claimed_by', user.id) // only unclaim your own
    setPending(null)
    if (error) return { error: error.message }
    return {}
  }

  async function markComplete(
    sessionId: string,
    data: { talk_count: number; notes?: string; drive_link?: string }
  ): Promise<{ error?: string }> {
    if (!user) return { error: 'Not authenticated' }
    setPending(sessionId)
    const { error } = await supabase
      .from('sessions')
      .update({
        status: 'in_review',
        talk_count: data.talk_count,
        notes: data.notes ?? null,
        drive_link: data.drive_link ?? null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('claimed_by', user.id)
    setPending(null)
    if (error) return { error: error.message }
    return {}
  }

  async function adminMarkFinal(sessionId: string): Promise<{ error?: string }> {
    if (!user) return { error: 'Not authenticated' }
    setPending(sessionId)
    const { error } = await supabase
      .from('sessions')
      .update({ status: 'complete' })
      .eq('id', sessionId)
    setPending(null)
    if (error) return { error: error.message }
    return {}
  }

  async function adminUnclaim(sessionId: string): Promise<{ error?: string }> {
    if (!user) return { error: 'Not authenticated' }
    setPending(sessionId)
    const { error } = await supabase
      .from('sessions')
      .update({ status: 'unclaimed', claimed_by: null, claimed_at: null })
      .eq('id', sessionId)
    setPending(null)
    if (error) return { error: error.message }
    return {}
  }

  // Volunteer submits session for review: bulk-promote draft talks to submitted, move session to in_review
  async function submitSessionForReview(
    sessionId: string,
    talkCount: number
  ): Promise<{ error?: string }> {
    if (!user) return { error: 'Not authenticated' }
    setPending(sessionId)
    // Move all draft talks to submitted
    const { error: talksError } = await supabase
      .from('talks')
      .update({ status: 'submitted' })
      .eq('session_id', sessionId)
      .eq('status', 'draft')
    if (talksError) { setPending(null); return { error: talksError.message } }
    // Move session to in_review
    const { error: sessionError } = await supabase
      .from('sessions')
      .update({
        status: 'in_review',
        talk_count: talkCount,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('claimed_by', user.id)
    setPending(null)
    if (sessionError) return { error: sessionError.message }
    return {}
  }

  return { claimSession, unclaimSession, markComplete, adminMarkFinal, adminUnclaim, submitSessionForReview, pending }
}
