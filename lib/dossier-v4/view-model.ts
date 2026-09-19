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
import { PUBLIC_IDENTITY_PROTECTIONS } from '@/lib/inventory/public-identity-protections'
import type { SourceCitation } from '@/lib/dossier-v3/fields'
import { trialRoleSupportsTestedClaim } from '@/lib/dossier-v3/taxonomy'
import {
  buildDossierV3,
  type DossierV3Inputs,
  type DossierV3ViewModel,
} from '@/lib/dossier-v3/view-model'
import {
  EMPTY_PAGE_REVIEW_SUMMARY,
  statementReviewNote,
  type ActivePageStatement,
  type PageReviewSummary,
  type PageStatementHistoryEntry,
  type PageStatementOverlay,
} from '@/lib/page-statements/overlay'
import type { PageStatementKey } from '@/lib/page-statements/types'
import { assessRecordSubstance, type RecordSubstance } from './indexability'
import { recordedFactsFor, type RecordedFact, type RecordedFacts } from './recorded-facts'
import { recordedLabelFor, type LabelSentence, type RecordedLabel } from './recorded-label'
import type { BoundLegacyTenSecondAnswer } from '@/lib/ten-second-answer-overrides'
import type { AuditPoint, ClinicalTrialRecord, DrugDossier, MechanismStep } from '@/lib/types'

import { conceptsForPage, type Concept } from './concepts'
import {
  decidePublicationState,
  readableCheckDate,
  type PublicationDecision,
} from './publication-state'
import { humaniseReaderList, readerText } from './reader-text'
import {
  classifySubstance,
  planningEligibleType,
  type AvailabilityState,
  type SubstanceTypeV4,
  type SupervisionLevelV4,
} from './substance'
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
  /**
   * Wordings three members approved, keyed by the sentence they replace. This is the layer that
   * lets an approved revision reach a reader without a deployment: the page reads it per request.
   * Absent on a page with no community wording, which is every page until one is approved.
   */
  statementOverlay?: PageStatementOverlay | undefined
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
  contract_sentence: "RNAWiki's own standing wording",
  absent: 'Nothing recorded',
}

/**
 * The short form that sits beside a sentence.
 *
 * The long sentence below used to render under every statement on the page, four or five times on
 * a first screen, which trained a reader to stop seeing it. The short form stays; the long form
 * moved one click away into the disclosure that already carries the provenance.
 */
