// The seam between a `drugs` row and the DrugDossier shape every component in the reference
// wireframe consumes.
//
// Two rules shape this file.
//
// 1. Derived values are derived here, on every read, and never stored. `auditPointsCount` is the
//    obvious case: the reference's seed data carried hand-written totals ({ measured: 24, ... })
//    next to the array they were supposed to count. A stored total that disagrees with its array
//    is a number the page prints as fact and nobody can reproduce — exactly the failure this whole
//    product exists to expose. So it is counted from `keyAudits`, always.
// 2. Absence renders as absence. A column that is null means "not documented yet", and the mapping
//    turns it into an empty section plus an entry in `missingSections()` so the page can invite a
//    contribution. It never fills the gap with plausible-sounding text.

import type { drugs } from '@/db/schema'
import type {
  ApprovalStatus,
  AuditPoint,
  CommunityNote,
  DeliverySystem,
  DrugDossier,
  DrugModality,
  LaboratoryProtocolStep,
  MeasuredVsInferredSummary,
} from '@/lib/types'

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
  return { strictlyMeasured: [], unsupportedInferences: [], whatFailedInitially: [], realWorldOutcome: [] }
}

function emptyDeliverySystem(): DeliverySystem {
  return { type: '', description: '', safetyProfile: '' }
}

export interface RowToDossierOptions {
  /** Community notes for this drug. Left undefined when the caller did not load them, which is
   *  different from a drug that genuinely has none (an empty array). */
  notes?: CommunityNote[]
}

export function rowToDossier(row: DrugRow, opts?: RowToDossierOptions): DrugDossier {
  return {
    // The public identifier IS the slug. The reference addresses drugs by a human-readable id
    // ('inclisiran'), the URL is /d/[slug], and the internal primary key is never shown to a
    // reader — so exposing `row.id` here would leak an identifier no link ever uses.
    id: row.slug,
    name: row.name,
    tradeName: row.tradeName ?? undefined,
    sponsor: row.sponsor,
    targetGene: row.targetGene,
    targetProtein: row.targetProtein,
    // The Postgres enums are declared with exactly the literals of these unions (db/schema.ts
    // mirrors lib/types.ts by hand), so the column types already are the union.
    modality: row.modality satisfies DrugModality,
    approvalStatus: row.approvalStatus satisfies ApprovalStatus,
    approvalYear: row.approvalYear ?? undefined,
    indication: row.indication,
    patientFriendlyIndication: row.patientFriendlyIndication,
    conditionContext: row.conditionContext ?? undefined,
    oneSentenceVerdict: row.oneSentenceVerdict,
    laymanHowItWorks: row.laymanHowItWorks,
    auditConfidence: row.auditConfidence,
    confidenceScore: row.confidenceScore,
    pricing: row.pricing ?? undefined,
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
    anatomicalSite: row.anatomicalSite ?? undefined,
    revisionCount: row.revisionCount,
    lastEditedAt: row.lastEditedAt?.toISOString(),
    lastEditedBy: row.lastEditedBy ?? undefined,
    isMachineVerifiedStructure: row.isMachineVerifiedStructure,
    viewCount: row.viewCount,
  }
}

// ---------------------------------------------------------------------------
// Dossier -> row (the editor's save path)
// ---------------------------------------------------------------------------

/**
 * The inverse mapping, restricted to the fields an editor may propose.
 *
 * Deliberately absent, and each for its own reason:
 *  - `id` / `slug`      — renaming the URL of a live record is a redirect problem, not an edit.
 *  - `auditPointsCount` — derived from `keyAudits` on read; writing it would create the very
 *                         disagreement `countAuditPoints` exists to prevent.
 *  - `viewCount`, `revisionCount`, `lastEditedAt`, `lastEditedBy` — provenance, owned by
 *                         `applyRevisionToDrug`, not by the person submitting the content.
 *  - `isMachineVerifiedStructure`, `verificationHash`, `lastVerifiedAt` — set only by a passing
 *                         deterministic sweep. A contributor claiming their own edit is machine
 *                         verified is the one thing the engine exists to make impossible.
 *  - `communityNotes`   — a different table entirely.
 *
 * A key absent from `d` is left untouched. Clearing a section back to null is therefore not
 * expressible here, and is deliberate: "delete the pricing section" is a review decision, not a
 * side effect of an edit form that happened to omit a field.
 */
