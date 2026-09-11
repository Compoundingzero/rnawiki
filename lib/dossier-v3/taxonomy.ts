/**
 * The controlled vocabularies the dossier v3 reader surface is built from
 * (docs/evidence-and-outcome-taxonomy.md, docs/entity-resolution-and-trial-role-spec.md).
 *
 * Everything public that names an outcome, an evidence class, a trial role, a completion state or
 * an interaction category reads its words from here, so a stored code never reaches a reader as a
 * bare enum and two components never describe the same class in two ways. The codes are the stored
 * values; the labels are the reader-facing words; the `plain` sentences are the inline definitions
 * the page shows the first time a class appears.
 *
 * Nothing here decides anything about a medicine. It is a dictionary.
 */

/* ------------------------------------------------------------------ outcome classes (A–H) */

export const OUTCOME_CLASSES = [
  {
    code: 'clinical_event',
    letter: 'A',
    label: 'Meaningful clinical event',
    plain:
      'Something that happens to a person, such as a heart attack, a fracture or a hospital stay.',
    importance: 5,
  },
  {
    code: 'function_performance',
    letter: 'B',
    label: 'Function or performance',
    plain:
      'What a person can do, such as how much they can lift, how far they can walk or how well they remember.',
    importance: 4,
  },
  {
    code: 'symptom_quality_of_life',
    letter: 'C',
    label: 'Symptom or quality of life',
    plain:
      'How a person feels, such as pain, sleep quality, mood or energy, usually measured with a questionnaire.',
    importance: 4,
  },
  {
    code: 'biomarker_surrogate',
    letter: 'D',
    label: 'Biomarker or surrogate',
    plain:
      'A measurement in blood or tissue, such as LDL cholesterol or HbA1c, that may or may not track a health benefit.',
    importance: 2,
  },
  {
    code: 'mechanistic_measurement',
    letter: 'E',
    label: 'Mechanistic measurement',
    plain:
      'A laboratory reading of what the substance does to cells or pathways. It does not show a health benefit on its own.',
    importance: 1,
  },
  {
    code: 'safety_tolerability',
    letter: 'F',
    label: 'Safety or tolerability',
    plain: 'Unwanted effects and how many people stopped because of them.',
    importance: 3,
  },
  {
    code: 'longevity_mortality',
    letter: 'G',
    label: 'Longevity or mortality',
    plain: 'Whether people lived longer or fewer people died during the study.',
    importance: 5,
  },
  {
    code: 'unknown_outcome',
    letter: 'H',
    label: 'Unknown or poorly specified',
    plain: 'The source does not say clearly what was measured.',
    importance: 0,
  },
] as const

export type OutcomeClass = (typeof OUTCOME_CLASSES)[number]['code']
export const OUTCOME_CLASS_CODES = OUTCOME_CLASSES.map((entry) => entry.code) as [
  OutcomeClass,
  ...OutcomeClass[],
]

/* ------------------------------------------------------------------ evidence classes */

/**
 * The layer a piece of evidence comes from. These are kept visually separate on every page and are
 * never collapsed into one score (mission: "Do not collapse all categories into one magic score").
 */
export const EVIDENCE_CLASSES = [
  {
    code: 'regulatory_label',
    label: 'Regulatory label',
    plain: 'What a medicines regulator approved and printed on the official product information.',
    human: true,
  },
  {
    code: 'randomized_trial',
    label: 'Randomised controlled trial',
    plain:
      'People were assigned by chance to the substance or to a comparison, so the groups can be compared fairly.',
    human: true,
  },
  {
    code: 'controlled_trial',
    label: 'Controlled trial, not randomised',
    plain:
      'People took the substance and were compared with another group, but were not assigned by chance.',
    human: true,
  },
  {
    code: 'uncontrolled_human_study',
    label: 'Human study without a comparison group',
    plain:
      'People took the substance and were measured before and after, with no separate comparison group.',
    human: true,
  },
  {
    code: 'observational',
    label: 'Observational research',
    plain:
      'Researchers watched what happened to people who chose to take the substance. It can show links, not causes.',
    human: true,
  },
  {
    code: 'mechanism_study',
    label: 'Mechanism study',
    plain:
      'Experiments in cells, tissue or animals about how the substance acts. Not evidence of human benefit.',
    human: false,
  },
  {
    code: 'spontaneous_report',
    label: 'Spontaneous report',
    plain:
      'A report someone sent to a safety database after taking the substance. It is a signal, not proof of cause.',
    human: true,
  },
  {
    code: 'case_report',
    label: 'Case report',
    plain:
      'A published account of one person or a few people. It can raise a question; it cannot settle one.',
    human: true,
  },
  {
    code: 'community_anecdote',
    label: 'Community report',
    plain:
      'What people wrote about their own experience. Not checked, not measured, and often not representative.',
    human: true,
  },
  {
    code: 'model_prediction',
    label: 'Model prediction',
    plain:
      'A hypothesis produced by software from patterns in other data. It has not been checked by a person.',
    human: false,
  },
] as const

