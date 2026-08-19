// GET /api/me/saved — the signed-in reader's bookmarks, most recently saved first.
//
// Keyed on the session, never on a user id in the query string. `/api/me/*` reads the person the
// cookie identifies and nobody else, which is why there is no `?userId=` parameter to forget to
// authorise.

import { listSavedDrugs } from '@/lib/queries/users'
import { requireUser } from '@/lib/session'
import { PUBLIC_API } from '@/lib/rate-limit'
import { ok, rateLimited, rateLimitKey, withHandler } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = withHandler(async (req: Request) => {
  const user = await requireUser()

  // A read, so the read budget — the write bucket exists to protect the tables that change.
  const limited = rateLimited(PUBLIC_API, rateLimitKey(req, user.id))
  if (limited) return limited

  const drugs = await listSavedDrugs(user.id)
  return ok({ drugs })
})
