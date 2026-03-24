export const CALLING_OPTIONS = [
  'none',
  'apostle',
  'president',
  'first presidency',
  'seventy',
  'relief society presidency',
  'young women presidency',
  'presiding bishopric',
  'sunday school presidency',
  'primary presidency',
  'patriarch',
  'bishop',
  'other',
] as const

export type CallingValue = typeof CALLING_OPTIONS[number]

export const DEFAULT_EDITOR_TAGS = [
  'missing footnotes',
  'missing photo',
  'missing photos',
  'missing video',
  'missing videos',
] as const
