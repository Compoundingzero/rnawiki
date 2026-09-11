/**
 * Dossier v4 vocabularies (docs/dossier-v4-information-architecture.md).
 *
 * v3 owns the evidence vocabulary — outcome classes, evidence classes, trial roles, claim
 * strengths, completion states — and v4 keeps reading it from `lib/dossier-v3/taxonomy.ts` rather
 * than restating it. What lives here is only what the Substance Compass adds: the five truth
 * lanes, the section states a reader meets, the staircase rungs, the reasons a substance may not
 * appear to work, and the vocabularies for identity, interaction, safety and community reports.
 *
 * Every code carries a `label` a reader can read and a `plain` sentence that explains it. Codes
 * themselves are never rendered: the reader sees the label, and the code lives in a data attribute
 * for tests and for the technical disclosure.
 */
import type { CompletionState } from '@/lib/dossier-v3/taxonomy'

/* ------------------------------------------------------------------- lanes */

/**
 * The five truth lanes. Every section belongs to exactly one. The page never merges two lanes
 * into one sentence, because the whole point is that a mechanism is not a result and a result is
 * not a personal prediction.
 */
export const TRUTH_LANES = [
  {
    code: 'body_action',
    label: 'What it changes in the body',
    plain: 'The physical change the substance makes inside a body.',
  },
  {
    code: 'human_result',
    label: 'What happened in people',
    plain: 'What was measured when people took it in a study.',
  },
  {
    code: 'personal_reality',
    label: 'What it would be like to take',
    plain: 'What a person might notice, measure, or find hard to keep up.',
  },
  {
    code: 'uncertainty',
    label: 'What is missing or unclear',
    plain: 'Gaps, disagreements, and results that may not carry over to you.',
  },
  {
    code: 'community_experience',
    label: 'What people report',
    plain: 'Reports written by people, kept separate from the studies.',
  },
] as const

export type TruthLane = (typeof TRUTH_LANES)[number]['code']

export function truthLaneLabel(code: TruthLane): string {
  return TRUTH_LANES.find((lane) => lane.code === code)?.label ?? code
}

/* --------------------------------------------------------- section states */

/**
 * Why a section looks the way it does. Every section carries one. A section that cannot be shown
 * says which of these applies; it never disappears without a word.
 */
export const SECTION_STATES = [
  {
    code: 'reviewed_content',
    label: 'Reviewed',
    plain: 'A person checked this against the sources and signed it off.',
    tone: 'strong',
  },
  {
    code: 'source_checked_draft',
    label: 'Read from sources, not yet reviewed',
    plain: 'Built from stored sources by fixed rules. No reviewer has signed it off.',
    tone: 'neutral',
  },
  {
    code: 'no_qualifying_evidence',
    label: 'Nothing found in the sources checked',
    plain:
      'The sources listed were searched and held nothing. That is not the same as nothing existing.',
    tone: 'muted',
  },
  {
    code: 'not_applicable',
    label: 'Does not apply here',
    plain: 'This question does not apply to this kind of substance.',
    tone: 'muted',
  },
  {
    code: 'ambiguous',
    label: 'Held back as unclear',
    plain: 'The stored records disagree, so nothing is shown until a person settles it.',
    tone: 'caution',
  },
  {
    code: 'awaiting_review',
    label: 'Waiting for a reviewer',
    plain: 'A draft exists and is in the queue. It is not shown as a conclusion.',
    tone: 'neutral',
  },
  {
    code: 'source_unavailable',
    label: 'Source could not be read',
    plain: 'The source RNAWiki needs did not answer, so the question stays open.',
    tone: 'caution',
  },
  {
    code: 'feature_not_enabled',
    label: 'Not switched on yet',
    plain: 'The part of RNAWiki that fills this in is built but not yet turned on.',
    tone: 'muted',
  },
  {
    code: 'pipeline_failure',
    label: 'Something broke on our side',
    plain: 'A step failed while preparing this page. The gap is ours, not the evidence.',
    tone: 'caution',
  },
] as const

export type SectionState = (typeof SECTION_STATES)[number]['code']
export const SECTION_STATE_CODES = SECTION_STATES.map((state) => state.code)

export function sectionStateLabel(code: SectionState): string {
  return SECTION_STATES.find((state) => state.code === code)?.label ?? code
}

export function sectionStatePlain(code: SectionState): string {
  return SECTION_STATES.find((state) => state.code === code)?.plain ?? ''
}

