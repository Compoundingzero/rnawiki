// The contribution ledger: every proposed edit, who proposed it, what the deterministic engine
// said about it, and what a reviewer decided.
//
// Revisions are append-only. The only column ever rewritten on an existing row is the review
// decision, and that write is guarded by a row lock so the same revision cannot be approved twice
// and credited twice.

import { and, asc, count, desc, eq, ne, sql } from 'drizzle-orm'
import { db } from '@/db'
import { newId } from '@/lib/ids'
import { drugs, revisions, users } from '@/db/schema'
import { countAuditPoints, structureStringFor } from '@/lib/dossier'
import { applyRevisionToDrug, type Tx } from './drugs'
import type { RnaIntelligenceReport } from '@/lib/rna-intelligence/types'
import {
  tierForAcceptedEdits,
  type DrugDossier,
  type Revision,
  type RevisionFieldChange,
  type RevisionStatus,
  type TrustTier,
} from '@/lib/types'

export type RevisionErrorCode = 'not_found' | 'drug_not_found' | 'not_pending'

export class RevisionError extends Error {
  readonly code: RevisionErrorCode

  constructor(code: RevisionErrorCode, message: string) {
    super(message)
    this.name = 'RevisionError'
    this.code = code
  }
}

export interface RevisionAuthor {
  /** Null for an unauthenticated submission. Nothing is credited to a null author. */
  userId: string | null
  name: string
  orcid?: string | null
  trustTier: TrustTier
}

export interface RevisionReviewer {
  userId: string | null
  name: string
}

// ---------------------------------------------------------------------------
// Row mapping
// ---------------------------------------------------------------------------

/**
 * Everything a revision row carries except the two large jsonb payloads. `proposed_payload` is a
 * whole dossier and `engine_report` is a full three-layer sweep; a twenty-row review queue that
 * loaded both would move megabytes to render a list of one-line summaries.
 */
const revisionListColumns = {
  id: revisions.id,
  drugId: revisions.drugId,
  authorUserId: revisions.authorUserId,
  authorName: revisions.authorName,
  authorOrcid: revisions.authorOrcid,
  authorTrustTier: revisions.authorTrustTier,
  status: revisions.status,
  summary: revisions.summary,
  changedFields: revisions.changedFields,
  machineVerified: revisions.machineVerified,
  verificationHash: revisions.verificationHash,
  createdAt: revisions.createdAt,
  reviewedAt: revisions.reviewedAt,
  reviewedByName: revisions.reviewedByName,
  reviewNote: revisions.reviewNote,
}

type RevisionListRow = Pick<typeof revisions.$inferSelect, keyof typeof revisionListColumns>

interface DrugIdentity {
  name: string
  slug: string
}

