import {
  PROOF_BOUNDARY_LABELS,
  stageRank,
  type ProofBoundaryStage,
} from './evidence'
import type { regulatoryCategoryEnum } from '@/db/schema'
import type { ClaimEvidenceView } from './types'

/**
 * Reader-facing translation of the evidence model. The canonical eight stages in lib/evidence.ts
 * are unchanged and remain the stored value; this module only decides how to say them in public.
 *
 * Every mapping lives here so the homepage, browse list, entity page and search cannot drift into
 * describing the same stage differently.
 */

export const REACH_POSITIONS = [
  'Biological idea',
  'Lab studies',
  'Animal studies',
  'People',
  'Regulatory review',
] as const

export type ReachPosition = (typeof REACH_POSITIONS)[number]

/** Which of the five public positions a stage sits at. */
export function stageToReachIndex(stage: ProofBoundaryStage): number {
  switch (stage) {
    case 'biological_rationale_only':
      return 0
    case 'isolated_cell_evidence':
      return 1
    case 'animal_evidence':
      return 2
    case 'observational_human_evidence':
    case 'uncontrolled_human_intervention':
    case 'controlled_human_evidence':
    case 'independently_supported_controlled_human_evidence':
      return 3
    case 'regulatory_evidence':
      return 4
  }
}

/**
 * The sentence under the visual. Four different stages share position 3 ("People"), and the
 * difference between them is the single most consequential distinction on the site — an
 * uncontrolled study and a replicated controlled trial are not the same claim. The dots cannot
 * carry that, so the sentence does, and it is never optional.
 */
export function reachSentence(stage: ProofBoundaryStage): string {
  switch (stage) {
    case 'biological_rationale_only':
      return 'There is a proposed biological explanation, but it has not been tested in cells, animals or people.'
    case 'isolated_cell_evidence':
      return 'The evidence comes from cells in a dish. It has not been tested in animals or people.'
    case 'animal_evidence':
      return 'The evidence comes from animal studies. No controlled trial has tested this in people.'
    case 'observational_human_evidence':
      return 'Researchers looked at people who were already using it. Nobody decided who received it, so other differences between those people could explain what was seen.'
    case 'uncontrolled_human_intervention':
      return 'People were given it and the results were recorded, but there was no comparison group.'
    case 'controlled_human_evidence':
      return 'This was tested in people against a comparison group. That design can support a result — it does not mean the result was positive.'
    case 'independently_supported_controlled_human_evidence':
      return 'More than one controlled trial, run by separate research groups, has looked at this question.'
    case 'regulatory_evidence':
      return 'A medicines regulator reviewed the evidence and approved the product for a specific use.'
  }
}

/**
 * Whether an evidence position means anything for this claim.
 *
 * The position describes how far testing has gone for an *outcome*. A claim about what a hospital
 * procedure involves, or what a regulator decided, has no evidence ladder — printing one put
 * "a regulator reviewed the evidence and approved it" underneath "what does actually getting
 * treated involve", and filled the ladder to its top rung for a logistics answer.
 */
export function stagePositionApplies(claimType: string): boolean {
  return claimType === 'effectiveness' || claimType === 'safety' || claimType === 'claimed_use'
}

/**
 * Short value for the at-a-glance summary. Deliberately never a bare "tested in people": that
 * phrasing counts an uncontrolled study as human evidence and previously made BPC-157 read as
 * though it had been properly trialled.
 */
export function plainHumanEvidence(stage: ProofBoundaryStage | null): string {
  if (!stage) return 'No published claims yet'
  switch (stage) {
    case 'biological_rationale_only':
      return 'No studies yet'
    case 'isolated_cell_evidence':
      return 'Lab studies only'
    case 'animal_evidence':
      return 'Animal studies only'
    case 'observational_human_evidence':
      return 'Observed in people, not tested'
    case 'uncontrolled_human_intervention':
      return 'Small study without a control group'
    // Count-free, and it borrows the noun `reachSentence` already uses for this stage. It read
    // "Controlled human trials" — a plural, printed on rapamycin directly above a bottom line
    // that says "the one completed placebo-controlled human trial". The stage records that a
    // comparison group existed, never how many trials ran, so the label may not imply a number.
    // The next rung up may say "trials" because independent support means more than one by
    // definition.
    // "in people" is left implicit here, as it already is on the rung directly below it ("Small
    // study without a control group", which is also a human study): the rungs that are NOT about
    // people say so — "Animal studies only", "Lab studies only" — and the record prints
    // `reachSentence` in full underneath, which spells it out.
    case 'controlled_human_evidence':
      return 'Tested against a comparison group'
    case 'independently_supported_controlled_human_evidence':
      return 'Controlled trials, repeated independently'
    case 'regulatory_evidence':
      return 'Reviewed by a regulator'
  }
}

