import { and, asc, count, desc, eq, isNotNull, isNull } from 'drizzle-orm'

import { db } from '@/db'
import {
  developmentProgrammes,
  drugs,
  legacyIdentityCorrectionDetails,
  legacyRevisionQuarantines,
  revisions,
} from '@/db/schema'
import { newId } from '@/lib/ids'
import type {
  LegacyIdentityCorrectionDetail,
  LegacyIdentityCorrectionField,
  LegacyRevisionQuarantine,
  Revision,
  RevisionFieldChange,
  TrustTier,
} from '@/lib/types'
import type { Tx } from './drugs'

export type RevisionErrorCode =
  | 'not_found'
  | 'drug_not_found'
  | 'not_pending'
  | 'not_identity_correction'
  | 'quarantined'
  | 'self_review'
  | 'stale_identity'
  | 'programme_required'
  | 'no_change'

export class RevisionError extends Error {
  readonly code: RevisionErrorCode

  constructor(code: RevisionErrorCode, message: string) {
    super(message)
    this.name = 'RevisionError'
    this.code = code
  }
}

export interface RevisionAuthor {
  userId: string
  name: string
  orcid?: string | null
  trustTier: TrustTier
}

export interface RevisionReviewer {
  userId: string
  name: string
}

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

const identityDetailColumns = {
  correctionField: legacyIdentityCorrectionDetails.field,
  correctionPreviousValue: legacyIdentityCorrectionDetails.previousValue,
  correctionProposedValue: legacyIdentityCorrectionDetails.proposedValue,
  correctionSourceUrl: legacyIdentityCorrectionDetails.sourceUrl,
  correctionSourceTitle: legacyIdentityCorrectionDetails.sourceTitle,
}

const quarantineColumns = {
  quarantineReasonCode: legacyRevisionQuarantines.reasonCode,
  quarantineSystemReason: legacyRevisionQuarantines.systemReason,
  quarantinedAt: legacyRevisionQuarantines.quarantinedAt,
}

type RevisionListRow = Pick<typeof revisions.$inferSelect, keyof typeof revisionListColumns>

interface DrugIdentity {
  name: string
  slug: string
}

interface IdentityDetailRow {
  correctionField: LegacyIdentityCorrectionField | null
  correctionPreviousValue: string | null
  correctionProposedValue: string | null
  correctionSourceUrl: string | null
  correctionSourceTitle: string | null
}

interface QuarantineRow {
  quarantineReasonCode: string | null
  quarantineSystemReason: string | null
  quarantinedAt: Date | null
}

function toIdentityCorrection(row: IdentityDetailRow): LegacyIdentityCorrectionDetail | null {
  if (
    row.correctionField === null ||
    row.correctionSourceUrl === null ||
    row.correctionSourceTitle === null
  ) {
    return null
  }
  return {
    field: row.correctionField,
    previousValue: row.correctionPreviousValue,
    proposedValue: row.correctionProposedValue,
    sourceUrl: row.correctionSourceUrl,
    sourceTitle: row.correctionSourceTitle,
  }
}

function toQuarantine(row: QuarantineRow): LegacyRevisionQuarantine | null {
  if (
    row.quarantineReasonCode !== 'pre_0011_unsafe_pending' ||
    row.quarantineSystemReason === null ||
    row.quarantinedAt === null
  ) {
    return null
  }
  return {
    reasonCode: row.quarantineReasonCode,
    systemReason: row.quarantineSystemReason,
    quarantinedAt: row.quarantinedAt.toISOString(),
  }
}