function toRevision(
  row: RevisionListRow,
  drug: DrugIdentity,
  engineReport: unknown = null,
): Revision {
  return {
    id: row.id,
    drugId: row.drugId,
    drugName: drug.name,
    drugSlug: drug.slug,
    authorUserId: row.authorUserId,
    authorName: row.authorName,
    authorOrcid: row.authorOrcid ?? undefined,
    authorTrustTier: row.authorTrustTier,
    status: row.status,
    summary: row.summary,
    changedFields: row.changedFields,
    engineReport,
    machineVerified: row.machineVerified,
    verificationHash: row.verificationHash,
    createdAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    reviewedByName: row.reviewedByName,
    reviewNote: row.reviewNote,
  }
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

export interface CreateRevisionInput {
  drugId: string
  author: RevisionAuthor
  /** The dossier this edit proposes. Stored verbatim and applied verbatim on approval. */
  proposedPayload: Partial<DrugDossier>
  changedFields: RevisionFieldChange[]
  /** The sweep captured at submission. `machineVerified` is read from it, never passed in. */
  engineReport?: RnaIntelligenceReport | null
  status: RevisionStatus
  summary: string
  id?: string
}

export async function createRevision(input: CreateRevisionInput): Promise<Revision> {
  const drugRows = await db
    .select({ name: drugs.name, slug: drugs.slug })
    .from(drugs)
    .where(eq(drugs.id, input.drugId))
    .limit(1)
  const drug = drugRows[0]
  if (!drug) {
    throw new RevisionError('drug_not_found', 'No drug matches this revision.')
  }

  const report = input.engineReport ?? null
  const inserted = await db
    .insert(revisions)
    .values({
      id: input.id ?? newId('rev'),
      drugId: input.drugId,
      authorUserId: input.author.userId,
      authorName: input.author.name,
      authorOrcid: input.author.orcid ?? null,
      authorTrustTier: input.author.trustTier,
      status: input.status,
      summary: input.summary,
      changedFields: input.changedFields,
      proposedPayload: input.proposedPayload,
      engineReport: report,
      // Both read off the report rather than accepted from the caller: "machine verified" means
      // a sweep said so, and the hash is the sweep's own digest of the input it read.
      machineVerified: report?.overallPassed ?? false,
      verificationHash: report?.verificationHash ?? null,
    })
    .returning(revisionListColumns)

  const row = inserted[0]
  if (!row) throw new RevisionError('not_found', 'The revision could not be written.')
  return toRevision(row, drug, report)
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

/** One revision including its full engine report — the review page's detail view. */
export async function getRevisionById(revisionId: string): Promise<Revision | null> {
  const rows = await db
    .select({
      ...revisionListColumns,
      engineReport: revisions.engineReport,
      drugName: drugs.name,
      drugSlug: drugs.slug,
    })
    .from(revisions)
    .innerJoin(drugs, eq(revisions.drugId, drugs.id))
    .where(eq(revisions.id, revisionId))
    .limit(1)

  const row = rows[0]
  if (!row) return null
  const { drugName, drugSlug, engineReport, ...revisionRow } = row
  return toRevision(revisionRow, { name: drugName, slug: drugSlug }, engineReport)
}

/**
 * The public review queue, oldest first — a queue that sorts newest-first is one where the
 * unlucky submission at the bottom is never reached. The engine report is not loaded; see
 * `revisionListColumns`.
 */
export async function listPendingRevisions(opts: {
  limit: number
  offset: number
}): Promise<Revision[]> {
  const rows = await db
    .select({ ...revisionListColumns, drugName: drugs.name, drugSlug: drugs.slug })
    .from(revisions)
    .innerJoin(drugs, eq(revisions.drugId, drugs.id))
    .where(eq(revisions.status, 'pending_review'))
    .orderBy(asc(revisions.createdAt), asc(revisions.id))
    .limit(Math.max(1, Math.trunc(opts.limit)))
    .offset(Math.max(0, Math.trunc(opts.offset)))

  return rows.map(({ drugName, drugSlug, ...row }) => toRevision(row, { name: drugName, slug: drugSlug }))
}

/** How many edits are waiting. A real count, for the queue's header and pagination. */
export async function countPendingRevisions(): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(revisions)
    .where(eq(revisions.status, 'pending_review'))
  return rows[0]?.value ?? 0
}

/** A record's public history, newest first. The engine report is not loaded. */
export async function listRevisionsForDrug(drugId: string, limit: number): Promise<Revision[]> {
  const rows = await db
    .select({ ...revisionListColumns, drugName: drugs.name, drugSlug: drugs.slug })
    .from(revisions)
    .innerJoin(drugs, eq(revisions.drugId, drugs.id))
    .where(eq(revisions.drugId, drugId))
    .orderBy(desc(revisions.createdAt), desc(revisions.id))
    .limit(Math.max(1, Math.trunc(limit)))

  return rows.map(({ drugName, drugSlug, ...row }) => toRevision(row, { name: drugName, slug: drugSlug }))
}

/** A contributor's history, newest first. The engine report is not loaded. */
export async function listRevisionsByUser(userId: string, limit: number): Promise<Revision[]> {
  const rows = await db
    .select({ ...revisionListColumns, drugName: drugs.name, drugSlug: drugs.slug })
    .from(revisions)
    .innerJoin(drugs, eq(revisions.drugId, drugs.id))
    .where(eq(revisions.authorUserId, userId))
    .orderBy(desc(revisions.createdAt), desc(revisions.id))
    .limit(Math.max(1, Math.trunc(limit)))

  return rows.map(({ drugName, drugSlug, ...row }) => toRevision(row, { name: drugName, slug: drugSlug }))
}

// ---------------------------------------------------------------------------
// Review decisions
// ---------------------------------------------------------------------------

/**
 * A jsonb payload comes back from the driver as `unknown`, and casting it is the one place this
 * file has to take something on trust. It is narrowed to "an object" here and no further: the
 * field-level validation belongs to the submission route's schema, before the payload is ever
 * stored, because rejecting a malformed edit at review time is far too late to tell its author.
 */
function asDossierPayload(value: unknown): Partial<DrugDossier> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {}
  return value as Partial<DrugDossier>
}

