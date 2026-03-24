interface TalkFilterInput {
  era: string
  speaker: string
  fidelities: string[]
  callings: string[]
  editorTags: string[]
  yearFrom: string
  yearTo: string
}

const ERA_DATE_RANGES: Record<string, [string, string]> = {
  '1830-1844': ['1830-01-01', '1844-12-31'],
  '1845-1850': ['1845-01-01', '1850-12-31'],
  '1850-1879': ['1850-01-01', '1879-12-31'],
  '1881-1896': ['1881-01-01', '1896-12-31'],
  '1897-present': ['1897-01-01', '2099-12-31'],
}

export function applyTalkFilters<T>(
  query: T,
  filters: TalkFilterInput
) {
  let nextQuery = query as any

  if (filters.era && ERA_DATE_RANGES[filters.era]) {
    const [from, to] = ERA_DATE_RANGES[filters.era]
    nextQuery = nextQuery.gte('talk_date', from).lte('talk_date', to)
  } else {
    if (filters.yearFrom) nextQuery = nextQuery.gte('talk_date', `${filters.yearFrom}-01-01`)
    if (filters.yearTo) nextQuery = nextQuery.lte('talk_date', `${filters.yearTo}-12-31`)
  }

  if (filters.speaker) nextQuery = nextQuery.ilike('speaker', `%${filters.speaker}%`)
  if (filters.fidelities.length > 0) nextQuery = nextQuery.in('fidelity', filters.fidelities)
  if (filters.callings.length > 0) nextQuery = nextQuery.in('calling', filters.callings)

  for (const tag of filters.editorTags) {
    nextQuery = nextQuery.contains('editor_tags', [tag])
  }

  return nextQuery
}
