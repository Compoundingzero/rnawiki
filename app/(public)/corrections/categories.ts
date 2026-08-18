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

// Single voice: this copy is reader-facing, so it says "RNAwiki", never "we" — the site is run
// by one person. scripts/check-prose.ts only walks .tsx, so this file is held to the rule by
// hand rather than by the gate. See docs/writing-style.md.
export const CORRECTION_CATEGORY_HELP: Record<CorrectionCategory, string> = {
  confusing_sentence: 'Quote or point to the exact sentence, and say what was unclear.',
  broken_source: "Name the source link that doesn't work, or the citation that looks wrong.",
  undefined_term: 'Name the term, and where on the page it appears.',
  new_source: 'Share the source (a link, DOI, or PMID) and which claim it relates to.',
  other: 'Describe what you noticed.',
}