function toRevision(
  row: RevisionListRow,
  drug: DrugIdentity,
  identityCorrection: LegacyIdentityCorrectionDetail | null,
  quarantine: LegacyRevisionQuarantine | null,
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
    identityCorrection,
    quarantine,
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

function identityChange(
  field: LegacyIdentityCorrectionField,
  previousValue: string | null,
  proposedValue: string | null,
): RevisionFieldChange {
  return {
    field,
    label: field === 'name' ? 'Medicine name' : 'Trade or brand name',
    before: previousValue ?? 'Not recorded',
    after: proposedValue ?? 'Not recorded',
  }
}

async function ensureNoProgramme(tx: Tx, drugId: string): Promise<void> {
  const rows = await tx
    .select({ id: developmentProgrammes.id })
    .from(developmentProgrammes)
    .where(eq(developmentProgrammes.drugId, drugId))
    .limit(1)
  if (rows.length > 0) {
    throw new RevisionError(
      'programme_required',
      'This medicine has an identified development programme. Evidence and conclusion changes must use that programme so reviewers can see the exact use, population, dose and studies involved.',
    )
  }
}

export interface CreateLegacyIdentityCorrectionInput {
  drugId: string
  author: RevisionAuthor
  field: LegacyIdentityCorrectionField
  proposedValue: string | null
  sourceUrl: string
  sourceTitle: string
  explanation: string
  id?: string
}

export async function createLegacyIdentityCorrection(
  input: CreateLegacyIdentityCorrectionInput,
): Promise<Revision> {
  return db.transaction(async (tx) => {
    const drugRows = await tx
      .select({ name: drugs.name, tradeName: drugs.tradeName, slug: drugs.slug })
      .from(drugs)
      .where(eq(drugs.id, input.drugId))
      .limit(1)
      .for('update')
    const drug = drugRows[0]
    if (!drug) throw new RevisionError('drug_not_found', 'No medicine matches this correction.')

    await ensureNoProgramme(tx, input.drugId)

    const previousValue = input.field === 'name' ? drug.name : drug.tradeName
    if (previousValue === input.proposedValue) {
      throw new RevisionError('no_change', 'The proposed value is already recorded.')
    }

    const replayRows = await tx
      .select({ ...revisionListColumns, ...identityDetailColumns })
      .from(revisions)
      .innerJoin(
        legacyIdentityCorrectionDetails,
        eq(revisions.id, legacyIdentityCorrectionDetails.revisionId),
      )
      .leftJoin(legacyRevisionQuarantines, eq(revisions.id, legacyRevisionQuarantines.revisionId))
      .where(
        and(
          eq(revisions.drugId, input.drugId),
          eq(revisions.authorUserId, input.author.userId),
          eq(revisions.status, 'pending_review'),
          eq(revisions.summary, input.explanation),
          eq(legacyIdentityCorrectionDetails.field, input.field),
          previousValue === null
            ? isNull(legacyIdentityCorrectionDetails.previousValue)
            : eq(legacyIdentityCorrectionDetails.previousValue, previousValue),
          input.proposedValue === null
            ? isNull(legacyIdentityCorrectionDetails.proposedValue)
            : eq(legacyIdentityCorrectionDetails.proposedValue, input.proposedValue),
          eq(legacyIdentityCorrectionDetails.sourceUrl, input.sourceUrl),
          eq(legacyIdentityCorrectionDetails.sourceTitle, input.sourceTitle),
          isNull(legacyRevisionQuarantines.revisionId),
        ),
      )
      .orderBy(asc(revisions.createdAt), asc(revisions.id))
      .limit(1)
    const replay = replayRows[0]
    if (replay) {
      return toRevision(
        replay,
        { name: drug.name, slug: drug.slug },
        toIdentityCorrection(replay),
        null,
      )
    }

    const revisionId = input.id ?? newId('rev')
    const change = identityChange(input.field, previousValue, input.proposedValue)
    const proposedPayload =
      input.field === 'name' ? { name: input.proposedValue } : { tradeName: input.proposedValue }

    const inserted = await tx
      .insert(revisions)
      .values({
        id: revisionId,
        drugId: input.drugId,
        authorUserId: input.author.userId,
        authorName: input.author.name,
        authorOrcid: input.author.orcid ?? null,
        authorTrustTier: input.author.trustTier,
        status: 'pending_review',
        summary: input.explanation,
        changedFields: [change],
        proposedPayload,
        engineReport: null,
        machineVerified: false,
        verificationHash: null,
      })
      .returning(revisionListColumns)
    const row = inserted[0]
    if (!row) throw new RevisionError('not_found', 'The correction could not be written.')

    await tx.insert(legacyIdentityCorrectionDetails).values({
      revisionId,
      field: input.field,
      previousValue,
      proposedValue: input.proposedValue,
      sourceUrl: input.sourceUrl,
      sourceTitle: input.sourceTitle,
    })

    return toRevision(
      row,
      { name: drug.name, slug: drug.slug },
      {
        field: input.field,
        previousValue,
        proposedValue: input.proposedValue,
        sourceUrl: input.sourceUrl,
        sourceTitle: input.sourceTitle,
      },
      null,
    )
  })
}

export async function getRevisionById(revisionId: string): Promise<Revision | null> {
  const rows = await db
    .select({
      ...revisionListColumns,
      ...identityDetailColumns,
      ...quarantineColumns,
      engineReport: revisions.engineReport,
      drugName: drugs.name,
      drugSlug: drugs.slug,
    })
    .from(revisions)
    .innerJoin(drugs, eq(revisions.drugId, drugs.id))
    .leftJoin(
      legacyIdentityCorrectionDetails,
      eq(revisions.id, legacyIdentityCorrectionDetails.revisionId),
    )
    .leftJoin(legacyRevisionQuarantines, eq(revisions.id, legacyRevisionQuarantines.revisionId))
    .where(eq(revisions.id, revisionId))
    .limit(1)

  const row = rows[0]
  if (!row) return null
  const { drugName, drugSlug, engineReport, ...mapped } = row
  return toRevision(
    mapped,
    { name: drugName, slug: drugSlug },
    toIdentityCorrection(mapped),
    toQuarantine(mapped),
    engineReport,
  )
}

export async function listPendingRevisions(opts: {
  limit: number
  offset: number
}): Promise<Revision[]> {
  const rows = await db
    .select({
      ...revisionListColumns,
      ...identityDetailColumns,
      ...quarantineColumns,
      drugName: drugs.name,
      drugSlug: drugs.slug,
    })
    .from(revisions)
    .innerJoin(drugs, eq(revisions.drugId, drugs.id))
    .leftJoin(
      legacyIdentityCorrectionDetails,
      eq(revisions.id, legacyIdentityCorrectionDetails.revisionId),
    )
    .leftJoin(legacyRevisionQuarantines, eq(revisions.id, legacyRevisionQuarantines.revisionId))
    .where(
      and(
        eq(revisions.status, 'pending_review'),
        isNotNull(legacyIdentityCorrectionDetails.revisionId),
        isNull(legacyRevisionQuarantines.revisionId),
      ),
    )
    .orderBy(asc(revisions.createdAt), asc(revisions.id))
    .limit(Math.max(1, Math.trunc(opts.limit)))
    .offset(Math.max(0, Math.trunc(opts.offset)))

  return rows.map(({ drugName, drugSlug, ...row }) =>
    toRevision(
      row,
      { name: drugName, slug: drugSlug },
      toIdentityCorrection(row),
      toQuarantine(row),
    ),
  )
}

export async function countPendingRevisions(): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(revisions)
    .leftJoin(
      legacyIdentityCorrectionDetails,
      eq(revisions.id, legacyIdentityCorrectionDetails.revisionId),
    )
    .leftJoin(legacyRevisionQuarantines, eq(revisions.id, legacyRevisionQuarantines.revisionId))
    .where(
      and(
        eq(revisions.status, 'pending_review'),
        isNotNull(legacyIdentityCorrectionDetails.revisionId),
        isNull(legacyRevisionQuarantines.revisionId),
      ),
    )
  return rows[0]?.value ?? 0
}

