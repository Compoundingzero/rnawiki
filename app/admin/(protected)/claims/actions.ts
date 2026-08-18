'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { eq, asc } from 'drizzle-orm'
import { db } from '@/db'
import {
  claims,
  entities,
  claimTypeEnum,
  publicationStatusEnum,
  mechanismSteps,
  claimEvidence,
} from '@/db/schema'
import { requireUser, AuthError } from '@/lib/auth'
import { isValidSlug, entityPath } from '@/lib/canonical'
import { PROOF_BOUNDARY_STAGES, EVIDENCE_STATUSES, EVIDENCE_RELATIONSHIPS } from '@/lib/evidence'
import { recordCreation, recordRevisions, recordAction, diffFields } from '@/lib/admin/audit'
import { formToObject, redirectWithError, redirectWithSuccess, nullIfEmpty, linesToArray } from '@/lib/admin/forms'

async function requireEditorOrAdmin() {
  try {
    return await requireUser(['administrator', 'editor'])
  } catch (err) {
    if (err instanceof AuthError) redirect('/admin/login')
    throw err
  }
}

// ---------------------------------------------------------------------------
// Claims
// ---------------------------------------------------------------------------

const claimInputSchema = z.object({
  entityId: z.coerce.number().int().positive('Choose an entity.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required.')
    .max(200)
    .refine(isValidSlug, 'Slug must be lowercase letters, numbers, and hyphens only.'),
  claimType: z.enum(claimTypeEnum.enumValues),
  consumerQuestion: z.string().trim().min(1, 'Consumer question is required.'),
  directAnswer: z.string().trim().min(1, 'Direct answer is required.'),
  measuredFinding: z.string().trim().min(1, 'What was measured is required.'),
  inference: z.string().trim().min(1, 'What is inferred is required.'),
  proofBoundaryStage: z.enum(PROOF_BOUNDARY_STAGES),
  proofBoundaryExplanation: z.string().trim().min(1, 'Proof Boundary explanation is required.'),
  remainingUnknown: z.string().trim().min(1, 'What remains unknown is required.'),
  evidenceNeededNext: z.string().trim().min(1, 'Evidence needed next is required.'),
  mechanismSummary: z.string().optional().default(''),
  outcomeSummary: z.string().optional().default(''),
  publicationStatus: z.enum(publicationStatusEnum.enumValues),
  displayPriority: z.coerce.number().int().default(0),
})

export async function createClaim(formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const parsed = claimInputSchema.safeParse(formToObject(formData))
  if (!parsed.success) {
    redirectWithError('/admin/claims/new', parsed.error.issues[0]?.message ?? 'Invalid input.')
  }
  const data = parsed.data

  if (data.publicationStatus === 'published' && user.role !== 'administrator') {
    redirectWithError('/admin/claims/new', 'Only administrators can publish. Save as a non-published status instead.')
  }

  const [entity] = await db.select({ id: entities.id }).from(entities).where(eq(entities.id, data.entityId)).limit(1)
  if (!entity) {
    redirectWithError('/admin/claims/new', 'Selected entity does not exist.')
  }

  let created
  try {
    ;[created] = await db
      .insert(claims)
      .values({
        entityId: data.entityId,
        slug: data.slug,
        claimType: data.claimType,
        consumerQuestion: data.consumerQuestion,
        directAnswer: data.directAnswer,
        measuredFinding: data.measuredFinding,
        inference: data.inference,
        proofBoundaryStage: data.proofBoundaryStage,
        proofBoundaryExplanation: data.proofBoundaryExplanation,
        remainingUnknown: data.remainingUnknown,
        evidenceNeededNext: data.evidenceNeededNext,
        mechanismSummary: nullIfEmpty(data.mechanismSummary),
        outcomeSummary: nullIfEmpty(data.outcomeSummary),
        publicationStatus: data.publicationStatus,
        displayPriority: data.displayPriority,
      })
      .returning()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('claims_entity_slug_idx') || message.includes('unique')) {
      redirectWithError(`/admin/claims/new?entityId=${data.entityId}`, `Slug "${data.slug}" is already used by another claim on this entity.`)
    }
    throw err
  }
  if (!created) throw new Error('Claim insert returned no row.')

  await recordCreation({
    reviewableType: 'claim',
    reviewableId: created.id,
    changedByUserId: user.id,
    summary: `Claim "${created.consumerQuestion}" created.`,
  })

  redirectWithSuccess(`/admin/claims/${created.id}`, 'Claim created.')
}

