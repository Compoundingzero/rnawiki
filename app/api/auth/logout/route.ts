// POST /api/auth/logout — destroy the session cookie.
//
// POST rather than GET, because a GET that signs someone out can be triggered by an <img> tag on
// any page on the internet.

import { getCurrentUser, signOut } from '@/lib/session'
import { ok, rateLimitKey, rateLimited, withHandler } from '@/lib/api-response'
import { PUBLIC_API } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const POST = withHandler(async (request: Request) => {
  const user = await getCurrentUser()

  // Limited even though it is cheap: an unauthenticated endpoint that writes a Set-Cookie header
  // on every call is still a request an attacker can make for free, and every other write path on
  // the site is limited. Consistency here is worth more than the handful of cycles it costs.
  const limited = rateLimited(PUBLIC_API, rateLimitKey(request, user?.id))
  if (limited) return limited

  // Unconditional and idempotent: signing out when already signed out is a success, not a 401.
  // A client that got here because its session had already expired must not be told to try again.
  await signOut()
  return ok({ ok: true as const })
})
