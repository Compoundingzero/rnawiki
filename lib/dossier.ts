// Maps legacy medicine rows without inventing missing content. Derived counts are recomputed from
// their source arrays instead of copied from stored totals.

import type { drugs } from '@/db/schema'
import { cleanLegacyPublicNarrative, cleanPublicLabelFields } from '@/lib/public-data-integrity'
import type {
  ApprovalStatus,
  AuditPoint,
  CommunityNote,
  DeliverySystem,
  DrugDossier,
  DrugModality,
  MeasuredVsInferredSummary,
  TrialRegistrationRecord,
  TrialRegistrationsView,
  TrialResultRecord,
  TrialResultsView,
} from '@/lib/types'
import type { StaleSourceSummary } from '@/lib/dossier-question-issues'

/**
 * A `drugs` row as every query in this codebase selects it: all columns except the generated
 * `search_vector`. That column is a tsvector of the whole record, it is only ever used inside the
 * database's own index, and dragging it across the wire on every read costs more than the rest of
 * the row put together.
 */
export type DrugRow = Omit<typeof drugs.$inferSelect, 'searchVector'>

// ---------------------------------------------------------------------------
// Derived counts
// ---------------------------------------------------------------------------

export type AuditPointsCount = DrugDossier['auditPointsCount']

/** Counts audit points by category. The single source of the four numbers the header prints. */
export function countAuditPoints(audits: readonly AuditPoint[]): AuditPointsCount {
  const counts: AuditPointsCount = { measured: 0, inferred: 0, failed: 0, conclusionShift: 0 }
  for (const audit of audits) {
    switch (audit.category) {
      case 'measured':
        counts.measured += 1
        break
      case 'inferred':
        counts.inferred += 1
        break
      case 'failed':
        counts.failed += 1
        break
      case 'conclusion_shift':
        counts.conclusionShift += 1
        break
      // No default: `category` is a closed union, so an unhandled value is a compile error
      // rather than a silently uncounted audit point.
    }
  }
  return counts
}

// ---------------------------------------------------------------------------
// Row -> dossier
// ---------------------------------------------------------------------------

/** Fresh objects, not shared constants: a caller that mutates one dossier must not touch another. */
function emptyMeasuredVsInferred(): MeasuredVsInferredSummary {
  return {
    strictlyMeasured: [],
    unsupportedInferences: [],
    whatFailedInitially: [],
    realWorldOutcome: [],
  }
}

function emptyDeliverySystem(): DeliverySystem {
  return { type: '', description: '', safetyProfile: '' }
}

export interface RowToDossierOptions {
  /** Community notes for this drug. Left undefined when the caller did not load them, which is
   *  different from a drug that genuinely has none (an empty array). */
  notes?: CommunityNote[]
  /** Exact persisted drift checks for bindings in this row's current recorded envelope. */
  driftedSources?: readonly StaleSourceSummary[]
  /** Stored completion assessment, loaded by the caller; undefined when not loaded or not run. */
  completionAssessment?: DrugDossier['completionAssessment']
  /** Stored inventory resolution, loaded by the caller; undefined when not loaded or not run. */
  inventoryResolution?: DrugDossier['inventoryResolution']
  /** Ranked registrations from the stored registry pass; undefined when not loaded or none matched. */
  trialRegistrations?: DrugDossier['trialRegistrations']
  trialResults?: DrugDossier['trialResults']
}

