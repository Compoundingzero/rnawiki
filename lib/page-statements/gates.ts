/**
 * The deterministic checks a proposed wording has to pass before it can become a public answer.
 *
 * Three approvals are a statement about three people. They are not a statement about the text, and
 * a wording that turns an association into a cause, or an animal result into a human one, is wrong
 * whether or not three members liked how it read. These gates are the part of the decision that
 * does not depend on who is looking.
 *
 * Every gate is code, not a language model: the same input gives the same answer, and the answer is
 * a stable code a reviewer sees by name. Following `docs/rna-intelligence-v2.md`, every code
 * emitted here is registered in `PAGE_STATEMENT_GATES` below and has an executable focused case in
 * `tests/unit/page-statement-gates.test.ts`. A code that is not registered fails that test rather
 * than reaching a reviewer as an unexplained refusal.
 *
 * A gate never silently drops a proposal. A failing gate is recorded on the revision, shown to the
 * reviewers by name, and blocks publication until the wording changes or the missing evidence is
 * attached.
 */
import {
  TEN_SECOND_FORBIDDEN_FIRST_READ,
  tenSecondWordCount,
} from '@/lib/ten-second-answer-contract'

import {
  pageStatementDefinition,
  type PageStatementChangeCategory,
  type PageStatementKey,
  type PageStatementRiskClass,
} from './types'

export type GateSeverity = 'blocking' | 'advisory'

export interface PageStatementGateDefinition {
  code: string
  /** What a reviewer is told when this gate fails. */
  title: string
  /** Why the rule exists, in one sentence a reader could check. */
  rationale: string
  severity: GateSeverity
}

export interface GateResult {
  code: string
  title: string
  passed: boolean
  severity: GateSeverity
  /** What in the text or the packet triggered it. Empty when the gate passed. */
  detail: string
}

export interface GateInput {
  statementKey: PageStatementKey
  currentText: string
  proposedText: string
  changeCategory: PageStatementChangeCategory
  riskClass: PageStatementRiskClass
  /** The evidence state of the sentence being replaced, carried forward unchanged. */
  evidenceState: string
  sources: ReadonlyArray<{ url?: string; title?: string; excerpt?: string }>
  evidencePacket: {
    population?: string
    intervention?: string
    comparator?: string
    outcome?: string
    effect?: string
    limitations?: string
    doesNotProve?: string
  }
  /** True when the record this sentence belongs to is under an unresolved identity check. */
  identityWarning: boolean
  /** True when the recorded surface moved after the proposal was written. */
  sourceDigestCurrent: boolean
  /** The name the page uses for this medicine, for the wrong-medicine check. */
  medicineName: string
  /** Other recorded names for this medicine: aliases, trade names, the slug. */
  medicineAliases: ReadonlyArray<string>
}

/* --------------------------------------------------------------- patterns */

const CAUSAL_VERBS =
  /\b(?:causes?|caused|prevents?|prevented|cures?|cured|reverses?|reversed|eliminates?|treats?|fixes?|stops?)\b/i
const ASSOCIATION_WORDS =
  /\b(?:associated|association|linked|correlat\w*|observational|cohort|cross-sectional|registry)\b/i
const HEDGE_WORDS = /\b(?:may|might|could|can|appears?|suggests?|seems?)\b/i
const CERTAINTY_WORDS = /\b(?:does|do|will|always|proven|proves?|proved|definitely|certainly)\b/i
const BIOMARKER_WORDS =
  /\b(?:ldl|hdl|cholesterol|hba1c|blood sugar|glucose|blood pressure|crp|biomarker|marker|level|levels|concentration|enzyme|antibody titre|titer|bone density)\b/i
const CLINICAL_OUTCOME_WORDS =
  /\b(?:heart attacks?|strokes?|deaths?|died|dying|mortality|survival|fractures?|hospitalisations?|hospitalizations?|amputations?|blindness|dialysis|cancer)\b/i
