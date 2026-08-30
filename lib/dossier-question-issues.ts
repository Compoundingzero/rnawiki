/**
 * Which questions a source disagreement or a drifted source actually reaches.
 *
 * The corpus records that independent labels print different comparable values for a field — 231 of
 * them — and until now that fact was reachable only by scrolling into the cross-source module. The
 * question layer, which is what a reader navigates, had no state for it and no state for a source
 * that has drifted since its value was recorded.
 *
 * Two rules govern everything here.
 *
 * **A disagreement is only a disagreement when the readings were comparable.** `not_comparable`
 * means comparing two readings would need a measurement no source stated — a body weight, most
 * often — and reporting that as a conflict invents one the sources never had. The old Boolean did
 * exactly that, and it is the reason the comparability contract exists. Only `differ` reaches a
 * question.
 *
 * **The mapping is a table, not a search.** A field reaches a question because this file says so,
 * not because a word appeared in some rendered prose. Keyword matching against copy would silently
 * re-point itself every time someone edited a heading, and a reader would have no way to tell.
 */

import type { DossierQuestionIntent } from './dossier-question-registry'
import type { ReadingComparisonState } from './background/reading-comparison'

/** A question can carry more than one problem at once, so the states are a set, not a choice. */
export type DossierQuestionIssue = 'conflicting' | 'stale'

/**
 * Which question each cross-source field belongs to.
 *
 * Every field the consensus builder computes appears here exactly once. A field with no question is
 * a real state and is reported by the audit rather than quietly dropped — see `unmappedFields`.
 */
export const CONSENSUS_FIELD_TO_INTENT: Readonly<Record<string, DossierQuestionIntent>> = {
  /* All five cross-source fields are pharmacokinetic, so all five answer the same question: what
   * the body does to the medicine over time. They are listed individually rather than collapsed to
   * a prefix so that adding a sixth field is a decision someone makes, not something that happens. */
  halfLife: 'measurement',
  bioavailability: 'measurement',
  tMax: 'measurement',
  proteinBinding: 'measurement',
  volumeOfDistribution: 'measurement',
}

/** One field whose recorded readings disagree, with everything a reader needs to check it. */
export interface ConflictingFieldSummary {
  field: string
  intent: DossierQuestionIntent
  /** Why the readings were judged comparable and different. */
  reasons: readonly string[]
  readings: ReadonlyArray<{
    display: string
    sourceCount: number
    supportLabel?: string
    sources: ReadonlyArray<{
      label: string
      identifier: string
      retrievedAt: string
      excerpt?: string
    }>
  }>
}

/** One source whose current verification no longer reproduces what was recorded from it. */
export interface StaleSourceSummary {
  intent: DossierQuestionIntent
  sourceIdentifier: string
  sourceLabel: string
  /** When the value was last recorded from this source. */
  recordedAt: string
  /** What the freshness loop currently reports: `drifted`, `unreachable`, and so on. */
  freshnessState: string
  /** The field or claim the drifted source supports. */
  fieldPath: string
}

export interface QuestionIssueIndex {
  /** Issues by question intent. A question absent from this map has neither issue. */
  byIntent: ReadonlyMap<DossierQuestionIntent, readonly DossierQuestionIssue[]>
  conflicting: readonly ConflictingFieldSummary[]
  stale: readonly StaleSourceSummary[]
  /**
   * Fields whose readings differ but which this table does not map to any question.
   *
   * Reported rather than invented. A disagreement no reader can reach is a real gap in the mapping,
   * and inventing a question for it would be worse than naming it.
   */
  unmappedFields: readonly string[]
}

/**
 * Shaped to the projected view rather than to the stored envelope, because the view is what the page
 * and the navigator both read and a second projection would be a second thing to keep in step.
 */
