import { and, asc, eq, inArray, or } from 'drizzle-orm'
import { z } from 'zod'

import { db, type Db } from '@/db'
import {
  claimSourceLinks,
  claims,
  programmeCurrentPublications,
  programmeDependencies,
  programmeVerdictMechanismStepClaims,
  programmeVerdictMechanismSteps,
  programmeVerdictRevisions,
  programmeVerdictSourceMetadataSnapshots,
  programmeVerdictTimelineEventClaims,
  programmeVerdictTimelineEvents,
  sourceSnapshots,
  users,
} from '@/db/schema'
import { ApiError } from '@/lib/api-response'
import {
  EVIDENCE_NODE_CLAIM_RELATIONSHIPS,
  MECHANISM_EVIDENCE_BASES,
  PROGRAMME_TIMELINE_DATE_BASES,
  PROGRAMME_TIMELINE_EVENT_TYPES,
  type EvidenceNodeClaimRelationship,
  type MechanismEvidenceBasis,
  type ProgrammePresentationClaimLinkReadModel,
  type ProgrammePresentationSourceClaimBindingReadModel,
  type ProgrammePresentationSourceReadModel,
  type ProgrammeTimelineDateBasis,
  type ProgrammeTimelineEventType,
} from '@/lib/evidence/types'
import { newId } from '@/lib/ids'
import {
  prepareLockedProgrammeVerdictProposal,
  ProgrammeVerdictProposalError,
  type PreparedProgrammeVerdictProposal,
} from '@/lib/queries/programme-verdict-proposal'

export const PROGRAMME_PRESENTATION_SCHEMA_VERSION = 'programme-presentation/v1' as const

const presentationClaimLinkSchema = z
  .object({
    claimId: z.string().trim().min(1).max(64),
    relationship: z.enum(EVIDENCE_NODE_CLAIM_RELATIONSHIPS),
  })
  .strict()

const presentationKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9_-]{0,63}$/)

export const programmePresentationReplaceSchema = z
  .object({
    mechanismSteps: z
      .array(
        z
          .object({
            stepKey: presentationKeySchema,
            stepOrder: z.number().int().min(1).max(5),
            plainTitle: z.string().trim().min(1).max(240),
            plainDescription: z.string().trim().min(1).max(2_000),
            technicalDescription: z.string().trim().min(1).max(4_000).nullable().optional(),
            evidenceBasis: z.enum(MECHANISM_EVIDENCE_BASES),
            claimLinks: z.array(presentationClaimLinkSchema).min(1),
          })
          .strict(),
      )
      .min(3)
      .max(5),
    timelineEvents: z
      .array(
        z
          .object({
            eventKey: presentationKeySchema,
            eventDate: z.string().date(),
            eventType: z.enum(PROGRAMME_TIMELINE_EVENT_TYPES),
            dateBasis: z.enum(PROGRAMME_TIMELINE_DATE_BASES),
            plainTitle: z.string().trim().min(1).max(240),
            plainDescription: z.string().trim().min(1).max(2_000),
            technicalDescription: z.string().trim().min(1).max(4_000).nullable().optional(),
            programmeTrialId: z.string().trim().min(1).max(64).nullable().optional(),
            sourceId: z.string().trim().min(1).max(64),
            sourceSnapshotId: z.string().trim().min(1).max(64),
            claimLinks: z.array(presentationClaimLinkSchema).min(1),
          })
          .strict(),
      )
      .max(100),
  })
  .strict()
  .superRefine((value, context) => {
    const stepKeys = new Set(value.mechanismSteps.map((step) => step.stepKey))
    if (stepKeys.size !== value.mechanismSteps.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mechanism step keys must be unique.',
      })
    }
    const orders = value.mechanismSteps.map((step) => step.stepOrder).sort((a, b) => a - b)
    if (orders.some((order, index) => order !== index + 1)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mechanism step order must be contiguous from one.',
      })
    }
    for (const step of value.mechanismSteps) {
      if (new Set(step.claimLinks.map((link) => link.claimId)).size !== step.claimLinks.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${step.stepKey} may link each claim only once.`,
          path: ['mechanismSteps', value.mechanismSteps.indexOf(step), 'claimLinks'],
        })
      }
      if (
        !step.claimLinks.some(
          (link) => link.relationship === 'SUPPORTS' || link.relationship === 'QUALIFIES',
        )
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${step.stepKey} needs a SUPPORTS or QUALIFIES claim.`,
        })
      }
    }
    const eventKeys = new Set(value.timelineEvents.map((event) => event.eventKey))
    if (eventKeys.size !== value.timelineEvents.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Timeline event keys must be unique.',
      })
    }
    for (const event of value.timelineEvents) {
      if (new Set(event.claimLinks.map((link) => link.claimId)).size !== event.claimLinks.length) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${event.eventKey} may link each claim only once.`,
          path: ['timelineEvents', value.timelineEvents.indexOf(event), 'claimLinks'],
        })
      }
      if (!event.claimLinks.some((link) => link.relationship === 'SUPPORTS')) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${event.eventKey} needs a SUPPORTS claim.`,
        })
      }
    }
  })

