// POST — run RNA Intelligence and freeze a complete programme-presentation/v1 review bundle.

import { ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import {
  prepareDraftProgrammePresentation,
  programmePresentationPrepareSchema,
} from '@/lib/queries/programme-presentation'
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
  programmePresentationPrepareSchema.parse(await readJson(req))
  const { id } = await context.params
  const prepared = await prepareDraftProgrammePresentation({
    revisionId: id,
    actorUserId: user.id,
  })
  return ok({ prepared })
})
