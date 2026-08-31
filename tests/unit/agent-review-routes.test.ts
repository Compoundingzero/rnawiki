import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireAgentReviewerMock = vi.hoisted(() => vi.fn())
const listAgentReviewQueueMock = vi.hoisted(() => vi.fn())
const getAgentReviewQueueDetailMock = vi.hoisted(() => vi.fn())
const recordAgentReviewDecisionMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/session')>()
  return { ...actual, requireAgentReviewer: requireAgentReviewerMock }
})

vi.mock('@/lib/queries/agent-review-queue', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/queries/agent-review-queue')>()
  return {
    ...actual,
    listAgentReviewQueue: listAgentReviewQueueMock,
    getAgentReviewQueueDetail: getAgentReviewQueueDetailMock,
    recordAgentReviewDecision: recordAgentReviewDecisionMock,
  }
})

import { GET, POST } from '@/app/api/agent-review-queue/route'
import { AGENT_REVIEW_DECISIONS } from '@/lib/agent-review-policy'
import { AgentReviewQueueError } from '@/lib/queries/agent-review-queue'
import { resetRateLimits } from '@/lib/rate-limit'
import { AuthError } from '@/lib/session'

const occurrenceKey = 'a'.repeat(64)
const evidenceDigest = 'b'.repeat(64)
const liveContextDigest = 'c'.repeat(64)
const actor = { id: 'agent-review-steward', trustTier: 'steward', isAdmin: false }

