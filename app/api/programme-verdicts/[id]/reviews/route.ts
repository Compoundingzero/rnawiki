// Protected canonical review state and immutable qualified decisions.

import { ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import { programmeVerdictReviewSchema } from '@/lib/programme-verdict-workflow/validation'
import {
  getProgrammeVerdictWorkflowState,
  submitProgrammeVerdictReview,
} from '@/lib/queries/programme-verdict-workflow'
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
  return ok(await getProgrammeVerdictWorkflowState({ revisionId: id, viewerUserId: user.id }))
})

export const POST = withHandler(async (req: Request, context: RouteContext) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited
  const input = programmeVerdictReviewSchema.parse(await readJson(req))
  const { id } = await context.params
  const review = await submitProgrammeVerdictReview({
    revisionId: id,
    reviewerUserId: user.id,
    ...input,
  })
  return ok({ review }, 201)
})
