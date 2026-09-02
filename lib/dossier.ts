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