/**
 * BLOCKING SAFETY RULE — do not weaken this.
 *
 * A record-level evidence line that aggregates the strongest claim anywhere on the record made
 * /r/bpc-157 announce human evidence — carried entirely by a two-person intravenous safety pilot —
 * directly above a tendon claim with no human data of any kind. It also made rapamycin-for-longevity
 * read identically to an approved gene therapy.
 *
 * So: a single value is printed only when every published claim on the record sits at the same
 * stage. When they differ, the record says the reader has to look at the question they came for,
 * and nothing stronger. Per-claim evidence is always shown on the claim itself, scoped to that one
 * question.
 *
 * This is stricter than grouping by the five public reach positions, deliberately: four canonical
 * stages share the "People" position, and printing the strongest of those would reintroduce exactly
 * the overstatement this rule exists to prevent.
 *
 * It lives here, beside the other reader-facing mappings, rather than in the component that used to
 * render it: the `At a glance` heading and its component were removed when the three values became
 * a quiet metadata strip on the record page, and a live safety rule must not be the last inhabitant
 * of a file nothing renders.
 */
/**
 * The one value the record-level line may print when its claims do not agree. Exported so the
 * record page can recognise it and drop the row rather than printing a deferral under a label
 * that promises an answer — the string is the rule's output and must not be retyped anywhere.
 */
export const MIXED_EVIDENCE_LINE = 'Depends on the question — see below'

/**
 * The one evidence statement a MIXED record is allowed to print, and only when it is true of
 * every published outcome claim on that record.
 *
 * `recordEvidenceLine` refuses to name a stage when the claims disagree, which is correct and
 * must not change — but the record page then dropped the row entirely, and on /r/bpc-157 that
 * left a metadata strip costing a full phone screen to deliver an approval sentence already
 * printed under the h1 and a date. The fact a reader most needs in the first ten seconds was the
 * one fact the strip could not carry.
 *
 * So this returns a UNIVERSALLY QUANTIFIED NEGATIVE, or nothing. A negative that holds for every
 * claim cannot overstate any of them: it is the floor of the record, not its ceiling. The
 * threshold is the same one `humanEvidenceSummary` splits on — whether there was a control group
 * — because that is the distinction a reader can act on.
 *
 * It may never be extended to print a positive, a strongest stage, a range, or anything derived
 * from the best claim on the record. That is the exact defect the BLOCKING SAFETY RULE above
 * exists to prevent, and routing around that rule through this function would be the same bug
 * with a different name.
 */
export function mixedRecordEvidenceLine(stages: ProofBoundaryStage[]): string | null {
  // Uniform records are `recordEvidenceLine`'s job; this function exists only for the case that
  // one refuses to answer.
  if (stages.length < 2 || new Set(stages).size === 1) return null
  const controlled = stageRank('controlled_human_evidence')
  if (stages.every((stage) => stageRank(stage) < controlled)) {
    return 'No controlled human trial on any question here'
  }
  return null
}

export function recordEvidenceLine(stages: ProofBoundaryStage[]): string | null {
  // `stages` must already be filtered to outcome claims by the caller. Casgevy previously
  // collapsed five heterogeneous claims — including "what does treatment involve" — into one
  // "Reviewed by a regulator" line, which credited a logistics answer to a regulator and let a
  // single-arm n=30 efficacy result inherit the strongest wording on the record.
  if (stages.length === 0) return null
  const distinct = new Set(stages)
  if (distinct.size === 1) return plainHumanEvidence(stages[0]!)
  return MIXED_EVIDENCE_LINE
}

type RegulatoryCategory = (typeof regulatoryCategoryEnum.enumValues)[number]

/** Approval state in words a reader already knows. Never the raw enum. */
export function plainApproval(category: RegulatoryCategory): string {
  switch (category) {
    case 'approved_medicine':
      return 'Approved for a defined medical use'
    case 'investigational_medicine':
      return 'Still being studied, not approved'
    case 'compounded_medicine':
      return 'Prepared by a pharmacy, not a standard approved product'
    case 'dietary_supplement':
      return 'Sold as a supplement, not an approved medicine'
    case 'unapproved_therapeutic_substance':
      return 'Not approved for medical use'
    case 'withdrawn_or_restricted':
      return 'Withdrawn or restricted'
  }
}