const ANIMAL_WORDS =
  /\b(?:mice|mouse|rats?|rodents?|dogs?|monkeys?|in vitro|cell line|cultured cells|transgenic|animal)\b/i
const HUMAN_WORDS =
  /\b(?:people|patients?|adults?|children|participants?|volunteers?|men|women|humans?)\b/i
const MODEL_WORDS =
  /\b(?:model|modelled|modeled|simulat\w*|predict\w*|estimated by|extrapolat\w*)\b/i
const DOSE_PATTERN = /\b\d+(?:[.,]\d+)?\s?(?:mg|g|mcg|µg|ug|ml|iu|units?)\b/i
const DOSE_ADVICE =
  /\b(?:take|taking|dose of|doses of|per day|daily dose|twice a day|three times a day)\b/i
const START_STOP =
  /\b(?:start(?:ing)?|stop(?:ping)?|begin|quit|discontinue|switch(?:ing)? (?:to|from)|come off)\b.{0,30}\b(?:treatment|medication|medicine|taking|it|this)\b/i
const SECOND_PERSON_ADVICE =
  /\b(?:you should|you must|you can safely|talk to your|ask your doctor to|we recommend|i recommend)\b/i
const RATE_PATTERN = /\b(?:\d+(?:[.,]\d+)?\s?%|\d+ in \d+|one in \w+|\d+ per \d+)\b/i
const DENOMINATOR_PATTERN =
  /\b(?:of|among|out of|across|in)\s+(?:about\s+)?[\d,]+\s|\b[\d,]{2,}\s+(?:people|patients|adults|participants|children|men|women)\b/i
const SAFE_CLAIM =
  /\b(?:is safe|are safe|safe to|safe together|no side effects|well tolerated by everyone|harmless|no risk)\b/i
const NO_EVIDENCE_WORDS =
  /\b(?:no (?:evidence|data|studies|trials)|not (?:been )?studied|unknown|not measured|nothing recorded)\b/i
const ALL_FORMULATIONS =
  /\b(?:all (?:forms?|formulations?|preparations?|brands?|products?)|any (?:form|brand|product)|every (?:form|brand))\b/i
const CLASS_WORDS =
  /\b(?:statins?|ssris?|nsaids?|beta[- ]blockers?|glp-?1s?|sirnas?|opioids?|antibiotics?|this class|these drugs)\b/i
const COMBINATION_WORDS =
  /\b(?:combined with|combination (?:with|product)|together with|plus\b|and\s+\w+\s+together)\b/i
const BOXED_WARNING_SOFTENERS =
  /\b(?:rare(?:ly)?|uncommon|unlikely|minor|mild|not usually|rarely a problem|generally safe)\b/i
const INTERNAL_FIELD =
  /\b(?:[a-z]{2,}_[a-z][a-z_]*|K[1-4]:[A-Z0-9]|LEGACY:|set_id|subject_key|corpus_digest|NCT\d{8})\b/