export function dossierToRow(d: Partial<DrugDossier>): Partial<DrugRow> {
  const row: Partial<DrugRow> = {}

  if (d.name !== undefined) row.name = d.name
  if (d.tradeName !== undefined) row.tradeName = d.tradeName
  if (d.sponsor !== undefined) row.sponsor = d.sponsor
  if (d.targetGene !== undefined) row.targetGene = d.targetGene
  if (d.targetProtein !== undefined) row.targetProtein = d.targetProtein
  if (d.modality !== undefined) row.modality = d.modality
  if (d.approvalStatus !== undefined) row.approvalStatus = d.approvalStatus
  if (d.approvalYear !== undefined) row.approvalYear = d.approvalYear
  if (d.indication !== undefined) row.indication = d.indication
  if (d.patientFriendlyIndication !== undefined) {
    row.patientFriendlyIndication = d.patientFriendlyIndication
  }
  if (d.oneSentenceVerdict !== undefined) row.oneSentenceVerdict = d.oneSentenceVerdict
  if (d.laymanHowItWorks !== undefined) row.laymanHowItWorks = d.laymanHowItWorks
  if (d.auditConfidence !== undefined) row.auditConfidence = d.auditConfidence
  if (d.confidenceScore !== undefined) row.confidenceScore = d.confidenceScore
  if (d.anatomicalSite !== undefined) row.anatomicalSite = d.anatomicalSite
  if (d.recentAuditDate !== undefined) row.recentAuditDate = d.recentAuditDate
  if (d.hasDiscrepancy !== undefined) row.hasDiscrepancy = d.hasDiscrepancy
  if (d.dossierDepth !== undefined) row.dossierDepth = d.dossierDepth
  if (d.sourceProvenance !== undefined) row.sourceProvenance = d.sourceProvenance

  if (d.conditionContext !== undefined) row.conditionContext = d.conditionContext
  if (d.pricing !== undefined) row.pricing = d.pricing
  if (d.substitutes !== undefined) row.substitutes = d.substitutes
  if (d.molecularSchema !== undefined) row.molecularSchema = d.molecularSchema
  if (d.keyAudits !== undefined) row.keyAudits = d.keyAudits
  if (d.mechanismSteps !== undefined) row.mechanismSteps = d.mechanismSteps
  if (d.trials !== undefined) row.trials = d.trials
  if (d.measuredVsInferredSummary !== undefined) {
    row.measuredVsInferredSummary = d.measuredVsInferredSummary
  }
  if (d.deliverySystem !== undefined) row.deliverySystem = d.deliverySystem
  if (d.commonQuestions !== undefined) row.commonQuestions = d.commonQuestions

  return row
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
      return hasText(d.conditionContext?.conditionExplainer) || hasText(d.conditionContext?.whyItMatters)
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
  return (
    d.keyAudits.length === 0 && d.mechanismSteps.length === 0 && !hasText(d.oneSentenceVerdict)
  )
}

/**
 * The structure string the deterministic engine sweeps, or null when this drug has none recorded.
 *
 * The reference wireframe fell back to hard-coded per-drug strings here
 * (`drug.id === 'inclisiran' ? 'AUGUCAUUGGAUCACUGCU' : ... : 'AUGCCGAUUGCAUUCGAGUAA'`). Those are
 * not the sequences of those drugs; they are filler that made the demo's visualiser light up. On a
 * site whose entire claim is that it separates what was measured from what was inferred, printing
 * an invented nucleotide sequence under a real drug's name is the worst thing the codebase could
 * do. There is no fallback. Null means "not documented", and the UI asks for a contribution.
 */
export function structureStringFor(d: DrugDossier): string | null {
  const smiles = d.molecularSchema?.smilesString?.trim()
  if (smiles) return smiles
  const sequence = d.molecularSchema?.sequence5to3?.trim()
  if (sequence) return sequence
  return null
}

// ---------------------------------------------------------------------------
// Default laboratory workflow
// ---------------------------------------------------------------------------

/**
 * The starting workflow the editor offers when a drug has none — ported from the reference's
 * `DEFAULT_WORKFLOW` (src/components/RnaWikiEditorModal.tsx).
 *
 * One addition: `dependsOnStepId` is chained 1 -> 2 -> 3. The reference left every step
 * unconnected, which Layer 3 of the engine reads as three orphan nodes in a multi-step graph and
 * flags. A chain is the honest reading of the protocol anyway — you cannot conjugate what has not
 * been synthesised — and it makes the default a valid, acyclic, fully connected DAG that passes
 * the sweep it is about to be handed to.
 */
export const DEFAULT_LABORATORY_WORKFLOW: LaboratoryProtocolStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    phase: 'QC',
    name: 'Sequence / Compound Purity QC',
    description:
      'Verify HPLC purity (>95%) and capillary electrophoresis mass spectrometry of synthesized molecule.',
    reagentsAndBuffer: 'TE Buffer (10 mM Tris-HCl, 1 mM EDTA, pH 7.5), RNase-free H2O',
  },
  {
    id: 'step-2',
    stepNumber: 2,
    phase: 'Synthesis',
    name: 'Chemical Synthesis / Solid-Phase Coupling',
    description:
      'Automated coupling on controlled column with protective groups and catalytic coupling agents.',
    dependsOnStepId: 'step-1',
    reagentsAndBuffer: 'Acetonitrile, activator reagents, Cap A/B solutions',
  },
  {
    id: 'step-3',
    stepNumber: 3,
    phase: 'Conjugation',
    name: 'Carrier Conjugation / Salt Formulation',
    description:
      'Formulation into stable bioavailable delivery salt or lipid nanoparticle carrier complex.',
    dependsOnStepId: 'step-2',
    reagentsAndBuffer: 'Formulation buffer (pH 7.4), stabilization excipients',
  },
]

/**
 * A deep copy of the default workflow. The editor holds the workflow in mutable state and reorders
 * it in place; handing it the module-level array would let one editing session rewrite the default
 * for every session after it in the same process.
 */
export function cloneDefaultLaboratoryWorkflow(): LaboratoryProtocolStep[] {
  return DEFAULT_LABORATORY_WORKFLOW.map((step) => ({ ...step }))
}