export function rowToDossier(row: DrugRow, opts?: RowToDossierOptions): DrugDossier {
  const labelFields = cleanPublicLabelFields({
    medicineSlug: row.slug,
    indication: row.indication,
    patientFriendlyIndication: row.patientFriendlyIndication,
  })

  return {
    // Public dossier identity is the slug; internal primary keys stay private.
    id: row.slug,
    name: row.name,
    tradeName: row.tradeName ?? undefined,
    sponsor: row.sponsor,
    targetGene: row.targetGene,
    targetProtein: cleanLegacyPublicNarrative(row.slug, row.targetProtein),
    // The Postgres enums are declared with exactly the literals of these unions (db/schema.ts
    // mirrors lib/types.ts by hand), so the column types already are the union.
    modality: row.modality satisfies DrugModality,
    approvalStatus: row.approvalStatus satisfies ApprovalStatus,
    approvalYear: row.approvalYear ?? undefined,
    indication: labelFields.indication,
    patientFriendlyIndication: labelFields.patientFriendlyIndication,
    conditionContext: row.conditionContext ?? undefined,
    oneSentenceVerdict: row.oneSentenceVerdict,
    laymanHowItWorks: cleanLegacyPublicNarrative(row.slug, row.laymanHowItWorks),
    auditConfidence: row.auditConfidence,
    confidenceScore: row.confidenceScore,
    pricing: row.pricing ?? undefined,
    recordedBackground: row.recordedBackground ?? undefined,
    sourceFreshness: opts?.driftedSources,
    completionAssessment: opts?.completionAssessment,
    inventoryResolution: opts?.inventoryResolution,
    trialRegistrations: opts?.trialRegistrations,
    trialResults: opts?.trialResults,
    substitutes: row.substitutes ?? undefined,
    molecularSchema: row.molecularSchema ?? undefined,
    auditPointsCount: countAuditPoints(row.keyAudits),
    keyAudits: row.keyAudits,
    mechanismSteps: row.mechanismSteps,
    trials: row.trials,
    // Required by the component contract but nullable in the database. Empty arrays are the honest
    // rendering of "nothing recorded"; `missingSections()` is what tells the page to say so.
    measuredVsInferredSummary: row.measuredVsInferredSummary ?? emptyMeasuredVsInferred(),
    deliverySystem: row.deliverySystem ?? emptyDeliverySystem(),
    commonQuestions: row.commonQuestions,
    communityNotes: opts?.notes,
    recentAuditDate: row.recentAuditDate,
    hasDiscrepancy: row.hasDiscrepancy,

    dossierDepth: row.dossierDepth,
    sourceProvenance: row.sourceProvenance,
    anatomicalSite: row.anatomicalSite
      ? cleanLegacyPublicNarrative(row.slug, row.anatomicalSite)
      : undefined,
    revisionCount: row.revisionCount,
    lastEditedAt: row.lastEditedAt?.toISOString(),
    lastEditedBy: row.lastEditedBy ?? undefined,
    isMachineVerifiedStructure: row.isMachineVerifiedStructure,
    viewCount: row.viewCount,
  }
}

// ---------------------------------------------------------------------------
// Trial registrations
// ---------------------------------------------------------------------------

/** How many registrations the page shows per record. Everything beyond it is counted, not listed. */
export const TRIAL_REGISTRATIONS_SHOWN_LIMIT = 8

/** The ordering rule, in the words the page prints beside the list. */
export const TRIAL_REGISTRATIONS_ORDER_SENTENCE =
  'Registrations with results posted on ClinicalTrials.gov come first, then completed studies, then larger enrolments, then the most recent start dates.'

const NCT_ID = /^NCT\d{8}$/u

function optionalText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function textList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '')
    : []
}

/**
 * Re-reads one stored study summary defensively. The stored shape is what `summarizeStudy` wrote,
 * but a JSON column is not a type, so every field is checked before it reaches a page. Anything
 * that is not the expected primitive becomes the absent value rather than an invented one.
 */
