/**
 * Shared provenance rules for machine enrichment. Enrichment may copy a sourced fact or compute a
 * value from a structure; it does not compose new medical prose. Machine-enriched records retain
 * their source and do not receive `flagship` status without human review.
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
 * Visible prefix distinguishing regulatory label text from RNAWiki prose.
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
 * Trim at a sentence boundary when possible.
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

/**
 * Clean repeated SPL headings and homeopathic footnote markers. An asterisk is a marker only when
 * followed by whitespace or the end of the string, so allele names such as `HLA-A*02:01P` remain
 * intact.
 */
const SECTION_HEADINGS =
  /^\s*(?:indications?(?:\s+and\s+usage)?|uses?|purposes?|indications?\s*&\s*usage)\s*[:.\-—]?\s+/i

const HOMEOPATHIC_FOOTNOTE = /\*+\s*(claims?\s+based\s+on\s+traditional\s+homeopathic[\s\S]*)$/i

export function cleanLabelProse(text: string): string {
  let out = text.replace(/\s+/g, ' ').trim()
  out = out.replace(SECTION_HEADINGS, '')

  let footnote = ''
  const match = HOMEOPATHIC_FOOTNOTE.exec(out)
  if (match?.[1]) {
    footnote = match[1].trim()
    out = out.slice(0, match.index).trim()
    // Normalise all-capital footnotes one sentence at a time.
    footnote = footnote
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => {
        if (sentence !== sentence.toUpperCase() || !/[A-Z]{4}/.test(sentence)) return sentence
        const lowered = sentence.toLowerCase()
        // Restore common regulatory acronyms after lowercasing.
        const restored = lowered.replace(/\b(fda|otc|usp|hpus|us|gras)\b/g, (acronym) =>
          acronym.toUpperCase(),
        )
        return restored.charAt(0).toUpperCase() + restored.slice(1)
      })
      .join(' ')
    if (!/[.!?]$/.test(footnote)) footnote += '.'
  }

  // A marker between words separates list items; terminal markers are removed.
  out = out
    .replace(/(\w)\*+(\s+)(?=[A-Za-z])/g, '$1,$2')
    .replace(/\s*\*+(?=\s|$)/g, '')
    .trim()
  out = out.replace(/\s+([.,;:])/g, '$1').replace(/\s{2,}/g, ' ')
  out = out.charAt(0).toUpperCase() + out.slice(1)

  return footnote ? `${out} Label footnote: ${footnote}` : out
}
