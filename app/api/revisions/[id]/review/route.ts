// POST /api/revisions/:id/review — a person decides a queued edit.
//
// IDEMPOTENT, and the guarantee is layered rather than trusted to one check:
//   - this route reads the revision's status first and answers 409 if it is not `pending_review`;
//   - `approveRevision` and `rejectRevision` then take a `SELECT … FOR UPDATE` row lock inside
//     their transaction and re-check, so two reviewers who both pass the status check in the same
//     instant still produce exactly one applied payload and exactly one accepted-edit increment.
// The first check is what makes the second reviewer read a clear message; the lock is what makes
// the data correct. Neither alone is enough.

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getDrugBySlug } from '@/lib/queries/drugs'
import {
  approveRevision,
  getRevisionById,
  rejectRevision,
  RevisionError,
} from '@/lib/queries/revisions'
import { AUTO_PUBLISH_TIERS } from '@/lib/trust'
import { requireUser } from '@/lib/session'
import { WRITE } from '@/lib/rate-limit'
import { ApiError, ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import type { CommentUser } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface IdContext {
  /** Next.js 15: route params are a Promise and must be awaited. */
  params: Promise<{ id: string }>
}

const bodySchema = z.object({
  decision: z.enum(['approve', 'reject']),
  note: z.string().trim().max(2000).optional(),
})

/**
 * Who may empty the queue.
 *
 * `AUTO_PUBLISH_TIERS` — trusted and steward — rather than a second list, because they are the
 * same question: the tiers whose own machine-passed edits skip review are exactly the tiers
 * trusted to review other people's. Keeping one list means a change to the threshold cannot leave
 * the two answers disagreeing.
 */
function mayReview(user: CommentUser): boolean {
  if (user.isAdmin === true) return true
  const tier = user.trustTier
  return tier !== undefined && AUTO_PUBLISH_TIERS.includes(tier)
}

function statusForRevisionError(error: RevisionError): number {
  switch (error.code) {
    case 'not_found':
    case 'drug_not_found':
      return 404
    case 'not_pending':
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

  // Not in the contract, and deliberate. A pending revision is by definition from an author below
  // the trusted tier, so a reviewer normally cannot be its author — but an author promoted while
  // their own edit sat in the queue could otherwise walk up and approve it, which is
  // self-publishing with extra steps.
  if (existing.authorUserId !== null && existing.authorUserId === user.id) {
    throw new ApiError(
      403,
      'You cannot review your own edit. Another reviewer has to decide this one.',
      'self_review',
    )
  }

  if (existing.status !== 'pending_review') {
    // `machine_rejected` never entered the queue at all, so saying it was "already reviewed" would
    // be a lie about a decision no person made.
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
      revalidatePath('/')

      // Read back AFTER the transaction committed, so the response describes the record as it now
      // stands rather than as the payload hoped it would.
      const drug = await getDrugBySlug(revision.drugSlug)
      return ok({ revision, drug })
    }

    // A rejection with no note is allowed by the contract, and stored as an empty string rather
    // than as a sentence this route invented on the reviewer's behalf.
    const revision = await rejectRevision(id, reviewer, body.note ?? '')
    return ok({ revision })
  } catch (error) {
    if (error instanceof RevisionError) {
      // Reached when a concurrent reviewer won the row lock between the status check above and
      // the transaction below it. `not_pending` is the 409 the contract names.
      throw new ApiError(statusForRevisionError(error), error.message, error.code)
    }
    throw error
  }
})