export async function updateClaim(claimId: number, formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const [existing] = await db
    .select({ claim: claims, entitySlug: entities.slug })
    .from(claims)
    .innerJoin(entities, eq(claims.entityId, entities.id))
    .where(eq(claims.id, claimId))
    .limit(1)
  if (!existing) redirectWithError('/admin/claims', 'Claim not found.')

  const parsed = claimInputSchema.safeParse(formToObject(formData))
  if (!parsed.success) {
    redirectWithError(`/admin/claims/${claimId}`, parsed.error.issues[0]?.message ?? 'Invalid input.')
  }
  const data = parsed.data

  if (data.publicationStatus === 'published' && existing.claim.publicationStatus !== 'published' && user.role !== 'administrator') {
    redirectWithError(`/admin/claims/${claimId}`, 'Only administrators can publish. Use "editorially complete" or "scientific review required" instead.')
  }

  const nextValues = {
    entityId: data.entityId,
    slug: data.slug,
    claimType: data.claimType,
    consumerQuestion: data.consumerQuestion,
    directAnswer: data.directAnswer,
    measuredFinding: data.measuredFinding,
    inference: data.inference,
    proofBoundaryStage: data.proofBoundaryStage,
    proofBoundaryExplanation: data.proofBoundaryExplanation,
    remainingUnknown: data.remainingUnknown,
    evidenceNeededNext: data.evidenceNeededNext,
    mechanismSummary: nullIfEmpty(data.mechanismSummary),
    outcomeSummary: nullIfEmpty(data.outcomeSummary),
    publicationStatus: data.publicationStatus,
    displayPriority: data.displayPriority,
    version: existing.claim.version + 1,
    updatedAt: new Date(),
  }

  try {
    await db.update(claims).set(nextValues).where(eq(claims.id, claimId))
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('claims_entity_slug_idx') || message.includes('unique')) {
      redirectWithError(`/admin/claims/${claimId}`, `Slug "${data.slug}" is already used by another claim on this entity.`)
    }
    throw err
  }

  const changes = diffFields(existing.claim, nextValues, [
    'entityId',
    'slug',
    'claimType',
    'consumerQuestion',
    'directAnswer',
    'measuredFinding',
    'inference',
    'proofBoundaryStage',
    'proofBoundaryExplanation',
    'remainingUnknown',
    'evidenceNeededNext',
    'mechanismSummary',
    'outcomeSummary',
    'publicationStatus',
    'displayPriority',
  ])
  await recordRevisions({
    reviewableType: 'claim',
    reviewableId: claimId,
    changedByUserId: user.id,
    changes,
  })

  if (existing.claim.publicationStatus === 'published' || data.publicationStatus === 'published') {
    revalidatePath(entityPath(existing.entitySlug))
    if (data.entityId !== existing.claim.entityId) {
      const [newEntity] = await db.select({ slug: entities.slug }).from(entities).where(eq(entities.id, data.entityId)).limit(1)
      if (newEntity) revalidatePath(entityPath(newEntity.slug))
    }
  }

  redirectWithSuccess(`/admin/claims/${claimId}`, 'Claim updated.')
}

export async function publishClaim(claimId: number, _formData: FormData): Promise<void> {
  let user
  try {
    user = await requireUser(['administrator'])
  } catch (err) {
    if (err instanceof AuthError) redirect('/admin/login')
    throw err
  }

  const [existing] = await db
    .select({ claim: claims, entitySlug: entities.slug })
    .from(claims)
    .innerJoin(entities, eq(claims.entityId, entities.id))
    .where(eq(claims.id, claimId))
    .limit(1)
  if (!existing) redirectWithError('/admin/claims', 'Claim not found.')
  if (existing.claim.publicationStatus !== 'approved') {
    redirectWithError(`/admin/claims/${claimId}`, `Only claims with status "approved" can be published (current: ${existing.claim.publicationStatus}).`)
  }

  await db.update(claims).set({ publicationStatus: 'published', updatedAt: new Date() }).where(eq(claims.id, claimId))

  await recordAction({
    reviewableType: 'claim',
    reviewableId: claimId,
    changedByUserId: user.id,
    fieldChanged: 'publicationStatus',
    previousValue: existing.claim.publicationStatus,
    newValue: 'published',
    reviewStatusAffected: true,
  })

  revalidatePath(entityPath(existing.entitySlug))
  redirectWithSuccess(`/admin/claims/${claimId}`, 'Claim published.')
}

// ---------------------------------------------------------------------------
// Mechanism steps (ordered causal chain for a claim)
// ---------------------------------------------------------------------------

const mechanismStepSchema = z.object({
  displayOrder: z.coerce.number().int(),
  technicalLabel: z.string().trim().min(1, 'Technical label is required.').max(200),
  plainLanguageExplanation: z.string().trim().min(1, 'Plain-language explanation is required.'),
  evidenceContext: z.string().trim().min(1, 'Evidence context is required.'),
  status: z.enum(EVIDENCE_STATUSES),
  sourceLinks: z.string().optional().default(''),
})

