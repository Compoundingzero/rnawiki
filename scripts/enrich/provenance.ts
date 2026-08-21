/**
 * Shared rules for machine enrichment.
 *
 * THE LINE THIS FILE EXISTS TO HOLD: enrichment may COPY a fact from a public record, or COMPUTE
 * one from a structure. It may never COMPOSE one. The difference is the whole credibility of the
 * site — a sentence quoted from an FDA label and attributed to it is a fact a reader can check; the
 * same sentence rewritten to read more smoothly is a claim nobody can trace.
 *
 * So every enriched field carries where it came from, and a machine-enriched record never claims
 * the standing of one a person researched. `dossierDepth` stays below 'flagship' and the page says
 * plainly that no human has reviewed it.
 */

export const SOURCE_LABELS = {
  fdaLabel: 'FDA label (openFDA SPL)',
  drugsFda: 'openFDA Drugs@FDA',
  ndc: 'openFDA NDC Directory',
  pubchem: 'PubChem PUG-REST',
  nadac: 'CMS National Average Drug Acquisition Cost',
  clinicalTrials: 'ClinicalTrials.gov',
  dsld: 'NIH Dietary Supplement Label Database',
  engine: 'RNA Intelligence (computed)',
} as const

export type SourceKey = keyof typeof SOURCE_LABELS

/**
 * Prefix that marks a passage as quoted from a regulatory document rather than written for this
 * site. It is deliberately visible in the rendered text: a reader must be able to tell, without
 * clicking anything, that they are reading the manufacturer's words to the regulator and not a
 * plain-English explanation somebody wrote for them.
 */
export const LABEL_QUOTE_PREFIX = 'From the FDA-approved label:'

export function attributeToLabel(passage: string): string {
  const clean = passage.replace(/\s+/g, ' ').trim()
  if (!clean) return ''
  if (clean.startsWith(LABEL_QUOTE_PREFIX)) return clean
  return `${LABEL_QUOTE_PREFIX} ${clean}`
}

/** Merges provenance without duplicating, preserving the order sources were added. */
export function mergeProvenance(existing: readonly string[], added: readonly string[]): string[] {
  return [...new Set([...existing, ...added])]
}

/**
 * Trims at a sentence boundary. Cutting a regulatory passage mid-word is how a quotation stops
 * being a quotation.
 */
export function trimToSentence(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const window = clean.slice(0, max)
  const stop = Math.max(
    window.lastIndexOf('. '),
    window.lastIndexOf('? '),
    window.lastIndexOf('! '),
  )
  if (stop > max * 0.45) return window.slice(0, stop + 1).trim()
  const space = window.lastIndexOf(' ')
  return `${(space > 0 ? window.slice(0, space) : window).trim()}…`
}
