// POST /api/auth/logout — destroy the session cookie.
//
// POST rather than GET, because a GET that signs someone out can be triggered by an <img> tag on
// any page on the internet.

import { signOut } from '@/lib/session'
import { ok, withHandler } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const POST = withHandler(async () => {
  // Unconditional and idempotent: signing out when already signed out is a success, not a 401.
  // A client that got here because its session had already expired must not be told to try again.
  await signOut()
  return ok({ ok: true as const })
})
