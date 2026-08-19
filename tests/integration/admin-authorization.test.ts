import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { randomUUID } from 'node:crypto'
import { eq, inArray } from 'drizzle-orm'
import { getIronSession, type IronSession } from 'iron-session'
import { db } from '@/db'
import { users } from '@/db/schema'
import {
  getCurrentUser,
  requireUser,
  revokeSessionsForUser,
  sessionOptions,
  AuthError,
  SESSION_LIFETIME_SECONDS,
  type SessionData,
  type SessionUser,
} from '@/lib/auth'

/** A minimal, properly-typed fake of iron-session's return shape — avoids `any` in every test. */
function fakeSession(data: SessionData): IronSession<SessionData> {
  return {
    ...data,
    save: async () => {},
    destroy: () => {},
    updateConfig: () => {},
  }
}

// lib/auth.ts's getSession() calls next/headers' cookies() (which throws outside a real Next.js
// request scope) and iron-session's getIronSession(). Both are mocked here so requireUser()'s
// authorization logic can be exercised directly, per the task brief ("mock getSession/
// getCurrentUser as needed").
//
// THE USER ROWS ARE REAL, and that is not incidental. getCurrentUser re-reads the `users` row on
// every request and rejects the session when the row is gone or its `sessionVersion` no longer
// matches the one sealed into the cookie. That check is the only thing that makes an admin session
// revocable at all — iron-session is stateless, so logout clears the browser's copy and nothing
// else — and a test that faked the row could not exercise it.

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({})),
}))

vi.mock('iron-session', () => ({
  getIronSession: vi.fn(),
}))

const mockedGetIronSession = vi.mocked(getIronSession)

const createdUserIds: number[] = []

/** Inserts a real user row and returns the session payload a successful login would mint for it. */
async function makeUser(role: SessionUser['role'], label: string): Promise<SessionUser> {
  const [row] = await db
    .insert(users)
    .values({
      email: `${label}-${randomUUID()}@rnawiki.test`,
      name: `Test ${label}`,
      passwordHash: 'not-a-real-hash',
      role,
    })
    .returning()
  createdUserIds.push(row!.id)
  return { id: row!.id, email: row!.email, name: row!.name, role: row!.role, sessionVersion: row!.sessionVersion }
}

let editor: SessionUser
let reviewer: SessionUser
let administrator: SessionUser

beforeAll(async () => {
  editor = await makeUser('editor', 'editor')
  reviewer = await makeUser('scientific_reviewer', 'reviewer')
  administrator = await makeUser('administrator', 'admin')
})

afterAll(async () => {
  if (createdUserIds.length > 0) {
    await db.delete(users).where(inArray(users.id, createdUserIds))
  }
})

beforeEach(() => {
  mockedGetIronSession.mockReset()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe("requireUser(['administrator'])", () => {
  it('rejects a session user whose role is "editor" — throws AuthError', async () => {
    mockedGetIronSession.mockResolvedValue(fakeSession({ user: editor }))

    await expect(requireUser(['administrator'])).rejects.toBeInstanceOf(AuthError)
  })

  it('rejects a session user whose role is "scientific_reviewer" — throws AuthError', async () => {
    mockedGetIronSession.mockResolvedValue(fakeSession({ user: reviewer }))

    await expect(requireUser(['administrator'])).rejects.toBeInstanceOf(AuthError)
  })

  it('rejects when there is no session user at all (not authenticated)', async () => {
    mockedGetIronSession.mockResolvedValue(fakeSession({}))

    await expect(requireUser(['administrator'])).rejects.toBeInstanceOf(AuthError)
  })

  it('resolves with the user when the session role is "administrator"', async () => {
    mockedGetIronSession.mockResolvedValue(fakeSession({ user: administrator }))

    await expect(requireUser(['administrator'])).resolves.toMatchObject({
      role: 'administrator',
      email: administrator.email,
    })
  })

  it('resolves with the user when no allowedRoles filter is passed and any authenticated user is present', async () => {
    mockedGetIronSession.mockResolvedValue(fakeSession({ user: editor }))

    await expect(requireUser()).resolves.toMatchObject({ role: 'editor' })
  })
})

/**
 * Session revocation. The defect these cover: iron-session is stateless, so `session.destroy()` on
 * logout only clears the browser's copy — a captured cookie value kept granting full admin access,
 * a demoted user kept the role sealed into their cookie, and a session minted for a since-deleted
 * account still rendered the admin dashboard. `getCurrentUser` now re-reads the row and compares
 * `sessionVersion`, so all three stop at the next request.
 */
describe('getCurrentUser revocation', () => {
  it('rejects a session whose sessionVersion is behind the stored one', async () => {
    const stale = await makeUser('administrator', 'stale')
    mockedGetIronSession.mockResolvedValue(fakeSession({ user: stale }))
    // Sanity: it works before the bump.
    await expect(getCurrentUser()).resolves.toMatchObject({ id: stale.id })

    await revokeSessionsForUser(stale.id)

    await expect(getCurrentUser()).resolves.toBeNull()
    await expect(requireUser(['administrator'])).rejects.toBeInstanceOf(AuthError)
  })

  it('rejects a session whose user row no longer exists', async () => {
    const doomed = await makeUser('administrator', 'doomed')
    mockedGetIronSession.mockResolvedValue(fakeSession({ user: doomed }))
    await expect(getCurrentUser()).resolves.toMatchObject({ id: doomed.id })

    await db.delete(users).where(eq(users.id, doomed.id))

    await expect(getCurrentUser()).resolves.toBeNull()
  })

  it('reads the role from the row, so a demotion takes effect without a new login', async () => {
    const demoted = await makeUser('administrator', 'demoted')
    mockedGetIronSession.mockResolvedValue(fakeSession({ user: demoted }))
    await expect(requireUser(['administrator'])).resolves.toMatchObject({ role: 'administrator' })

    await db.update(users).set({ role: 'editor' }).where(eq(users.id, demoted.id))

    await expect(getCurrentUser()).resolves.toMatchObject({ role: 'editor' })
    await expect(requireUser(['administrator'])).rejects.toBeInstanceOf(AuthError)
  })
})


/**
 * SESSION LIFETIME. iron-session's `ttl` is the expiry sealed inside the encrypted cookie and is
 * the only one the server enforces; `cookieOptions.maxAge` is an instruction to the browser that
 * anyone holding a copy of the value simply ignores. The library derives maxAge from ttl when
 * maxAge is absent, but never the other way round — so supplying maxAge alone, as this code did,
 * left ttl at the library's fourteen-day default while the comment beside it said eight hours. A
 * 42x silent deviation, measured on a real issued cookie. They must move together.
 */
describe('session cookie lifetime', () => {
  it('seals the same expiry into the cookie that it asks the browser to honour', () => {
    const options = sessionOptions()
    expect(options.ttl).toBe(SESSION_LIFETIME_SECONDS)
    expect(options.cookieOptions?.maxAge).toBe(SESSION_LIFETIME_SECONDS)
    expect(options.ttl).toBe(options.cookieOptions?.maxAge)
  })

  it('is nowhere near the library default of fourteen days', () => {
    expect(sessionOptions().ttl).toBeLessThan(60 * 60 * 24)
  })

  it('keeps the cookie httpOnly and sameSite-scoped', () => {
    const options = sessionOptions()
    expect(options.cookieOptions?.httpOnly).toBe(true)
    expect(options.cookieOptions?.sameSite).toBe('lax')
  })
})
