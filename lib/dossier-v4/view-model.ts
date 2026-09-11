/**
 * The dossier v4 view model — the Substance Compass (docs/dossier-v4-information-architecture.md).
 *
 * One pure function turns the loaded record into the structure the compass components render. The
 * components never reach for a database value, and nothing here decides whether a medicine works.
 *
 * The rule that shapes every field below: a reader-facing sentence carries its own origin. There
 * are six origins and the reader is always told which one applies. A reviewed claim, an approved
 * first-read answer, a sentence a person wrote into the record, a quotation from a stored source, a
 * count of stored rows, or a fixed RNAWiki sentence. Anything that is none of those is an absence,
 * and an absence is rendered with the reason rather than hidden.
 *
 * This model deliberately reuses `buildDossierV3`. Every safety rule the v3 model enforces —
 * spontaneous-report framing, the interaction absence line, no dosing on supervised medicines, the
 * no-reviewed-conclusion sentence — is inherited rather than reimplemented, so the two surfaces
 * cannot drift apart on the things that matter most.
 */
import type { CorpusDossier } from '@/lib/corpus/dossier-page'
import type { SourceCitation } from '@/lib/dossier-v3/fields'
import {
  buildDossierV3,
  type DossierV3Inputs,
  type DossierV3ViewModel,
} from '@/lib/dossier-v3/view-model'
import type { BoundLegacyTenSecondAnswer } from '@/lib/ten-second-answer-overrides'
import type { AuditPoint, ClinicalTrialRecord, DrugDossier, MechanismStep } from '@/lib/types'

import { conceptsForPage, type Concept } from './concepts'
import { humaniseReaderList, readerText } from './reader-text'
import { COMPASS_COPY, nothingFoundLine, registeredOutcomeLine, type TruthTerms } from './copy'
import {
  classifyOutcomeTerms,
  groupByExperience,
  OUTCOME_CLASSIFIER_VERSION,
  type ClassifiedOutcome,
} from './outcome-classifier'
import {
  compassGoalFromV3,
  compassGoalLabel,
  identityRelationCarriesEvidence,
  EXPERIENCE_TRAPS,
  FINGERPRINT_COLUMNS,
  NO_RESPONSE_REASONS,
  sectionStateLabel,
  STAIRCASE_LEVELS,
  TIMELINE_FACETS,
  type AlternativeTier,
  type ClaimPosition,
  type CompassGoal,
  type FingerprintColumn,
  type FingerprintState,
  type IdentityRelation,
  type InteractionState,
  type NoResponseReason,
  type SafetyActionClass,
  type SectionState,
  type StaircaseLevel,
  type TimelineFacet,
  type TruthLane,
  type V4Gate,
} from './taxonomy'

/* ------------------------------------------------------------------ inputs */

export interface DossierV4Inputs extends DossierV3Inputs {
  /** The legacy curated record, where one exists. Visibly labelled wherever it is shown. */
  legacyRecord: DrugDossier | null
  /** The approved first-read answer, only when its fingerprint still matches this record. */
  boundAnswer: BoundLegacyTenSecondAnswer | null
}

/* ----------------------------------------------------------------- origins */

/**
 * Where one reader-facing statement came from. This is the spine of the whole surface: a reader
 * can always see whether a sentence was signed off, written down, quoted or counted.
 */
export type StatementOrigin =
  | 'reviewed_claim'
  | 'approved_first_read'
  | 'authored_record'
  | 'stored_source'
  | 'derived_count'
  | 'contract_sentence'
  | 'absent'

export const ORIGIN_LABELS: Record<StatementOrigin, string> = {
  reviewed_claim: 'Reviewed conclusion',
  approved_first_read: 'Reviewed first-read answer',
  authored_record: 'Written into the record, not signed off',
  stored_source: 'Quoted from a stored source',
  derived_count: 'Counted from stored records',
  contract_sentence: 'A fixed RNAWiki sentence',
  absent: 'Nothing recorded',
}

export const ORIGIN_PLAIN: Record<StatementOrigin, string> = {
  reviewed_claim: 'A person checked this against the sources and signed it off.',
  approved_first_read:
    'A person wrote this and a reviewer approved it against this exact record. It carries no effect size.',
  authored_record:
    'A person wrote this into the record with the study named beside it. No reviewer has signed it off.',
  stored_source: 'Copied from a source RNAWiki stored, with the source named.',
  derived_count: 'A count of rows RNAWiki holds. It describes our records, not your body.',
  contract_sentence: 'Wording RNAWiki always uses, not a finding about this substance.',
  absent: 'RNAWiki holds nothing here and says so rather than guessing.',
}

/** One sentence a reader meets, with everything needed to audit it. */
export interface Statement {
  text: string
  origin: StatementOrigin
  state: SectionState
  /** Why this statement is shown this way, in plain words. */
  basis: string
  sources: SourceCitation[]
}

function statement(
  text: string,
  origin: StatementOrigin,
  state: SectionState,
  basis: string,
  sources: SourceCitation[] = [],
): Statement {
  return { text, origin, state, basis, sources }
}

function absentStatement(basis: string, state: SectionState = 'no_qualifying_evidence'): Statement {
  return statement('Not recorded.', 'absent', state, basis)
}

/* ---------------------------------------------------------------- sections */

export interface SectionMeta {
  id: string
  /** The heading a reader sees. */
  label: string
  /** The navigator label, kept short enough for a phone. */
  short: string
  lane: TruthLane
  state: SectionState
  /** Why the section is in that state, in plain words. Always present. */
  reason: string
}

/**
 * The compass order. This is the learning sequence, not a list of database fields: purpose, then
 * what it does, then what happened in people, then how far that carries, then what to do about it.
 */
export const COMPASS_SECTIONS: ReadonlyArray<Omit<SectionMeta, 'state' | 'reason'>> = [
  {
    id: 'substance-action',
    label: 'What it does in the body',
    short: 'What it does',
    lane: 'body_action',
  },
  {
    id: 'goal-fingerprint',
    label: 'What was measured, goal by goal',
    short: 'By goal',
    lane: 'human_result',
  },
  {
    id: 'human-results',
    label: 'What happened in people',
    short: 'In people',
    lane: 'human_result',
  },
  {
    id: 'evidence-staircase',
    label: 'How close this is to real life',
    short: 'How close',
    lane: 'human_result',
  },
  {
    id: 'body-journey',
    label: 'The path through the body',
    short: 'The path',
    lane: 'body_action',
  },
  {
    id: 'felt-measured-meaningful',
    label: 'Felt, measured, or meaningful',
    short: 'Felt or measured',
    lane: 'personal_reality',
  },
  {
    id: 'signal-timeline',
    label: 'How long anything takes',
    short: 'How long',
    lane: 'personal_reality',
  },
  {
    id: 'applicability',
    label: 'Were people like you studied?',
    short: 'Like you?',
    lane: 'uncertainty',
  },
  {
    id: 'no-response',
    label: 'Why it might seem to do nothing',
    short: 'Seems to do nothing',
    lane: 'personal_reality',
  },
  {
    id: 'practical-reality',
    label: 'What taking it involves',
    short: 'What it involves',
    lane: 'personal_reality',
  },
  { id: 'safety', label: 'What can go wrong', short: 'What goes wrong', lane: 'personal_reality' },
  { id: 'stack', label: 'What it may clash with', short: 'Clashes', lane: 'personal_reality' },
  {
    id: 'form-check',
    label: 'Does the exact form matter?',
    short: 'Which form',
    lane: 'uncertainty',
  },
  {
    id: 'measurement',
    label: 'What you could measure',
    short: 'Measuring',
    lane: 'personal_reality',
  },
  {
    id: 'alternatives',
    label: 'Other ways to the same goal',
    short: 'Alternatives',
    lane: 'personal_reality',
  },
  {
    id: 'claim-decoder',
    label: 'Claims that go past the evidence',
    short: 'Big claims',
    lane: 'uncertainty',
  },
  { id: 'community', label: 'What people report', short: 'Reports', lane: 'community_experience' },
  { id: 'unknowns', label: 'What nobody knows yet', short: 'Unknowns', lane: 'uncertainty' },
  {
    id: 'evidence-receipts',
    label: 'Check any of this yourself',
    short: 'Receipts',
    lane: 'human_result',
  },
  {
    id: 'drug-story',
    label: 'How this medicine reached us',
    short: 'Its story',
    lane: 'uncertainty',
  },
  {
    id: 'change-history',
    label: 'What changed on this page',
    short: 'What changed',
    lane: 'uncertainty',
  },
  { id: 'next-question', label: 'What to learn next', short: 'Next', lane: 'uncertainty' },
]

/* ------------------------------------------------------------------ output */

export interface IdentityStrip {
  canonicalName: string
  substanceType: string
  /** Prescription, non-prescription, investigational or unknown, in reader words. */
  availability: string
  availabilityCode: 'prescription' | 'non_prescription' | 'investigational' | 'unknown'
  identityVerified: boolean
  identityLabel: string
  identityBasis: string
  lastSubstantiveReview: string | undefined
}

export interface ActionHero {
  state: SectionState
  simpleAction: Statement
  /** The rest of the recorded explanation, at reading size under the display sentence. */
  actionDetail: Statement
  bodyLocation: Statement
  immediateChange: Statement
  whyPeopleCare: Statement
  analogy: { text: string; limit: string } | null
  strongestGoalResult: Statement
  outcomeType: string
  principalUncertainty: Statement
  supervision: string
  /** Fewer than about 80 words across the four opening statements. Measured, not promised. */
  openingWordCount: number
}

export interface FingerprintCell {
  column: FingerprintColumn
  columnLabel: string
  state: FingerprintState
  /** What is behind the cell, in one short sentence. Always present. */
  detail: string
}

export interface FingerprintRow {
  goal: CompassGoal | 'diagnosed_condition'
  label: string
  cells: FingerprintCell[]
  /** The registered outcome-measure names that put this goal on the page. */
  basis: string[]
}

export interface HumanResultCard {
  id: string
  /** The exact question the study asked. A card without one is never rendered. */
  question: string
  population: string
  intervention: string
  formulation: string
  route: string
  comparator: string
  outcome: string
  outcomeClassLabel: string
  duration: string
  absoluteResult: string
  relativeResult: string
  confidenceInterval: string
  studyDesign: string
  replication: string
  primaryLimitation: string
  applicabilityLimitation: string
  doesNotProve: string
  participants: number | null
  /** Whether the study met the thing it set out to show. Absence is a result too. */
  verdict: 'met' | 'not_met' | 'not_reported'
  verdictLabel: string
  origin: StatementOrigin
  state: SectionState
  sources: SourceCitation[]
}

export interface StaircaseRung {
  level: StaircaseLevel
  rank: number
  label: string
  plain: string
  filled: boolean
  detail: string
  sources: SourceCitation[]
}