export type EvidenceClass = (typeof EVIDENCE_CLASSES)[number]['code']
export const EVIDENCE_CLASS_CODES = EVIDENCE_CLASSES.map((entry) => entry.code) as [
  EvidenceClass,
  ...EvidenceClass[],
]

/* ------------------------------------------------------------------ mechanism stage origins */

export const EVIDENCE_ORIGINS = [
  {
    code: 'human_outcome',
    label: 'Human outcome',
    plain: 'Measured as a health result in people.',
  },
  {
    code: 'human_biomarker',
    label: 'Human biomarker',
    plain: 'Measured in people, but as a laboratory value.',
  },
  { code: 'animal', label: 'Animal', plain: 'Shown in animals only.' },
  { code: 'cell_lab', label: 'Cell or laboratory', plain: 'Shown in cells or a test tube only.' },
  {
    code: 'inferred',
    label: 'Inferred',
    plain: 'Reasoned from other findings; not directly shown.',
  },
  {
    code: 'predicted',
    label: 'Predicted',
    plain: 'Proposed by a model; not shown in any experiment.',
  },
  { code: 'unknown', label: 'Unknown', plain: 'No source found for this step.' },
] as const

export type EvidenceOrigin = (typeof EVIDENCE_ORIGINS)[number]['code']

/** Origins that count as experimentally supported for the visible evidence boundary. */
export const SUPPORTED_ORIGINS: ReadonlySet<EvidenceOrigin> = new Set([
  'human_outcome',
  'human_biomarker',
  'animal',
  'cell_lab',
])

/* ------------------------------------------------------------------ completion states */

/**
 * The explicit state every required dossier field carries. There is no silent blank: a field that
 * has not been resolved to one of these cannot render, and the index-quality gate refuses the page.
 */
export const COMPLETION_STATES = [
  {
    code: 'verified_evidence_present',
    label: 'Verified evidence present',
    plain: 'A reviewed record with an exact source fills this field.',
    terminal: true,
  },
  {
    code: 'no_qualifying_evidence_after_search',
    label: 'No qualifying evidence found',
    plain:
      'The named sources were searched on the recorded date and nothing qualifying was found. This is not evidence of safety or of absence of effect.',
    terminal: true,
  },
  {
    code: 'not_applicable',
    label: 'Not applicable',
    plain: 'This field does not apply to this kind of record.',
    terminal: true,
  },
  {
    code: 'ambiguous_quarantined',
    label: 'Ambiguous, held for review',
    plain:
      'The sources disagree or the identity match is uncertain, so nothing is shown until a person decides.',
    terminal: false,
  },
  {
    code: 'awaiting_human_review',
    label: 'Awaiting review',
    plain: 'A draft exists but no qualified reviewer has signed it, so it is not shown.',
    terminal: false,
  },
  {
    code: 'source_unavailable',
    label: 'Source unavailable',
    plain: 'The source could not be fetched or has been withdrawn.',
    terminal: false,
  },
  {
    code: 'legally_unavailable',
    label: 'Not shown for licensing reasons',
    plain: 'The data exists but its licence does not permit RNAWiki to show it.',
    terminal: true,
  },
  {
    code: 'pipeline_failure',
    label: 'Processing failed',
    plain: 'RNAWiki could not process this field. It is recorded as a failure, not as an absence.',
    terminal: false,
  },
] as const

export type CompletionState = (typeof COMPLETION_STATES)[number]['code']
export const COMPLETION_STATE_CODES = COMPLETION_STATES.map((entry) => entry.code) as [
  CompletionState,
  ...CompletionState[],
]

