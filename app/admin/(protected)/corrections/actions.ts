'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { correctionSubmissions } from '@/db/schema'
import { requireUser, AuthError } from '@/lib/auth'
import { recordAction } from '@/lib/admin/audit'
import { formToObject, redirectWithError, redirectWithSuccess, nullIfEmpty } from '@/lib/admin/forms'

async function requireStaff() {
  try {
    // Any authenticated internal role may triage corrections — this is lower-stakes
    // moderation work, not the publish/review-decision actions that are role-gated.
    return await requireUser()
  } catch (err) {
    if (err instanceof AuthError) redirect('/admin/login')
    throw err
  }
}

const resolveSchema = z.object({
  moderationStatus: z.enum(['resolved', 'dismissed']),
  resolution: z.string().trim().min(1, 'Add a resolution note.'),
  publicCorrectionEntry: z.string().optional().default(''),
})

export async function resolveCorrection(correctionId: number, formData: FormData): Promise<void> {
  const user = await requireStaff()

  const [existing] = await db.select().from(correctionSubmissions).where(eq(correctionSubmissions.id, correctionId)).limit(1)
  if (!existing) redirectWithError('/admin/corrections', 'Correction submission not found.')

  const parsed = resolveSchema.safeParse(formToObject(formData))
  if (!parsed.success) {
    redirectWithError('/admin/corrections', parsed.error.issues[0]?.message ?? 'Invalid input.')
  }
  const data = parsed.data

  await db
    .update(correctionSubmissions)
    .set({
      moderationStatus: data.moderationStatus,
      resolution: data.resolution,
      publicCorrectionEntry: nullIfEmpty(data.publicCorrectionEntry),
    })
    .where(eq(correctionSubmissions.id, correctionId))

  // Log against whichever content the correction targeted, if any — revisions only accepts
  // reviewableType 'claim' | 'entity', so a correction with neither set has nothing to log
  // against (should not normally happen from the public submission form).
  if (existing.claimId) {
    await recordAction({
      reviewableType: 'claim',
      reviewableId: existing.claimId,
      changedByUserId: user.id,
      fieldChanged: 'correction_' + data.moderationStatus,
      previousValue: existing.message,
      newValue: data.resolution,
    })
  } else if (existing.entityId) {
    await recordAction({
      reviewableType: 'entity',
      reviewableId: existing.entityId,
      changedByUserId: user.id,
      fieldChanged: 'correction_' + data.moderationStatus,
      previousValue: existing.message,
      newValue: data.resolution,
    })
  }

  redirectWithSuccess('/admin/corrections', 'Correction updated.')
}