export const programmePresentationPrepareSchema = z.object({}).strict()

export type ProgrammePresentationReplaceInput = z.infer<typeof programmePresentationReplaceSchema>

export type ProgrammePresentationSource = ProgrammePresentationSourceReadModel

export interface ProgrammePresentationMechanismStep {
  stepKey: string
  stepOrder: number
  plainTitle: string
  plainDescription: string
  technicalDescription: string | null
  evidenceBasis: MechanismEvidenceBasis
  claimIds: string[]
  claimLinks: ProgrammePresentationClaimLinkReadModel[]
  sources: ProgrammePresentationSource[]
}

export interface ProgrammePresentationTimelineEvent {
  eventKey: string
  eventDate: string
  eventType: ProgrammeTimelineEventType
  dateBasis: ProgrammeTimelineDateBasis
  plainTitle: string
  plainDescription: string
  technicalDescription: string | null
  programmeTrialId: string | null
  sourceId: string
  sourceSnapshotId: string
  claimIds: string[]
  claimLinks: ProgrammePresentationClaimLinkReadModel[]
  source: ProgrammePresentationSource
}

export interface ProgrammePresentationPublicationDate {
  revisionId: string
  revisionNumber: number
  publishedAt: string
  supersededAt: string | null
}

export interface PublicProgrammePresentation {
  schemaVersion: typeof PROGRAMME_PRESENTATION_SCHEMA_VERSION
  verdictRevisionId: string
  programmeId: string
  revisionNumber: number
  publishedAt: string
  supersededAt: string | null
  mechanismSteps: ProgrammePresentationMechanismStep[]
  timelineEvents: ProgrammePresentationTimelineEvent[]
  publicationHistory: ProgrammePresentationPublicationDate[]
}

export class ProgrammePresentationError extends ApiError {
  constructor(status: number, message: string, code: string, details?: unknown) {
    super(status, message, code, details)
    this.name = 'ProgrammePresentationError'
  }
}

type Transaction = Parameters<Parameters<Db['transaction']>[0]>[0]
type Executor = Pick<Transaction, 'select'>

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort()
}

function sourceKey(sourceId: string, sourceSnapshotId: string): string {
  return `${sourceId}\u001f${sourceSnapshotId}`
}

async function requireSteward(tx: Transaction, actorUserId: string) {
  const rows = await tx.select().from(users).where(eq(users.id, actorUserId)).limit(1).for('share')
  const actor = rows[0]
  if (!actor || (!actor.isAdmin && actor.trustTier !== 'steward')) {
    throw new ProgrammePresentationError(
      403,
      'Only a steward or administrator may edit a canonical presentation.',
      'presentation_not_authorized',
    )
  }
  return actor
}

function presentationClaimIds(input: ProgrammePresentationReplaceInput): string[] {
  return uniqueSorted([
    ...input.mechanismSteps.flatMap((step) => step.claimLinks.map((link) => link.claimId)),
    ...input.timelineEvents.flatMap((event) => event.claimLinks.map((link) => link.claimId)),
  ])
}

