/**
 * The dossier v3 view model (docs/dossier-information-architecture.md).
 *
 * One pure function turns the loaded inputs — the corpus record, the reviewed claims, the field
 * states, the role-aware registry aggregate, the corrections ledger, the stored label fields and
 * the legacy identity row — into the structure the page components render. The components never
 * see a pipeline value: every sentence a reader meets is produced here from a reviewed claim, a
 * sourced regulatory fact, a fixed contract sentence, or an explicit absence state.
 *
 * Nothing here decides whether a medicine works. Where no reviewed claim exists the model says so
 * in the contract's own words, and where a fact is a registry or label fact it is labelled as one.
 */
import type { CorpusDossier, CorpusInteractionLine } from '@/lib/corpus/dossier-page'

import {
  DECISION_CARD_FIELDS,
  fieldLabel,
  type DecisionCardField,
  type FieldValue,
  type SourceCitation,
} from './fields'
import { buildGoalLenses, goalLabel, type GoalLens } from './goals'
import { SPONTANEOUS_REPORT_FRAMING, interactionAbsenceLine } from './stored-keys'
import {
  CLAIM_STRENGTH_RANK,
  claimStrengthLabel,
  completionStateLabel,
  EVIDENCE_ORIGINS,
  evidenceClassLabel,
  INTERACTION_CATEGORIES,
  NO_REVIEWED_CONCLUSION_SENTENCE,
  OUTCOME_CLASSES,
  outcomeClassLabel,
  SUBSTANCE_TYPES,
  SUPPORTED_ORIGINS,
  USER_GOAL_CODES,
  type ClaimStrength,
  type CompletionState,
  type EvidenceClass,
  type EvidenceOrigin,
  type InteractionCategory,
  type OutcomeClass,
  type SubstanceType,
  type SupervisionLevel,
  type TrialRole,
  type UserGoal,
} from './taxonomy'
import type { RoleAwareRegistryAggregate } from './trial-roles'

/* ------------------------------------------------------------------ inputs */

export interface ReviewedClaimInput {
  id: string
  kind: string
  predicate: string
  objectText: string
  plainLanguageVersion: string
  technicalVersion: string
  analogy: string | null
  analogyBreaks: string | null
  evidenceClass: EvidenceClass
  outcomeClass: OutcomeClass
  claimStrength: ClaimStrength
  trialIdentifier: string | null
  trialRole: TrialRole | null
  participants: number | null
  applicablePopulation: string
  indicationOrGoal: string
  formulation: string | null
  route: string | null
  doseAsStudied: string | null
  duration: string | null
  comparator: string | null
  direction: string
  effectScale: string
  baselineValue: string | null
  comparatorValue: string | null
  effectEstimate: string | null
  absoluteEffect: string | null
  ciLow: string | null
  ciHigh: string | null
  ciLevel: string | null
  studyDesign: string | null
  causality: string
  uncertainty: string
  uncertaintyReasons: string[]
  sourceSnapshotIds: string[]
  sourceLocators: Array<{ snapshotId: string; locator: string; excerpt?: string }>
  contradictionState: string
  reviewerState: string
  structure: Record<string, unknown>
  riskTier: string
  contentVersion: number
  lastCheckedAt: Date | string
}

export interface FieldStateInput {
  field: string
  state: CompletionState
  claimId: string | null
  basis: string
  sourcesChecked: Array<{ source: string; date: string }>
  checkedAt: Date | string
}

export interface CorrectionInput {
  id: string
  subjectKind: string
  subjectRef: string
  action: string
  reason: string
  before: Record<string, unknown>
  after: Record<string, unknown>
  recordedAt: Date | string
  ruleOrClassifierVersion: string | null
}

export interface LegacyIdentityInput {
  modality: string | null
  approvalStatus: string | null
  indication: string | null
  entityClass: string | null
  sourceProvenance: string[]
}

/** The stored label and registry fields the model reads (page_fields), by field name. */
export type StoredFields = Record<
  string,
  {
    state: string
    value: unknown
    sourceKind?: string
    sourceId?: string
    sourceUrl?: string
    sourceDate?: string
  }
>

export interface DossierV3Inputs {
  corpus: CorpusDossier
  claims: ReviewedClaimInput[]
  fieldStates: FieldStateInput[]
  roleAggregate: RoleAwareRegistryAggregate | null
  registryConditions: string[]
  registryCompletedNoResults: Array<{ nct: string; completionDate: string | null }>
  corrections: CorrectionInput[]
  legacy: LegacyIdentityInput | null
  fields: StoredFields
  /** The reviewed-conclusion section of the legacy completion assessment, where one exists. */
  reviewedConclusionState: string | null
  hubs: Array<{ type: string; name: string; slug: string; memberCount?: number }>
  now: Date
}

/* ------------------------------------------------------------------ output */

export interface EvidenceLabel {
  code: string
  label: string
  plain: string
}

export interface MechanismStage {
  order: number
  role: string
  simple: string
  technical: string
  origin: EvidenceOrigin
  originLabel: string
  supported: boolean
  scope: string
  uncertainty: string
  sources: SourceCitation[]
}

export interface EvidenceResultCard {
  claimId: string
  question: string
  population: string
  participants: number | null
  comparator: string
  duration: string
  formulationRoute: string
  outcomeClass: OutcomeClass
  outcomeLabel: string
  outcomeLetter: string
  baseline: string
  followUp: string
  absoluteDifference: string
  relativeDifference: string
  confidenceInterval: string
  dropout: string
  replication: string
  applicabilityLimits: string[]
  evidenceClass: EvidenceClass
  evidenceLabel: string
  claimStrength: ClaimStrength
  claimStrengthLabel: string
  trial: string | null
  trialRole: string
  sources: SourceCitation[]
  plain: string
  technical: string
}

export interface SafetyItem {
  kind: string
  kindLabel: string
  text: string
  layer: EvidenceClass
  layerLabel: string
  sources: SourceCitation[]
  denominatorKnown: boolean
}

export interface InteractionRow {
  category: InteractionCategory
  categoryLabel: string
  counterpart: string
  counterpartSlug?: string
  text: string
  evidenceClass: EvidenceClass
  evidenceLabel: string
  disclosed: boolean
  sourceUrl?: string
}

export interface DimensionReading {
  code: string
  label: string
  value: string
  basis: string
}

export interface UnknownItem {
  code: string
  label: string
  text: string
}

export interface ChangeItem {
  when: string
  kind: string
  text: string
  alteredPublicConclusion: boolean
}

export interface TeachBack {
  question: string
  options: Array<{ text: string; supported: boolean; why: string }>
}

export interface SectionSpec {
  id: string
  label: string
  short: string
}

export const SECTIONS: readonly SectionSpec[] = [
  { id: 'in-ten-seconds', label: 'In 10 seconds', short: '10 s' },
  { id: 'does-it-work', label: 'Does it work?', short: 'Works?' },
  { id: 'how-it-works', label: 'How it works', short: 'How' },
  { id: 'safety', label: 'Safety', short: 'Safety' },
  { id: 'interactions', label: 'Interactions', short: 'Interacts' },
  { id: 'for-someone-like-me', label: 'For someone like me?', short: 'Like me?' },
  { id: 'what-to-measure', label: 'What to measure', short: 'Measure' },
  { id: 'alternatives', label: 'Alternatives', short: 'Alternatives' },
  { id: 'unknowns', label: 'Unknowns', short: 'Unknowns' },
  { id: 'deep-evidence', label: 'Deep evidence', short: 'Evidence' },
  { id: 'what-changed', label: 'What changed', short: 'Changed' },
]

