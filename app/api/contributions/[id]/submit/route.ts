// POST /api/contributions/:id/submit — freeze a server-recomputed review bundle.

import { ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import { emptyContributionActionSchema } from '@/lib/contributions/validation'
import { submitContributionProposal } from '@/lib/queries/programme-contributions'
import { WRITE } from '@/lib/rate-limit'
import { requireUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export const POST = withHandler(async (req: Request, ctx: RouteContext) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  emptyContributionActionSchema.parse(await readJson(req))
  const { id } = await ctx.params
  const proposal = await submitContributionProposal({ proposalId: id, authorUserId: user.id })
  return ok({ proposal })
})
