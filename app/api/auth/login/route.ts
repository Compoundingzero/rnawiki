// POST /api/auth/login — exchange an email and a password for a session cookie.

import { signInSchema, verifyPassword } from '@/lib/auth'
import { getUserByEmail, type AccountUser } from '@/lib/queries/users'
import { signIn } from '@/lib/session'
import { AUTH } from '@/lib/rate-limit'
import {
  ApiError,
  ok,
  rateLimited,
  rateLimitKey,
  readJson,
  toPublicUser,
  withHandler,
} from '@/lib/api-response'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * A real bcrypt hash, cost 12, of a random 32-byte string that was discarded the moment it was
 * hashed. It is not any account's password and no password can match it.
 *
 * WHY IT EXISTS: bcrypt at cost 12 takes roughly a quarter of a second. If an unknown email
 * short-circuited straight to the 401, that request would return in single-digit milliseconds
 * while a wrong password for a REAL account took 250 ms. Anyone with a stopwatch and a word list
 * could then enumerate which addresses have accounts here. Comparing against this decoy makes
 * both paths do the same work and take the same time, so the two failures are indistinguishable
 * from outside.
 *
 * A hard-coded constant rather than a hash computed at module load: it is not a secret (nothing is
 * protected by it), and hashing at import would block startup for a quarter of a second on every
 * cold boot to produce a value with exactly the same properties.
 */
const DECOY_PASSWORD_HASH = '$2a$12$rBjPa/wZN8ERRI7iJCIQj.Cj63CuC2PfhQyOrstloqHOoW/Di.TgK'

/** One sentence for both failures. Which of the two it was is not the caller's business. */
const CREDENTIALS_REJECTED = 'Email or password is incorrect'

export const POST = withHandler(async (req: Request) => {
  const limited = rateLimited(AUTH, rateLimitKey(req))
  if (limited) return limited

  // Sign-in deliberately does NOT apply the password strength rules — see the note on
  // `signInSchema`. Enforcing them here would lock out every account whose password predates a
  // rule change, and would tell an attacker which stored passwords are weak.
  const input = signInSchema.parse(await readJson(req))

  const row = await getUserByEmail(input.email)

  // Always compared, even when there is no account: see DECOY_PASSWORD_HASH above.
  const passwordMatches = await verifyPassword(
    input.password,
    row?.passwordHash ?? DECOY_PASSWORD_HASH,
  )

  if (!row || !passwordMatches) {
    throw new ApiError(401, CREDENTIALS_REJECTED, 'invalid_credentials')
  }

  // `getUserByEmail` is the one query in the codebase that returns the password hash. Narrowing to
  // `AccountUser` here drops it from the type at the call site; `toPublicUser` names every field
  // it returns, so it could not have travelled through anyway.
  const account: AccountUser = row

  await signIn(account.id)
  return ok({ user: toPublicUser(account) })
})