export function sectionStateTone(code: SectionState): string {
  return SECTION_STATES.find((state) => state.code === code)?.tone ?? 'neutral'
}

/** v3 stores completion states on fields; v4 shows section states. This is the only bridge. */
export function sectionStateFromCompletion(state: CompletionState): SectionState {
  switch (state) {
    case 'verified_evidence_present':
      return 'reviewed_content'
    case 'no_qualifying_evidence_after_search':
      return 'no_qualifying_evidence'
    case 'not_applicable':
      return 'not_applicable'
    case 'ambiguous_quarantined':
      return 'ambiguous'
    case 'awaiting_human_review':
      return 'awaiting_review'
    case 'source_unavailable':
    case 'legally_unavailable':
      return 'source_unavailable'
    case 'pipeline_failure':
      return 'pipeline_failure'
    default:
      return 'awaiting_review'
  }
}

/* ---------------------------------------------------------------- purpose */

/**
 * The purpose rail. These are anchors, not filters: choosing one moves the page and raises the
 * matching sections, and never hides a safety or contradiction section.
 */
export const PURPOSES = [
  {
    code: 'understand',
    label: 'Understand what it does',
    target: 'substance-action',
    plain: 'Start with the body and work outwards.',
  },
  {
    code: 'my_goal',
    label: 'See evidence for my goal',
    target: 'goal-fingerprint',
    plain: 'Jump to what was measured, goal by goal.',
  },
  {
    code: 'risk',
    label: 'Check risks and what it mixes with',
    target: 'safety',
    plain: 'Go to harms and to pairs of substances.',
  },
  {
    code: 'alternatives',
    label: 'Compare alternatives',
    target: 'alternatives',
    plain: 'See other ways people approach the same goal.',
  },
  {
    code: 'measure',
    label: 'Learn what to measure',
    target: 'measurement',
    plain: 'Go to what a person could sensibly track.',
  },
] as const

export type Purpose = (typeof PURPOSES)[number]['code']

/* ------------------------------------------------------------------ goals */

/**
 * The reader-facing goal list. It extends the thirteen v3 goals with the three entry states the
 * brief names, so a person who has no goal yet still has somewhere to stand. `justLearning` and
 * `diagnosedCondition` are deliberately not stored preferences: nothing about a reader's health is
 * inferred, recorded or sent anywhere.
 */
export const COMPASS_GOALS = [
  { code: 'sleep', label: 'Sleep', v3: 'sleep' },
  { code: 'energy', label: 'Energy', v3: 'energy' },
  { code: 'focus', label: 'Focus', v3: 'focus' },
  { code: 'mood', label: 'Mood', v3: 'mood' },
  { code: 'strength', label: 'Strength', v3: 'strength' },
  { code: 'muscle', label: 'Muscle', v3: 'muscle' },
  { code: 'endurance', label: 'Endurance', v3: 'endurance' },
  { code: 'recovery', label: 'Recovery', v3: 'pain_recovery' },
  { code: 'weight', label: 'Body weight', v3: 'body_fat_weight' },
  { code: 'glucose', label: 'Blood sugar', v3: 'glucose_metabolic' },
  { code: 'cholesterol', label: 'Cholesterol', v3: 'cardiovascular_risk' },
  { code: 'pain', label: 'Pain', v3: 'pain_recovery' },
  { code: 'fertility', label: 'Fertility and sexual health', v3: 'fertility_sexual_health' },
  { code: 'healthy_aging', label: 'Healthy ageing', v3: 'healthy_aging' },
  { code: 'diagnosed_condition', label: 'A condition I was diagnosed with', v3: null },
  { code: 'just_learning', label: 'Just learning', v3: null },
] as const

export type CompassGoal = (typeof COMPASS_GOALS)[number]['code']

export function compassGoalLabel(code: string): string {
  return COMPASS_GOALS.find((goal) => goal.code === code)?.label ?? code
}

/** The v4 goal a v3 goal code maps to, where one exists. */
export function compassGoalFromV3(code: string): CompassGoal | null {
  return COMPASS_GOALS.find((goal) => goal.v3 === code)?.code ?? null
}

/* ------------------------------------------------------- effect fingerprint */

/**
 * The state of one goal against one column of the fingerprint. There is deliberately no total
 * score: a substance with a strong biomarker result and no outcome result is a different thing
 * from one with a weak result on both, and one number would hide that.
 */