/**
 * Credits an accepted edit and re-derives the trust tier from the new total.
 *
 * The ladder itself stays in lib/types.ts (`tierForAcceptedEdits`). Expressing it as a SQL CASE
 * here would be faster by one round trip and would give the project two thresholds tables to keep
 * in step, which is exactly how a contributor ends up at 15 accepted edits still labelled `new`.
 */
async function creditAcceptedEdit(tx: Tx, userId: string): Promise<void> {
  const updated = await tx
    .update(users)
    .set({ acceptedEditCount: sql`${users.acceptedEditCount} + 1` })
    .where(eq(users.id, userId))
    .returning({ accepted: users.acceptedEditCount })

  const accepted = updated[0]?.accepted
  if (accepted === undefined) return

  const tier = tierForAcceptedEdits(accepted)
  await tx
    .update(users)
    .set({ trustTier: tier })
    .where(and(eq(users.id, userId), ne(users.trustTier, tier)))
}

async function loadDrugIdentity(tx: Tx, drugId: string): Promise<DrugIdentity> {
  const rows = await tx
    .select({ name: drugs.name, slug: drugs.slug })
    .from(drugs)
    .where(eq(drugs.id, drugId))
    .limit(1)
  const drug = rows[0]
  if (!drug) throw new RevisionError('drug_not_found', 'This revision points at a missing drug.')
  return drug
}

/**
 * Publishes a revision: marks it reviewed, writes its payload onto the drug, credits its author.
 *
 * Idempotent by row lock. `SELECT ... FOR UPDATE` inside the transaction serialises two reviewers
 * clicking Approve on the same revision at the same moment; the second one finds the status
 * already `published` and returns without applying the payload again or handing out a second
 * accepted edit. Checking the status without the lock would let both transactions read
 * `pending_review` before either wrote.
 */
export async function approveRevision(
  revisionId: string,
  reviewer: RevisionReviewer,
): Promise<Revision> {
  return db.transaction(async (tx) => {
    const locked = await tx
      .select({ ...revisionListColumns, proposedPayload: revisions.proposedPayload })
      .from(revisions)
      .where(eq(revisions.id, revisionId))
      .limit(1)
      .for('update')

    const row = locked[0]
    if (!row) throw new RevisionError('not_found', 'No revision matches this id.')

    const drug = await loadDrugIdentity(tx, row.drugId)
    const { proposedPayload, ...revisionRow } = row

    if (revisionRow.status === 'published') {
      // Already applied. Not an error — a double-submitted review form is a human doing the same
      // thing twice, and the honest answer is the revision as it already stands.
      return toRevision(revisionRow, drug)
    }
    if (revisionRow.status !== 'pending_review') {
      throw new RevisionError(
        'not_pending',
        `A ${revisionRow.status} revision cannot be approved; it has to be resubmitted.`,
      )
    }

    const reviewedAt = new Date()
    const updated = await tx
      .update(revisions)
      .set({
        status: 'published',
        reviewedAt,
        reviewedByUserId: reviewer.userId,
        reviewedByName: reviewer.name,
      })
      .where(eq(revisions.id, revisionId))
      .returning(revisionListColumns)

    await applyRevisionToDrug(tx, row.drugId, asDossierPayload(proposedPayload), row.authorName)

    if (row.authorUserId) await creditAcceptedEdit(tx, row.authorUserId)

    const after = updated[0]
    if (!after) throw new RevisionError('not_found', 'The revision vanished mid-review.')
    return toRevision(after, drug)
  })
}

