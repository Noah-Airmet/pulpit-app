export * from './database'

// UI-specific filter state
export interface TrackerFilters {
  era: string        // '' means all
  status: string     // '' means all
  difficulty: string // '' means all
  myClaimsOnly: boolean
  search: string
}

// Stats derived from sessions data
export interface EraStats {
  era: string
  total: number
  unclaimed: number
  in_progress: number
  in_review: number
  complete: number
}

export interface OverallStats {
  total: number
  unclaimed: number
  in_progress: number
  in_review: number
  complete: number
  byEra: EraStats[]
}

// Talk editor form state
export interface TalkFormData {
  speaker: string
  talk_date: string
  session_label: string
  source_title: string
  source_url: string
  source_type: string
  fidelity: string
  fidelity_notes: string
  transcript_text: string
  notes: string
}
