// GET /api/auth/me — who the cookie says you are.
//
// Not a 401 when signed out. `{ user: null }` is the honest answer to "who am I", and it is what
// `components/app-context.tsx`'s `refreshUser` expects: an error there would leave the header
// showing a stale user rather than a signed-out one.
//
// The identity is re-read from the `users` row on every call (lib/session.ts), never from the
// cookie's contents, so a revoked credential or a demoted account takes effect on the next
// request instead of when the cookie happens to expire.

import { getCurrentUser } from '@/lib/session'
import { commentUserToPublic, ok, withHandler, type PublicUser } from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const GET = withHandler(async () => {
  const user = await getCurrentUser()
  const publicUser: PublicUser | null = user ? commentUserToPublic(user) : null
  return ok({ user: publicUser })
})
