import type {
  ClaimDirection,
  ClaimNature,
  ClaimSourceRelationship,
  ProgrammeEvidenceReadModel,
  StoppedProgrammeVerdict,
  StoppingReasonCategory,
} from '@/lib/evidence/types'
import { resolveSafeSourceLocator } from '@/lib/source-locator'
import type { DrugDossier } from '@/lib/types'

/**
 * Optional dossier modules use an explicit three-state contract.
 *
 * Components may render only `ready` data. `absent` means that there is no applicable structured
 * record; `hidden` means that a related value exists but publishing it in that visual form would
 * overstate the available structure or provenance. Hidden reasons are diagnostics, not reader
 * copy.
 */
export type DossierModuleState<T> =
  | { status: 'ready'; data: T }
  | { status: 'absent'; reason: 'not_recorded' | 'not_applicable' }
  | {
      status: 'hidden'
      reason:
        | 'no_published_answer'
        | 'missing_exact_source_binding'
        | 'missing_structured_comparator_values'
        | 'ambiguous_structured_comparison'
        | 'missing_safe_verdict_dependency'
        | 'missing_structured_timepoints'
        | 'missing_reviewed_failure_classification'
        | 'inconsistent_programme_state'
        | 'missing_structured_product_records'
        | 'missing_structured_region_or_date'
        | 'missing_anatomy_coordinates'
        | 'medicine_wide_context_not_programme_reviewed'
    }

export interface DossierClaimSourceBindingView {
  sourceId: string
  claimId: string
  relationship: ClaimSourceRelationship
  statement: string
}

export interface DossierOutcomeComparisonView {
  claimId: string
  endpoint: string
  population?: string
  timepoint: string
  /** Both arms share the one exact unit stored on their common published claim. */
  intervention: { label: string; value: string; unit: string }
  comparator: { label: string; value: string; unit: string }
  sourceIds: string[]
  sourceClaimBindings: DossierClaimSourceBindingView[]
}

export interface DossierSafetyFindingView {
  id: string
  statement: string
  claimNature: ClaimNature
  endpoint?: string
  exactResult?: string
  uncertaintyInterval?: string
  population?: string
  comparator?: string
  timepoint?: string
  direction: ClaimDirection
  sourceIds: string[]
  sourceClaimBindings: DossierClaimSourceBindingView[]
}

export interface DossierSafetyModuleView {
  scope: 'selected_programme'
  findings: DossierSafetyFindingView[]
  /** Other safety-labelled claims were withheld because an exact supporting source was absent. */
  withheldFindingCount: number
}

export interface DossierPharmacokineticFindingView {
  id: string
  statement: string
  timepoint: string
  endpoint?: string
  exactResult?: string
  uncertaintyInterval?: string
  population?: string
  direction: ClaimDirection
  sourceIds: string[]
  sourceClaimBindings: DossierClaimSourceBindingView[]
}

export interface DossierPharmacokineticsModuleView {
  scope: 'selected_programme'
  /**
   * Stored timepoints are exact text rather than normalized durations. Findings therefore remain
   * independent records and must not be presented as a chronological sequence or time axis.
   */
  presentation: 'independent_findings'
  chronology: 'not_established'
  findings: DossierPharmacokineticFindingView[]
  withheldFindingCount: number
}

export interface DossierFailureSourceBindingView extends DossierClaimSourceBindingView {
  verdictRelationship: 'SUPPORTING' | 'CONTRADICTORY'
}

export interface DossierProgrammeFailureModuleView {
  scope: 'selected_programme'
  code: StoppedProgrammeVerdict
  readerLabel: string
  professionalLabel: string
  reason: string
  stoppingReasonCategory?: StoppingReasonCategory
  sourceIds: string[]
  sourceClaimBindings: DossierFailureSourceBindingView[]
}

export interface DossierRecordedSourceView {
  label: string
  identifier: string
  canonicalLocator: string
  href?: string
}

export interface DossierReportedCostView {
  kind: 'reported_production_cost' | 'reported_retail_or_list_price'
  value: string
  source: DossierRecordedSourceView
}

export interface DossierReportedCostsModuleView {
  scope: 'medicine_wide_background'
  /** Exact source reports may be shown separately; they are not a regional price comparison. */
  presentation: 'separate_source_reports'
  reports: DossierReportedCostView[]
  withheldReportCount: number
  regionalComparisonAvailable: false
}