/**
 * Declines a revision. The drug is untouched; the reason is recorded on the revision so the
 * contributor can read why, and the rejected count is incremented once — the same lock that makes
 * approval idempotent makes this idempotent too.
 */
export async function rejectRevision(
  revisionId: string,
  reviewer: RevisionReviewer,
  note: string,
): Promise<Revision> {
  return db.transaction(async (tx) => {
    const locked = await tx
      .select(revisionListColumns)
      .from(revisions)
      .where(eq(revisions.id, revisionId))
      .limit(1)
      .for('update')

    const row = locked[0]
    if (!row) throw new RevisionError('not_found', 'No revision matches this id.')

    const drug = await loadDrugIdentity(tx, row.drugId)

    if (row.status === 'rejected' || row.status === 'machine_rejected') {
      return toRevision(row, drug)
    }
    if (row.status === 'published') {
      throw new RevisionError(
        'not_pending',
        'A published revision cannot be rejected; submit a correcting revision instead.',
      )
    }

    const updated = await tx
      .update(revisions)
      .set({
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedByUserId: reviewer.userId,
        reviewedByName: reviewer.name,
        reviewNote: note,
      })
      .where(eq(revisions.id, revisionId))
      .returning(revisionListColumns)

    if (row.authorUserId) {
      await tx
        .update(users)
        .set({ rejectedEditCount: sql`${users.rejectedEditCount} + 1` })
        .where(eq(users.id, row.authorUserId))
    }

    const after = updated[0]
    if (!after) throw new RevisionError('not_found', 'The revision vanished mid-review.')
    return toRevision(after, drug)
  })
}

// ---------------------------------------------------------------------------
// Diffing
// ---------------------------------------------------------------------------

const NOT_SET = 'not set'
const MAX_VALUE_LENGTH = 160

function truncate(value: string, max = MAX_VALUE_LENGTH): string {
  const collapsed = value.replace(/\s+/g, ' ').trim()
  return collapsed.length > max ? `${collapsed.slice(0, max - 1)}…` : collapsed
}

function orNotSet(value: string): string {
  return value.trim().length > 0 ? value : NOT_SET
}

/**
 * Key-sorted JSON. `JSON.stringify` preserves insertion order, so the same pricing object built by
 * a form and by the seed script serialise differently and would be reported as an edit that
 * changed nothing. Sorting is by UTF-16 code unit rather than `localeCompare`, because the diff
 * has to be identical on every machine that runs it.
 */
function stableStringify(value: unknown): string {
  if (value === undefined || value === null) return 'null'
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}

/** `openPatentNotes` -> `open patent notes`, so a diff line reads as English. */
function humaniseKey(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase()
}

interface ScalarSpec {
  field: string
  label: string
  read: (d: DrugDossier) => string
}