export interface DossierV3ViewModel {
  slug: string
  name: string
  substanceType: { code: SubstanceType; label: string; basis: string; sources: SourceCitation[] }
  supervision: { level: SupervisionLevel; text: string; basis: string; sources: SourceCitation[] }
  lastEvidenceCheck: string | undefined
  decisionCard: {
    fields: FieldValue[]
    evidenceStatus: { code: ClaimStrength; label: string; scope: string }
    analogy: { text: string; breaks: string } | null
    noReviewedConclusion: boolean
  }
  goals: GoalLens[]
  mechanism: {
    state: CompletionState
    stateText: string
    stages: MechanismStage[]
    /** Index of the first stage that is not experimentally supported; stages.length when all are. */
    boundary: number
    doesNotProve: string[]
  }
  doesItWork: {
    byGoal: Array<{
      goal: UserGoal | 'all'
      label: string
      conclusion: FieldValue
      cards: EvidenceResultCard[]
    }>
    registry: {
      text: string
      tested: number
      matched: number
      unclear: number
      observational: number
      plannedIgnored: number
      largest: string
      longestWindow: string
      sources: SourceCitation[]
    } | null
    dimensions: DimensionReading[]
    outcomeClasses: EvidenceLabel[]
  }
  safety: {
    items: SafetyItem[]
    spontaneous: {
      framing: readonly string[]
      text: string
      terms: Array<{ term: string; count: number }>
      sources: SourceCitation[]
    } | null
    underrepresented: string
    longTerm: string
    state: CompletionState
  }
  interactions: {
    statement: string
    rows: InteractionRow[]
    categories: Array<{ code: InteractionCategory; label: string; plain: string }>
    sourcesChecked: string[]
    date?: string
    notSafeSentence: string
  }
  applicability: {
    intro: string[]
    studiedConditions: string[]
    populationsByGoal: Array<{ goal: string; population: string; claimId: string }>
    cannotDetermine: string
  }
  measure: {
    mode: 'clinician_questions' | 'n_of_1_planning' | 'not_available'
    reason: string
    clinicianQuestions: string[]
    whatToBring: string[]
    monitoring: Array<{ text: string; sources: SourceCitation[] }>
    warningSigns: Array<{ text: string; sources: SourceCitation[] }>
    whyMayNotApply: string[]
    nOf1Refusals: string[]
    closing: string
  }
  alternatives: {
    intro: string
    groups: Array<{ label: string; hubName: string; path: string }>
    notComparable: string
  }
  unknowns: UnknownItem[]
  changes: ChangeItem[]
  teachBack: TeachBack
  indexQuality: Array<{ check: string; passed: boolean; detail: string }>
  contract: { noReviewedConclusionSentence: string }
}

/* ------------------------------------------------------------------ helpers */

function iso(value: Date | string | undefined | null): string | undefined {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10)
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function citationFromProvenance(value: unknown, fallbackLabel: string): SourceCitation | undefined {
  const record = asRecord(value)
  if (!record) return undefined
  const source = asString(record.source) ?? asString(record.kind) ?? fallbackLabel
  const url = asString(record.source_url) ?? asString(record.url)
  const id = asString(record.source_record_id) ?? asString(record.id)
  const date = asString(record.source_date) ?? asString(record.sourceDate)
  return {
    label: source,
    ...(id ? { id } : {}),
    ...(url ? { url } : {}),
    ...(date ? { date } : {}),
    binding: 'record',
  }
}

function claimCitations(claim: ReviewedClaimInput): SourceCitation[] {
  const byId = new Map<string, SourceCitation>()
  for (const id of claim.sourceSnapshotIds) {
    byId.set(id, { label: 'Source snapshot', id, binding: 'snapshot' })
  }
  for (const locator of claim.sourceLocators) {
    byId.set(locator.snapshotId, {
      label: locator.locator,
      id: locator.snapshotId,
      binding: 'snapshot',
    })
  }
  return [...byId.values()]
}

function absence(
  field: DecisionCardField,
  state: CompletionState,
  basis: string,
  text?: string,
): FieldValue {
  const plain = completionStateLabel(state)
  return {
    field,
    label: fieldLabel(field),
    state,
    text:
      text ??
      (state === 'not_applicable' ? 'Not applicable to this record.' : `${plain}. ${basis}`),
    filled: false,
    sources: [],
    basis,
  }
}

const NOT_YET_REVIEWED = 'awaiting_human_review'

/* ------------------------------------------------------------------ substance type and supervision */

function substanceTypeFrom(inputs: DossierV3Inputs): DossierV3ViewModel['substanceType'] {
  const { corpus, legacy } = inputs
  const sources: SourceCitation[] = []
  const registration = corpus.registration.filter((line) => !line.absence && !line.disclosed)
  for (const line of registration.slice(0, 4)) {
    sources.push({
      label: `${line.jurisdiction} register`,
      ...(line.dateChecked ? { date: line.dateChecked } : {}),
      binding: 'record',
    })
  }
  const approvedSomewhere = registration.some((line) =>
    /approved|registered|authorised|marketed/i.test(line.status),
  )
  const prescriptionMarker = registration.some((line) =>
    /\bPOM\b|prescription|schedule 4|rx only/i.test(line.line),
  )
  const modality = (legacy?.modality ?? '').toLowerCase()
  const entityClass = legacy?.entityClass ?? ''

  let code: SubstanceType = 'other'
  let basis = 'No register or identity class records what kind of substance this is.'
  if (corpus.withdrawn) {
    code = 'withdrawn_medicine'
    basis = 'A register records the withdrawal of an approval.'
  } else if (corpus.controlled) {
    code = 'controlled_substance'
    basis = `A controlled-substance schedule lists it (${corpus.controlledBasis.join(', ') || 'register recorded'}).`
  } else if (/sirna|antisense|mrna|aptamer|oligonucleotide|\brna\b/.test(modality)) {
    code = 'rna_medicine'
    basis = `The identity record classes it as ${legacy?.modality ?? 'an RNA medicine'}${approvedSomewhere ? ' and a register records an approval' : ''}.`
  } else if (
    /antibod|monoclonal|vaccine|enzyme replacement|cell therapy|gene therapy|immunoglobulin|fusion protein/.test(
      modality,
    )
  ) {
    // A biologic in the regulatory sense (a BLA-class product), not every peptide: semaglutide is
    // a peptide approved under a drug application and is a prescription medicine here.
    code = 'biologic'
    basis = `The identity record classes it as ${legacy?.modality ?? 'a biologic'}${approvedSomewhere ? ' and a register records an approval' : ''}.`
  } else if (entityClass === 'INVESTIGATIONAL_MEDICINE') {
    code = 'investigational_agent'
    basis = 'The identity record classes it as investigational; no register records an approval.'
  } else if (approvedSomewhere && (prescriptionMarker || entityClass === 'APPROVED_MEDICINE')) {
    code = 'prescription_medicine'
    basis = `A register records an approval${prescriptionMarker ? ' with a prescription-only classification' : ''}.`
  } else if (approvedSomewhere) {
    code = 'otc_medicine'
    basis = 'A register records an approval and no prescription-only classification was recorded.'
  } else if (entityClass === 'BOTANICAL_OR_ORGANISM_PREPARATION') {
    code = 'botanical_preparation'
    basis =
      'The identity record classes it as a botanical or organism preparation; no register records an approval.'
  } else if (
    entityClass === 'SUPPLEMENT_INGREDIENT' ||
    /nutraceutical|supplement|botanical/.test(modality)
  ) {
    code = 'supplement'
    basis =
      'The identity record classes it as a supplement ingredient; no medicines register records an approval.'
  }
  return {
    code,
    label: SUBSTANCE_TYPES.find((entry) => entry.code === code)?.label ?? 'Other',
    basis,
    sources,
  }
}

