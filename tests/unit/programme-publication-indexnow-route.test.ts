import { beforeEach, describe, expect, it, vi } from 'vitest'

const afterMock = vi.hoisted(() => vi.fn())
const publishMock = vi.hoisted(() => vi.fn())
const notifyMock = vi.hoisted(() => vi.fn())
const requireUserMock = vi.hoisted(() => vi.fn())

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>()
  return { ...actual, after: afterMock }
})

vi.mock('@/lib/queries/programme-verdict-publication', () => ({
  publishProgrammeVerdictRevision: publishMock,
}))

vi.mock('@/lib/seo/indexnow', () => ({
  notifyEligibleProgrammePublication: notifyMock,
}))

vi.mock('@/lib/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/session')>()
  return { ...actual, requireUser: requireUserMock }
})

import { POST } from '@/app/api/programme-verdicts/[id]/publish/route'
import { resetRateLimits } from '@/lib/rate-limit'

const digest = 'a'.repeat(64)
const context = { params: Promise.resolve({ id: 'verdict-indexnow-route' }) }

function request(): Request {
  return new Request('https://rnawiki.com/api/programme-verdicts/verdict-indexnow-route/publish', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '198.51.100.42',
      'user-agent': 'indexnow-route-test',
    },
    body: JSON.stringify({ expectedProposalDigest: digest }),
  })
}

function publication(alreadyPublished: boolean) {
  return {
    revisionId: 'verdict-indexnow-route',
    programmeId: 'programme-indexnow-route',
    previousRevisionId: null,
    publishedAt: new Date('2026-08-25T00:00:00.000Z'),
    proposalDigest: digest,
    alreadyPublished,
  }
}

beforeEach(() => {
  resetRateLimits()
  afterMock.mockReset()
  publishMock.mockReset()
  notifyMock.mockReset()
  requireUserMock.mockReset()
  requireUserMock.mockResolvedValue({ id: 'steward-indexnow-route' })
})

describe('programme publication IndexNow hook', () => {
  it('schedules the eligibility re-query only after a new publication and preserves the response', async () => {
    const tasks: Array<() => Promise<void>> = []
    afterMock.mockImplementation((task: () => Promise<void>) => tasks.push(task))
    publishMock.mockResolvedValue(publication(false))
    notifyMock.mockRejectedValue(new Error('network failure'))
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const response = await POST(request(), context)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      publication: { programmeId: 'programme-indexnow-route', alreadyPublished: false },
    })
    expect(afterMock).toHaveBeenCalledOnce()
    expect(notifyMock).not.toHaveBeenCalled()

    await expect(tasks[0]?.()).resolves.toBeUndefined()
    expect(notifyMock).toHaveBeenCalledWith('programme-indexnow-route')
    expect(warning).toHaveBeenCalledWith(
      '[seo.indexnow_after_failed]',
      expect.not.stringContaining('network failure'),
    )
  })

  it('does not schedule a notification for an already-published idempotent retry', async () => {
    publishMock.mockResolvedValue(publication(true))

    const response = await POST(request(), context)

    expect(response.status).toBe(200)
    expect(afterMock).not.toHaveBeenCalled()
    expect(notifyMock).not.toHaveBeenCalled()
  })
})
