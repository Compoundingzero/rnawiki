// The one place a route handler turns a value — or a thrown error — into an HTTP response.
//
// Three rules shape this file, and every one of them exists because the alternative leaks
// something:
//
//  1. An error body is `{ error, code?, details? }` with a real status. Never a 200 carrying an
//     error string: a client that has to read the body to find out whether the call worked will
//     eventually forget to, and `fetch` in lib/api-client.ts branches on `res.ok`.
//  2. An unexpected failure returns a GENERIC message. The real error — stack, SQL, constraint
//     name, connection string fragment — is logged server-side and never written into the
//     response. A 500 that quotes `duplicate key value violates unique constraint
//     "users_email_unique"` has just told an anonymous caller which emails are registered.
//  3. The public shape of a user is computed here, once, by naming the fields that may leave the
//     process. `PublicUser` therefore cannot silently grow a licence number when a column is
//     added to `users`.

import { NextResponse } from 'next/server'
import { ZodError, type ZodIssue } from 'zod'
import { AuthError } from '@/lib/session'
import { checkPolicy, retryAfterSeconds, type RateLimitPolicy } from '@/lib/rate-limit'
import { requestSessionHash } from '@/lib/session-hash'
import type { AccountUser } from '@/lib/queries/users'
import type { CommentUser } from '@/lib/types'

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

export interface ApiErrorBody {
  error: string
  code?: string
  details?: unknown
}

/**
 * A successful JSON response. `no-store` on every one of them: these routes read and write
 * per-reader state (the signed-in user, their upvotes, their bookmarks), and a shared cache that
 * held one reader's `/api/auth/me` would hand it to the next.
 */
export function ok<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

export function fail(
  message: string,
  status: number,
  code?: string,
  details?: unknown,
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { error: message }
  if (code !== undefined) body.code = code
  if (details !== undefined) body.details = details
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } })
}

/**
 * A failure a handler raises on purpose — "no dossier with that slug", "already reviewed".
 *
 * Distinct from an unexpected throw precisely so `withHandler` can tell them apart: this one's
 * message is written for a reader and is safe to return; anything else's is not.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly details?: unknown

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

/** 400, not 422: a body that is not JSON never reached a schema to have issues against. */
export class MalformedBodyError extends ApiError {
  constructor() {
    super(400, 'The request body is not valid JSON.', 'malformed_body')
    this.name = 'MalformedBodyError'
  }
}

/**
 * Parses the request body as JSON, or throws `MalformedBodyError`.
 *
 * Returns `{}` for an empty body so a POST that legitimately carries nothing — logout, a toggle —
 * can still be handed to a zod schema with all-optional fields instead of special-casing.
 */
export async function readJson(req: Request): Promise<unknown> {
  const text = await req.text()
  if (text.trim().length === 0) return {}
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new MalformedBodyError()
  }
}

// ---------------------------------------------------------------------------
// The wrapper
// ---------------------------------------------------------------------------

/** The zod issues a client may see: path, code and message. No input values are echoed back. */
function issueDetails(error: ZodError): Array<Pick<ZodIssue, 'path' | 'code' | 'message'>> {
  return error.issues.map((issue) => ({
    path: issue.path,
    code: issue.code,
    message: issue.message,
  }))
}

/**
 * Wraps a route handler so every failure leaves as a typed HTTP response instead of as an unhandled
 * rejection.
 *
 * The mapping, in the order it is tried:
 *   AuthError          -> its own 401 or 403 (lib/session.ts decides which)
 *   ZodError           -> 422 with the issue list
 *   ApiError           -> its own status and message
 *   anything else      -> 500, generic message, real error logged server-side
 *
 * The generic arms are the point. A handler can `throw new ApiError(404, ...)` from four call
 * frames down without threading a Response back by hand, and a bug three layers into Drizzle
 * cannot turn into a response body that describes the database.
 */
export function withHandler<Args extends unknown[]>(
  fn: (req: Request, ...args: Args) => Promise<NextResponse>,
): (req: Request, ...args: Args) => Promise<NextResponse> {
  return async (req: Request, ...args: Args): Promise<NextResponse> => {
    try {
      return await fn(req, ...args)
    } catch (error) {
      if (error instanceof AuthError) {
        return fail(error.message, error.status, error.code)
      }
      if (error instanceof ZodError) {
        return fail(
          'Some of the values sent with this request are not valid.',
          422,
          'invalid_input',
          issueDetails(error),
        )
      }
      if (error instanceof ApiError) {
        return fail(error.message, error.status, error.code, error.details)
      }

      // The only place the real error is allowed to exist. The method and path are included so a
      // log line is actionable; the body is not, because it may carry a password.
      console.error('[api] unhandled error in %s %s:', req.method, new URL(req.url).pathname, error)
      return fail('Something went wrong on our side. Try again.', 500, 'internal_error')
    }
  }
}

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

