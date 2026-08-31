import type { DossierAudienceLensProjection } from '@/lib/dossier-audience-lenses'

export interface OrdinaryReaderGlossaryEntry {
  id: string
  term: string
  definition: string
  /** Literal, human-reviewed phrases that make this entry relevant to the current view. */
  matchTerms: readonly string[]
}

/**
 * Closed glossary for technical terms that can appear in the ordinary-reader projection.
 *
 * Definitions are reviewed interface copy, not generated medicine copy. New entries require an
 * explicit term, literal aliases and a plain definition; unknown words never receive a guessed
 * explanation.
 */
export const ORDINARY_READER_GLOSSARY = [
  {
    id: 'ldl-cholesterol',
    term: 'LDL cholesterol',
    definition:
      'A blood test result often called “bad cholesterol.” It does not by itself show how a person feels or functions.',
    matchTerms: ['LDL cholesterol', 'LDL-C', 'LDL'],
  },
  {
    id: 'placebo',
    term: 'Placebo',
    definition:
      'A look-alike treatment that does not contain the medicine being tested. Researchers use it to compare what happened between groups.',
    matchTerms: ['placebo'],
  },
  {
    id: 'percentage-points',
    term: 'Percentage points',
    definition:
      'The gap between two numbers that are each measured out of 100. Moving from 40 out of 100 to 50 out of 100 makes a gap of 10.',
    matchTerms: ['percentage points', 'percentage point'],
  },
  {
    id: 'percentage',
    term: 'Percentage',
    definition: 'A way to write a share out of 100. For example, 25% means 25 out of 100.',
    matchTerms: ['percentage', 'percent', 'per cent'],
  },
  {
    id: 'confidence-interval',
    term: 'Confidence interval',
    definition:
      'A range that shows how precise the study’s measured answer is. A wider range means the answer is less precise.',
    matchTerms: ['confidence interval', 'CI'],
  },
  {
    id: 'endpoint',
    term: 'Endpoint',
    definition: 'A result that researchers choose to measure in a study.',
    matchTerms: ['primary endpoint', 'secondary endpoint', 'exploratory endpoint', 'endpoint'],
  },
  {
    id: 'biomarker',
    term: 'Biomarker',
    definition:
      'A measurement from the body, such as a blood test result. It does not by itself show how a person feels or functions.',
    matchTerms: ['biomarker', 'biomarkers'],
  },
  {
    id: 'comparator',
    term: 'Comparator',
    definition: 'The other group, treatment or starting point used to judge what changed.',
    matchTerms: ['comparator'],
  },
  {
    id: 'population',
    term: 'Population',
    definition: 'The group of people that a study was meant to include.',
    matchTerms: ['population'],
  },
  {
    id: 'uncertainty',
    term: 'Uncertainty',
    definition: 'The part of a measured answer that is not exact, often shown as a range.',
    matchTerms: ['uncertainty'],
  },
  {
    id: 'registry',
    term: 'Study registry',
    definition: 'A public list that records planned and completed studies.',
    matchTerms: ['study registry', 'trial registry', 'registry'],
  },
  {
    id: 'boxed-warning',
    term: 'Boxed warning',
    definition:
      'The most prominent warning in a United States medicine label. It describes a serious risk.',
    matchTerms: ['boxed warning'],
  },
  {
    id: 'contraindication',
    term: 'Contraindication',
    definition:
      'A label category for a situation excluded from the product’s stated conditions of use.',
    matchTerms: ['contraindication', 'contraindications', 'contraindicated'],
  },
  {
    id: 'source-drift',
    term: 'Source drift',
    definition:
      'A confirmed change between the wording RNAWiki saved and what the same source says now.',
    matchTerms: ['source drift'],
  },
  {
    id: 'stale',
    term: 'Stale',
    definition: 'A saved source may have changed and needs to be checked again.',
    matchTerms: ['stale'],
  },
  {
    id: 'source-binding',
    term: 'Source binding',
    definition:
      'A saved link showing exactly which source supports one piece of information on this page.',
    matchTerms: ['source binding', 'source bindings'],
  },
  {
    id: 'canonical-field',
    term: 'Canonical field',
    definition: 'The single saved place in RNAWiki for this piece of information.',
    matchTerms: ['canonical field', 'canonical fields'],
  },
  {
    id: 'observed',
    term: 'Observed',
    definition:
      'Shown as it was recorded in a source, rather than worked out by RNAWiki from other values.',
    matchTerms: ['observed'],
  },
  {
    id: 'derived',
    term: 'Derived',
    definition:
      'Worked out from recorded values using a stated rule, rather than copied from a source.',
    matchTerms: ['derived'],
  },
  {
    id: 'freshness',
    term: 'Freshness',
    definition: 'Whether RNAWiki recently checked that a saved source still says the same thing.',
    matchTerms: ['freshness'],
  },
  {
    id: 'source-version',
    term: 'Source version',
    definition: 'Which saved edition of a source this information came from.',
    matchTerms: ['source version'],
  },
  {
    id: 'source-effective-date',
    term: 'Source effective date',
    definition: 'The date from which the saved edition applies.',
    matchTerms: ['source effective date'],
  },
  {
    id: 'snapshot-hash',
    term: 'Snapshot hash',
    definition: 'A digital check used to tell whether a saved copy changed.',
    matchTerms: ['snapshot hash'],
  },
] as const satisfies readonly OrdinaryReaderGlossaryEntry[]