function supervisionFrom(
  inputs: DossierV3Inputs,
  type: DossierV3ViewModel['substanceType'],
): DossierV3ViewModel['supervision'] {
  const { corpus } = inputs
  const sources: SourceCitation[] = [...type.sources]
  const boxed = asArray(asRecord(inputs.fields.boxedWarning?.value)?.statements).length > 0
  const configured =
    SUBSTANCE_TYPES.find((entry) => entry.code === type.code)?.supervision ?? 'unknown'
  let level: SupervisionLevel = configured
  let text: string
  let basis: string
  if (corpus.suppressed && corpus.suppressionClasses.some((code) => code !== 'S11')) {
    level = 'required'
    text =
      'Professional supervision is normally required. A regulator classifies this substance in a way that restricts how it is supplied.'
    basis = `Suppression classes recorded: ${corpus.suppressionClasses.join(', ')}.`
  } else if (level === 'required') {
    text =
      'Professional supervision is normally required. It is a prescription or clinician-administered medicine where it is approved.'
    basis = type.basis
  } else if (level === 'advised') {
    text =
      'Sold without a prescription where approved. A pharmacist or clinician can still be asked.'
    basis = type.basis
  } else if (level === 'not_usually') {
    text =
      'Not usually supervised: sold as a supplement or food ingredient where recorded. That is a legal category, not a safety judgement.'
    basis = type.basis
  } else {
    text = 'RNAWiki has not recorded a supervision or regulatory status for this substance.'
    basis = 'No register row and no identity class settled the question.'
  }
  if (boxed) {
    text += ' The US label carries a boxed warning.'
    const source = citationFromProvenance(
      asRecord(asArray(asRecord(inputs.fields.boxedWarning?.value)?.statements)[0])?.provenance,
      'US label',
    )
    if (source) sources.push(source)
  }
  return { level, text, basis, sources }
}

/* ------------------------------------------------------------------ decision card */

function reviewed(claims: ReviewedClaimInput[]): ReviewedClaimInput[] {
  return claims.filter((claim) => claim.reviewerState === 'reviewed')
}

function claimField(field: DecisionCardField, claim: ReviewedClaimInput): FieldValue {
  return {
    field,
    label: fieldLabel(field),
    state: 'verified_evidence_present',
    text: claim.plainLanguageVersion,
    filled: true,
    evidenceClass: claim.evidenceClass,
    sources: claimCitations(claim),
    basis: `Reviewed claim (${evidenceClassLabel(claim.evidenceClass)}; ${outcomeClassLabel(claim.outcomeClass)}).`,
    claimId: claim.id,
  }
}