export const FINGERPRINT_STATES = [
  {
    code: 'demonstrated',
    label: 'Shown in people',
    glyph: '●',
    plain: 'Measured in people, for this exact use, and repeated.',
  },
  {
    code: 'supported_with_limits',
    label: 'Shown, with limits',
    glyph: '◐',
    plain: 'Measured in people, but the studies were small, short or narrow.',
  },
  {
    code: 'mixed',
    label: 'Studies disagree',
    glyph: '≈',
    plain: 'Some studies found a change and others did not.',
  },
  {
    code: 'biomarker_only',
    label: 'Only a number moved',
    glyph: '△',
    plain: 'A blood test or scan changed. How the person felt or fared was not shown to change.',
  },
  {
    code: 'mechanism_only',
    label: 'Only a body step',
    glyph: '○',
    plain: 'A step inside the body was measured. No result in a whole person was.',
  },
  {
    code: 'preclinical_only',
    label: 'Only animals or cells',
    glyph: '□',
    plain: 'Studied in animals or in a dish. People were not studied for this.',
  },
  {
    code: 'predicted',
    label: 'A guess from a model',
    glyph: '⋯',
    plain: 'Software suggested this. Nobody measured it. It is never a conclusion here.',
  },
  {
    code: 'no_qualifying_evidence',
    label: 'Nothing in the sources checked',
    glyph: '∅',
    plain: 'The sources listed held nothing for this goal.',
  },
  {
    code: 'unknown',
    label: 'Not recorded',
    glyph: '—',
    plain: 'RNAWiki has not recorded an answer either way.',
  },
  {
    code: 'awaiting_review',
    label: 'Waiting for a reviewer',
    glyph: '…',
    plain: 'A draft exists and has not been signed off.',
  },
] as const

export type FingerprintState = (typeof FINGERPRINT_STATES)[number]['code']

export function fingerprintStateLabel(code: FingerprintState): string {
  return FINGERPRINT_STATES.find((state) => state.code === code)?.label ?? code
}

export function fingerprintStateGlyph(code: FingerprintState): string {
  return FINGERPRINT_STATES.find((state) => state.code === code)?.glyph ?? '—'
}

/** The fingerprint columns, strongest-to-weakest evidence of a thing a person would notice. */
export const FINGERPRINT_COLUMNS = [
  {
    code: 'meaningful_human_outcome',
    label: 'Life outcome',
    plain: 'Living longer, avoiding a heart attack, walking again.',
  },
  {
    code: 'performance_or_function',
    label: 'What a body can do',
    plain: 'Lifting more, walking further, climbing stairs.',
  },
  { code: 'symptom', label: 'How a person feels', plain: 'Pain, tiredness, low mood, poor sleep.' },
  {
    code: 'biomarker',
    label: 'A test result',
    plain: 'A number from blood, urine or a scan.',
  },
  {
    code: 'mechanism',
    label: 'A step in the body',
    plain: 'Something measured inside cells or tissue.',
  },
  { code: 'safety', label: 'Harms', plain: 'What went wrong for people in the studies.' },
  { code: 'duration', label: 'How long', plain: 'How long people actually took it.' },
  {
    code: 'applicability',
    label: 'Who was studied',
    plain: 'Whether people like the reader were in the studies.',
  },
] as const

export type FingerprintColumn = (typeof FINGERPRINT_COLUMNS)[number]['code']

/* ------------------------------------------------------ evidence staircase */

/**
 * The staircase. Higher is closer to something a person would care about, which is not the same as
 * better done. A large careful animal study sits below a small sloppy human one, and the component
 * says so in those words.
 */
