/**
 * Which sections a medicine page prints, and how it accounts for the ones it does not.
 *
 * The compass has twenty-two sections. A medicine with a full record fills most of them; a medicine
 * with a thin record fills three or four, and the other eighteen used to print their heading, their
 * standing explanation of what the section is for, and a line saying nothing was found. Measured
 * across a 300-medicine sample, that came to 22,350 characters per page — 45% of the rendered page —
 * that were byte-for-byte identical from one medicine to the next. Eight sections rendered exactly
 * one string across all 300.
 *
 * Hiding an absence is not the answer either. "Unknown is not failure" is a rule of this project, and
 * a reader who cannot tell "nobody has measured this" from "we did not bother with this section" has
 * been told less, not more. So the absences are kept and consolidated: the empty sections stop
 * printing their scaffolding, and one block near the foot of the page names every one of them and
 * says in plain words that nothing was found. A reader who wants to know what is missing gets a list
 * instead of a scroll.
 *
 * Seven sections are exempt and print even when empty, because for those the emptiness is the
 * information a reader came for. That nobody has recorded what can go wrong with a substance is not
 * a gap to tidy into a list at the bottom of the page — it is the most important sentence on it.
 */
import type { SectionState } from './taxonomy'

/**
 * The states that mean "this section has nothing to show".
 *
 * `awaiting_review` and `source_checked_draft` are deliberately absent: both carry content, and the
 * difference between them is who has signed it off, not whether it exists.
 */
const ABSENCE_STATES: ReadonlySet<SectionState> = new Set<SectionState>([
  'no_qualifying_evidence',
  'not_applicable',
  'feature_not_enabled',
])

/**
 * Sections that print even with nothing in them.
 *
 * Each one answers a question where silence is itself the answer a reader needs: what can go wrong,
 * whether people like them were studied, whether the form they can buy is the form that was tested,
 * what nobody knows, how to check the page, and what to read next. An empty safety section says the
 * sources RNAWiki holds record no harm — which is a fact about the record, and a reader deciding
 * something needs to see it in place rather than find it in a list of omissions.
 */
export const SECTIONS_SHOWN_WHEN_EMPTY: ReadonlySet<string> = new Set([
  'substance-action',
  'safety',
  'applicability',
  'form-check',
  'unknowns',
  'evidence-receipts',
  'next-question',
])

/** True when the section has nothing and is not one of the seven that print anyway. */
export function sectionIsHidden(id: string, state: SectionState): boolean {
  return ABSENCE_STATES.has(state) && !SECTIONS_SHOWN_WHEN_EMPTY.has(id)
}

/**
 * What a reader is told about a section that was left out.
 *
 * The wording distinguishes the three absences the states distinguish, because they are three
 * different facts: nothing was found in what was searched, the question does not apply to this kind
 * of substance, and RNAWiki has not built the part that would fill this in. Collapsing them into
 * "not available" would throw away the only thing the reader could act on.
 */
export function absencePhrase(state: SectionState): string {
  if (state === 'not_applicable') return 'does not apply to this substance'
  if (state === 'feature_not_enabled') return 'is not something RNAWiki collects yet'
  return 'found nothing in the sources checked'
}
