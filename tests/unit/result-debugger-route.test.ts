import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireAgentReviewerMock = vi.hoisted(() => vi.fn())
const insertMock = vi.hoisted(() => vi.fn())
const selectMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/session')>()
  return { ...actual, requireAgentReviewer: requireAgentReviewerMock }
})

vi.mock('@/db', () => ({
  db: {
    insert: insertMock,
    select: selectMock,
  },
}))

import { GET, POST } from '@/app/api/result-debugger/route'
import { resetRateLimits } from '@/lib/rate-limit'
import { SEMANTIC_ENGINE_VERSION } from '@/lib/semantic/search'
import { AuthError } from '@/lib/session'

const unitA = 'a'.repeat(64)
const unitB = 'b'.repeat(64)
const actor = { id: 'result-debugger-steward', trustTier: 'steward', isAdmin: false }

const validBody = {
  query: 'half-life of metformin',
  returnedUnitIds: [unitA],
  expectedUnitId: unitB,
  reason: 'The top result was the section state, not the recorded value the question asked for.',
}

function request(method: 'GET' | 'POST', pathname: string, body?: unknown): Request {
  return new Request(`http://localhost${pathname}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      'x-forwarded-for': '198.51.100.77',
      'user-agent': 'result-debugger-route-test',
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

beforeEach(() => {
  resetRateLimits()
  requireAgentReviewerMock.mockReset()
  insertMock.mockReset()
  selectMock.mockReset()
  insertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) })
  selectMock.mockReturnValue({
    from: () => ({ orderBy: () => ({ limit: async () => [] }) }),
  })
})

describe('result debugger API', () => {
  it.each([
    ['GET', () => GET(request('GET', '/api/result-debugger'))],
    ['POST', () => POST(request('POST', '/api/result-debugger', validBody))],
  ])('refuses %s for a reader without the steward capability', async (_method, call) => {
    requireAgentReviewerMock.mockRejectedValue(
      new AuthError('forbidden', 'This queue is restricted.'),
    )
    const response = await call()
    expect(response.status).toBe(403)
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('records a correction and stamps the engine version server-side', async () => {
    requireAgentReviewerMock.mockResolvedValue(actor)
    const values = vi.fn().mockResolvedValue(undefined)
    insertMock.mockReturnValue({ values })

    const response = await POST(
      request('POST', '/api/result-debugger', {
        ...validBody,
        engineVersion: undefined,
      }),
    )
    expect(response.status).toBe(201)
    const body = (await response.json()) as { correction: Record<string, unknown> }
    expect(body.correction.engineVersion).toBe(SEMANTIC_ENGINE_VERSION)
    expect(body.correction.reviewerUserId).toBe(actor.id)
    expect(values).toHaveBeenCalledTimes(1)
  })

  it('rejects a correction that names no expected outcome', async () => {
    requireAgentReviewerMock.mockResolvedValue(actor)
    const response = await POST(
      request('POST', '/api/result-debugger', { ...validBody, expectedUnitId: undefined }),
    )
    expect(response.status).toBe(422)
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('rejects a client-supplied engine version', async () => {
    requireAgentReviewerMock.mockResolvedValue(actor)
    const response = await POST(
      request('POST', '/api/result-debugger', { ...validBody, engineVersion: 'made-up/v9' }),
    )
    expect(response.status).toBe(422)
    expect(insertMock).not.toHaveBeenCalled()
  })

  it('lists corrections for a steward and returns none by default', async () => {
    requireAgentReviewerMock.mockResolvedValue(actor)
    const response = await GET(request('GET', '/api/result-debugger'))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ corrections: [] })
  })
})