export const STAIRCASE_LEVELS = [
  {
    code: 'mortality_or_major_event',
    rank: 9,
    label: 'Living longer, or avoiding a major event',
    plain: 'Death, a heart attack, a stroke, a hospital stay.',
  },
  {
    code: 'clinical_function',
    rank: 8,
    label: 'What a body can do day to day',
    plain: 'Walking, dressing, breathing, recovering.',
  },
  {
    code: 'performance',
    rank: 7,
    label: 'Measured performance',
    plain: 'How much was lifted, how far was run, how fast.',
  },
  {
    code: 'symptom_or_quality_of_life',
    rank: 6,
    label: 'Symptoms and quality of life',
    plain: 'Pain, tiredness, mood, sleep, as the person rated it.',
  },
  {
    code: 'biomarker_or_surrogate',
    rank: 5,
    label: 'A number that stands in for health',
    plain: 'Cholesterol, blood sugar, bone density. A stand-in, not the thing itself.',
  },
  {
    code: 'human_mechanism',
    rank: 4,
    label: 'A step measured inside a person',
    plain: 'Something measured in human tissue or human cells.',
  },
  {
    code: 'animal',
    rank: 3,
    label: 'Animals',
    plain: 'Mice, rats, dogs. Useful for ideas, not proof about people.',
  },
  {
    code: 'cell_or_lab',
    rank: 2,
    label: 'Cells in a dish',
    plain: 'Cells or chemistry on a bench, far from a whole body.',
  },
  {
    code: 'model_prediction',
    rank: 1,
    label: 'A guess from software',
    plain: 'Nobody measured it. RNAWiki never publishes one as a finding.',
  },
] as const

export type StaircaseLevel = (typeof STAIRCASE_LEVELS)[number]['code']

export function staircaseLevelLabel(code: StaircaseLevel): string {
  return STAIRCASE_LEVELS.find((level) => level.code === code)?.label ?? code
}

/* -------------------------------------------------- felt, measured, meaningful */

export const EXPERIENCE_KINDS = [
  {
    code: 'felt',
    label: 'Felt',
    plain: 'Something a person could notice without a test.',
  },
  {
    code: 'measured',
    label: 'Measured',
    plain: 'Something only a test, a scale or a device shows.',
  },
  {
    code: 'meaningful',
    label: 'Meaningful',
    plain: 'Something that changes how a life goes, not only a number.',
  },
] as const

export type ExperienceKind = (typeof EXPERIENCE_KINDS)[number]['code']

/** The four traps between the three categories, each stated as a short reader warning. */
export const EXPERIENCE_TRAPS = [
  {
    code: 'felt_not_useful',
    label: 'Felt, but not shown to help',
    plain: 'A person notices a change. No study showed it leads anywhere good.',
  },
  {
    code: 'measured_not_felt',
    label: 'Measured, but not felt',
    plain: 'A number moves. The person notices nothing. Both can be true.',
  },
  {
    code: 'measured_not_meaningful',
    label: 'Measured, but not shown to matter',
    plain: 'A number moves in the good direction. Nobody showed that lives went better.',
  },
  {
    code: 'meaningful_but_slow',
    label: 'Matters, but takes years',
    plain: 'The result that counts may take longer than anyone would keep watching.',
  },
] as const

/* ------------------------------------------------------------- time signals */

/**
 * Time facets. These are never derived from one another: a trial that ran for twelve weeks does
 * not tell you the half-life, and a planned end date is not a follow-up length.
 */
export const TIMELINE_FACETS = [
  {
    code: 'onset_of_felt_effect',
    label: 'Before anything is noticed',
    plain: 'How long until a person might feel a change.',
  },
  {
    code: 'biomarker_change_window',
    label: 'Before a test result moves',
    plain: 'How long until a blood test or scan changed in the studies.',
  },
  {
    code: 'performance_change_window',
    label: 'Before performance moves',
    plain: 'How long until a measured task changed in the studies.',
  },
  {
    code: 'assessed_outcome_duration',
    label: 'How long the result was watched',
    plain: 'The window the study actually measured its result over.',
  },
  {
    code: 'treatment_exposure_duration',
    label: 'How long people took it',
    plain: 'The time people were actually on the substance.',
  },
  {
    code: 'follow_up_duration',
    label: 'How long people were followed',
    plain: 'How long the study kept checking after the start.',
  },
  {
    code: 'half_life',
    label: 'How fast the body clears it',
    plain: 'The time for half of it to leave the blood.',
  },
  {
    code: 'washout_or_carryover',
    label: 'How long effects linger',
    plain: 'How long after stopping an effect may still be present.',
  },
  {
    code: 'long_term_unknown',
    label: 'Beyond the studies',
    plain: 'What happens after the longest study ends.',
  },
] as const

export type TimelineFacet = (typeof TIMELINE_FACETS)[number]['code']

export function timelineFacetLabel(code: TimelineFacet): string {
  return TIMELINE_FACETS.find((facet) => facet.code === code)?.label ?? code
}

/* -------------------------------------------------------- no-response map */