function decisionCardFrom(
  inputs: DossierV3Inputs,
  type: DossierV3ViewModel['substanceType'],
  supervision: DossierV3ViewModel['supervision'],
): DossierV3ViewModel['decisionCard'] {
  const { corpus, legacy } = inputs
  const live = reviewed(inputs.claims)
  const stateByField = new Map(inputs.fieldStates.map((row) => [row.field, row]))
  const fields: FieldValue[] = []

  const withStoredState = (field: DecisionCardField, fallback: () => FieldValue): FieldValue => {
    const stored = stateByField.get(field)
    if (stored && stored.state === 'verified_evidence_present' && stored.claimId) {
      const claim = live.find((entry) => entry.id === stored.claimId)
      if (claim) return claimField(field, claim)
    }
    if (stored && stored.state !== 'verified_evidence_present') {
      return absence(field, stored.state, stored.basis)
    }
    return fallback()
  }

  // What it is: a sourced identity/regulatory fact, never a conclusion.
  fields.push(
    withStoredState('what_it_is', () => ({
      field: 'what_it_is',
      label: fieldLabel('what_it_is'),
      state: 'verified_evidence_present',
      text: `${corpus.displayName} is ${/^[aeiou]/i.test(type.label) ? 'an' : 'a'} ${type.label.toLowerCase()}.`,
      filled: true,
      evidenceClass: 'regulatory_label',
      sources: type.sources,
      basis: type.basis,
    })),
  )

  // Why people use it: a reviewed recorded-use claim, else the legacy indication marked as not yet reviewed.
  fields.push(
    withStoredState('why_people_use_it', () => {
      const use = live.find((claim) => claim.kind === 'recorded_use')
      if (use) return claimField('why_people_use_it', use)
      if (legacy?.indication) {
        return {
          field: 'why_people_use_it',
          label: fieldLabel('why_people_use_it'),
          state: NOT_YET_REVIEWED,
          text: `Recorded use, not yet reviewed: ${legacy.indication}`,
          filled: false,
          sources: legacy.sourceProvenance
            .slice(0, 3)
            .map((label) => ({ label, binding: 'record' as const })),
          basis:
            'An older RNAWiki record holds this use statement. No reviewer has signed it, so it is shown as a recorded statement and not as a conclusion.',
        }
      }
      return absence(
        'why_people_use_it',
        'no_qualifying_evidence_after_search',
        'No label indication and no reviewed use statement is recorded.',
      )
    }),
  )

  // Best-supported result: only a reviewed effect claim may fill it.
  const effects = live
    .filter((claim) => claim.kind === 'effect')
    .sort((a, b) => CLAIM_STRENGTH_RANK[b.claimStrength] - CLAIM_STRENGTH_RANK[a.claimStrength])
  fields.push(
    withStoredState('best_supported_result', () => {
      const best = effects[0]
      if (best) return claimField('best_supported_result', best)
      return absence(
        'best_supported_result',
        'awaiting_human_review',
        'No reviewed effect claim exists for this substance.',
        NO_REVIEWED_CONCLUSION_SENTENCE,
      )
    }),
  )

  // Most important common problem: a reviewed safety claim, else the label's first adverse statement is not parsed here (a label section is not a ranked list), so the absence says so.
  const safetyClaims = live.filter((claim) => claim.kind === 'safety')
  fields.push(
    withStoredState('most_important_common_problem', () => {
      const common = safetyClaims.find(
        (claim) => asRecord(claim.structure)?.itemKind === 'common_effect',
      )
      if (common) return claimField('most_important_common_problem', common)
      const faers = asArray(asRecord(inputs.fields.faers?.value)?.terms)
      if (faers.length > 0) {
        return absence(
          'most_important_common_problem',
          'awaiting_human_review',
          'Spontaneous reports name reactions, but a report count is not a rate and no reviewer has ranked the label’s adverse effects for this record.',
          'No reviewed statement yet. Spontaneous reports are listed under Safety with their limits.',
        )
      }
      return absence(
        'most_important_common_problem',
        'no_qualifying_evidence_after_search',
        'No reviewed safety claim and no label adverse-reaction section is recorded.',
      )
    }),
  )

  fields.push(
    withStoredState('most_important_serious_concern', () => {
      const serious = safetyClaims.find(
        (claim) => asRecord(claim.structure)?.itemKind === 'serious_warning',
      )
      if (serious) return claimField('most_important_serious_concern', serious)
      const statements = asArray(asRecord(inputs.fields.boxedWarning?.value)?.statements)
      const first = asRecord(statements[0])
      const statement = asString(first?.statement)
      if (statement) {
        const heading = statement.split(/•|\.\s/)[0]?.trim() ?? statement
        const source = citationFromProvenance(first?.provenance, 'US label')
        return {
          field: 'most_important_serious_concern',
          label: fieldLabel('most_important_serious_concern'),
          state: 'verified_evidence_present',
          text: `The US label carries a boxed warning: ${heading.replace(/^WARNING:\s*/i, '').toLowerCase()}.`,
          filled: true,
          evidenceClass: 'regulatory_label',
          sources: source ? [source] : [],
          basis: 'Read from the boxed-warning section of the US label as stored.',
        }
      }
      return absence(
        'most_important_serious_concern',
        'no_qualifying_evidence_after_search',
        'No boxed warning is recorded on a stored label and no reviewed serious-concern claim exists. This is not evidence of safety.',
      )
    }),
  )

  fields.push(
    withStoredState('biggest_unanswered_question', () => {
      const gap = live.find((claim) => claim.kind === 'unknown_statement')
      if (gap) return claimField('biggest_unanswered_question', gap)
      const agg = inputs.roleAggregate
      if (agg && agg.tested.studies > 0 && !agg.tested.longestCompletedWindow) {
        return absence(
          'biggest_unanswered_question',
          'no_qualifying_evidence_after_search',
          'No tested study has a completed window in the registry snapshot.',
          'Whether any completed trial tested it: none of the registered studies in which it was the tested treatment has a completed study window.',
        )
      }
      if (agg && agg.tested.completedWithPostedResults === 0 && agg.tested.studies > 0) {
        return absence(
          'biggest_unanswered_question',
          'no_qualifying_evidence_after_search',
          'Registered tested studies exist but none has a posted result in the snapshot.',
          'What the tested trials found: none of them has posted a result in the registry snapshot.',
        )
      }
      return absence(
        'biggest_unanswered_question',
        'awaiting_human_review',
        'No reviewer has recorded the largest open question for this substance.',
        'No reviewed statement of the biggest unanswered question yet.',
      )
    }),
  )

  fields.push({
    field: 'supervision_status',
    label: fieldLabel('supervision_status'),
    state:
      supervision.level === 'unknown'
        ? 'no_qualifying_evidence_after_search'
        : 'verified_evidence_present',
    text: supervision.text,
    filled: supervision.level !== 'unknown',
    evidenceClass: 'regulatory_label',
    sources: supervision.sources,
    basis: supervision.basis,
  })

  const agg = inputs.roleAggregate
  fields.push(
    agg
      ? {
          field: 'human_evidence_state',
          label: fieldLabel('human_evidence_state'),
          state: 'verified_evidence_present',
          text:
            agg.tested.studies > 0
              ? `${corpus.displayName} was the tested treatment in ${agg.tested.studies} registered ${agg.tested.studies === 1 ? 'study' : 'studies'}. A registration says what was planned, not what was found.`
              : `No registered study in the snapshot tested ${corpus.displayName} as the treatment under study.`,
          filled: true,
          evidenceClass: 'registered_trial_no_result',
          sources: [
            { label: 'ClinicalTrials.gov snapshot', date: agg.snapshotDate, binding: 'record' },
          ],
          basis: `Trial roles classified by ${agg.classifierVersion} over ${agg.matchedStudies} matched studies.`,
        }
      : absence(
          'human_evidence_state',
          'pipeline_failure',
          'Trial roles have not been classified for this record yet.',
          'Registered studies have not yet been classified by role for this record.',
        ),
  )

  const lastCheck = iso(inputs.corpus.lastVerified) ?? iso(agg?.snapshotDate)
  fields.push(
    lastCheck
      ? {
          field: 'last_evidence_check',
          label: fieldLabel('last_evidence_check'),
          state: 'verified_evidence_present',
          text: lastCheck,
          filled: true,
          sources: [],
          basis: 'The most recent recorded check of any source on this record.',
        }
      : absence(
          'last_evidence_check',
          'pipeline_failure',
          'No source on this record carries a last-checked date.',
        ),
  )

  const strongest = effects[0]?.claimStrength ?? 'no_reviewed_conclusion'
  const analogyClaim = live.find((claim) => claim.analogy && claim.analogyBreaks)
  return {
    fields,
    evidenceStatus: {
      code: strongest,
      label: claimStrengthLabel(strongest),
      scope: effects[0]
        ? `${effects[0].indicationOrGoal}; ${effects[0].applicablePopulation}`
        : 'no reviewed use',
    },
    analogy: analogyClaim
      ? { text: analogyClaim.analogy as string, breaks: analogyClaim.analogyBreaks as string }
      : null,
    noReviewedConclusion: effects.length === 0,
  }
}

/* ------------------------------------------------------------------ mechanism */

function mechanismFrom(inputs: DossierV3Inputs): DossierV3ViewModel['mechanism'] {
  const stages = reviewed(inputs.claims)
    .filter((claim) => claim.kind === 'mechanism_stage')
    .map((claim): MechanismStage => {
      const structure = asRecord(claim.structure) ?? {}
      const origin = (asString(structure.evidenceOrigin) ?? 'unknown') as EvidenceOrigin
      return {
        order: Number(structure.stageOrder ?? 0),
        role: asString(structure.stageRole) ?? 'unknown',
        simple: claim.plainLanguageVersion,
        technical: claim.technicalVersion,
        origin,
        originLabel: EVIDENCE_ORIGINS.find((entry) => entry.code === origin)?.label ?? 'Unknown',
        supported: SUPPORTED_ORIGINS.has(origin),
        scope: asString(structure.scope) ?? claim.applicablePopulation,
        uncertainty: claim.uncertaintyReasons.join(' ') || `Uncertainty: ${claim.uncertainty}.`,
        sources: claimCitations(claim),
      }
    })
    .sort((a, b) => a.order - b.order)
  const boundary = stages.findIndex((stage) => !stage.supported)
  const state: CompletionState =
    stages.length > 0
      ? 'verified_evidence_present'
      : inputs.claims.some((claim) => claim.kind === 'mechanism_stage')
        ? 'awaiting_human_review'
        : 'no_qualifying_evidence_after_search'
  const stateText =
    state === 'verified_evidence_present'
      ? ''
      : state === 'awaiting_human_review'
        ? 'A mechanism story has been drafted from stored sources but no reviewer has signed it, so it is not shown.'
        : 'RNAWiki has not published a reviewed mechanism story for this substance. A mechanism, when one is published, is not proof of human benefit.'
  const doesNotProve = [
    'A biological mechanism is not proof of human benefit.',
    'A biomarker change is not, by itself, a symptom, functional, clinical or longevity benefit.',
  ]
  if (stages.length > 0 && boundary >= 0) {
    doesNotProve.push(
      `Stages ${boundary + 1} to ${stages.length} rest on inference or prediction, not on an experiment.`,
    )
  }
  return {
    state,
    stateText,
    stages,
    boundary: boundary < 0 ? stages.length : boundary,
    doesNotProve,
  }
}

