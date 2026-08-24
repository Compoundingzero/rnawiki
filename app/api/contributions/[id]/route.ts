// PATCH /api/contributions/:id — draft-only edits by the authenticated owner.

import { ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import { contributionDraftPatchSchema } from '@/lib/contributions/validation'
import { updateContributionDraft } from '@/lib/queries/programme-contributions'
import { WRITE } from '@/lib/rate-limit'
import { requireUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export const PATCH = withHandler(async (req: Request, ctx: RouteContext) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  const { id } = await ctx.params
  const patch = contributionDraftPatchSchema.parse(await readJson(req))
  const result = await updateContributionDraft({ proposalId: id, authorUserId: user.id, patch })
  return ok(result)
})
