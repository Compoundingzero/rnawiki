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
  claimEvents,
  evidenceSources,
} from '@/db/schema'
import { requireUser, AuthError } from '@/lib/auth'
import { isValidSlug, entityPath } from '@/lib/canonical'
import { PROOF_BOUNDARY_STAGES, EVIDENCE_STATUSES, EVIDENCE_RELATIONSHIPS } from '@/lib/evidence'
import { CLAIM_EVENT_TYPES, DEVELOPMENT_GATES } from '@/lib/claim-events'
import { recordCreation, recordRevisions, recordAction, diffFields } from '@/lib/admin/audit'
import {
  formToObject,
  redirectWithError,
  redirectWithSuccess,
  nullIfEmpty,
  linesToArray,
  toDateOrNull,
  CLAIM_EVENT_FIELD_CAPS,
} from '@/lib/admin/forms'

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
  // The editorial check date, typed by an editor. Empty is a real and expected answer, and it is
  // stored as NULL rather than filled in from the clock: `claims.updatedAt` already records the
  // write, and the public record refuses to print a write under the word "checked".
  // See db/schema.ts `claims.checkedAt` and lib/evidence-view.ts `answerCheckPoint`.
  checkedDate: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine((v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Answer last checked must be a date (YYYY-MM-DD).')
    .refine(
      (v) => v === '' || !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime()),
      'Answer last checked is not a real date.'
    ),
})

/** '' -> null; 'YYYY-MM-DD' -> that day at UTC midnight, matching how every date on the site prints. */
function checkedAtFromInput(value: string): Date | null {
  return value === '' ? null : new Date(`${value}T00:00:00Z`)
}

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
        checkedAt: checkedAtFromInput(data.checkedDate),
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
    checkedAt: checkedAtFromInput(data.checkedDate),
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
    'checkedAt',
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

// ---------------------------------------------------------------------------
// Claim events (a recorded result or development event that did not support the claim)
// ---------------------------------------------------------------------------
//
// EDITORIAL BOUNDARY — read this before changing anything below it.
//
// 1. A source is REQUIRED, checked three times over. `claimEvents.evidenceSourceId` is NOT NULL
//    with ON DELETE RESTRICT (db/schema.ts), `claimEventSchema` rejects a missing or non-positive
//    id, and each action then confirms the row still exists before writing. The redundancy is
//    deliberate: this is the one section of the public record where an unsourced sentence would
//    read as a finding rather than as an opinion, so "what did not work" may never be editorial
//    voice. If you are tempted to relax any of the three, you are building the thing the section
//    exists to prevent.
//
// 2. NOTHING HERE WRITES PROSE. `plainSummary`, `whatItSuggests` and `whatItDoesNotEstablish` are
//    typed by a person who read the source. No model, no template and no metadata import may fill
//    them, and nothing may infer `eventType` or `developmentGate` — or study design, sample size,
//    species, endpoint, failure cause or target engagement — from a DOI/PMID lookup. That is the
//    boundary in docs/editorial-methodology.md, "The DOI/PMID import boundary": a lookup can say
//    what a paper is, never what it found or why it failed. lib/metadata-import.ts is not imported
//    by this file and must not become so.
//
// 3. `published` stays administrator-only, via the two paths claims already use and no third one:
//    the general edit form rejects a non-administrator server-side with the same message
//    updateClaim uses, and publishClaimEvent requires the row to already be `approved`. An event
//    published under a draft claim still renders nothing publicly, because the claim gates it —
//    but the status is recorded honestly either way rather than being silently coerced.
//
// 4. `publicationStatus === 'published'` on an event is editorial workflow, never scientific
//    review, exactly as on `claims`. Only an `approved` row in `reviews` may produce a "reviewed"
//    sentence anywhere.

const claimEventSchema = z.object({
  evidenceSourceId: z.coerce
    .number({ invalid_type_error: 'An event needs a source. Choose one before saving.' })
    .int()
    .positive('An event needs a source. Choose one before saving.'),
  eventType: z.enum(CLAIM_EVENT_TYPES),
  developmentGate: z.enum(DEVELOPMENT_GATES),
  plainSummary: z
    .string()
    .trim()
    .min(1, 'What happened is required.')
    .max(CLAIM_EVENT_FIELD_CAPS.plainSummary, `What happened must be ${CLAIM_EVENT_FIELD_CAPS.plainSummary} characters or fewer.`),
  whatItSuggests: z
    .string()
    .trim()
    .min(1, 'What it suggests is required.')
    .max(CLAIM_EVENT_FIELD_CAPS.whatItSuggests, `What it suggests must be ${CLAIM_EVENT_FIELD_CAPS.whatItSuggests} characters or fewer.`),
  whatItDoesNotEstablish: z
    .string()
    .trim()
    .min(1, 'What it does not establish is required.')
    .max(
      CLAIM_EVENT_FIELD_CAPS.whatItDoesNotEstablish,
      `What it does not establish must be ${CLAIM_EVENT_FIELD_CAPS.whatItDoesNotEstablish} characters or fewer.`
    ),
  eventDate: z.string().optional().default(''),
  displayPriority: z.coerce.number().int().default(0),
  publicationStatus: z.enum(publicationStatusEnum.enumValues),
})