/**
 * The bucket key for this request: the user id when someone is signed in, otherwise the day-scoped
 * anonymous fingerprint from lib/session-hash.
 *
 * Keying a signed-in caller on their id rather than their IP is what stops one office network from
 * sharing a single budget, and the anonymous branch never sees a raw IP address — `sessionHash`
 * takes it, salts it with a key that rotates daily and returns a digest.
 */
export function rateLimitKey(req: Request, userId?: string | null): string {
  if (userId) return `user:${userId}`
  return `anon:${requestSessionHash(req.headers)}`
}

/**
 * Runs `policy` against `key` and returns the 429 to send back, or null when the request may
 * proceed. Written as "returns the refusal, or nothing" so a handler reads as:
 *
 *   const limited = rateLimited(WRITE, rateLimitKey(req, user.id))
 *   if (limited) return limited
 *
 * `Retry-After` is in seconds and is always at least 1 — `Retry-After: 0` means "retry now", which
 * is exactly what a limited client must not do.
 */
export function rateLimited(policy: RateLimitPolicy, key: string): NextResponse<ApiErrorBody> | null {
  const result = checkPolicy(policy, key)
  if (result.allowed) return null

  const seconds = retryAfterSeconds(result)
  const response = fail(
    `Too many requests. Try again in ${seconds} ${seconds === 1 ? 'second' : 'seconds'}.`,
    429,
    'rate_limited',
  )
  response.headers.set('Retry-After', String(seconds))
  return response
}

// ---------------------------------------------------------------------------
// The public shape of a user
// ---------------------------------------------------------------------------

/**
 * What any route may return about an account.
 *
 * The licence number or NPI never appears here, and no longer appears on `CommentUser` either:
 * that object is serialised into the RSC payload of every page a signed-in physician loads. A
 * real-world identifier that a steward checks against a registry once, and that nothing renders,
 * has no business in someone's browser cache, error tracker and server log. `hasCredentialOnFile`
 * is all the interface ever needed.
 *
 * `email` stays, because every route that returns a `PublicUser` returns it to the account's own
 * owner — register, login, me, doctor-verification. Nothing here backs a public profile page; that
 * is `getContributorProfile` in lib/queries/users.ts, which selects a different set of columns and
 * never selects the email at all.
 */
export interface PublicUser extends CommentUser {
  hasCredentialOnFile: boolean
}

/**
 * Maps an account row to `PublicUser`.
 *
 * `isDoctor` is `verificationState === 'verified'`, never the `is_doctor` column. That column
 * records only that somebody ticked a box and typed a licence number into a form. If it drove the
 * badge, the badge would be self-service — which is exactly what the reference wireframe did, and
 * exactly what this rebuild refuses to do. lib/session.ts's `toCommentUser` makes the same choice
 * for the same reason; this function exists because `AccountUser` (from lib/queries/users.ts) and
 * the full `users` row are different types, and the rule has to hold for both.
 */
export function toPublicUser(user: AccountUser): PublicUser {
  const verified = user.verificationState === 'verified'
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    isDoctor: verified,
    hasCredentialOnFile: Boolean(user.medicalLicenseOrNpi),
    // Credentials travel with the badge. An unverified claim of a specialty is not a credential,
    // and shipping it lets any surface render it beside a name as if it were one.
    medicalSpecialty: verified ? (user.medicalSpecialty ?? undefined) : undefined,
    institution: verified ? (user.institution ?? undefined) : undefined,
    verifiedAt: user.verifiedAt?.toISOString(),
    handle: user.handle,
    orcid: user.orcid ?? undefined,
    trustTier: user.trustTier,
    verificationState: user.verificationState,
    acceptedEditCount: user.acceptedEditCount,
    noteCount: user.noteCount,
    isAdmin: user.isAdmin,
    joinedDate: user.createdAt.toISOString(),
  }
}

/**
 * The same projection for the session's `CommentUser`, which lib/session.ts has already built from
 * the row. Kept separate rather than converting one into the other, so neither has to be lossy.
 */
export function commentUserToPublic(user: CommentUser): PublicUser {
  const verified = user.verificationState === 'verified'
  return {
    ...user,
    isDoctor: verified,
    hasCredentialOnFile: Boolean(user.hasCredentialOnFile),
    medicalSpecialty: verified ? user.medicalSpecialty : undefined,
    institution: verified ? user.institution : undefined,
  }
}
