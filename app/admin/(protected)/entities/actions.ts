'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { entities, entityTypeEnum, regulatoryCategoryEnum, publicationStatusEnum, regulatoryStatuses } from '@/db/schema'
import { requireUser, AuthError } from '@/lib/auth'
import { isValidSlug, entityPath } from '@/lib/canonical'
import { recordCreation, recordRevisions, recordAction, diffFields } from '@/lib/admin/audit'
import { formToObject, redirectWithError, redirectWithSuccess, nullIfEmpty } from '@/lib/admin/forms'

const entityInputSchema = z.object({
  canonicalName: z.string().trim().min(1, 'Canonical name is required.').max(200),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required.')
    .max(200)
    .refine(isValidSlug, 'Slug must be lowercase letters, numbers, and hyphens only.'),
  aliases: z.string().optional().default(''),
  entityType: z.enum(entityTypeEnum.enumValues),
  shortDescription: z.string().trim().min(1, 'Short description is required.'),
  bottomLine: z.string().trim().min(1, 'Bottom line is required.'),
  regulatoryCategory: z.enum(regulatoryCategoryEnum.enumValues),
  accessRealityNote: z.string().optional().default(''),
  publicationStatus: z.enum(publicationStatusEnum.enumValues),
})

function parseAliases(raw: string): string[] {
  return raw
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean)
}

async function requireEditorOrAdmin() {
  try {
    return await requireUser(['administrator', 'editor'])
  } catch (err) {
    if (err instanceof AuthError) redirect('/admin/login')
    throw err
  }
}

export async function createEntity(formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const raw = formToObject(formData)
  const parsed = entityInputSchema.safeParse(raw)
  if (!parsed.success) {
    redirectWithError('/admin/entities/new', parsed.error.issues[0]?.message ?? 'Invalid input.')
  }
  const data = parsed.data

  if (data.publicationStatus === 'published' && user.role !== 'administrator') {
    redirectWithError('/admin/entities/new', 'Only administrators can publish. Save as a non-published status instead.')
  }

  const values = {
    canonicalName: data.canonicalName,
    slug: data.slug,
    aliases: parseAliases(data.aliases),
    entityType: data.entityType,
    shortDescription: data.shortDescription,
    bottomLine: data.bottomLine,
    regulatoryCategory: data.regulatoryCategory,
    accessRealityNote: nullIfEmpty(data.accessRealityNote),
    publicationStatus: data.publicationStatus,
  }

  let created
  try {
    ;[created] = await db.insert(entities).values(values).returning()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('entities_slug_idx') || message.includes('unique')) {
      redirectWithError('/admin/entities/new', `Slug "${data.slug}" is already in use.`)
    }
    throw err
  }
  if (!created) throw new Error('Entity insert returned no row.')

  await recordCreation({
    reviewableType: 'entity',
    reviewableId: created.id,
    changedByUserId: user.id,
    summary: `Entity "${created.canonicalName}" created.`,
  })

  redirectWithSuccess(`/admin/entities/${created.id}`, 'Entity created.')
}