export interface DossierProductFormsModuleView {
  products: Array<{
    name: string
    form: string
    jurisdiction?: string
    source: DossierRecordedSourceView
  }>
}

export interface DossierBodyMapModuleView {
  locations: Array<{
    anatomyCode: string
    label: string
    x: number
    y: number
    sourceId: string
  }>
}

export interface DossierDynamicModulesView {
  outcomeComparison: DossierModuleState<DossierOutcomeComparisonView>
  safety: DossierModuleState<DossierSafetyModuleView>
  pharmacokinetics: DossierModuleState<DossierPharmacokineticsModuleView>
  programmeFailure: DossierModuleState<DossierProgrammeFailureModuleView>
  productsAndForms: DossierModuleState<DossierProductFormsModuleView>
  reportedCosts: DossierModuleState<DossierReportedCostsModuleView>
  bodyMap: DossierModuleState<DossierBodyMapModuleView>
}

type DynamicMedicineInput = Pick<
  DrugDossier,
  'tradeName' | 'deliverySystem' | 'pricing' | 'anatomicalSite'
>

type SelectedProgramme = NonNullable<ProgrammeEvidenceReadModel['selectedProgramme']>
type PublishedClaim = SelectedProgramme['claims'][number]

const SAFETY_OUTCOME_TYPES = new Set(['SAFETY', 'ADVERSE_EVENT', 'ADVERSE_EVENTS', 'TOLERABILITY'])
const PHARMACOKINETIC_OUTCOME_TYPES = new Set([
  'PHARMACOKINETIC',
  'PHARMACOKINETICS',
  'PK',
  'EXPOSURE',
  'DRUG_EXPOSURE',
])

function ready<T>(data: T): DossierModuleState<T> {
  return { status: 'ready', data }
}

function absent<T>(reason: 'not_recorded' | 'not_applicable'): DossierModuleState<T> {
  return { status: 'absent', reason }
}

function hidden<T>(
  reason: Extract<DossierModuleState<T>, { status: 'hidden' }>['reason'],
): DossierModuleState<T> {
  return { status: 'hidden', reason }
}

function text(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : undefined
}

function objectValue(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined
}

function normalizedOutcomeType(value: string | null): string | undefined {
  return text(value)
    ?.replace(/[\s-]+/gu, '_')
    .toUpperCase()
}

function displayNumericValue(value: string | null): string | undefined {
  const stored = text(value)
  if (!stored || !/^-?\d+\.\d+$/u.test(stored)) return stored
  const withoutPadding = stored.replace(/\.?0+$/u, '')
  return withoutPadding === '-0' ? '0' : withoutPadding
}

/** A comparison value must be a structured decimal, never a number recovered from prose. */
function structuredNumericValue(value: string | null): string | undefined {
  const stored = text(value)
  if (!stored || !/^-?\d+(?:\.\d+)?$/u.test(stored)) return undefined
  const numeric = Number(stored)
  if (!Number.isFinite(numeric)) return undefined
  return displayNumericValue(stored)
}

function exactResult(claim: PublishedClaim): string | undefined {
  const value = displayNumericValue(claim.numericValue)
  if (!value) return undefined
  const unit = text(claim.numericUnit)
  return unit ? `${value} ${unit}` : value
}

function claimSourceBindings(claim: PublishedClaim): DossierClaimSourceBindingView[] {
  return claim.sources.map((source) => ({
    sourceId: source.id,
    claimId: claim.id,
    relationship: source.relationship,
    statement: claim.plainLanguageText,
  }))
}

function hasExactSupportingSource(claim: PublishedClaim): boolean {
  return claim.sources.some((source) => source.relationship === 'SUPPORTS')
}