function mapRevisionRows<
  Row extends RevisionListRow &
    IdentityDetailRow &
    QuarantineRow & {
      drugName: string
      drugSlug: string
    },
>(rows: Row[]): Revision[] {
  return rows.map(({ drugName, drugSlug, ...row }) =>
    toRevision(
      row,
      { name: drugName, slug: drugSlug },
      toIdentityCorrection(row),
      toQuarantine(row),
    ),
  )
}

export async function listRevisionsForDrug(
  drugId: string,
  limit: number,
  offset = 0,
): Promise<Revision[]> {
  const rows = await db
    .select({
      ...revisionListColumns,
      ...identityDetailColumns,
      ...quarantineColumns,
      drugName: drugs.name,
      drugSlug: drugs.slug,
    })
    .from(revisions)
    .innerJoin(drugs, eq(revisions.drugId, drugs.id))
    .leftJoin(
      legacyIdentityCorrectionDetails,
      eq(revisions.id, legacyIdentityCorrectionDetails.revisionId),
    )
    .leftJoin(legacyRevisionQuarantines, eq(revisions.id, legacyRevisionQuarantines.revisionId))
    .where(eq(revisions.drugId, drugId))
    .orderBy(desc(revisions.createdAt), desc(revisions.id))
    .limit(Math.max(1, Math.trunc(limit)))
    .offset(Math.max(0, Math.trunc(offset)))

  return mapRevisionRows(rows)
}

