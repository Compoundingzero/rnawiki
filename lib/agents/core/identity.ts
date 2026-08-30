/**
 * The two identities a review candidate needs, and why one is not enough.
 *
 * A dataset agent emits an item saying "someone should look at this, and here is exactly why". Until
 * now that item had no key at all, so even a reviewer who answered one had nowhere to record the
 * answer, and every rerun of the agents overwrote the file it lived in. Closing that loop needs two
 * different identities, because two different questions are being asked of the same item.
 *
 * `candidateKey` answers **"is this the same question as before?"** It is stable across corpus
 * refreshes, agent patch releases and rewording. It hashes the SUBJECT of the question — which
 * agent, which reason, which record, which field — and deliberately nothing else.
 *
 * `occurrenceKey` answers **"is this the same observation as before?"** It changes whenever the
 * stored value, the source behind it, the parser or the agent's reasoning changes. A decision is
 * recorded against an occurrence; a suppression is looked up by candidate.
 *
 * Together they give the behaviour a reviewer expects: answer a question once and it stays answered,
 * but if the underlying source moves, it comes back with the change visible.
 *
 * ## What must never enter `candidateKey`
 *
 * **The question prose.** Agent questions embed run-specific counts — "…while 1,628 of 9,855 records
 * in the corpus hold one" — so a key derived from the rendered text changes on every corpus refresh,
 * orphaning every decision ever made. This is the single failure that would make the loop look like
 * it works while quietly resetting itself, and it is the reason this module exists as its own file
 * with its own tests rather than as a helper inside an agent.
 *
 * **The agent's patch version.** Bumping an agent from 1.0.0 to 1.0.1 to fix a typo in a caveat must
 * not orphan its decisions. The key carries a `reasonSchemaVersion` instead — bumped only when the
 * MEANING of the reason changes, so that a genuine change of question genuinely produces a new
 * question.
 *
 * **Any count, score or priority.** Those move with the corpus and are properties of the occurrence.
 */

import { createHash } from 'node:crypto'

import type { ReviewReason } from './types'

/** What a review question is about. Everything here is stable while the question is the same. */
export interface CandidateSubject {
  /** The agent that raises this class of question, e.g. `peer-group-anomaly-screen`. */
  agent: string
  /**
   * Bumped only when the MEANING of the agent's reason changes, never for a patch release. An agent
   * that starts asking a materially different question about the same field must bump this, because
   * the old decisions no longer answer the new question.
   */
  reasonSchemaVersion: string
  /** What kind of thing the question is about. `medicine` today; room for `source` and `programme`. */
  subjectType: 'medicine' | 'source' | 'programme' | 'counterparty'
  /** The stable identifier of that thing — a medicine slug, a source identifier. */
  subjectId: string
  /**
   * The exact field the question concerns, e.g. `pharmacokinetics.halfLife`. Empty string when the
   * question is about the record as a whole, which is a real case and not a missing value.
   */
  fieldPath: string
  reason: ReviewReason
}

/** What was observed this run. Any change here is a new occurrence of the same question. */
export interface CandidateObservation {
  /** Digest of the stored value(s) the question is about, as the agent read them. */
  valueDigest: string
  /**
   * `kind:identifier` for every source behind the observation, each with the snapshot digest the
   * agent saw. Sorted before hashing so source ordering never invents a new occurrence.
   */
  sourceDigests: readonly string[]
  /** The parser or extractor version that produced the value, when one applies. */
  parserVersion: string
  /** The corpus the agent ran over, so a corpus rebuild is visible as a new observation. */
  corpusVersion: string
}

/**
 * The ASCII unit separator, written as an escape so an editor or formatter cannot silently eat an
 * invisible byte and change every key already recorded in the database.
 */
const FIELD_SEPARATOR = '\u001f'

/**
 * A different separator for joining a list INSIDE one field, so a source list of ['a', 'b'] can
 * never flatten into the same bytes as a neighbouring field whose value happens to be 'ab'.
 */
const LIST_SEPARATOR = '\u001e'

function sha256Hex(parts: readonly string[]): string {
  /*
   * Delimited rather than concatenated, so that ('ab', 'c') and ('a', 'bc') cannot collide into one
   * key. Concatenation would let a medicine slug ending in a digit and a field path beginning with
   * one produce the same digest as a different pair, which is a decision recorded against the wrong
   * record and no way to notice.
   */
  return createHash('sha256').update(parts.join(FIELD_SEPARATOR)).digest('hex')
}

/**
 * The stable identity of a review question.
 *
 * Two runs asking the same thing about the same field of the same record produce the same key,
 * whatever the corpus, the counts or the wording have done in between.
 */
export function candidateKey(subject: CandidateSubject): string {
  return sha256Hex([
    'candidate/v1',
    subject.agent,
    subject.reasonSchemaVersion,
    subject.subjectType,
    subject.subjectId,
    subject.fieldPath,
    subject.reason,
  ])
}

/**
 * The identity of one observation of that question.
 *
 * Changing any of the value, the sources behind it, the parser or the corpus produces a new
 * occurrence, which is what causes a previously answered item to reopen with the change visible.
 */
export function occurrenceKey(candidate: string, observation: CandidateObservation): string {
  return sha256Hex([
    'occurrence/v1',
    candidate,
    observation.valueDigest,
    [...observation.sourceDigests].sort().join(LIST_SEPARATOR),
    observation.parserVersion,
    observation.corpusVersion,
  ])
}

/**
 * A stable digest of an arbitrary recorded value.
 *
 * Keys are sorted so that a serializer reordering an object does not read as the value changing.
 * `undefined` is dropped rather than becoming `null`, because an absent field and a field explicitly
 * set to null are the same absence for this purpose and should not produce two occurrences.
 */
export function valueDigest(value: unknown): string {
  return createHash('sha256').update(stableStringify(value)).digest('hex')
}

function stableStringify(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, child]) => child !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, child]) => `${JSON.stringify(key)}:${stableStringify(child)}`)
    return `{${entries.join(',')}}`
  }
  return JSON.stringify(value)
}

/**
 * Whether a previously decided occurrence should be shown to a reviewer again.
 *
 * The rule is deliberately narrow: an unchanged occurrence that someone has already judged stays
 * answered, and everything else reopens. Reopening on a changed source is the point — a value that
 * a reviewer confirmed against a label in August is not confirmed against the label that label
 * became in November, and presenting it as still-answered would be the corpus quietly going stale
 * behind a green tick.
 */
export function shouldResurface(input: {
  currentOccurrenceKey: string
  decidedOccurrenceKeys: readonly string[]
}): boolean {
  return !input.decidedOccurrenceKeys.includes(input.currentOccurrenceKey)
}