export interface JourneyNode {
  id: string
  stage: string
  label: string
  plain: string
  technical: string
}

export interface JourneyEdge {
  from: string
  to: string
  relation: string
  evidenceOrigin:
    'human_outcome' | 'human_biomarker' | 'animal' | 'cell_lab' | 'inferred' | 'predicted'
  direction: string
  scope: string
  verified: boolean
  reviewState: SectionState
  uncertaintyReason: string
  sources: SourceCitation[]
}

export interface TimelineEntry {
  facet: TimelineFacet
  label: string
  value: Statement
}

export interface NoResponseEntry {
  code: NoResponseReason
  label: string
  plain: string
  applies: boolean
  basis: string
}

export interface SafetyEntry {
  text: string
  evidenceSource: string
  evidenceSourcePlain: string
  action: SafetyActionClass
  actionLabel: string
  urgent: boolean
  denominatorKnown: boolean
  sources: SourceCitation[]
}

export interface StackEntry {
  entityA: string
  entityB: string
  consequence: string
  state: InteractionState
  stateLabel: string
  evidenceClass: string
  context: string
  checkedOn: string
  missingInformation: string
  clinicianQuestion: string
  sources: SourceCitation[]
}

export interface FormEntry {
  relation: IdentityRelation
  relationLabel: string
  carriesEvidence: boolean
  counterpart: string
  counterpartSlug?: string
  note: string
}

export interface AlternativeEntry {
  tier: AlternativeTier
  tierLabel: string
  label: string
  path?: string
  outcome: string
  humanEvidence: string
  burden: string
  supervision: string
  uncertainty: string
}

export interface DecodedClaim {
  popularClaim: string
  whyPlausible: string
  claimSourceType: string
  reviewedScope: string
  missingStep: string
  position: ClaimPosition
  positionLabel: string
  whatWouldChangeIt: string
  state: SectionState
  sources: SourceCitation[]
}

export interface UnknownEntry {
  question: string
  reason: string
  whyItMatters: string
  affects: string
  evidenceNeeded: string
  lastChecked: string
  searchScope: string
  state: SectionState
}

export interface ReceiptEntry {
  id: string
  plainConclusion: string
  structuredClaim: string
  measuredMetric: string
  effectEstimate: string
  limitations: string
  sourceExcerpt: string
  sourceReference: string
  doi?: string
  trialRole: string
  entityResolution: string
  auditFlag: string
  reviewState: string
  origin: StatementOrigin
}

export interface NextQuestion {
  question: string
  target: string
  /** Which ranking objective put this here. Shown, so the ordering can be argued with. */
  objective: string
  rank: number
}

export interface DossierV4ViewModel {
  version: 4
  slug: string
  name: string
  identity: IdentityStrip
  pagePromise: string
  hero: ActionHero
  concepts: Concept[]
  fingerprint: {
    state: SectionState
    columns: typeof FINGERPRINT_COLUMNS
    rows: FingerprintRow[]
    note: string
    classifierVersion: string
    registeredOutcomeLine: string
  }
  humanResults: {
    state: SectionState
    cards: HumanResultCard[]
    registry: DossierV3ViewModel['doesItWork']['registry']
    absence: string
    truth: TruthTerms
  }
  staircase: { state: SectionState; rungs: StaircaseRung[]; caveat: string }
  journey: {
    state: SectionState
    nodes: JourneyNode[]
    edges: JourneyEdge[]
    textEquivalent: string[]
    hiddenPredicted: number
    truth: TruthTerms
  }
  experience: {
    state: SectionState
    felt: ClassifiedOutcome[]
    measured: ClassifiedOutcome[]
    meaningful: ClassifiedOutcome[]
    uncategorised: ClassifiedOutcome[]
    traps: typeof EXPERIENCE_TRAPS
    note: string
  }
  timeline: { state: SectionState; entries: TimelineEntry[] }
  applicability: {
    state: SectionState
    included: string[]
    excluded: string[]
    underrepresented: string[]
    transferLimits: string[]
    includedLine: string
    cannotSayLine: string
  }
  noResponse: { state: SectionState; entries: NoResponseEntry[]; note: string }
  practical: {
    state: SectionState
    availability: Statement
    route: Statement
    burden: Statement
    productQuality: Statement
    regulatory: Statement
    discontinuation: Statement
  }
  safety: {
    state: SectionState
    entries: SafetyEntry[]
    spontaneous: DossierV3ViewModel['safety']['spontaneous']
    longTerm: string
    underrepresented: string
  }
  stack: {
    state: SectionState
    entries: StackEntry[]
    absenceLine: string
    neverSafeLine: string
    localOnly: string
  }
  formCheck: {
    state: SectionState
    exactFormStudied: Statement
    exactRouteStudied: Statement
    marketedForms: Statement
    equivalenceEvidence: Statement
    entries: FormEntry[]
    corrections: Array<{ when: string; what: string; why: string }>
  }
  measurement: {
    state: SectionState
    mode: 'self_experiment' | 'clinician_questions' | 'not_available'
    reason: string
    /** Self-experiment fields, present only in the low-risk mode. */
    plan: Array<{ label: string; text: string }>
    whatNotToMeasure: string[]
    stopRules: string[]
    clinicianQuestions: string[]
    warningSigns: Array<{ text: string; sources: SourceCitation[] }>
    boundary: string
    noDoseLine: string
  }
  alternatives: { state: SectionState; entries: AlternativeEntry[]; note: string }
  claimDecoder: { state: SectionState; claims: DecodedClaim[]; absence: string }
  community: {
    state: SectionState
    reports: never[]
    categories: ReadonlyArray<{ code: string; label: string; count: number }>
    separationLine: string
    noImportLine: string
    qualitySignals: readonly string[]
  }
  unknowns: { state: SectionState; entries: UnknownEntry[] }
  receipts: { state: SectionState; entries: ReceiptEntry[]; note: string }
  story: {
    state: SectionState
    entries: Array<{ when: string; what: string; changesToday: boolean }>
  }
  changes: { state: SectionState; entries: DossierV3ViewModel['changes'] }
  nextQuestions: NextQuestion[]
  sections: SectionMeta[]
  gates: Array<{ code: V4Gate; label: string; passed: boolean; detail: string }>
  /** Everything the v3 model produced, for the technical disclosure at the foot of the page. */
  v3: DossierV3ViewModel
  notAdvice: string
  notForChildren: string
}

/* ----------------------------------------------------------------- helpers */

function words(text: string): number {
  return text.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0
}

function iso(value: Date | string | undefined | null): string | undefined {
  if (!value) return undefined
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10)
}

/** What is left of a paragraph after the first `count` sentences, unchanged. */
function remainderAfter(text: string | undefined, count: number): string {
  if (!text) return ''
  const head = firstSentences(text, count)
  return text.slice(head.length).trim()
}

/** Cut a long authored paragraph at a sentence boundary without changing a word of what is kept. */
function firstSentences(text: string, count: number): string {
  const parts = text.match(/[^.!?]+[.!?]+(\s|$)/g)
  if (!parts) return text.trim()
  return parts.slice(0, count).join('').trim()
}

function citationsFromProvenance(provenance: readonly string[] | undefined): SourceCitation[] {
  if (!provenance) return []
  return provenance.slice(0, 12).map((entry) => {
    const doi = /\(?(10\.\d{4,9}\/[^\s)]+)\)?/.exec(entry)?.[1]
    return {
      label: entry.length > 160 ? `${entry.slice(0, 157)}…` : entry,
      ...(doi ? { url: `https://doi.org/${doi}`, id: doi } : {}),
      binding: 'record' as const,
    }
  })
}

function auditCitation(audit: AuditPoint): SourceCitation {
  return {
    label: audit.evidenceSource,
    ...(audit.doi ? { url: `https://doi.org/${audit.doi}`, id: audit.doi } : {}),
    binding: 'record',
  }
}

/** The stored `page_fields` value for one field, or undefined. */
function fieldValue(inputs: DossierV4Inputs, field: string): unknown {
  return inputs.fields[field]?.value
}

function fieldState(inputs: DossierV4Inputs, field: string): string | undefined {
  return inputs.fields[field]?.state
}

/* ------------------------------------------------------------- identity */

function buildIdentity(inputs: DossierV4Inputs, v3: DossierV3ViewModel): IdentityStrip {
  const legacy = inputs.legacyRecord
  const approval = legacy?.approvalStatus ?? inputs.legacy?.approvalStatus ?? ''
  const lower = approval.toLowerCase()
  let availabilityCode: IdentityStrip['availabilityCode'] = 'unknown'
  let availability = 'RNAWiki has not recorded how this is supplied.'
  if (/supplement|dietary|non-fda|otc|over the counter/.test(lower)) {
    availabilityCode = 'non_prescription'
    availability = 'Sold without a prescription'
  } else if (/investigational|phase|not approved|clinical trial/.test(lower)) {
    availabilityCode = 'investigational'
    availability = 'Still being tested, not approved'
  } else if (/approved|licen[cs]ed|marketed|prescription/.test(lower)) {
    availabilityCode = 'prescription'
    availability = 'Prescription only'
  }
  if (v3.supervision.level === 'required') {
    availabilityCode = availabilityCode === 'unknown' ? 'prescription' : availabilityCode
  }
  const identityCheck = v3.indexQuality.find((check) => check.check === 'identity_passed')
  return {
    canonicalName: v3.name,
    substanceType: v3.substanceType.label,
    availability,
    availabilityCode,
    identityVerified: identityCheck?.passed ?? false,
    identityLabel: identityCheck?.passed ? 'Identity checked' : 'Identity not confirmed',
    identityBasis:
      identityCheck?.detail ?? 'RNAWiki has not run the identity check on this record.',
    lastSubstantiveReview: v3.lastEvidenceCheck,
  }
}

/* ----------------------------------------------------------------- hero */

/**
 * Read the kind of result out of the result sentence itself, using the same ordering the outcome
 * classifier uses: a life outcome beats a function, a function beats a performance measure, and a
 * laboratory value is last. A sentence that names none of them stays unknown, because guessing here
 * would turn a muscle biopsy into a health benefit on the first screen.
 */
function outcomeTypeFromText(text: string, origin: StatementOrigin): string {
  if (origin === 'contract_sentence' || origin === 'absent') {
    return 'No result is published, so no kind of result applies yet'
  }
  const lower = text.toLowerCase()
  if (/\b(surviv|mortalit|death|lifespan|heart attack|stroke)\b/.test(lower)) {
    return 'Living longer, or avoiding a major event'
  }
  if (/\b(function|capacity|disabilit|walking|independen)\b/.test(lower)) {
    return 'What a body can do day to day'
  }
  if (/\b(power|strength|performance|repetition|bench|squat|sprint|endurance)\b/.test(lower)) {
    return 'Measured performance'
  }
  if (/\b(symptom|pain|fatigue|mood|sleep|quality of life)\b/.test(lower)) {
    return 'Symptoms and quality of life'
  }
  if (/\b(muscle|biops|phosphocreatine|concentration|content|tissue)\b/.test(lower)) {
    return 'A step measured inside a person'
  }
  if (/\b(cholesterol|glucose|blood|serum|mass|density|weight|marker)\b/.test(lower)) {
    return 'A number that stands in for health'
  }
  return 'The kind of result is not recorded'
}

