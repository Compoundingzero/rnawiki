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

/**
 * The label section as prose, rather than as it sits in the SPL file.
 *
 * Three things arrive with it that do not belong on a page. The section heading is often repeated
 * inside the text ("INDICATIONS For the temporary relief of…"), because the SPL author typed it and
 * the tag already says it. Homeopathic listings carry footnote markers, and 1,181 records were
 * printing an asterisk pointing at a footnote that was never captured — punctuation with no
 * referent. Where the footnote WAS captured it is the most important sentence in the field, and it
 * was arriving in capitals at the end of a sentence it appeared to be part of.
 *
 * An asterisk is only treated as a marker when whitespace or the end of the string follows it.
 * "HLA-A*02:01P" is an allele, not a footnote, and it appears in real oncology labels.
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
    // Labels write this in capitals. Capitals are the label shouting, not the label meaning
    // something different, and a page of them is unreadable. Done per sentence: a footnote often
    // shouts its first sentence and then continues in ordinary case, and testing the whole string
    // leaves the shouting in place.
    footnote = footnote
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => {
        if (sentence !== sentence.toUpperCase() || !/[A-Z]{4}/.test(sentence)) return sentence
        const lowered = sentence.toLowerCase()
        // Lowercasing a shouted sentence takes the acronyms down with it, and "not fda evaluated"
        // is not what the label says.
        const restored = lowered.replace(/\b(fda|otc|usp|hpus|us|gras)\b/g, (acronym) =>
          acronym.toUpperCase(),
        )
        return restored.charAt(0).toUpperCase() + restored.slice(1)
      })
      .join(' ')
    if (!/[.!?]$/.test(footnote)) footnote += '.'
  }

  // A marker between two words was separating items in a list the SPL wrote as bullets; dropping
  // it runs them together ("congestion coughing itchiness"). A marker after punctuation or at the
  // end is just the marker.
  out = out
    .replace(/(\w)\*+(\s+)(?=[A-Za-z])/g, '$1,$2')
    .replace(/\s*\*+(?=\s|$)/g, '')
    .trim()
  out = out.replace(/\s+([.,;:])/g, '$1').replace(/\s{2,}/g, ' ')
  out = out.charAt(0).toUpperCase() + out.slice(1)

  return footnote ? `${out} Label footnote: ${footnote}` : out
}
