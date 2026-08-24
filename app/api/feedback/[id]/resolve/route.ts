// Resolve a feedback report once. The public feedback POST remains open; this action is private.

import { ApiError, ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import { feedbackResolutionSchema } from '@/lib/internal-review-validation'
import { FeedbackError, resolveFeedback } from '@/lib/queries/feedback'
import { WRITE } from '@/lib/rate-limit'
import { requireInternalReviewer } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

function rethrowFeedbackError(error: FeedbackError): never {
  if (error.code === 'not_found') throw new ApiError(404, error.message, error.code)
  if (error.code === 'already_resolved') throw new ApiError(409, error.message, error.code)
  if (error.code === 'not_authorized') throw new ApiError(403, error.message, error.code)
  if (error.code === 'invalid_resolution') throw new ApiError(422, error.message, error.code)
  throw error
}

export const POST = withHandler(async (req: Request, context: RouteContext) => {
  const actor = await requireInternalReviewer()
  const limited = rateLimited(WRITE, rateLimitKey(req, actor.id))
  if (limited) return limited

  const [{ id }, input] = await Promise.all([
    context.params,
    readJson(req).then((body) => feedbackResolutionSchema.parse(body)),
  ])
  try {
    const item = await resolveFeedback({ id, actorUserId: actor.id, note: input.note })
    return ok({ item })
  } catch (error) {
    if (error instanceof FeedbackError) rethrowFeedbackError(error)
    throw error
  }
})
