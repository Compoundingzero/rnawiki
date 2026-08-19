// Central definitions for claim events — the recorded results and development events that did not
// support a claim. Any page, component or API route that renders an event type or a development
// gate must import from here rather than printing the stored value: raw enum strings
// (`target_engagement_not_shown`) are never public copy, per the build contract and CLAUDE.md.
//
// The arrays below are the same values as `claimEventTypeEnum` / `developmentGateEnum` in
// db/schema.ts, and the two are synced **by hand**, exactly like `PROOF_BOUNDARY_STAGES` in
// lib/evidence.ts. A value added to one and not the other is a real bug no lint will catch: the
// database will accept the row and the public map lookup will return undefined.

export const CLAIM_EVENT_TYPES = [
  'contradictory_result',
  'null_result',
  'safety_limited',
  'exposure_or_delivery_limit',
  'target_engagement_not_shown',
  'target_engagement_shown_no_clinical_benefit',
  'trial_design_limit',
  'program_stopped_scientific',
  'program_stopped_commercial',
  'regulatory_or_safety_change',
  'retraction_or_correction',
  'other',
] as const

export type ClaimEventType = (typeof CLAIM_EVENT_TYPES)[number]

export const DEVELOPMENT_GATES = [
  'human_biology',
  'intervention_direction',
  'delivery_or_exposure',
  'target_engagement',
  'pathway_response',
  'patient_selection',
  'clinical_outcome',
  'safety',
  'trial_design',
  'manufacturing',
  'commercial',
  'unknown',
] as const

export type DevelopmentGate = (typeof DEVELOPMENT_GATES)[number]

/** Admin-only, shown in the editor dropdown. Never rendered publicly. */
export const CLAIM_EVENT_TYPE_ADMIN_LABELS: Record<ClaimEventType, string> = {
  contradictory_result: 'Contradictory result',
  null_result: 'Null result',
  safety_limited: 'Safety-limited',
  exposure_or_delivery_limit: 'Exposure or delivery limit',
  target_engagement_not_shown: 'Target engagement not shown',
  target_engagement_shown_no_clinical_benefit: 'Target engaged, no clinical benefit',
  trial_design_limit: 'Trial design limit',
  program_stopped_scientific: 'Programme stopped after a scientific result',
  program_stopped_commercial: 'Programme stopped for commercial reasons',
  regulatory_or_safety_change: 'Regulatory or safety change',
  retraction_or_correction: 'Retraction or correction',
  other: 'Other',
}

/** Admin-only, shown in the editor dropdown. Never rendered publicly. */
export const DEVELOPMENT_GATE_ADMIN_LABELS: Record<DevelopmentGate, string> = {
  human_biology: 'Human biology',
  intervention_direction: 'Intervention direction',
  delivery_or_exposure: 'Delivery or exposure',
  target_engagement: 'Target engagement',
  pathway_response: 'Pathway response',
  patient_selection: 'Patient selection',
  clinical_outcome: 'Clinical outcome',
  safety: 'Safety',
  trial_design: 'Trial design',
  manufacturing: 'Manufacturing',
  commercial: 'Commercial',
  unknown: 'Unknown',
}

/**
 * Public sentence for "Where the development chain broke". One plain sentence each.
 *
 * SAFETY RULE — read before editing a string here. These sentences are the most load-bearing prose
 * in the failure section, because they are printed for every event regardless of who wrote the
 * event itself. Three things they must never do:
 *
 * 1. Never say a target, mechanism or treatment is invalid because a trial missed its endpoint.
 *    A gate names the step that is unresolved, not a verdict on the biology. `clinical_outcome`
 *    says the patient-level result was not shown; it does not say the target was wrong.
 * 2. Never define jargon somewhere else. Every sentence carries its own definition, because a
 *    reader meets it inside a disclosure with no glossary in view.
 * 3. `commercial` must read as a business decision, never as a scientific result. See
 *    `isScientificFailure` below.
 */
export const DEVELOPMENT_GATE_PUBLIC: Record<DevelopmentGate, string> = {
  human_biology:
    'The chain stops at human biology: whether the process this treatment acts on works the same way in people as in the laboratory model.',
  intervention_direction:
    'The chain stops at direction: whether pushing this biological process up or down is the change that would help.',
  delivery_or_exposure:
    'The chain stops at delivery: whether enough of the treatment reaches the tissue it must act on, for long enough to have an effect.',
  target_engagement:
    'The chain stops at target engagement: whether the treatment measurably reached and acted on the molecule it was designed to act on.',
  pathway_response:
    'The chain stops at pathway response: whether acting on the target changed the biological process that runs downstream of it.',
  patient_selection:
    'The chain stops at patient selection: whether the people studied were the people whose biology this treatment could affect.',
  clinical_outcome:
    'The chain stops at the patient outcome: whether the biological change produced a result a patient would notice, such as healing faster or living longer.',
  safety:
    'The chain stops at safety: whether the treatment can be given at the level needed without harm that outweighs the benefit.',
  // Worded for an absence as well as a defect. The only seeded event using this gate records
  // that no clinical safety study exists at all; "whether the study was built to answer this
  // question" presupposed a study that was designed, run and reported, which invents one no
  // source records. The wording below is true in both cases — a badly built study and a study
  // nobody ran are both "no study whose design could answer this question".
  //
  // IT ASSERTS ABSENCE OF PUBLISHED RESULTS, NEVER ABSENCE OF A STUDY. It used to open "no study
  // yet exists whose size, length…", which is a claim about the world that this corpus itself
  // contradicts: the BPC-157 gut-healing answer states that a company-run human trial programme
  // in inflammatory bowel disease was registered and never published results, and NCT02637284 is
  // a registered Phase I record with no results ever posted. Those studies exist. What does not
  // exist is a reported result from one built to settle the question, and that is all this may
  // say. See docs/evidence-classification.md on silence being read as disproof.
  trial_design:
    'The chain stops at study design: no study with the size, length, comparison group and chosen measure this question needs has published its results.',
  manufacturing:
    'The chain stops at manufacturing: whether the treatment can be made consistently, at scale, to the standard a regulator requires.',
  commercial:
    'The chain stops at a business decision: whether anyone chose to fund and sell the treatment, which is not a finding about how it works.',
  unknown: 'Public information does not show where the development chain broke.',
}

