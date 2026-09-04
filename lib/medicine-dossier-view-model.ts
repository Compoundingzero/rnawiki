import { medicineBackgroundContext } from '@/lib/medicine-background-view'
import type {
  AuditPoint,
  ClinicalTrialRecord,
  CommunityNote,
  ConventionalSubstitute,
  DrugDossier,
  MechanismStep,
} from '@/lib/types'
import type {
  ClaimSourceRelationship,
  ClaimDirection,
  EvidenceNodeClaimRelationship,
  MechanismEvidenceBasis,
  ProgrammeSummaryFieldPath,
  ProgrammeTimelineDateBasis,
  ProgrammeTimelineEventType,
  TrialEnrolmentType,
  VerdictClaimRelationship,
  VerdictReviewerExpertiseTag,
} from '@/lib/evidence/types'
import {
  buildPublishedProgrammeReaderSummary,
  GENERAL_RESEARCH_SUMMARY_COPY,
  type ReaderMedicineLanguageContext,
  type ReaderSummaryView,
} from '@/lib/public-medicine-language'
import { buildLegacyDossierReaderSummary } from '@/lib/legacy-ten-second-reader-summary'
import {
  legacyDossierDynamicModules,
  type DossierDynamicModulesView,
} from '@/lib/dossier-dynamic-modules'

export type EvidenceDisplayState =
  'measured' | 'inferred' | 'unknown' | 'failed' | 'conclusion_shift' | 'recorded_context'

export type EvidenceNodeState =
  'confirmed' | 'contradicted' | 'unknown' | 'not_measured' | 'mixed' | 'recorded_context'

export type EvidenceClaimNature =
  'measured' | 'sponsor_reported' | 'regulatory_finding' | 'rnawiki_judgement' | 'mixed' | 'unknown'

export type DossierFreshnessState = 'current' | 'stale' | 'review_required' | 'unknown'

export type DossierBindingState = 'published_programme' | 'programme_unpublished' | 'legacy_record'

export interface DossierStatusBadgeView {
  kind: 'medicine_approval' | 'programme_status'
  /** Exact stored value. The component chooses reader copy according to `kind`. */
  value: string
}

export interface ProgrammeOptionView {
  id: string
  label: string
  status: string
  href?: string
  selected: boolean
  /** That programme's own published finding; absent until its conclusion is published. */
  oneSentenceResult?: string
  /** That programme's own published public label; absent until its conclusion is published. */
  publishedLabel?: string
}

export interface MechanismSummaryView {
  where?: string
  change?: string
  observed?: string
}

export interface EvidenceSourceView {
  id: string
  label: string
  href?: string
  /** Exact stored provenance locator. URNs are displayed as text and are never used as links. */
  canonicalLocator?: string
  identifier?: string
  snapshotHash?: string
  retrievedAt?: string
  verifiedAt?: string
  freshness: DossierFreshnessState
}

/** Exact medicine-wide research fields retained for the optional professional detail view. */
export interface EvidenceNodeTechnicalDetailView {
  technicalDetails?: string
  measuredMetric?: string
  inferredClaim?: string
  evidenceSource?: string
  auditFlag?: NonNullable<AuditPoint['auditFlag']>
}

export interface EvidenceNodeView {
  id: string
  order: number
  label: string
  professionalLabel?: string
  title: string
  summary: string
  state: EvidenceNodeState
  claimNature: EvidenceClaimNature
  sourceIds: string[]
  machineChecked: boolean
  findingCodes: string[]
  claims?: EvidenceClaimView[]
  technicalDetail?: EvidenceNodeTechnicalDetailView
}

export interface EvidenceClaimView {
  id: string
  nature: EvidenceClaimNature
  /** Exact stored role(s) this claim has in its evidence step. */
  nodeRelationships?: EvidenceNodeClaimRelationship[]
  text: string
  technicalText?: string
  population?: string
  intervention?: string
  comparator?: string
  dose?: string
  route?: string
  duration?: string
  endpoint?: string
  endpointHierarchy?: string
  outcomeType?: string
  direction?: ClaimDirection
  timepoint?: string
  exactResult?: string
  uncertaintyInterval?: string
  lastVerifiedAt?: string
  sourceIds: string[]
  sourceClaimBindings?: ProgrammeSourceClaimBindingView[]
}

export interface StudyInterpretabilityView {
  id: string
  question: string
  professionalTerm: string
  state: 'yes' | 'no' | 'unclear' | 'not_reported'
  explanation?: string
  claimIds: string[]
  sourceIds: string[]
  sourceClaimBindings?: ProgrammeSourceClaimBindingView[]
}

export interface StudyView {
  id: string
  title?: string
  phase?: string
  status?: string
  studyType?: string
  /** Stored registry dates; absent remains absent rather than being estimated by the UI. */
  startDate?: string
  completionDate?: string
  sampleSize?: number
  enrolmentType?: TrialEnrolmentType
  endpoint?: string
  endpointHierarchy?: string
  result?: string
  /** Statistical notation or a result-availability note; never presented as the outcome itself. */
  technicalResult?: string
  state: 'measured' | 'unknown' | 'failed'
  replication?: string
  /** The exact registry snapshot supporting stored study dates. */
  registrySourceId?: string
  sourceIds?: string[]
  interpretability?: StudyInterpretabilityView[]
}

export interface KeyOutcomeView {
  id: string
  label: string
  state: EvidenceDisplayState
  claimNature?: EvidenceClaimNature
  endpoint?: string
  endpointHierarchy?: string
  intervention?: string
  comparator?: string
  numericValue?: string
  numericUnit?: string
  uncertaintyInterval?: string
  direction?: ClaimDirection
  timepoint?: string
  outcomeType?: string
  legacyGroup?:
    | 'measured_findings'
    | 'unsupported_assumptions'
    | 'earlier_setbacks_or_context'
    | 'practical_observations'
  legacyGroupLabel?: string
  sourceIds: string[]
  sourceClaimBindings?: ProgrammeSourceClaimBindingView[]
}