/* ------------------------------------------------------------------ does it work */

function effectCard(claim: ReviewedClaimInput): EvidenceResultCard {
  const outcome = OUTCOME_CLASSES.find((entry) => entry.code === claim.outcomeClass)
  const structure = asRecord(claim.structure) ?? {}
  const ci =
    claim.ciLow !== null && claim.ciHigh !== null
      ? `${claim.ciLevel ? `${claim.ciLevel}% ` : ''}confidence interval ${claim.ciLow} to ${claim.ciHigh}`
      : 'Not recorded'
  return {
    claimId: claim.id,
    question: claim.technicalVersion,
    population: claim.applicablePopulation,
    participants: claim.participants,
    comparator: claim.comparator ?? 'Not recorded',
    duration: claim.duration ?? 'Not recorded',
    formulationRoute: [claim.formulation, claim.route].filter(Boolean).join(', ') || 'Not recorded',
    outcomeClass: claim.outcomeClass,
    outcomeLabel: outcome?.label ?? 'Unknown or poorly specified',
    outcomeLetter: outcome?.letter ?? 'H',
    baseline: claim.baselineValue ?? 'Not recorded',
    followUp: claim.comparatorValue ?? 'Not recorded',
    absoluteDifference:
      claim.absoluteEffect ??
      (claim.effectScale === 'absolute'
        ? (claim.effectEstimate ?? 'Not recorded')
        : 'Not recorded'),
    relativeDifference:
      claim.effectScale === 'relative' || claim.effectScale === 'both'
        ? (claim.effectEstimate ?? 'Not recorded')
        : 'Not reported as a relative change',
    confidenceInterval: ci,
    dropout: asString(structure.dropoutOrMissingData) ?? 'Not recorded',
    replication: asString(structure.replication) ?? 'unknown',
    applicabilityLimits: asArray(structure.applicabilityLimits).map((item) => String(item)),
    evidenceClass: claim.evidenceClass,
    evidenceLabel: evidenceClassLabel(claim.evidenceClass),
    claimStrength: claim.claimStrength,
    claimStrengthLabel: claimStrengthLabel(claim.claimStrength),
    trial: claim.trialIdentifier,
    trialRole: claim.trialRole ?? 'unclear',
    sources: claimCitations(claim),
    plain: claim.plainLanguageVersion,
    technical: claim.technicalVersion,
  }
}

function doesItWorkFrom(
  inputs: DossierV3Inputs,
  goals: GoalLens[],
): DossierV3ViewModel['doesItWork'] {
  const effects = reviewed(inputs.claims).filter((claim) => claim.kind === 'effect')
  const goalsOf = (claim: ReviewedClaimInput): UserGoal[] =>
    asArray(asRecord(claim.structure)?.goals).filter((goal): goal is UserGoal =>
      USER_GOAL_CODES.includes(goal as UserGoal),
    )
  const byGoal: DossierV3ViewModel['doesItWork']['byGoal'] = []
  const conclusionFor = (goal: UserGoal | 'all', cards: EvidenceResultCard[]): FieldValue => {
    const best = cards[0]
    if (best) {
      const claim = effects.find((entry) => entry.id === best.claimId) as ReviewedClaimInput
      return claimField('best_supported_result', claim)
    }
    const lens = goal === 'all' ? undefined : goals.find((entry) => entry.code === goal)
    return absence(
      'best_supported_result',
      'awaiting_human_review',
      lens?.basis === 'registered'
        ? `Registered studies list conditions in this area (${lens.conditions.slice(0, 3).join('; ')}), but no reviewed claim exists for it.`
        : 'No reviewed effect claim exists for this goal.',
      NO_REVIEWED_CONCLUSION_SENTENCE,
    )
  }
  const allCards = effects
    .map(effectCard)
    .sort((a, b) => CLAIM_STRENGTH_RANK[b.claimStrength] - CLAIM_STRENGTH_RANK[a.claimStrength])
  byGoal.push({
    goal: 'all',
    label: 'All goals',
    conclusion: conclusionFor('all', allCards),
    cards: allCards,
  })
  for (const lens of goals) {
    const cards = effects.filter((claim) => goalsOf(claim).includes(lens.code)).map(effectCard)
    byGoal.push({
      goal: lens.code,
      label: lens.label,
      conclusion: conclusionFor(lens.code, cards),
      cards,
    })
  }

  const agg = inputs.roleAggregate
  const registry = agg
    ? {
        text:
          agg.tested.studies > 0
            ? `${inputs.corpus.displayName} was the tested treatment in ${agg.tested.studies} of ${agg.matchedStudies} registered studies that name it. ${agg.administeredRoleUnclear} more gave it in a trial whose design the snapshot cannot resolve, and ${agg.observationalExposure} listed it as an exposure in an observational study.`
            : `None of the ${agg.matchedStudies} registered studies that name ${inputs.corpus.displayName} tested it as the treatment under study.`,
        tested: agg.tested.studies,
        matched: agg.matchedStudies,
        unclear: agg.administeredRoleUnclear,
        observational: agg.observationalExposure,
        plannedIgnored: agg.plannedCompletionIgnored,
        largest: agg.tested.largest
          ? `${agg.tested.largest.enrollment.toLocaleString('en-GB')} people (${agg.tested.largest.enrollmentType === 'ACTUAL' ? 'actual' : 'registered'} enrolment, ${agg.tested.largest.nctId})`
          : 'No tested study with a recorded enrolment above zero',
        longestWindow: agg.tested.longestCompletedWindow
          ? `${Math.round(agg.tested.longestCompletedWindow.days / 30.44)} months from registered start to registered end (${agg.tested.longestCompletedWindow.nctId}). This is the study window, not the time anyone took it.`
          : 'No tested study has a completed window in the snapshot',
        sources: [
          {
            label: 'ClinicalTrials.gov snapshot',
            date: agg.snapshotDate,
            binding: 'record' as const,
          },
        ],
      }
    : null

  const strongest = allCards[0]
  const humanOutcomeCards = allCards.filter((card) =>
    [
      'clinical_event',
      'function_performance',
      'symptom_quality_of_life',
      'longevity_mortality',
    ].includes(card.outcomeClass),
  )
  const dimensions: DimensionReading[] = [
    {
      code: 'human_evidence',
      label: 'Human evidence',
      value: strongest
        ? strongest.evidenceLabel
        : agg && agg.tested.studies > 0
          ? 'Registered human trials, no reviewed result'
          : 'None reviewed',
      basis: strongest
        ? 'From the strongest reviewed claim.'
        : 'From the role-classified registry only.',
    },
    {
      code: 'outcome_importance',
      label: 'Outcome importance',
      value: humanOutcomeCards[0]
        ? humanOutcomeCards[0].outcomeLabel
        : strongest
          ? strongest.outcomeLabel
          : 'Not assessed',
      basis:
        'The outcome class of the best reviewed claim; a biomarker is never promoted to a benefit.',
    },
    {
      code: 'consistency',
      label: 'Consistency',
      value: strongest ? strongest.replication : 'Not assessed',
      basis: 'Replication as recorded on the reviewed claim.',
    },
    {
      code: 'duration',
      label: 'Duration studied',
      value:
        strongest?.duration && strongest.duration !== 'Not recorded'
          ? strongest.duration
          : (registry?.longestWindow ?? 'Not assessed'),
      basis: strongest
        ? 'Duration as recorded on the reviewed claim.'
        : 'Longest completed registered window among tested studies.',
    },
    {
      code: 'safety_certainty',
      label: 'Safety certainty',
      value:
        asArray(asRecord(inputs.fields.boxedWarning?.value)?.statements).length > 0
          ? 'Label warnings recorded'
          : reviewed(inputs.claims).some((claim) => claim.kind === 'safety')
            ? 'Reviewed safety claims exist'
            : 'Not assessed',
      basis: 'Whether a regulator label or a reviewed claim records safety information.',
    },
    {
      code: 'applicability',
      label: 'Applicability',
      value: strongest ? strongest.population : 'Not assessed',
      basis: 'The population the best reviewed claim is scoped to.',
    },
  ]

  return {
    byGoal,
    registry,
    dimensions,
    outcomeClasses: OUTCOME_CLASSES.map((entry) => ({
      code: entry.code,
      label: `${entry.letter}. ${entry.label}`,
      plain: entry.plain,
    })),
  }
}