export function isApproved(category: RegulatoryCategory): boolean {
  return category === 'approved_medicine'
}

/**
 * The jurisdiction name at the head of a stored `regulatoryStatuses.jurisdiction` string.
 *
 * The stored values name the place and then the body that decided, in the site's own em-dash
 * style: "United States — FDA (503A bulk drug substances for compounding)",
 * "European Union — European Commission / EMA". Only the place is wanted here, and the
 * parenthetical is a scope note on the decision rather than part of the name.
 */
function jurisdictionName(stored: string): string {
  return stored.split('\u2014')[0]!.split('(')[0]!.trim()
}

/**
 * The value printed under the strip's "Approval status" label.
 *
 * DUPLICATION DEFECT this exists to fix — the record page printed `plainApproval` twice inside the
 * first viewport, on every record and at both widths: once as the sentence directly under the h1
 * and again as this row's value 416px lower, with nothing between them changing the meaning.
 * "Not approved for medical use." then "Not approved for medical use". The build contract requires
 * both slots; it does not require them to carry the same string.
 *
 * So the two slots are split by what they answer. The sentence under the h1 keeps the plain
 * category, unchanged and at full force — on an unapproved substance it is the most protective
 * sentence on the page and it stays a global statement, not one scoped to a country. This row
 * carries the other half of the fact: WHOSE decision is on record. Approval is always approval by
 * a named regulator, in a named place, for named uses, and the page already holds all three in
 * `regulatoryStatuses`.
 *
 * THE SCOPE QUALIFIER IS NOT OPTIONAL. A bare "Approved" under a label is a worse defect than the
 * duplication it replaced, because approval is always approval FOR something — "for named uses"
 * is the part that stops this row reading as a blanket endorsement, and the uses themselves are
 * printed under "Approval and safety" further down the page.
 *
 * Falls back to the category sentence when the record carries no published regulatory status: a
 * value that repeats the line above is still better than a labelled row that says nothing, and
 * `plainApproval` never overstates.
 */
export function approvalStatusValue(category: RegulatoryCategory, jurisdictions: string[]): string {
  const places = [...new Set(jurisdictions.map(jurisdictionName).filter(Boolean))]
  if (places.length === 0) return plainApproval(category)
  // The place leads. Trailing it after the decision produced "Approved for named uses — United
  // States…" directly under "Approved for a defined medical use.", which opens on the same three
  // words as the sentence it is supposed to differ from; a reader scanning the two sees the echo
  // before they see the difference. Leading with the regulator's jurisdiction puts the part this
  // row exists to add first, and the scope qualifier still closes it.
  const where = places.join(', ')
  return `${where} \u2014 ${isApproved(category) ? 'approved for named uses' : 'no approved use'}`
}

/** The exact canonical wording, kept available wherever the detail is expanded. */
export function canonicalStageLabel(stage: ProofBoundaryStage): string {
  return PROOF_BOUNDARY_LABELS[stage]
}

/** Strongest stage across a set of claims, or null when nothing is published. */
export function strongestStage(stages: ProofBoundaryStage[]): ProofBoundaryStage | null {
  if (stages.length === 0) return null
  return stages.reduce((a, b) => (stageRank(b) > stageRank(a) ? b : a))
}

/**
 * The one-paragraph stand-in for a claim that has no recorded events but does carry curated
 * evidence that conflicts with or limits the answer.
 *
 * Deterministic by design. It is a join of stored strings — `claimPartAddressed` and
 * `directlyMeasuredResult` — written by an editor against a real source and checked by the prose
 * gate. Nothing here is generated at request time, so the same claim always produces the same
 * sentence and the sentence can be unit tested.
 *
 * BLOCKING RULE — read before editing. This paragraph is printed under a heading whose first four
 * words are "What did not work". A `limits` relationship is NOT something that did not work: on
 * Casgevy the limiting source is an off-target screen that found no confirmed edits, and on
 * BPC-157 it is a review reporting that no clinical safety data were ever collected. Filed as
 * failures, a null-for-harm result and an absence of evidence both read to a first-time visitor as
 * "the treatment failed", which is the exact inversion docs/evidence-classification.md names.
 *
 * So the paragraph opens by saying plainly that nothing conflicts whenever no `contradicts` link
 * exists, before it states the limit. The bare sentence "One cited source limits this answer on X"
 * may never stand alone under that heading.
 *
 * Each source is also NAMED. "One cited source" told the reader nothing they could follow up
 * without opening level 2 and guessing which of five it was, and two links joined into
 * "One cited source… One cited source…". The internal `claimPartAddressed` slug is not printed:
 * it is a stored field with slashes in it, and it reads as a database column rather than a
 * sentence.
 *
 * SECOND BLOCKING RULE — the title is the OBJECT of the sentence and is quoted. Naming the
 * source first made the journal title the grammatical subject, and a journal title is a
 * sentence-shaped thing: "Emerging Use of BPC-157 in Orthopaedic Sports Medicine: A Systematic
 * Review limits how far this answer reaches" parses as "A Systematic Review limits how far this
 * answer reaches", which is not what any source said. So the sentence states the relationship
 * first, in the site's own words, and then names the source after a colon inside typographic
 * quotes, where a title with its own internal colon cannot be mistaken for running prose.
 *
 * Returns null when no `contradicts` or `limits` relationship exists, which is also the signal the
 * caller uses to drop the whole section rather than print an empty state.
 */