/**
 * Of the findings written into a record, pick the one closest to something a person would notice,
 * using the staircase order. Taking the first entry instead would have led the creatine page with a
 * muscle biopsy measurement while a twelve-week randomised strength result sat further down the
 * same list. Ties keep the recorded order, so the choice is stable.
 */
function strongestMeasuredFinding(findings: readonly string[]): string | undefined {
  const rank = (text: string): number => {
    const lower = text.toLowerCase()
    if (/\b(surviv|mortalit|death|lifespan|heart attack|stroke)\b/.test(lower)) return 6
    if (/\b(function|capacity|disabilit|walking|independen)\b/.test(lower)) return 5
    if (/\b(bench|squat|repetition|power|strength|sprint|performance)\b/.test(lower)) return 4
    if (/\b(symptom|pain|fatigue|mood|sleep|quality of life)\b/.test(lower)) return 3
    if (/\b(mass|density|cholesterol|glucose|blood|serum)\b/.test(lower)) return 2
    return 1
  }
  let best: string | undefined
  let bestRank = -1
  for (const finding of findings) {
    const value = rank(finding)
    if (value > bestRank) {
      bestRank = value
      best = finding
    }
  }
  return best
}

function buildHero(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
  identity: IdentityStrip,
): ActionHero {
  const legacy = inputs.legacyRecord
  const bound = inputs.boundAnswer
  const steps = legacy?.mechanismSteps ?? []
  const provenance = citationsFromProvenance(legacy?.sourceProvenance)

  // What it changes in the body. The authored explanation is the only thing that answers this in
  // reader language; where it is absent the hero says so rather than reaching for an abstract.
  // One sentence carries the display line. Two sentences at display size filled six lines of the
  // first screen and pushed the human result below the fold, so the rest reads at body size.
  const simpleAction = legacy?.laymanHowItWorks
    ? statement(
        readerText(firstSentences(legacy.laymanHowItWorks, 1)),
        'authored_record',
        'source_checked_draft',
        'A person wrote this explanation into the record, with the studies named in the path below.',
        provenance.slice(0, 3),
      )
    : absentStatement(
        'No plain explanation of what this changes in the body is stored for this record.',
        'awaiting_review',
      )

  const detailText = legacy?.laymanHowItWorks
    ? firstSentences(legacy.laymanHowItWorks, 3)
        .slice(firstSentences(legacy.laymanHowItWorks, 1).length)
        .trim()
    : ''
  const actionDetail = detailText
    ? statement(
        readerText(detailText),
        'authored_record',
        'source_checked_draft',
        'The rest of the recorded explanation of what happens in the body.',
        provenance.slice(0, 3),
      )
    : absentStatement('No further explanation is recorded.', 'no_qualifying_evidence')

  const bodyLocation = legacy?.anatomicalSite
    ? statement(
        readerText(legacy.anatomicalSite),
        'authored_record',
        'source_checked_draft',
        'The site of action recorded on this substance.',
      )
    : absentStatement('No site of action is recorded.')

  const firstStep =
    steps.find((step) => step.visualStage === 'target_binding') ?? steps[1] ?? steps[0]
  const immediateChange = firstStep
    ? statement(
        readerText(firstStep.laymanDesc),
        'authored_record',
        'source_checked_draft',
        `Step ${firstStep.step} of the recorded path through the body.`,
        provenance.slice(0, 2),
      )
    : absentStatement('No step-by-step path through the body is recorded.')

  const whyPeopleCare = bound?.copy.usedFor
    ? statement(
        bound.copy.usedFor,
        'approved_first_read',
        'reviewed_content',
        'A reviewer approved this sentence against this exact record and its sources.',
      )
    : legacy?.patientFriendlyIndication
      ? statement(
          readerText(legacy.patientFriendlyIndication),
          'authored_record',
          'source_checked_draft',
          'The recorded use, written for a reader without medical training. Not signed off.',
        )
      : absentStatement('No recorded use is stored in reader language.')

  /*
   * The strongest result, and the limit beside it.
   *
   * Three tiers, in falling order of how much review each has had. The approved first-read answer
   * is best: a reviewer signed the exact pairing of that sentence with this record's source
   * surface. It resolves only while the fingerprint still matches, and on this branch two of the
   * four gold records have changed since approval, so their answers correctly stop resolving.
   *
   * Rather than dropping to the contract sentence and leaving the first screen saying only that
   * nothing is reviewed, the second tier reaches for what a person wrote into the record, under a
   * label that says exactly that. The third tier is the contract sentence. The point of the tiers
   * is that they are visibly different to a reader, not that they are interchangeable.
   */
  const measured = legacy?.measuredVsInferredSummary
  const strongestGoalResult = bound?.copy.whatStudiesFound
    ? statement(
        bound.copy.whatStudiesFound,
        'approved_first_read',
        'reviewed_content',
        'A reviewer approved this against this record. The reviewed-claim record carrying the exact population and effect size does not exist yet.',
      )
    : strongestMeasuredFinding(measured?.strictlyMeasured ?? [])
      ? statement(
          readerText(strongestMeasuredFinding(measured?.strictlyMeasured ?? []) as string),
          'authored_record',
          'source_checked_draft',
          'The recorded finding that sits closest to something a person would notice. Written into the record, not signed off, and it carries no population or interval.',
          provenance.slice(0, 3),
        )
      : statement(
          v3.contract.noReviewedConclusionSentence,
          'contract_sentence',
          'awaiting_review',
          'No reviewed claim names a result for any goal on this record.',
        )

  const principalUncertainty = bound?.copy.biggestLimit
    ? statement(
        bound.copy.biggestLimit,
        'approved_first_read',
        'reviewed_content',
        'The limit a reviewer approved as the one that matters most here.',
      )
    : (measured?.whatFailedInitially?.[0] ?? measured?.unsupportedInferences?.[0])
      ? statement(
          readerText(
            (measured?.whatFailedInitially?.[0] ?? measured?.unsupportedInferences?.[0]) as string,
          ),
          'authored_record',
          'source_checked_draft',
          'A failure or an overreach recorded against this substance. Not signed off as a reviewed claim.',
          provenance.slice(0, 3),
        )
      : absentStatement('No statement of the main limit is recorded.', 'awaiting_review')

  // v3 calls the boundary "breaks"; v4 renders it as "where this stops being true". An analogy
  // without its boundary is never carried across.
  const analogy = v3.decisionCard.analogy
    ? { text: v3.decisionCard.analogy.text, limit: v3.decisionCard.analogy.breaks }
    : null

  const openingWordCount =
    words(simpleAction.text) +
    words(actionDetail.text) +
    words(whyPeopleCare.text) +
    words(strongestGoalResult.text)

  return {
    state:
      strongestGoalResult.state === 'reviewed_content' ||
      simpleAction.state === 'source_checked_draft'
        ? 'source_checked_draft'
        : 'awaiting_review',
    simpleAction,
    actionDetail,
    bodyLocation,
    immediateChange,
    whyPeopleCare,
    analogy,
    strongestGoalResult,
    // What kind of thing the headline result is. A reviewed claim names its own outcome class; with
    // none, the kind is read from the strongest result's own words, and stays unknown if they do
    // not say. It is never assumed to be the kind a reader would most want.
    outcomeType:
      v3.doesItWork.byGoal[0]?.cards[0]?.outcomeLabel ??
      outcomeTypeFromText(strongestGoalResult.text, strongestGoalResult.origin),
    principalUncertainty,
    supervision: v3.supervision.text,
    openingWordCount,
  }
}

/* ---------------------------------------------------------- fingerprint */

/**
 * The fingerprint says, for each goal, what kind of thing was measured. It is built from the
 * registered outcome-measure names, which record intent and not result, and every cell says so.
 */