/**
 * Typed reasons a person may take something and notice nothing. This exists to teach, and it must
 * never end in "so take more". None of these reasons carries an amount.
 */
export const NO_RESPONSE_REASONS = [
  {
    code: 'goal_mismatch',
    label: 'It was studied for a different goal',
    plain: 'The studies measured something else entirely.',
  },
  {
    code: 'population_mismatch',
    label: 'It was studied in different people',
    plain: 'The people in the studies were not much like the reader.',
  },
  {
    code: 'formulation_mismatch',
    label: 'A different form was studied',
    plain: 'The studied form is not the form on the shelf.',
  },
  {
    code: 'baseline_status',
    label: 'There was nothing to correct',
    plain: 'Where a level is already normal, topping it up may change nothing.',
  },
  {
    code: 'required_co_intervention',
    label: 'Something else had to happen too',
    plain: 'In the studies it was paired with training, a diet or another treatment.',
  },
  {
    code: 'subtle_or_unfelt_effect',
    label: 'The change is too small to feel',
    plain: 'A real change can still sit below what a person notices.',
  },
  {
    code: 'measurement_noise',
    label: 'Day-to-day swing hides it',
    plain: 'Sleep, food, stress and time of day move most numbers more than this would.',
  },
  {
    code: 'inappropriate_timeframe',
    label: 'Not enough time yet',
    plain: 'The studies ran longer than the person has waited.',
  },
  {
    code: 'adherence',
    label: 'It was not taken as studied',
    plain: 'Missed days change the result, and studies count them.',
  },
  {
    code: 'confounding',
    label: 'Something else changed at the same time',
    plain: 'Two changes at once cannot be told apart afterwards.',
  },
  {
    code: 'evidence_uncertainty',
    label: 'The evidence may simply be wrong',
    plain: 'Small early studies often do not hold up.',
  },
  {
    code: 'product_identity',
    label: 'The product may not be what it says',
    plain: 'Contents of a sold product are not always what the label states.',
  },
  {
    code: 'unknown',
    label: 'No recorded reason',
    plain: 'RNAWiki has nothing stored that would explain it.',
  },
] as const

export type NoResponseReason = (typeof NO_RESPONSE_REASONS)[number]['code']

/* --------------------------------------------------------------- interactions */

/**
 * Interaction states. There is no "safe" state and there never will be: the absence of a record is
 * a gap in RNAWiki, not a finding about the pair.
 */
export const INTERACTION_STATES = [
  {
    code: 'documented_important',
    label: 'Written down, and it matters',
    plain: 'A source records this pair and treats it as important.',
    urgent: true,
  },
  {
    code: 'documented_manageable',
    label: 'Written down, usually handled',
    plain: 'A source records this pair and says it is usually managed.',
    urgent: false,
  },
  {
    code: 'plausible_mechanistic',
    label: 'Possible, from how they work',
    plain: 'Nobody measured the pair. The idea comes from what each one does.',
    urgent: false,
  },
  {
    code: 'conflicting',
    label: 'Sources disagree',
    plain: 'One source records it, another does not.',
    urgent: false,
  },
  {
    code: 'no_qualifying_evidence_found',
    label: 'Nothing found in the sources checked',
    plain: 'The named sources were searched on the named date and held nothing.',
    urgent: false,
  },
  {
    code: 'insufficient_information',
    label: 'Not enough recorded to say',
    plain: 'Something is recorded but too little of it to mean anything.',
    urgent: false,
  },
  {
    code: 'identity_unresolved',
    label: 'One of the two is not pinned down',
    plain: 'RNAWiki could not tell which exact substance was meant.',
    urgent: false,
  },
] as const

export type InteractionState = (typeof INTERACTION_STATES)[number]['code']

export function interactionStateLabel(code: InteractionState): string {
  return INTERACTION_STATES.find((state) => state.code === code)?.label ?? code
}

/* ------------------------------------------------------------------ safety */