function deduplicatedLinks(
  links: readonly { claimId: string; relationship: EvidenceNodeClaimRelationship }[],
) {
  return [
    ...new Map(links.map((link) => [`${link.claimId}\u001f${link.relationship}`, link])).values(),
  ]
}

/** Replace the complete structured presentation while the canonical candidate is still editable. */
export async function replaceDraftProgrammePresentation(args: {
  revisionId: string
  actorUserId: string
  presentation: ProgrammePresentationReplaceInput
}) {
  const presentation = programmePresentationReplaceSchema.parse(args.presentation)
  return db.transaction(async (tx) => {
    await requireSteward(tx, args.actorUserId)
    const candidateRows = await tx
      .select()
      .from(programmeVerdictRevisions)
      .where(eq(programmeVerdictRevisions.id, args.revisionId))
      .limit(1)
      .for('update')
    const candidate = candidateRows[0]
    if (!candidate) {
      throw new ProgrammePresentationError(404, 'Canonical candidate not found.', 'not_found')
    }
    if (candidate.reviewStatus !== 'DRAFT' || candidate.proposalPreparedAt !== null) {
      throw new ProgrammePresentationError(
        409,
        'A presentation can change only on an unprepared DRAFT candidate.',
        'presentation_frozen',
      )
    }

    const claimIds = presentationClaimIds(presentation)
    const claimRows = await tx
      .select({ id: claims.id, programmeId: claims.programmeId })
      .from(claims)
      .where(and(eq(claims.programmeId, candidate.programmeId), inArray(claims.id, claimIds)))
      .for('share')
    if (claimRows.length !== claimIds.length) {
      throw new ProgrammePresentationError(
        422,
        'Every presentation claim must be an exact revision from this programme.',
        'presentation_claim_scope_mismatch',
      )
    }

    const citationRows = await tx
      .select({
        claimId: claimSourceLinks.claimId,
        sourceSnapshotId: claimSourceLinks.sourceSnapshotId,
        relationship: claimSourceLinks.relationship,
        sourceId: sourceSnapshots.sourceId,
      })
      .from(claimSourceLinks)
      .innerJoin(sourceSnapshots, eq(sourceSnapshots.id, claimSourceLinks.sourceSnapshotId))
      .where(inArray(claimSourceLinks.claimId, claimIds))
      .for('share')
    const supportCitedClaimIds = new Set(
      citationRows.filter((row) => row.relationship === 'SUPPORTS').map((row) => row.claimId),
    )
    if (claimIds.some((claimId) => !supportCitedClaimIds.has(claimId))) {
      throw new ProgrammePresentationError(
        422,
        'Every presentation claim requires an exact immutable source citation that supports the claim.',
        'presentation_claim_missing_source',
      )
    }
    for (const event of presentation.timelineEvents) {
      const matchingCitation = citationRows.some(
        (citation) =>
          citation.sourceId === event.sourceId &&
          citation.sourceSnapshotId === event.sourceSnapshotId &&
          citation.relationship === 'SUPPORTS' &&
          event.claimLinks.some(
            (link) => link.relationship === 'SUPPORTS' && link.claimId === citation.claimId,
          ),
      )
      if (!matchingCitation) {
        throw new ProgrammePresentationError(
          422,
          `${event.eventKey} must cite the exact snapshot used by one SUPPORTS claim.`,
          'timeline_snapshot_not_cited',
        )
      }
    }

    await tx
      .delete(programmeDependencies)
      .where(
        and(
          eq(programmeDependencies.verdictRevisionId, candidate.id),
          or(
            eq(programmeDependencies.dependentSurfaceType, 'MECHANISM_MAP'),
            eq(programmeDependencies.dependentSurfaceType, 'TIMELINE'),
          ),
        ),
      )
    await tx
      .delete(programmeVerdictMechanismStepClaims)
      .where(eq(programmeVerdictMechanismStepClaims.verdictRevisionId, candidate.id))
    await tx
      .delete(programmeVerdictMechanismSteps)
      .where(eq(programmeVerdictMechanismSteps.verdictRevisionId, candidate.id))
    await tx
      .delete(programmeVerdictTimelineEventClaims)
      .where(eq(programmeVerdictTimelineEventClaims.verdictRevisionId, candidate.id))
    await tx
      .delete(programmeVerdictTimelineEvents)
      .where(eq(programmeVerdictTimelineEvents.verdictRevisionId, candidate.id))

    await tx.insert(programmeVerdictMechanismSteps).values(
      presentation.mechanismSteps.map((step) => ({
        verdictRevisionId: candidate.id,
        programmeId: candidate.programmeId,
        stepKey: step.stepKey,
        stepOrder: step.stepOrder,
        plainTitle: step.plainTitle,
        plainDescription: step.plainDescription,
        technicalDescription: step.technicalDescription ?? null,
        evidenceBasis: step.evidenceBasis,
      })),
    )
    await tx.insert(programmeVerdictMechanismStepClaims).values(
      presentation.mechanismSteps.flatMap((step) =>
        deduplicatedLinks(step.claimLinks).map((link) => ({
          verdictRevisionId: candidate.id,
          programmeId: candidate.programmeId,
          stepKey: step.stepKey,
          claimId: link.claimId,
          relationship: link.relationship,
        })),
      ),
    )
    if (presentation.timelineEvents.length > 0) {
      await tx.insert(programmeVerdictTimelineEvents).values(
        presentation.timelineEvents.map((event) => ({
          verdictRevisionId: candidate.id,
          programmeId: candidate.programmeId,
          eventKey: event.eventKey,
          eventDate: event.eventDate,
          eventType: event.eventType,
          dateBasis: event.dateBasis,
          plainTitle: event.plainTitle,
          plainDescription: event.plainDescription,
          technicalDescription: event.technicalDescription ?? null,
          programmeTrialId: event.programmeTrialId ?? null,
          sourceId: event.sourceId,
          sourceSnapshotId: event.sourceSnapshotId,
        })),
      )
      await tx.insert(programmeVerdictTimelineEventClaims).values(
        presentation.timelineEvents.flatMap((event) =>
          deduplicatedLinks(event.claimLinks).map((link) => ({
            verdictRevisionId: candidate.id,
            programmeId: candidate.programmeId,
            eventKey: event.eventKey,
            claimId: link.claimId,
            relationship: link.relationship,
          })),
        ),
      )
    }

    const dependencies = [
      ...presentation.mechanismSteps.flatMap((step) =>
        deduplicatedLinks(step.claimLinks).map((link) => ({
          id: newId('dependency'),
          programmeId: candidate.programmeId,
          claimId: link.claimId,
          dependentSurfaceType: 'MECHANISM_MAP' as const,
          verdictRevisionId: candidate.id,
          fieldPath: `mechanism.${step.stepKey}.plainDescription`,
          impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
        })),
      ),
      ...presentation.timelineEvents.flatMap((event) =>
        deduplicatedLinks(event.claimLinks).map((link) => ({
          id: newId('dependency'),
          programmeId: candidate.programmeId,
          claimId: link.claimId,
          dependentSurfaceType: 'TIMELINE' as const,
          verdictRevisionId: candidate.id,
          fieldPath: `timeline.${event.eventKey}.plainDescription`,
          impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED' as const,
        })),
      ),
    ]
    await tx.insert(programmeDependencies).values(dependencies)
    const rows = await tx
      .update(programmeVerdictRevisions)
      .set({ presentationSchemaVersion: PROGRAMME_PRESENTATION_SCHEMA_VERSION })
      .where(eq(programmeVerdictRevisions.id, candidate.id))
      .returning({
        revisionId: programmeVerdictRevisions.id,
        programmeId: programmeVerdictRevisions.programmeId,
        presentationSchemaVersion: programmeVerdictRevisions.presentationSchemaVersion,
      })
    return rows[0]!
  })
}