export async function listRevisionsByUser(userId: string, limit: number): Promise<Revision[]> {
  const rows = await db
    .select({
      ...revisionListColumns,
      ...identityDetailColumns,
      ...quarantineColumns,
      drugName: drugs.name,
      drugSlug: drugs.slug,
    })
    .from(revisions)
    .innerJoin(drugs, eq(revisions.drugId, drugs.id))
    .leftJoin(
      legacyIdentityCorrectionDetails,
      eq(revisions.id, legacyIdentityCorrectionDetails.revisionId),
    )
    .leftJoin(legacyRevisionQuarantines, eq(revisions.id, legacyRevisionQuarantines.revisionId))
    .where(eq(revisions.authorUserId, userId))
    .orderBy(desc(revisions.createdAt), desc(revisions.id))
    .limit(Math.max(1, Math.trunc(limit)))

  return mapRevisionRows(rows)
}

async function loadLockedRevision(tx: Tx, revisionId: string): Promise<RevisionListRow> {
  const rows = await tx
    .select(revisionListColumns)
    .from(revisions)
    .where(eq(revisions.id, revisionId))
    .limit(1)
    .for('update')
  const row = rows[0]
  if (!row) throw new RevisionError('not_found', 'No correction matches this id.')
  return row
}

async function loadIdentityDetail(
  tx: Tx,
  revisionId: string,
): Promise<LegacyIdentityCorrectionDetail> {
  const rows = await tx
    .select({
      field: legacyIdentityCorrectionDetails.field,
      previousValue: legacyIdentityCorrectionDetails.previousValue,
      proposedValue: legacyIdentityCorrectionDetails.proposedValue,
      sourceUrl: legacyIdentityCorrectionDetails.sourceUrl,
      sourceTitle: legacyIdentityCorrectionDetails.sourceTitle,
    })
    .from(legacyIdentityCorrectionDetails)
    .where(eq(legacyIdentityCorrectionDetails.revisionId, revisionId))
    .limit(1)
  const detail = rows[0]
  if (!detail) {
    throw new RevisionError(
      'not_identity_correction',
      'This older edit is not an identity correction and cannot use this review route.',
    )
  }
  return detail
}

async function ensureNotQuarantined(tx: Tx, revisionId: string): Promise<void> {
  const rows = await tx
    .select({ revisionId: legacyRevisionQuarantines.revisionId })
    .from(legacyRevisionQuarantines)
    .where(eq(legacyRevisionQuarantines.revisionId, revisionId))
    .limit(1)
  if (rows.length > 0) {
    throw new RevisionError(
      'quarantined',
      'This older edit remains in history but is not eligible for review or publication.',
    )
  }
}