const SCALAR_FIELDS: ScalarSpec[] = [
  { field: 'name', label: 'Name', read: (d) => d.name },
  { field: 'tradeName', label: 'Trade name', read: (d) => d.tradeName ?? '' },
  { field: 'sponsor', label: 'Sponsor', read: (d) => d.sponsor },
  { field: 'targetGene', label: 'Target gene', read: (d) => d.targetGene },
  { field: 'targetProtein', label: 'Target protein', read: (d) => d.targetProtein },
  { field: 'modality', label: 'Modality', read: (d) => d.modality },
  { field: 'approvalStatus', label: 'Approval status', read: (d) => d.approvalStatus },
  { field: 'approvalYear', label: 'Approval year', read: (d) => (d.approvalYear ? String(d.approvalYear) : '') },
  { field: 'indication', label: 'Indication', read: (d) => d.indication },
  {
    field: 'patientFriendlyIndication',
    label: 'Plain-language indication',
    read: (d) => d.patientFriendlyIndication,
  },
  { field: 'oneSentenceVerdict', label: 'Verdict', read: (d) => d.oneSentenceVerdict },
  { field: 'laymanHowItWorks', label: 'How it works', read: (d) => d.laymanHowItWorks },
  { field: 'auditConfidence', label: 'Audit confidence', read: (d) => d.auditConfidence },
  { field: 'confidenceScore', label: 'Confidence score', read: (d) => String(d.confidenceScore) },
  { field: 'anatomicalSite', label: 'Anatomical site', read: (d) => d.anatomicalSite ?? '' },
  { field: 'recentAuditDate', label: 'Last audit date', read: (d) => d.recentAuditDate },
  { field: 'hasDiscrepancy', label: 'Discrepancy flag', read: (d) => (d.hasDiscrepancy ? 'yes' : 'no') },
  { field: 'dossierDepth', label: 'Record depth', read: (d) => d.dossierDepth ?? 'stub' },
]

interface SectionSpec {
  field: string
  label: string
  value: (d: DrugDossier) => unknown
  /** A one-line summary of the section as a reader would recognise it. '' when the section is empty. */
  describe: (d: DrugDossier) => string
}

const SECTION_FIELDS: SectionSpec[] = [
  {
    field: 'conditionContext',
    label: 'Condition context',
    value: (d) => d.conditionContext,
    describe: (d) => truncate(d.conditionContext?.conditionExplainer ?? '', 80),
  },
  {
    field: 'keyAudits',
    label: 'Evidence audit points',
    value: (d) => d.keyAudits,
    describe: (d) => {
      if (d.keyAudits.length === 0) return ''
      const c = countAuditPoints(d.keyAudits)
      return `${d.keyAudits.length} points (${c.measured} measured / ${c.inferred} inferred / ${c.failed} failed / ${c.conclusionShift} shifted)`
    },
  },
  {
    field: 'mechanismSteps',
    label: 'Mechanism of action',
    value: (d) => d.mechanismSteps,
    describe: (d) => (d.mechanismSteps.length === 0 ? '' : `${d.mechanismSteps.length} steps`),
  },
  {
    field: 'trials',
    label: 'Clinical trials',
    value: (d) => d.trials,
    describe: (d) => (d.trials.length === 0 ? '' : `${d.trials.length} trials`),
  },
  {
    field: 'measuredVsInferredSummary',
    label: 'Measured vs inferred',
    value: (d) => d.measuredVsInferredSummary,
    describe: (d) => {
      const s = d.measuredVsInferredSummary
      const total =
        s.strictlyMeasured.length +
        s.unsupportedInferences.length +
        s.whatFailedInitially.length +
        s.realWorldOutcome.length
      if (total === 0) return ''
      return `${s.strictlyMeasured.length} measured / ${s.unsupportedInferences.length} inferred / ${s.whatFailedInitially.length} failed / ${s.realWorldOutcome.length} outcomes`
    },
  },
  {
    field: 'molecularSchema',
    label: 'Molecular structure',
    value: (d) => d.molecularSchema,
    describe: (d) => {
      const schema = d.molecularSchema
      if (!schema) return ''
      const structure = structureStringFor(d)
      const parts = [
        schema.structureType,
        structure ? `${structure.length} characters` : null,
        schema.chemicalFormula,
        schema.molecularWeight,
        schema.laboratoryWorkflow.length > 0 ? `${schema.laboratoryWorkflow.length} protocol steps` : null,
      ].filter((part): part is string => typeof part === 'string' && part.length > 0)
      return truncate(parts.join(' · '))
    },
  },
  {
    field: 'deliverySystem',
    label: 'Delivery system',
    value: (d) => d.deliverySystem,
    describe: (d) => truncate(d.deliverySystem.type, 80),
  },
  {
    field: 'pricing',
    label: 'Pricing',
    value: (d) => d.pricing,
    describe: (d) => {
      const parts = [d.pricing?.retailPricePerDoseOrYear, d.pricing?.markupEstimate].filter(
        (part): part is string => typeof part === 'string' && part.trim().length > 0,
      )
      return truncate(parts.join(' · '))
    },
  },
  {
    field: 'substitutes',
    label: 'Alternatives',
    value: (d) => d.substitutes,
    describe: (d) => {
      const s = d.substitutes
      if (!s) return ''
      const total = s.conventionalRx.length + s.naturalFoods.length + s.homeRemedies.length
      if (total === 0) return ''
      return `${s.conventionalRx.length} conventional / ${s.naturalFoods.length} natural / ${s.homeRemedies.length} home`
    },
  },
  {
    field: 'commonQuestions',
    label: 'Common questions',
    value: (d) => d.commonQuestions,
    describe: (d) => (d.commonQuestions.length === 0 ? '' : `${d.commonQuestions.length} questions`),
  },
  {
    field: 'sourceProvenance',
    label: 'Source provenance',
    value: (d) => d.sourceProvenance,
    describe: (d) => truncate((d.sourceProvenance ?? []).join(', ')),
  },
]

