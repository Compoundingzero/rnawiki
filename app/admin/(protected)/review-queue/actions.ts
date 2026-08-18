'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { claims, entities, reviews, reviewDecisionEnum } from '@/db/schema'
import { requireUser, AuthError } from '@/lib/auth'
import { recordAction } from '@/lib/admin/audit'
import { formToObject, redirectWithError, redirectWithSuccess, nullIfEmpty } from '@/lib/admin/forms'

async function requireReviewer() {
  try {
    return await requireUser(['administrator', 'scientific_reviewer'])
  } catch (err) {
    if (err instanceof AuthError) redirect('/admin/login')
    throw err
  }
}

const reviewSchema = z.object({
  decision: z.enum(reviewDecisionEnum.enumValues),
  comments: z.string().optional().default(''),
})

// A rejected or "needs changes" decision sends the item back to draft for editorial rework;
// an approved decision moves it to 'approved', where an administrator can publish it
// (see the separate publish action — TASK section 8).
function nextStatus(decision: (typeof reviewDecisionEnum.enumValues)[number]): 'approved' | 'draft' {
  return decision === 'approved' ? 'approved' : 'draft'
}

export async function reviewClaim(claimId: number, formData: FormData): Promise<void> {
  const user = await requireReviewer()

  const [claim] = await db.select().from(claims).where(eq(claims.id, claimId)).limit(1)
  if (!claim) redirectWithError('/admin/review-queue', 'Claim not found.')

  const parsed = reviewSchema.safeParse(formToObject(formData))
  if (!parsed.success) {
    redirectWithError('/admin/review-queue', parsed.error.issues[0]?.message ?? 'Invalid input.')
  }
  const data = parsed.data
  const newStatus = nextStatus(data.decision)

  await db.insert(reviews).values({
    reviewableType: 'claim',
    reviewableId: claimId,
    reviewerId: user.id,
    decision: data.decision,
    comments: nullIfEmpty(data.comments),
    reviewedVersion: claim.version,
  })

  await db
    .update(claims)
    .set({ publicationStatus: newStatus, reviewerId: user.id, lastReviewedAt: new Date(), updatedAt: new Date() })
    .where(eq(claims.id, claimId))

  await recordAction({
    reviewableType: 'claim',
    reviewableId: claimId,
    changedByUserId: user.id,
    fieldChanged: 'publicationStatus',
    previousValue: claim.publicationStatus,
    newValue: newStatus,
    reason: `Scientific review decision: ${data.decision}.${data.comments ? ` ${data.comments}` : ''}`,
    reviewStatusAffected: true,
  })

  redirectWithSuccess('/admin/review-queue', 'Review recorded.')
}

export async function reviewEntity(entityId: number, formData: FormData): Promise<void> {
  const user = await requireReviewer()

  const [entity] = await db.select().from(entities).where(eq(entities.id, entityId)).limit(1)
  if (!entity) redirectWithError('/admin/review-queue', 'Entity not found.')

  const parsed = reviewSchema.safeParse(formToObject(formData))
  if (!parsed.success) {
    redirectWithError('/admin/review-queue', parsed.error.issues[0]?.message ?? 'Invalid input.')
  }
  const data = parsed.data
  const newStatus = nextStatus(data.decision)

  await db.insert(reviews).values({
    reviewableType: 'entity',
    reviewableId: entityId,
    reviewerId: user.id,
    decision: data.decision,
    comments: nullIfEmpty(data.comments),
    // Entities have no version column (unlike claims) — recorded as 1. The `revisions` table
    // remains the granular, timestamped history for entity content changes.
    reviewedVersion: 1,
  })

  await db.update(entities).set({ publicationStatus: newStatus, updatedAt: new Date() }).where(eq(entities.id, entityId))

  await recordAction({
    reviewableType: 'entity',
    reviewableId: entityId,
    changedByUserId: user.id,
    fieldChanged: 'publicationStatus',
    previousValue: entity.publicationStatus,
    newValue: newStatus,
    reason: `Scientific review decision: ${data.decision}.${data.comments ? ` ${data.comments}` : ''}`,
    reviewStatusAffected: true,
  })

  redirectWithSuccess('/admin/review-queue', 'Review recorded.')
}