function buildFingerprint(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
  classified: ClassifiedOutcome[],
): DossierV4ViewModel['fingerprint'] {
  const tested = inputs.roleAggregate?.tested.studies ?? 0
  const resultsPosted = inputs.roleAggregate?.tested.completedWithPostedResults ?? 0
  const byGoal = new Map<CompassGoal, ClassifiedOutcome[]>()
  for (const entry of classified) {
    for (const goal of entry.goals) {
      const list = byGoal.get(goal) ?? []
      list.push(entry)
      byGoal.set(goal, list)
    }
  }
  // A reviewed claim would raise a cell above the registered-only states. None exists here, so the
  // ceiling is what the registry can support, and the cells say which kind of thing was registered.
  const reviewedGoals = new Set(
    v3.doesItWork.byGoal
      .filter((entry) => entry.cards.length > 0)
      .map((entry) => (entry.goal === 'all' ? null : compassGoalFromV3(entry.goal)))
      .filter((goal): goal is CompassGoal => goal !== null),
  )

  const rows: FingerprintRow[] = [...byGoal.entries()]
    .sort((left, right) => right[1].length - left[1].length)
    .map(([goal, entries]) => {
      const has = (test: (entry: ClassifiedOutcome) => boolean): boolean => entries.some(test)
      const cellState = (
        column: FingerprintColumn,
      ): { state: FingerprintState; detail: string } => {
        const reviewed = reviewedGoals.has(goal)
        switch (column) {
          case 'meaningful_human_outcome': {
            const hits = entries.filter(
              (entry) =>
                entry.outcomeClass === 'longevity_mortality' ||
                entry.outcomeClass === 'clinical_event',
            )
            if (hits.length === 0)
              return {
                state: 'no_qualifying_evidence',
                detail: 'No registered study lists a life outcome for this goal.',
              }
            return {
              state: reviewed ? 'supported_with_limits' : 'awaiting_review',
              detail: `${hits.length} registered study measure of this kind. No reviewed result yet.`,
            }
          }
          case 'performance_or_function': {
            const hits = entries.filter((entry) => entry.outcomeClass === 'function_performance')
            if (hits.length === 0)
              return {
                state: 'no_qualifying_evidence',
                detail: 'No registered study lists a performance measure for this goal.',
              }
            return {
              state: reviewed ? 'supported_with_limits' : 'awaiting_review',
              detail: `${hits.length} registered performance measure of this kind.`,
            }
          }
          case 'symptom': {
            const hits = entries.filter((entry) => entry.outcomeClass === 'symptom_quality_of_life')
            if (hits.length === 0)
              return {
                state: 'no_qualifying_evidence',
                detail: 'No registered study lists a symptom measure for this goal.',
              }
            return {
              state: 'awaiting_review',
              detail: `${hits.length} registered symptom measure.`,
            }
          }
          case 'biomarker': {
            const hits = entries.filter((entry) => entry.outcomeClass === 'biomarker_surrogate')
            if (hits.length === 0)
              return {
                state: 'no_qualifying_evidence',
                detail: 'No registered study lists a test result for this goal.',
              }
            return { state: 'biomarker_only', detail: `${hits.length} registered test measure.` }
          }
          case 'mechanism': {
            const hits = entries.filter((entry) => entry.outcomeClass === 'mechanistic_measurement')
            if (hits.length === 0)
              return {
                state: 'no_qualifying_evidence',
                detail: 'No registered study lists a body-step measure for this goal.',
              }
            return {
              state: 'mechanism_only',
              detail: `${hits.length} registered body-step measure.`,
            }
          }
          case 'safety': {
            const hits = entries.filter((entry) => entry.outcomeClass === 'safety_tolerability')
            return hits.length === 0
              ? { state: 'unknown', detail: 'Harms were not a registered measure for this goal.' }
              : { state: 'awaiting_review', detail: `${hits.length} registered harm measure.` }
          }
          case 'duration':
            return inputs.roleAggregate?.tested.longestCompletedWindow
              ? {
                  state: 'awaiting_review',
                  detail: `Longest finished window ${inputs.roleAggregate.tested.longestCompletedWindow.days} days, across all goals.`,
                }
              : { state: 'unknown', detail: 'No finished study window is recorded.' }
          case 'applicability':
            return has(() => true)
              ? {
                  state: 'awaiting_review',
                  detail: 'Who was studied is listed further down the page.',
                }
              : { state: 'unknown', detail: 'Nothing recorded.' }
          default:
            return { state: 'unknown', detail: 'Nothing recorded.' }
        }
      }
      return {
        goal,
        label: compassGoalLabel(goal),
        cells: FINGERPRINT_COLUMNS.map((column) => ({
          column: column.code,
          columnLabel: column.label,
          ...cellState(column.code),
        })),
        basis: entries.slice(0, 8).map((entry) => entry.term),
      }
    })
    .slice(0, 10)

  return {
    state: rows.length > 0 ? 'source_checked_draft' : 'no_qualifying_evidence',
    columns: FINGERPRINT_COLUMNS,
    rows,
    note: COMPASS_COPY.noTotalScore,
    classifierVersion: OUTCOME_CLASSIFIER_VERSION,
    registeredOutcomeLine:
      rows.length > 0
        ? `${registeredOutcomeLine(classified.length)} ${tested} of the matched studies tested this substance, and ${resultsPosted} posted a result.`
        : registeredOutcomeLine(classified.length),
  }
}

/* --------------------------------------------------------- human results */

const VERDICT_LABELS: Record<HumanResultCard['verdict'], string> = {
  met: 'The study showed what it set out to show',
  not_met: 'The study did not show it',
  not_reported: 'The study did not report it',
}

function buildHumanResults(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
): DossierV4ViewModel['humanResults'] {
  const legacy = inputs.legacyRecord
  const provenance = citationsFromProvenance(legacy?.sourceProvenance)
  const cards: HumanResultCard[] = (legacy?.trials ?? [])
    .filter(
      (trial: ClinicalTrialRecord) => Boolean(trial.primaryEndpoint) && Boolean(trial.trialId),
    )
    .map((trial, index) => {
      const verdict: HumanResultCard['verdict'] =
        trial.endpointStatus ?? (trial.endpointMet ? 'met' : 'not_met')
      const nct = /NCT\d{8}/.exec(trial.trialId)?.[0]
      const role = nct ? inputs.roleAggregate?.rows.find((row) => row.nctId === nct) : undefined
      return {
        id: `result-${index + 1}`,
        question: readerText(trial.primaryEndpoint),
        population: readerText(trial.trialId),
        intervention: legacy?.name ?? v3.name,
        formulation: legacy?.deliverySystem?.type ?? 'Not recorded for this study',
        route: legacy?.deliverySystem?.type ?? 'Not recorded for this study',
        comparator: /placebo/i.test(trial.phase)
          ? 'A dummy treatment'
          : 'Not recorded for this study',
        outcome: readerText(trial.primaryEndpoint),
        outcomeClassLabel: /surviv|death|mortalit/i.test(trial.primaryEndpoint)
          ? 'Living longer, or avoiding a major event'
          : /function|capacit|decline/i.test(trial.primaryEndpoint)
            ? 'What a body can do day to day'
            : /strength|mass|power|repetition/i.test(trial.primaryEndpoint)
              ? 'Measured performance'
              : 'A number that stands in for health',
        duration:
          /\b(\d+)\s*(year|month|week)s?\b/i.exec(trial.primaryEndpoint)?.[0] ??
          'Not recorded in this summary',
        absoluteResult: readerText(trial.statisticalPValue),
        relativeResult: 'Not recorded in this summary',
        confidenceInterval:
          /95%\s*C[LI][^.]*/i.exec(trial.statisticalPValue)?.[0] ?? 'Not recorded in this summary',
        studyDesign: readerText(trial.phase),
        replication: trial.independentReplicationStatus ?? 'Not recorded',
        primaryLimitation: trial.unreportedAdverseSignals
          ? readerText(trial.unreportedAdverseSignals)
          : 'No limitation is recorded for this study.',
        applicabilityLimitation: role
          ? `RNAWiki classified this registered study as ${role.role === 'experimental_intervention' ? 'testing this substance' : 'not clearly testing this substance'}.`
          : 'This study is recorded from the curated record, not from the registry match.',
        doesNotProve:
          verdict === 'met'
            ? 'Meeting one endpoint in one population does not carry to other goals or other people.'
            : 'A study that did not show an effect does not show that no effect exists anywhere.',
        participants: trial.sampleSize ?? null,
        verdict,
        verdictLabel: VERDICT_LABELS[verdict],
        origin: 'authored_record' as StatementOrigin,
        state: 'source_checked_draft' as SectionState,
        sources: provenance.slice(0, 4),
      }
    })
  return {
    state: cards.length > 0 ? 'source_checked_draft' : 'no_qualifying_evidence',
    cards,
    registry: v3.doesItWork.registry,
    absence:
      cards.length > 0
        ? v3.contract.noReviewedConclusionSentence
        : nothingFoundLine('the curated record and the registry match', v3.lastEvidenceCheck),
    truth: {
      know: cards.length
        ? `RNAWiki holds ${cards.length} written-up human studies for this substance, each with the question it asked.`
        : 'RNAWiki holds no written-up human study for this substance.',
      how: 'Each card names the study, the number of people and what the study set out to measure.',
      notProve:
        'These summaries were written by a person and have not been signed off as reviewed claims.',
      matters: 'A study that failed is as informative as one that worked, and both are here.',
      stillUnknown:
        'No reviewed claim exists, so no exact population, effect size or interval is published yet.',
    },
  }
}

/* ------------------------------------------------------------- staircase */

/** "1 registered measure", not "1 registered measures". Irregular plurals are passed in. */
function countOf(count: number, noun: string, plural?: string): string {
  if (count === 1) return `${count} ${noun}`
  return `${count} ${plural ?? `${noun}s`}`
}

function buildStaircase(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
  classified: ClassifiedOutcome[],
): DossierV4ViewModel['staircase'] {
  const legacy = inputs.legacyRecord
  const ladder = v3 ? inputs.corpus.ladder : []
  const provenance = citationsFromProvenance(legacy?.sourceProvenance)
  const hasOutcome = (test: (entry: ClassifiedOutcome) => boolean): number =>
    classified.filter(test).length
  const animalRungs = ladder.filter(
    (rung) => rung.filled && !['human'].includes(rung.rung.toLowerCase()),
  )
  const humanRung = ladder.find((rung) => rung.rung.toLowerCase() === 'human')

  const rungs: StaircaseRung[] = STAIRCASE_LEVELS.map((level) => {
    switch (level.code) {
      case 'mortality_or_major_event': {
        const count = hasOutcome(
          (entry) =>
            entry.outcomeClass === 'longevity_mortality' || entry.outcomeClass === 'clinical_event',
        )
        const failed = (legacy?.trials ?? []).filter(
          (trial) =>
            !trial.endpointMet && /surviv|death|progress|capacit/i.test(trial.primaryEndpoint),
        )
        return {
          level: level.code,
          rank: level.rank,
          label: level.label,
          plain: level.plain,
          filled: count > 0,
          detail: failed.length
            ? `${countOf(count, 'registered measure')} of this kind. ${countOf(failed.length, 'written-up study', 'written-up studies')} measured this and did not show a benefit.`
            : count > 0
              ? `${countOf(count, 'registered measure')} of this kind. No reviewed result.`
              : 'No registered study measures this.',
          sources: failed.length ? provenance.slice(0, 3) : [],
        }
      }
      case 'clinical_function':
      case 'performance': {
        const count = hasOutcome((entry) => entry.outcomeClass === 'function_performance')
        return {
          level: level.code,
          rank: level.rank,
          label: level.label,
          plain: level.plain,
          filled: count > 0,
          detail:
            count > 0
              ? `${countOf(count, 'registered measure')} of this kind.`
              : 'No registered study measures this.',
          sources: [],
        }
      }
      case 'symptom_or_quality_of_life': {
        const count = hasOutcome((entry) => entry.outcomeClass === 'symptom_quality_of_life')
        return {
          level: level.code,
          rank: level.rank,
          label: level.label,
          plain: level.plain,
          filled: count > 0,
          detail:
            count > 0
              ? `${countOf(count, 'registered measure')} of this kind.`
              : 'No registered study measures this.',
          sources: [],
        }
      }
      case 'biomarker_or_surrogate': {
        const count = hasOutcome((entry) => entry.outcomeClass === 'biomarker_surrogate')
        return {
          level: level.code,
          rank: level.rank,
          label: level.label,
          plain: level.plain,
          filled: count > 0,
          detail:
            count > 0
              ? `${countOf(count, 'registered measure')} of this kind.`
              : 'No registered study measures this.',
          sources: [],
        }
      }
      case 'human_mechanism': {
        const count = hasOutcome((entry) => entry.outcomeClass === 'mechanistic_measurement')
        return {
          level: level.code,
          rank: level.rank,
          label: level.label,
          plain: level.plain,
          filled: count > 0 || Boolean(humanRung?.filled),
          detail:
            count > 0
              ? `${countOf(count, 'registered measure')} inside human tissue.`
              : humanRung?.filled
                ? 'A human record sits on the stored organism ladder.'
                : 'No registered study measures this.',
          sources: [],
        }
      }
      case 'animal':
        return {
          level: level.code,
          rank: level.rank,
          label: level.label,
          plain: level.plain,
          filled: animalRungs.length > 0,
          detail: animalRungs.length
            ? `Stored records in ${animalRungs.map((rung) => rung.label).join(', ')}. ${COMPASS_COPY.animalIsNotHuman}`
            : 'No animal record is stored.',
          sources: [],
        }
      case 'cell_or_lab':
        return {
          level: level.code,
          rank: level.rank,
          label: level.label,
          plain: level.plain,
          filled: Boolean(fieldValue(inputs, 'pathway')),
          detail: fieldValue(inputs, 'pathway')
            ? 'Stored mechanism abstracts describe steps measured in cells or tissue.'
            : 'No cell or bench record is stored.',
          sources: [],
        }
      default:
        return {
          level: level.code,
          rank: level.rank,
          label: level.label,
          plain: level.plain,
          filled: false,
          detail: `RNAWiki stores no prediction for this record. ${COMPASS_COPY.predictionIsNotFinding}`,
          sources: [],
        }
    }
  })
  return {
    state: rungs.some((rung) => rung.filled) ? 'source_checked_draft' : 'no_qualifying_evidence',
    rungs,
    caveat: COMPASS_COPY.staircaseCaveat,
  }
}

