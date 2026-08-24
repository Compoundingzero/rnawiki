import { beforeEach, describe, expect, it, vi } from 'vitest'

const requireUserMock = vi.hoisted(() => vi.fn())
const authorSuccessorMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/session', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/session')>()
  return { ...actual, requireUser: requireUserMock }
})

vi.mock('@/lib/queries/programme-first-verdict-authoring', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/queries/programme-first-verdict-authoring')>()
  return { ...actual, authorSuccessorProgrammeVerdictDraft: authorSuccessorMock }
})

import { POST as cloneCurrentDraft } from '@/app/api/programme-verdicts/drafts/route'
import { POST as authorCompleteSuccessor } from '@/app/api/programme-verdicts/successors/route'
import { POST as preparePresentation } from '@/app/api/programme-verdicts/[id]/prepare/route'
import { PUT as replacePresentation } from '@/app/api/programme-verdicts/[id]/presentation/route'
import { resetRateLimits } from '@/lib/rate-limit'
import { ProgrammeFirstVerdictAuthoringError } from '@/lib/queries/programme-first-verdict-authoring'
import { AuthError } from '@/lib/session'
import { firstVerdictBundleFixture } from '@/tests/setup/programme-first-verdict-bundle'

function request(method: 'POST' | 'PUT', pathname: string, body: unknown): Request {
  return new Request(`http://localhost${pathname}`, {
    method,
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '198.51.100.17',
      'user-agent': 'programme-presentation-route-test',
    },
    body: JSON.stringify(body),
  })
}

const context = { params: Promise.resolve({ id: 'verdict-route-test' }) }

beforeEach(() => {
  resetRateLimits()
  requireUserMock.mockReset()
  authorSuccessorMock.mockReset()
})

describe('protected canonical presentation authoring routes', () => {
  it.each([
    [
      'clone-current draft',
      () => cloneCurrentDraft(request('POST', '/api/programme-verdicts/drafts', {})),
    ],
    [
      'prepare',
      () =>
        preparePresentation(
          request('POST', '/api/programme-verdicts/verdict-route-test/prepare', {}),
          context,
        ),
    ],
    [
      'complete successor authoring',
      () =>
        authorCompleteSuccessor(
          request('POST', '/api/programme-verdicts/successors', {
            schemaVersion: 'programme-first-verdict-authoring/v1',
          }),
        ),
    ],
  ])('requires a signed-in user before %s', async (_label, callRoute) => {
    requireUserMock.mockRejectedValueOnce(new AuthError('unauthenticated', 'Sign in to continue.'))

    const response = await callRoute()

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toMatchObject({ code: 'unauthenticated' })
  })

  it('returns 422 for an unknown server-owned presentation key before any database write', async () => {
    requireUserMock.mockResolvedValueOnce({ id: 'steward-route-test' })
    const response = await replacePresentation(
      request('PUT', '/api/programme-verdicts/verdict-route-test/presentation', {
        mechanismSteps: [
          {
            stepKey: 'delivery',
            stepOrder: 1,
            plainTitle: 'Delivery',
            plainDescription: 'Delivery is supported by the exact stored statement.',
            technicalDescription: null,
            evidenceBasis: 'UNKNOWN',
            claimLinks: [{ claimId: 'claim-route-test', relationship: 'SUPPORTS' }],
          },
          {
            stepKey: 'target',
            stepOrder: 2,
            plainTitle: 'Target',
            plainDescription: 'Target engagement is supported by the exact stored statement.',
            technicalDescription: null,
            evidenceBasis: 'UNKNOWN',
            claimLinks: [{ claimId: 'claim-route-test', relationship: 'SUPPORTS' }],
          },
          {
            stepKey: 'outcome',
            stepOrder: 3,
            plainTitle: 'Outcome',
            plainDescription: 'The outcome is supported by the exact stored statement.',
            technicalDescription: null,
            evidenceBasis: 'UNKNOWN',
            claimLinks: [{ claimId: 'claim-route-test', relationship: 'SUPPORTS' }],
          },
        ],
        timelineEvents: [],
        proposalDigest: 'caller-owned-values-are-forbidden',
      }),
      context,
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toMatchObject({ code: 'invalid_input' })
  })

  it('returns 422 when clone-current receives a caller-owned lineage key', async () => {
    requireUserMock.mockResolvedValueOnce({ id: 'steward-route-test' })
    const response = await cloneCurrentDraft(
      request('POST', '/api/programme-verdicts/drafts', {
        programmeId: 'programme-route-test',
        conflictsOfInterest: 'No conflicts declared.',
        previousVerdictRevisionId: 'caller-cannot-choose-this',
      }),
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toMatchObject({ code: 'invalid_input' })
  })

  it('rejects caller-owned successor lineage and status fields before any database write', async () => {
    requireUserMock.mockResolvedValueOnce({ id: 'steward-route-test' })
    const bundle = firstVerdictBundleFixture({
      programmeId: 'programme-route-test',
      programmeTrialId: 'trial-route-test',
      sourceSnapshotId: 'snapshot-route-test',
    })
    const response = await authorCompleteSuccessor(
      request('POST', '/api/programme-verdicts/successors', {
        ...bundle,
        previousVerdictRevisionId: 'caller-cannot-choose-this',
        reviewStatus: 'PUBLISHED',
      }),
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toMatchObject({ code: 'invalid_input' })
    expect(authorSuccessorMock).not.toHaveBeenCalled()
  })

  it.each([
    {
      status: 403,
      code: 'successor_draft_not_authorized',
      message: 'Only a steward or administrator may author a complete successor draft.',
    },
    {
      status: 409,
      code: 'successor_draft_current_publication_required',
      message:
        'A published canonical bundle is required before a complete successor can be authored.',
    },
    {
      status: 409,
      code: 'successor_draft_candidate_conflict',
      message: 'A different active successor already exists for the current public bundle.',
    },
    {
      status: 422,
      code: 'successor_draft_validation_engine_blocked',
      message: 'RNA Intelligence blocked this complete successor bundle.',
    },
  ])(
    'preserves the service status and stable code for $code',
    async ({ status, code, message }) => {
      requireUserMock.mockResolvedValueOnce({ id: 'signed-in-but-service-decides-role' })
      authorSuccessorMock.mockRejectedValueOnce(
        new ProgrammeFirstVerdictAuthoringError(status, message, code),
      )
      const bundle = firstVerdictBundleFixture({
        programmeId: 'programme-route-test',
        programmeTrialId: 'trial-route-test',
        sourceSnapshotId: 'snapshot-route-test',
      })

      const response = await authorCompleteSuccessor(
        request('POST', '/api/programme-verdicts/successors', bundle),
      )

      expect(response.status).toBe(status)
      await expect(response.json()).resolves.toEqual({ error: message, code })
      expect(authorSuccessorMock).toHaveBeenCalledWith({
        actorUserId: 'signed-in-but-service-decides-role',
        bundle,
        commit: true,
      })
    },
  )
})