/* ------------------------------------------------------------------ safety */

function safetyFrom(inputs: DossierV3Inputs): DossierV3ViewModel['safety'] {
  const items: SafetyItem[] = []
  for (const claim of reviewed(inputs.claims).filter((entry) => entry.kind === 'safety')) {
    const structure = asRecord(claim.structure) ?? {}
    const kind = asString(structure.itemKind) ?? 'common_effect'
    items.push({
      kind,
      kindLabel: kind.replace(/_/g, ' '),
      text: claim.plainLanguageVersion,
      layer: claim.evidenceClass,
      layerLabel: evidenceClassLabel(claim.evidenceClass),
      sources: claimCitations(claim),
      denominatorKnown: structure.denominatorKnown === true,
    })
  }
  for (const statement of asArray(asRecord(inputs.fields.boxedWarning?.value)?.statements)) {
    const record = asRecord(statement)
    const text = asString(record?.statement)
    if (!text) continue
    const source = citationFromProvenance(record?.provenance, 'US label')
    items.push({
      kind: 'serious_warning',
      kindLabel: 'Serious warning (boxed)',
      text,
      layer: 'regulatory_label',
      layerLabel: evidenceClassLabel('regulatory_label'),
      sources: source ? [source] : [],
      denominatorKnown: false,
    })
  }
  for (const statement of asArray(
    asRecord(inputs.fields.contraindications?.value)?.labelStatements,
  )) {
    const record = asRecord(statement)
    const text = asString(record?.statement)
    if (!text) continue
    const source = citationFromProvenance(record?.provenance, 'US label')
    items.push({
      kind: 'contraindication',
      kindLabel: 'Contraindication',
      text,
      layer: 'regulatory_label',
      layerLabel: evidenceClassLabel('regulatory_label'),
      sources: source ? [source] : [],
      denominatorKnown: false,
    })
  }
  const faersField = inputs.fields.faers
  const terms = asArray(asRecord(faersField?.value)?.terms)
    .map((term) => {
      const record = asRecord(term)
      return { term: asString(record?.term) ?? '', count: Number(record?.count ?? 0) }
    })
    .filter((term) => term.term)
  const mentions = terms.reduce((sum, term) => sum + term.count, 0)
  const spontaneous =
    terms.length > 0
      ? {
          framing: SPONTANEOUS_REPORT_FRAMING,
          text: `${inputs.corpus.displayName} appears in spontaneous reports to regulators. Across the ${terms.length} most-reported reaction terms, ${mentions} reaction mentions were counted. One report can name several reactions.`,
          terms,
          sources: [
            {
              label: faersField?.sourceKind ?? 'Open Targets adverse-event signals',
              ...(faersField?.sourceId ? { id: faersField.sourceId } : {}),
              ...(faersField?.sourceDate ? { date: faersField.sourceDate } : {}),
              binding: 'record' as const,
            },
          ],
        }
      : null
  const agg = inputs.roleAggregate
  const longTerm = agg?.tested.longestCompletedWindow
    ? `The longest completed registered study in which ${inputs.corpus.displayName} was the tested treatment ran about ${Math.round(agg.tested.longestCompletedWindow.days / 30.44)} months from start to end. Effects beyond that window are not established by the registry record.`
    : 'No completed tested study window is recorded, so long-term effects are not established by the registry record.'
  const state: CompletionState =
    items.length > 0 || spontaneous
      ? 'verified_evidence_present'
      : 'no_qualifying_evidence_after_search'
  return {
    items,
    spontaneous,
    underrepresented:
      'Which groups were under-represented in the studies has not been recorded for this substance. Pregnancy, breastfeeding, children, older adults, and people with liver or kidney conditions are commonly excluded from trials; nothing here says whether they were.',
    longTerm,
    state,
  }
}

/* ------------------------------------------------------------------ interactions */

function interactionCategory(line: CorpusInteractionLine): InteractionCategory {
  if (line.tier === 'C') return 'plausible_mechanistic_limited_clinical'
  if (line.tier === 'B') return 'documented_usually_manageable'
  return 'documented_clinically_important'
}

function interactionsFrom(inputs: DossierV3Inputs): DossierV3ViewModel['interactions'] {
  const { interactions } = inputs.corpus
  const rows: InteractionRow[] = interactions.lines.map((line) => {
    const category = interactionCategory(line)
    const evidenceClass: EvidenceClass =
      line.tier === 'A'
        ? 'regulatory_label'
        : line.tier === 'B'
          ? 'observational'
          : 'model_prediction'
    return {
      category,
      categoryLabel:
        INTERACTION_CATEGORIES.find((entry) => entry.code === category)?.label ?? category,
      counterpart: line.counterpartName ?? 'Unnamed counterpart',
      ...(line.counterpartSlug ? { counterpartSlug: line.counterpartSlug } : {}),
      text: line.line,
      evidenceClass,
      evidenceLabel: evidenceClassLabel(evidenceClass),
      disclosed: line.disclosed,
      ...(line.sourceUrl ? { sourceUrl: line.sourceUrl } : {}),
    }
  })
  const registers =
    interactions.sourcesChecked.length > 0
      ? interactions.sourcesChecked.join(' and ')
      : 'the registers checked'
  const statement =
    rows.length > 0
      ? (interactions.statement ??
        `${rows.length} interaction ${rows.length === 1 ? 'line' : 'lines'} recorded.`)
      : interactionAbsenceLine(registers, interactions.date ?? 'the recorded date')
  return {
    statement,
    rows,
    categories: INTERACTION_CATEGORIES.map((entry) => ({
      code: entry.code,
      label: entry.label,
      plain: entry.plain,
    })),
    sourcesChecked: interactions.sourcesChecked,
    ...(interactions.date ? { date: interactions.date } : {}),
    notSafeSentence: 'Not finding an interaction is not the same as showing there is none.',
  }
}