export interface MechanismStepView {
  id: string
  order: number
  title: string
  plainLanguage: string
  technicalDetail?: string
  evidenceBasis?: MechanismEvidenceBasis
  claimIds: string[]
  sourceIds: string[]
  sourceClaimBindings?: ProgrammeSourceClaimBindingView[]
}

export interface ProgrammeSourceClaimBindingView {
  sourceId: string
  claimId: string
  relationship: EvidenceNodeClaimRelationship | ClaimSourceRelationship
  statement: string
}

export interface ProgrammeVerdictClaimBindingView {
  claimId: string
  relationship: VerdictClaimRelationship
}

/** Exact field -> claim -> saved-source bindings for one reviewed programme summary answer. */
export interface ProgrammeSummaryEvidenceView {
  fieldPath: ProgrammeSummaryFieldPath
  claimIds: string[]
  sourceIds: string[]
  verdictClaimBindings: ProgrammeVerdictClaimBindingView[]
  sourceClaimBindings: ProgrammeSourceClaimBindingView[]
}

export type ProgrammeSummaryEvidenceByFieldView = Partial<
  Record<ProgrammeSummaryFieldPath, ProgrammeSummaryEvidenceView>
>

export interface ProgrammeTimelineEventView {
  id: string
  date: string
  provenance: 'source' | 'rnawiki'
  eventType: ProgrammeTimelineEventType | 'PUBLICATION' | 'REVISION'
  dateBasis?: ProgrammeTimelineDateBasis
  title: string
  description: string
  technicalDetail?: string
  programmeTrialId?: string
  claimIds: string[]
  sourceIds: string[]
  sourceClaimBindings?: ProgrammeSourceClaimBindingView[]
}

export interface ReviewLineageView {
  revisionId?: string
  publishedAt?: string
  reviewedAt?: string
  reviewerLabel?: string
  engineVersion?: string
  inputDigest?: string
  historyHref: string
}

export interface ProgrammeReviewerView {
  id: string
  name: string
  orcid?: string
  expertiseTags: VerdictReviewerExpertiseTag[]
  decision: string
  reviewedAt: string
  independent: boolean
  conflictsOfInterest?: string
}

export interface ProgrammeConclusionView {
  code?: string
  publicLabel: string
  professionalLabel: string
  reason: string
  scope: {
    indication: string
    population: string
    doseExposure: string
    period: string
    trials: string
    outcome: string
  }
  whatWasDisproven: string[]
  whatWasNotDisproven: string[]
  whatRemainsUnknown: string[]
  confidence: string
  confidenceExplanation?: string
  conditionsThatWouldChangeVerdict: string[]
  authorName: string
  authorHandle?: string
  conflictsOfInterest?: string
  /** Distinct independent accounts counted server-side; account identifiers are not exposed. */
  independentReviewCount: number
  reviewers: ProgrammeReviewerView[]
}

export interface MedicineRecordSourceView {
  label: string
  identifier?: string
  href?: string
}

export interface MedicineConditionContextView {
  conditionExplainer?: string
  whyItMatters?: string
  whoWasApprovedOrStudied?: string
  studyOrLabelGoal?: string
}

export interface MedicinePricingContextView {
  reportedProductionCost?: string
  reportedRetailOrListPrice?: string
  reportedComparison?: string
  manufacturingComplexity?: string
  recordNote?: string
  sources: MedicineRecordSourceView[]
  /** Exact field-specific reports. Unbound legacy price strings never enter this array. */
  reports?: MedicinePricingReportView[]
}

export interface MedicinePricingReportView {
  kind: 'reported_production_cost' | 'reported_retail_or_list_price'
  value: string
  source: MedicineRecordSourceView
}

export interface MedicineAlternativeContextView {
  name: string
  className?: string
  comparison?: string
  reportedCost?: string
  tradeoffs?: string
}

/**
 * Non-actionable fields from the legacy natural-food/supplement bucket. The stored item schema has
 * no item-level source field, so this projection cannot claim that a source is linked. In
 * particular, it intentionally omits active compounds, mechanism prose, use amounts and costs.
 */
export interface MedicineFoodSupplementContextView {
  name: string
  recordedEvidenceLabel?: string
  sourceStatus: 'not_linked'
}

export interface MedicineCommonQuestionView {
  question: string
  answer: string
}

export interface MedicineMolecularIdentifierView {
  label: string
  value: string
  kind: 'nucleotide_sequence' | 'peptide_sequence' | 'smiles' | 'formula' | 'measurement'
}

export interface MedicineMolecularRecordView {
  format?: string
  identifiers: MedicineMolecularIdentifierView[]
  structureCheck: 'passed' | 'not_passed'
  checkedAt?: string
  source?: MedicineRecordSourceView
}

export interface MedicineSafetyAdministrationContextView {
  deliveryForm?: string
  administrationAndDosing?: string
  safetyInformation?: string
}

/**
 * Medicine-wide material from the existing dossier row. It stays beside programme evidence,
 * rather than inside `ProgrammeConclusionView`, so callers can mark its older-record scope.
 */
export interface MedicineRecordContextView {
  condition?: MedicineConditionContextView
  /** Recorded medicine-background/v1 modules, engine-validated at authoring time. */
  background?: import('./medicine-background-view').MedicineBackgroundContextView
  safetyAndAdministration?: MedicineSafetyAdministrationContextView
  pricing?: MedicinePricingContextView
  alternativesSummary?: string
  conventionalAlternatives: MedicineAlternativeContextView[]
  foodSupplementContext?: MedicineFoodSupplementContextView[]
  commonQuestions: MedicineCommonQuestionView[]
  molecular?: MedicineMolecularRecordView
  communityNotes: CommunityNote[]
}