/* ------------------------------------------------------------------ interaction categories */

export const INTERACTION_CATEGORIES = [
  {
    code: 'documented_clinically_important',
    ordinal: 1,
    label: 'Documented, clinically important interaction',
    plain:
      'A regulator, label or controlled study records an interaction that changed a clinical outcome or required a change in care.',
  },
  {
    code: 'documented_usually_manageable',
    ordinal: 2,
    label: 'Documented, usually manageable interaction',
    plain:
      'A recorded interaction that sources describe as manageable with monitoring or spacing, in the populations they studied.',
  },
  {
    code: 'plausible_mechanistic_limited_clinical',
    ordinal: 3,
    label: 'Plausible mechanistic concern, limited clinical evidence',
    plain:
      'The two share an enzyme, transporter or target, so an effect is plausible, but no study in people has measured it.',
  },
  {
    code: 'conflicting_evidence',
    ordinal: 4,
    label: 'Conflicting evidence',
    plain: 'Sources disagree about whether or how these interact.',
  },
  {
    code: 'no_interaction_evidence_located',
    ordinal: 5,
    label: 'No interaction evidence located',
    plain:
      'The sources checked on the recorded date hold nothing about this pair. This does not mean the pair is safe together.',
  },
  {
    code: 'insufficient_information',
    ordinal: 6,
    label: 'Insufficient information',
    plain: 'Not enough is recorded about one of the two to check for an interaction.',
  },
  {
    code: 'input_not_identified',
    ordinal: 7,
    label: 'Input could not be confidently identified',
    plain: 'RNAWiki could not match what was typed to one exact substance, so it did not guess.',
  },
] as const

export type InteractionCategory = (typeof INTERACTION_CATEGORIES)[number]['code']

/* ------------------------------------------------------------------ trial roles */

/**
 * What a substance was in a registered trial. Only `experimental_intervention` supports the
 * statement that the trial tested the substance; `administered` says whether people received it
 * at all, which matters for safety counts but never for benefit claims.
 */
export const TRIAL_ROLES = [
  {
    code: 'experimental_intervention',
    label: 'Tested intervention',
    administered: true,
    supportsTestedClaim: true,
  },
  {
    code: 'active_comparator',
    label: 'Active comparator',
    administered: true,
    supportsTestedClaim: false,
  },
  { code: 'placebo', label: 'Placebo arm', administered: false, supportsTestedClaim: false },
  {
    code: 'background_therapy',
    label: 'Background therapy',
    administered: true,
    supportsTestedClaim: false,
  },
  {
    code: 'rescue_therapy',
    label: 'Rescue therapy',
    administered: true,
    supportsTestedClaim: false,
  },
  {
    code: 'concomitant_medication',
    label: 'Concomitant medication',
    administered: true,
    supportsTestedClaim: false,
  },
  {
    code: 'eligibility_criterion',
    label: 'Named in eligibility criteria',
    administered: false,
    supportsTestedClaim: false,
  },
  {
    code: 'exclusion_criterion',
    label: 'Named in exclusion criteria',
    administered: false,
    supportsTestedClaim: false,
  },
  {
    code: 'outcome_measurement',
    label: 'Named in an outcome measure',
    administered: false,
    supportsTestedClaim: false,
  },
  {
    code: 'mention_only',
    label: 'Mentioned only',
    administered: false,
    supportsTestedClaim: false,
  },
  {
    /**
     * An observational study lists the substances its cohorts were exposed to under the same
     * `interventions` heading an interventional trial uses. The study did not give anyone the
     * substance, so it is neither a tested intervention nor a mere mention.
     */
    code: 'observational_exposure',
    label: 'Exposure in an observational study',
    administered: false,
    supportsTestedClaim: false,
  },
  {
    /**
     * Interventional, and the substance is registered as an intervention, but other active
     * interventions are registered too and the snapshot holds no arm groups: it may have been the
     * tested treatment, an active comparator, or one part of a combination.
     */
    code: 'administered_role_unclear',
    label: 'Given in the trial, role unclear',
    administered: true,
    supportsTestedClaim: false,
  },
  { code: 'unclear', label: 'Role unclear', administered: false, supportsTestedClaim: false },
] as const