/* ---------------------------------------------------------- body journey */

const STAGE_LABELS: Record<MechanismStep['visualStage'], { label: string; node: string }> = {
  delivery: { label: 'Getting in', node: 'first-location' },
  cellular_entry: { label: 'Reaching the cell', node: 'cell-entry' },
  target_binding: { label: 'What it acts on', node: 'target' },
  catalytic_action: { label: 'The change it makes', node: 'change' },
  therapeutic_result: { label: 'What that does for a person', node: 'human-outcome' },
}

function buildJourney(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
): DossierV4ViewModel['journey'] {
  const legacy = inputs.legacyRecord
  const steps = [...(legacy?.mechanismSteps ?? [])].sort((left, right) => left.step - right.step)
  const provenance = citationsFromProvenance(legacy?.sourceProvenance)
  if (steps.length === 0) {
    return {
      state: 'no_qualifying_evidence',
      nodes: [],
      edges: [],
      textEquivalent: [
        'RNAWiki holds no step-by-step path through the body for this substance.',
        COMPASS_COPY.absenceIsNotSafety,
      ],
      hiddenPredicted: 0,
      truth: {
        know: 'Nothing is recorded about the path this substance takes through the body.',
        how: 'The curated record holds no mechanism steps.',
        notProve: 'An empty path does not mean the substance does nothing.',
        matters: 'Without a path, a reader cannot tell a body step from a human result.',
        stillUnknown: 'Every step of this path is unrecorded.',
      },
    }
  }
  const nodes: JourneyNode[] = [
    {
      id: 'substance',
      stage: 'Start',
      label: v3.name,
      plain: `What a person takes: ${legacy?.deliverySystem?.type ?? 'form not recorded'}.`,
      technical: legacy?.deliverySystem?.description ?? '',
    },
    ...steps.map((step) => ({
      id: STAGE_LABELS[step.visualStage]?.node ?? `step-${step.step}`,
      stage: STAGE_LABELS[step.visualStage]?.label ?? `Step ${step.step}`,
      label: readerText(step.title),
      plain: readerText(step.laymanDesc),
      technical: readerText(step.molecularDetail),
    })),
  ]
  // An edge is verified when the step it carries names a measurement in people. The curated steps
  // name their studies in the technical detail, which is what the check reads.
  const humanEvidence =
    /\b(?:subjects?|participants?|patients?|men|women|adults?|randomis|randomiz|biops|plasma|human)\b/i
  const animalEvidence = /\b(?:mouse|mice|rat|rats|dog|dogs|transgenic|in vitro|cell line)\b/i
  const edges: JourneyEdge[] = []
  for (let index = 0; index < nodes.length - 1; index += 1) {
    const from = nodes[index]
    const to = nodes[index + 1]
    if (!from || !to) continue
    const step = steps[index]
    const detail = step?.molecularDetail ?? ''
    const isHuman = humanEvidence.test(detail)
    const isAnimal = animalEvidence.test(detail) && !isHuman
    edges.push({
      from: from.id,
      to: to.id,
      relation: to.stage,
      evidenceOrigin: isHuman ? 'human_biomarker' : isAnimal ? 'animal' : 'inferred',
      direction: 'increase',
      scope: isHuman
        ? 'Measured in people'
        : isAnimal
          ? 'Measured in animals'
          : 'Described, with no measurement named',
      verified: isHuman,
      reviewState: 'source_checked_draft',
      uncertaintyReason: isHuman
        ? 'Written by a person from the study named beside the step. Not signed off as a reviewed claim.'
        : isAnimal
          ? COMPASS_COPY.animalIsNotHuman
          : 'No measurement is named for this step, so it is drawn as an unconfirmed link.',
      sources: provenance.slice(0, 3),
    })
  }
  return {
    state: 'source_checked_draft',
    nodes,
    edges,
    textEquivalent: nodes.map(
      (node, index) => `${index + 1}. ${node.stage}: ${node.label}. ${node.plain}`,
    ),
    hiddenPredicted: 0,
    truth: {
      know: `The record describes ${steps.length} steps from taking it to an effect in a person.`,
      how: 'Each step names the study behind it in the technical detail beside it.',
      notProve: COMPASS_COPY.mechanismIsNotBenefit,
      matters: 'A reader can see exactly where the chain stops being measured in people.',
      stillUnknown: 'No reviewed claim binds any of these steps to a named population.',
    },
  }
}

/* ------------------------------------------------- felt, measured, meaningful */

function buildExperience(classified: ClassifiedOutcome[]): DossierV4ViewModel['experience'] {
  const grouping = groupByExperience(classified)
  const any = grouping.felt.length + grouping.measured.length + grouping.meaningful.length > 0
  return {
    state: any ? 'source_checked_draft' : 'no_qualifying_evidence',
    ...grouping,
    traps: EXPERIENCE_TRAPS,
    note: `${COMPASS_COPY.registeredNotReported} ${COMPASS_COPY.biomarkerIsNotOutcome}`,
  }
}

/* -------------------------------------------------------------- timeline */

function buildTimeline(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
): DossierV4ViewModel['timeline'] {
  const aggregate = inputs.roleAggregate
  const longest = aggregate?.tested.longestCompletedWindow
  const kinetics = fieldValue(inputs, 'kinetics')
  const entries: TimelineEntry[] = TIMELINE_FACETS.map((facet) => {
    switch (facet.code) {
      case 'assessed_outcome_duration':
        return {
          facet: facet.code,
          label: facet.label,
          value: longest
            ? statement(
                `${longest.days} days in the longest finished study that tested this substance.`,
                'derived_count',
                'source_checked_draft',
                `Study ${longest.nctId}, from ${longest.startDate} to ${longest.completionDate}, counted only because a planned end date was excluded.`,
              )
            : absentStatement(
                'No finished study window is recorded for a study that tested this substance.',
              ),
        }
      case 'follow_up_duration':
        return {
          facet: facet.code,
          label: facet.label,
          value: absentStatement(
            'Follow-up length is not stored separately. It is never read off the study window, which would be a different thing.',
          ),
        }
      case 'treatment_exposure_duration':
        return {
          facet: facet.code,
          label: facet.label,
          value: absentStatement(
            'How long people actually took it is not stored. The study window is not the same thing.',
          ),
        }
      case 'half_life':
        return {
          facet: facet.code,
          label: facet.label,
          value:
            kinetics && fieldState(inputs, 'kinetics') === 'present'
              ? statement(
                  String(kinetics),
                  'stored_source',
                  'source_checked_draft',
                  'The recorded clearance figure for this substance.',
                )
              : absentStatement('No clearance figure is recorded.'),
        }
      case 'long_term_unknown':
        return {
          facet: facet.code,
          label: facet.label,
          value: statement(
            longest
              ? `Nothing is recorded beyond ${longest.days} days.`
              : 'Nothing is recorded about the long term.',
            'contract_sentence',
            'no_qualifying_evidence',
            'The longest finished study sets the edge of what anyone measured.',
          ),
        }
      default:
        return {
          facet: facet.code,
          label: facet.label,
          value: absentStatement(
            `RNAWiki does not store this separately, and never works it out from another figure on this page.`,
          ),
        }
    }
  })
  return {
    state: entries.some((entry) => entry.value.origin !== 'absent')
      ? 'source_checked_draft'
      : 'no_qualifying_evidence',
    entries,
  }
}

/* ---------------------------------------------------------- applicability */

function buildApplicability(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
): DossierV4ViewModel['applicability'] {
  const context = inputs.legacyRecord?.conditionContext
  const summary = inputs.legacyRecord?.measuredVsInferredSummary
  const included = context?.whoTakesThis ? humaniseReaderList([context.whoTakesThis]).items : []
  const transferLimits = humaniseReaderList(
    [
      ...(summary?.whatFailedInitially ?? []),
      ...v3.applicability.intro.filter((line) => line.length > 0),
    ].slice(0, 8),
  ).items
  return {
    state:
      included.length || transferLimits.length ? 'source_checked_draft' : 'no_qualifying_evidence',
    included,
    excluded: [],
    underrepresented: v3.safety.underrepresented ? [v3.safety.underrepresented] : [],
    transferLimits,
    includedLine: COMPASS_COPY.applicabilityIncluded,
    cannotSayLine: COMPASS_COPY.applicabilityCannotSay,
  }
}

/* ----------------------------------------------------------- no response */