/**
 * Public dossier component input, independent of the persistence schema. Legacy drug rows and
 * normalized programme revisions both map to this contract.
 */
export interface MedicineDossierViewModel {
  slug: string
  name: string
  tradeName?: string
  modality: string
  approvalStatus: string
  statusBadge: DossierStatusBadgeView
  programmes: ProgrammeOptionView[]
  selectedProgrammeId: string
  selectedProgrammeLabel: string
  selectedProgrammeStatus: string
  bindingState: DossierBindingState
  verdict: string
  readerSummary: ReaderSummaryView
  summaryEvidence?: ProgrammeSummaryEvidenceByFieldView
  mechanismSummary: MechanismSummaryView
  mainLimitation?: string
  tenSecondWordCount: number
  evidenceNodes: EvidenceNodeView[]
  studies: StudyView[]
  keyOutcomes: KeyOutcomeView[]
  mechanismSteps: MechanismStepView[]
  timelineEvents: ProgrammeTimelineEventView[]
  sources: EvidenceSourceView[]
  freshness: DossierFreshnessState
  freshnessLabel: string
  review: ReviewLineageView
  conclusion?: ProgrammeConclusionView
  machineFindingCodes: string[]
  medicineRecord: MedicineRecordContextView
  /** Always populated by production mappers; optional only for older hand-built test fixtures. */
  dynamicModules?: DossierDynamicModulesView
  /** Stored per-section completion states; absent until the completion resolver has run. */
  completionAssessment?: DrugDossier['completionAssessment']
  /** Stored identity resolution; absent until the inventory resolver has run. */
  inventoryResolution?: DrugDossier['inventoryResolution']
  /** Ranked registrations from the stored registry pass; absent when none matched. */
  trialRegistrations?: DrugDossier['trialRegistrations']
  trialResults?: DrugDossier['trialResults']
}

export interface PublishedProgrammeViewInput {
  id: string
  label: string
  status: string
  statusBadge?: DossierStatusBadgeView
  href?: string
  verdict: string
  summaryEvidence?: ProgrammeSummaryEvidenceByFieldView
  mechanismSummary: MechanismSummaryView
  mainLimitation?: string
  evidenceNodes: EvidenceNodeView[]
  studies: StudyView[]
  keyOutcomes: KeyOutcomeView[]
  mechanismSteps: MechanismStepView[]
  timelineEvents: ProgrammeTimelineEventView[]
  sources: EvidenceSourceView[]
  freshness: DossierFreshnessState
  freshnessLabel: string
  review: Omit<ReviewLineageView, 'historyHref'> & { historyHref?: string }
  conclusion?: ProgrammeConclusionView
  machineFindingCodes: string[]
  dynamicModules?: DossierDynamicModulesView
}

export interface NormalizedDossierInput {
  selected: PublishedProgrammeViewInput
  programmes: Array<Pick<PublishedProgrammeViewInput, 'id' | 'label' | 'status' | 'href'>>
}