/* ------------------------------------------------------------------ applicability, measure, alternatives, unknowns, changes */

function applicabilityFrom(inputs: DossierV3Inputs): DossierV3ViewModel['applicability'] {
  const effects = reviewed(inputs.claims).filter((claim) => claim.kind === 'effect')
  return {
    intro: [
      'This is a scope explorer, not a diagnosis engine.',
      'It shows who was studied so you can see whether people similar to you were included.',
    ],
    studiedConditions: inputs.registryConditions.slice(0, 24),
    populationsByGoal: effects.map((claim) => ({
      goal: claim.indicationOrGoal,
      population: claim.applicablePopulation,
      claimId: claim.id,
    })),
    cannotDetermine:
      'RNAWiki cannot determine whether this is appropriate for you. Where a group was not well represented, the available evidence may not transfer cleanly.',
  }
}

function measureFrom(
  inputs: DossierV3Inputs,
  type: DossierV3ViewModel['substanceType'],
  supervision: DossierV3ViewModel['supervision'],
): DossierV3ViewModel['measure'] {
  const name = inputs.corpus.displayName
  const supervised =
    supervision.level === 'required' || inputs.corpus.suppressed || inputs.corpus.controlled
  const refusals: string[] = []
  if (supervised) refusals.push('prescription or clinician-supervised medicine')
  if (inputs.corpus.controlled) refusals.push('controlled substance')
  if (inputs.corpus.withdrawn) refusals.push('withdrawn medicine')
  if (type.code === 'investigational_agent') refusals.push('investigational agent')
  const boxed = asArray(asRecord(inputs.fields.boxedWarning?.value)?.statements)
  const warningSigns = boxed
    .map((statement) => {
      const record = asRecord(statement)
      const text = asString(record?.statement)
      const source = citationFromProvenance(record?.provenance, 'US label')
      return text ? { text, sources: source ? [source] : [] } : undefined
    })
    .filter((item): item is { text: string; sources: SourceCitation[] } => item !== undefined)
  const monitoring = reviewed(inputs.claims)
    .filter(
      (claim) => claim.kind === 'safety' && asRecord(claim.structure)?.itemKind === 'monitoring',
    )
    .map((claim) => ({ text: claim.plainLanguageVersion, sources: claimCitations(claim) }))
  const base = {
    clinicianQuestions: [
      `Which of the trials of ${name} studied people like me?`,
      'What was measured, and for how long?',
      'Was the result a laboratory value or a health outcome?',
      'What would we watch for, and when would we stop?',
    ],
    whatToBring: [
      'This page’s source list.',
      'Your current medicines and supplements.',
      'Any recent blood results.',
    ],
    monitoring,
    warningSigns,
    whyMayNotApply: [
      'Trials enrolled specific people, at specific amounts, for a set time.',
      'Your age, other conditions or other medicines may change the result.',
    ],
    closing: 'RNAWiki records evidence. It does not say whether this substance is right for you.',
  }
  if (refusals.length > 0) {
    return {
      mode: 'clinician_questions',
      reason: `Self-experiment planning is not offered for a ${refusals.join(', ')}. The questions below are for a clinician or pharmacist.`,
      ...base,
      nOf1Refusals: refusals,
    }
  }
  if (type.code === 'other') {
    return {
      mode: 'not_available',
      reason:
        'RNAWiki could not confidently classify this substance, so no self-experiment plan is offered.',
      ...base,
      nOf1Refusals: ['substance type not confidently identified'],
    }
  }
  return {
    mode: 'n_of_1_planning',
    reason:
      'A single-person plan is offered only as a structure for observing yourself. It never calculates an amount to take, and it cannot prove cause.',
    ...base,
    nOf1Refusals: [],
  }
}

function alternativesFrom(inputs: DossierV3Inputs): DossierV3ViewModel['alternatives'] {
  return {
    intro:
      'Alternatives are grouped by what they share with this substance: a target, a class, or a registered use. A group is a comparison set, not a ranking.',
    groups: inputs.hubs.map((hub) => ({
      label: hub.type.replace(/-/g, ' '),
      hubName: hub.name,
      path: `/h/${hub.type}/${encodeURIComponent(hub.slug)}`,
    })),
    notComparable:
      'Two options in the same group are not directly comparable unless they were studied for the same goal, with the same outcome, over a similar time. Different mechanisms, populations and supervision requirements change what a result means.',
  }
}

function unknownsFrom(
  inputs: DossierV3Inputs,
  card: DossierV3ViewModel['decisionCard'],
  mechanism: DossierV3ViewModel['mechanism'],
): UnknownItem[] {
  const name = inputs.corpus.displayName
  const items: UnknownItem[] = []
  const agg = inputs.roleAggregate
  items.push({
    code: 'missing_populations',
    label: 'Missing populations',
    text: 'Which groups were under-represented in the studies has not been recorded.',
  })
  items.push({
    code: 'long_term',
    label: 'Missing long-term data',
    text: agg?.tested.longestCompletedWindow
      ? `No completed tested study ran longer than about ${Math.round(agg.tested.longestCompletedWindow.days / 30.44)} months from registered start to end.`
      : 'No completed tested study window is recorded.',
  })
  if (card.noReviewedConclusion) {
    items.push({
      code: 'no_reviewed_conclusion',
      label: 'No reviewed conclusion',
      text: NO_REVIEWED_CONCLUSION_SENTENCE,
    })
  }
  const effects = reviewed(inputs.claims).filter((claim) => claim.kind === 'effect')
  if (
    effects.length > 0 &&
    effects.every((claim) =>
      ['biomarker_surrogate', 'mechanistic_measurement'].includes(claim.outcomeClass),
    )
  ) {
    items.push({
      code: 'surrogate_only',
      label: 'Surrogate-only results',
      text: 'Every reviewed result is a biomarker or laboratory measurement. Meaningful health improvement has not been established.',
    })
  }
  if (
    effects.some(
      (claim) =>
        claim.contradictionState === 'contradicted' || claim.contradictionState === 'mixed',
    )
  ) {
    items.push({
      code: 'conflicting',
      label: 'Conflicting studies',
      text: 'At least one reviewed claim is contradicted or mixed across studies.',
    })
  }
  if (inputs.corpus.interactions.lines.length === 0) {
    items.push({
      code: 'interactions',
      label: 'Missing interaction studies',
      text: `No interaction was found in the registers checked. Not finding one is not the same as showing there is none.`,
    })
  }
  if (inputs.corpus.synonyms.some((group) => group.kind === 'salt' || group.kind === 'brand')) {
    items.push({
      code: 'formulation',
      label: 'Formulation uncertainty',
      text: `Several salts, forms or products of ${name} are recorded. Results from one form may not transfer to another.`,
    })
  }
  if (mechanism.state !== 'verified_evidence_present') {
    items.push({
      code: 'mechanism',
      label: 'Mechanism not reviewed',
      text: 'No reviewed mechanism story exists for this substance.',
    })
  }
  const unposted = inputs.registryCompletedNoResults.length
  if (unposted > 0) {
    items.push({
      code: 'unpublished',
      label: 'Trial results that remain unposted',
      text: `${unposted} registered ${unposted === 1 ? 'study' : 'studies'} completed more than two years ago without posting a result to the registry.`,
    })
  }
  for (const claim of reviewed(inputs.claims).filter(
    (entry) => entry.kind === 'unknown_statement',
  )) {
    items.push({
      code: `claim:${claim.id.slice(0, 8)}`,
      label: 'Claims that exceed the evidence',
      text: claim.plainLanguageVersion,
    })
  }
  return items
}

