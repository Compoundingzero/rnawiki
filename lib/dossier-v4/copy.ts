/**
 * The fixed sentences dossier-v4 is allowed to say (docs/dossier-v4-plain-language-contract.md).
 *
 * No sentence on a v4 page is generated at request time from a template that a reader might mistake
 * for a finding. A reader-facing sentence is one of four things: a quotation from a stored source,
 * a count of stored rows, a fixed sentence from this file, or an explicit absence state. This file
 * is the third of those, and it is the only place new reader furniture may be written.
 *
 * The v3 contract sentences are re-exported rather than restated, so a change there reaches v4.
 */
import { SPONTANEOUS_REPORT_FRAMING, interactionAbsenceLine } from '@/lib/dossier-v3/stored-keys'
import { NO_REVIEWED_CONCLUSION_SENTENCE } from '@/lib/dossier-v3/taxonomy'

export { SPONTANEOUS_REPORT_FRAMING, interactionAbsenceLine, NO_REVIEWED_CONCLUSION_SENTENCE }

/**
 * The five-term pattern every lane-bearing section closes with. v3 used four terms; v4 splits
 * "what we do not know" into what this particular finding cannot show, and what nobody has
 * measured yet, because readers conflate the two.
 */
export interface TruthTerms {
  know: string
  how: string
  notProve: string
  matters: string
  stillUnknown: string
}

export const TRUTH_TERM_LABELS: Record<keyof TruthTerms, string> = {
  know: 'What we know',
  how: 'How we know it',
  notProve: 'What this does not prove',
  matters: 'Why it matters',
  stillUnknown: 'What we still do not know',
}

/* ------------------------------------------------------------ furniture */

export const COMPASS_COPY = {
  /** Sits under the identity strip. The one promise the page makes about itself. */
  pagePromise:
    'This page shows what was measured, who it was measured in, and what that does not settle.',

  notAdvice:
    'This is a record of evidence. It is not medical advice, and it does not say this substance suits you.',

  notForChildren: 'Nothing here says any substance on RNAWiki is appropriate for a child.',

  /** Shown wherever a section would otherwise look empty. */
  absenceIsNotSafety:
    'Finding nothing is not the same as showing there is nothing. It means the sources listed held nothing.',

  mechanismIsNotBenefit:
    'A change inside the body is a reason to look. It is not a result in a person.',

  biomarkerIsNotOutcome:
    'A number moving is not the same as a life going better. The two are shown apart here.',

  animalIsNotHuman:
    'A result in animals says what to test next. It does not say what happens in people.',

  predictionIsNotFinding: 'Software can suggest a link. RNAWiki does not publish one as a finding.',

  registeredNotReported:
    'A registered study says what someone planned to measure. It does not say what they found.',

  /** The closing line on any page where a clinician decides. */
  clinicianClosing:
    'RNAWiki records evidence. It does not say whether this substance is right for you.',

  /** Community lane, shown whether or not any report exists. */
  communitySeparation:
    'Reports from people are kept apart from the studies. One person is not a rate.',

  communityNoImport:
    'RNAWiki does not copy reports from forums or archives. These are reports sent to RNAWiki.',

  /** Measurement coach, low-risk mode only. */
  measurementBoundary:
    'Tracking can show whether something changed for you. It cannot show what caused it.',

  measurementNoDose: 'RNAWiki does not work out an amount for anyone.',

  /** Stack map. */
  stackLocal: 'What you type stays in this browser. RNAWiki does not receive it.',

  /** Fingerprint. */
  noTotalScore:
    'There is no single score. A strong test result and a weak life result are different facts.',

  /** Staircase. */
  staircaseCaveat:
    'Higher on these steps means closer to something a person would feel. It does not mean better done.',

  /** Applicability. */
  applicabilityIncluded: 'People similar to this profile were included.',
  applicabilityCannotSay:
    'RNAWiki cannot tell whether a study fits you. It can show who was in it.',

  /** Identity. */
  identityMatters:
    'Evidence carries across two names for one substance. It does not carry across a salt, a mirror form or a mixture.',
} as const

/* -------------------------------------------------------------- helpers */

/** The sentence for a section that ran a search and found nothing, naming what was searched. */
export function nothingFoundLine(sources: string, date: string | undefined): string {
  const when = date ? ` as of ${date}` : ''
  return `Nothing was found in ${sources}${when}. ${COMPASS_COPY.absenceIsNotSafety}`
}

/** The sentence for a count of stored rows. Counts are facts about RNAWiki, not about biology. */
export function storedRowsLine(count: number, noun: string, source: string): string {
  const plural = count === 1 ? noun : `${noun}s`
  return `RNAWiki stores ${count} ${plural} for this record, from ${source}.`
}

/** A registered-outcome line. Never says a result was found. */
export function registeredOutcomeLine(count: number): string {
  if (count === 0) return 'No registered study lists an outcome measure RNAWiki could read.'
  const plural = count === 1 ? 'measure' : 'measures'
  return `Registered studies list ${count} outcome ${plural} that RNAWiki could read. ${COMPASS_COPY.registeredNotReported}`
}