export async function updateEntity(entityId: number, formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const [existing] = await db.select().from(entities).where(eq(entities.id, entityId)).limit(1)
  if (!existing) {
    redirectWithError('/admin/entities', 'Entity not found.')
  }

  const raw = formToObject(formData)
  const parsed = entityInputSchema.safeParse(raw)
  if (!parsed.success) {
    redirectWithError(`/admin/entities/${entityId}`, parsed.error.issues[0]?.message ?? 'Invalid input.')
  }
  const data = parsed.data

  // Only block a *new* transition into 'published' by a non-administrator. If the entity is
  // already published and an editor is fixing an unrelated field, leaving status untouched
  // must not be treated as "setting" it.
  if (data.publicationStatus === 'published' && existing.publicationStatus !== 'published' && user.role !== 'administrator') {
    redirectWithError(`/admin/entities/${entityId}`, 'Only administrators can publish. Use "editorially complete" or "scientific review required" instead.')
  }

  const nextValues = {
    canonicalName: data.canonicalName,
    slug: data.slug,
    aliases: parseAliases(data.aliases),
    entityType: data.entityType,
    shortDescription: data.shortDescription,
    bottomLine: data.bottomLine,
    regulatoryCategory: data.regulatoryCategory,
    accessRealityNote: nullIfEmpty(data.accessRealityNote),
    publicationStatus: data.publicationStatus,
    updatedAt: new Date(),
  }

  try {
    await db.update(entities).set(nextValues).where(eq(entities.id, entityId))
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('entities_slug_idx') || message.includes('unique')) {
      redirectWithError(`/admin/entities/${entityId}`, `Slug "${data.slug}" is already in use.`)
    }
    throw err
  }

  const changes = diffFields(
    { ...existing, aliases: existing.aliases.join(', ') },
    { ...nextValues, aliases: parseAliases(data.aliases).join(', ') },
    ['canonicalName', 'slug', 'aliases', 'entityType', 'shortDescription', 'bottomLine', 'regulatoryCategory', 'accessRealityNote', 'publicationStatus']
  )
  await recordRevisions({
    reviewableType: 'entity',
    reviewableId: entityId,
    changedByUserId: user.id,
    changes,
  })

  if (existing.publicationStatus === 'published' || data.publicationStatus === 'published') {
    revalidatePath(entityPath(existing.slug))
    if (existing.slug !== data.slug) revalidatePath(entityPath(data.slug))
  }

  redirectWithSuccess(`/admin/entities/${entityId}`, 'Entity updated.')
}

export async function publishEntity(entityId: number, _formData: FormData): Promise<void> {
  let user
  try {
    user = await requireUser(['administrator'])
  } catch (err) {
    if (err instanceof AuthError) redirect('/admin/login')
    throw err
  }

  const [existing] = await db.select().from(entities).where(eq(entities.id, entityId)).limit(1)
  if (!existing) redirectWithError('/admin/entities', 'Entity not found.')
  if (existing.publicationStatus !== 'approved') {
    redirectWithError(`/admin/entities/${entityId}`, `Only entities with status "approved" can be published (current: ${existing.publicationStatus}).`)
  }

  await db
    .update(entities)
    .set({ publicationStatus: 'published', updatedAt: new Date() })
    .where(eq(entities.id, entityId))

  await recordAction({
    reviewableType: 'entity',
    reviewableId: entityId,
    changedByUserId: user.id,
    fieldChanged: 'publicationStatus',
    previousValue: existing.publicationStatus,
    newValue: 'published',
    reviewStatusAffected: true,
  })

  revalidatePath(entityPath(existing.slug))
  redirectWithSuccess(`/admin/entities/${entityId}`, 'Entity published.')
}

// ---------------------------------------------------------------------------
// Regulatory statuses (per-jurisdiction rows on an entity)
// ---------------------------------------------------------------------------

const regulatoryStatusSchema = z.object({
  jurisdiction: z.string().trim().min(1, 'Jurisdiction is required.').max(100),
  legalCategory: z.enum(regulatoryCategoryEnum.enumValues),
  approvedIndications: z.string().optional().default(''),
  statusStatement: z.string().trim().min(1, 'Status statement is required.'),
  source: z.string().trim().min(1, 'Source URL is required.'),
  checkedDate: z.string().trim().min(1, 'Checked date is required.'),
  reviewStatus: z.enum(publicationStatusEnum.enumValues),
})

