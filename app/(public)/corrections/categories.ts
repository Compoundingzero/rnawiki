// Shared between the correction form (client) and the API route (server) so the two never
// drift. This is not Proof Boundary vocabulary (lib/evidence.ts), so it does not live there —
// it is the fixed set of reasons a reader can flag content for editorial attention. Mirrors the
// `category` comment on correctionSubmissions in db/schema.ts exactly.

export const CORRECTION_CATEGORIES = [
  'confusing_sentence',
  'broken_source',
  'undefined_term',
  'new_source',
  'other',
] as const

export type CorrectionCategory = (typeof CORRECTION_CATEGORIES)[number]

export const CORRECTION_CATEGORY_LABELS: Record<CorrectionCategory, string> = {
  confusing_sentence: 'A sentence is confusing or unclear',
  broken_source: 'A source link is broken or wrong',
  undefined_term: 'A term is used without being defined',
  new_source: 'I want to propose a new source',
  other: 'Something else',
}

export const CORRECTION_CATEGORY_HELP: Record<CorrectionCategory, string> = {
  confusing_sentence: 'Quote or point to the exact sentence, and tell us what was unclear.',
  broken_source: "Tell us which source link doesn't work, or which citation looks wrong.",
  undefined_term: 'Tell us the term, and where on the page it appears.',
  new_source: 'Share the source (a link, DOI, or PMID) and which claim it relates to.',
  other: 'Tell us what you noticed.',
}