const WORD_PATTERN = /[\p{L}\p{N}]+(?:[’'\-][\p{L}\p{N}]+)*/gu

export function countPlainWords(value: string): number {
  return value.match(WORD_PATTERN)?.length ?? 0
}

function countReaderSummaryWords(summary: ReaderSummaryView): number {
  return [
    summary.usedFor,
    summary.whatStudiesFound,
    summary.biggestLimit,
    summary.practicalNote,
    summary.criticalSafety,
  ].reduce((total, value) => total + (value ? countPlainWords(value) : 0), 0)
}

function nonEmpty(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function listOf<T>(value: unknown): readonly T[] {
  return Array.isArray(value) ? (value as readonly T[]) : []
}

function stringList(value: unknown): readonly string[] {
  return listOf<unknown>(value).flatMap((item) => {
    const text = nonEmpty(item)
    return text ? [text] : []
  })
}

function positiveInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : undefined
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

function safeHttpUrl(value: string): string | undefined {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined
  } catch {
    return undefined
  }
}

function medicineRecordSource(value: unknown): MedicineRecordSourceView | undefined {
  const source = objectValue(value)
  if (!source) return undefined
  const label = nonEmpty(source.label)
  const identifier = nonEmpty(source.identifier)
  if (!label || !identifier) return undefined

  const kind = nonEmpty(source.kind)?.toLowerCase()
  const href =
    kind === 'doi'
      ? `https://doi.org/${encodeURIComponent(identifier)}`
      : kind === 'pmid'
        ? `https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(identifier)}/`
        : kind === 'nct'
          ? `https://clinicaltrials.gov/study/${encodeURIComponent(identifier)}`
          : safeHttpUrl(identifier)

  return { label, identifier, href }
}

function conditionContext(drug: DrugDossier): MedicineConditionContextView | undefined {
  const value = objectValue(drug.conditionContext)
  if (!value) return undefined
  const condition: MedicineConditionContextView = {
    conditionExplainer: nonEmpty(value.conditionExplainer),
    whyItMatters: nonEmpty(value.whyItMatters),
    whoWasApprovedOrStudied: nonEmpty(value.whoTakesThis),
    studyOrLabelGoal: nonEmpty(value.clinicalGoals),
  }
  return Object.values(condition).some(Boolean) ? condition : undefined
}

function pricingContext(drug: DrugDossier): MedicinePricingContextView | undefined {
  // Curated seed pricing stores exact cost and price citations alongside the older JSON fields.
  // Older imported rows may not have them, so the public component carries an explicit caveat.
  const value = objectValue(drug.pricing)
  if (!value) return undefined
  const reportedProductionCost = nonEmpty(value.synthesisCostPerDose)
  const reportedRetailOrListPrice = nonEmpty(value.retailPricePerDoseOrYear)
  const reportedComparison = nonEmpty(value.markupEstimate)
  const recordNote = nonEmpty(value.openPatentNotes)
  const manufacturingComplexity = nonEmpty(value.synthesisComplexity)
  if (!reportedProductionCost && !reportedRetailOrListPrice && !reportedComparison && !recordNote) {
    return undefined
  }

  const costSource = medicineRecordSource(value.costSource)
  const priceSource = medicineRecordSource(value.priceSource)
  const reports: MedicinePricingReportView[] = [
    ...(reportedProductionCost && costSource
      ? [
          {
            kind: 'reported_production_cost' as const,
            value: reportedProductionCost,
            source: costSource,
          },
        ]
      : []),
    ...(reportedRetailOrListPrice && priceSource
      ? [
          {
            kind: 'reported_retail_or_list_price' as const,
            value: reportedRetailOrListPrice,
            source: priceSource,
          },
        ]
      : []),
  ]
  const sources = [costSource, priceSource]
    .flatMap((source) => source ?? [])
    .filter(
      (source, index, all) =>
        all.findIndex(
          (candidate) =>
            candidate.identifier === source.identifier && candidate.label === source.label,
        ) === index,
    )

  return {
    reportedProductionCost,
    reportedRetailOrListPrice,
    reportedComparison,
    manufacturingComplexity,
    recordNote,
    sources,
    reports,
  }
}

function conventionalAlternative(
  value: ConventionalSubstitute,
): MedicineAlternativeContextView | undefined {
  const item = objectValue(value)
  if (!item) return undefined
  const name = nonEmpty(item.name)
  if (!name) return undefined
  // `prosAndCons` is deliberately not projected. The section around it states that the list is
  // alphabetical and not a ranking, and a per-item "Pros: … Cons: …" line is exactly the ranking
  // that copy disclaims — RNAWiki weighing named alternative medicines against each other in its
  // own voice. `howItCompares` stays because it is overwhelmingly a recorded fact about one trial's
  // own comparator arm, which is a statement about a single programme rather than a comparison this
  // site is making.
  const alternative: MedicineAlternativeContextView = {
    name,
    className: nonEmpty(item.class),
    comparison: nonEmpty(item.howItCompares) ?? nonEmpty(item.comparisonToDrug),
    reportedCost: nonEmpty(item.typicalCost),
  }
  return Object.values(alternative).slice(1).some(Boolean) ? alternative : undefined
}

function foodSupplementContextItem(value: unknown): MedicineFoodSupplementContextView | undefined {
  const item = objectValue(value)
  if (!item) return undefined
  const name = nonEmpty(item.name)
  if (!name) return undefined
  const recordedEvidenceLabel = nonEmpty(item.evidenceStrength)

  return {
    name,
    ...(recordedEvidenceLabel ? { recordedEvidenceLabel } : {}),
    // No item-level source exists in the stored natural-food/supplement schema. Do not infer one
    // from prose, nearby medicine sources or similarly named evidence elsewhere in the dossier.
    sourceStatus: 'not_linked',
  }
}

function molecularFormat(value: unknown, recordedSequence?: string): string | undefined {
  switch (nonEmpty(value)) {
    case 'rna_sequence':
      return recordedSequence?.includes('U') && !recordedSequence.includes('T')
        ? 'RNA sequence, written 5′ to 3′'
        : 'Genetic instruction sequence, written 5′ to 3′'
    case 'small_molecule_smiles':
      return 'Small-molecule structure string (SMILES, a text description of a molecule)'
    case 'peptide_sequence':
      return 'Peptide sequence'
    case 'antibody_structure':
      return 'Antibody structure record'
    case 'generic_formula':
      return 'Chemical formula'
    default:
      return undefined
  }
}

function molecularRecord(drug: DrugDossier): MedicineMolecularRecordView | undefined {
  const value = objectValue(drug.molecularSchema)
  if (!value) return undefined
  const structureType = nonEmpty(value.structureType)
  const recordedSequence = nonEmpty(value.sequence5to3)
  const sequenceLabel =
    structureType === 'peptide_sequence'
      ? 'Protein or peptide building-block sequence'
      : recordedSequence?.includes('U') && !recordedSequence.includes('T')
        ? 'Genetic instruction sequence (RNA letters, 5′ to 3′)'
        : recordedSequence?.includes('T') && !recordedSequence.includes('U')
          ? 'Genetic instruction sequence (DNA letters, 5′ to 3′)'
          : 'Genetic instruction sequence (DNA/RNA letters, 5′ to 3′)'
  const identifierCandidates: Array<{
    label: string
    value: string | undefined
    kind: MedicineMolecularIdentifierView['kind']
  }> = [
    {
      label: sequenceLabel,
      value: recordedSequence,
      kind: structureType === 'peptide_sequence' ? 'peptide_sequence' : 'nucleotide_sequence',
    },
    {
      label: 'Structure string (SMILES, a text description of a molecule)',
      value: nonEmpty(value.smilesString),
      kind: 'smiles',
    },
    { label: 'Chemical formula', value: nonEmpty(value.chemicalFormula), kind: 'formula' },
    { label: 'Molecular weight', value: nonEmpty(value.molecularWeight), kind: 'measurement' },
  ]
  const sequenceLength = finiteNumber(value.sequenceLengthNt)
  if (sequenceLength !== undefined) {
    identifierCandidates.push({
      label: 'Recorded sequence length',
      value: `${sequenceLength} bases`,
      kind: 'measurement',
    })
  }
  const identifiers: MedicineMolecularIdentifierView[] = identifierCandidates.flatMap(
    (identifier) =>
      identifier.value
        ? [{ label: identifier.label, value: identifier.value, kind: identifier.kind }]
        : [],
  )
  if (identifiers.length === 0) return undefined

  return {
    format: molecularFormat(value.structureType, recordedSequence),
    identifiers,
    // The top-level flag is written only after the deterministic structure check passes. A JSON
    // field claiming its own verification is not enough.
    structureCheck: drug.isMachineVerifiedStructure ? 'passed' : 'not_passed',
    checkedAt: drug.isMachineVerifiedStructure ? nonEmpty(value.lastVerifiedTimestamp) : undefined,
    source: medicineRecordSource(value.structureSource),
  }
}

function safetyAdministrationContext(
  drug: DrugDossier,
): MedicineSafetyAdministrationContextView | undefined {
  const value = objectValue(drug.deliverySystem)
  if (!value) return undefined

  const context: MedicineSafetyAdministrationContextView = {
    deliveryForm: nonEmpty(value.type),
    administrationAndDosing: nonEmpty(value.description),
    safetyInformation: nonEmpty(value.safetyProfile),
  }
  return Object.values(context).some(Boolean) ? context : undefined
}

/** Maps only non-programme context that is safe to keep on the public dossier. */
export function medicineRecordContext(drug: DrugDossier): MedicineRecordContextView {
  const substitutes = objectValue(drug.substitutes)
  const alternatives = listOf<ConventionalSubstitute>(substitutes?.conventionalRx)
    .flatMap((item) => conventionalAlternative(item) ?? [])
    .sort((left, right) => left.name.localeCompare(right.name))
  const foodSupplementContext = listOf<unknown>(substitutes?.naturalFoods).flatMap(
    (item) => foodSupplementContextItem(item) ?? [],
  )

  const commonQuestions = listOf<unknown>(drug.commonQuestions).flatMap((entry) => {
    const question = objectValue(entry)
    const q = nonEmpty(question?.q)
    const a = nonEmpty(question?.a)
    return q && a ? [{ question: q, answer: a }] : []
  })

  const communityNotes = listOf<CommunityNote>(drug.communityNotes).flatMap((note) => {
    const id = nonEmpty(note.id)
    const author = nonEmpty(note.author)
    const content = nonEmpty(note.content)
    if (!id || !author || !content) return []
    return [
      {
        ...note,
        id,
        author,
        role: nonEmpty(note.role) ?? 'Community member',
        date: nonEmpty(note.date) ?? '',
        content,
        upvotes: positiveInteger(note.upvotes) ?? 0,
      },
    ]
  })

  return {
    condition: conditionContext(drug),
    background: medicineBackgroundContext(drug.recordedBackground, drug.sourceFreshness),
    safetyAndAdministration: safetyAdministrationContext(drug),
    pricing: pricingContext(drug),
    alternativesSummary: nonEmpty(substitutes?.summary),
    conventionalAlternatives: alternatives,
    foodSupplementContext,
    commonQuestions,
    molecular: molecularRecord(drug),
    communityNotes,
  }
}

/**
 * Published, potentially indexable programme pages must not inherit unreviewed actionable
 * medicine-wide fields. The reviewed programme exposure scope remains in the conclusion model;
 * this boundary removes only older protocol, treatment-selection, acquisition and synthesis data.
 */
function publishedProgrammeMedicineRecordContext(drug: DrugDossier): MedicineRecordContextView {
  const recorded = medicineRecordContext(drug)
  const recordedSafety = recorded.safetyAndAdministration
  const safetyAndAdministration = recordedSafety
    ? {
        deliveryForm: recordedSafety.deliveryForm,
        safetyInformation: recordedSafety.safetyInformation,
      }
    : undefined
  const sourcedPriceReports = recorded.pricing?.reports ?? []
  const pricing: MedicinePricingContextView | undefined =
    sourcedPriceReports.length > 0
      ? {
          reportedProductionCost: sourcedPriceReports.find(
            (report) => report.kind === 'reported_production_cost',
          )?.value,
          reportedRetailOrListPrice: sourcedPriceReports.find(
            (report) => report.kind === 'reported_retail_or_list_price',
          )?.value,
          // The current legacy schema has no field-specific source for these values. They remain
          // withheld from a published programme background rather than borrowing a nearby source.
          reportedComparison: undefined,
          manufacturingComplexity: undefined,
          recordNote: undefined,
          sources: sourcedPriceReports
            .map((report) => report.source)
            .filter(
              (source, index, all) =>
                all.findIndex(
                  (candidate) =>
                    candidate.identifier === source.identifier && candidate.label === source.label,
                ) === index,
            ),
          reports: sourcedPriceReports,
        }
      : undefined

  return {
    condition: recorded.condition,
    // Recorded background is label/registry fact with per-value provenance and engine validation,
    // so it survives onto published pages unchanged — schedules stay recorded research context.
    background: recorded.background,
    safetyAndAdministration:
      safetyAndAdministration && Object.values(safetyAndAdministration).some(Boolean)
        ? safetyAndAdministration
        : undefined,
    pricing,
    alternativesSummary: undefined,
    conventionalAlternatives: [],
    // These projections contain only a name, the exact legacy evidence label when present, and an
    // explicit `Source not yet linked` state. They never expose use amounts, mechanisms or costs.
    foodSupplementContext: recorded.foodSupplementContext,
    commonQuestions: [],
    // Sequences, SMILES and formulae are identity detail, not benefit or safety evidence. The
    // mapper already excludes `laboratoryWorkflow` and keeps the structure-check boundary exact.
    molecular: recorded.molecular,
    communityNotes: [],
  }
}

function mechanismStep(
  steps: readonly MechanismStep[],
  stage: MechanismStep['visualStage'],
): MechanismStep | undefined {
  return steps.find((step) => step.visualStage === stage)
}

function legacyMechanismSummary(drug: DrugDossier): MechanismSummaryView {
  const steps = listOf<MechanismStep>(drug.mechanismSteps)
  const change = mechanismStep(steps, 'catalytic_action') ?? mechanismStep(steps, 'target_binding')
  const measuredAudit = listOf<AuditPoint>(drug.keyAudits).find(
    (audit) => audit.category === 'measured',
  )

  return {
    where: nonEmpty(drug.anatomicalSite),
    change: nonEmpty(change?.title),
    // A mechanism step describes an expected biological sequence. Only an explicitly measured
    // audit belongs under "Observed" in the public summary.
    observed: nonEmpty(measuredAudit?.title),
  }
}

function readerLanguageContext(
  drug: DrugDossier,
  additionalTrialIdentifiers: readonly string[] = [],
): ReaderMedicineLanguageContext {
  const legacyTrialIdentifiers = listOf<ClinicalTrialRecord>(drug.trials).flatMap((trial) =>
    nonEmpty(trial.trialId) ? [trial.trialId] : [],
  )
  return {
    medicineSlug: drug.id,
    medicineName: drug.name,
    modality: drug.modality,
    targetGene: nonEmpty(drug.targetGene),
    targetProtein: nonEmpty(drug.targetProtein),
    trialIdentifiers: [...new Set([...additionalTrialIdentifiers, ...legacyTrialIdentifiers])],
  }
}

function legacyMainLimitation(drug: DrugDossier): string | undefined {
  const inferred = listOf<AuditPoint>(drug.keyAudits).find((audit) => audit.category === 'inferred')
  if (inferred) return nonEmpty(inferred.laymanSummary)
  const summary = drug.measuredVsInferredSummary as
    Partial<DrugDossier['measuredVsInferredSummary']> | null | undefined
  return stringList(summary?.unsupportedInferences)[0]
}

function sourceIdForAudit(audit: AuditPoint): string {
  const doi = nonEmpty(audit.doi)
  return doi ? `doi:${doi.toLowerCase()}` : `audit:${audit.id}`
}

function doiHref(doi: string | undefined): string | undefined {
  const identifier = nonEmpty(doi)
  return identifier ? `https://doi.org/${encodeURIComponent(identifier)}` : undefined
}

function legacySources(audits: readonly AuditPoint[]): EvidenceSourceView[] {
  const byId = new Map<string, EvidenceSourceView>()
  for (const audit of audits) {
    if (!nonEmpty(audit.id)) continue
    const label = nonEmpty(audit.evidenceSource)
    if (!label) continue
    const id = sourceIdForAudit(audit)
    if (byId.has(id)) continue
    byId.set(id, {
      id,
      label,
      href: doiHref(audit.doi),
      identifier: nonEmpty(audit.doi),
      freshness: 'unknown',
    })
  }
  return [...byId.values()]
}

function legacyEvidenceTechnicalDetail(
  audit: AuditPoint,
): EvidenceNodeTechnicalDetailView | undefined {
  const detail: EvidenceNodeTechnicalDetailView = {
    technicalDetails: nonEmpty(audit.technicalDetails),
    measuredMetric: nonEmpty(audit.measuredMetric),
    inferredClaim: nonEmpty(audit.inferredClaim),
    evidenceSource: nonEmpty(audit.evidenceSource),
    auditFlag: audit.auditFlag,
  }
  return Object.values(detail).some(Boolean) ? detail : undefined
}

function legacyEvidenceNodes(audits: readonly AuditPoint[]): EvidenceNodeView[] {
  return audits.flatMap((audit, index) => {
    const id = nonEmpty(audit.id)
    const title = nonEmpty(audit.title)
    const summary = nonEmpty(audit.laymanSummary)
    if (!id || !title || !summary) return []

    const state: EvidenceNodeState =
      audit.category === 'failed'
        ? nonEmpty(audit.measuredMetric)
          ? 'contradicted'
          : 'recorded_context'
        : audit.category === 'conclusion_shift'
          ? 'mixed'
          : audit.category === 'inferred'
            ? 'not_measured'
            : 'confirmed'
    const claimNature: EvidenceClaimNature =
      audit.category === 'measured' ? 'measured' : 'rnawiki_judgement'

    return [
      {
        id,
        order: index + 1,
        label: GENERAL_RESEARCH_SUMMARY_COPY.findingLabel,
        professionalLabel: GENERAL_RESEARCH_SUMMARY_COPY.professionalFindingLabel,
        title,
        summary,
        state,
        claimNature,
        sourceIds: nonEmpty(audit.evidenceSource) ? [sourceIdForAudit(audit)] : [],
        // Legacy JSONB audit entries have not passed the claim/snapshot/programme checks.
        machineChecked: false,
        findingCodes: ['LEGACY_EVIDENCE_UNMAPPED'],
        technicalDetail: legacyEvidenceTechnicalDetail(audit),
      },
    ]
  })
}

export function trialDisplayState(trial: Partial<ClinicalTrialRecord>): StudyView['state'] {
  if (trial.endpointStatus === 'not_reported') return 'unknown'
  if (trial.endpointStatus === 'met') return 'measured'
  if (trial.endpointStatus === 'not_met') return 'failed'
  const result = nonEmpty(trial.statisticalPValue)?.toLowerCase()
  if (!result) return 'unknown'
  if (
    result.startsWith('not reported') ||
    result.includes('not yet reported') ||
    result.includes('has not reported') ||
    result.includes('not recorded') ||
    result.includes('no result exists') ||
    result.includes('results pending') ||
    result.includes('result unavailable') ||
    result === 'unknown' ||
    result === 'n/a'
  ) {
    return 'unknown'
  }
  if (trial.endpointMet === true) return 'measured'
  if (trial.endpointMet === false) return 'failed'
  return 'unknown'
}

function trialResultIsPending(trial: Partial<ClinicalTrialRecord>): boolean {
  if (trial.endpointStatus === 'not_reported') return true
  const value = nonEmpty(trial.statisticalPValue)?.toLowerCase()
  return Boolean(
    value &&
    (value.startsWith('not reported') ||
      value.includes('not yet reported') ||
      value.includes('has not reported') ||
      value.includes('no result exists') ||
      value.includes('results pending') ||
      value.includes('result unavailable')),
  )
}

function replicationDisplayLabel(trial: Partial<ClinicalTrialRecord>): string | undefined {
  const replication = trial.independentReplicationStatus
  if (!replication) return undefined
  if (replication === 'Replicated') {
    return 'Yes — an independent team reported a similar result.'
  }
  if (replication === 'Partially Replicated') {
    return 'Partly — another study found a similar result, but the information on this page does not show that an independent team repeated it.'
  }
  if (replication === 'Failed to Replicate') {
    return 'No — an independent attempt did not find the same result.'
  }
  if (trialResultIsPending(trial)) return undefined
  return 'Not yet — no independent team has repeated this result.'
}

function legacyStudyTitle(storedId: string): string | undefined {
  const title = storedId.match(/^((?:ORION|VICTORION)[-\s]?\d+)\s*\([^)]+\)\s*$/iu)?.[1]?.trim()
  return title && title !== storedId ? title : undefined
}

function legacyStudyResult(
  trial: Partial<ClinicalTrialRecord>,
): Pick<StudyView, 'result' | 'technicalResult'> {
  const stored = nonEmpty(trial.statisticalPValue)
  if (!stored) return {}
  if (trialResultIsPending(trial)) return { technicalResult: stored }

  const statisticalSuffix = stored.match(/\bP\s*(?:[<=>≤≥]|-?value\b)/iu)
  if (statisticalSuffix?.index !== undefined) {
    const effect = nonEmpty(stored.slice(0, statisticalSuffix.index).replace(/[;,\s]+$/u, ''))
    const technicalResult = nonEmpty(stored.slice(statisticalSuffix.index))
    return {
      ...(effect ? { result: effect } : {}),
      ...(technicalResult ? { technicalResult } : {}),
    }
  }

  if (
    trial.endpointStatus === 'met' ||
    trial.endpointStatus === 'not_met' ||
    typeof trial.endpointMet === 'boolean'
  ) {
    return { result: stored }
  }
  return { technicalResult: stored }
}

function legacyStudies(trials: readonly ClinicalTrialRecord[]): StudyView[] {
  return trials.flatMap((trial) => {
    const id = nonEmpty(trial.trialId)
    if (!id) return []
    const storedResult = legacyStudyResult(trial)
    return [
      {
        id,
        title: legacyStudyTitle(id),
        phase: nonEmpty(trial.phase),
        sampleSize: positiveInteger(trial.sampleSize),
        endpoint: nonEmpty(trial.primaryEndpoint),
        ...storedResult,
        state: trialDisplayState(trial),
        replication: replicationDisplayLabel(trial),
      },
    ]
  })
}

function legacyKeyOutcomes(drug: DrugDossier): KeyOutcomeView[] {
  const summary = drug.measuredVsInferredSummary as
    Partial<DrugDossier['measuredVsInferredSummary']> | null | undefined
  const groups: Array<
    readonly [
      EvidenceDisplayState,
      NonNullable<KeyOutcomeView['legacyGroup']>,
      string,
      readonly string[],
    ]
  > = [
    ['measured', 'measured_findings', 'Measured findings', stringList(summary?.strictlyMeasured)],
    [
      'inferred',
      'unsupported_assumptions',
      'Unsupported assumptions',
      stringList(summary?.unsupportedInferences),
    ],
    // These two legacy string arrays combine clinical results with regulatory, safety, access,
    // durability, and administrative context. Without a typed link, the mapper cannot safely call
    // each string a failed result, a measured benefit, or an unknown result.
    [
      'recorded_context',
      'earlier_setbacks_or_context',
      'Earlier setbacks or context',
      stringList(summary?.whatFailedInitially),
    ],
    [
      'recorded_context',
      'practical_observations',
      'Practical observations',
      stringList(summary?.realWorldOutcome),
    ],
  ]
  let index = 0
  return groups.flatMap(([state, legacyGroup, legacyGroupLabel, values]) =>
    values.flatMap((label) => {
      const value = nonEmpty(label)
      if (!value) return []
      index += 1
      return [
        {
          id: `legacy-outcome-${index}`,
          label: value,
          state,
          legacyGroup,
          legacyGroupLabel,
          sourceIds: [],
        },
      ]
    }),
  )
}

function legacyMechanismSteps(steps: readonly MechanismStep[]): MechanismStepView[] {
  return steps.flatMap((step, index) => {
    const title = nonEmpty(step.title)
    const plainLanguage = nonEmpty(step.laymanDesc)
    if (!title || !plainLanguage) return []
    const order = positiveInteger(step.step) ?? index + 1
    return [
      {
        id: `mechanism-${order}`,
        order,
        title,
        plainLanguage,
        technicalDetail: nonEmpty(step.molecularDetail),
        claimIds: [],
        sourceIds: [],
      },
    ]
  })
}

/**
 * Compatibility path while normalized programme revisions are rolled out. All medical
 * text comes from the database-backed DrugDossier; missing content stays missing and every legacy
 * evidence item is marked as not yet machine-mapped.
 */
export function legacyMedicineDossierView(drug: DrugDossier): MedicineDossierViewModel {
  const programmeId = `legacy:${drug.id}`
  const selectedUse = nonEmpty(drug.patientFriendlyIndication) ?? nonEmpty(drug.indication)
  const programmeLabel =
    selectedUse ?? 'What this medicine was used or studied for is not documented'
  const mechanismSummary = legacyMechanismSummary(drug)
  const mainLimitation = legacyMainLimitation(drug)
  const verdict = nonEmpty(drug.oneSentenceVerdict) ?? ''
  const audits = listOf<AuditPoint>(drug.keyAudits)
  const trials = listOf<ClinicalTrialRecord>(drug.trials)
  const mechanismSteps = listOf<MechanismStep>(drug.mechanismSteps)
  const measuredFinding = audits.find((audit) => audit.category === 'measured')?.laymanSummary
  const readerSummary = buildLegacyDossierReaderSummary(drug, {
    ...readerLanguageContext(drug),
    selectedUse,
    exactText: verdict,
    measuredFinding,
    mainUncertainty: mainLimitation,
  })

  return {
    slug: drug.id,
    name: drug.name,
    tradeName: nonEmpty(drug.tradeName),
    modality: drug.modality,
    approvalStatus: drug.approvalStatus,
    statusBadge: { kind: 'medicine_approval', value: drug.approvalStatus },
    programmes: [
      {
        id: programmeId,
        label: programmeLabel,
        status: drug.approvalStatus,
        selected: true,
      },
    ],
    selectedProgrammeId: programmeId,
    selectedProgrammeLabel: programmeLabel,
    selectedProgrammeStatus: drug.approvalStatus,
    bindingState: 'legacy_record',
    verdict,
    readerSummary,
    mechanismSummary,
    mainLimitation,
    tenSecondWordCount: countReaderSummaryWords(readerSummary),
    evidenceNodes: legacyEvidenceNodes(audits),
    studies: legacyStudies(trials),
    keyOutcomes: legacyKeyOutcomes(drug),
    mechanismSteps: legacyMechanismSteps(mechanismSteps),
    timelineEvents: [],
    sources: legacySources(audits),
    freshness: 'unknown',
    freshnessLabel: nonEmpty(drug.recentAuditDate)
      ? `Summary last checked: ${drug.recentAuditDate}`
      : 'Freshness not yet verified',
    review: {
      publishedAt: nonEmpty(drug.lastEditedAt),
      reviewerLabel: nonEmpty(drug.lastEditedBy),
      historyHref: `/d/${encodeURIComponent(drug.id)}/history`,
    },
    machineFindingCodes: ['LEGACY_PROGRAMME_UNSCOPED', 'LEGACY_FRESHNESS_UNKNOWN'],
    medicineRecord: medicineRecordContext(drug),
    dynamicModules: legacyDossierDynamicModules(drug),
    completionAssessment: drug.completionAssessment,
    inventoryResolution: drug.inventoryResolution,
    trialRegistrations: drug.trialRegistrations,
    trialResults: drug.trialResults,
  }
}

/** Maps a normalized, published programme read model into the same public component contract. */
export function normalizedMedicineDossierView(
  drug: DrugDossier,
  normalized: NormalizedDossierInput,
): MedicineDossierViewModel {
  const selected = normalized.selected
  const mechanismSummary = selected.mechanismSummary
  const mainLimitation = nonEmpty(selected.mainLimitation)
  const verdict = nonEmpty(selected.verdict) ?? ''
  const readerSummary = buildPublishedProgrammeReaderSummary({
    ...readerLanguageContext(
      drug,
      selected.studies.flatMap((study) => {
        const id = nonEmpty(study.id)
        const title = nonEmpty(study.title)
        if (!id) return []
        return [title && title !== id ? `${title} (${id})` : id]
      }),
    ),
    selectedUse: selected.label,
    exactText: verdict,
    plainMechanism: mechanismSummary.change,
    bestSupportedFinding: mechanismSummary.observed,
    mainUncertainty: mainLimitation,
  })
  return {
    slug: drug.id,
    name: drug.name,
    tradeName: nonEmpty(drug.tradeName),
    modality: drug.modality,
    approvalStatus: selected.status,
    statusBadge: selected.statusBadge ?? { kind: 'programme_status', value: selected.status },
    programmes: normalized.programmes.map((programme) => ({
      ...programme,
      href: programme.href ?? `?programme=${encodeURIComponent(programme.id)}`,
      selected: programme.id === selected.id,
    })),
    selectedProgrammeId: selected.id,
    selectedProgrammeLabel: selected.label,
    selectedProgrammeStatus: selected.status,
    bindingState: 'published_programme',
    verdict,
    readerSummary,
    summaryEvidence: selected.summaryEvidence,
    mechanismSummary,
    mainLimitation,
    tenSecondWordCount: countReaderSummaryWords(readerSummary),
    evidenceNodes: selected.evidenceNodes,
    studies: selected.studies,
    keyOutcomes: selected.keyOutcomes,
    mechanismSteps: selected.mechanismSteps,
    timelineEvents: selected.timelineEvents,
    sources: selected.sources,
    freshness: selected.freshness,
    freshnessLabel: selected.freshnessLabel,
    review: {
      ...selected.review,
      historyHref: selected.review.historyHref ?? `/d/${encodeURIComponent(drug.id)}/history`,
    },
    conclusion: selected.conclusion,
    machineFindingCodes: selected.machineFindingCodes,
    medicineRecord: publishedProgrammeMedicineRecordContext(drug),
    dynamicModules: selected.dynamicModules ?? legacyDossierDynamicModules(drug),
    completionAssessment: drug.completionAssessment,
    inventoryResolution: drug.inventoryResolution,
    trialRegistrations: drug.trialRegistrations,
    trialResults: drug.trialResults,
  }
}
