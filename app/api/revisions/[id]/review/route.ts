// POST /api/revisions/:id/review — one independent human decision under a row lock.

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { serializeDossierForViewer } from '@/lib/dossier-read-serializer'
import { getDrugBySlug } from '@/lib/queries/drugs'
import {
  approveRevision,
  getRevisionById,
  rejectRevision,
  RevisionError,
} from '@/lib/queries/revisions'
import { requireUser } from '@/lib/session'
import { WRITE } from '@/lib/rate-limit'
import { ApiError, ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import {
  DECLINE_REASON_MAX_LENGTH,
  declineReasonValidationError,
} from '@/lib/legacy-revision-review'
import type { CommentUser } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface IdContext {
  params: Promise<{ id: string }>
}

const bodySchema = z
  .object({
    decision: z.enum(['approve', 'reject']),
    note: z.string().trim().optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    const noteIsTooLong = Boolean(value.note && value.note.length > DECLINE_REASON_MAX_LENGTH)
    if (noteIsTooLong) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        type: 'string',
        inclusive: true,
        maximum: DECLINE_REASON_MAX_LENGTH,
        path: ['note'],
        message: 'Keep the reason to 2,000 characters or fewer.',
      })
    }
    if (value.decision === 'approve' && value.note && value.note.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['note'],
        message: 'Include a note only when declining a correction.',
      })
    }
    const declineReasonError =
      value.decision === 'reject' ? declineReasonValidationError(value.note ?? '') : null
    if (declineReasonError && !noteIsTooLong) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['note'],
        message: declineReasonError,
      })
    }
  })

// Standing permits a review; it never publishes the author's correction automatically.
function mayReview(user: CommentUser): boolean {
  if (user.isAdmin === true) return true
  const tier = user.trustTier
  return tier === 'trusted' || tier === 'steward'
}

function statusForRevisionError(error: RevisionError): number {
  switch (error.code) {
    case 'not_found':
    case 'drug_not_found':
      return 404
    case 'not_pending':
    case 'not_identity_correction':
    case 'quarantined':
    case 'self_review':
      return 409
    case 'stale_identity':
    case 'no_change':
      return 422
    case 'programme_required':
      return 409
  }
}

export const POST = withHandler(async (req: Request, ctx: IdContext) => {
  const { id } = await ctx.params

  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  if (!mayReview(user)) {
    throw new ApiError(
      403,
      'Reviewing edits is limited to trusted editors, stewards and administrators.',
      'forbidden',
    )
  }

  const body = bodySchema.parse(await readJson(req))

  const existing = await getRevisionById(id)
  if (!existing) throw new ApiError(404, 'No revision matches this id', 'not_found')

  if (existing.quarantine) {
    throw new ApiError(409, existing.quarantine.systemReason, existing.quarantine.reasonCode)
  }

  if (!existing.identityCorrection) {
    throw new ApiError(
      409,
      'This older edit is preserved in history but cannot use the identity-correction review path.',
      'not_identity_correction',
    )
  }

  if (existing.authorUserId !== null && existing.authorUserId === user.id) {
    throw new ApiError(
      403,
      'You cannot review your own edit. Another reviewer has to decide this one.',
      'self_review',
    )
  }

  if (existing.status !== 'pending_review') {
    const message =
      existing.status === 'machine_rejected'
        ? 'The structure check rejected this revision, so it was never queued for review.'
        : 'That revision has already been reviewed'
    throw new ApiError(409, message, 'already_reviewed')
  }

  const reviewer = { userId: user.id, name: user.name }

  try {
    if (body.decision === 'approve') {
      const revision = await approveRevision(id, reviewer)

      revalidatePath(`/d/${revision.drugSlug}`)
      revalidatePath(`/d/${revision.drugSlug}/history`)
      revalidatePath('/browse')
      revalidatePath('/review-queue')
      revalidatePath('/sitemap.xml')
      revalidatePath('/')

      // Read back the committed record.
      const drug = await getDrugBySlug(revision.drugSlug)
      if (!drug) {
        throw new ApiError(500, 'The updated dossier could not be read back.', 'read_back_failed')
      }
      return ok({ revision, ...serializeDossierForViewer(drug, user) })
    }

    const revision = await rejectRevision(id, reviewer, body.note ?? '')
    revalidatePath(`/d/${revision.drugSlug}/history`)
    revalidatePath('/review-queue')
    return ok({ revision })
  } catch (error) {
    if (error instanceof RevisionError) {
      throw new ApiError(statusForRevisionError(error), error.message, error.code)
    }
    throw error
  }
})
