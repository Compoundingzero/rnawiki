import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireInternalReviewerMock = vi.hoisted(() => vi.fn())
const listFeedbackMock = vi.hoisted(() => vi.fn())
const resolveFeedbackMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/session')>()
  return { ...actual, requireInternalReviewer: requireInternalReviewerMock }
})

vi.mock('@/lib/queries/feedback', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/queries/feedback')>()
  return { ...actual, listFeedback: listFeedbackMock, resolveFeedback: resolveFeedbackMock }
})

import { GET as listFeedbackRoute } from '@/app/api/feedback/route'
import { POST as resolveFeedbackRoute } from '@/app/api/feedback/[id]/resolve/route'
import { resetRateLimits } from '@/lib/rate-limit'
import { AuthError } from '@/lib/session'

const actor = { id: 'steward-route-test', trustTier: 'steward', isAdmin: false }

function request(method: 'GET' | 'POST', pathname: string, body?: unknown): Request {
  return new Request(`http://localhost${pathname}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      'x-forwarded-for': '198.51.100.29',
      'user-agent': 'internal-review-route-test',
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

beforeEach(() => {
  resetRateLimits()
  for (const mock of [requireInternalReviewerMock, listFeedbackMock, resolveFeedbackMock]) {
    mock.mockReset()
  }
})

describe('steward/admin operational-review routes', () => {
  it.each([
    ['feedback queue', () => listFeedbackRoute(request('GET', '/api/feedback?status=open'))],
    [
      'feedback resolution',
      () =>
        resolveFeedbackRoute(
          request('POST', '/api/feedback/feedback-a/resolve', {
            note: 'The linked registry fact was checked and corrected.',
          }),
          { params: Promise.resolve({ id: 'feedback-a' }) },
        ),
    ],
  ])('returns 401 before reading private %s data', async (_label, callRoute) => {
    requireInternalReviewerMock.mockRejectedValueOnce(
      new AuthError('unauthenticated', 'Sign in to continue.'),
    )

    const response = await callRoute()

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ code: 'unauthenticated' })
    expect(listFeedbackMock).not.toHaveBeenCalled()
    expect(resolveFeedbackMock).not.toHaveBeenCalled()
  })

  it('passes only the authenticated actor and validated note to feedback resolution', async () => {
    requireInternalReviewerMock.mockResolvedValue(actor)
    resolveFeedbackMock.mockResolvedValue({ id: 'feedback-a', resolved: true })

    const feedbackResponse = await resolveFeedbackRoute(
      request('POST', '/api/feedback/feedback-a/resolve', {
        note: 'The linked registry fact was checked and corrected.',
      }),
      { params: Promise.resolve({ id: 'feedback-a' }) },
    )
    expect(feedbackResponse.status).toBe(200)
    expect(resolveFeedbackMock).toHaveBeenCalledWith({
      id: 'feedback-a',
      actorUserId: actor.id,
      note: 'The linked registry fact was checked and corrected.',
    })
  })

  it('never exposes the abuse-control session hash in the protected feedback projection', async () => {
    requireInternalReviewerMock.mockResolvedValue(actor)
    listFeedbackMock.mockResolvedValue([
      {
        id: 'feedback-a',
        type: 'correction',
        message: 'Please recheck the registry date.',
        email: 'reader@example.test',
        resolved: false,
      },
    ])

    const response = await listFeedbackRoute(request('GET', '/api/feedback?status=open&limit=10'))
    const body = await response.json()
    expect(JSON.stringify(body)).not.toContain('sessionHash')
    expect(JSON.stringify(body)).not.toContain('a'.repeat(64))
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })
})