export const ORIGIN_SHORT: Record<StatementOrigin, string> = {
  reviewed_claim: 'Reviewed conclusion',
  approved_first_read: 'Reviewed first-read answer',
  authored_record: 'Source-linked record',
  stored_source: 'Quoted from a source',
  derived_count: 'Counted from records',
  contract_sentence: 'RNAWiki wording',
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

/**
 * Swap in a wording three members approved, without changing what the page claims about evidence.
 *
 * The replacement takes the text and the origin. It deliberately does NOT take the evidence state:
 * `base.state` travels through untouched, so a sentence describing an animal result still reads as
 * an animal result after it has been reworded, and a draft does not become a reviewed conclusion by
 * being approved three times. The sources stay as they were, because the sentence still rests on
 * them; a reviewer who wanted to change the sources was proposing a different thing.
 */
function withApprovedWording(base: Statement, active: ActivePageStatement | undefined): Statement {
  if (!active) return base
  /*
   * The origin is not changed, and that is the point.
   *
   * There used to be a `community_reviewed` origin that rendered beside the sentence as "Community
   * approved". It read as a verdict on the medicine when it was a verdict on a phrasing, and a
   * reader with no reason to know the difference would take "Community approved" on a drug page to
   * mean the drug had been approved by somebody. Three people agreeing on how to say a thing does
   * not change what the thing rests on, so the sentence keeps the origin of the evidence underneath
   * it — a quoted source stays quoted, an unreviewed record stays unreviewed.
   *
   * The approval is not hidden. It is written into the basis, which the provenance disclosure under
   * every statement prints, and into the page's change history, where a reader can see the wording
   * that was replaced and why.
   */
  return {
    ...base,
    text: active.text,
    /*
     * One exception to keeping the base origin: a slot that held nothing.
     *
     * The hero skips a statement whose origin is `absent`, which is right when there is nothing to
     * say and wrong the moment somebody writes something. Keeping `absent` here would have taken a
     * wording three people signed and rendered it nowhere. `authored_record` is what it now is — a
     * sentence a person wrote into the record — and it deliberately claims less than the truth: its
     * plain-language note says no reviewer has signed it off, which stays accurate, because what
     * was approved was the phrasing and not the claim.
     */
    ...(base.origin === 'absent' ? { origin: 'authored_record' as StatementOrigin } : {}),
    basis: `${active.approvals} members approved this wording against the same sources on ${active.publishedAt}. The evidence behind it is unchanged: ${base.basis}`,
  }
}

/** The short review line beside a sentence, or nothing when no community wording applies. */
export function statementReviewLine(active: ActivePageStatement | undefined): string | null {
  return statementReviewNote(active)
}

/* ---------------------------------------------------------------- sections */

export interface SectionMeta {
  id: string
  /**
   * Whether this section appears in the navigator. A section that found nothing and carries no
   * uncertainty worth reading is dropped from the rail rather than offered as an empty link.
   */
  inNavigator: boolean
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
export const COMPASS_SECTIONS: ReadonlyArray<
  Omit<SectionMeta, 'state' | 'reason' | 'inNavigator'>
> = [
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
  /** What kind of substance this is, resolved independently of how it is supplied. */
  substanceType: string
  substanceTypeCode: SubstanceTypeV4
  substanceTypeBasis: string
  /** How it is supplied, and in which jurisdictions that was recorded. */
  availability: string
  availabilityCode: AvailabilityState
  availabilityBasis: string
  supervision: SupervisionLevelV4
  jurisdictions: string[]
  identityVerified: boolean
  identityLabel: string
  identityBasis: string
  /** Only ever a date. A field-state label is not shown here. */
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
  resultScope: { goal: string; population: string; comparator: string; duration: string } | null
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
  /** How much this page is allowed to say. One decision, made in one place. */
  publication: PublicationDecision
  identity: IdentityStrip
  /**
   * What the substance registries record about what this is and where it comes from. Counts, names
   * and classifications read out of public registers — never a description of the substance.
   */
  recordedIdentity: RecordedFact[]
  /**
   * The older medicine-wide conclusion held in the curated record, word for word, or null.
   *
   * 489 records carry one. It is written for a clinical reader and is deliberately not what the
   * page leads with — a sentence about phosphocreatine resynthesis and Phase 3 trial counts is not
   * a first read. But it is stored, it is a conclusion somebody wrote and stands behind, and it was
   * reaching no page at all. It belongs in the technical layer, labelled as what it is: medicine-
   * wide rather than scoped to one programme, and therefore not a programme conclusion.
   */
  recordedVerdict: string | null
  pagePromise: string
  /**
   * What the small review control shows. Viewer-independent by design: `/d/<slug>` is one document
   * served identically to everybody, and a count that varied by session would end that.
   */
  reviewSummary: PageReviewSummary
  /** How much this record actually holds, and what is missing. */
  substance: RecordSubstance
  /** The registers and databases this record was looked for in, named for a reader. */
  searchedRegisters: string[]
  /** Sentences on this page carrying a wording members approved. */
  approvedWordings: ActivePageStatement[]
  /** Wordings members replaced, newest first, for the public "What changed" section. */
  wordingHistory: PageStatementHistoryEntry[]
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
    /** Results from the one trial this record names, quoted as published. */
    namedTrial: RecordedFact[]
    state: SectionState
    cards: HumanResultCard[]
    registry: DossierV3ViewModel['doesItWork']['registry']
    absence: string
    truth: TruthTerms
  }
  staircase: { state: SectionState; rungs: StaircaseRung[]; caveat: string }
  journey: {
    /** Where a source records it acting, by region, with the action quoted. */
    anatomy: RecordedFact[]
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
    /** Who a named study recorded including and excluding. */
    studyPopulation: RecordedFact[]
    included: string[]
    excluded: string[]
    underrepresented: string[]
    transferLimits: string[]
    includedLine: string
    cannotSayLine: string
    /** What a label states about a named group of people, quoted. */
    populations: RecordedFact[]
  }
  noResponse: { state: SectionState; entries: NoResponseEntry[]; note: string }
  practical: {
    state: SectionState
    /** How the amount was stepped in a protocol or on a label. Never advice. */
    titration: RecordedFact[]
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
    /** Older free-text harm prose exists but has no claim-level source binding. */
    unverifiedLegacySafety: boolean
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
    corrections: Array<{ when: string; what: string; why: string; fullReason: string }>
    /** What the product directories and label archives record about how it is supplied. */
    supply: RecordedFact[]
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
  unknowns: { state: SectionState; entries: UnknownEntry[] }
  receipts: {
    state: SectionState
    entries: ReceiptEntry[]
    note: string
    /** How many documents were read, and where they agreed. */
    corroboration: RecordedFact[]
    /** Register identifiers, so a reader can find the same substance in the same registers. */
    identifiers: Array<{ label: string; value: string }>
  }
  story: {
    state: SectionState
    entries: Array<{ when: string; what: string; changesToday: boolean }>
    /** What the approval registers record: applications, sponsors, dates, marketing status. */
    regulatory: RecordedFact[]
  }
  changes: {
    state: SectionState
    entries: Array<DossierV3ViewModel['changes'][number] & { fullText: string }>
  }
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

/**
 * Split recorded prose into what the reader layer shows and what waits behind the disclosure.
 *
 * The house rule is that a sentence in the default reader layer stays under thirty words. Some
 * recorded prose does not: the note on which creatine forms are sold runs to forty-one words in one
 * sentence, and the Tribulus correction explains itself in thirty-one. Neither may be rewritten
 * here — nothing in this rebuild rewrites a medicine sentence — so the reader layer takes whole
 * sentences up to the limit and the rest is kept, word for word, one click away.
 *
 * When even the first sentence is over the limit it is still shown, because a truncated medical
 * sentence is worse than a long one, and `overLimit` marks it for the operator queue.
 */
export interface ReaderSplit {
  lead: string
  rest: string
  overLimit: boolean
}

export function splitForReader(text: string | undefined, limit = 30): ReaderSplit {
  if (!text) return { lead: '', rest: '', overLimit: false }
  const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [text]
  const lead: string[] = []
  let index = 0
  for (; index < sentences.length; index += 1) {
    const sentence = sentences[index] ?? ''
    if (lead.length > 0 && words(sentence) > limit) break
    lead.push(sentence)
    if (words(sentence) > limit) {
      index += 1
      break
    }
  }
  const leadText = lead.join('').trim()
  return {
    lead: leadText,
    rest: sentences.slice(index).join('').trim(),
    overLimit: lead.some((sentence) => words(sentence) > limit),
  }
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

/**
 * The identity strip: what this is, how it is supplied, whether we trust the identity, and when the
 * sources were last checked.
 *
 * The substance type and the availability come from `lib/dossier-v4/substance.ts`, which resolves
 * them as two independent answers. The previous version read one string and called every
 * non-prescription substance an over-the-counter medicine.
 */
function buildIdentity(inputs: DossierV4Inputs, v3: DossierV3ViewModel): IdentityStrip {
  const legacy = inputs.legacyRecord
  const corpus = inputs.corpus
  const classification = classifySubstance({
    modality: legacy?.modality ?? inputs.legacy?.modality ?? null,
    approvalStatus: legacy?.approvalStatus ?? inputs.legacy?.approvalStatus ?? null,
    entityClass: inputs.legacy?.entityClass ?? null,
    displayName: v3.name,
    synonyms: corpus.synonyms.flatMap((group) => group.names).slice(0, 12),
    controlled: corpus.controlled,
    withdrawn: corpus.withdrawn,
    suppressed: corpus.suppressed,
    supervisionClasses: corpus.suppressionClasses,
    registeredJurisdictions: [
      ...new Set(corpus.registration.map((row) => row.jurisdiction).filter(Boolean)),
    ],
    routes: legacy?.deliverySystem?.type ? [legacy.deliverySystem.type] : [],
  })
  const identityCheck = v3.indexQuality.find((check) => check.check === 'identity_passed')
  const knownIdentityConflict = Object.prototype.hasOwnProperty.call(
    PUBLIC_IDENTITY_PROTECTIONS,
    corpus.slug,
  )
  return {
    canonicalName: v3.name,
    substanceType: classification.typeLabel,
    substanceTypeCode: classification.type,
    substanceTypeBasis: classification.typeBasis,
    availability: classification.availabilityLabel,
    availabilityCode: classification.availability,
    availabilityBasis: classification.availabilityBasis,
    supervision: classification.supervision,
    jurisdictions: classification.jurisdictions,
    identityVerified: knownIdentityConflict ? false : (identityCheck?.passed ?? false),
    identityLabel: knownIdentityConflict
      ? 'Identity correction in progress'
      : identityCheck?.passed
        ? 'Identity checked'
        : 'Identity not confirmed',
    identityBasis: knownIdentityConflict
      ? 'An earlier identity merge mapped this compound to a different substance. The record is not verified while that error is being corrected.'
      : (identityCheck?.detail ?? 'RNAWiki has not run the identity check on this record.'),
    // Only a value that looks like a date is shown as one.
    lastSubstantiveReview: readableCheckDate(v3.lastEvidenceCheck),
  }
}

/* ----------------------------------------------------------------- hero */

/**
 * The one limit the first screen carries.
 *
 * Taking the first recorded failure put an animal-to-human translation result about motor neurone
 * disease at the top of the creatine page — true, important, and the wrong thing to hand a reader
 * who came about strength. A limit earns the opening screen by bearing on what the page leads with:
 * the chance it does nothing for the person reading, then a claim that goes further than the
 * evidence, then a programme that failed. A result that failed to carry from animals to people is
 * ranked last here; it belongs in the evidence limits and the claim decoder, which both show it.
 */
function selectPrincipalLimit(
  measured: DrugDossier['measuredVsInferredSummary'] | undefined,
): string | undefined {
  if (!measured) return undefined
  const animalTranslation = /\b(?:mouse|mice|rat|transgenic|animal-to-human|animal to human)\b/i
  const isLimitation =
    /\b(?:did not|do not|does not|no benefit|no effect|not|failed|halted|only)\b/i

  const personalLimit = (measured.realWorldOutcome ?? []).find(
    (line) => isLimitation.test(line) && !animalTranslation.test(line),
  )
  if (personalLimit) return personalLimit

  const overreach = (measured.unsupportedInferences ?? []).find(
    (line) => !animalTranslation.test(line),
  )
  if (overreach) return overreach

  const failure = (measured.whatFailedInitially ?? []).find((line) => !animalTranslation.test(line))
  if (failure) return failure

  return measured.whatFailedInitially?.[0] ?? measured.unsupportedInferences?.[0]
}

/**
 * Choose the sentence that opens the page.
 *
 * The old rule was "the first sentence of the recorded explanation", which is how creatine came to
 * open on a transporter and how four medicines came to open with label pharmacology: "Etrasimod has
 * minimal activity on S1P 3 (25-fold lower than C max at the recommended dose)". That is not a
 * beginner explanation, and the phrase "at the recommended dose" has no business in the opening
 * paragraph of a page that never names an amount.
 *
 * So a sentence has to earn the opening position. It must stand on its own, stay short, name no
 * amount, and not be a wall of undefined abbreviations. Among those that qualify, one that
 * describes a useful change beats one that describes absorption, which is the order the brief
 * fixes: what it changes, then why a person cares, then where, then the mechanism.
 *
 * When nothing qualifies the page opens with why people take it instead, and the recorded
 * explanation follows underneath. Nothing is rewritten and nothing is invented; what changes is
 * which recorded sentence a reader meets first.
 */
const DOSE_LANGUAGE =
  /\b(?:recommended dose|dose levels?|\d+\s?(?:mg|mcg|g|ml|iu)\b|titrat|mg\/kg)/i
/** Unexplained technical tokens: receptor and gene codes, laboratory shorthand, units. */
const HEAVY_JARGON =
  /\b(?:[A-Z]{2,}\d[A-Za-z]?|C\s?max|AUC|IC50|EC50|Ki\b|nM|µM|mmol|micromol|pharmacokinetic|bioavailability)\b/
/** A sentence that leans on the one before it cannot be the first a reader meets. */
const REFERRING_OPENER =
  /^(?:inside|then|there|this|that|it |its |these|those|during|over |after |afterwards|meanwhile|as a result|the result|so |and |but |however|also|additionally|in turn|by contrast|unlike|because|when |once )/i
/** Words that describe a change worth caring about rather than a journey into the body. */
const USEFUL_CHANGE =
  /\b(?:help|helps|keep|keeps|lower|lowers|reduce|reduces|increase|increases|improve|improves|block|blocks|stop|stops|prevent|prevents|slow|slows|raise|raises|calm|calms|protect|protects|clear|clears|refill|refills|restore|restores)\b/i
/** Words that describe getting in rather than doing something. */
const DELIVERY_ONLY =
  /\b(?:absorb|absorbed|swallow|swallowed|survives the gut|reaches the blood|enters the blood|transporter|injected into)\b/i

interface ActionSentenceChoice {
  text: string | null
  /** Why nothing qualified, for the operator queue and the page's own basis line. */
  reason: string
}

function selectActionSentence(explanation: string | undefined): ActionSentenceChoice {
  if (!explanation?.trim()) {
    return { text: null, reason: 'No plain explanation of what this changes is stored.' }
  }
  const sentences = (explanation.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [explanation]).map((sentence) =>
    sentence.trim(),
  )
  let rejectedForJargon = 0
  let rejectedForDose = 0
  const qualified: Array<{ text: string; score: number }> = []
  for (const sentence of sentences) {
    if (DOSE_LANGUAGE.test(sentence)) {
      rejectedForDose += 1
      continue
    }
    if (HEAVY_JARGON.test(sentence)) {
      rejectedForJargon += 1
      continue
    }
    if (REFERRING_OPENER.test(sentence)) continue
    if (words(sentence) > 25 || words(sentence) < 4) continue
    /*
     * The opening line has to answer "what useful change does this make?". A sentence that
     * describes only how the substance travels does not answer it, however short and well written
     * it is: creatine opening on a dedicated transporter, and semaglutide on a hormone being
     * destroyed within minutes, are both true and both the wrong first thing to read. Where no
     * recorded sentence describes a change, the page opens with what people take it for, which is
     * the user value the record does hold.
     */
    if (!USEFUL_CHANGE.test(sentence)) continue
    let score = 3
    if (DELIVERY_ONLY.test(sentence)) score -= 2
    if (words(sentence) <= 18) score += 1
    qualified.push({ text: sentence, score })
  }
  if (qualified.length === 0) {
    const reason =
      rejectedForDose > 0
        ? 'The recorded explanation names an amount, so it does not open this page.'
        : rejectedForJargon > 0
          ? 'The recorded explanation is written in label language rather than for a beginner.'
          : 'No recorded sentence describes the change this makes in a way that stands on its own.'
    return { text: null, reason }
  }
  qualified.sort((left, right) => right.score - left.score)
  return { text: qualified[0]?.text ?? null, reason: '' }
}

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
  if (
    /\b(cholesterol|ldl|hdl|triglyceride|glucose|hba1c|h(?:a)?emoglobin|blood pressure|blood|serum|plasma|mass|density|weight|marker|level)s?\b/.test(
      lower,
    )
  ) {
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

/**
 * A sentence the label printed, as a page statement.
 *
 * `stored_source` is the page's existing origin for text copied out of a source RNAWiki holds, and
 * it is what separates a quoted label sentence from a sentence a person wrote into the record. The
 * citation travels with it so the reader can see which document printed it.
 */
function labelStatement(sentence: LabelSentence, basis: string): Statement {
  return statement(sentence.text, 'stored_source', 'source_checked_draft', basis, [
    sentence.citation,
  ])
}

function buildHero(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
  identity: IdentityStrip,
  label: RecordedLabel,
): ActionHero {
  const legacy = inputs.legacyRecord
  const bound = inputs.boundAnswer
  const steps = legacy?.mechanismSteps ?? []
  const provenance = citationsFromProvenance(legacy?.sourceProvenance)

  // What it changes in the body. The authored explanation is the only thing that answers this in
  // reader language; where it is absent the hero says so rather than reaching for an abstract.
  const chosen = selectActionSentence(legacy?.laymanHowItWorks)
  const whyText = bound?.copy.usedFor ?? legacy?.patientFriendlyIndication ?? ''

  /*
   * The opening line. A recorded sentence that earns the position, or the reason people take it,
   * or an honest absence. The transporter sentence no longer wins by being first.
   */
  const simpleAction = chosen.text
    ? statement(
        readerText(chosen.text),
        'authored_record',
        'source_checked_draft',
        'A person wrote this explanation into the record, with the studies named in the path below.',
        provenance.slice(0, 3),
      )
    : whyText
      ? statement(
          readerText(whyText),
          bound?.copy.usedFor ? 'approved_first_read' : 'authored_record',
          bound?.copy.usedFor ? 'reviewed_content' : 'source_checked_draft',
          `${chosen.reason} The page opens with what it is taken for instead, and the recorded explanation follows below.`,
        )
      : label.uses[0]
        ? labelStatement(
            // The house split: whole sentences up to the reader limit, never a truncated medical
            // sentence. An indication that runs to three sentences opens on the first, and the rest
            // is kept word for word in the explanation below.
            {
              text: splitForReader(label.uses[0].text).lead || label.uses[0].text,
              citation: label.uses[0].citation,
            },
            'The use the label states, quoted from it. No plain-language version of this sentence has been written.',
          )
        : label.mechanism[0]
          ? labelStatement(
              label.mechanism[0],
              'What the label states this substance does, quoted from it. No plain-language version of this sentence has been written.',
            )
          : // A display line reading "Not recorded." looks like a broken page rather than an honest one.
            statement(
              'RNAWiki has not recorded what this substance changes in the body.',
              'contract_sentence',
              'awaiting_review',
              chosen.reason,
            )

  /*
   * Everything the recorded explanation says, under the opening line. Where the opening line came
   * from the explanation itself, its own sentence is not repeated.
   */
  const full = legacy?.laymanHowItWorks?.trim() ?? ''
  const withoutOpening = chosen.text ? full.replace(chosen.text, '').trim() : full
  /*
   * The same rule the opening line follows applies to the paragraph under it: RNAWiki does not name
   * an amount in its own voice, anywhere in the hero. Five records carry label wording such as "at
   * the recommended dose levels" inside the recorded explanation. Those sentences are dropped from
   * the hero and remain, word for word, in the technical detail on the body path below.
   */
  const detailSentences =
    withoutOpening.match(/[^.!?]+[.!?]+(\s|$)/g) ?? (withoutOpening ? [withoutOpening] : [])
  const keptSentences = detailSentences.filter((sentence) => !DOSE_LANGUAGE.test(sentence))
  const movedForDose = detailSentences.length - keptSentences.length
  const detailText = keptSentences.join('').trim()
  const actionDetail = detailText
    ? statement(
        readerText(detailText),
        'authored_record',
        'source_checked_draft',
        movedForDose > 0
          ? `The rest of the recorded explanation. ${movedForDose} ${movedForDose === 1 ? 'sentence names' : 'sentences name'} an amount and ${movedForDose === 1 ? 'is' : 'are'} kept in the technical detail instead.`
          : 'The rest of the recorded explanation of what happens in the body.',
        provenance.slice(0, 3),
      )
    : label.mechanism.length > 0 || splitForReader(label.uses[0]?.text).rest
      ? labelStatement(
          {
            text: [
              splitForReader(label.uses[0]?.text).rest,
              ...label.mechanism.map((sentence) => sentence.text),
            ]
              .filter(Boolean)
              .join(' '),
            citation: (label.mechanism[0] ?? label.uses[0])!.citation,
          },
          `What the label states about how this substance acts, quoted from it${
            label.targets.length > 0 ? `. Targets it names: ${label.targets.join(', ')}` : ''
          }.`,
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
    : label.mechanism[0]
      ? labelStatement(
          label.mechanism[0],
          'The first thing the label states this substance does. No step-by-step path through the body is recorded.',
        )
      : absentStatement('No step-by-step path through the body is recorded.')

  const whyPeopleCare =
    !chosen.text && whyText
      ? // It became the opening line; the hero renders it once.
        absentStatement('Shown as the opening line on this page.', 'not_applicable')
      : bound?.copy.usedFor
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
          : label.uses[0]
            ? labelStatement(
                label.uses[0],
                'The use the label states, quoted from it. It is written for a clinician, not for a reader without medical training.',
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
  const reviewedEffect = inputs.claims.find(
    (claim) =>
      claim.kind === 'effect' &&
      claim.reviewerState === 'reviewed' &&
      claim.sourceSnapshotIds.length > 0 &&
      claim.plainLanguageVersion.trim() &&
      claim.applicablePopulation.trim() &&
      claim.indicationOrGoal.trim() &&
      claim.comparator?.trim() &&
      claim.duration?.trim() &&
      claim.uncertaintyReasons.some((reason) => reason.trim()),
  )
  const reviewedSources: SourceCitation[] =
    reviewedEffect?.sourceSnapshotIds.map((id) => ({
      label: `Stored source ${id}`,
      id,
      binding: 'snapshot' as const,
    })) ?? []
  const strongestGoalResult = reviewedEffect
    ? statement(
        readerText(reviewedEffect.plainLanguageVersion),
        'reviewed_claim',
        'reviewed_content',
        'A reviewed result for the goal, people, comparison and duration named here.',
        reviewedSources,
      )
    : statement(
        v3.contract.noReviewedConclusionSentence,
        'contract_sentence',
        'awaiting_review',
        'No source-bound reviewed effect claim with its population, comparison and duration exists here.',
      )
  const principalUncertainty = reviewedEffect
    ? statement(
        readerText(reviewedEffect.uncertaintyReasons[0]!),
        'reviewed_claim',
        'reviewed_content',
        'The limitation stored on the same reviewed claim as the result.',
        reviewedSources,
      )
    : absentStatement('No reviewed result exists to qualify.', 'awaiting_review')

  // v3 calls the boundary "breaks"; v4 renders it as "where this stops being true". An analogy
  // without its boundary is never carried across.
  const analogy = v3.decisionCard.analogy
    ? { text: v3.decisionCard.analogy.text, limit: v3.decisionCard.analogy.breaks }
    : null

  /*
   * The community layer, applied once at the end rather than threaded through each branch above.
   * Every sentence the selection rules produced is still computed, so a published wording that
   * stops resolving — because the record moved under it — falls back to exactly what this page
   * would have said without it, not to an absence.
   */
  const approved = inputs.statementOverlay?.active
  const withOverlay = (key: PageStatementKey, base: Statement): Statement =>
    withApprovedWording(base, approved?.get(key))

  const openingLine = withOverlay('hero.opening', simpleAction)
  const explanation = withOverlay('hero.explanation', actionDetail)
  const reasonPeopleTakeIt = withOverlay('hero.why_people_take_it', whyPeopleCare)
  const headlineResult = withOverlay('hero.strongest_result', strongestGoalResult)
  const headlineLimit = withOverlay('hero.principal_limit', principalUncertainty)
  const whereItActs = withOverlay('hero.where_it_acts', bodyLocation)
  const firstChange = withOverlay('hero.immediate_change', immediateChange)

  const openingWordCount =
    words(openingLine.text) +
    words(explanation.text) +
    words(reasonPeopleTakeIt.text) +
    words(headlineResult.text)

  return {
    state:
      headlineResult.state === 'reviewed_content' || openingLine.state === 'source_checked_draft'
        ? 'source_checked_draft'
        : 'awaiting_review',
    simpleAction: openingLine,
    actionDetail: explanation,
    bodyLocation: whereItActs,
    immediateChange: firstChange,
    whyPeopleCare: reasonPeopleTakeIt,
    analogy,
    strongestGoalResult: headlineResult,
    resultScope: reviewedEffect
      ? {
          goal: readerText(reviewedEffect.indicationOrGoal),
          population: readerText(reviewedEffect.applicablePopulation),
          comparator: readerText(reviewedEffect.comparator ?? ''),
          duration: readerText(reviewedEffect.duration ?? ''),
        }
      : null,
    // What kind of thing the headline result is. A reviewed claim names its own outcome class; with
    // none, the kind is read from the strongest result's own words, and stays unknown if they do
    // not say. It is never assumed to be the kind a reader would most want.
    outcomeType:
      v3.doesItWork.byGoal[0]?.cards[0]?.outcomeLabel ??
      outcomeTypeFromText(headlineResult.text, headlineResult.origin),
    principalUncertainty: headlineLimit,
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
  namedTrial: RecordedFact[],
): DossierV4ViewModel['humanResults'] {
  const legacy = inputs.legacyRecord
  const roles = new Map(inputs.roleAggregate?.rows.map((row) => [row.nctId, row.role]) ?? [])
  const cards: HumanResultCard[] = (legacy?.trials ?? [])
    .filter((trial: ClinicalTrialRecord) => {
      const nct = /NCT\d{8}/.exec(trial.trialId)?.[0]
      const role = nct ? roles.get(nct) : undefined
      return Boolean(trial.primaryEndpoint && nct && role && trialRoleSupportsTestedClaim(role))
    })
    .slice(0, 6)
    .map((trial, index) => {
      const verdict: HumanResultCard['verdict'] =
        trial.endpointStatus === 'met' || trial.endpointStatus === 'not_met'
          ? trial.endpointStatus
          : 'not_reported'
      const nct = /NCT\d{8}/.exec(trial.trialId)?.[0]
      return {
        id: `result-${index + 1}`,
        question: readerText(trial.primaryEndpoint),
        population: 'Not recorded in this summary',
        intervention: legacy?.name ?? v3.name,
        formulation: 'Not recorded for this study',
        route: 'Not recorded for this study',
        comparator: 'Not recorded for this study',
        outcome: readerText(trial.primaryEndpoint),
        outcomeClassLabel: /surviv|death|mortalit/i.test(trial.primaryEndpoint)
          ? 'Living longer, or avoiding a major event'
          : /function|capacit|decline/i.test(trial.primaryEndpoint)
            ? 'What a body can do day to day'
            : /strength|mass|power|repetition/i.test(trial.primaryEndpoint)
              ? 'Measured performance'
              : 'A number that stands in for health',
        duration: 'Not recorded in this summary',
        absoluteResult: 'An outcome value is not verified against a study result here.',
        relativeResult: 'Not recorded in this summary',
        confidenceInterval:
          /95%\s*C[LI][^.]*/i.exec(trial.statisticalPValue)?.[0] ?? 'Not recorded in this summary',
        studyDesign: readerText(trial.phase),
        replication: trial.independentReplicationStatus ?? 'Not recorded',
        primaryLimitation: trial.unreportedAdverseSignals
          ? readerText(trial.unreportedAdverseSignals)
          : 'No limitation is recorded for this study.',
        applicabilityLimitation:
          'This registry match tests the substance, but the population and result need source review.',
        doesNotProve:
          verdict === 'met'
            ? 'Meeting one endpoint in one population does not carry to other goals or other people.'
            : verdict === 'not_met'
              ? 'One result that missed its endpoint does not show that no effect exists anywhere.'
              : 'This record does not establish whether the study met its endpoint.',
        participants: trial.sampleSize ?? null,
        verdict,
        verdictLabel: VERDICT_LABELS[verdict],
        origin: 'authored_record' as StatementOrigin,
        state: 'source_checked_draft' as SectionState,
        sources: nct
          ? [
              {
                label: `ClinicalTrials.gov ${nct}`,
                id: nct,
                url: `https://clinicaltrials.gov/study/${nct}`,
                binding: 'record' as const,
              },
            ]
          : [],
      }
    })
  return {
    namedTrial,
    state:
      cards.length > 0 || namedTrial.length > 0 ? 'source_checked_draft' : 'no_qualifying_evidence',
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
      how: 'Each card names a registered study and what it set out to measure. A result needs separate review.',
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
  anatomy: RecordedFact[],
): DossierV4ViewModel['journey'] {
  const legacy = inputs.legacyRecord
  const steps = [...(legacy?.mechanismSteps ?? [])].sort((left, right) => left.step - right.step)
  const provenance = citationsFromProvenance(legacy?.sourceProvenance)
  if (steps.length === 0) {
    return {
      anatomy,
      /*
       * A recorded target region is a real answer to "where does this act", even with no ordered
       * path through the body. The section stays open when the record names one.
       */
      state: anatomy.length > 0 ? 'source_checked_draft' : 'no_qualifying_evidence',
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
    anatomy,
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
  /*
   * The recorded half-life, and only when the record states one as a value.
   *
   * `kinetics` is a large object: a precedence note, the label's whole pharmacokinetics section as
   * prose, a list of experimental parameter rows from the NCATS database, and — sometimes — a
   * `halfLife` the extractor read out as a value with the sentence it came from. This used to be
   * `String(kinetics)`, which rendered `[object Object]` to a reader on every page whose record had
   * any pharmacokinetics at all. It was on aspirin, ibuprofen, metformin, caffeine, lovastatin,
   * semaglutide and inclisiran.
   *
   * The experimental rows are deliberately not used. Aspirin's carry two different half-lives for
   * two different routes, measured in different studies, and picking one to print as "how fast the
   * body clears it" would be RNAWiki choosing a number rather than reporting one. Where the label
   * states a half-life, that is what the page says; where it does not, the page says so.
   */
  const kineticsRecord = fieldValue(inputs, 'kinetics') as
    { halfLife?: { value?: string | null; unit?: string | null; sentence?: string } } | undefined
  const halfLife =
    fieldState(inputs, 'kinetics') === 'present' && kineticsRecord?.halfLife?.value
      ? kineticsRecord.halfLife
      : undefined
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
          value: halfLife
            ? statement(
                `${halfLife.value}${halfLife.unit ? ` ${halfLife.unit}` : ''}`,
                'stored_source',
                'source_checked_draft',
                halfLife.sentence
                  ? `Read from the label, which states: “${halfLife.sentence}”`
                  : 'The half-life the label states for this substance.',
              )
            : absentStatement(
                'No half-life is recorded as a value for this substance. Where the label describes clearance in prose rather than stating a figure, the prose is in the full record at the foot of this page.',
              ),
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
  /*
   * A standing sentence is not a measurement.
   *
   * This used to count any facet whose origin was not `absent`, and the `long_term_unknown` facet
   * always emits one — a `contract_sentence`, which is the origin meaning "a sentence RNAWiki
   * prints on every page of this kind". So every medicine reported that it had timing content, the
   * section rendered on all of them, and across a 300-medicine sample it produced two distinct
   * renderings. A section is only holding something when a source or a count put it there.
   */
  const measured = entries.some(
    (entry) => entry.value.origin !== 'absent' && entry.value.origin !== 'contract_sentence',
  )
  return {
    state: measured ? 'source_checked_draft' : 'no_qualifying_evidence',
    entries,
  }
}

/* ---------------------------------------------------------- applicability */

function buildApplicability(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
  populations: RecordedFact[],
  studyPopulation: RecordedFact[],
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
    populations,
    studyPopulation,
    state:
      included.length || transferLimits.length || populations.length || studyPopulation.length
        ? 'source_checked_draft'
        : 'no_qualifying_evidence',
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
  /*
   * Measurement noise was asserted for every substance, in these words: "Day-to-day swing in sleep,
   * food and stress moves most home measurements more than a supplement would." It was printed under
   * "On this record:", which says the record supports it, and no record did — it is a general remark,
   * and on an intravenous hospital medicine the comparison to a supplement is simply wrong. It is
   * gone. The reason stays in the catalogue below as a thing RNAWiki checked for and did not find.
   */
  applies.evidence_uncertainty = v3.contract.noReviewedConclusionSentence

  const entries: NoResponseEntry[] = NO_RESPONSE_REASONS.map((reason) => ({
    code: reason.code,
    label: reason.label,
    plain: reason.plain,
    applies: Boolean(applies[reason.code]),
    basis: applies[reason.code] ?? 'Nothing in this record points to this reason.',
  }))
  /*
   * `evidence_uncertainty` is true of every record with no reviewed conclusion, so it alone does not
   * make this section about this substance. The section renders when something the record itself
   * records puts a reason on the list.
   */
  const fromThisRecord = entries.filter(
    (entry) => entry.applies && entry.code !== 'evidence_uncertainty',
  )
  return {
    state: fromThisRecord.length > 0 ? 'source_checked_draft' : 'no_qualifying_evidence',
    entries,
    note: 'None of these is a reason to take more. Taking more is not a step this page ever suggests.',
  }
}

/* ------------------------------------------------------ practical reality */

function buildPractical(
  inputs: DossierV4Inputs,
  v3: DossierV3ViewModel,
  identity: IdentityStrip,
  titration: RecordedFact[],
): DossierV4ViewModel['practical'] {
  const delivery = inputs.legacyRecord?.deliverySystem
  const regulatory = fieldValue(inputs, 'regulatory')
  return {
    titration: [],
    state: delivery || titration.length > 0 ? 'source_checked_draft' : 'no_qualifying_evidence',
    availability: statement(
      identity.availability,
      'stored_source',
      'source_checked_draft',
      'Read from the recorded approval status.',
      v3.substanceType.sources,
    ),
    route:
      delivery?.type && !DOSE_LANGUAGE.test(delivery.type)
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
    productQuality: absentStatement('No source-bound product-quality comparison is recorded.'),
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
  const entries: SafetyEntry[] = v3.safety.items
    .filter((item) => item.sources.length > 0)
    .map((item) => ({
      text: item.text,
      evidenceSource: item.layer,
      evidenceSourcePlain: item.layerLabel,
      action: item.kind === 'serious_warning' ? 'urgent_warning' : 'professional_discussion',
      actionLabel:
        item.kind === 'serious_warning'
          ? 'Serious warning'
          : item.kind === 'contraindication'
            ? 'Who the label says should not use it'
            : 'Recorded safety information',
      urgent: item.kind === 'serious_warning',
      denominatorKnown: item.denominatorKnown,
      sources: item.sources,
    }))
  return {
    state: entries.length ? 'source_checked_draft' : 'no_qualifying_evidence',
    entries,
    unverifiedLegacySafety: Boolean(inputs.legacyRecord?.deliverySystem?.safetyProfile?.trim()),
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
      entityB: readerText(row.counterpart),
      // Through the guard: interaction lines embed a label record identifier, which the corpus
      // validation found reaching reader copy on seven pages.
      consequence: readerText(row.text),
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
  supply: RecordedFact[],
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
    /*
     * Through the reader-text guard, because a ledger subject reference can name a stored field.
     * Pruning the withdrawn Tribulus studies wrote rows whose subject is `humanCeiling:NCT01407445`,
     * and the correction list put that camelCase field name straight into reader copy.
     */
    const subject = readerText(`${correction.action.replace(/_/g, ' ')}: ${correction.subjectRef}`)
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
  const corrections = [...byReason.values()].map((entry) => {
    const split = splitForReader(entry.why)
    return {
      when: entry.when,
      what: entry.subjects.join('; '),
      why: split.lead || entry.why,
      // Kept word for word. A correction's full explanation is the audit trail and is never cut.
      fullReason: entry.why,
    }
  })
  return {
    supply,
    /*
     * "Does the exact form matter?" is answered partly by what is actually sold. A product directory
     * recording that a substance is supplied as a tablet, a capsule and an injection is a real answer
     * to that question, and the section stayed empty on 60% of medicines while it sat in the record.
     */
    state:
      entries.length || corrections.length || supply.length
        ? 'source_checked_draft'
        : 'no_qualifying_evidence',
    exactFormStudied: absentStatement('No studied form is bound to a reviewed result.'),
    exactRouteStudied: absentStatement('No studied route is bound to a reviewed result.'),
    // Not the first sentences again: "What taking it involves" already shows those, and printing
    // the same paragraph twice on one page wastes the reader's attention and doubles its length.
    marketedForms: absentStatement('No source-bound comparison of marketed forms is recorded.'),
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
  /*
   * The planner gate. Safety-critical, so it is a conjunction of explicit conditions rather than a
   * single field, and every one of them has to hold.
   *
   * The type has to be one a person buys and takes on their own. Availability has to be either
   * recorded as without a prescription or genuinely varying by country — a supplement is sold
   * differently in different places, and that is not a reason to withhold a measurement plan. Every
   * supervised, controlled, withheld or withdrawn state blocks it outright.
   */
  const lowRisk =
    planningEligibleType(identity.substanceTypeCode) &&
    (identity.availabilityCode === 'sold_without_prescription' ||
      identity.availabilityCode === 'varies_by_jurisdiction') &&
    identity.supervision !== 'required' &&
    v3.supervision.level !== 'required' &&
    !inputs.corpus.suppressed &&
    !inputs.corpus.controlled &&
    !inputs.corpus.withdrawn
  if (!lowRisk) {
    /*
     * A prescription or controlled medicine gets questions to ask a clinician and the warning signs
     * the record holds — never a self-experiment plan, which is what `lowRisk` gates.
     *
     * The state used to be `not_applicable` for this branch, meaning "this question does not apply
     * to this substance". It was never true: the question applies, and the section answers it in a
     * different mode. It became load-bearing when empty sections stopped rendering, because
     * `not_applicable` hid a section that had a list of clinician questions in it. The state now
     * reflects whether there is anything to show, and the mode says what kind of thing it is.
     */
    const hasClinicianContent =
      v3.measure.clinicianQuestions.length > 0 || v3.measure.warningSigns.length > 0
    return {
      state: hasClinicianContent ? 'source_checked_draft' : 'no_qualifying_evidence',
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
        /*
         * This used to print three raw registry terms - "brachial artery flow mediated dilation;
         * glycated hemoglobin; blood arsenic concentrations" on the creatine page. They are the same
         * strings the felt-measured section used to dump, and on a page about one substance they
         * mostly belong to other substances' trials. Found by re-checking the live page after the
         * first fix, not by assuming one renderer was the only one.
         *
         * The names still exist, one click away, under "The registered names" in the section that
         * exists to distinguish them. This sentence now points there instead of repeating them.
         */
        text: measurable.length
          ? 'Registered studies measured things a test or a scale shows. Pick one of those names from the list under felt, measured or meaningful.'
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
  facts: RecordedFacts,
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
    corroboration: facts.corroboration,
    identifiers: facts.identifiers,
    state:
      entries.length || facts.identifiers.length || facts.corroboration.length
        ? 'source_checked_draft'
        : 'no_qualifying_evidence',
    entries,
    note: 'Every line above can be traced to the study named beside it. Follow the link and read it.',
  }
}

/* ----------------------------------------------------------------- story */

function buildStory(
  inputs: DossierV4Inputs,
  regulatory: RecordedFact[],
): DossierV4ViewModel['story'] {
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
  /*
   * An approval record is how this medicine reached us, and for a discontinued one it is often the
   * only thing still published. A page that showed nothing here while the register recorded an
   * approval date and a sponsor was describing a failed search, not a medicine.
   */
  const state: SectionState =
    entries.length > 0 || regulatory.length > 0 ? 'source_checked_draft' : 'no_qualifying_evidence'
  return { state, entries, regulatory }
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
      // A contract sentence is RNAWiki's own wording, not a source. An opening that falls back to
      // one means the record carries neither an explanation nor a recorded purpose.
      passed:
        model.hero.simpleAction.origin !== 'absent' &&
        model.hero.simpleAction.origin !== 'contract_sentence',
      detail:
        model.hero.simpleAction.origin === 'absent' ||
        model.hero.simpleAction.origin === 'contract_sentence'
          ? 'The opening statement carries no source: the record holds neither an explanation nor a recorded use.'
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
    {
      code: 'no_raw_internal_fields',
      label: 'No leftover internal codes in the writing',
      ...internal,
    },
    {
      code: 'safety_mode_valid',
      label: 'Safety mode resolved',
      passed: v3.supervision.level !== 'unknown',
      detail: v3.supervision.basis,
    },
    {
      code: 'canonical_metadata_valid',
      label: 'The name and the stored record agree',
      ...canonical,
    },
  ]
}

/* ------------------------------------------------------------------ build */

export function buildDossierV4(inputs: DossierV4Inputs): DossierV4ViewModel {
  const v3 = buildDossierV3(inputs)
  const identity = buildIdentity(inputs, v3)
  /*
   * The label record. Read once and used as the tier below the curated `drugs` columns, which are
   * populated for a few hundred flagship medicines and empty for the rest. Before this, a medicine
   * with a stored label and no curated column rendered an absence while its label sat in the
   * database — 1,874 mechanisms and 3,078 recorded uses, fetched, parsed and never shown.
   */
  const label = recordedLabelFor(inputs.legacyRecord?.recordedBackground ?? null)
  /*
   * The eighteen register modules that had no reader surface after the old layout was deleted. Their
   * only previous home was `components/MedicineRecordContextSections.tsx`, which belonged to that
   * layout; removing it left 7,126 recorded source materials, 5,998 product listings and 2,542
   * approval records stored, validated and invisible. They are distributed into the sections they
   * answer rather than collected into a block of their own, because "212 products list this" is an
   * answer to how it is supplied, not a fact about records.
   */
  const facts = recordedFactsFor(inputs.legacyRecord?.recordedBackground ?? null)
  const hero = buildHero(inputs, v3, identity, label)

  const biomarkerTerms = ((fieldValue(inputs, 'biomarkers') as { terms?: string[] } | undefined)
    ?.terms ?? []) as string[]
  const classified = classifyOutcomeTerms(biomarkerTerms)

  const fingerprint = buildFingerprint(inputs, v3, classified)
  const humanResults = buildHumanResults(inputs, v3, facts.namedTrial)
  const staircase = buildStaircase(inputs, v3, classified)
  const journey = buildJourney(inputs, v3, facts.anatomy)
  const experience = buildExperience(classified)
  const timeline = buildTimeline(inputs, v3)
  const applicability = buildApplicability(inputs, v3, facts.populations, facts.studyPopulation)
  const noResponse = buildNoResponse(inputs, v3, classified)
  const practical = buildPractical(inputs, v3, identity, facts.titration)
  const safety = buildSafety(inputs, v3)
  const stack = buildStack(inputs, v3)
  const formCheck = buildFormCheck(inputs, v3, facts.supply)
  const measurement = buildMeasurement(inputs, v3, identity, classified)
  const alternatives = buildAlternatives(inputs, v3)
  const claimDecoder = buildClaimDecoder(inputs, v3)
  const unknowns = buildUnknowns(inputs, v3)
  const receipts = buildReceipts(inputs, v3, facts)
  const story = buildStory(inputs, facts.regulatory)

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

  /*
   * The publication decision, made once from what the page actually assembled rather than from a
   * flag. A record with no reviewed claim and no source-linked wording is a limited record however
   * many empty sections it can render.
   */
  const publication = decidePublicationState({
    reviewedClaimCount: inputs.claims.filter((claim) => claim.reviewerState === 'reviewed').length,
    hasApprovedFirstRead: Boolean(inputs.boundAnswer),
    hasSourceLinkedContent:
      hero.simpleAction.origin === 'authored_record' ||
      hero.strongestGoalResult.origin === 'authored_record' ||
      humanResults.cards.length > 0 ||
      journey.nodes.length > 0,
    identityPassed: identity.identityVerified,
    criticalIdentityConflict: v3.indexQuality.some(
      (check) => check.check === 'no_critical_contamination' && !check.passed,
    ),
    pipelineFailed: false,
    hasAnyUsefulFact:
      inputs.corpus.sources.length > 0 ||
      inputs.corpus.registration.length > 0 ||
      inputs.corpus.relations.length > 0 ||
      classified.length > 0,
  })

  const partial = {
    version: 4 as const,
    slug: v3.slug,
    name: v3.name,
    publication,
    identity,
    recordedIdentity: facts.identity,
    recordedVerdict: inputs.legacyRecord?.oneSentenceVerdict?.trim() || null,
    pagePromise: COMPASS_COPY.pagePromise,
    reviewSummary: inputs.statementOverlay?.summary ?? {
      slug: v3.slug,
      ...EMPTY_PAGE_REVIEW_SUMMARY,
    },
    approvedWordings: [...(inputs.statementOverlay?.active.values() ?? [])],
    wordingHistory: inputs.statementOverlay?.history ?? [],
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
    unknowns,
    receipts,
    story,
    changes: {
      /*
       * A published wording change is a change to this page, so it keeps the section open even when
       * nothing else was corrected. Without this the section would be hidden as empty while
       * carrying the record of a sentence that was reworded — which is the one thing a reader
       * looking at the current wording most needs to be able to find.
       */
      state: (v3.changes.length || (inputs.statementOverlay?.history?.length ?? 0) > 0
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
    unknowns: unknowns.state,
    'evidence-receipts': receipts.state,
    'drug-story': story.state,
    'change-history': partial.changes.state,
    'next-question': 'source_checked_draft',
  }

  /*
   * The navigator is built from what the page rendered, not from the section list.
   *
   * On a sparse record most sections find nothing, and a rail of twenty-two links to twenty-two
   * "nothing found" headings wastes the reader's attention and tells them nothing. What never
   * disappears is a section carrying uncertainty a reader has to see: safety, what a result does
   * not prove, identity doubt, what is unresolved. Those stay in the rail exactly because they are
   * empty — an unanswered safety question is a fact about the record, not an absence to tidy away.
   */
  const ALWAYS_IN_NAVIGATOR = new Set([
    'substance-action',
    'safety',
    'applicability',
    'form-check',
    'unknowns',
    'evidence-receipts',
    'next-question',
  ])
  const sections: SectionMeta[] = COMPASS_SECTIONS.map((section) => {
    const state = stateById[section.id] ?? 'pipeline_failure'
    const empty = state === 'no_qualifying_evidence' || state === 'not_applicable'
    return {
      ...section,
      state,
      inNavigator: ALWAYS_IN_NAVIGATOR.has(section.id) || !empty,
      reason: `${sectionStateLabel(state)}. ${sectionReason(section.id, state)}`,
    }
  })

  const gates = buildGates(inputs, v3, { formCheck, hero })
  const model: DossierV4ViewModel = {
    ...partial,
    sections,
    gates,
    nextQuestions: [],
    // Filled below: the assessment reads the finished hero and section states.
    substance: {
      hasOpening: false,
      hasExplanation: false,
      hasHumanEvidence: false,
      hasMechanism: false,
      score: 0,
      empty: true,
    },
    /*
     * The registers a reader is told were searched. These are the sources the corpus pipeline
     * actually consults for a medicine record, named in the words a reader would recognise rather
     * than by module name, so an empty page can say where it looked instead of only that it failed.
     */
    searchedRegisters: [
      'the FDA label archive and DailyMed',
      'the FDA, EMA, Health Canada and TGA registers',
      'ClinicalTrials.gov',
      'PubChem and ChEMBL',
    ],
  }
  model.nextQuestions = buildNextQuestions(model)
  model.substance = assessRecordSubstance(model)
  return model
}

/**
 * Collapse change rows that carry the same explanation. v3 composes each row as
 * "<subject>: <reason>", so the reason is the tail after the first colon; rows that share one are
 * merged and their subjects joined.
 */
function groupChangesByReason(
  changes: DossierV3ViewModel['changes'],
): Array<DossierV3ViewModel['changes'][number] & { fullText: string }> {
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
  /*
   * Through the reader-text guard. The change history composes its own sentence from ledger rows,
   * and a row's subject can name a stored field: pruning the withdrawn Tribulus studies wrote
   * subjects such as `humanCeiling:NCT01407445`, which put a camelCase field name into reader copy
   * on the very page that promises none.
   */
  return [...grouped.values()].map(({ entry, subjects }) => {
    const composed = readerText(
      subjects.length > 0 ? `${subjects.join('; ')}. ${entry.text}` : entry.text,
    )
    const split = splitForReader(composed)
    return { ...entry, text: split.lead || composed, fullText: composed }
  })
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
