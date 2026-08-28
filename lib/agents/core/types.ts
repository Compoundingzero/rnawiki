/**
 * The dataset-agent contract.
 *
 * An agent is a local algorithm that reads the recorded corpus and produces a derived dataset or a
 * queue of work for people. Agents run without any language model and without any network call:
 * they are ordinary deterministic code, so their output can be regenerated, diffed and reviewed
 * exactly like the corpus itself.
 *
 * THE BOUNDARY EVERY AGENT HOLDS. An agent may compute over recorded values, compare them, group
 * them, rank them and flag them. An agent may never author medical content. Concretely, no agent
 * output may:
 *
 *   - fill, impute, interpolate or predict a value the sources did not state, whatever caveat is
 *     attached to it — an estimated half-life displayed beside recorded ones is a medical claim
 *     wearing a disclaimer;
 *   - resolve a disagreement between sources by choosing a winner, which is the judgement the
 *     record exists to present rather than to make;
 *   - assert a property of a MEDICINE where it can only observe a property of a RECORD;
 *   - name a patient action — take, avoid, adjust, monitor, combine, stop — under any phrasing;
 *   - relate two medicines to each other in a way that implies a clinical consequence.
 *
 * Everything an agent produces is one of exactly three things: a statistic computed from recorded
 * values, a structural relation between a medicine and something that is not another medicine, or
 * an item routed to a person to judge.
 */

import type { MedicineRecordedBackground } from '@/lib/background/types'

export interface AgentCorpusEntry {
  slug: string
  name: string
  background: MedicineRecordedBackground
}

export interface AgentInput {
  corpus: readonly AgentCorpusEntry[]
  /**
   * Seed for any randomised step. Part of the agent's declared parameters, so the same corpus and
   * seed always produce the same dataset.
   */
  seed: number
  /**
   * The date the run is attributed to, supplied rather than read from the clock so that a rerun of
   * a past run reproduces it exactly.
   */
  runDate: string
}

/**
 * What an agent drew on, always reported.
 *
 * A dataset covering 900 of 6,000 records is useful; a dataset that looks like it covers all of
 * them is misleading. `reason` says why the rest were unusable, so a reader can tell a gap in the
 * corpus from a limitation of the method.
 */
export interface AgentCoverage {
  considered: number
  used: number
  reason: string
}

export interface AgentRun<TOutput> {
  agent: string
  /** Bumped whenever the algorithm or its parameters change, so outputs stay comparable. */
  version: string
  runDate: string
  seed: number
  parameters: Record<string, string | number | boolean>
  coverage: AgentCoverage
  output: TOutput
  /** Items a person should look at, most important first. Never an automatic correction. */
  queue?: readonly ReviewCandidate[]
  /** Honest limitations a reader of the dataset needs, in plain language. */
  caveats: readonly string[]
}

export const REVIEW_REASONS = [
  'UNUSUAL_FOR_PEER_GROUP',
  'SOURCES_DISAGREE',
  'POSSIBLE_DUPLICATE_SUBSTANCE',
  'ATTRIBUTION_SUSPECT',
  'COVERAGE_GAP',
] as const
export type ReviewReason = (typeof REVIEW_REASONS)[number]

/**
 * One item routed to a person.
 *
 * `question` is phrased as a question about the record for a human to answer, never as a finding
 * about the medicine and never as a proposed edit. An agent's job ends at "someone should look at
 * this, and here is exactly why".
 */
export interface ReviewCandidate {
  slug: string
  reason: ReviewReason
  question: string
  /** Ranking key, higher first. Its meaning is agent-specific and stated in `basis`. */
  priority: number
  basis: string
  /** Source identifiers a reviewer needs in order to check the item. */
  sources: readonly string[]
}

export interface DatasetAgent<TOutput> {
  name: string
  version: string
  /** One line describing what the agent computes, in the language the dataset page uses. */
  description: string
  run(input: AgentInput): AgentRun<TOutput>
}

/**
 * Phrases that would turn a computed observation into advice or into a claim about a medicine.
 * Agent output is screened against these so the boundary is enforced mechanically rather than by
 * remembering to be careful.
 */
export const FORBIDDEN_AGENT_PHRASES: readonly RegExp[] = [
  /\bshould (?:take|avoid|stop|not take|be taken)\b/iu,
  /\bdo not (?:take|use|combine|co-?administer)\b/iu,
  /\b(?:avoid|discontinue|stagger) (?:taking|use|combining)\b/iu,
  /\breduce the dose\b/iu,
  /\badjust(?:ing)? the dose\b/iu,
  /\bis (?:safe|unsafe|dangerous) (?:with|to take|for)\b/iu,
  /\bis contraindicated with\b/iu,
  /\brequires monitoring\b/iu,
  /\binteracts with\b/iu,
  /\bthe correct (?:value|half-life|dose) is\b/iu,
  /\bestimated (?:half-life|bioavailability|clearance)\b/iu,
  /\bpredicted (?:half-life|bioavailability|clearance|value)\b/iu,
]

export function findForbiddenPhrases(text: string): string[] {
  return FORBIDDEN_AGENT_PHRASES.filter((pattern) => pattern.test(text)).map(
    (pattern) => pattern.source,
  )
}
