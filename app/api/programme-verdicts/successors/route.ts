// POST — author one complete, unprepared successor against the exact current public bundle.

import { ApiError, ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import { programmeFirstVerdictAuthoringBundleSchema } from '@/lib/programme-first-verdict-authoring'
import {
  ProgrammeFirstVerdictAuthoringError,
  authorSuccessorProgrammeVerdictDraft,
  type ProgrammeSuccessorVerdictAuthoringResult,
} from '@/lib/queries/programme-first-verdict-authoring'
import { WRITE } from '@/lib/rate-limit'
import { requireUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const POST = withHandler(async (req: Request) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited
  const bundle = programmeFirstVerdictAuthoringBundleSchema.parse(await readJson(req))
  let draft: ProgrammeSuccessorVerdictAuthoringResult
  try {
    draft = await authorSuccessorProgrammeVerdictDraft({
      actorUserId: user.id,
      bundle,
      commit: true,
    })
  } catch (error) {
    if (error instanceof ProgrammeFirstVerdictAuthoringError) {
      throw new ApiError(error.status, error.message, error.code, error.details)
    }
    throw error
  }
  return ok({ draft }, draft.reused ? 200 : 201)
})
