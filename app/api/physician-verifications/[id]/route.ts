// Private detail for one physician-credential submission.

import { ApiError, ok, rateLimited, rateLimitKey, withHandler } from '@/lib/api-response'
import { getPhysicianVerificationRequest } from '@/lib/queries/users'
import { PUBLIC_API } from '@/lib/rate-limit'
import { requireInternalReviewer } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export const GET = withHandler(async (req: Request, context: RouteContext) => {
  const actor = await requireInternalReviewer()
  const limited = rateLimited(PUBLIC_API, rateLimitKey(req, actor.id))
  if (limited) return limited

  const { id } = await context.params
  const request = await getPhysicianVerificationRequest(id)
  if (!request) throw new ApiError(404, 'No credential request matches this id.', 'not_found')
  return ok({ request })
})
