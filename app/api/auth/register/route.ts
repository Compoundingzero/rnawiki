// POST /api/auth/register — create an account and sign it in.
//
// WHAT AN ACCOUNT IS BORN WITH, and none of it is negotiable by the request body:
//   isAdmin           = false
//   trustTier         = 'new'    (every first edit waits for a person)
//   acceptedEditCount = 0
// `signUpSchema` in lib/auth.ts has no field for any of them, and zod strips what it was not asked
// for, so a body claiming `{ isAdmin: true }` is not rejected — it is never read. The database
// column defaults do the rest.

import { hashPassword, signUpSchema } from '@/lib/auth'
import { slugify, uniqueSlug } from '@/lib/ids'
import { createUser, getUserByHandle, UserError } from '@/lib/queries/users'
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

/** `users.handle` is varchar(64), and `handleSchema` in lib/auth.ts requires at least 3. */
const HANDLE_MAX_LENGTH = 64
const HANDLE_MIN_LENGTH = 3

/**
 * Room left for `uniqueSlug`'s disambiguation suffix — `-2` … `-999`, then `-<6 random chars>`.
 * Without it a 64-character name produces a 71-character handle that fails at INSERT, long after
 * this route thought it had succeeded.
 */
const HANDLE_BASE_MAX_LENGTH = HANDLE_MAX_LENGTH - 7

/**
 * A handle derived from the display name.
 *
 * `slugify` never returns an empty string (it hashes input with no slug-able characters, so a
 * name written in a non-Latin script becomes a stable `s-…` handle rather than colliding with
 * every other such name). It can still return one or two characters — "Li" — which is below the
 * handle minimum, and those fall back to a generic seed that `uniqueSlug` then numbers.
 */
function handleSeedFrom(name: string): string {
  const base = slugify(name).slice(0, HANDLE_BASE_MAX_LENGTH).replace(/-+$/, '')
  return base.length >= HANDLE_MIN_LENGTH ? base : 'contributor'
}

export const POST = withHandler(async (req: Request) => {
  // Anonymous by definition — there is no user id to key on yet.
  const limited = rateLimited(AUTH, rateLimitKey(req))
  if (limited) return limited

  // `signUpSchema` validates the password against the strength rules and the ORCID iD against its
  // ISO 7064 MOD 11-2 check digit, so `0000-0002-1825-0098` is refused and `…0097` is accepted.
  const input = signUpSchema.parse(await readJson(req))

  // Hashed BEFORE the uniqueness check, so a duplicate signup costs the same ~250 ms as a fresh
  // one. Checking the email first would be faster and would turn the response time into an
  // oracle for "is this address registered here".
  const passwordHash = await hashPassword(input.password)

  const handle =
    input.handle ??
    (await uniqueSlug(handleSeedFrom(input.name), async (candidate) => {
      return (await getUserByHandle(candidate)) !== null
    }))

  try {
    const account = await createUser({
      email: input.email,
      passwordHash,
      name: input.name,
      handle,
      orcid: input.orcid ?? null,
    })

    await signIn(account.id)
    return ok({ user: toPublicUser(account) }, 201)
  } catch (error) {
    if (error instanceof UserError) {
      // The unique indexes are on `lower(column)`, so this is the case-insensitive answer and the
      // race a second request loses. `uniqueSlug` cannot promise the handle is still free by the
      // time the INSERT lands — only the index can.
      if (error.code === 'email_taken') {
        throw new ApiError(409, 'That email is already registered', 'email_taken')
      }
      if (error.code === 'handle_taken') {
        throw new ApiError(409, error.message, 'handle_taken')
      }
    }
    throw error
  }
})