/** Steward/admin preparation path. RNA Intelligence still supplies the scientific publication gate. */
export async function prepareDraftProgrammePresentation(args: {
  revisionId: string
  actorUserId: string
}): Promise<PreparedProgrammeVerdictProposal> {
  try {
    return await db.transaction(async (tx) => {
      await requireSteward(tx, args.actorUserId)
      const candidates = await tx
        .select({ presentationSchemaVersion: programmeVerdictRevisions.presentationSchemaVersion })
        .from(programmeVerdictRevisions)
        .where(eq(programmeVerdictRevisions.id, args.revisionId))
        .limit(1)
        .for('update')
      if (!candidates[0]) {
        throw new ProgrammePresentationError(404, 'Canonical candidate not found.', 'not_found')
      }
      if (candidates[0].presentationSchemaVersion !== PROGRAMME_PRESENTATION_SCHEMA_VERSION) {
        throw new ProgrammePresentationError(
          422,
          'Attach a complete programme-presentation/v1 bundle before preparation.',
          'presentation_not_attached',
        )
      }
      return prepareLockedProgrammeVerdictProposal(tx, args.revisionId)
    })
  } catch (error) {
    if (error instanceof ProgrammeVerdictProposalError) {
      throw new ProgrammePresentationError(422, error.message, `presentation_prepare_${error.code}`)
    }
    throw error
  }
}