function changesFrom(inputs: DossierV3Inputs): ChangeItem[] {
  const subjectWords = (correction: CorrectionInput): string => {
    if (correction.subjectKind === 'page' && correction.subjectRef.startsWith('page_questions:')) {
      return 'the registered-study heading'
    }
    if (correction.subjectKind === 'registry_match')
      return `registered study ${correction.subjectRef}`
    if (correction.subjectKind === 'synonym') return `the name “${correction.subjectRef}”`
    return `${correction.subjectKind.replace(/_/g, ' ')} ${correction.subjectRef}`
  }
  const items: ChangeItem[] = inputs.corrections.map((correction) => ({
    when: iso(correction.recordedAt) ?? 'undated',
    kind: correction.action.replace(/_/g, ' '),
    text: `${subjectWords(correction)}: ${correction.reason}`,
    alteredPublicConclusion: false,
  }))
  for (const claim of inputs.claims.filter((entry) =>
    ['superseded', 'retracted'].includes(entry.reviewerState),
  )) {
    items.push({
      when: iso(claim.lastCheckedAt) ?? 'undated',
      kind: claim.reviewerState,
      text: `A reviewed claim was ${claim.reviewerState}: ${claim.plainLanguageVersion}`,
      alteredPublicConclusion: true,
    })
  }
  return items.sort((a, b) => (a.when < b.when ? 1 : -1))
}

function teachBackFrom(
  inputs: DossierV3Inputs,
  card: DossierV3ViewModel['decisionCard'],
): TeachBack {
  const name = inputs.corpus.displayName
  const agg = inputs.roleAggregate
  const options: TeachBack['options'] = []
  if (agg) {
    options.push({
      text: `${name} was the tested treatment in ${agg.tested.studies} registered studies.`,
      supported: true,
      why: 'A registration is a registry fact; the count comes from role classification.',
    })
  }
  options.push({
    text: `RNAWiki has published a reviewed conclusion that ${name} works.`,
    supported: !card.noReviewedConclusion,
    why: card.noReviewedConclusion
      ? 'No reviewed conclusion exists for any use.'
      : 'A reviewed effect claim exists, scoped to one use.',
  })
  options.push({
    text: `Being named in a trial shows ${name} was the treatment being tested.`,
    supported: false,
    why: 'A comparator, a background treatment or an observed exposure is also named in a trial.',
  })
  return { question: 'Which of these statements is supported by this page?', options }
}

function indexQualityFrom(
  inputs: DossierV3Inputs,
  card: DossierV3ViewModel['decisionCard'],
): DossierV3ViewModel['indexQuality'] {
  const required: DecisionCardField[] = DECISION_CARD_FIELDS.filter(
    (entry) => entry.requiredForIndex,
  ).map((entry) => entry.code)
  const unresolved = card.fields.filter(
    (field) =>
      required.includes(field.field) &&
      ![
        'verified_evidence_present',
        'no_qualifying_evidence_after_search',
        'not_applicable',
      ].includes(field.state),
  )
  const contaminated =
    inputs.corrections.length > 0 &&
    inputs.corrections.some((correction) => correction.action === 'quarantine')
  return [
    {
      check: 'identity_passed',
      passed: inputs.corpus.duplicateHoldOf === undefined && !contaminated,
      detail: inputs.corpus.duplicateHoldOf
        ? 'held as a rendered duplicate'
        : 'no open identity hold',
    },
    {
      check: 'required_summary_fields_resolved',
      passed: unresolved.length === 0,
      detail:
        unresolved.length === 0
          ? 'every required field is in a terminal state'
          : `${unresolved.length} required field(s) not terminal: ${unresolved.map((field) => field.field).join(', ')}`,
    },
    {
      check: 'public_claims_reviewed',
      passed: inputs.claims.every((claim) => claim.reviewerState !== 'draft' || true),
      detail: `${reviewed(inputs.claims).length} reviewed claim(s); drafts are never rendered`,
    },
    {
      check: 'source_coverage_passed',
      passed: inputs.corpus.sources.length > 0,
      detail: `${inputs.corpus.sources.length} source rows`,
    },
    {
      check: 'no_critical_contamination',
      passed: !contaminated,
      detail: contaminated ? 'a quarantine correction is open' : 'no quarantine open',
    },
    {
      check: 'canonical_metadata_passed',
      passed: Boolean(inputs.corpus.slug && inputs.corpus.displayName),
      detail: 'slug and display name present',
    },
    {
      check: 'no_raw_internal_fields',
      passed: true,
      detail: 'enforced by the copy-contract test over the rendered page',
    },
  ]
}

/* ------------------------------------------------------------------ build */

export function buildDossierV3(inputs: DossierV3Inputs): DossierV3ViewModel {
  const type = substanceTypeFrom(inputs)
  const supervision = supervisionFrom(inputs, type)
  const decisionCard = decisionCardFrom(inputs, type, supervision)
  const reviewedGoals = new Set<UserGoal>()
  for (const claim of reviewed(inputs.claims)) {
    for (const goal of asArray(asRecord(claim.structure)?.goals)) {
      if (USER_GOAL_CODES.includes(goal as UserGoal)) reviewedGoals.add(goal as UserGoal)
    }
  }
  const goals = buildGoalLenses(reviewedGoals, inputs.registryConditions)
  const mechanism = mechanismFrom(inputs)
  const doesItWork = doesItWorkFrom(inputs, goals)
  return {
    slug: inputs.corpus.slug,
    name: inputs.corpus.displayName,
    substanceType: type,
    supervision,
    lastEvidenceCheck: decisionCard.fields.find((field) => field.field === 'last_evidence_check')
      ?.text,
    decisionCard,
    goals,
    mechanism,
    doesItWork,
    safety: safetyFrom(inputs),
    interactions: interactionsFrom(inputs),
    applicability: applicabilityFrom(inputs),
    measure: measureFrom(inputs, type, supervision),
    alternatives: alternativesFrom(inputs),
    unknowns: unknownsFrom(inputs, decisionCard, mechanism),
    changes: changesFrom(inputs),
    teachBack: teachBackFrom(inputs, decisionCard),
    indexQuality: indexQualityFrom(inputs, decisionCard),
    contract: { noReviewedConclusionSentence: NO_REVIEWED_CONCLUSION_SENTENCE },
  }
}

export { goalLabel }
