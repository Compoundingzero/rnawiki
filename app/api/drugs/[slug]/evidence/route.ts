// GET /api/drugs/:slug/evidence?programme=:slug — public, programme-scoped evidence lineage.
// Draft claims and verdicts are excluded by the read model; the response may identify a programme
// with no current published verdict, which is different from a failed programme.

import { z } from 'zod'

import { ApiError, ok, rateLimited, rateLimitKey, withHandler } from '@/lib/api-response'
import {
  getProgrammeEvidenceByMedicineSlug,
  programmeReferenceExists,
} from '@/lib/queries/programme-evidence'
import { PUBLIC_API } from '@/lib/rate-limit'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SlugContext {
  params: Promise<{ slug: string }>
}

const querySchema = z.object({
  programme: z.string().trim().min(1).max(128).optional(),
})

export const GET = withHandler(async (req: Request, ctx: SlugContext) => {
  const { slug } = await ctx.params
  const url = new URL(req.url)
  const query = querySchema.parse({
    programme: url.searchParams.get('programme') || undefined,
  })

  const viewer = await getCurrentUser()
  const limited = rateLimited(PUBLIC_API, rateLimitKey(req, viewer?.id))
  if (limited) return limited

  const evidence = await getProgrammeEvidenceByMedicineSlug(slug, query.programme)
  if (!evidence) throw new ApiError(404, 'No dossier with that slug', 'not_found')
  if (query.programme && !programmeReferenceExists(evidence, query.programme)) {
    throw new ApiError(
      404,
      'That development programme does not exist for this medicine.',
      'programme_not_found',
    )
  }

  return ok({ evidence })
})