/** Where a safety line came from. A regulator's label and a stranger's report are not the same. */
export const SAFETY_EVIDENCE_SOURCES = [
  {
    code: 'regulatory_label',
    label: 'The approved label',
    plain: 'Text a medicines regulator approved.',
  },
  {
    code: 'controlled_trial',
    label: 'A controlled study',
    plain: 'Counted in a study with a comparison group.',
  },
  {
    code: 'observational_study',
    label: 'Watching people over time',
    plain: 'Nobody assigned the treatment; it was observed.',
  },
  { code: 'case_report', label: 'One reported case', plain: 'A single written-up person.' },
  {
    code: 'spontaneous_report',
    label: 'A report sent to a regulator',
    plain: 'Anyone may send one. Nothing is proved by sending it.',
  },
  {
    code: 'community_report',
    label: 'A report sent to RNAWiki',
    plain: 'Written by a person using it, kept apart from the studies.',
  },
  {
    code: 'mechanism_based_concern',
    label: 'A worry from how it works',
    plain: 'Nobody counted it. It follows from what the substance does.',
  },
  {
    code: 'model_prediction',
    label: 'A guess from software',
    plain: 'Never shown here as a finding.',
  },
] as const

export type SafetyEvidenceSource = (typeof SAFETY_EVIDENCE_SOURCES)[number]['code']

/** What a reader should do about a safety line, if anything. Reserve the urgent band. */
export const SAFETY_ACTION_CLASSES = [
  {
    code: 'common_nonurgent',
    label: 'Common, not an emergency',
    plain: 'Reported often, and usually not dangerous.',
    urgent: false,
  },
  {
    code: 'professional_discussion',
    label: 'Worth asking a clinician about',
    plain: 'Bring this to a doctor or pharmacist before or during use.',
    urgent: false,
  },
  {
    code: 'urgent_warning',
    label: 'Get medical help',
    plain: 'A recorded warning that needs help quickly.',
    urgent: true,
  },
  {
    code: 'unknown',
    label: 'No recorded guidance',
    plain: 'Nothing stored says what to do about it.',
    urgent: false,
  },
] as const

export type SafetyActionClass = (typeof SAFETY_ACTION_CLASSES)[number]['code']

/* ---------------------------------------------------------------- identity */

/**
 * Typed identity relations for the form check. Only `same_entity_as` carries evidence across; the
 * rest are reasons evidence may *not* carry across, which is the point of showing them.
 */
export const IDENTITY_RELATIONS = [
  {
    code: 'same_entity_as',
    label: 'The same substance',
    plain: 'Two names for one thing. Evidence carries across.',
    carries: true,
  },
  {
    code: 'synonym_of',
    label: 'Another name for it',
    plain: 'A different name for the same substance.',
    carries: true,
  },
  {
    code: 'salt_of',
    label: 'A salt of it',
    plain: 'The active part is paired with something else. How much gets in can differ.',
    carries: false,
  },
  {
    code: 'isomer_of',
    label: 'A mirror form of it',
    plain: 'Same parts, different arrangement. A body can treat them very differently.',
    carries: false,
  },
  {
    code: 'metabolite_of',
    label: 'What the body turns it into',
    plain: 'A product made after it is taken, not the thing taken.',
    carries: false,
  },
  {
    code: 'prodrug_of',
    label: 'Becomes active after it is taken',
    plain: 'Inactive until the body changes it.',
    carries: false,
  },
  {
    code: 'formulation_of',
    label: 'A particular preparation',
    plain: 'A tablet, a powder, an injection. The substance is the same, the delivery is not.',
    carries: false,
  },
  {
    code: 'active_ingredient_of',
    label: 'The working part of a product',
    plain: 'The substance inside a sold product.',
    carries: false,
  },
  {
    code: 'component_of',
    label: 'One part of a mixture',
    plain: 'A study of the mixture is not a study of this part alone.',
    carries: false,
  },
  {
    code: 'member_of_class',
    label: 'One of a family',
    plain: 'A family result is not this substance result.',
    carries: false,
  },
  {
    code: 'possibly_matches',
    label: 'Might be the same, unconfirmed',
    plain: 'A likely match nobody has confirmed. Treated as unconfirmed.',
    carries: false,
  },
  {
    code: 'explicitly_not_equivalent_to',
    label: 'Confirmed as a different thing',
    plain: 'Checked and ruled out as the same substance.',
    carries: false,
  },
] as const

export type IdentityRelation = (typeof IDENTITY_RELATIONS)[number]['code']

export function identityRelationLabel(code: IdentityRelation): string {
  return IDENTITY_RELATIONS.find((relation) => relation.code === code)?.label ?? code
}

export function identityRelationCarriesEvidence(code: IdentityRelation): boolean {
  return IDENTITY_RELATIONS.find((relation) => relation.code === code)?.carries ?? false
}

/* ------------------------------------------------------------ alternatives */

