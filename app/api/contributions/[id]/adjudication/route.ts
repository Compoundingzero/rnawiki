// Steward/admin resolution of two disagreeing immutable contribution reviews.

import { ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import { contributionAdjudicationDecisionSchema } from '@/lib/contributions/review-validation'
import { adjudicateContributionReview } from '@/lib/queries/programme-contribution-reviews'
import { WRITE } from '@/lib/rate-limit'
import { requireUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export const POST = withHandler(async (req: Request, context: RouteContext) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  const input = contributionAdjudicationDecisionSchema.parse(await readJson(req))
  const { id } = await context.params
  return ok(
    await adjudicateContributionReview({
      proposalId: id,
      adjudicatorUserId: user.id,
      input,
    }),
    201,
  )
})
