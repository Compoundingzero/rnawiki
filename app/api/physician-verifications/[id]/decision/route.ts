// Approve or reject one pending credential request. PostgreSQL owns the decision timestamp and
// independently enforces the steward/admin, no-self-review and one-way transition policy.

import { ApiError, ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import { physicianVerificationDecisionSchema } from '@/lib/internal-review-validation'
import { decidePhysicianVerification, UserError } from '@/lib/queries/users'
import { WRITE } from '@/lib/rate-limit'
import { requireInternalReviewer } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

function rethrowUserError(error: UserError): never {
  if (error.code === 'not_found') throw new ApiError(404, error.message, error.code)
  if (error.code === 'not_pending') throw new ApiError(409, error.message, error.code)
  if (error.code === 'self_review') throw new ApiError(403, error.message, error.code)
  if (error.code === 'not_authorized') throw new ApiError(403, error.message, error.code)
  if (error.code === 'invalid_decision') throw new ApiError(422, error.message, error.code)
  throw error
}

export const POST = withHandler(async (req: Request, context: RouteContext) => {
  const actor = await requireInternalReviewer()
  const limited = rateLimited(WRITE, rateLimitKey(req, actor.id))
  if (limited) return limited

  const [{ id }, input] = await Promise.all([
    context.params,
    readJson(req).then((body) => physicianVerificationDecisionSchema.parse(body)),
  ])
  try {
    const request = await decidePhysicianVerification({
      requestId: id,
      actorUserId: actor.id,
      decision: input.decision,
      reason: input.reason,
    })
    return ok({ request })
  } catch (error) {
    if (error instanceof UserError) rethrowUserError(error)
    throw error
  }
})
