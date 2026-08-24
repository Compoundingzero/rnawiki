// POST — publish the exact reviewed bundle and advance its public pointer atomically.

import { ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import { programmeVerdictPublishSchema } from '@/lib/programme-verdict-workflow/validation'
import { publishProgrammeVerdictRevision } from '@/lib/queries/programme-verdict-publication'
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
  const input = programmeVerdictPublishSchema.parse(await readJson(req))
  const { id } = await context.params
  const publication = await publishProgrammeVerdictRevision({
    revisionId: id,
    publisherUserId: user.id,
    expectedProposalDigest: input.expectedProposalDigest,
  })
  return ok({ publication })
})