interface ConsensusFieldInput {
  field: string
  comparisonState?: ReadingComparisonState
  comparisonReasons?: readonly string[]
  /**
   * The legacy signal, present on records generated before the comparability contract. Read only
   * when `comparisonState` is absent, and known to be wrong in both directions when it is used.
   */
  disagreementNote?: string
  readings: ReadonlyArray<{
    display: string
    supportLabel?: string
    sourceCount?: number
    sources: ReadonlyArray<{
      label: string
      identifier: string
      retrievedAt: string
      excerpt?: string
    }>
  }>
}

export interface QuestionIssueInput {
  consensusFields?: readonly ConsensusFieldInput[]
  /**
   * Sources the freshness loop currently reports as no longer reproducing their recorded value.
   * Empty when nothing has drifted, which is the ordinary case.
   */
  driftedSources?: readonly StaleSourceSummary[]
}

/**
 * Whether a field's readings genuinely disagree.
 *
 * Reads `comparisonState` where the record carries it and falls back to the deprecated Boolean only
 * for records generated before the comparability contract existed — where the Boolean was the only
 * signal available, and where it may still be wrong in the ways that contract was written to fix.
 */
function fieldDisagrees(field: ConsensusFieldInput): boolean {
  if (field.comparisonState) return field.comparisonState === 'differ'
  return Boolean(field.disagreementNote)
}

/**
 * Builds the issue index for one record.
 *
 * Pure, and it never mutates its input: the consensus block it reads is the same object the page
 * renders, and a projection that quietly reordered or trimmed it would make the navigator and the
 * section disagree about the same record.
 */
export function buildQuestionIssueIndex(input: QuestionIssueInput): QuestionIssueIndex {
  const byIntent = new Map<DossierQuestionIntent, Set<DossierQuestionIssue>>()
  const conflicting: ConflictingFieldSummary[] = []
  const unmappedFields: string[] = []

  const add = (intent: DossierQuestionIntent, issue: DossierQuestionIssue) => {
    const existing = byIntent.get(intent) ?? new Set<DossierQuestionIssue>()
    existing.add(issue)
    byIntent.set(intent, existing)
  }

  for (const field of input.consensusFields ?? []) {
    if (!fieldDisagrees(field)) continue
    const intent = CONSENSUS_FIELD_TO_INTENT[field.field]
    if (!intent) {
      unmappedFields.push(field.field)
      continue
    }
    add(intent, 'conflicting')
    conflicting.push({
      field: field.field,
      intent,
      reasons: [...(field.comparisonReasons ?? [])],
      readings: field.readings.map((reading) => ({
        display: reading.display,
        sourceCount: reading.sourceCount ?? 0,
        supportLabel: reading.supportLabel,
        sources: reading.sources.map((source) => ({ ...source })),
      })),
    })
  }

  const stale = [...(input.driftedSources ?? [])]
  for (const entry of stale) add(entry.intent, 'stale')

  /* Sorted so a rerun produces the same order and a diff means the record changed. */
  const frozen = new Map<DossierQuestionIntent, readonly DossierQuestionIssue[]>()
  for (const [intent, issues] of [...byIntent.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    frozen.set(intent, [...issues].sort())
  }

  return {
    byIntent: frozen,
    conflicting: conflicting.sort((left, right) => left.field.localeCompare(right.field)),
    stale: stale
      .slice()
      .sort((left, right) => left.sourceIdentifier.localeCompare(right.sourceIdentifier)),
    unmappedFields: unmappedFields.sort(),
  }
}

/**
 * The single coverage state to show when a question carries issues, with both kept in `issues`.
 *
 * `conflicting` wins over `stale` because they answer different questions and only one of them is
 * about the evidence itself. A disagreement says the recorded sources do not agree, which a reader
 * must weigh before anything else. Staleness says our copy of a source may be out of date, which is
 * a reason to recheck rather than a statement about the evidence. Losing the disagreement to show
 * the staleness would hide the stronger fact behind the weaker one.
 *
 * Both survive in `issues`, so the navigator can show both badges.
 */
export function primaryIssueCoverage(
  issues: readonly DossierQuestionIssue[],
): DossierQuestionIssue | undefined {
  if (issues.includes('conflicting')) return 'conflicting'
  if (issues.includes('stale')) return 'stale'
  return undefined
}
