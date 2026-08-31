// The session cookie and the current user.
//
// iron-session stores the whole session inside an encrypted, signed cookie. Only the user id goes
// in it: name, tier and — above all — verification state are read from the database on every
// request, so a demoted account takes effect immediately instead of when the cookie expires.

import { getIronSession, type IronSession, type SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema'
import {
  canManageInternalReview,
  INTERNAL_REVIEW_ROLE_EXPLANATION,
} from '@/lib/internal-review-policy'
import { AGENT_REVIEW_ROLE_EXPLANATION, canReviewAgentEvidence } from '@/lib/agent-review-policy'
import type { CommentUser } from '@/lib/types'

export interface SessionData {
  userId?: string
}

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30

const secret = process.env.SESSION_SECRET

// Module scope on purpose: a missing key must stop the process at import, not hand out cookies
// sealed with a placeholder. iron-session derives its encryption key from this string, so a short
// one weakens every session cookie the site has ever issued.
if (!secret || secret.length < 32) {
  throw new Error(
    'SESSION_SECRET is missing or shorter than 32 characters. Set SESSION_SECRET in the ' +
      'environment (generate one with `openssl rand -base64 32`).',
  )
}

export const SESSION_COOKIE_NAME = 'rnawiki_session'

export const sessionOptions: SessionOptions = {
  cookieName: SESSION_COOKIE_NAME,
  password: secret,
  // The seal outlives the cookie by a minute so a request arriving at the very edge of the cookie
  // lifetime decrypts cleanly instead of throwing. iron-session would otherwise derive
  // `maxAge = ttl - 60` itself; setting both explicitly keeps the 30 days the product promises.
  ttl: THIRTY_DAYS_SECONDS + 60,
  cookieOptions: {
    httpOnly: true,
    // Cookies are only marked Secure in production because local development is plain http and a
    // Secure cookie there is silently dropped, which looks exactly like a broken login.
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: THIRTY_DAYS_SECONDS,
  },
}

/**
 * The session for the current request.
 *
 * Reading works anywhere. WRITING (`save`, `destroy`, and therefore `signIn`/`signOut`) only works
 * in a Route Handler or Server Action: `cookies()` is read-only inside a Server Component and
 * throws if you set anything.
 */
export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

type UserRow = typeof users.$inferSelect

/** Map a database user to the client-safe account shape. */
export function toCommentUser(row: UserRow): CommentUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    handle: row.handle,
    orcid: row.orcid ?? undefined,
    trustTier: row.trustTier,
    acceptedEditCount: row.acceptedEditCount,
    noteCount: row.noteCount,
    isAdmin: row.isAdmin,
    joinedDate: row.createdAt.toISOString(),
  }
}

/** The signed-in user, or null. Null covers "no cookie", "expired cookie" and "deleted account". */
export async function getCurrentUser(): Promise<CommentUser | null> {
  const session = await getSession()
  const userId = session.userId
  if (!userId) return null

  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  const row = rows[0]
  // The row can be gone while the cookie is still valid — an account deleted mid-session. Treat
  // that as signed out rather than as an error.
  if (!row) return null

  return toCommentUser(row)
}

export type AuthErrorCode = 'unauthenticated' | 'forbidden'

/**
 * Thrown by `requireUser` / `requireAdmin`. `status` exists so a route handler can map it without
 * matching on message text — `catch (e) { if (e instanceof AuthError) return new Response(null, e) }`
 */
export class AuthError extends Error {
  readonly code: AuthErrorCode
  readonly status: 401 | 403

  constructor(code: AuthErrorCode, message: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
    this.status = code === 'unauthenticated' ? 401 : 403
  }
}

export async function requireUser(): Promise<CommentUser> {
  const user = await getCurrentUser()
  if (!user) throw new AuthError('unauthenticated', 'Sign in to continue.')
  return user
}

export async function requireAdmin(): Promise<CommentUser> {
  const user = await requireUser()
  if (!user.isAdmin) {
    throw new AuthError('forbidden', 'This action is restricted to administrators.')
  }
  return user
}

/** Private operational queues use one policy everywhere: current steward or administrator. */
export async function requireInternalReviewer(): Promise<CommentUser> {
  const user = await requireUser()
  if (!canManageInternalReview(user)) {
    throw new AuthError('forbidden', INTERNAL_REVIEW_ROLE_EXPLANATION)
  }
  return user
}

/** Agent evidence decisions use an explicit steward/admin capability, never a client-supplied role. */
export async function requireAgentReviewer(): Promise<CommentUser> {
  const user = await requireUser()
  if (!canReviewAgentEvidence(user)) {
    throw new AuthError('forbidden', AGENT_REVIEW_ROLE_EXPLANATION)
  }
  return user
}

/** Route handlers and Server Actions only — see `getSession`. */
export async function signIn(userId: string): Promise<void> {
  const session = await getSession()
  session.userId = userId
  await session.save()
}

/** Route handlers and Server Actions only — see `getSession`. */
export async function signOut(): Promise<void> {
  const session = await getSession()
  // `destroy` clears the data and expires the cookie in one step; no save() follows it.
  session.destroy()
}
