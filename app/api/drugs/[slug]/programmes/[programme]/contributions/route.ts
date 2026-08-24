// Authenticated author workspace for programme-scoped correction/challenge proposals.

import { ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import { createContributionDraftSchema } from '@/lib/contributions/validation'
import {
  createContributionDraft,
  getProgrammeContributionContext,
  listAuthorProgrammeContributions,
  ContributionProposalError,
} from '@/lib/queries/programme-contributions'
import { PUBLIC_API, WRITE } from '@/lib/rate-limit'
import { requireUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ slug: string; programme: string }>
}

export const GET = withHandler(async (req: Request, ctx: RouteContext) => {
  const user = await requireUser()
  const limited = rateLimited(PUBLIC_API, rateLimitKey(req, user.id))
  if (limited) return limited

  const { slug, programme } = await ctx.params
  const [context, proposals] = await Promise.all([
    getProgrammeContributionContext(slug, programme),
    listAuthorProgrammeContributions({
      medicineSlug: slug,
      programmeRef: programme,
      authorUserId: user.id,
    }),
  ])
  if (!context || !proposals) {
    throw new ContributionProposalError(404, 'Programme not found.', 'programme_not_found')
  }

  return ok({ context, proposals })
})

export const POST = withHandler(async (req: Request, ctx: RouteContext) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  const { slug, programme } = await ctx.params
  const input = createContributionDraftSchema.parse(await readJson(req))
  const result = await createContributionDraft({
    medicineSlug: slug,
    programmeRef: programme,
    authorUserId: user.id,
    input,
  })
  return ok(result, 201)
})