/** The claim an event hangs off, plus the entity slug its published page is cached under. */
async function claimEventContext(claimId: number) {
  const [row] = await db
    .select({ claimId: claims.id, entitySlug: entities.slug })
    .from(claims)
    .innerJoin(entities, eq(claims.entityId, entities.id))
    .where(eq(claims.id, claimId))
    .limit(1)
  return row
}

/**
 * Confirm the chosen evidence source still exists. Zod only proves a positive integer arrived;
 * this proves it points at a real row, which is the part that matters — a dangling id would write
 * an event whose citation resolves to nothing.
 */
async function requireEvidenceSource(evidenceSourceId: number, errorPath: string): Promise<void> {
  const [source] = await db
    .select({ id: evidenceSources.id })
    .from(evidenceSources)
    .where(eq(evidenceSources.id, evidenceSourceId))
    .limit(1)
  if (!source) {
    redirectWithError(errorPath, 'That evidence source no longer exists. Choose a source that is still on file.')
  }
}

export async function createClaimEvent(claimId: number, formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const context = await claimEventContext(claimId)
  if (!context) redirectWithError('/admin/claims', 'Claim not found.')
  const errorPath = `/admin/claims/${claimId}`

  const parsed = claimEventSchema.safeParse(formToObject(formData))
  if (!parsed.success) {
    redirectWithError(errorPath, parsed.error.issues[0]?.message ?? 'Invalid input.')
  }
  const data = parsed.data

  if (data.publicationStatus === 'published' && user.role !== 'administrator') {
    redirectWithError(errorPath, 'Only administrators can publish. Save as a non-published status instead.')
  }

  const eventDate = toDateOrNull(data.eventDate)
  if (eventDate === undefined) {
    redirectWithError(errorPath, 'Event date is not a real date. Leave it blank if the source does not record one.')
  }

  await requireEvidenceSource(data.evidenceSourceId, errorPath)

  const [created] = await db
    .insert(claimEvents)
    .values({
      claimId,
      evidenceSourceId: data.evidenceSourceId,
      eventType: data.eventType,
      developmentGate: data.developmentGate,
      plainSummary: data.plainSummary,
      whatItSuggests: data.whatItSuggests,
      whatItDoesNotEstablish: data.whatItDoesNotEstablish,
      eventDate,
      displayPriority: data.displayPriority,
      publicationStatus: data.publicationStatus,
    })
    .returning()
  if (!created) throw new Error('Claim event insert returned no row.')

  await recordAction({
    reviewableType: 'claim',
    reviewableId: claimId,
    changedByUserId: user.id,
    fieldChanged: 'claim_event_created',
    previousValue: null,
    newValue: `Event #${created.id}: ${data.eventType} at ${data.developmentGate}, evidence source #${data.evidenceSourceId}, status ${data.publicationStatus}.`,
    reviewStatusAffected: data.publicationStatus === 'published',
  })

  if (data.publicationStatus === 'published') revalidatePath(entityPath(context.entitySlug))

  redirectWithSuccess(errorPath, 'Claim event added.')
}