function safetyModule(selected: SelectedProgramme): DossierDynamicModulesView['safety'] {
  const candidates = selected.claims.filter((claim) =>
    SAFETY_OUTCOME_TYPES.has(normalizedOutcomeType(claim.outcomeType) ?? ''),
  )
  if (candidates.length === 0) return absent('not_recorded')
  if (!selected.verdict) return hidden('no_published_answer')

  // Preserve authorship/interpretation nature exactly. A sponsor report or reviewed RNAWiki
  // judgement may be shown only with its nature label; it must never inherit measured styling.
  const publishable = candidates.filter(
    (claim) => claim.nature !== 'UNKNOWN' && hasExactSupportingSource(claim),
  )
  if (publishable.length === 0) return hidden('missing_exact_source_binding')

  return ready({
    scope: 'selected_programme',
    findings: publishable.map((claim) => {
      const bindings = claimSourceBindings(claim)
      return {
        id: claim.id,
        statement: claim.plainLanguageText,
        claimNature: claim.nature,
        endpoint: text(claim.endpoint),
        exactResult: exactResult(claim),
        uncertaintyInterval: text(claim.uncertaintyInterval),
        population: text(claim.population),
        comparator: text(claim.comparator),
        timepoint: text(claim.timepoint),
        direction: claim.direction,
        sourceIds: [...new Set(bindings.map((binding) => binding.sourceId))],
        sourceClaimBindings: bindings,
      }
    }),
    withheldFindingCount: candidates.length - publishable.length,
  })
}

function pharmacokineticsModule(
  selected: SelectedProgramme,
): DossierDynamicModulesView['pharmacokinetics'] {
  const candidates = selected.claims.filter(
    (claim) =>
      claim.evidenceNodeType === 'USEFUL_EXPOSURE' ||
      PHARMACOKINETIC_OUTCOME_TYPES.has(normalizedOutcomeType(claim.outcomeType) ?? ''),
  )
  if (candidates.length === 0) return absent('not_recorded')
  if (!selected.verdict) return hidden('no_published_answer')

  const withTimepoint = candidates.filter((claim) => text(claim.timepoint))
  if (withTimepoint.length === 0) return hidden('missing_structured_timepoints')
  const publishable = withTimepoint.filter(
    (claim) =>
      (claim.nature === 'MEASURED' || claim.nature === 'REGULATORY_FINDING') &&
      hasExactSupportingSource(claim),
  )
  if (publishable.length === 0) return hidden('missing_exact_source_binding')

  return ready({
    scope: 'selected_programme',
    presentation: 'independent_findings',
    chronology: 'not_established',
    findings: publishable.map((claim) => {
      const bindings = claimSourceBindings(claim)
      return {
        id: claim.id,
        statement: claim.plainLanguageText,
        timepoint: text(claim.timepoint)!,
        endpoint: text(claim.endpoint),
        exactResult: exactResult(claim),
        uncertaintyInterval: text(claim.uncertaintyInterval),
        population: text(claim.population),
        direction: claim.direction,
        sourceIds: [...new Set(bindings.map((binding) => binding.sourceId))],
        sourceClaimBindings: bindings,
      }
    }),
    withheldFindingCount: candidates.length - publishable.length,
  })
}

const STOPPED_VERDICT_LABELS: Record<StoppedProgrammeVerdict, string> = {
  IDEA_FAILED: 'The biological idea was not supported for this use',
  MOLECULE_FAILED: 'This medicine candidate did not work for this use',
  TEST_UNANSWERED: 'The studies did not answer this question',
}

function programmeFailureModule(
  selected: SelectedProgramme,
): DossierDynamicModulesView['programmeFailure'] {
  const stopped = selected.status === 'STOPPED' || selected.status === 'WITHDRAWN'
  const code = selected.verdict?.verdictCode
  if (!stopped && !code) return absent('not_applicable')
  if (!stopped && code) return hidden('inconsistent_programme_state')
  if (!selected.verdict || !code) return hidden('missing_reviewed_failure_classification')

  const claimById = new Map(selected.claims.map((claim) => [claim.id, claim]))
  const verdictClaims = [
    ...selected.verdict.supportingClaimIds.map((claimId) => ({
      claimId,
      verdictRelationship: 'SUPPORTING' as const,
    })),
    ...selected.verdict.contradictoryClaimIds.map((claimId) => ({
      claimId,
      verdictRelationship: 'CONTRADICTORY' as const,
    })),
  ]
  const bindings: DossierFailureSourceBindingView[] = verdictClaims.flatMap(
    ({ claimId, verdictRelationship }) => {
      const claim = claimById.get(claimId)
      if (!claim) return []
      return claimSourceBindings(claim).map((binding) => ({ ...binding, verdictRelationship }))
    },
  )
  const hasSupportingEvidence = bindings.some(
    (binding) =>
      binding.verdictRelationship === 'SUPPORTING' && binding.relationship === 'SUPPORTS',
  )
  if (!hasSupportingEvidence) return hidden('missing_exact_source_binding')

  return ready({
    scope: 'selected_programme',
    code,
    readerLabel: STOPPED_VERDICT_LABELS[code],
    professionalLabel: selected.verdict.professionalLabel,
    reason: selected.verdict.oneSentenceReason,
    stoppingReasonCategory:
      selected.stoppingReasonCategory === 'UNKNOWN' ? undefined : selected.stoppingReasonCategory,
    sourceIds: [...new Set(bindings.map((binding) => binding.sourceId))],
    sourceClaimBindings: bindings,
  })
}

