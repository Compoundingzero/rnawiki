import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getIronSession, type IronSession } from 'iron-session'
import { requireUser, AuthError, type SessionData } from '@/lib/auth'

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
// getCurrentUser as needed"). db/index.ts still opens a real pg Pool on import (lib/auth.ts
// imports `db` for verifyCredentials) but requireUser()/getCurrentUser() never query it, so no
// live database access happens in this file.

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({})),
}))

vi.mock('iron-session', () => ({
  getIronSession: vi.fn(),
}))

const mockedGetIronSession = vi.mocked(getIronSession)

beforeEach(() => {
  mockedGetIronSession.mockReset()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe("requireUser(['administrator'])", () => {
  it('rejects a session user whose role is "editor" — throws AuthError', async () => {
    mockedGetIronSession.mockResolvedValue(fakeSession({
      user: { id: 1, email: 'editor@rnawiki.test', name: 'Test Editor', role: 'editor' },
    }))

    await expect(requireUser(['administrator'])).rejects.toBeInstanceOf(AuthError)
  })

  it('rejects a session user whose role is "scientific_reviewer" — throws AuthError', async () => {
    mockedGetIronSession.mockResolvedValue(fakeSession({
      user: { id: 2, email: 'reviewer@rnawiki.test', name: 'Test Reviewer', role: 'scientific_reviewer' },
    }))

    await expect(requireUser(['administrator'])).rejects.toBeInstanceOf(AuthError)
  })

  it('rejects when there is no session user at all (not authenticated)', async () => {
    mockedGetIronSession.mockResolvedValue(fakeSession({}))

    await expect(requireUser(['administrator'])).rejects.toBeInstanceOf(AuthError)
  })

  it('resolves with the user when the session role is "administrator"', async () => {
    mockedGetIronSession.mockResolvedValue(fakeSession({
      user: { id: 3, email: 'admin@rnawiki.test', name: 'Test Admin', role: 'administrator' },
    }))

    await expect(requireUser(['administrator'])).resolves.toMatchObject({
      role: 'administrator',
      email: 'admin@rnawiki.test',
    })
  })

  it('resolves with the user when no allowedRoles filter is passed and any authenticated user is present', async () => {
    mockedGetIronSession.mockResolvedValue(fakeSession({
      user: { id: 4, email: 'editor@rnawiki.test', name: 'Test Editor', role: 'editor' },
    }))

    await expect(requireUser()).resolves.toMatchObject({ role: 'editor' })
  })
})
