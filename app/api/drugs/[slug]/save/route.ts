// POST /api/drugs/:slug/save — bookmark a dossier, or remove the bookmark. Toggles.
//
// The response says which state the row is in AFTERWARDS, not which action was taken, because the
// button's label is a state ("Saved" / "Save") and a client that has to infer the state from the
// verb gets it wrong the first time two tabs disagree.

import { toggleSavedDrug } from '@/lib/queries/users'
import { getDrugIdBySlug } from '@/lib/queries/drugs'
import { requireUser } from '@/lib/session'
import { WRITE } from '@/lib/rate-limit'
import { ApiError, ok, rateLimited, rateLimitKey, withHandler } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface SlugContext {
  /** Next.js 15: route params are a Promise and must be awaited. */
  params: Promise<{ slug: string }>
}

export const POST = withHandler(async (req: Request, ctx: SlugContext) => {
  const { slug } = await ctx.params

  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
  if (limited) return limited

  // No body is read. The drug comes from the URL and the user comes from the session cookie;
  // there is nothing a caller could put in a body that this route would be allowed to believe.
  const drugId = await getDrugIdBySlug(slug)
  if (!drugId) throw new ApiError(404, 'No dossier with that slug', 'not_found')

  const { saved } = await toggleSavedDrug(user.id, drugId)
  return ok({ saved })
})