export function toTrialRegistrationRecord(raw: unknown): TrialRegistrationRecord | null {
  if (!raw || typeof raw !== 'object') return null
  const study = raw as Record<string, unknown>
  const nctId = optionalText(study.nctId)
  if (!nctId || !NCT_ID.test(nctId)) return null
  const enrollment = (study.enrollment ?? {}) as Record<string, unknown>
  const sponsor = (study.leadSponsor ?? {}) as Record<string, unknown>
  const eligibility = (study.eligibility ?? {}) as Record<string, unknown>
  const design = (study.design ?? {}) as Record<string, unknown>
  return {
    nctId,
    briefTitle: optionalText(study.briefTitle),
    overallStatus: optionalText(study.overallStatus),
    studyType: optionalText(study.studyType),
    phases: textList(study.phases),
    hasResults: study.hasResults === true,
    resultsFirstPostDate: optionalText(study.resultsFirstPostDate),
    startDate: optionalText(study.startDate),
    primaryCompletionDate: optionalText(study.primaryCompletionDate),
    completionDate: optionalText(study.completionDate),
    lastUpdatePostDate: optionalText(study.lastUpdatePostDate),
    whyStopped: optionalText(study.whyStopped),
    enrollment: {
      count:
        typeof enrollment.count === 'number' && Number.isFinite(enrollment.count)
          ? enrollment.count
          : null,
      type: optionalText(enrollment.type),
    },
    leadSponsor: { name: optionalText(sponsor.name), class: optionalText(sponsor.class) },
    conditions: textList(study.conditions),
    matchedInterventionNames: textList(study.matchedInterventionNames),
    eligibility: {
      sex: optionalText(eligibility.sex),
      minimumAge: optionalText(eligibility.minimumAge),
      maximumAge: optionalText(eligibility.maximumAge),
      stdAges: textList(eligibility.stdAges),
      healthyVolunteers:
        typeof eligibility.healthyVolunteers === 'boolean' ? eligibility.healthyVolunteers : null,
    },
    primaryOutcomes: Array.isArray(study.primaryOutcomes)
      ? study.primaryOutcomes.flatMap((outcome) => {
          const entry = (outcome ?? {}) as Record<string, unknown>
          const measure = optionalText(entry.measure)
          return measure ? [{ measure, timeFrame: optionalText(entry.timeFrame) }] : []
        })
      : [],
    design: {
      allocation: optionalText(design.allocation),
      masking: optionalText(design.masking),
      primaryPurpose: optionalText(design.primaryPurpose),
    },
  }
}

/**
 * The page order: results posted first, then completed, then larger enrolments, then the most
 * recent start date. The NCT id closes the order so two runs over the same rows agree exactly.
 * Nothing in the rule reads a result; "results posted" is the registry flag, not an outcome.
 */
export function rankTrialRegistrations(
  studies: readonly TrialRegistrationRecord[],
): TrialRegistrationRecord[] {
  return [...studies].sort((left, right) => {
    if (left.hasResults !== right.hasResults) return left.hasResults ? -1 : 1
    const leftDone = left.overallStatus === 'COMPLETED'
    const rightDone = right.overallStatus === 'COMPLETED'
    if (leftDone !== rightDone) return leftDone ? -1 : 1
    const leftCount = left.enrollment.count ?? -1
    const rightCount = right.enrollment.count ?? -1
    if (leftCount !== rightCount) return rightCount - leftCount
    const leftStart = left.startDate ?? ''
    const rightStart = right.startDate ?? ''
    if (leftStart !== rightStart) return leftStart < rightStart ? 1 : -1
    return left.nctId.localeCompare(right.nctId)
  })
}

/** The dated part of a snapshot identifier such as `… studies snapshot 2026-09-01T09:00:05 sha256:…`. */
export function snapshotDateFromIdentifier(sourceIdentifier: string): string | null {
  const match = /\b(\d{4}-\d{2}-\d{2})(?:T\d{2}:\d{2}:\d{2})?\b/u.exec(sourceIdentifier)
  return match?.[1] ?? null
}

export interface TrialRegistrationsInput {
  sourceIdentifier: string
  requestedAt: Date | string
  /** `matched[0]` of the stored search record, as written by the registry pass. */
  envelope: unknown
}

/**
 * Builds the page view from one stored search record. Returns null when the record holds no
 * studies, so a page never renders an empty registrations section: the completion assessment
 * already states the search outcome for that case.
 */