const MARKUP = /<[^>]+>|&(?:#\d+|[a-z]+);|javascript:|data:text\/html/i
const PROMOTION =
  /\b(?:buy|shop|order now|discount|coupon|affiliate|referral|use code|best price|our product|visit our|sponsored)\b/i

/* ----------------------------------------------------------------- catalog */

export const PAGE_STATEMENT_GATES: ReadonlyArray<PageStatementGateDefinition> = [
  {
    code: 'medical_claim_without_source',
    title: 'A medical claim needs a source',
    rationale: 'A sentence that says what a substance does has to name where that came from.',
    severity: 'blocking',
  },
  {
    code: 'population_broadened',
    title: 'The wording covers more people than the study did',
    rationale: 'A result found in one group does not carry to everyone by being written that way.',
    severity: 'blocking',
  },
  {
    code: 'association_became_cause',
    title: 'An association is written as a cause',
    rationale: 'Observational work shows things moving together, not one making the other happen.',
    severity: 'blocking',
  },
  {
    code: 'hedge_removed',
    title: '“May” became “does” without support',
    rationale: 'Dropping a hedge is a change of claim, not a change of wording.',
    severity: 'blocking',
  },
  {
    code: 'biomarker_as_outcome',
    title: 'A measurement is written as something a person would feel',
    rationale: 'A number moving is not the same as fewer heart attacks, and must not read as one.',
    severity: 'blocking',
  },
  {
    code: 'animal_as_human',
    title: 'An animal result is written as a human one',
    rationale:
      'Most results in animals do not repeat in people, and the page has to say which it is.',
    severity: 'blocking',
  },
  {
    code: 'prediction_as_observation',
    title: 'A prediction is written as something observed',
    rationale: 'A model says what might happen. It is not a record of what did.',
    severity: 'blocking',
  },
  {
    code: 'limitation_removed',
    title: 'A limit a reader needs was dropped',
    rationale: 'Removing the boundary beside a result makes the result say more than it can.',
    severity: 'blocking',
  },
  {
    code: 'formulation_broadened',
    title: 'One preparation became all of them',
    rationale: 'What one form does is not automatically what every form does.',
    severity: 'blocking',
  },
  {
    code: 'class_became_specific',
    title: 'A whole class is written as this one medicine',
    rationale: 'A finding about a class is not a finding about each member of it.',
    severity: 'blocking',
  },
  {
    code: 'component_became_combination',
    title: 'One ingredient became a combination product',
    rationale: 'A result for a component is not a result for the mixture it is sold in.',
    severity: 'blocking',
  },
  {
    code: 'absence_became_safe',
    title: '“Nothing found” is written as “safe”',
    rationale:
      'Not looking, and looking and finding nothing, are different, and neither means safe.',
    severity: 'blocking',
  },
  {
    code: 'individual_dosing',
    title: 'The wording names an amount to take',
    rationale: 'RNAWiki records what was studied. It does not tell one person what to take.',
    severity: 'blocking',
  },
  {
    code: 'start_or_stop_instruction',
    title: 'The wording tells a reader to start or stop treatment',
    rationale: 'That decision belongs to a reader and their clinician, not to an evidence record.',
    severity: 'blocking',
  },
  {
    code: 'rate_without_denominator',
    title: 'A rate is given without saying out of how many',
    rationale: 'A percentage with no denominator cannot be checked and reads larger than it is.',
    severity: 'blocking',
  },
  {
    code: 'boxed_warning_weakened',
    title: 'A serious warning is softened',
    rationale: 'The strongest warning a regulator issued is not something a rewording may soften.',
    severity: 'blocking',
  },
  {
    code: 'conflict_hidden',
    title: 'A contradiction in the evidence was dropped',
    rationale: 'Where studies disagree, the page says so rather than picking the nicer one.',
    severity: 'blocking',
  },
  {
    code: 'wrong_medicine',
    title: 'The wording names a different substance',
    rationale: 'A sentence about another medicine on this page is worse than no sentence.',
    severity: 'blocking',
  },
  {
    code: 'stale_source_surface',
    title: 'The record changed after this wording was written',
    rationale: 'A wording judged against a record that has since moved has not been judged.',
    severity: 'blocking',
  },
  {
    code: 'unresolved_identity_warning',
    title: 'This record is held for an identity check',
    rationale: 'Nothing is published onto a page whose subject is still in doubt.',
    severity: 'blocking',
  },
  {
    code: 'plain_language_contract',
    title: 'The wording breaks the plain-language contract',
    rationale: 'The first read has a word limit and a list of terms it explains rather than uses.',
    severity: 'blocking',
  },
  {
    code: 'internal_field_exposed',
    title: 'The wording exposes an internal record field',
    rationale: 'Database keys belong in the technical disclosure, never in a sentence.',
    severity: 'blocking',
  },
  {
    code: 'markup_or_script',
    title: 'The wording contains markup or a script',
    rationale: 'A proposal is text. Anything that could execute is refused rather than escaped.',
    severity: 'blocking',
  },
  {
    code: 'promotion_or_referral',
    title: 'The wording promotes or links to a seller',
    rationale: 'RNAWiki carries no advertising, and a reworded sentence is not a place to start.',
    severity: 'blocking',
  },
  {
    code: 'evidence_fields_missing',
    title: 'A change to the science needs its evidence filled in',
    rationale: 'Who was studied, against what, and what was measured are what a reviewer checks.',
    severity: 'blocking',
  },
]

const GATE_BY_CODE = new Map(PAGE_STATEMENT_GATES.map((gate) => [gate.code, gate]))

/* ------------------------------------------------------------------- runner */

function has(pattern: RegExp, text: string): boolean {
  return pattern.test(text)
}

function gained(pattern: RegExp, before: string, after: string): boolean {
  return !pattern.test(before) && pattern.test(after)
}

function lost(pattern: RegExp, before: string, after: string): boolean {
  return pattern.test(before) && !pattern.test(after)
}

function filled(value: string | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Run every applicable gate. The result is ordered as the catalog is, so a reviewer reading two
 * proposals sees the same checks in the same order.
 */
export function runPageStatementGates(input: GateInput): GateResult[] {
  const before = input.currentText
  const after = input.proposedText
  const meaningful = input.riskClass !== 'copy_only'
  const results: GateResult[] = []

  const emit = (code: string, passed: boolean, detail = ''): void => {
    const definition = GATE_BY_CODE.get(code)
    if (!definition) throw new Error(`unregistered page statement gate: ${code}`)
    results.push({
      code,
      title: definition.title,
      severity: definition.severity,
      passed,
      detail: passed ? '' : detail,
    })
  }

  const hasSource = input.sources.some((source) => filled(source.url) || filled(source.excerpt))
  emit(
    'medical_claim_without_source',
    !meaningful || hasSource,
    'This change alters what the page says the evidence shows, and no source is attached.',
  )

  emit(
    'population_broadened',
    !gained(
      /\b(?:everyone|anyone|all (?:people|adults|patients)|the general population|in general)\b/i,
      before,
      after,
    ),
    'The proposed wording widens who the result applies to.',
  )

  emit(
    'association_became_cause',
    !(has(ASSOCIATION_WORDS, before) && gained(CAUSAL_VERBS, before, after)),
    'The recorded wording describes an association; the proposal describes one thing causing another.',
  )

  emit(
    'hedge_removed',
    !(lost(HEDGE_WORDS, before, after) && gained(CERTAINTY_WORDS, before, after)),
    'A hedge was removed and replaced with a certain claim.',
  )

  emit(
    'biomarker_as_outcome',
    !(
      has(BIOMARKER_WORDS, before) &&
      !has(CLINICAL_OUTCOME_WORDS, before) &&
      has(CLINICAL_OUTCOME_WORDS, after)
    ),
    'The recorded sentence reports a measurement; the proposal reports an event a person would notice.',
  )

  emit(
    'animal_as_human',
    !(has(ANIMAL_WORDS, before) && !has(ANIMAL_WORDS, after) && has(HUMAN_WORDS, after)),
    'The recorded sentence names an animal study; the proposal presents it as a result in people.',
  )

  emit(
    'prediction_as_observation',
    !(has(MODEL_WORDS, before) && !has(MODEL_WORDS, after)),
    'The recorded sentence names a model or a prediction; the proposal drops that word.',
  )

  emit(
    'limitation_removed',
    !(
      meaningful &&
      lost(
        /\b(?:but|however|only|did not|does not|no benefit|no effect|not shown|unclear|uncertain|limited to|in (?:one|a single) study)\b/i,
        before,
        after,
      )
    ),
    'The recorded sentence carries a limit that the proposal drops.',
  )

  emit(
    'formulation_broadened',
    !gained(ALL_FORMULATIONS, before, after),
    'The proposal extends a finding to every form or brand.',
  )

  emit(
    'class_became_specific',
    !(has(CLASS_WORDS, before) && !has(CLASS_WORDS, after) && has(CAUSAL_VERBS, after)),
    'The recorded sentence is about a class of medicines; the proposal states it of this one.',
  )

  emit(
    'component_became_combination',
    !gained(COMBINATION_WORDS, before, after),
    'The proposal describes a combination where the record describes one substance.',
  )

  emit(
    'absence_became_safe',
    !(has(NO_EVIDENCE_WORDS, before) && gained(SAFE_CLAIM, before, after)),
    'The record says nothing was found; the proposal says it is safe.',
  )

  emit(
    'individual_dosing',
    !(has(DOSE_PATTERN, after) && has(DOSE_ADVICE, after)),
    'The proposal names an amount to take.',
  )

  emit(
    'start_or_stop_instruction',
    !has(START_STOP, after) && !has(SECOND_PERSON_ADVICE, after),
    'The proposal tells a reader what to do about their own treatment.',
  )

  emit(
    'rate_without_denominator',
    !(has(RATE_PATTERN, after) && !has(DENOMINATOR_PATTERN, after) && !has(RATE_PATTERN, before)),
    'The proposal introduces a rate without saying out of how many people.',
  )

  emit(
    'boxed_warning_weakened',
    !(
      /\bboxed warning|black box|serious warning|can be fatal|life-threatening\b/i.test(before) &&
      gained(BOXED_WARNING_SOFTENERS, before, after)
    ),
    'The recorded sentence carries a serious warning that the proposal softens.',
  )

  emit(
    'conflict_hidden',
    !lost(
      /\b(?:contradict\w*|disagree\w*|conflicting|mixed|inconsistent|other studies (?:did not|found no))\b/i,
      before,
      after,
    ),
    'The recorded sentence names a disagreement in the evidence that the proposal removes.',
  )

  const aliases = [input.medicineName, ...input.medicineAliases]
    .map((name) => name.trim().toLowerCase())
    .filter((name) => name.length > 2)
  const namedBefore = aliases.some((alias) => before.toLowerCase().includes(alias))
  const namedAfter = aliases.some((alias) => after.toLowerCase().includes(alias))
  emit(
    'wrong_medicine',
    !namedBefore || namedAfter,
    'The recorded sentence names this medicine and the proposal names none of its recorded names.',
  )

  emit(
    'stale_source_surface',
    input.sourceDigestCurrent,
    'The stored record moved after this wording was written, so the approvals no longer apply.',
  )

  emit(
    'unresolved_identity_warning',
    !input.identityWarning,
    'This record is held while its identity is checked.',
  )

  const limit = pageStatementDefinition(input.statementKey).wordLimit
  const words = tenSecondWordCount(after)
  const forbidden = after.match(TEN_SECOND_FORBIDDEN_FIRST_READ)
  emit(
    'plain_language_contract',
    words <= limit && forbidden === null,
    words > limit
      ? `${words} words, and this position allows ${limit}.`
      : `The wording uses ${forbidden?.[0] ?? 'a term'}, which the first read explains rather than uses.`,
  )

  emit(
    'internal_field_exposed',
    !has(INTERNAL_FIELD, after),
    'The wording contains a record field name.',
  )
  emit('markup_or_script', !has(MARKUP, after), 'The wording contains markup.')
  emit(
    'promotion_or_referral',
    !has(PROMOTION, after),
    'The wording promotes a product or a seller.',
  )

  const packetComplete =
    filled(input.evidencePacket.population) &&
    filled(input.evidencePacket.outcome) &&
    filled(input.evidencePacket.limitations)
  emit(
    'evidence_fields_missing',
    !meaningful || packetComplete,
    'Who was studied, what was measured, and what this does not settle are all needed.',
  )

  return results
}

export function gatesPassed(results: ReadonlyArray<GateResult>): boolean {
  return results.every((result) => result.passed || result.severity !== 'blocking')
}

export function failedGates(results: ReadonlyArray<GateResult>): GateResult[] {
  return results.filter((result) => !result.passed && result.severity === 'blocking')
}
