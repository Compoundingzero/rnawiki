import { cookies } from 'next/headers'
import { getIronSession, type SessionOptions } from 'iron-session'
import bcrypt from 'bcryptjs'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export interface SessionUser {
  id: number
  email: string
  name: string
  role: 'administrator' | 'editor' | 'scientific_reviewer'
  /**
   * `users.sessionVersion` as it stood when this session was minted. Re-checked against the row on
   * every request in `getCurrentUser`, so bumping the column revokes the cookie. See the comment
   * on that function.
   */
  sessionVersion: number
}

export interface SessionData {
  user?: SessionUser
}

/**
 * Eight hours, and it has to be applied twice — see the comment inside. Exported so a test can
 * assert the seal and the browser cookie agree; nothing else should read it.
 */
export const SESSION_LIFETIME_SECONDS = 60 * 60 * 8

export function sessionOptions(): SessionOptions {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set to a string of at least 32 characters')
  }
  return {
    cookieName: 'rnawiki_admin_session',
    password: secret,
    // `ttl` AND `maxAge`, both, and they must stay equal.
    //
    // `maxAge` is only a browser instruction: it tells the browser when to stop sending the cookie
    // and an attacker holding a copy of the value simply ignores it. `ttl` is the expiry sealed
    // INSIDE the encrypted cookie, which is the one the server enforces. iron-session derives
    // maxAge from ttl when maxAge is absent, but not the other way round — supplying maxAge alone
    // left ttl at the library default of fourteen days. So the comment said 8 hours, the browser
    // behaved as 8 hours, and the cryptographic window was 14 days: a 42x silent deviation from the
    // intent written beside it, measured on a real issued cookie.
    ttl: SESSION_LIFETIME_SECONDS, // the seal's own expiry, enforced server-side
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: SESSION_LIFETIME_SECONDS, // the browser's copy
    },
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions())
}

/**
 * The signed-in user for this request, or null.
 *
 * IT RE-READS THE ROW. Do not "optimise" this back to `session.user ?? null`.
 *
 * iron-session is stateless: the sealed cookie carries the user's id, email, name and role, and
 * nothing on the server ever consulted the `users` table again. Three consequences, all of them
 * live:
 *
 *  - Logout cleared the browser's copy and revoked nothing. A cookie value captured beforehand —
 *    from a shared machine, a proxy log, a browser profile — kept granting full admin access for
 *    the rest of the seal's life.
 *  - A demoted user kept the role sealed into their cookie. An account moved from administrator to
 *    editor stayed an administrator until the cookie expired.
 *  - A DELETED user kept working entirely. A seal minted for a row that no longer exists rendered
 *    the admin dashboard as "Deleted User · Administrator".
 *
 * The row lookup fixes all three at once: `sessionVersion` is the revocation counter (bump it and
 * every outstanding cookie for that user stops working), the role comes from the row rather than
 * from the cookie so a change takes effect on the next request, and a missing row is a rejected
 * session.
 *
 * The cost is one indexed primary-key SELECT per authenticated admin request. There are no
 * authenticated public requests, so this is not on any reader's path.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession()
  const sealed = session.user
  if (!sealed) return null

  const [row] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      sessionVersion: users.sessionVersion,
    })
    .from(users)
    .where(eq(users.id, sealed.id))
    .limit(1)

  if (!row) return null
  if (row.sessionVersion !== sealed.sessionVersion) return null

  // Values come from the row, not from the seal, so a rename or a role change lands immediately.
  return { id: row.id, email: row.email, name: row.name, role: row.role, sessionVersion: row.sessionVersion }
}

export async function requireUser(allowedRoles?: SessionUser['role'][]): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) throw new AuthError('Not authenticated')
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new AuthError('Not authorized for this action')
  }
  return user
}

export class AuthError extends Error {}

export async function verifyCredentials(email: string, password: string): Promise<SessionUser | null> {
  const [row] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1)
  if (!row) return null
  const valid = await bcrypt.compare(password, row.passwordHash)
  if (!valid) return null
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    // Stamped at login so getCurrentUser can compare it later. A session minted before a bump is
    // rejected from the next request onward.
    sessionVersion: row.sessionVersion,
  }
}

/**
 * Revoke every session that user is currently holding, anywhere, immediately.
 *
 * The counterpart to the `sessionVersion` check in `getCurrentUser`. Call it when a password
 * changes, when a role is reduced, or when an account is disabled — anywhere the answer to
 * "should this person still be signed in?" changes to no. Rotating `SESSION_SECRET` is the blunt
 * version and logs out everybody; this is the per-user one.
 */
export async function revokeSessionsForUser(userId: number): Promise<void> {
  await db
    .update(users)
    .set({ sessionVersion: sql`${users.sessionVersion} + 1` })
    .where(eq(users.id, userId))
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}