/**
 * What actually moved inside a section whose headline summary did not change — three audit points
 * rewritten leaves the count identical, and "12 points -> 12 points" is a diff line that tells a
 * reviewer nothing. Returns '' when it has nothing more precise to say.
 */
function describeInnerChange(before: unknown, after: unknown): string {
  if (Array.isArray(before) && Array.isArray(after)) {
    const shared = Math.min(before.length, after.length)
    let edited = 0
    for (let i = 0; i < shared; i += 1) {
      if (stableStringify(before[i]) !== stableStringify(after[i])) edited += 1
    }
    const added = Math.max(0, after.length - before.length)
    const removed = Math.max(0, before.length - after.length)
    const parts = [
      added > 0 ? `${added} added` : null,
      removed > 0 ? `${removed} removed` : null,
      edited > 0 ? `${edited} edited` : null,
    ].filter((part): part is string => part !== null)
    return parts.join(', ')
  }

  const isPlainObject = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v)

  if (isPlainObject(before) && isPlainObject(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)])
    const changed = [...keys]
      .filter((key) => stableStringify(before[key]) !== stableStringify(after[key]))
      .sort()
      .map(humaniseKey)
    if (changed.length === 0) return ''
    return `updated: ${truncate(changed.join(', '), 80)}`
  }

  return ''
}

/**
 * A field-level diff of two dossiers: one entry per scalar field that changed, one entry per jsonb
 * section that changed. Sections are summarised rather than dumped — a reviewer reading the queue
 * needs "Pricing: $936 / month · 22,200% markup -> $1,349 / month · 31,000% markup", not four
 * kilobytes of JSON with two characters different somewhere inside it.
 *
 * Derived and provenance fields (`auditPointsCount`, view and revision counts, community notes)
 * are not diffed. They are not what anyone edited.
 */
export function diffDossiers(before: DrugDossier, after: DrugDossier): RevisionFieldChange[] {
  const changes: RevisionFieldChange[] = []

  for (const spec of SCALAR_FIELDS) {
    const beforeValue = spec.read(before)
    const afterValue = spec.read(after)
    if (beforeValue === afterValue) continue
    changes.push({
      field: spec.field,
      label: spec.label,
      before: orNotSet(truncate(beforeValue)),
      after: orNotSet(truncate(afterValue)),
    })
  }

  for (const spec of SECTION_FIELDS) {
    const beforeValue = spec.value(before)
    const afterValue = spec.value(after)
    if (stableStringify(beforeValue) === stableStringify(afterValue)) continue

    const beforeText = orNotSet(spec.describe(before))
    let afterText = orNotSet(spec.describe(after))
    if (beforeText === afterText) {
      const detail = describeInnerChange(beforeValue, afterValue)
      afterText = detail ? `${afterText} (${detail})` : `${afterText} (revised)`
    }
    changes.push({ field: spec.field, label: spec.label, before: beforeText, after: afterText })
  }

  return changes
}