export async function addMechanismStep(claimId: number, formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const [claim] = await db.select({ id: claims.id }).from(claims).where(eq(claims.id, claimId)).limit(1)
  if (!claim) redirectWithError('/admin/claims', 'Claim not found.')

  const parsed = mechanismStepSchema.safeParse(formToObject(formData))
  if (!parsed.success) {
    redirectWithError(`/admin/claims/${claimId}`, parsed.error.issues[0]?.message ?? 'Invalid input.')
  }
  const data = parsed.data

  await db.insert(mechanismSteps).values({
    claimId,
    displayOrder: data.displayOrder,
    technicalLabel: data.technicalLabel,
    plainLanguageExplanation: data.plainLanguageExplanation,
    evidenceContext: data.evidenceContext,
    status: data.status,
    sourceLinks: linesToArray(data.sourceLinks),
  })

  await recordCreation({
    reviewableType: 'claim',
    reviewableId: claimId,
    changedByUserId: user.id,
    summary: `Mechanism step "${data.technicalLabel}" added.`,
  })

  redirectWithSuccess(`/admin/claims/${claimId}`, 'Mechanism step added.')
}

export async function updateMechanismStep(stepId: number, formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const [existing] = await db.select().from(mechanismSteps).where(eq(mechanismSteps.id, stepId)).limit(1)
  if (!existing) redirectWithError('/admin/claims', 'Mechanism step not found.')

  const parsed = mechanismStepSchema.safeParse(formToObject(formData))
  if (!parsed.success) {
    redirectWithError(`/admin/claims/${existing.claimId}`, parsed.error.issues[0]?.message ?? 'Invalid input.')
  }
  const data = parsed.data
  const sourceLinks = linesToArray(data.sourceLinks)

  await db
    .update(mechanismSteps)
    .set({
      displayOrder: data.displayOrder,
      technicalLabel: data.technicalLabel,
      plainLanguageExplanation: data.plainLanguageExplanation,
      evidenceContext: data.evidenceContext,
      status: data.status,
      sourceLinks,
    })
    .where(eq(mechanismSteps.id, stepId))

  const changes = diffFields(
    { ...existing, sourceLinks: existing.sourceLinks.join('\n') },
    { ...data, sourceLinks: sourceLinks.join('\n') },
    ['displayOrder', 'technicalLabel', 'plainLanguageExplanation', 'evidenceContext', 'status', 'sourceLinks']
  )
  await recordRevisions({
    reviewableType: 'claim',
    reviewableId: existing.claimId,
    changedByUserId: user.id,
    changes,
    reason: `Mechanism step #${stepId} edited.`,
  })

  redirectWithSuccess(`/admin/claims/${existing.claimId}`, 'Mechanism step updated.')
}

export async function deleteMechanismStep(stepId: number, _formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const [existing] = await db.select().from(mechanismSteps).where(eq(mechanismSteps.id, stepId)).limit(1)
  if (!existing) redirectWithError('/admin/claims', 'Mechanism step not found.')

  await db.delete(mechanismSteps).where(eq(mechanismSteps.id, stepId))

  await recordAction({
    reviewableType: 'claim',
    reviewableId: existing.claimId,
    changedByUserId: user.id,
    fieldChanged: 'mechanism_step_removed',
    previousValue: existing.technicalLabel,
    newValue: null,
  })

  redirectWithSuccess(`/admin/claims/${existing.claimId}`, 'Mechanism step removed.')
}

export async function moveMechanismStep(stepId: number, direction: 'up' | 'down', _formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const [existing] = await db.select().from(mechanismSteps).where(eq(mechanismSteps.id, stepId)).limit(1)
  if (!existing) redirectWithError('/admin/claims', 'Mechanism step not found.')

  const siblings = await db
    .select()
    .from(mechanismSteps)
    .where(eq(mechanismSteps.claimId, existing.claimId))
    .orderBy(asc(mechanismSteps.displayOrder))

  const index = siblings.findIndex((s) => s.id === stepId)
  const neighborIndex = direction === 'up' ? index - 1 : index + 1
  const neighbor = siblings[neighborIndex]
  if (index === -1 || !neighbor) {
    redirectWithSuccess(`/admin/claims/${existing.claimId}`, 'Already at the boundary — nothing to reorder.')
  }

  await db.update(mechanismSteps).set({ displayOrder: neighbor.displayOrder }).where(eq(mechanismSteps.id, existing.id))
  await db.update(mechanismSteps).set({ displayOrder: existing.displayOrder }).where(eq(mechanismSteps.id, neighbor.id))

  await recordAction({
    reviewableType: 'claim',
    reviewableId: existing.claimId,
    changedByUserId: user.id,
    fieldChanged: 'mechanism_step_reordered',
    previousValue: `${existing.technicalLabel} at ${existing.displayOrder}`,
    newValue: `${existing.technicalLabel} at ${neighbor.displayOrder}`,
  })

  redirectWithSuccess(`/admin/claims/${existing.claimId}`, 'Mechanism step reordered.')
}