export function buildTrialRegistrationsView(
  input: TrialRegistrationsInput,
): TrialRegistrationsView | null {
  if (!input.envelope || typeof input.envelope !== 'object') return null
  const envelope = input.envelope as Record<string, unknown>
  const studies = Array.isArray(envelope.studies)
    ? envelope.studies.flatMap((raw) => {
        const record = toTrialRegistrationRecord(raw)
        return record ? [record] : []
      })
    : []
  if (studies.length === 0) return null
  const ranked = rankTrialRegistrations(studies)
  const totalMatched =
    typeof envelope.totalMatchedStudies === 'number' &&
    envelope.totalMatchedStudies >= studies.length
      ? envelope.totalMatchedStudies
      : studies.length
  const postedInStored = studies.filter((study) => study.hasResults).length
  const withPostedResults =
    typeof envelope.withPostedResults === 'number' && envelope.withPostedResults >= postedInStored
      ? envelope.withPostedResults
      : postedInStored
  const matchedNames = Array.isArray(envelope.matchedKeys)
    ? [
        ...new Set(
          envelope.matchedKeys.flatMap((entry) => {
            const name = optionalText((entry as Record<string, unknown> | null)?.name)
            return name ? [name] : []
          }),
        ),
      ]
    : []
  const requestedAt =
    input.requestedAt instanceof Date ? input.requestedAt : new Date(input.requestedAt)
  return {
    sourceIdentifier: input.sourceIdentifier,
    snapshotDate: snapshotDateFromIdentifier(input.sourceIdentifier),
    searchedAt: requestedAt.toISOString(),
    matchedNames,
    totalMatched,
    storedCount: studies.length,
    withPostedResults,
    shown: ranked.slice(0, TRIAL_REGISTRATIONS_SHOWN_LIMIT),
    shownLimit: TRIAL_REGISTRATIONS_SHOWN_LIMIT,
  }
}

// ---------------------------------------------------------------------------
// Trial results
// ---------------------------------------------------------------------------

/** How many studies' posted results the page shows per record. Beyond it is counted, not listed. */
export const TRIAL_RESULTS_SHOWN_LIMIT = 3

/** The ordering rule, in the words the page prints beside the list. */
export const TRIAL_RESULTS_ORDER_SENTENCE =
  'Studies are ordered by how many people actually took part, largest first, and then by the most recently posted results.'

export interface TrialResultsInput {
  sourceIdentifier: string
  requestedAt: Date | string
  /** `matched[0]` of the stored results search record, as written by the results fetch. */
  envelope: unknown
}

/**
 * Builds the results view from one stored search record.
 *
 * Unlike the registrations view this returns a value even when nothing qualified, because
 * "registrations matched but no study posted a usable result" is a fact worth printing. It returns
 * null only when there is no stored envelope to read at all.
 */
export function buildTrialResultsView(input: TrialResultsInput): TrialResultsView | null {
  if (!input.envelope || typeof input.envelope !== 'object') return null
  const envelope = input.envelope as Record<string, unknown>
  const studies = Array.isArray(envelope.studies)
    ? (envelope.studies as TrialResultRecord[]).filter(
        (study) => study && typeof study === 'object' && NCT_ID.test(String(study.nctId)),
      )
    : []
  const count = (key: string, fallback: number): number =>
    typeof envelope[key] === 'number' && Number.isFinite(envelope[key] as number)
      ? (envelope[key] as number)
      : fallback
  const requestedAt =
    input.requestedAt instanceof Date ? input.requestedAt : new Date(input.requestedAt)
  return {
    sourceIdentifier: input.sourceIdentifier,
    fetchedOn: snapshotDateFromIdentifier(input.sourceIdentifier),
    fetchedAt: requestedAt.toISOString(),
    totalQualifying: count('totalQualifying', studies.length),
    withResultsSection: count('withResultsSection', studies.length),
    failedQualifyingBar: count('failedQualifyingBar', 0),
    rankingRule: optionalText(envelope.rankingRule) ?? TRIAL_RESULTS_ORDER_SENTENCE,
    shown: studies.slice(0, TRIAL_RESULTS_SHOWN_LIMIT),
    shownLimit: count('shownLimit', TRIAL_RESULTS_SHOWN_LIMIT),
    secondaryShownLimit: count('secondaryShownLimit', 3),
  }
}

// ---------------------------------------------------------------------------
// Honest emptiness
// ---------------------------------------------------------------------------