function ensureIndependentReviewer(row: RevisionListRow, reviewer: RevisionReviewer): void {
  if (row.authorUserId === reviewer.userId) {
    throw new RevisionError(
      'self_review',
      'You cannot review your own correction. Another reviewer has to decide it.',
    )
  }
}

function ensurePending(row: RevisionListRow): void {
  if (row.status !== 'pending_review') {
    throw new RevisionError(
      'not_pending',
      'That correction already has a final decision and cannot be reviewed again.',
    )
  }
}

export async function approveRevision(
  revisionId: string,
  reviewer: RevisionReviewer,
): Promise<Revision> {
  return db.transaction(async (tx) => {
    const row = await loadLockedRevision(tx, revisionId)
    ensurePending(row)
    ensureIndependentReviewer(row, reviewer)
    await ensureNotQuarantined(tx, revisionId)
    const detail = await loadIdentityDetail(tx, revisionId)

    const drugRows = await tx
      .select({ name: drugs.name, tradeName: drugs.tradeName, slug: drugs.slug })
      .from(drugs)
      .where(eq(drugs.id, row.drugId))
      .limit(1)
      .for('update')
    const drug = drugRows[0]
    if (!drug) {
      throw new RevisionError('drug_not_found', 'This correction points at a missing medicine.')
    }

    await ensureNoProgramme(tx, row.drugId)
    const currentValue = detail.field === 'name' ? drug.name : drug.tradeName
    if (currentValue !== detail.previousValue) {
      throw new RevisionError(
        'stale_identity',
        'The recorded name changed after this correction was submitted. Review the current record and submit a new correction if it is still needed.',
      )
    }

    const updated = await tx
      .update(revisions)
      .set({
        status: 'published',
        reviewedAt: new Date(),
        reviewedByUserId: reviewer.userId,
        reviewedByName: reviewer.name,
        reviewNote: null,
      })
      .where(eq(revisions.id, revisionId))
      .returning(revisionListColumns)
    const after = updated[0]
    if (!after) throw new RevisionError('not_found', 'The correction vanished during review.')

    const displayedDrugName = detail.field === 'name' ? (detail.proposedValue as string) : drug.name
    return toRevision(after, { name: displayedDrugName, slug: drug.slug }, detail, null)
  })
}

export async function rejectRevision(
  revisionId: string,
  reviewer: RevisionReviewer,
  note: string,
): Promise<Revision> {
  const reason = note.trim()
  if (reason.length === 0) {
    throw new RevisionError('not_pending', 'Explain why the correction is being declined.')
  }

  return db.transaction(async (tx) => {
    const row = await loadLockedRevision(tx, revisionId)
    ensurePending(row)
    ensureIndependentReviewer(row, reviewer)
    await ensureNotQuarantined(tx, revisionId)
    const detail = await loadIdentityDetail(tx, revisionId)

    const drugRows = await tx
      .select({ name: drugs.name, slug: drugs.slug })
      .from(drugs)
      .where(eq(drugs.id, row.drugId))
      .limit(1)
    const drug = drugRows[0]
    if (!drug) {
      throw new RevisionError('drug_not_found', 'This correction points at a missing medicine.')
    }

    const updated = await tx
      .update(revisions)
      .set({
        status: 'rejected',
        reviewedAt: new Date(),
        reviewedByUserId: reviewer.userId,
        reviewedByName: reviewer.name,
        reviewNote: reason,
      })
      .where(eq(revisions.id, revisionId))
      .returning(revisionListColumns)
    const after = updated[0]
    if (!after) throw new RevisionError('not_found', 'The correction vanished during review.')
    return toRevision(after, drug, detail, null)
  })
}