/** Rungs on the alternatives ladder. Ordered by how much supervision each usually needs. */
export const ALTERNATIVE_TIERS = [
  {
    code: 'foundational_behaviour',
    label: 'Something to do differently',
    plain: 'Sleep, training, food timing, sunlight, alcohol.',
  },
  {
    code: 'food_or_environment',
    label: 'Food or surroundings',
    plain: 'A change to what is eaten or to the room.',
  },
  {
    code: 'non_prescription_substance',
    label: 'Something bought without a prescription',
    plain: 'A supplement or an over-the-counter medicine.',
  },
  {
    code: 'clinician_supervised',
    label: 'Something a clinician prescribes',
    plain: 'Needs a prescription and follow-up.',
  },
  {
    code: 'experimental',
    label: 'Still being tested',
    plain: 'Available in studies, not as a treatment.',
  },
  {
    code: 'measure_or_wait',
    label: 'Measure first, or do nothing yet',
    plain: 'Often the honest option, and rarely listed.',
  },
] as const

export type AlternativeTier = (typeof ALTERNATIVE_TIERS)[number]['code']

/* --------------------------------------------------------- claim decoder */

/** Where a reader's claim position stands. No position may be stated without its sources. */
export const CLAIM_POSITIONS = [
  {
    code: 'established',
    label: 'Holds up',
    plain: 'Measured in people for this exact use, and repeated.',
  },
  {
    code: 'supported',
    label: 'Some support',
    plain: 'Measured in people, with real limits.',
  },
  { code: 'mixed', label: 'Studies disagree', plain: 'Findings point both ways.' },
  { code: 'early', label: 'Too early to say', plain: 'Only small, short or indirect studies.' },
  {
    code: 'unsupported',
    label: 'Goes past the evidence',
    plain: 'The claim says more than any study measured.',
  },
  { code: 'unknown', label: 'Not assessed', plain: 'RNAWiki has not worked through this claim.' },
] as const

export type ClaimPosition = (typeof CLAIM_POSITIONS)[number]['code']

export function claimPositionLabel(code: ClaimPosition): string {
  return CLAIM_POSITIONS.find((position) => position.code === code)?.label ?? code
}

/* ----------------------------------------------------- community experience */

/**
 * Categories for RNAWiki-owned, consented reports. No third-party forum or archive is read,
 * scraped or imported (docs/dossier-v4-community-experience-policy.md). "It did nothing" is a
 * first-class category, because a lane that only holds successes is an advert.
 */
export const COMMUNITY_REPORT_CATEGORIES = [
  { code: 'expected_effect', label: 'What they hoped for happened' },
  { code: 'no_noticeable_effect', label: 'Nothing noticeable happened' },
  { code: 'unexpected_effect', label: 'Something else happened' },
  { code: 'adverse_experience', label: 'Something went wrong' },
  { code: 'stopped_early', label: 'They stopped early' },
  { code: 'combination_experience', label: 'Taken with something else' },
  { code: 'long_term_experience', label: 'Taken for a long time' },
  { code: 'withdrawal_or_rebound', label: 'Trouble after stopping' },
  { code: 'uncertain_product', label: 'Unsure what the product was' },
  { code: 'medical_attention', label: 'They needed medical help' },
] as const

export type CommunityReportCategory = (typeof COMMUNITY_REPORT_CATEGORIES)[number]['code']

/** What a report may be ranked on. Sentiment is absent on purpose. */
export const COMMUNITY_QUALITY_SIGNALS = [
  'completeness',
  'identity certainty',
  'context',
  'follow-up',
  'confounder disclosure',
  'objective and subjective kept apart',
] as const

/* ------------------------------------------------------------ page gates */

/** Checks a slug must pass before the v4 flag is allowed to serve it. */
export const V4_GATES = [
  { code: 'identity_passed', label: 'Identity resolved' },
  { code: 'no_cross_family_merge', label: 'No unresolved merge across substance families' },
  { code: 'claim_provenance_present', label: 'Every public sentence names a source' },
  { code: 'trial_roles_valid', label: 'Trial roles classified for highlighted evidence' },
  { code: 'no_raw_internal_fields', label: 'No internal keys in reader text' },
  { code: 'safety_mode_valid', label: 'Safety mode resolved' },
  { code: 'canonical_metadata_valid', label: 'Canonical metadata present' },
] as const

export type V4Gate = (typeof V4_GATES)[number]['code']