// ---------------------------------------------------------------------------
// Evidence linking (claimEvidence rows attaching an evidenceSources row to a claim)
// ---------------------------------------------------------------------------

const claimEvidenceSchema = z.object({
  relationship: z.enum(EVIDENCE_RELATIONSHIPS),
  claimPartAddressed: z.string().trim().min(1, 'Say which part of the claim this addresses.'),
  directlyMeasuredResult: z.string().trim().min(1, 'Describe what was directly measured.'),
  independentGroupStatus: z.string().optional(),
  displayPriority: z.coerce.number().int().default(0),
  editorialNotes: z.string().optional().default(''),
})

export async function attachEvidence(claimId: number, evidenceSourceId: number, formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const [claim] = await db.select({ id: claims.id }).from(claims).where(eq(claims.id, claimId)).limit(1)
  if (!claim) redirectWithError('/admin/claims', 'Claim not found.')

  const parsed = claimEvidenceSchema.safeParse(formToObject(formData))
  if (!parsed.success) {
    redirectWithError(`/admin/claims/${claimId}`, parsed.error.issues[0]?.message ?? 'Invalid input.')
  }
  const data = parsed.data

  await db.insert(claimEvidence).values({
    claimId,
    evidenceSourceId,
    relationship: data.relationship,
    claimPartAddressed: data.claimPartAddressed,
    directlyMeasuredResult: data.directlyMeasuredResult,
    editorialNotes: nullIfEmpty(data.editorialNotes),
    independentGroupStatus: data.independentGroupStatus === 'on',
    displayPriority: data.displayPriority,
  })

  await recordCreation({
    reviewableType: 'claim',
    reviewableId: claimId,
    changedByUserId: user.id,
    summary: `Evidence source #${evidenceSourceId} linked (${data.relationship}).`,
  })

  redirectWithSuccess(`/admin/claims/${claimId}`, 'Evidence linked.')
}

export async function updateClaimEvidence(claimEvidenceId: number, formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const [existing] = await db.select().from(claimEvidence).where(eq(claimEvidence.id, claimEvidenceId)).limit(1)
  if (!existing) redirectWithError('/admin/claims', 'Evidence link not found.')

  const parsed = claimEvidenceSchema.safeParse(formToObject(formData))
  if (!parsed.success) {
    redirectWithError(`/admin/claims/${existing.claimId}`, parsed.error.issues[0]?.message ?? 'Invalid input.')
  }
  const data = parsed.data
  const independentGroupStatus = data.independentGroupStatus === 'on'

  await db
    .update(claimEvidence)
    .set({
      relationship: data.relationship,
      claimPartAddressed: data.claimPartAddressed,
      directlyMeasuredResult: data.directlyMeasuredResult,
      editorialNotes: nullIfEmpty(data.editorialNotes),
      independentGroupStatus,
      displayPriority: data.displayPriority,
    })
    .where(eq(claimEvidence.id, claimEvidenceId))

  const changes = diffFields(existing, { ...data, independentGroupStatus }, [
    'relationship',
    'claimPartAddressed',
    'directlyMeasuredResult',
    'editorialNotes',
    'independentGroupStatus',
    'displayPriority',
  ])
  await recordRevisions({
    reviewableType: 'claim',
    reviewableId: existing.claimId,
    changedByUserId: user.id,
    changes,
    reason: `Evidence link #${claimEvidenceId} edited.`,
  })

  redirectWithSuccess(`/admin/claims/${existing.claimId}`, 'Evidence link updated.')
}

export async function detachEvidence(claimEvidenceId: number, _formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const [existing] = await db.select().from(claimEvidence).where(eq(claimEvidence.id, claimEvidenceId)).limit(1)
  if (!existing) redirectWithError('/admin/claims', 'Evidence link not found.')

  await db.delete(claimEvidence).where(eq(claimEvidence.id, claimEvidenceId))

  await recordAction({
    reviewableType: 'claim',
    reviewableId: existing.claimId,
    changedByUserId: user.id,
    fieldChanged: 'evidence_unlinked',
    previousValue: `evidence source #${existing.evidenceSourceId}`,
    newValue: null,
  })

  redirectWithSuccess(`/admin/claims/${existing.claimId}`, 'Evidence unlinked.')
}