export function fallbackConflictSummary(evidence: ClaimEvidenceView[]): string | null {
  const conflicting = evidence.filter((link) => link.relationship === 'contradicts')
  const limiting = evidence.filter((link) => link.relationship === 'limits')
  if (conflicting.length === 0 && limiting.length === 0) return null

  const sentence = (link: ClaimEvidenceView, verb: string) =>
    `A cited source ${verb}: “${link.source.title.trim()}”. ${link.directlyMeasuredResult.trim()}`

  const parts: string[] = []
  if (conflicting.length === 0) {
    parts.push('No recorded result conflicts with this answer.')
  }
  for (const link of conflicting) parts.push(sentence(link, 'conflicts with this answer'))
  for (const link of limiting) parts.push(sentence(link, 'limits how far this answer reaches'))

  return parts.join(' ')
}

/**
 * "18 August 2026" — readable dates, never ISO, in public copy.
 *
 * BOTH HELPERS RESOLVE IN UTC, and that pairing is the whole point. Every date on this site is
 * printed as `<time dateTime={isoDate(d)}>{readableDate(d)}</time>`, so the two functions are
 * always applied to the same instant and their answers are compared by anything that reads the
 * page. `readableDate` used `toLocaleDateString` with no `timeZone`, which resolves in the
 * SERVER'S local zone, while `isoDate` has always resolved in UTC. Under Asia/Singapore the same
 * timestamp printed "19 August 2026" in the text and `2026-08-18` in the attribute — 16 such
 * elements across three record pages, and the JSON a reader downloads from "Download record as
 * JSON" (ISO, UTC) disagreed with the page it came from. Worse, the visible date moved with the
 * deploy host's timezone while the machine-readable one did not.
 *
 * `en-GB` stays: it is the site's date format everywhere, including hand-written dates in seed
 * prose. Do not remove `timeZone: 'UTC'` without changing `isoDate` in the same commit.
 */
const READABLE_DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

export function readableDate(d: Date): string {
  return READABLE_DATE.format(d)
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/**
 * Which date the site is allowed to print about an answer, and which verb it may attach to it.
 *
 * SAFETY RULE — do not collapse the two branches. `claims.updatedAt` is a database write
 * timestamp. Printed under the words "This answer last checked" it asserted that an editor read
 * the sources on a day when all that happened was a row being written: every claim in the seeded
 * corpus carried the single instant `db:seed` ran, re-running the seed advanced it again, and on
 * the BPC-157 record it read one day later than the as-of date written into the answer's own text.
 * A site whose whole proposition is "we checked this" cannot let a write clock speak for an editor.
 *
 * `claims.checkedAt` is the recorded editorial check and is nullable on purpose. When it is null
 * nobody has recorded a check, so the sentence says `edited` — which is exactly what `updatedAt`
 * knows — and never `checked`. Neither branch is a scientific review: only an `approved` row in
 * `reviews` may produce a "reviewed" sentence, and that decision lives in EvidenceRecordMeta and
 * lib/citation.ts.
 *
 * Both callers of a date pair it with `isoDate` in a `<time dateTime>`, so the returned Date is the
 * one that must go in both places.
 */
export interface AnswerCheckPoint {
  /** `checked` only when a person recorded the check. Otherwise `edited`. */
  verb: 'checked' | 'edited'
  date: Date
}

export function answerCheckPoint(checkedAt: Date | null, lastEditedAt: Date): AnswerCheckPoint {
  return checkedAt ? { verb: 'checked', date: checkedAt } : { verb: 'edited', date: lastEditedAt }
}