function request(method: 'GET' | 'POST', pathname: string, body?: unknown): Request {
  return new Request(`http://localhost${pathname}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'content-type': 'application/json' }),
      'x-forwarded-for': '198.51.100.41',
      'user-agent': 'agent-review-route-test',
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

beforeEach(() => {
  resetRateLimits()
  for (const mock of [
    requireAgentReviewerMock,
    listAgentReviewQueueMock,
    getAgentReviewQueueDetailMock,
    recordAgentReviewDecisionMock,
  ]) {
    mock.mockReset()
  }
})

describe('private agent evidence review API', () => {
  it.each([
    ['GET', () => GET(request('GET', '/api/agent-review-queue'))],
    [
      'POST',
      () =>
        POST(
          request('POST', '/api/agent-review-queue', {
            occurrenceKey,
            evidenceDigest,
            liveContextDigest,
            decision: 'NEEDS_MORE_EVIDENCE',
            explanation: 'The current excerpt does not settle the recorded observation.',
          }),
        ),
    ],
  ])('authenticates before the %s route reads or writes review memory', async (_method, call) => {
    requireAgentReviewerMock.mockRejectedValueOnce(
      new AuthError('unauthenticated', 'Sign in to continue.'),
    )

    const response = await call()

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ code: 'unauthenticated' })
    expect(listAgentReviewQueueMock).not.toHaveBeenCalled()
    expect(getAgentReviewQueueDetailMock).not.toHaveBeenCalled()
    expect(recordAgentReviewDecisionMock).not.toHaveBeenCalled()
  })

  it('validates and bounds active-list filters and marks the response private', async () => {
    requireAgentReviewerMock.mockResolvedValue(actor)
    listAgentReviewQueueMock.mockResolvedValue({ items: [], limit: 20, offset: 4, hasMore: false })

    const response = await GET(
      request(
        'GET',
        '/api/agent-review-queue?limit=20&offset=4&agent=density&reason=SPARSE_EVIDENCE&severity=high&lane=biotech&provenanceTier=transcribed&state=evidence_changed&occurrenceState=reopened&sourceChanged=true&conflict=true&freshnessDrift=true&coverageGap=true&chemistryIdentity=true&quantitativeIntegrity=true&query=kinase',
      ),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(listAgentReviewQueueMock).toHaveBeenCalledWith({
      limit: 20,
      offset: 4,
      agent: 'density',
      reason: 'SPARSE_EVIDENCE',
      severity: 'high',
      lane: 'biotech',
      provenanceTier: 'transcribed',
      state: 'evidence_changed',
      occurrenceState: 'reopened',
      sourceChanged: true,
      conflict: true,
      freshnessDrift: true,
      coverageGap: true,
      chemistryIdentity: true,
      quantitativeIntegrity: true,
      query: 'kinase',
    })
  })

  it.each(['new', 'reopened', 'unchanged'] as const)(
    'accepts the persisted %s occurrence-state filter',
    async (occurrenceState) => {
      requireAgentReviewerMock.mockResolvedValue(actor)
      listAgentReviewQueueMock.mockResolvedValue({
        items: [],
        limit: 40,
        offset: 0,
        hasMore: false,
      })

      const response = await GET(
        request('GET', `/api/agent-review-queue?occurrenceState=${occurrenceState}`),
      )

      expect(response.status).toBe(200)
      expect(listAgentReviewQueueMock).toHaveBeenCalledWith({
        limit: 40,
        offset: 0,
        occurrenceState,
      })
    },
  )

  it('loads detail only by a validated active occurrence key', async () => {
    requireAgentReviewerMock.mockResolvedValue(actor)
    getAgentReviewQueueDetailMock.mockResolvedValue({ occurrenceKey })

    const response = await GET(
      request(
        'GET',
        `/api/agent-review-queue?occurrence=${occurrenceKey}&occurrenceHistoryOffset=50&decisionHistoryOffset=100`,
      ),
    )

    expect(response.status).toBe(200)
    expect(getAgentReviewQueueDetailMock).toHaveBeenCalledWith(occurrenceKey, {
      occurrenceOffset: 50,
      decisionOffset: 100,
    })
    expect(listAgentReviewQueueMock).not.toHaveBeenCalled()
  })

  it.each(AGENT_REVIEW_DECISIONS)(
    'accepts %s and derives actor and time server-side',
    async (decision) => {
      requireAgentReviewerMock.mockResolvedValue(actor)
      recordAgentReviewDecisionMock.mockResolvedValue({
        id: 'decision-event',
        occurrenceKey,
        decision,
        decidedAt: '2026-09-01T00:00:00.000Z',
      })

      const response = await POST(
        request('POST', '/api/agent-review-queue', {
          occurrenceKey,
          evidenceDigest,
          liveContextDigest,
          decision,
          explanation: '  Reviewed the exact stored source reading.  ',
        }),
      )

      expect(response.status).toBe(201)
      expect(recordAgentReviewDecisionMock).toHaveBeenCalledWith({
        occurrenceKey,
        evidenceDigest,
        liveContextDigest,
        decision,
        explanation: 'Reviewed the exact stored source reading.',
        actorUserId: actor.id,
      })
      expect(recordAgentReviewDecisionMock.mock.calls[0]?.[0]).not.toHaveProperty('decidedAt')
    },
  )

  it('rejects blank explanations and client-supplied reviewer metadata before writing', async () => {
    requireAgentReviewerMock.mockResolvedValue(actor)

    const blank = await POST(
      request('POST', '/api/agent-review-queue', {
        occurrenceKey,
        evidenceDigest,
        liveContextDigest,
        decision: 'NOT_A_PROBLEM',
        explanation: '   ',
      }),
    )
    expect(blank.status).toBe(422)

    const forgedActor = await POST(
      request('POST', '/api/agent-review-queue', {
        occurrenceKey,
        evidenceDigest,
        liveContextDigest,
        decision: 'CORRECTION_NEEDED',
        explanation: 'Checked the exact evidence.',
        actorUserId: 'someone-else',
        decidedAt: '2001-01-01T00:00:00.000Z',
      }),
    )
    expect(forgedActor.status).toBe(422)
    expect(recordAgentReviewDecisionMock).not.toHaveBeenCalled()
  })

  it.each(['stale_occurrence', 'stale_evidence'] as const)(
    'returns 409 for %s without obscuring the reload requirement',
    async (code) => {
      requireAgentReviewerMock.mockResolvedValue(actor)
      recordAgentReviewDecisionMock.mockRejectedValue(
        new AgentReviewQueueError(code, 'Reload the current occurrence before deciding.'),
      )

      const response = await POST(
        request('POST', '/api/agent-review-queue', {
          occurrenceKey,
          evidenceDigest,
          liveContextDigest,
          decision: 'NEEDS_MORE_EVIDENCE',
          explanation: 'The stored evidence needs another source reading.',
        }),
      )

      expect(response.status).toBe(409)
      await expect(response.json()).resolves.toMatchObject({ code })
    },
  )
})