/**
 * Public sentence naming what kind of event this is, in plain words.
 *
 * The same three rules as `DEVELOPMENT_GATE_PUBLIC` apply. In particular, `null_result` states
 * what a null result is — an outcome measured and found no different from the comparison group —
 * because docs/evidence-classification.md records both failure modes readers fall into: reading
 * silence as disproof, and reading a null result as a gap.
 */
export const CLAIM_EVENT_TYPE_PUBLIC: Record<ClaimEventType, string> = {
  contradictory_result: 'A recorded study result conflicts with this answer.',
  null_result:
    'A study measured the outcome it set out to measure and found no meaningful difference between the treated group and the comparison group.',
  safety_limited:
    'A recorded harm or safety risk limits how far this treatment can be given or tested.',
  // Second pair fixed under the same rule as `trial_design_limit`. This sentence used to define
  // "exposure" in an em-dash aside — "how much of the treatment actually reaches the tissue it
  // must act on" — which is word for word what the `delivery_or_exposure` gate sentence defines
  // two rows below it whenever the two are rendered together. It now uses no jargon, so it needs
  // no definition, and the gate keeps the one definition of the term.
  exposure_or_delivery_limit:
    'Too little of the treatment reached the tissue, for too short a time, to test the claimed effect.',
  target_engagement_not_shown:
    'Target engagement — whether the treatment actually reached and acted on its intended biological target — was never measured.',
  target_engagement_shown_no_clinical_benefit:
    'The treatment was shown to act on its intended target, but the expected clinical benefit did not follow.',
  // Same rule as the `trial_design` gate: this must not assert that a study was run and built
  // badly when the recorded fact is that none exists.
  //
  // It names the category and stops there. It used to end "…in their size, length, comparison
  // group or chosen measure", which is the same four criteria the `trial_design` gate sentence
  // spells out 165px lower in the same event block — the reader was told the same fact twice
  // inside one block, and on BPC-157 that pair renders on two separate claims. The division of
  // labour across every pair in these two maps is: the TYPE says what kind of event this is,
  // the GATE says which step of development is unresolved and defines its jargon. Where they
  // restate each other, the type sentence is the one that gives way — which is why the four
  // criteria are named by the gate sentence directly below this one and not repeated here.
  //
  // BLOCKING — "has reported its results", never "has been run". This string read "No study
  // built to answer this question has been run." and rendered on the BPC-157 gut-healing record
  // 118px below the page's own sentence that a company-run human trial programme in
  // inflammatory bowel disease "was registered but never published results". A registered
  // programme WAS run. The same string also renders on the safety claim, whose corpus contains
  // NCT02637284 — a registered Phase I record with 42 volunteers and no results ever posted.
  // The site was asserting the non-existence of studies its own sources record. What the sources
  // support is narrower and is all this may claim: nothing designed to settle the question has
  // reported. Absence of a report is not absence of a study, and neither is disproof.
  trial_design_limit: 'No study designed to settle this question has reported its results.',
  program_stopped_scientific: 'Development stopped after a scientific result, recorded below.',
  program_stopped_commercial:
    'Development stopped for commercial reasons. No scientific result is recorded as the cause.',
  regulatory_or_safety_change:
    'A regulator changed what this treatment is authorised for, or what its labelling must say.',
  retraction_or_correction:
    'A published paper behind this answer was retracted or corrected by the journal that published it.',
  other:
    'A recorded event that none of the standard categories describes. The summary below states what happened.',
}

/**
 * Commercial discontinuation is not a scientific failure. Callers use this to keep the two apart.
 *
 * SAFETY RULE: a programme shelved for funding, portfolio, patent or market reasons produces no
 * evidence about whether the treatment works. Presenting one as a scientific failure invents a
 * result no source recorded, which is the fabrication rule in CLAUDE.md. `other` returns false for
 * the same reason from the other direction: the category carries no recorded scientific finding by
 * definition, so nothing may be inferred from its presence.
 */
const NON_SCIENTIFIC_EVENT_TYPES: ReadonlySet<ClaimEventType> = new Set([
  'program_stopped_commercial',
  'other',
])

export function isScientificFailure(t: ClaimEventType): boolean {
  return !NON_SCIENTIFIC_EVENT_TYPES.has(t)
}