export async function addRegulatoryStatus(entityId: number, formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const [entity] = await db.select({ id: entities.id }).from(entities).where(eq(entities.id, entityId)).limit(1)
  if (!entity) redirectWithError('/admin/entities', 'Entity not found.')

  const parsed = regulatoryStatusSchema.safeParse(formToObject(formData))
  if (!parsed.success) {
    redirectWithError(`/admin/entities/${entityId}`, parsed.error.issues[0]?.message ?? 'Invalid input.')
  }
  const data = parsed.data
  const checkedDate = new Date(data.checkedDate)
  if (Number.isNaN(checkedDate.getTime())) {
    redirectWithError(`/admin/entities/${entityId}`, 'Checked date is invalid.')
  }

  const [created] = await db
    .insert(regulatoryStatuses)
    .values({
      entityId,
      jurisdiction: data.jurisdiction,
      legalCategory: data.legalCategory,
      approvedIndications: nullIfEmpty(data.approvedIndications),
      statusStatement: data.statusStatement,
      source: data.source,
      checkedDate,
      editorId: user.id,
      reviewStatus: data.reviewStatus,
    })
    .returning()

  if (created) {
    await recordCreation({
      reviewableType: 'entity',
      reviewableId: entityId,
      changedByUserId: user.id,
      summary: `Regulatory status added for ${data.jurisdiction}.`,
    })
  }

  redirectWithSuccess(`/admin/entities/${entityId}`, 'Regulatory status added.')
}

export async function updateRegulatoryStatus(regulatoryStatusId: number, formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const [existing] = await db
    .select()
    .from(regulatoryStatuses)
    .where(eq(regulatoryStatuses.id, regulatoryStatusId))
    .limit(1)
  if (!existing) redirectWithError('/admin/entities', 'Regulatory status not found.')

  const parsed = regulatoryStatusSchema.safeParse(formToObject(formData))
  if (!parsed.success) {
    redirectWithError(`/admin/entities/${existing.entityId}`, parsed.error.issues[0]?.message ?? 'Invalid input.')
  }
  const data = parsed.data
  const checkedDate = new Date(data.checkedDate)
  if (Number.isNaN(checkedDate.getTime())) {
    redirectWithError(`/admin/entities/${existing.entityId}`, 'Checked date is invalid.')
  }

  await db
    .update(regulatoryStatuses)
    .set({
      jurisdiction: data.jurisdiction,
      legalCategory: data.legalCategory,
      approvedIndications: nullIfEmpty(data.approvedIndications),
      statusStatement: data.statusStatement,
      source: data.source,
      checkedDate,
      reviewStatus: data.reviewStatus,
    })
    .where(eq(regulatoryStatuses.id, regulatoryStatusId))

  const changes = diffFields(
    existing,
    { ...data, checkedDate },
    ['jurisdiction', 'legalCategory', 'approvedIndications', 'statusStatement', 'source', 'checkedDate', 'reviewStatus']
  )
  await recordRevisions({
    reviewableType: 'entity',
    reviewableId: existing.entityId,
    changedByUserId: user.id,
    changes,
    reason: `Regulatory status #${regulatoryStatusId} (${data.jurisdiction}) edited.`,
  })

  redirectWithSuccess(`/admin/entities/${existing.entityId}`, 'Regulatory status updated.')
}

export async function deleteRegulatoryStatus(regulatoryStatusId: number, _formData: FormData): Promise<void> {
  const user = await requireEditorOrAdmin()

  const [existing] = await db
    .select()
    .from(regulatoryStatuses)
    .where(eq(regulatoryStatuses.id, regulatoryStatusId))
    .limit(1)
  if (!existing) redirectWithError('/admin/entities', 'Regulatory status not found.')

  await db.delete(regulatoryStatuses).where(eq(regulatoryStatuses.id, regulatoryStatusId))

  await recordAction({
    reviewableType: 'entity',
    reviewableId: existing.entityId,
    changedByUserId: user.id,
    fieldChanged: 'regulatory_status_removed',
    previousValue: `${existing.jurisdiction}: ${existing.statusStatement}`,
    newValue: null,
  })

  redirectWithSuccess(`/admin/entities/${existing.entityId}`, 'Regulatory status removed.')
}
