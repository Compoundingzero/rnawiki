// GET /api/drugs/:slug — the whole dossier as JSON, including its published community notes.
//
// The dossier PAGE does not use this; `app/d/[slug]/page.tsx` is a server component that queries
// Drizzle directly, because a public page must render without JavaScript. This route exists for
// the client paths that need a fresh copy after a write — the editor reloading a record it just
// published — and for anyone reading the corpus programmatically.

import { getDrugBySlug } from '@/lib/queries/drugs'
import { getCurrentUser } from '@/lib/session'
import { PUBLIC_API } from '@/lib/rate-limit'
import { ApiError, ok, rateLimited, rateLimitKey, withHandler } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SlugContext {
  /** Next.js 15: route params are a Promise and must be awaited. */
  params: Promise<{ slug: string }>
}

export const GET = withHandler(async (req: Request, ctx: SlugContext) => {
  const { slug } = await ctx.params

  // The viewer is resolved before the read, not for authorisation — this route is public — but
  // because `getDrugBySlug` resolves each note's `hasUpvoted` for the person asking.
  const viewer = await getCurrentUser()
  const limited = rateLimited(PUBLIC_API, rateLimitKey(req, viewer?.id))
  if (limited) return limited

  const drug = await getDrugBySlug(slug, viewer?.id)
  if (!drug) throw new ApiError(404, 'No dossier with that slug', 'not_found')

  // Deliberately does NOT call `incrementViewCount`. The page counts a read; counting it here too
  // would double every visit that hydrates, and would let anyone inflate a record's view count
  // with a loop of JSON requests nobody ever looked at.
  return ok({ drug })
})
