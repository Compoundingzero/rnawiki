import { cookies } from 'next/headers'
import { getIronSession, type SessionOptions } from 'iron-session'
import bcrypt from 'bcryptjs'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export interface SessionUser {
  id: number
  email: string
  name: string
  role: 'administrator' | 'editor' | 'scientific_reviewer'
}

export interface SessionData {
  user?: SessionUser
}

function sessionOptions(): SessionOptions {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set to a string of at least 32 characters')
  }
  return {
    cookieName: 'rnawiki_admin_session',
    password: secret,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
    },
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions())
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getSession()
  return session.user ?? null
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
  return { id: row.id, email: row.email, name: row.name, role: row.role }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}
