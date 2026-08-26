import { randomUUID } from 'node:crypto'

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { eq } from 'drizzle-orm'

const { cookieJar } = vi.hoisted(() => ({ cookieJar: new Map<string, string>() }))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieJar.get(name)
      return value === undefined ? undefined : { name, value }
    },
    set: (name: string, value: string) => cookieJar.set(name, value),
    delete: (name: string) => cookieJar.delete(name),
  }),
}))

import { db } from '@/db'
import { contributorPublicSettings, users } from '@/db/schema'
import { resetRateLimits } from '@/lib/rate-limit'
import { signIn, signOut } from '@/lib/session'
import { GET, PATCH } from '@/app/api/me/contributor-settings/route'

const key = randomUUID().replaceAll('-', '').slice(0, 12)
const userId = `spotlight-settings-${key}`

function request(method: 'GET' | 'PATCH', body?: unknown): Request {
  return new Request('http://localhost/api/me/contributor-settings', {
    method,
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      'x-forwarded-for': '198.51.100.45',
      'user-agent': 'vitest-contributor-settings',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

beforeAll(async () => {
  await db.insert(users).values({
    id: userId,
    email: `${userId}@example.test`,
    passwordHash: 'not-used',
    name: 'Settings test account',
    handle: `settings-${key}`,
  })
})

afterAll(async () => {
  await db.delete(users).where(eq(users.id, userId))
})

beforeEach(async () => {
  resetRateLimits()
  cookieJar.clear()
  await signOut()
  await db.delete(contributorPublicSettings).where(eq(contributorPublicSettings.userId, userId))
})

describe('/api/me/contributor-settings', () => {
  it('is private to the signed-in account', async () => {
    const response = await GET(request('GET'))
    expect(response.status).toBe(401)
  })

  it('defaults to handle visibility with social display off', async () => {
    await signIn(userId)
    const response = await GET(request('GET'))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      settings: {
        appearInWeeklySpotlight: true,
        showSocialLinksInSpotlight: false,
        socialLinks: [],
      },
    })
  })

  it('canonicalises explicitly supplied profiles and persists the display opt-in', async () => {
    await signIn(userId)
    const response = await PATCH(
      request('PATCH', {
        appearInWeeklySpotlight: true,
        showSocialLinksInSpotlight: true,
        socialLinks: [
          { platform: 'x', url: 'https://twitter.com/example_user' },
          { platform: 'github', url: 'https://www.github.com/example-user/' },
        ],
      }),
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      settings: {
        appearInWeeklySpotlight: true,
        showSocialLinksInSpotlight: true,
        socialLinks: [
          { platform: 'x', url: 'https://x.com/example_user' },
          { platform: 'github', url: 'https://github.com/example-user' },
        ],
      },
    })

    const stored = await db
      .select({
        show: contributorPublicSettings.showSocialLinksInSpotlight,
        links: contributorPublicSettings.socialLinks,
      })
      .from(contributorPublicSettings)
      .where(eq(contributorPublicSettings.userId, userId))
    expect(stored[0]).toMatchObject({ show: true })
    expect(stored[0]?.links).toHaveLength(2)
  })

  it('rejects a misleading host without changing stored settings', async () => {
    await signIn(userId)
    const response = await PATCH(
      request('PATCH', {
        appearInWeeklySpotlight: true,
        showSocialLinksInSpotlight: true,
        socialLinks: [
          { platform: 'linkedin', url: 'https://linkedin.com.evil.test/in/example-person' },
        ],
      }),
    )
    expect(response.status).toBe(422)

    const stored = await db
      .select({ userId: contributorPublicSettings.userId })
      .from(contributorPublicSettings)
      .where(eq(contributorPublicSettings.userId, userId))
    expect(stored).toEqual([])
  })
})