function outcomeComparisonModule(
  selected: SelectedProgramme,
): DossierDynamicModulesView['outcomeComparison'] {
  const recordedCandidates = selected.claims.filter(
    (claim) =>
      claim.nature === 'MEASURED' &&
      Boolean(
        text(claim.comparator) || text(claim.comparatorGroup) || text(claim.comparatorValue),
      ) &&
      Boolean(text(claim.endpoint) || normalizedOutcomeType(claim.outcomeType)),
  )
  if (recordedCandidates.length === 0) return absent('not_recorded')
  if (!selected.verdict) return hidden('no_published_answer')

  const structuredCandidates = recordedCandidates.flatMap((claim) => {
    const interventionLabel = text(claim.intervention)
    const interventionValue = structuredNumericValue(claim.numericValue)
    const comparatorLabel = text(claim.comparatorGroup)
    const comparatorValue = structuredNumericValue(claim.comparatorValue)
    const unit = text(claim.numericUnit)
    const endpoint = text(claim.endpoint)
    if (
      !interventionLabel ||
      interventionValue === undefined ||
      !comparatorLabel ||
      comparatorValue === undefined ||
      !unit ||
      !endpoint
    ) {
      return []
    }
    return [
      {
        claim,
        interventionLabel,
        interventionValue,
        comparatorLabel,
        comparatorValue,
        unit,
        endpoint,
      },
    ]
  })
  if (structuredCandidates.length === 0) return hidden('missing_structured_comparator_values')

  const withTimepoint = structuredCandidates.filter(({ claim }) => text(claim.timepoint))
  if (withTimepoint.length === 0) return hidden('missing_structured_timepoints')

  const sourceBound = withTimepoint.filter(({ claim }) => hasExactSupportingSource(claim))
  if (sourceBound.length === 0) return hidden('missing_exact_source_binding')

  const verdictSupportingClaimIds = new Set(
    selected.verdict.claimRelationships
      .filter((relationship) => relationship.relationship === 'SUPPORTING')
      .map((relationship) => relationship.claimId),
  )
  const verdictSafe = sourceBound.filter(({ claim }) => verdictSupportingClaimIds.has(claim.id))
  if (verdictSafe.length === 0) return hidden('missing_safe_verdict_dependency')

  // Newer reviewed answers bind the visible finding to exact claims. Respect that narrower link;
  // older publications without field-level dependencies may still use one unambiguous claim that
  // is explicitly supporting in the current verdict.
  const findingDependencies = selected.summaryFieldDependencies.filter(
    (dependency) =>
      dependency.verdictRevisionId === selected.verdict!.id &&
      dependency.fieldPath === 'summary.bestSupportedFinding',
  )
  const findingClaimIds = new Set(findingDependencies.map((dependency) => dependency.claimId))
  const safeCandidates =
    findingClaimIds.size > 0
      ? verdictSafe.filter(({ claim }) => findingClaimIds.has(claim.id))
      : verdictSafe
  if (safeCandidates.length === 0) return hidden('missing_safe_verdict_dependency')
  if (safeCandidates.length !== 1) return hidden('ambiguous_structured_comparison')

  const candidate = safeCandidates[0]!
  const supportingBindings = claimSourceBindings(candidate.claim).filter(
    (binding) => binding.relationship === 'SUPPORTS',
  )

  return ready({
    claimId: candidate.claim.id,
    endpoint: candidate.endpoint,
    population: text(candidate.claim.population),
    timepoint: text(candidate.claim.timepoint)!,
    intervention: {
      label: candidate.interventionLabel,
      value: candidate.interventionValue,
      unit: candidate.unit,
    },
    comparator: {
      label: candidate.comparatorLabel,
      value: candidate.comparatorValue,
      unit: candidate.unit,
    },
    sourceIds: [...new Set(supportingBindings.map((binding) => binding.sourceId))],
    sourceClaimBindings: supportingBindings,
  })
}

