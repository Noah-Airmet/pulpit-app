// TypeScript types matching the Supabase Postgres schema

export type EraType =
  | '1830-1844'
  | '1845-1850'
  | '1850-1879'
  | '1881-1896'
  | '1897-present'

export type DifficultyType = 'easy' | 'medium' | 'hard' | 'detective-work'

export type SessionStatus = 'unclaimed' | 'in_progress' | 'in_review' | 'complete'

export type TalkStatus = 'draft' | 'submitted' | 'approved' | 'rejected'

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  is_admin: boolean
  created_at: string
}

export interface Session {
  id: string                    // e.g., '1876-10'
  label: string                 // e.g., 'October 1876 General Conference'
  conference_date: string | null
  era: EraType
  difficulty: DifficultyType
  status: SessionStatus
  claimed_by: string | null     // UUID ref to profiles.id
  claimed_at: string | null
  completed_at: string | null
  talk_count: number | null
  notes: string | null
  drive_link: string | null
  updated_at: string
}

// Session with joined profile data for display
export interface SessionWithProfile extends Session {
  profiles?: Pick<Profile, 'id' | 'display_name' | 'avatar_url'> | null
}

export interface Talk {
  id: string
  speaker: string
  talk_date: string
  conference: string
  session_label: string | null
  session_id: string | null
  source_title: string
  source_url: string | null
  source_type: string
  fidelity: string
  calling: string
  editor_tags: string[]
  fidelity_notes: string | null
  alternate_sources: AlternateSource[]
  video_url: string | null
  audio_url: string | null
  transcript_text: string | null
  transcript_markdown: string | null
  collected_by: string | null
  collected_date: string | null
  needs_review: boolean
  notes: string | null
  // Submission pipeline (migration 002)
  status: TalkStatus
  submitted_by: string | null
  rejection_notes: string | null
  created_at: string
  updated_at: string
}

export interface AlternateSource {
  title: string
  url: string
  type: string
}

// Database helper types for Supabase queries
export type Tables = {
  profiles: Profile
  sessions: Session
  talks: Talk
}