function buildNoResponse(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
  classified: ClassifiedOutcome[],
): DossierV4ViewModel['noResponse'] {
  const summary = inputs.legacyRecord?.measuredVsInferredSummary
  const realWorld = summary?.realWorldOutcome ?? []
  const relations = inputs.corpus.relations
  const applies: Partial<Record<NoResponseReason, string>> = {}

  if (classified.some((entry) => entry.goals.length === 0)) {
    applies.goal_mismatch =
      'Some registered studies measured things that match no goal on this page.'
  }
  if (v3.safety.underrepresented) {
    applies.population_mismatch = v3.safety.underrepresented
  }
  if (relations.length > 0) {
    applies.formulation_mismatch = `This record is linked to ${relations.length} related forms. Evidence does not carry across all of them.`
  }
  const baselineLine = realWorld.find((line) => /start|baseline|lowest|deficien/i.test(line))
  if (baselineLine) applies.baseline_status = baselineLine
  // "showed no change" is as common a way of recording a non-responder as "did not respond", and
  // leaving it out dropped the reason from records that plainly state it.
  const responderLine = realWorld.find((line) =>
    /did not|non[- ]respond|no effect|no change/i.test(line),
  )
  if (responderLine) applies.subtle_or_unfelt_effect = responderLine
  const coInterventionLine = (inputs.legacyRecord?.mechanismSteps ?? []).find((step) =>
    /training|exercise|diet/i.test(step.laymanDesc),
  )
  if (coInterventionLine) {
    applies.required_co_intervention = coInterventionLine.laymanDesc
  }
  const qualityNote = inputs.legacyRecord?.deliverySystem?.description
  if (qualityNote && /supplement|no agency reviewed|not reviewed/i.test(qualityNote)) {
    applies.product_identity =
      'This is sold as a supplement, so no agency checked what is in a given tub before it was sold.'
  }
  applies.measurement_noise =
    'Day-to-day swing in sleep, food and stress moves most home measurements more than a supplement would.'
  applies.evidence_uncertainty = v3.contract.noReviewedConclusionSentence

  const entries: NoResponseEntry[] = NO_RESPONSE_REASONS.map((reason) => ({
    code: reason.code,
    label: reason.label,
    plain: reason.plain,
    applies: Boolean(applies[reason.code]),
    basis: applies[reason.code] ?? 'Nothing in this record points to this reason.',
  }))
  return {
    state: 'source_checked_draft',
    entries,
    note: 'None of these is a reason to take more. Taking more is not a step this page ever suggests.',
  }
}

/* ------------------------------------------------------ practical reality */

function buildPractical(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
  identity: IdentityStrip,
): DossierV4ViewModel['practical'] {
  const delivery = inputs.legacyRecord?.deliverySystem
  const regulatory = fieldValue(inputs, 'regulatory')
  return {
    state: delivery ? 'source_checked_draft' : 'no_qualifying_evidence',
    availability: statement(
      identity.availability,
      'stored_source',
      'source_checked_draft',
      'Read from the recorded approval status.',
      v3.substanceType.sources,
    ),
    route: delivery?.type
      ? statement(
          delivery.type,
          'authored_record',
          'source_checked_draft',
          'The form and route recorded on this substance.',
        )
      : absentStatement('No form or route is recorded.'),
    burden: statement(
      v3.supervision.text,
      'stored_source',
      'source_checked_draft',
      v3.supervision.basis,
      v3.supervision.sources,
    ),
    productQuality: delivery?.description
      ? statement(
          readerText(firstSentences(delivery.description, 2)),
          'authored_record',
          'source_checked_draft',
          'Recorded notes on how this is sold and what that means for what is in the pack.',
        )
      : absentStatement('Nothing is recorded about product quality.'),
    regulatory: regulatory
      ? statement(
          'Regulatory records are listed in the technical disclosure at the foot of this page.',
          'derived_count',
          'source_checked_draft',
          'Register entries are stored per jurisdiction and shown with their dates.',
        )
      : absentStatement('No register entry is recorded.'),
    discontinuation: absentStatement(
      'No record of why people stopped taking it is stored for this substance.',
    ),
  }
}

/* ---------------------------------------------------------------- safety */

function buildSafety(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
): DossierV4ViewModel['safety'] {
  const delivery = inputs.legacyRecord?.deliverySystem
  const entries: SafetyEntry[] = v3.safety.items.map((item) => ({
    text: item.text,
    evidenceSource: item.layer,
    evidenceSourcePlain: item.layerLabel,
    action: item.layer === 'regulatory_label' ? 'professional_discussion' : 'common_nonurgent',
    actionLabel:
      item.layer === 'regulatory_label'
        ? 'Worth asking a clinician about'
        : 'Common, not an emergency',
    urgent: false,
    denominatorKnown: item.denominatorKnown,
    sources: item.sources,
  }))
  if (delivery?.safetyProfile) {
    entries.unshift({
      text: readerText(delivery.safetyProfile),
      evidenceSource: 'authored_record',
      evidenceSourcePlain: 'Written into the record from the studies named on this page',
      action: 'professional_discussion',
      actionLabel: 'Worth asking a clinician about',
      urgent: false,
      denominatorKnown: false,
      sources: citationsFromProvenance(inputs.legacyRecord?.sourceProvenance).slice(0, 3),
    })
  }
  return {
    state: entries.length ? 'source_checked_draft' : 'no_qualifying_evidence',
    entries,
    spontaneous: v3.safety.spontaneous,
    longTerm: v3.safety.longTerm,
    underrepresented: v3.safety.underrepresented,
  }
}

/* ----------------------------------------------------------------- stack */

const INTERACTION_STATE_BY_TIER: Record<string, InteractionState> = {
  A: 'documented_important',
  B: 'documented_manageable',
  C: 'plausible_mechanistic',
}

function buildStack(inputs: DossierV4Inputs, v3: DossierV3ViewModel): DossierV4ViewModel['stack'] {
  const entries: StackEntry[] = v3.interactions.rows.slice(0, 24).map((row) => {
    const state =
      INTERACTION_STATE_BY_TIER[
        inputs.corpus.interactions.lines.find((line) => line.line === row.text)?.tier ?? ''
      ] ?? 'insufficient_information'
    return {
      entityA: v3.name,
      entityB: row.counterpart,
      consequence: row.text,
      state,
      stateLabel: row.categoryLabel,
      evidenceClass: row.evidenceLabel,
      context:
        'Recorded from a label or a published study, not from a study of this exact pair in you.',
      checkedOn: v3.interactions.date ?? 'date not recorded',
      missingInformation:
        'Amount, timing and the other things a person takes are not recorded for this pair.',
      clinicianQuestion: `Ask: does taking ${row.counterpart} alongside ${v3.name} change anything for me?`,
      sources: row.sourceUrl
        ? [{ label: 'Recorded source', url: row.sourceUrl, binding: 'record' as const }]
        : [],
      ...(row.counterpartSlug ? { counterpartSlug: row.counterpartSlug } : {}),
    }
  })
  return {
    state: entries.length ? 'source_checked_draft' : 'no_qualifying_evidence',
    entries,
    absenceLine: v3.interactions.statement,
    neverSafeLine: v3.interactions.notSafeSentence,
    localOnly: COMPASS_COPY.stackLocal,
  }
}

/* ------------------------------------------------------------ form check */

/**
 * The corpus relation vocabulary, mapped to the typed identity relations the compass renders.
 *
 * Two things to know. The corpus stores its own kinds and the loader replaces any stored label with
 * its own words, so this map is keyed on what the loader emits and not on what a fixture writes.
 * An earlier version keyed on labels such as "Salt of" that the corpus never produces, which sent
 * every relation to the unconfirmed default without anyone noticing.
 *
 * And nothing in this vocabulary carries evidence. Every kind here names a substance that is
 * related to this one and is not this one: a different stereoisomer, a different ester, a component
 * of a mixture, something that happens to hit the same target. Only a confirmed same-substance link
 * transfers a result, and the corpus has no kind that asserts one.
 */
const RELATION_MAP: Record<string, IdentityRelation> = {
  'ester of': 'possibly_matches',
  'prodrug of': 'prodrug_of',
  'stereoisomer of': 'isomer_of',
  'racemate of': 'isomer_of',
  'biosimilar of': 'possibly_matches',
  contains: 'component_of',
  'isotopologue of': 'possibly_matches',
  'same target as': 'explicitly_not_equivalent_to',
  'shares an enzyme with': 'explicitly_not_equivalent_to',
  'form of': 'formulation_of',
  'related form of': 'formulation_of',
  'ionised form of': 'formulation_of',
  'component of': 'component_of',
  'active moiety of': 'active_ingredient_of',
  'same structure as': 'possibly_matches',
  'originator of': 'possibly_matches',
  'parent of': 'possibly_matches',
}

function buildFormCheck(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
): DossierV4ViewModel['formCheck'] {
  const delivery = inputs.legacyRecord?.deliverySystem
  const entries: FormEntry[] = inputs.corpus.relations.slice(0, 20).map((relation) => {
    const code = RELATION_MAP[relation.label.trim().toLowerCase()] ?? 'possibly_matches'
    const carries = identityRelationCarriesEvidence(code)
    return {
      relation: code,
      relationLabel: relation.label,
      carriesEvidence: carries,
      counterpart: relation.name,
      ...(relation.slug ? { counterpartSlug: relation.slug } : {}),
      note: carries
        ? 'Evidence on this page applies to this name too.'
        : 'Evidence on this page does not automatically apply to this one.',
    }
  })
  /*
   * One entry per reason, not one per row.
   *
   * A single identity repair writes a row for each thing it touched: the creatine record carries
   * six rows that share one sentence, and rendering them separately printed that 31-word
   * explanation five times in a row. The subjects are listed together instead.
   */
  const byReason = new Map<string, { when: string; subjects: string[]; why: string }>()
  for (const correction of inputs.corrections) {
    if (correction.subjectKind === 'page') continue
    const existing = byReason.get(correction.reason)
    const subject = `${correction.action.replace(/_/g, ' ')}: ${correction.subjectRef}`
    if (existing) {
      existing.subjects.push(subject)
      continue
    }
    byReason.set(correction.reason, {
      when: iso(correction.recordedAt) ?? '',
      subjects: [subject],
      why: correction.reason,
    })
  }
  const corrections = [...byReason.values()].map((entry) => ({
    when: entry.when,
    what: entry.subjects.join('; '),
    why: entry.why,
  }))
  return {
    state: entries.length || corrections.length ? 'source_checked_draft' : 'no_qualifying_evidence',
    exactFormStudied: delivery?.type
      ? statement(
          delivery.type,
          'authored_record',
          'source_checked_draft',
          'The form used in the studies cited on this page.',
        )
      : absentStatement('The exact form studied is not recorded.'),
    exactRouteStudied: delivery?.type
      ? statement(
          delivery.type,
          'authored_record',
          'source_checked_draft',
          'The route recorded for this substance.',
        )
      : absentStatement('The route studied is not recorded.'),
    // Not the first sentences again: "What taking it involves" already shows those, and printing
    // the same paragraph twice on one page wastes the reader's attention and doubles its length.
    marketedForms: remainderAfter(delivery?.description, 2)
      ? statement(
          readerText(remainderAfter(delivery?.description, 2)),
          'authored_record',
          'source_checked_draft',
          'The rest of the recorded notes on which forms are sold and how they compare.',
        )
      : absentStatement('Nothing further is recorded about which forms are sold.'),
    equivalenceEvidence: statement(
      COMPASS_COPY.identityMatters,
      'contract_sentence',
      'source_checked_draft',
      'The rule RNAWiki applies to every identity link on this page.',
    ),
    entries,
    corrections,
  }
}

/* ------------------------------------------------------------ measurement */