export type TrialRole = (typeof TRIAL_ROLES)[number]['code']
export const TRIAL_ROLE_CODES = TRIAL_ROLES.map((entry) => entry.code) as [
  TrialRole,
  ...TrialRole[],
]

export function trialRoleSupportsTestedClaim(role: TrialRole): boolean {
  return TRIAL_ROLES.find((entry) => entry.code === role)?.supportsTestedClaim ?? false
}

/**
 * How the legacy loader recorded a registry match (`page_registry_studies.role`). None of these is
 * a trial role in the sense above: `intervention` says the page's name matched an intervention
 * string, which may be a comparator or a background therapy; `otherName` says a synonym matched
 * anywhere in the record; `stored` says an earlier record carried the NCT id.
 */
export const LEGACY_REGISTRY_MATCH_KINDS = ['intervention', 'otherName', 'stored'] as const
export type LegacyRegistryMatchKind = (typeof LEGACY_REGISTRY_MATCH_KINDS)[number]

/* ------------------------------------------------------------------ identity relations */

export const IDENTITY_RELATIONS = [
  'SAME_ENTITY_AS',
  'HAS_SYNONYM',
  'SALT_OF',
  'ISOMER_OF',
  'METABOLITE_OF',
  'PRODRUG_OF',
  'FORMULATION_OF',
  'ACTIVE_INGREDIENT_OF',
  'COMPONENT_OF',
  'MEMBER_OF_CLASS',
  'EXTRACT_OF',
  'POSSIBLY_MATCHES',
] as const

export type IdentityRelation = (typeof IDENTITY_RELATIONS)[number]

/** Relations that may carry evidence from one node to the other. Everything else is a link only. */
export const EVIDENCE_TRANSFERRING_RELATIONS: ReadonlySet<IdentityRelation> = new Set([
  'SAME_ENTITY_AS',
])

/* ------------------------------------------------------------------ substance types */

export const SUBSTANCE_TYPES = [
  { code: 'prescription_medicine', label: 'Prescription medicine', supervision: 'required' },
  { code: 'otc_medicine', label: 'Over-the-counter medicine', supervision: 'advised' },
  { code: 'supplement', label: 'Supplement', supervision: 'not_usually' },
  { code: 'nutrient', label: 'Nutrient', supervision: 'not_usually' },
  { code: 'botanical_preparation', label: 'Botanical preparation', supervision: 'not_usually' },
  { code: 'investigational_agent', label: 'Investigational agent', supervision: 'required' },
  { code: 'biologic', label: 'Biologic medicine', supervision: 'required' },
  { code: 'rna_medicine', label: 'RNA medicine', supervision: 'required' },
  { code: 'controlled_substance', label: 'Controlled substance', supervision: 'required' },
  { code: 'withdrawn_medicine', label: 'Withdrawn medicine', supervision: 'required' },
  { code: 'other', label: 'Other', supervision: 'unknown' },
] as const

export type SubstanceType = (typeof SUBSTANCE_TYPES)[number]['code']
export type SupervisionLevel = (typeof SUBSTANCE_TYPES)[number]['supervision']

/* ------------------------------------------------------------------ claim strength vocabulary */

/**
 * The only words a Decision Card may use for evidence status. "Safe", "proven" and "works" without
 * scope are refused by the copy contract.
 */
export const CLAIM_STRENGTHS = [
  {
    code: 'strong_human_specific_use',
    label: 'Strong human evidence for this specific use',
  },
  {
    code: 'promising_short_studies',
    label: 'Promising, but based mainly on short studies',
  },
  {
    code: 'biomarker_only',
    label: 'A biomarker changed; meaningful health improvement has not been established',
  },
  {
    code: 'animal_or_cell_only',
    label: 'Only animal or cellular evidence was found',
  },
  {
    code: 'mixed_or_contradicted',
    label: 'Studies disagree; no single conclusion is supported',
  },
  {
    code: 'no_reviewed_conclusion',
    label: 'No reviewed conclusion yet',
  },
] as const

export type ClaimStrength = (typeof CLAIM_STRENGTHS)[number]['code']

export const NO_REVIEWED_CONCLUSION_SENTENCE =
  'RNAWiki has not yet published a reviewed conclusion for this use.'