function recordedSource(value: unknown): DossierRecordedSourceView | undefined {
  const source = objectValue(value)
  if (!source) return undefined
  const label = text(source.label)
  const identifier = text(source.identifier)
  if (!label || !identifier) return undefined

  const kind = text(source.kind)?.toLowerCase()
  const canonicalLocator =
    kind === 'doi'
      ? `doi:${identifier}`
      : kind === 'pmid'
        ? `pmid:${identifier}`
        : kind === 'nct'
          ? `nct:${identifier}`
          : identifier
  const resolved = resolveSafeSourceLocator(canonicalLocator)
  if (!resolved) return undefined

  return {
    label,
    identifier,
    canonicalLocator: resolved.canonicalLocator,
    href: resolved.href ?? undefined,
  }
}

export function reportedCostsModule(
  pricingValue: unknown,
): DossierDynamicModulesView['reportedCosts'] {
  const pricing = objectValue(pricingValue)
  if (!pricing) return absent('not_recorded')
  const candidates = [
    {
      kind: 'reported_production_cost' as const,
      value: text(pricing.synthesisCostPerDose),
      source: recordedSource(pricing.costSource),
    },
    {
      kind: 'reported_retail_or_list_price' as const,
      value: text(pricing.retailPricePerDoseOrYear),
      source: recordedSource(pricing.priceSource),
    },
  ].filter((candidate) => candidate.value)
  if (candidates.length === 0) return absent('not_recorded')

  const reports: DossierReportedCostView[] = candidates.flatMap((candidate) =>
    candidate.value && candidate.source
      ? [{ kind: candidate.kind, value: candidate.value, source: candidate.source }]
      : [],
  )
  if (reports.length === 0) return hidden('missing_exact_source_binding')

  return ready({
    scope: 'medicine_wide_background',
    presentation: 'separate_source_reports',
    reports,
    withheldReportCount: candidates.length - reports.length,
    // Region, currency and effective date are not separate fields in the current schema. Exact
    // source text remains intact, but the UI must not turn it into a cross-region comparison.
    regionalComparisonAvailable: false,
  })
}

function productsAndFormsModule(
  medicine: DynamicMedicineInput,
): DossierDynamicModulesView['productsAndForms'] {
  const hasProductLikeContext = Boolean(
    text(medicine.tradeName) || text(medicine.deliverySystem?.type),
  )
  return hasProductLikeContext
    ? hidden('missing_structured_product_records')
    : absent('not_recorded')
}

function bodyMapModule(medicine: DynamicMedicineInput): DossierDynamicModulesView['bodyMap'] {
  // A location string remains useful in mechanism prose, but it is not an anatomy code or a
  // coordinate. Never guess a point on a decorative human figure from that string.
  return text(medicine.anatomicalSite)
    ? hidden('missing_anatomy_coordinates')
    : absent('not_recorded')
}

/** Builds the honest optional-module baseline for a medicine-wide legacy record. */
export function legacyDossierDynamicModules(
  medicine: DynamicMedicineInput,
): DossierDynamicModulesView {
  return {
    outcomeComparison: absent('not_recorded'),
    safety: text(medicine.deliverySystem?.safetyProfile)
      ? hidden('medicine_wide_context_not_programme_reviewed')
      : absent('not_recorded'),
    pharmacokinetics: absent('not_recorded'),
    programmeFailure: absent('not_applicable'),
    productsAndForms: productsAndFormsModule(medicine),
    reportedCosts: reportedCostsModule(medicine.pricing),
    bodyMap: bodyMapModule(medicine),
  }
}

/**
 * Builds modules only from the selected programme's current published graph. Medicine-wide cost
 * reports remain explicitly background-scoped; all clinical modules stay programme-scoped.
 */
export function programmeDossierDynamicModules(
  medicine: DynamicMedicineInput,
  selected: SelectedProgramme,
): DossierDynamicModulesView {
  return {
    outcomeComparison: outcomeComparisonModule(selected),
    safety: safetyModule(selected),
    pharmacokinetics: pharmacokineticsModule(selected),
    programmeFailure: programmeFailureModule(selected),
    productsAndForms: productsAndFormsModule(medicine),
    reportedCosts: reportedCostsModule(medicine.pricing),
    bodyMap: bodyMapModule(medicine),
  }
}