function buildMeasurement(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
  identity: IdentityStrip,
  classified: ClassifiedOutcome[],
): DossierV4ViewModel['measurement'] {
  const lowRisk =
    identity.availabilityCode === 'non_prescription' &&
    v3.supervision.level !== 'required' &&
    !inputs.corpus.suppressed &&
    !inputs.corpus.controlled &&
    !inputs.corpus.withdrawn
  if (!lowRisk) {
    return {
      state: 'not_applicable',
      mode: 'clinician_questions',
      reason: v3.measure.reason,
      plan: [],
      whatNotToMeasure: [],
      stopRules: [],
      clinicianQuestions: v3.measure.clinicianQuestions,
      warningSigns: v3.measure.warningSigns,
      boundary: COMPASS_COPY.measurementBoundary,
      noDoseLine: v3.measure.closing,
    }
  }
  const measurable = classified.filter((entry) => entry.experience === 'measured').slice(0, 6)
  const felt = classified.filter((entry) => entry.experience === 'felt').slice(0, 4)
  return {
    state: 'source_checked_draft',
    mode: 'self_experiment',
    reason:
      'This is sold without a prescription, so a person can sensibly watch one thing and see whether it moves.',
    plan: [
      {
        label: 'Pick one goal',
        text: 'One goal only. Two at once cannot be told apart afterwards.',
      },
      {
        label: 'Pick one thing to watch',
        text: measurable.length
          ? `Registered studies measured things like: ${measurable
              .map((entry) => entry.term)
              .slice(0, 3)
              .join('; ')}.`
          : 'No registered study lists a measure RNAWiki could read for this.',
      },
      {
        label: 'Measure before you start',
        text: 'Take the same measurement several times first. One reading is not a starting point.',
      },
      {
        label: 'Know the swing',
        text: 'Write down how much it moves on its own across a normal week.',
      },
      {
        label: 'Change one thing',
        text: 'Change nothing else at the same time, including training and sleep.',
      },
      {
        label: 'Give it the study length',
        text: inputs.roleAggregate?.tested.longestCompletedWindow
          ? `Studies that tested this ran up to ${inputs.roleAggregate.tested.longestCompletedWindow.days} days.`
          : 'No finished study window is recorded, so no length is suggested here.',
      },
      {
        label: 'Track whether you took it',
        text: 'Missed days are the most common reason a home test shows nothing.',
      },
      {
        label: 'Read the trend',
        text: 'Look at the line across weeks. A single reading tells you almost nothing.',
      },
    ],
    whatNotToMeasure: [
      'Anything that swings more day to day than the change you are looking for.',
      'A wearable estimate of sleep stages, which is an estimate and not a measurement.',
      'Weight on one morning, which mostly records water.',
      felt.length
        ? `A feeling you did not write down before starting, such as: ${felt[0]?.term}.`
        : 'A feeling you did not write down before starting.',
    ],
    stopRules: [
      'Stop if something new and unpleasant starts, and ask a pharmacist or doctor.',
      'Stop if you cannot keep everything else steady, because the result will not mean anything.',
      'Stop at the end of the window you set, and read the trend then.',
    ],
    clinicianQuestions: v3.measure.clinicianQuestions,
    warningSigns: v3.measure.warningSigns,
    boundary: COMPASS_COPY.measurementBoundary,
    noDoseLine: COMPASS_COPY.measurementNoDose,
  }
}

/* ---------------------------------------------------------- alternatives */

function buildAlternatives(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
): DossierV4ViewModel['alternatives'] {
  const entries: AlternativeEntry[] = v3.alternatives.groups.slice(0, 8).map((group) => ({
    tier: 'non_prescription_substance' as AlternativeTier,
    tierLabel: 'Something bought without a prescription',
    label: group.label,
    path: group.path,
    outcome: group.hubName,
    humanEvidence: 'Membership of a group, not a comparison of results.',
    burden: 'Not recorded.',
    supervision: 'Not recorded.',
    uncertainty: 'RNAWiki has not compared these against each other for any goal.',
  }))
  entries.unshift({
    tier: 'measure_or_wait',
    tierLabel: 'Measure first, or do nothing yet',
    label: 'Measure first, or change nothing yet',
    outcome: 'The same goal',
    humanEvidence: 'This option is always available and is rarely listed.',
    burden: 'None.',
    supervision: 'None.',
    uncertainty: 'Doing nothing has its own cost, which RNAWiki does not measure either.',
  })
  return {
    state: entries.length > 1 ? 'source_checked_draft' : 'no_qualifying_evidence',
    entries,
    note: v3.alternatives.notComparable,
  }
}

/* --------------------------------------------------------- claim decoder */

function buildClaimDecoder(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
): DossierV4ViewModel['claimDecoder'] {
  const summary = inputs.legacyRecord?.measuredVsInferredSummary
  const unsupported = summary?.unsupportedInferences ?? []
  const provenance = citationsFromProvenance(inputs.legacyRecord?.sourceProvenance)
  const claims: DecodedClaim[] = unsupported.slice(0, 8).map((claim) => ({
    popularClaim: readerText(claim),
    whyPlausible:
      'It follows from something real on this page: a body step, an animal result or a related finding.',
    claimSourceType: 'Recorded in this file as a claim that goes past what was measured.',
    reviewedScope: v3.contract.noReviewedConclusionSentence,
    missingStep:
      'Nobody measured this in people for this use, or the study that did measure it did not show it.',
    position: 'unsupported' as ClaimPosition,
    positionLabel: 'Goes past the evidence',
    whatWouldChangeIt:
      'A study in people, for this exact use, measuring this exact thing, that a reviewer signs off.',
    state: 'source_checked_draft' as SectionState,
    sources: provenance.slice(0, 3),
  }))
  return {
    state: claims.length ? 'source_checked_draft' : 'no_qualifying_evidence',
    claims,
    absence:
      claims.length === 0
        ? 'RNAWiki has not worked through the popular claims about this substance.'
        : '',
  }
}

/* -------------------------------------------------------------- unknowns */

function buildUnknowns(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
): DossierV4ViewModel['unknowns'] {
  const checked = v3.lastEvidenceCheck ?? 'not recorded'
  const fieldGaps = Object.entries(inputs.fields)
    .filter(([, value]) => value.state === 'absent')
    .map(([field]) => field)
  const readable: Record<string, { question: string; matters: string }> = {
    contraindications: {
      question: 'Who should not take this?',
      matters: 'A list of people who should avoid it is the first thing a careful reader wants.',
    },
    kinetics: {
      question: 'How fast does the body clear it?',
      matters: 'Without this, nothing on this page can say how long anything lasts.',
    },
    doseStudied: {
      question: 'How much did people take in the studies?',
      matters: 'A result belongs to an amount. Without the amount the result floats free.',
    },
    cyp_profile: {
      question: 'Which liver enzymes handle it?',
      matters: 'This is how most clashes with other substances are predicted.',
    },
    boxedWarning: {
      question: 'Is there a regulator warning?',
      matters: 'A regulator warning is the strongest safety signal there is.',
    },
    potency: {
      question: 'How strongly does it act on its target?',
      matters: 'It sets whether a realistic amount could do anything at all.',
    },
  }
  const entries: UnknownEntry[] = fieldGaps
    .filter((field) => field in readable)
    .map((field) => ({
      question: readable[field]?.question ?? '',
      reason: 'The sources RNAWiki checked hold nothing for this field.',
      whyItMatters: readable[field]?.matters ?? '',
      affects: 'Everyone reading this page.',
      evidenceNeeded: 'A stored source that records it, and a reviewer to sign it off.',
      lastChecked: checked,
      searchScope: 'The sources listed in the receipts at the foot of this page.',
      state: 'no_qualifying_evidence' as SectionState,
    }))
  for (const unknown of v3.unknowns.slice(0, 6)) {
    entries.push({
      question: unknown.label,
      reason: unknown.text,
      whyItMatters: 'Recorded by the evidence model as a gap on this record.',
      affects: 'Everyone reading this page.',
      evidenceNeeded: 'A study that measures it, and a reviewer to sign it off.',
      lastChecked: checked,
      searchScope: 'The sources listed in the receipts at the foot of this page.',
      state: 'no_qualifying_evidence',
    })
  }
  return { state: entries.length ? 'source_checked_draft' : 'not_applicable', entries }
}

/* -------------------------------------------------------------- receipts */

function buildReceipts(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
): DossierV4ViewModel['receipts'] {
  const audits = inputs.legacyRecord?.keyAudits ?? []
  const entries: ReceiptEntry[] = audits.slice(0, 20).map((audit: AuditPoint) => {
    const nct = /NCT\d{8}/.exec(`${audit.title} ${audit.technicalDetails}`)?.[0]
    const role = nct ? inputs.roleAggregate?.rows.find((row) => row.nctId === nct) : undefined
    return {
      id: audit.id,
      plainConclusion: audit.laymanSummary,
      structuredClaim: audit.title,
      measuredMetric: audit.measuredMetric ?? audit.inferredClaim ?? 'Not recorded',
      effectEstimate: 'No reviewed effect estimate exists for this record.',
      limitations:
        audit.category === 'failed' ? 'This entry records a failure.' : 'See the technical detail.',
      sourceExcerpt: audit.technicalDetails,
      sourceReference: audit.evidenceSource,
      ...(audit.doi ? { doi: audit.doi } : {}),
      trialRole: role
        ? role.role === 'experimental_intervention'
          ? 'This study tested this substance'
          : 'This study did not clearly test this substance'
        : 'Not matched to a registered study',
      entityResolution:
        v3.indexQuality.find((check) => check.check === 'identity_passed')?.detail ??
        'Not recorded',
      auditFlag: audit.auditFlag ?? 'not recorded',
      reviewState: 'Written into the record, not signed off as a reviewed claim',
      origin: 'authored_record' as StatementOrigin,
    }
  })
  return {
    state: entries.length ? 'source_checked_draft' : 'no_qualifying_evidence',
    entries,
    note: 'Every line above can be traced to the study named beside it. Follow the link and read it.',
  }
}

/* ----------------------------------------------------------------- story */

function buildStory(inputs: DossierV4Inputs): DossierV4ViewModel['story'] {
  const years = fieldValue(inputs, 'publicationYears') as
    { firstYear?: number; lastYear?: number; documentCount?: number } | undefined
  const entries: Array<{ when: string; what: string; changesToday: boolean }> = []
  if (years?.firstYear) {
    entries.push({
      when: String(years.firstYear),
      what: 'The earliest stored study RNAWiki holds for this substance.',
      changesToday: false,
    })
  }
  for (const event of inputs.corpus.registerEvents.slice(0, 6)) {
    entries.push({ when: '', what: event.sentence, changesToday: true })
  }
  if (years?.lastYear) {
    entries.push({
      when: String(years.lastYear),
      what: `The most recent stored study. RNAWiki holds ${years.documentCount ?? 0} in total.`,
      changesToday: false,
    })
  }
  return { state: entries.length ? 'source_checked_draft' : 'no_qualifying_evidence', entries }
}