function isWordCharacter(value: string | undefined): boolean {
  return value ? /[\p{L}\p{N}_]/u.test(value) : false
}

function containsWholeTerm(text: string, matchTerm: string): boolean {
  const normalizedText = text.toLocaleLowerCase('en-US')
  const normalizedTerm = matchTerm.toLocaleLowerCase('en-US')
  let start = normalizedText.indexOf(normalizedTerm)

  while (start !== -1) {
    const end = start + normalizedTerm.length
    if (
      (!isWordCharacter(normalizedTerm[0]) || !isWordCharacter(normalizedText[start - 1])) &&
      (!isWordCharacter(normalizedTerm.at(-1)) || !isWordCharacter(normalizedText[end]))
    ) {
      return true
    }
    start = normalizedText.indexOf(normalizedTerm, start + 1)
  }

  return false
}

/** Returns only reviewed entries whose literal terms occur in the supplied projection text. */
export function ordinaryReaderGlossaryEntriesForText(
  values: readonly (string | null | undefined)[],
): OrdinaryReaderGlossaryEntry[] {
  const visibleText = values.filter((value): value is string => Boolean(value?.trim())).join('\n')
  if (!visibleText) return []

  const matching = ORDINARY_READER_GLOSSARY.filter((entry) =>
    entry.matchTerms.some((matchTerm) => containsWholeTerm(visibleText, matchTerm)),
  )
  const matchingIds = new Set(matching.map((entry) => entry.id))

  // The more specific reviewed definition already explains this phrase; do not make the reader
  // open a second, overlapping definition for the word inside it.
  return matching.filter(
    (entry) => entry.id !== 'percentage' || !matchingIds.has('percentage-points'),
  )
}

/** Collects only strings that the chosen projection renders; it does not inspect hidden records. */
export function ordinaryReaderGlossaryEntriesForProjection(
  projection: DossierAudienceLensProjection,
): OrdinaryReaderGlossaryEntry[] {
  if (projection.lens !== 'ordinary') return []

  const values: Array<string | undefined> = [
    projection.label,
    projection.description,
    'Canonical field',
    'Observed or derived status',
    'Exact source binding',
    'Source version',
    'Source effective date',
    'Freshness',
    'Snapshot hash',
  ]

  for (const section of projection.sections) {
    values.push(section.heading, section.description, ...section.requiredFields)
    for (const record of section.records) {
      values.push(
        record.heading,
        record.summary,
        record.scope,
        record.evidenceStateLabel,
        record.provenanceNote,
        ...record.canonicalFields,
      )
      for (const fact of record.facts) values.push(fact.label, fact.value)
      for (const source of record.sources) {
        values.push(
          source.label,
          source.identifier,
          source.version,
          source.effectiveDate,
          source.excerpt,
        )
      }
    }
  }

  return ordinaryReaderGlossaryEntriesForText(values)
}
