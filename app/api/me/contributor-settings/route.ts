// Self-service controls for the homepage contributor spotlight.
//
// These settings belong only to the authenticated account. There is deliberately no public write
// or steward override, so an external profile can be displayed only after that account supplies a
// canonical allowlisted URL and explicitly enables social-link display.

import { contributorPublicSettingsUpdateSchema } from '@/lib/contributor-public-settings'
import {
  getContributorPublicSettings,
  updateContributorPublicSettings,
} from '@/lib/queries/contributor-public-settings'
import { PUBLIC_API, WRITE } from '@/lib/rate-limit'
import { ok, rateLimited, rateLimitKey, readJson, withHandler } from '@/lib/api-response'
import { requireUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = withHandler(async (request: Request) => {
  const user = await requireUser()
  const limited = rateLimited(PUBLIC_API, rateLimitKey(request, user.id))
  if (limited) return limited

  return ok({ settings: await getContributorPublicSettings(user.id) })
})

export const PATCH = withHandler(async (request: Request) => {
  const user = await requireUser()
  const limited = rateLimited(WRITE, rateLimitKey(request, user.id))
  if (limited) return limited

  const input = contributorPublicSettingsUpdateSchema.parse(await readJson(request))
  return ok({ settings: await updateContributorPublicSettings(user.id, input) })
})