/* --------------------------------------------------------- next question */

/**
 * Deterministic ranking. The objective order is fixed by the brief: prevent a misunderstanding
 * first, then surface a result, then safety, then a population mismatch, then the evidence
 * boundary, then an unknown, then deeper learning. Nothing here counts clicks.
 */
function buildNextQuestions(model: Omit<DossierV4ViewModel, 'nextQuestions'>): NextQuestion[] {
  const candidates: NextQuestion[] = []
  const push = (question: string, target: string, objective: string, rank: number): void => {
    candidates.push({ question, target, objective, rank })
  }
  if (model.claimDecoder.claims.length > 0) {
    push(
      'Which popular claims about this go past the evidence?',
      '#claim-decoder',
      'Prevent a misunderstanding',
      1,
    )
  }
  if (model.humanResults.cards.some((card) => card.verdict !== 'met')) {
    push(
      'Which studies of this failed, and what did they measure?',
      '#human-results',
      'Surface a meaningful outcome',
      2,
    )
  }
  if (model.safety.entries.length > 0) {
    push('What has gone wrong for people taking this?', '#safety', 'Reveal safety', 3)
  }
  if (model.applicability.transferLimits.length > 0) {
    push(
      'Were people like me actually studied?',
      '#applicability',
      'Reveal a population mismatch',
      4,
    )
  }
  push(
    'How close is this evidence to something I would notice?',
    '#evidence-staircase',
    'Reveal the evidence boundary',
    5,
  )
  if (model.unknowns.entries.length > 0) {
    push('What does nobody know about this yet?', '#unknowns', 'Reveal an important unknown', 6)
  }
  if (model.concepts.length > 0) {
    const first = model.concepts[0]
    if (first)
      push(
        `What is a ${first.term.toLowerCase()}?`,
        '#substance-action',
        'Support deeper learning',
        7,
      )
  }
  return candidates.sort((left, right) => left.rank - right.rank).slice(0, 5)
}

/* ----------------------------------------------------------------- gates */

function buildGates(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
  model: { formCheck: DossierV4ViewModel['formCheck']; hero: ActionHero },
): DossierV4ViewModel['gates'] {
  const check = (code: string): { passed: boolean; detail: string } => {
    const entry = v3.indexQuality.find((item) => item.check === code)
    return { passed: entry?.passed ?? false, detail: entry?.detail ?? 'Not checked.' }
  }
  const identity = check('identity_passed')
  const contamination = check('no_critical_contamination')
  const internal = check('no_raw_internal_fields')
  const canonical = check('canonical_metadata_passed')
  const testedRoles = (inputs.roleAggregate?.tested.studies ?? 0) > 0
  return [
    { code: 'identity_passed', label: 'Identity resolved', ...identity },
    {
      code: 'no_cross_family_merge',
      label: 'No unresolved merge across substance families',
      ...contamination,
    },
    {
      code: 'claim_provenance_present',
      label: 'Every public sentence names a source',
      passed: model.hero.simpleAction.origin !== 'absent',
      detail:
        model.hero.simpleAction.origin === 'absent'
          ? 'The opening statement has no source and would render as an absence.'
          : `The opening statement carries the origin: ${ORIGIN_LABELS[model.hero.simpleAction.origin]}.`,
    },
    {
      code: 'trial_roles_valid',
      label: 'Trial roles classified for highlighted evidence',
      passed: testedRoles,
      detail: testedRoles
        ? `${inputs.roleAggregate?.tested.studies} registered studies are classified as testing this substance.`
        : 'No registered study is classified as testing this substance.',
    },
    { code: 'no_raw_internal_fields', label: 'No internal keys in reader text', ...internal },
    {
      code: 'safety_mode_valid',
      label: 'Safety mode resolved',
      passed: v3.supervision.level !== 'unknown',
      detail: v3.supervision.basis,
    },
    { code: 'canonical_metadata_valid', label: 'Canonical metadata present', ...canonical },
  ]
}

/* ------------------------------------------------------------------ build */

export function buildDossierV4(inputs: DossierV4Inputs): DossierV4ViewModel {
  const v3 = buildDossierV3(inputs)
  const identity = buildIdentity(inputs, v3)
  const hero = buildHero(inputs, v3, identity)

  const biomarkerTerms = ((fieldValue(inputs, 'biomarkers') as { terms?: string[] } | undefined)
    ?.terms ?? []) as string[]
  const classified = classifyOutcomeTerms(biomarkerTerms)

  const fingerprint = buildFingerprint(inputs, v3, classified)
  const humanResults = buildHumanResults(inputs, v3)
  const staircase = buildStaircase(inputs, v3, classified)
  const journey = buildJourney(inputs, v3)
  const experience = buildExperience(classified)
  const timeline = buildTimeline(inputs, v3)
  const applicability = buildApplicability(inputs, v3)
  const noResponse = buildNoResponse(inputs, v3, classified)
  const practical = buildPractical(inputs, v3, identity)
  const safety = buildSafety(inputs, v3)
  const stack = buildStack(inputs, v3)
  const formCheck = buildFormCheck(inputs, v3)
  const measurement = buildMeasurement(inputs, v3, identity, classified)
  const alternatives = buildAlternatives(inputs, v3)
  const claimDecoder = buildClaimDecoder(inputs, v3)
  const unknowns = buildUnknowns(inputs, v3)
  const receipts = buildReceipts(inputs, v3)
  const story = buildStory(inputs)

  const concepts = conceptsForPage({
    showsBiomarker: classified.some((entry) => entry.outcomeClass === 'biomarker_surrogate'),
    showsConfidenceInterval: humanResults.cards.some(
      (card) => card.confidenceInterval !== 'Not recorded in this summary',
    ),
    showsAnimalEvidence: staircase.rungs.some((rung) => rung.level === 'animal' && rung.filled),
    showsInteraction: stack.entries.length > 0,
    showsFormulationDifference: formCheck.entries.length > 0,
    isRnaMedicine: v3.substanceType.code === 'rna_medicine',
    showsRandomisedTrial: humanResults.cards.some((card) => /random/i.test(card.studyDesign)),
  })

  const community: DossierV4ViewModel['community'] = {
    state: 'feature_not_enabled',
    reports: [],
    categories: [],
    separationLine: COMPASS_COPY.communitySeparation,
    noImportLine: COMPASS_COPY.communityNoImport,
    qualitySignals: [
      'completeness',
      'identity certainty',
      'context',
      'follow-up',
      'confounder disclosure',
      'objective and subjective kept apart',
    ],
  }

  const partial = {
    version: 4 as const,
    slug: v3.slug,
    name: v3.name,
    identity,
    pagePromise: COMPASS_COPY.pagePromise,
    hero,
    concepts,
    fingerprint,
    humanResults,
    staircase,
    journey,
    experience,
    timeline,
    applicability,
    noResponse,
    practical,
    safety,
    stack,
    formCheck,
    measurement,
    alternatives,
    claimDecoder,
    community,
    unknowns,
    receipts,
    story,
    changes: {
      state: (v3.changes.length
        ? 'source_checked_draft'
        : 'no_qualifying_evidence') as SectionState,
      // One entry per distinct explanation. A single identity repair writes a row for each thing
      // it touched, and the creatine record's six rows share one 31-word sentence that read six
      // times over on the page. The subjects are listed together and the sentence appears once.
      entries: groupChangesByReason(v3.changes),
    },
    sections: [] as SectionMeta[],
    gates: [] as DossierV4ViewModel['gates'],
    v3,
    notAdvice: COMPASS_COPY.notAdvice,
    notForChildren: COMPASS_COPY.notForChildren,
  }

  const stateById: Record<string, SectionState> = {
    'substance-action': hero.state,
    'goal-fingerprint': fingerprint.state,
    'human-results': humanResults.state,
    'evidence-staircase': staircase.state,
    'body-journey': journey.state,
    'felt-measured-meaningful': experience.state,
    'signal-timeline': timeline.state,
    applicability: applicability.state,
    'no-response': noResponse.state,
    'practical-reality': practical.state,
    safety: safety.state,
    stack: stack.state,
    'form-check': formCheck.state,
    measurement: measurement.state,
    alternatives: alternatives.state,
    'claim-decoder': claimDecoder.state,
    community: community.state,
    unknowns: unknowns.state,
    'evidence-receipts': receipts.state,
    'drug-story': story.state,
    'change-history': partial.changes.state,
    'next-question': 'source_checked_draft',
  }

  const sections: SectionMeta[] = COMPASS_SECTIONS.map((section) => {
    const state = stateById[section.id] ?? 'pipeline_failure'
    return {
      ...section,
      state,
      reason: `${sectionStateLabel(state)}. ${sectionReason(section.id, state)}`,
    }
  })

  const gates = buildGates(inputs, v3, { formCheck, hero })
  const model: DossierV4ViewModel = {
    ...partial,
    sections,
    gates,
    nextQuestions: [],
  }
  model.nextQuestions = buildNextQuestions(model)
  return model
}

/**
 * Collapse change rows that carry the same explanation. v3 composes each row as
 * "<subject>: <reason>", so the reason is the tail after the first colon; rows that share one are
 * merged and their subjects joined.
 */
function groupChangesByReason(
  changes: DossierV3ViewModel['changes'],
): DossierV3ViewModel['changes'] {
  const grouped = new Map<
    string,
    { entry: DossierV3ViewModel['changes'][number]; subjects: string[] }
  >()
  for (const change of changes) {
    const split = change.text.indexOf(': ')
    const subject = split > 0 ? change.text.slice(0, split) : ''
    const reason = split > 0 ? change.text.slice(split + 2) : change.text
    const key = `${change.when}|${change.kind}|${reason}`
    const existing = grouped.get(key)
    if (existing) {
      if (subject) existing.subjects.push(subject)
      continue
    }
    grouped.set(key, { entry: { ...change, text: reason }, subjects: subject ? [subject] : [] })
  }
  return [...grouped.values()].map(({ entry, subjects }) => ({
    ...entry,
    text: subjects.length > 0 ? `${subjects.join('; ')}. ${entry.text}` : entry.text,
  }))
}

function sectionReason(id: string, state: SectionState): string {
  if (state === 'reviewed_content') return 'A reviewer signed this off.'
  if (state === 'source_checked_draft')
    return 'Built from stored sources by fixed rules, with each source named.'
  if (state === 'no_qualifying_evidence')
    return 'The sources RNAWiki checked held nothing for this section.'
  if (state === 'feature_not_enabled')
    return 'The part of RNAWiki that fills this in is built but not switched on.'
  if (state === 'not_applicable') return 'This question does not apply to this substance.'
  if (state === 'awaiting_review') return 'A draft exists and has not been signed off.'
  return `Section ${id} could not be prepared.`
}
