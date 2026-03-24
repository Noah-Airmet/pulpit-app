import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { TalkFormData } from '../types'

function parseEditorTags(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  )
}

function buildMarkdown(form: TalkFormData, conference: string, collectedBy: string): string {
  const editorTags = parseEditorTags(form.editor_tags)
  return `---
speaker: "${form.speaker}"
date: "${form.talk_date}"
conference: "${conference}"
session: ${form.session_label ? `"${form.session_label}"` : 'null'}
source_title: "${form.source_title}"
source_url: ${form.source_url ? `"${form.source_url}"` : 'null'}
source_type: "${form.source_type}"
fidelity: "${form.fidelity}"
calling: "${form.calling || 'none'}"
editor_tags: [${editorTags.map(tag => `"${tag}"`).join(', ')}]
fidelity_notes: ${form.fidelity_notes ? `"${form.fidelity_notes}"` : 'null'}
collected_by: "${collectedBy}"
collected_date: "${new Date().toISOString().split('T')[0]}"
needs_review: true
notes: ${form.notes ? `"${form.notes}"` : 'null'}
---

${form.transcript_text}`
}

export function useTalkActions() {
  const { user, profile } = useAuth()
  const [pending, setPending] = useState<string | null>(null)

  async function saveDraft(
    sessionId: string,
    conference: string,
    form: TalkFormData
  ): Promise<{ data?: { id: string }; error?: string }> {
    if (!user || !profile) return { error: 'Not authenticated' }
    setPending('saving')
    const collectedBy = profile.display_name ?? user.email ?? 'Unknown'
    const md = buildMarkdown(form, conference, collectedBy)
    const editorTags = parseEditorTags(form.editor_tags)
    const { data, error } = await supabase
      .from('talks')
      .insert({
        speaker: form.speaker,
        talk_date: form.talk_date,
        conference,
        session_label: form.session_label || null,
        session_id: sessionId,
        source_title: form.source_title,
        source_url: form.source_url || null,
        source_type: form.source_type,
        fidelity: form.fidelity,
        calling: form.calling || 'none',
        editor_tags: editorTags.length > 0 ? editorTags : ['missing footnotes'],
        fidelity_notes: form.fidelity_notes || null,
        transcript_text: form.transcript_text || null,
        transcript_markdown: md,
        collected_by: collectedBy,
        collected_date: new Date().toISOString().split('T')[0],
        notes: form.notes || null,
        needs_review: true,
        status: 'draft',
        submitted_by: user.id,
      })
      .select('id')
      .single()
    setPending(null)
    if (error) return { error: error.message }
    return { data: { id: data.id } }
  }

  async function updateDraft(
    talkId: string,
    conference: string,
    form: TalkFormData
  ): Promise<{ error?: string }> {
    if (!user || !profile) return { error: 'Not authenticated' }
    setPending(talkId)
    const collectedBy = profile.display_name ?? user.email ?? 'Unknown'
    const md = buildMarkdown(form, conference, collectedBy)
    const editorTags = parseEditorTags(form.editor_tags)
    const { error } = await supabase
      .from('talks')
      .update({
        speaker: form.speaker,
        talk_date: form.talk_date,
        session_label: form.session_label || null,
        source_title: form.source_title,
        source_url: form.source_url || null,
        source_type: form.source_type,
        fidelity: form.fidelity,
        calling: form.calling || 'none',
        editor_tags: editorTags.length > 0 ? editorTags : ['missing footnotes'],
        fidelity_notes: form.fidelity_notes || null,
        transcript_text: form.transcript_text || null,
        transcript_markdown: md,
        notes: form.notes || null,
      })
      .eq('id', talkId)
    setPending(null)
    if (error) return { error: error.message }
    return {}
  }

  async function deleteDraft(talkId: string): Promise<{ error?: string }> {
    if (!user) return { error: 'Not authenticated' }
    setPending(talkId)
    const { error } = await supabase
      .from('talks')
      .delete()
      .eq('id', talkId)
      .eq('status', 'draft')
    setPending(null)
    if (error) return { error: error.message }
    return {}
  }

  async function approveTalk(talkId: string): Promise<{ error?: string }> {
    if (!user) return { error: 'Not authenticated' }
    setPending(talkId)
    const { error } = await supabase
      .from('talks')
      .update({ status: 'approved', needs_review: false, rejection_notes: null })
      .eq('id', talkId)
    setPending(null)
    if (error) return { error: error.message }
    return {}
  }

  async function rejectTalk(talkId: string, notes: string): Promise<{ error?: string }> {
    if (!user) return { error: 'Not authenticated' }
    setPending(talkId)
    const { error } = await supabase
      .from('talks')
      .update({ status: 'rejected', rejection_notes: notes })
      .eq('id', talkId)
    setPending(null)
    if (error) return { error: error.message }
    return {}
  }

  return { saveDraft, updateDraft, deleteDraft, approveTalk, rejectTalk, pending }
}
