// POST /api/drugs/:slug/revisions — the heart of the platform.
//
// Every change to a dossier arrives here, and the order of what happens next is the product:
//
//   1. Require a signed-in account.                     (attribution is not optional)
//   2. Merge the submitted partial onto the current dossier to get the PROPOSED dossier.
//   3. Sweep the proposed structure and workflow with the deterministic engine, server-side,
//      ALWAYS.                                          (a client's report is a suggestion)
//   4. Engine failed  -> persist a `machine_rejected` revision and return 422. Never queued.
//   5. Engine passed  -> `decideEditRouting` reads the trust tier and either publishes or queues.
//   6. Publishing is ONE transaction.                   (a published revision whose drug row did
//                                                        not change is corruption)
//
// The engine check comes before the trust check, and that ordering is the whole design: no amount
// of standing lets an account publish a structure that contradicts itself, and a brand-new
// contributor's correct structure is never thrown away — it waits for a person.
//
// WHAT THIS ROUTE REFUSES TO READ FROM THE BODY: `isMachineVerifiedStructure`, `verificationHash`,
// `lastVerifiedTimestamp`, `isMachineVerified`, `revisionCount`, `viewCount`, `lastEditedAt`,
// `lastEditedBy`, `auditPointsCount`, `communityNotes`, `id`. Every one of them is either
// provenance the server owns or a value derived on read. `dossierPayloadSchema` does not list
// them, and zod's default object behaviour strips what it was not asked for, so a body that
// carries them is not rejected — it is simply never looked at.

