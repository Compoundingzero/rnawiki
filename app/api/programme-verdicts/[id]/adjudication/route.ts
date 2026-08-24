// POST — one immutable qualified steward decision when canonical reviewers disagree.

import { ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import { programmeVerdictAdjudicationSchema } from '@/lib/programme-verdict-workflow/validation'
import { adjudicateProgrammeVerdict } from '@/lib/queries/programme-verdict-workflow'
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
  const input = programmeVerdictAdjudicationSchema.parse(await readJson(req))
  const { id } = await context.params
  const adjudication = await adjudicateProgrammeVerdict({
    revisionId: id,
    adjudicatorUserId: user.id,
    ...input,
  })
  return ok({ adjudication }, 201)
})
