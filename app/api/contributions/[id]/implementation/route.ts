// POST — materialize one accepted contribution as a locked canonical candidate.

import { ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import { materializeContributionSchema } from '@/lib/programme-verdict-workflow/validation'
import { materializeAcceptedContributionCandidate } from '@/lib/queries/programme-contribution-implementation'
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
  materializeContributionSchema.parse(await readJson(req))
  const { id } = await context.params
  const implementation = await materializeAcceptedContributionCandidate({
    proposalId: id,
    implementedByUserId: user.id,
  })
  return ok(
    {
      implementation,
      candidate: implementation.outcome === 'CANONICAL_CANDIDATE' ? implementation : null,
      sourceTaskResolution:
        implementation.outcome === 'UNPUBLISHED_SOURCE_TASK_RESOLVED' ? implementation : null,
    },
    implementation.reused ? 200 : 201,
  )
})