async function readProgrammePresentation(
  executor: Executor,
  verdictRevisionId: string,
): Promise<PublicProgrammePresentation | null> {
  const revisionRows = await executor
    .select({
      verdictRevisionId: programmeVerdictRevisions.id,
      programmeId: programmeVerdictRevisions.programmeId,
      revisionNumber: programmeVerdictRevisions.revisionNumber,
      schemaVersion: programmeVerdictRevisions.presentationSchemaVersion,
      reviewStatus: programmeVerdictRevisions.reviewStatus,
      publishedAt: programmeVerdictRevisions.publishedAt,
      supersededAt: programmeVerdictRevisions.supersededAt,
    })
    .from(programmeVerdictRevisions)
    .where(eq(programmeVerdictRevisions.id, verdictRevisionId))
    .limit(1)
  const revision = revisionRows[0]
  if (
    !revision ||
    revision.schemaVersion !== PROGRAMME_PRESENTATION_SCHEMA_VERSION ||
    !['PUBLISHED', 'SUPERSEDED'].includes(revision.reviewStatus) ||
    !revision.publishedAt
  ) {
    return null
  }

  const [stepRows, stepLinkRows, eventRows, eventLinkRows, historyRows] = await Promise.all([
    executor
      .select()
      .from(programmeVerdictMechanismSteps)
      .where(eq(programmeVerdictMechanismSteps.verdictRevisionId, revision.verdictRevisionId))
      .orderBy(
        asc(programmeVerdictMechanismSteps.stepOrder),
        asc(programmeVerdictMechanismSteps.stepKey),
      ),
    executor
      .select({
        stepKey: programmeVerdictMechanismStepClaims.stepKey,
        claimId: programmeVerdictMechanismStepClaims.claimId,
        relationship: programmeVerdictMechanismStepClaims.relationship,
      })
      .from(programmeVerdictMechanismStepClaims)
      .where(eq(programmeVerdictMechanismStepClaims.verdictRevisionId, revision.verdictRevisionId))
      .orderBy(
        asc(programmeVerdictMechanismStepClaims.stepKey),
        asc(programmeVerdictMechanismStepClaims.claimId),
      ),
    executor
      .select()
      .from(programmeVerdictTimelineEvents)
      .where(eq(programmeVerdictTimelineEvents.verdictRevisionId, revision.verdictRevisionId))
      .orderBy(
        asc(programmeVerdictTimelineEvents.eventDate),
        asc(programmeVerdictTimelineEvents.eventKey),
      ),
    executor
      .select({
        eventKey: programmeVerdictTimelineEventClaims.eventKey,
        claimId: programmeVerdictTimelineEventClaims.claimId,
        relationship: programmeVerdictTimelineEventClaims.relationship,
      })
      .from(programmeVerdictTimelineEventClaims)
      .where(eq(programmeVerdictTimelineEventClaims.verdictRevisionId, revision.verdictRevisionId))
      .orderBy(
        asc(programmeVerdictTimelineEventClaims.eventKey),
        asc(programmeVerdictTimelineEventClaims.claimId),
      ),
    executor
      .select({
        revisionId: programmeVerdictRevisions.id,
        revisionNumber: programmeVerdictRevisions.revisionNumber,
        publishedAt: programmeVerdictRevisions.publishedAt,
        supersededAt: programmeVerdictRevisions.supersededAt,
      })
      .from(programmeVerdictRevisions)
      .where(
        and(
          eq(programmeVerdictRevisions.programmeId, revision.programmeId),
          or(
            eq(programmeVerdictRevisions.reviewStatus, 'PUBLISHED'),
            eq(programmeVerdictRevisions.reviewStatus, 'SUPERSEDED'),
          ),
        ),
      )
      .orderBy(asc(programmeVerdictRevisions.revisionNumber)),
  ])

  const presentationClaimIds = uniqueSorted([
    ...stepLinkRows.map((row) => row.claimId),
    ...eventLinkRows.map((row) => row.claimId),
  ])
  const citationRows =
    presentationClaimIds.length === 0
      ? []
      : await executor
          .select({
            claimId: claimSourceLinks.claimId,
            plainLanguageText: claims.plainLanguageText,
            sourceSnapshotId: claimSourceLinks.sourceSnapshotId,
            sourceId: sourceSnapshots.sourceId,
            retrievedAt: sourceSnapshots.retrievedAt,
            contentHash: sourceSnapshots.contentHash,
          })
          .from(claimSourceLinks)
          .innerJoin(claims, eq(claims.id, claimSourceLinks.claimId))
          .innerJoin(sourceSnapshots, eq(sourceSnapshots.id, claimSourceLinks.sourceSnapshotId))
          .where(
            and(
              inArray(claimSourceLinks.claimId, presentationClaimIds),
              eq(claimSourceLinks.relationship, 'SUPPORTS'),
            ),
          )
          .orderBy(
            asc(claimSourceLinks.claimId),
            asc(sourceSnapshots.sourceId),
            asc(claimSourceLinks.sourceSnapshotId),
          )
  const sourceIds = uniqueSorted([
    ...citationRows.map((row) => row.sourceId),
    ...eventRows.map((row) => row.sourceId),
  ])
  const sourceRows =
    sourceIds.length === 0
      ? []
      : await executor
          .select()
          .from(programmeVerdictSourceMetadataSnapshots)
          .where(
            and(
              eq(
                programmeVerdictSourceMetadataSnapshots.verdictRevisionId,
                revision.verdictRevisionId,
              ),
              inArray(programmeVerdictSourceMetadataSnapshots.sourceId, sourceIds),
            ),
          )
          .orderBy(asc(programmeVerdictSourceMetadataSnapshots.sourceId))
  const sourceById = new Map(sourceRows.map((row) => [row.sourceId, row]))
  const snapshotByKey = new Map(
    citationRows.map((row) => [sourceKey(row.sourceId, row.sourceSnapshotId), row]),
  )
  const sourceFrom = (
    sourceId: string,
    sourceSnapshotId: string,
    claimBindings: ProgrammePresentationSourceClaimBindingReadModel[],
  ): ProgrammePresentationSource => {
    const source = sourceById.get(sourceId)
    const snapshot = snapshotByKey.get(sourceKey(sourceId, sourceSnapshotId))
    if (!source || !snapshot) {
      throw new ProgrammePresentationError(
        500,
        'A published presentation is missing its exact source metadata snapshot.',
        'published_presentation_source_missing',
      )
    }
    return {
      sourceId,
      sourceSnapshotId,
      sourceType: source.sourceType,
      externalIdentifier: source.externalIdentifier,
      canonicalLocator: source.canonicalLocator,
      title: source.title,
      publisher: source.publisher,
      publicationDate: source.publicationDate,
      retrievedAt: snapshot.retrievedAt.toISOString(),
      contentHash: snapshot.contentHash,
      claimBindings,
    }
  }

  const mechanismSteps = stepRows.map((step) => {
    const claimIds = uniqueSorted(
      stepLinkRows.filter((link) => link.stepKey === step.stepKey).map((link) => link.claimId),
    )
    const claimLinks = stepLinkRows
      .filter((link) => link.stepKey === step.stepKey)
      .map(({ claimId, relationship }) => ({ claimId, relationship }))
    const sourceCitations = citationRows.filter((citation) =>
      claimLinks.some((link) => link.claimId === citation.claimId),
    )
    const sources = uniqueSorted(
      sourceCitations.map((citation) => sourceKey(citation.sourceId, citation.sourceSnapshotId)),
    ).map((key) => {
      const citations = sourceCitations.filter(
        (citation) => sourceKey(citation.sourceId, citation.sourceSnapshotId) === key,
      )
      const citation = citations[0]
      if (!citation) {
        throw new ProgrammePresentationError(
          500,
          'A published mechanism source lost its exact citation binding.',
          'published_presentation_binding_missing',
        )
      }
      const claimBindings = citations.flatMap((row) =>
        claimLinks
          .filter((link) => link.claimId === row.claimId)
          .map((link) => ({
            claimId: link.claimId,
            relationship: link.relationship,
            plainLanguageText: row.plainLanguageText,
          })),
      )
      return sourceFrom(citation.sourceId, citation.sourceSnapshotId, claimBindings)
    })
    return {
      stepKey: step.stepKey,
      stepOrder: step.stepOrder,
      plainTitle: step.plainTitle,
      plainDescription: step.plainDescription,
      technicalDescription: step.technicalDescription,
      evidenceBasis: step.evidenceBasis,
      claimIds,
      claimLinks,
      sources,
    }
  })
  const timelineEvents = eventRows.map((event) => {
    const claimLinks = eventLinkRows
      .filter((link) => link.eventKey === event.eventKey)
      .map(({ claimId, relationship }) => ({ claimId, relationship }))
    return {
      eventKey: event.eventKey,
      eventDate: event.eventDate,
      eventType: event.eventType,
      dateBasis: event.dateBasis,
      plainTitle: event.plainTitle,
      plainDescription: event.plainDescription,
      technicalDescription: event.technicalDescription,
      programmeTrialId: event.programmeTrialId,
      sourceId: event.sourceId,
      sourceSnapshotId: event.sourceSnapshotId,
      claimIds: uniqueSorted(claimLinks.map((link) => link.claimId)),
      claimLinks,
      source: sourceFrom(
        event.sourceId,
        event.sourceSnapshotId,
        citationRows
          .filter(
            (citation) =>
              citation.sourceId === event.sourceId &&
              citation.sourceSnapshotId === event.sourceSnapshotId,
          )
          .flatMap((citation) =>
            claimLinks
              .filter((link) => link.claimId === citation.claimId)
              .map((link) => ({
                claimId: link.claimId,
                relationship: link.relationship,
                plainLanguageText: citation.plainLanguageText,
              })),
          ),
      ),
    }
  })

  return {
    schemaVersion: PROGRAMME_PRESENTATION_SCHEMA_VERSION,
    verdictRevisionId: revision.verdictRevisionId,
    programmeId: revision.programmeId,
    revisionNumber: revision.revisionNumber,
    publishedAt: revision.publishedAt.toISOString(),
    supersededAt: revision.supersededAt?.toISOString() ?? null,
    mechanismSteps,
    timelineEvents,
    publicationHistory: historyRows.flatMap((row) =>
      row.publishedAt
        ? [
            {
              revisionId: row.revisionId,
              revisionNumber: row.revisionNumber,
              publishedAt: row.publishedAt.toISOString(),
              supersededAt: row.supersededAt?.toISOString() ?? null,
            },
          ]
        : [],
    ),
  }
}

/** Exact public/history read; DRAFT and review candidates are deliberately invisible. */
export async function getPublicProgrammePresentationForRevision(
  verdictRevisionId: string,
): Promise<PublicProgrammePresentation | null> {
  return readProgrammePresentation(db, verdictRevisionId)
}

/** Current-pointer read for callers that have only a programme id. */
export async function getCurrentPublicProgrammePresentation(
  programmeId: string,
): Promise<PublicProgrammePresentation | null> {
  const pointers = await db
    .select({ verdictRevisionId: programmeCurrentPublications.verdictRevisionId })
    .from(programmeCurrentPublications)
    .where(eq(programmeCurrentPublications.programmeId, programmeId))
    .limit(1)
  return pointers[0]
    ? readProgrammePresentation(db, pointers[0].verdictRevisionId)
    : Promise.resolve(null)
}
