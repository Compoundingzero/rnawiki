// PUT — replace the complete structured presentation on an unprepared canonical DRAFT.

import { ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import {
  programmePresentationReplaceSchema,
  replaceDraftProgrammePresentation,
} from '@/lib/queries/programme-presentation'
import { WRITE } from '@/lib/rate-limit'
import { requireUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export const PUT = withHandler(async (req: Request, context: RouteContext) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited
  const presentation = programmePresentationReplaceSchema.parse(await readJson(req))
  const { id } = await context.params
  const result = await replaceDraftProgrammePresentation({
    revisionId: id,
    actorUserId: user.id,
    presentation,
  })
  return ok({ presentation: result })
})
