// Protected steward/admin qualification roster and append-only grant/revoke events.

import { ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import { reviewerQualificationSchema } from '@/lib/programme-verdict-workflow/validation'
import {
  listProgrammeVerdictQualificationRoster,
  recordProgrammeVerdictQualification,
} from '@/lib/queries/programme-verdict-workflow'
import { PUBLIC_API, WRITE } from '@/lib/rate-limit'
import { requireUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = withHandler(async (req: Request) => {
  const user = await requireUser()
  const limited = rateLimited(PUBLIC_API, rateLimitKey(req, user.id))
  if (limited) return limited
  return ok(await listProgrammeVerdictQualificationRoster(user.id))
})

export const POST = withHandler(async (req: Request) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited
  const input = reviewerQualificationSchema.parse(await readJson(req))
  const event = await recordProgrammeVerdictQualification({
    ...input,
    authorizedByUserId: user.id,
  })
  return ok({ event }, 201)
})
