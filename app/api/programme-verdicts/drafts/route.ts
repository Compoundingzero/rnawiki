// POST — clone the current public canonical bundle into one editable, unprepared DRAFT.

import { ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import {
  createProgrammeVerdictDraftFromCurrentPublication,
  programmeVerdictDraftCloneSchema,
} from '@/lib/queries/programme-verdict-drafts'
import { WRITE } from '@/lib/rate-limit'
import { requireUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const POST = withHandler(async (req: Request) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited
  const input = programmeVerdictDraftCloneSchema.parse(await readJson(req))
  const draft = await createProgrammeVerdictDraftFromCurrentPublication({
    ...input,
    actorUserId: user.id,
  })
  return ok({ draft }, 201)
})