/* ------------------------------------------------------------------ review and contradiction */

export const REVIEWER_STATES = [
  'draft',
  'awaiting_review',
  'reviewed',
  'rejected',
  'superseded',
  'retracted',
] as const
export type ReviewerState = (typeof REVIEWER_STATES)[number]

/** Only a reviewed claim may support a public sentence. */
export const PUBLISHABLE_REVIEWER_STATES: ReadonlySet<ReviewerState> = new Set(['reviewed'])

export const CONTRADICTION_STATES = ['none_found', 'contradicted', 'mixed', 'unknown'] as const
export type ContradictionState = (typeof CONTRADICTION_STATES)[number]

export const CAUSALITY_LEVELS = [
  'causal_randomized',
  'causal_controlled',
  'associational',
  'mechanistic',
  'anecdotal',
  'predicted',
  'unknown',
] as const
export type CausalityLevel = (typeof CAUSALITY_LEVELS)[number]

/** Higher means the wording may claim more; a plain version may never rank above its technical one. */
export const CAUSALITY_RANK: Record<CausalityLevel, number> = {
  causal_randomized: 6,
  causal_controlled: 5,
  associational: 4,
  mechanistic: 3,
  anecdotal: 2,
  predicted: 1,
  unknown: 0,
}

export const UNCERTAINTY_LEVELS = ['low', 'moderate', 'high', 'unknown'] as const
export type UncertaintyLevel = (typeof UNCERTAINTY_LEVELS)[number]

/** Higher means more certain; a plain version may never rank above its technical one. */
export const CERTAINTY_RANK: Record<UncertaintyLevel, number> = {
  low: 3,
  moderate: 2,
  high: 1,
  unknown: 0,
}

export const EFFECT_DIRECTIONS = ['increase', 'decrease', 'no_change', 'mixed', 'unknown'] as const
export type EffectDirection = (typeof EFFECT_DIRECTIONS)[number]

/* ------------------------------------------------------------------ user goals */

export const USER_GOALS = [
  { code: 'sleep', label: 'Sleep' },
  { code: 'energy', label: 'Energy' },
  { code: 'focus', label: 'Focus' },
  { code: 'mood', label: 'Mood' },
  { code: 'strength', label: 'Strength' },
  { code: 'muscle', label: 'Muscle' },
  { code: 'endurance', label: 'Endurance' },
  { code: 'body_fat_weight', label: 'Body fat or weight' },
  { code: 'glucose_metabolic', label: 'Glucose or metabolic health' },
  { code: 'cardiovascular_risk', label: 'Cardiovascular risk' },
  { code: 'pain_recovery', label: 'Pain or recovery' },
  { code: 'fertility_sexual_health', label: 'Fertility or sexual health' },
  { code: 'healthy_aging', label: 'Healthy aging' },
] as const

export type UserGoal = (typeof USER_GOALS)[number]['code']
export const USER_GOAL_CODES = USER_GOALS.map((entry) => entry.code) as [UserGoal, ...UserGoal[]]

/* ------------------------------------------------------------------ index-quality gate */

export const INDEX_QUALITY_CHECKS = [
  'identity_passed',
  'required_summary_fields_resolved',
  'public_claims_reviewed',
  'source_coverage_passed',
  'no_critical_contamination',
  'canonical_metadata_passed',
  'no_raw_internal_fields',
] as const

export type IndexQualityCheck = (typeof INDEX_QUALITY_CHECKS)[number]

/* ------------------------------------------------------------------ lookups */

export function outcomeClassLabel(code: OutcomeClass): string {
  return (
    OUTCOME_CLASSES.find((entry) => entry.code === code)?.label ?? 'Unknown or poorly specified'
  )
}

export function evidenceClassLabel(code: EvidenceClass): string {
  return EVIDENCE_CLASSES.find((entry) => entry.code === code)?.label ?? 'Unrecorded evidence class'
}

export function completionStateLabel(code: CompletionState): string {
  return COMPLETION_STATES.find((entry) => entry.code === code)?.label ?? 'Processing failed'
}

export function claimStrengthLabel(code: ClaimStrength): string {
  return CLAIM_STRENGTHS.find((entry) => entry.code === code)?.label ?? 'No reviewed conclusion yet'
}