import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { drugs, revisions } from '@/db/schema'
import { newId } from '@/lib/ids'
import { countAuditPoints, structureStringFor } from '@/lib/dossier'
import { applyRevisionToDrug, getDrugBySlug, getDrugIdBySlug } from '@/lib/queries/drugs'
import { countPendingRevisions, createRevision, diffDossiers } from '@/lib/queries/revisions'
import { runFullDeterministicSweep } from '@/lib/rna-intelligence'
import { decideEditRouting, recordAcceptedEdit } from '@/lib/trust'
import { requireUser } from '@/lib/session'
import { WRITE } from '@/lib/rate-limit'
import { ApiError, ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import {
  APPROVAL_STATUSES,
  DRUG_MODALITIES,
  PROTOCOL_PHASES,
  type ApprovalStatus,
  type DrugDossier,
  type DrugModality,
  type LaboratoryProtocolStep,
  type MolecularSchema,
  type ProtocolPhase,
} from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SlugContext {
  /** Next.js 15: route params are a Promise and must be awaited. */
  params: Promise<{ slug: string }>
}

// ---------------------------------------------------------------------------
// Bounds
// ---------------------------------------------------------------------------

/** See the note in ../sweep/route.ts: Layer 1 walks every character, so the field is bounded. */
const MAX_STRUCTURE_LENGTH = 50_000
const MAX_WORKFLOW_STEPS = 60
const MAX_LIST_ITEMS = 200
const MAX_SUMMARY_LENGTH = 300

// `z.enum` needs a non-empty tuple; the vocabularies in lib/types.ts are arrays of exactly the
// literals of the unions, so the cast adds no risk.
const modalityValues = DRUG_MODALITIES as [DrugModality, ...DrugModality[]]
const approvalValues = APPROVAL_STATUSES as [ApprovalStatus, ...ApprovalStatus[]]
const phaseValues = PROTOCOL_PHASES as [ProtocolPhase, ...ProtocolPhase[]]

// ---------------------------------------------------------------------------
// The payload schema — an allow-list mirroring `dossierToRow` in lib/dossier.ts
// ---------------------------------------------------------------------------

const protocolStepSchema = z.object({
  id: z.string().trim().min(1).max(64),
  stepNumber: z.number().int().min(0).max(999),
  phase: z.enum(phaseValues),
  name: z.string().trim().max(200),
  description: z.string().trim().max(2000),
  dependsOnStepId: z.string().trim().max(64).optional(),
  reagentsAndBuffer: z.string().trim().max(1000),
})

const auditPointSchema = z.object({
  id: z.string().trim().min(1).max(64),
  category: z.enum(['measured', 'inferred', 'failed', 'conclusion_shift']),
  title: z.string().trim().max(300),
  laymanSummary: z.string().trim().max(2000),
  technicalDetails: z.string().trim().max(4000),
  evidenceSource: z.string().trim().max(400),
  doi: z.string().trim().max(200).optional(),
  measuredMetric: z.string().trim().max(600).optional(),
  inferredClaim: z.string().trim().max(600).optional(),
  auditFlag: z.enum(['verified', 'caution', 'retracted', 'contested']).optional(),
})

const clinicalTrialSchema = z.object({
  trialId: z.string().trim().max(64),
  phase: z.string().trim().max(64),
  // A trial's enrolment is a number that came from a registry entry, so it is stored as one.
  sampleSize: z.number().int().min(0).max(10_000_000),
  primaryEndpoint: z.string().trim().max(600),
  endpointMet: z.boolean(),
  statisticalPValue: z.string().trim().max(64),
  unreportedAdverseSignals: z.string().trim().max(2000).optional(),
  independentReplicationStatus: z.enum([
    'Replicated',
    'Partially Replicated',
    'Unreplicated',
    'Failed to Replicate',
  ]),
})

const mechanismStepSchema = z.object({
  step: z.number().int().min(0).max(99),
  title: z.string().trim().max(200),
  laymanDesc: z.string().trim().max(1200),
  molecularDetail: z.string().trim().max(2000),
  iconName: z.string().trim().max(64),
  visualStage: z.enum([
    'delivery',
    'cellular_entry',
    'target_binding',
    'catalytic_action',
    'therapeutic_result',
  ]),
})

const conditionContextSchema = z.object({
  conditionExplainer: z.string().trim().max(3000),
  whyItMatters: z.string().trim().max(3000),
  whoTakesThis: z.string().trim().max(2000),
  clinicalGoals: z.string().trim().max(2000).optional(),
})

const pricingSchema = z.object({
  synthesisCostPerDose: z.string().trim().max(120),
  retailPricePerDoseOrYear: z.string().trim().max(120),
  markupEstimate: z.string().trim().max(120),
  openPatentNotes: z.string().trim().max(2000),
  synthesisComplexity: z.enum(['Low', 'Moderate', 'High']),
})

const conventionalSubstituteSchema = z.object({
  name: z.string().trim().max(200),
  class: z.string().trim().max(200).optional(),
  howItCompares: z.string().trim().max(1200).optional(),
  comparisonToDrug: z.string().trim().max(1200).optional(),
  typicalCost: z.string().trim().max(120),
  prosAndCons: z.string().trim().max(1200).optional(),
})

const naturalFoodSubstituteSchema = z.object({
  name: z.string().trim().max(200),
  activeCompound: z.string().trim().max(200).optional(),
  biologicalMechanism: z.string().trim().max(1200).optional(),
  mechanism: z.string().trim().max(1200).optional(),
  evidenceStrength: z.string().trim().max(120).optional(),
  evidenceLevel: z.string().trim().max(120).optional(),
  dailyUsage: z.string().trim().max(300),
  monthlyCost: z.string().trim().max(120),
})

const homeRemedySchema = z.object({
  name: z.string().trim().max(200),
  action: z.string().trim().max(1200),
  patientImpact: z.string().trim().max(1200),
  clinicalPrecaution: z.string().trim().max(1200),
})

const substitutesSchema = z.object({
  summary: z.string().trim().max(2000),
  conventionalRx: z.array(conventionalSubstituteSchema).max(MAX_LIST_ITEMS),
  naturalFoods: z.array(naturalFoodSubstituteSchema).max(MAX_LIST_ITEMS),
  homeRemedies: z.array(homeRemedySchema).max(MAX_LIST_ITEMS),
})

/**
 * The editable half of `MolecularSchema`.
 *
 * `isMachineVerified`, `verificationHash` and `lastVerifiedTimestamp` are absent, and that absence
 * is load-bearing: they are the badge. They are written below from the report this route computed
 * itself, so a contributor who posts `isMachineVerified: true` gets it stripped by zod and
 * replaced by whatever the engine actually found.
 */
const molecularSchemaSchema = z.object({
  structureType: z
    .enum([
      'rna_sequence',
      'small_molecule_smiles',
      'peptide_sequence',
      'antibody_structure',
      'generic_formula',
    ])
    .optional(),
  sequence5to3: z.string().trim().max(MAX_STRUCTURE_LENGTH).optional(),
  smilesString: z.string().trim().max(MAX_STRUCTURE_LENGTH).optional(),
  chemicalFormula: z.string().trim().max(300).optional(),
  molecularWeight: z.string().trim().max(120).optional(),
  logP: z.number().finite().optional(),
  targetReceptorAffinity: z.string().trim().max(300).optional(),
  complementaryStrand: z.string().trim().max(MAX_STRUCTURE_LENGTH).optional(),
  gcContentPercent: z.number().finite().min(0).max(100).optional(),
  sequenceLengthNt: z.number().int().min(0).optional(),
  readingFrameValid: z.boolean().optional(),
  startCodonFound: z.boolean().optional(),
  stopCodonFound: z.boolean().optional(),
  mfeDeltaG: z.number().finite().optional(),
  wobblePairsCount: z.number().int().min(0).optional(),
  laboratoryWorkflow: z.array(protocolStepSchema).max(MAX_WORKFLOW_STEPS).optional(),
})

const dossierPayloadSchema = z.object({
  name: z.string().trim().min(1).max(300).optional(),
  tradeName: z.string().trim().max(400).optional(),
  sponsor: z.string().trim().max(300).optional(),
  targetGene: z.string().trim().max(200).optional(),
  targetProtein: z.string().trim().max(300).optional(),
  modality: z.enum(modalityValues).optional(),
  approvalStatus: z.enum(approvalValues).optional(),
  approvalYear: z.number().int().min(1900).max(2200).optional(),
  indication: z.string().trim().max(4000).optional(),
  patientFriendlyIndication: z.string().trim().max(2000).optional(),
  oneSentenceVerdict: z.string().trim().max(1000).optional(),
  laymanHowItWorks: z.string().trim().max(4000).optional(),
  auditConfidence: z
    .enum(['High Confidence', 'Moderate / Debated', 'Inference Overreach Found', 'Rigorous Replicated'])
    .optional(),
  confidenceScore: z.number().int().min(0).max(100).optional(),
  anatomicalSite: z.string().trim().max(300).optional(),
  recentAuditDate: z.string().trim().max(64).optional(),
  hasDiscrepancy: z.boolean().optional(),
  dossierDepth: z.enum(['stub', 'curated', 'flagship']).optional(),
  sourceProvenance: z.array(z.string().trim().max(300)).max(MAX_LIST_ITEMS).optional(),

  conditionContext: conditionContextSchema.optional(),
  pricing: pricingSchema.optional(),
  substitutes: substitutesSchema.optional(),
  molecularSchema: molecularSchemaSchema.optional(),
  keyAudits: z.array(auditPointSchema).max(MAX_LIST_ITEMS).optional(),
  mechanismSteps: z.array(mechanismStepSchema).max(MAX_LIST_ITEMS).optional(),
  trials: z.array(clinicalTrialSchema).max(MAX_LIST_ITEMS).optional(),
  measuredVsInferredSummary: z
    .object({
      strictlyMeasured: z.array(z.string().trim().max(1000)).max(MAX_LIST_ITEMS),
      unsupportedInferences: z.array(z.string().trim().max(1000)).max(MAX_LIST_ITEMS),
      whatFailedInitially: z.array(z.string().trim().max(1000)).max(MAX_LIST_ITEMS),
      realWorldOutcome: z.array(z.string().trim().max(1000)).max(MAX_LIST_ITEMS),
    })
    .optional(),
  deliverySystem: z
    .object({
      type: z.string().trim().max(300),
      description: z.string().trim().max(3000),
      safetyProfile: z.string().trim().max(3000),
    })
    .optional(),
  commonQuestions: z
    .array(
      z.object({
        q: z.string().trim().max(400),
        a: z.string().trim().max(3000),
        auditNote: z.string().trim().max(1000).optional(),
      }),
    )
    .max(MAX_LIST_ITEMS)
    .optional(),
})

const bodySchema = z.object({
  payload: dossierPayloadSchema,
  summary: z
    .string()
    .trim()
    .min(4, 'Say in one line what you changed — it is the only human sentence in the audit trail.')
    .max(MAX_SUMMARY_LENGTH),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Drops keys whose value is `undefined` so they do not overwrite the current record with nothing.
 *
 * JSON cannot carry `undefined` — `JSON.stringify` deletes the key — so a key that arrives holding
 * `undefined` only ever comes from zod filling in an optional. Spreading it would set the merged
 * dossier's field to undefined and make the diff report "trade name X -> not set" for a change
 * nobody submitted and `dossierToRow` would never apply.
 */
function withoutUndefined<T extends object>(value: T): T {
  const out: Record<string, unknown> = {}
  for (const [key, entry] of Object.entries(value)) {
    if (entry !== undefined) out[key] = entry
  }
  return out as T
}

/**
 * The dossier as the DIFF should see it: verification metadata normalised away on both sides.
 *
 * `lastVerifiedTimestamp` moves on every submission and `verificationHash` is set by the sweep, so
 * leaving them in would report a molecular-structure change for an edit that only touched the
 * pricing section — and would make the "this edit changes nothing" check below permanently false.
 * `stableStringify` in lib/queries/revisions.ts drops undefined-valued keys, so setting them to
 * undefined removes them from the comparison entirely.
 */
function diffView(dossier: DrugDossier): DrugDossier {
  const schema = dossier.molecularSchema
  if (!schema) return dossier
  return {
    ...dossier,
    molecularSchema: {
      ...schema,
      isMachineVerified: false,
      verificationHash: undefined,
      lastVerifiedTimestamp: undefined,
    },
  }
}

// ---------------------------------------------------------------------------
// The handler
// ---------------------------------------------------------------------------

export const POST = withHandler(async (req: Request, ctx: SlugContext) => {
  const { slug } = await ctx.params

  // 1. A signed-in account. Every revision is attributed; there is no anonymous edit path.
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  const body = bodySchema.parse(await readJson(req))

  const drugId = await getDrugIdBySlug(slug)
  if (!drugId) throw new ApiError(404, 'No dossier with that slug', 'not_found')
  const current = await getDrugBySlug(slug)
  if (!current) throw new ApiError(404, 'No dossier with that slug', 'not_found')

  // 2. Merge. `molecularSchema` is replaced wholesale rather than merged field by field, the same
  //    way `keyAudits`, `trials` and `pricing` are: sections are edited as units, and a field can
  //    only be CLEARED by a whole-section replacement, because JSON cannot express "set this key
  //    to nothing".
  const { molecularSchema: submittedSchema, ...submittedRest } = body.payload
  const rest = withoutUndefined(submittedRest)

  const draftSchema: MolecularSchema | undefined = submittedSchema
    ? {
        ...withoutUndefined(submittedSchema),
        laboratoryWorkflow: submittedSchema.laboratoryWorkflow ?? [],
        // Provisional. Overwritten from the report a few lines down, never from the request.
        isMachineVerified: false,
      }
    : current.molecularSchema

  const merged: DrugDossier = { ...current, ...rest, molecularSchema: draftSchema }
  // Derived on read everywhere else in the codebase, so it is derived here too rather than
  // carried over from `current` and left disagreeing with the audits the edit just changed.
  const proposed: DrugDossier = { ...merged, auditPointsCount: countAuditPoints(merged.keyAudits) }

  // 3. THE SWEEP. Server-side, on the proposed structure, unconditionally.
  //
  //    This route accepts no engine report from the client — the schema above has no field for
  //    one — so there is nothing to be tempted to trust. The same three layers, the same Turner
  //    2004 parameters, the same code the editor's live panel calls, run again here on what was
  //    actually submitted.
  //
  //    A proposed dossier with no structure at all sweeps as the empty string and Layer 1 answers
  //    L1_STRUCTURE_EMPTY, which fails. That is the engine's rule (lib/rna-intelligence/
  //    layer1-sequence.ts), not this route's, and it is deliberate: this platform's verification
  //    claim is about structures, and an edit to a record whose structure nobody has documented
  //    cannot be machine-verified. The fix is to document the structure, never to invent one.
  const workflow: LaboratoryProtocolStep[] = proposed.molecularSchema?.laboratoryWorkflow ?? []
  const report = runFullDeterministicSweep({
    structureString: structureStringFor(proposed) ?? '',
    modality: proposed.modality,
    workflow,
  })

  // The badge, written from the report and from nowhere else. A failed sweep leaves the hash and
  // the timestamp absent rather than recording a verification that did not happen.
  const verifiedSchema: MolecularSchema | undefined = draftSchema
    ? {
        ...draftSchema,
        isMachineVerified: report.overallPassed,
        verificationHash: report.overallPassed ? report.verificationHash : undefined,
        lastVerifiedTimestamp: report.overallPassed ? report.timestamp : undefined,
      }
    : undefined

  // What gets stored on the revision and applied on approval: the submitted delta, not the whole
  // merged dossier. A revision approved a week later should overwrite the fields its author
  // actually touched, not silently revert everything edited in the meantime.
  const storedPayload: Partial<DrugDossier> = submittedSchema
    ? { ...rest, molecularSchema: verifiedSchema }
    : { ...rest }

  const proposedFinal: DrugDossier = { ...proposed, molecularSchema: verifiedSchema }
  const changedFields = diffDossiers(diffView(current), diffView(proposedFinal))

  // Not in the contract, and deliberate. An edit that changes nothing is either a confused form
  // submission or an account farming accepted-edit counts toward the tier that skips review.
  // Either way the honest answer is that there is nothing to record.
  if (changedFields.length === 0) {
    throw new ApiError(
      422,
      'This edit does not change anything on the record.',
      'no_change',
    )
  }

  const tier = user.trustTier ?? 'new'
  const author = {
    userId: user.id,
    name: user.name,
    orcid: user.orcid ?? null,
    trustTier: tier,
  }

  // 4 and 5. Engine first, trust second — `decideEditRouting` enforces that order itself.
  const routing = decideEditRouting({
    enginePassed: report.overallPassed,
    tier,
    isAdmin: user.isAdmin === true,
  })

  // 4. Rejected by the machine. The attempt is still recorded: the audit trail is the whole
  //    product, and a trail that only lists the edits that worked is a trail with a hole in it.
  //    It is never queued for a human.
  if (routing.outcome === 'machine_rejected') {
    const revision = await createRevision({
      drugId,
      author,
      proposedPayload: storedPayload,
      changedFields,
      engineReport: report,
      status: 'machine_rejected',
      summary: body.summary,
    })

    // The contract's 422 carries the whole report, not the `{ error }` shape `fail` produces, so
    // it is built with `ok(..., 422)`. `error` is the first failing check, verbatim, because that
    // is the sentence the contributor has to act on.
    return ok(
      {
        outcome: 'machine_rejected' as const,
        revisionId: revision.id,
        report,
        error: report.errors[0]?.message ?? routing.reason,
      },
      422,
    )
  }

  // 5a. Published immediately — trusted, steward or administrator.
  if (routing.outcome === 'published') {
    const revisionId = newId('rev')

    // 6. ONE transaction. The revision row, the drug row, the verification columns and the
    //    author's accepted-edit counter either all move or none of them do. A published revision
    //    whose drug row did not update is corruption that no later read can detect.
    await db.transaction(async (tx) => {
      await tx.insert(revisions).values({
        id: revisionId,
        drugId,
        authorUserId: user.id,
        authorName: user.name,
        authorOrcid: user.orcid ?? null,
        authorTrustTier: tier,
        status: 'published',
        summary: body.summary,
        changedFields,
        proposedPayload: storedPayload,
        engineReport: report,
        machineVerified: report.overallPassed,
        verificationHash: report.verificationHash,
        // `reviewedAt` and `reviewedByName` stay null on purpose. Nobody reviewed this; the
        // engine passed it and the tier let it through. Stamping a reviewer here would put a
        // human's name on a decision they never made.
      })

      await applyRevisionToDrug(tx, drugId, storedPayload, user.name)

      await tx
        .update(drugs)
        .set({
          isMachineVerifiedStructure: report.overallPassed,
          verificationHash: report.verificationHash,
          // When the sweep ran, from the report itself rather than from a second clock reading.
          lastVerifiedAt: new Date(report.timestamp),
        })
        .where(eq(drugs.id, drugId))

      // Credited inside the transaction: an accepted edit that does not move the counter is an
      // unpaid debt, and a counter moved for an edit that failed to apply is inflated standing.
      await recordAcceptedEdit(tx, user.id)
    })

    revalidatePath(`/d/${slug}`)
    revalidatePath('/')

    const drug = await getDrugBySlug(slug, user.id)
    if (!drug) {
      throw new ApiError(500, 'The updated dossier could not be read back.', 'read_back_failed')
    }

    return ok({ outcome: 'published' as const, revisionId, drug, report })
  }

  // 5b. Queued for a person.
  const revision = await createRevision({
    drugId,
    author,
    proposedPayload: storedPayload,
    changedFields,
    engineReport: report,
    status: 'pending_review',
    summary: body.summary,
  })

  // The queue is ordered oldest-first (lib/queries/revisions.ts), and this row is the newest one
  // in it, so the pending total IS this submission's 1-based position. A revision inserted
  // concurrently can shift it by one, which is acceptable for a "you are Nth in line" line and is
  // not worth a serialisable transaction.
  const queuePosition = await countPendingRevisions()

  return ok(
    { outcome: 'pending_review' as const, revisionId: revision.id, report, queuePosition },
    202,
  )
})