function hasText(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/** Section keys in the order the dossier page lays them out, with the label the page shows. */
const SECTION_LABELS: ReadonlyArray<readonly [string, string]> = [
  ['oneSentenceVerdict', 'Plain-language verdict'],
  ['laymanHowItWorks', 'How it works'],
  ['conditionContext', 'Condition context'],
  ['keyAudits', 'Evidence audit points'],
  ['mechanismSteps', 'Mechanism of action'],
  ['trials', 'Clinical trials'],
  ['measuredVsInferredSummary', 'Measured vs inferred'],
  ['molecularSchema', 'Molecular structure'],
  ['deliverySystem', 'Delivery system'],
  ['pricing', 'Pricing transparency'],
  ['substitutes', 'Alternatives'],
  ['commonQuestions', 'Common questions'],
]

/**
 * Whether a curated section actually carries content. A non-null jsonb object full of empty
 * strings is still an empty section — the seed and ingest paths both produce those — so presence
 * is judged on the fields a reader would see, not on the column being non-null.
 */
function sectionIsPresent(d: DrugDossier, key: string): boolean {
  switch (key) {
    case 'oneSentenceVerdict':
      return hasText(d.oneSentenceVerdict)
    case 'laymanHowItWorks':
      return hasText(d.laymanHowItWorks)
    case 'conditionContext':
      return (
        hasText(d.conditionContext?.conditionExplainer) || hasText(d.conditionContext?.whyItMatters)
      )
    case 'keyAudits':
      return d.keyAudits.length > 0
    case 'mechanismSteps':
      return d.mechanismSteps.length > 0
    case 'trials':
      return d.trials.length > 0
    case 'measuredVsInferredSummary': {
      const s = d.measuredVsInferredSummary
      return (
        s.strictlyMeasured.length > 0 ||
        s.unsupportedInferences.length > 0 ||
        s.whatFailedInitially.length > 0 ||
        s.realWorldOutcome.length > 0
      )
    }
    case 'molecularSchema':
      return (
        structureStringFor(d) !== null ||
        hasText(d.molecularSchema?.chemicalFormula) ||
        hasText(d.molecularSchema?.molecularWeight)
      )
    case 'deliverySystem':
      return hasText(d.deliverySystem.type) || hasText(d.deliverySystem.description)
    case 'pricing':
      return (
        hasText(d.pricing?.retailPricePerDoseOrYear) || hasText(d.pricing?.synthesisCostPerDose)
      )
    case 'substitutes':
      return (
        (d.substitutes?.conventionalRx.length ?? 0) > 0 ||
        (d.substitutes?.naturalFoods.length ?? 0) > 0 ||
        (d.substitutes?.homeRemedies.length ?? 0) > 0
      )
    case 'commonQuestions':
      return d.commonQuestions.length > 0
    default:
      return false
  }
}

/** Labels of the curated sections this record does not have yet, in page order. */
export function missingSections(d: DrugDossier): string[] {
  const missing: string[] = []
  for (const entry of SECTION_LABELS) {
    const [key, label] = entry
    if (!sectionIsPresent(d, key)) missing.push(label)
  }
  return missing
}

/**
 * A stub is an ingested identity record — name, sponsor, regulatory status — with no curated body
 * yet. `dossierDepth` records the intent, but the content decides: a record marked `curated` that
 * carries no audits, no mechanism and no verdict is a stub whatever the column says, and the page
 * must show the contribute state rather than a row of empty panels.
 */
export function isStub(d: DrugDossier): boolean {
  if (d.dossierDepth === 'stub') return true
  return d.keyAudits.length === 0 && d.mechanismSteps.length === 0 && !hasText(d.oneSentenceVerdict)
}

/** The recorded structure used by Group A, or null. Never substitute a sample sequence. */
export function structureStringFor(d: DrugDossier): string | null {
  const smiles = d.molecularSchema?.smilesString?.trim()
  if (smiles) return smiles
  const sequence = d.molecularSchema?.sequence5to3?.trim()
  if (sequence) return sequence
  return null
}
