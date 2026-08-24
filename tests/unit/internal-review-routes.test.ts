import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireInternalReviewerMock = vi.hoisted(() => vi.fn())
const listPhysicianRequestsMock = vi.hoisted(() => vi.fn())
const getPhysicianRequestMock = vi.hoisted(() => vi.fn())
const decidePhysicianRequestMock = vi.hoisted(() => vi.fn())
const listFeedbackMock = vi.hoisted(() => vi.fn())
const resolveFeedbackMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/session')>()
  return { ...actual, requireInternalReviewer: requireInternalReviewerMock }
})

vi.mock('@/lib/queries/users', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/queries/users')>()
  return {
    ...actual,
    listPhysicianVerificationRequests: listPhysicianRequestsMock,
    getPhysicianVerificationRequest: getPhysicianRequestMock,
    decidePhysicianVerification: decidePhysicianRequestMock,
  }
})

vi.mock('@/lib/queries/feedback', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/queries/feedback')>()
  return { ...actual, listFeedback: listFeedbackMock, resolveFeedback: resolveFeedbackMock }
})

import { GET as listFeedbackRoute } from '@/app/api/feedback/route'
import { POST as resolveFeedbackRoute } from '@/app/api/feedback/[id]/resolve/route'
import { GET as listPhysicianRoute } from '@/app/api/physician-verifications/route'
import { GET as physicianDetailRoute } from '@/app/api/physician-verifications/[id]/route'
import { POST as decidePhysicianRoute } from '@/app/api/physician-verifications/[id]/decision/route'
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
  for (const mock of [
    requireInternalReviewerMock,
    listPhysicianRequestsMock,
    getPhysicianRequestMock,
    decidePhysicianRequestMock,
    listFeedbackMock,
    resolveFeedbackMock,
  ]) {
    mock.mockReset()
  }
})

describe('steward/admin operational-review routes', () => {
  it.each([
    ['physician queue', () => listPhysicianRoute(request('GET', '/api/physician-verifications'))],
    [
      'physician detail',
      () =>
        physicianDetailRoute(request('GET', '/api/physician-verifications/request-a'), {
          params: Promise.resolve({ id: 'request-a' }),
        }),
    ],
    [
      'physician decision',
      () =>
        decidePhysicianRoute(
          request('POST', '/api/physician-verifications/request-a/decision', {
            decision: 'APPROVE',
            reason: 'The issuing registry confirms this credential.',
          }),
          { params: Promise.resolve({ id: 'request-a' }) },
        ),
    ],
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
    expect(listPhysicianRequestsMock).not.toHaveBeenCalled()
    expect(getPhysicianRequestMock).not.toHaveBeenCalled()
    expect(decidePhysicianRequestMock).not.toHaveBeenCalled()
    expect(listFeedbackMock).not.toHaveBeenCalled()
    expect(resolveFeedbackMock).not.toHaveBeenCalled()
  })

  it('keeps licence and work email out of the physician queue but returns them in protected detail', async () => {
    requireInternalReviewerMock.mockResolvedValue(actor)
    listPhysicianRequestsMock.mockResolvedValue([
      {
        id: 'request-a',
        professionalFullName: 'Dr Route Example',
        medicalSpecialty: 'Internal medicine',
        institution: 'Example Hospital',
        status: 'pending',
        submittedAt: '2026-08-23T00:00:00.000Z',
        decidedAt: null,
        account: { name: 'Route Example', handle: 'route-example' },
      },
    ])
    getPhysicianRequestMock.mockResolvedValue({
      id: 'request-a',
      professionalFullName: 'Dr Route Example',
      workEmail: 'route@hospital.example',
      medicalLicenseOrNpi: 'NPI-ROUTE-123',
    })

    const listResponse = await listPhysicianRoute(
      request('GET', '/api/physician-verifications?status=pending&limit=10'),
    )
    const listBody = await listResponse.json()
    expect(JSON.stringify(listBody)).not.toContain('route@hospital.example')
    expect(JSON.stringify(listBody)).not.toContain('NPI-ROUTE-123')
    expect(listResponse.headers.get('Cache-Control')).toBe('no-store')

    const detailResponse = await physicianDetailRoute(
      request('GET', '/api/physician-verifications/request-a'),
      { params: Promise.resolve({ id: 'request-a' }) },
    )
    await expect(detailResponse.json()).resolves.toMatchObject({
      request: {
        workEmail: 'route@hospital.example',
        medicalLicenseOrNpi: 'NPI-ROUTE-123',
      },
    })
  })

  it('passes only the authenticated actor and validated reasons to decision services', async () => {
    requireInternalReviewerMock.mockResolvedValue(actor)
    decidePhysicianRequestMock.mockResolvedValue({ id: 'request-a', status: 'verified' })
    resolveFeedbackMock.mockResolvedValue({ id: 'feedback-a', resolved: true })

    const physicianResponse = await decidePhysicianRoute(
      request('POST', '/api/physician-verifications/request-a/decision', {
        decision: 'APPROVE',
        reason: 'The issuing registry confirms this credential.',
      }),
      { params: Promise.resolve({ id: 'request-a' }) },
    )
    expect(physicianResponse.status).toBe(200)
    expect(decidePhysicianRequestMock).toHaveBeenCalledWith({
      requestId: 'request-a',
      actorUserId: actor.id,
      decision: 'APPROVE',
      reason: 'The issuing registry confirms this credential.',
    })

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
