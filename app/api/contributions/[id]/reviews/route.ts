// Authenticated independent review state and immutable reviewer decisions.

import { ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import { contributionReviewDecisionSchema } from '@/lib/contributions/review-validation'
import {
  getContributionReviewState,
  submitContributionReview,
} from '@/lib/queries/programme-contribution-reviews'
import { PUBLIC_API, WRITE } from '@/lib/rate-limit'
import { requireUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export const GET = withHandler(async (req: Request, context: RouteContext) => {
  const user = await requireUser()
  const limited = rateLimited(PUBLIC_API, rateLimitKey(req, user.id))
  if (limited) return limited

  const { id } = await context.params
  return ok(await getContributionReviewState({ proposalId: id, viewerUserId: user.id }))
})

export const POST = withHandler(async (req: Request, context: RouteContext) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  const input = contributionReviewDecisionSchema.parse(await readJson(req))
  const { id } = await context.params
  return ok(
    await submitContributionReview({
      proposalId: id,
      reviewerUserId: user.id,
      input,
    }),
    201,
  )
})