export async function updateClaimEvent(eventId: number, formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const [existing] = await db.select().from(claimEvents).where(eq(claimEvents.id, eventId)).limit(1)
  if (!existing) redirectWithError('/admin/claims', 'Claim event not found.')

  const context = await claimEventContext(existing.claimId)
  if (!context) redirectWithError('/admin/claims', 'Claim not found.')
  const errorPath = `/admin/claims/${existing.claimId}`

  const parsed = claimEventSchema.safeParse(formToObject(formData))
  if (!parsed.success) {
    redirectWithError(errorPath, parsed.error.issues[0]?.message ?? 'Invalid input.')
  }
  const data = parsed.data

  // Same rule and same wording as updateClaim: moving INTO published is the administrator-only
  // step, and an editor saving an already-published row is left alone rather than blocked.
  if (data.publicationStatus === 'published' && existing.publicationStatus !== 'published' && user.role !== 'administrator') {
    redirectWithError(errorPath, 'Only administrators can publish. Use "editorially complete" or "scientific review required" instead.')
  }

  const eventDate = toDateOrNull(data.eventDate)
  if (eventDate === undefined) {
    redirectWithError(errorPath, 'Event date is not a real date. Leave it blank if the source does not record one.')
  }

  await requireEvidenceSource(data.evidenceSourceId, errorPath)

  const nextValues = {
    evidenceSourceId: data.evidenceSourceId,
    eventType: data.eventType,
    developmentGate: data.developmentGate,
    plainSummary: data.plainSummary,
    whatItSuggests: data.whatItSuggests,
    whatItDoesNotEstablish: data.whatItDoesNotEstablish,
    eventDate,
    displayPriority: data.displayPriority,
    publicationStatus: data.publicationStatus,
  }

  await db
    .update(claimEvents)
    .set({ ...nextValues, updatedAt: new Date() })
    .where(eq(claimEvents.id, eventId))

  // The status transition is written separately from the content edit so `reviewStatusAffected`
  // is true on exactly the row that moved the status, and false on the prose edits beside it.
  const contentChanges = diffFields(existing, nextValues, [
    'evidenceSourceId',
    'eventType',
    'developmentGate',
    'plainSummary',
    'whatItSuggests',
    'whatItDoesNotEstablish',
    'eventDate',
    'displayPriority',
  ])
  await recordRevisions({
    reviewableType: 'claim',
    reviewableId: existing.claimId,
    changedByUserId: user.id,
    changes: contentChanges,
    reason: `Claim event #${eventId} edited.`,
  })

  if (existing.publicationStatus !== data.publicationStatus) {
    await recordAction({
      reviewableType: 'claim',
      reviewableId: existing.claimId,
      changedByUserId: user.id,
      fieldChanged: 'claim_event_publication_status',
      previousValue: existing.publicationStatus,
      newValue: data.publicationStatus,
      reason: `Claim event #${eventId} status change.`,
      reviewStatusAffected: true,
    })
  }

  if (existing.publicationStatus === 'published' || data.publicationStatus === 'published') {
    revalidatePath(entityPath(context.entitySlug))
  }

  redirectWithSuccess(errorPath, 'Claim event updated.')
}

/**
 * The non-shortcut publish path, mirroring publishClaim: administrator only, and only from
 * `approved`, so a published event always has a review row behind it in the audit trail.
 */
export async function publishClaimEvent(eventId: number, _formData: FormData): Promise<void> {
  let user
  try {
    user = await requireUser(['administrator'])
  } catch (err) {
    if (err instanceof AuthError) redirect('/admin/login')
    throw err
  }

  const [existing] = await db.select().from(claimEvents).where(eq(claimEvents.id, eventId)).limit(1)
  if (!existing) redirectWithError('/admin/claims', 'Claim event not found.')

  const context = await claimEventContext(existing.claimId)
  if (!context) redirectWithError('/admin/claims', 'Claim not found.')
  const errorPath = `/admin/claims/${existing.claimId}`

  if (existing.publicationStatus !== 'approved') {
    redirectWithError(errorPath, `Only claim events with status "approved" can be published (current: ${existing.publicationStatus}).`)
  }

  await db
    .update(claimEvents)
    .set({ publicationStatus: 'published', updatedAt: new Date() })
    .where(eq(claimEvents.id, eventId))

  await recordAction({
    reviewableType: 'claim',
    reviewableId: existing.claimId,
    changedByUserId: user.id,
    fieldChanged: 'claim_event_publication_status',
    previousValue: existing.publicationStatus,
    newValue: 'published',
    reason: `Claim event #${eventId} published.`,
    reviewStatusAffected: true,
  })

  revalidatePath(entityPath(context.entitySlug))
  redirectWithSuccess(errorPath, 'Claim event published.')
}

export async function deleteClaimEvent(eventId: number, _formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const [existing] = await db.select().from(claimEvents).where(eq(claimEvents.id, eventId)).limit(1)
  if (!existing) redirectWithError('/admin/claims', 'Claim event not found.')

  const context = await claimEventContext(existing.claimId)
  if (!context) redirectWithError('/admin/claims', 'Claim not found.')

  await db.delete(claimEvents).where(eq(claimEvents.id, eventId))

  // Removing a published event changes what the public record says did not work, so the revision
  // row carries the whole event, not just its id — the audit trail is the only remaining copy.
  await recordAction({
    reviewableType: 'claim',
    reviewableId: existing.claimId,
    changedByUserId: user.id,
    fieldChanged: 'claim_event_removed',
    previousValue: `Event #${existing.id}: ${existing.eventType} at ${existing.developmentGate}, evidence source #${existing.evidenceSourceId}, status ${existing.publicationStatus} — ${existing.plainSummary}`,
    newValue: null,
    reviewStatusAffected: existing.publicationStatus === 'published',
  })

  if (existing.publicationStatus === 'published') revalidatePath(entityPath(context.entitySlug))

  redirectWithSuccess(`/admin/claims/${existing.claimId}`, 'Claim event removed.')
}
