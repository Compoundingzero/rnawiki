import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

const getPublicHistoryMock = vi.hoisted(() => vi.fn())

vi.mock('@/components/AppShell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => children,
}))

vi.mock('@/lib/session', () => ({
  getCurrentUser: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/lib/queries/public-programme-verdict-history', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/lib/queries/public-programme-verdict-history')>()
  return { ...actual, getPublicProgrammeVerdictHistory: getPublicHistoryMock }
})

import ProgrammeVerdictHistoryPage from '@/app/d/[slug]/programme/[programme]/history/page'
import { EVIDENCE_REVIEW_STATUSES } from '@/lib/evidence/types'
import {
  PUBLIC_PROGRAMME_VERDICT_HISTORY_STATUSES,
  isPublicProgrammeVerdictHistoryStatus,
  type PublicProgrammeVerdictHistoryRevision,
} from '@/lib/queries/public-programme-verdict-history'

;(globalThis as typeof globalThis & { React: typeof React }).React = React

function publishedRevision(): PublicProgrammeVerdictHistoryRevision {
  const presentationSource = {
    sourceId: 'source-history-1',
    sourceSnapshotId: 'snapshot-history-1',
    sourceType: 'CLINICAL_TRIAL_REGISTRY' as const,
    externalIdentifier: 'NCT00000000',
    canonicalLocator: 'https://clinicaltrials.gov/study/NCT00000000',
    title: 'Exact historical registry source',
    publisher: 'ClinicalTrials.gov',
    publicationDate: '2026-08-20',
    retrievedAt: '2026-08-21T03:00:00.000Z',
    contentHash: 'f'.repeat(64),
    claimBindings: [
      {
        claimId: 'history-claim-1',
        relationship: 'SUPPORTS' as const,
        plainLanguageText: 'The saved source supports this historical statement.',
      },
    ],
  }

  return {
    id: 'published-revision-2',
    revisionNumber: 2,
    previousVerdictRevisionId: null,
    status: 'PUBLISHED',
    isCurrent: true,
    programmeStatusAtReview: 'ACTIVE',
    verdictCode: null,
    publicLabel: 'The evidence supports continued study',
    professionalLabel: 'Continued clinical development remains evidence-supported',
    scope: {
      indication: 'Condition alpha',
      population: 'Adults with condition alpha',
      doseExposure: 'The studied dose',
      period: '2025 to 2026',
      trials: 'NCT00000000',
      outcome: 'The study-defined patient outcome',
    },
    oneSentenceReason: 'The published studies support this programme-scoped conclusion.',
    confidence: 'MODERATE',
    confidenceExplanation: 'Two qualified reviewers checked the same evidence record.',
    authorName: 'Conclusion Author',
    authorHandle: 'conclusion-author',
    authorConflictsOfInterest: 'None declared',
    engineVersion: 'rna-intelligence/2.0.0',
    inputDigestAlgorithm: 'sha256',
    inputDigest: 'a'.repeat(64),
    createdAt: '2026-08-21T00:00:00.000Z',
    reviewedAt: '2026-08-22T00:00:00.000Z',
    publishedAt: '2026-08-23T00:00:00.000Z',
    supersededAt: null,
    presentation: {
      schemaVersion: 'programme-presentation/v1',
      mechanismSteps: [
        {
          stepKey: 'delivery',
          stepOrder: 1,
          plainTitle: 'The medicine reaches the intended cells',
          plainDescription: 'The reviewed source records delivery to the intended tissue.',
          technicalDescription: 'Stored technical delivery detail.',
          evidenceBasis: 'MEASURED_IN_PEOPLE',
          claimLinks: [{ claimId: 'history-claim-1', relationship: 'SUPPORTS' }],
          sources: [presentationSource],
        },
        {
          stepKey: 'target',
          stepOrder: 2,
          plainTitle: 'It changes the intended target',
          plainDescription: 'The target change was measured outside people.',
          technicalDescription: null,
          evidenceBasis: 'MEASURED_OUTSIDE_PEOPLE',
          claimLinks: [{ claimId: 'history-claim-1', relationship: 'SUPPORTS' }],
          sources: [presentationSource],
        },
        {
          stepKey: 'effect',
          stepOrder: 3,
          plainTitle: 'A later effect is predicted',
          plainDescription: 'This stage remains a prediction in this version.',
          technicalDescription: null,
          evidenceBasis: 'PREDICTED',
          claimLinks: [{ claimId: 'history-claim-1', relationship: 'SUPPORTS' }],
          sources: [presentationSource],
        },
      ],
      timelineEvents: [
        {
          eventKey: 'history-result',
          eventDate: '2026-08-20',
          eventType: 'IMPORTANT_RESULT',
          dateBasis: 'ACTUAL',
          plainTitle: 'A result changed the reviewed conclusion',
          plainDescription: 'The saved registry source reported the decision-changing result.',
          technicalDescription: null,
          programmeTrialId: 'history-trial-1',
          sourceId: 'source-history-1',
          sourceSnapshotId: 'snapshot-history-1',
          claimLinks: [{ claimId: 'history-claim-1', relationship: 'SUPPORTS' }],
          source: presentationSource,
        },
      ],
    },
    reviews: [
      {
        id: 'review-public-1',
        reviewerName: 'Reviewer One',
        reviewerOrcid: '0000-0002-1825-0097',
        expertiseTags: ['CLINICAL_DEVELOPMENT'],
        decision: 'APPROVE',
        isIndependent: true,
        conflictsOfInterest: 'None declared',
        reviewNote: null,
        reviewedAt: '2026-08-22T00:00:00.000Z',
      },
      {
        id: 'review-public-2',
        reviewerName: 'Reviewer Two',
        reviewerOrcid: null,
        expertiseTags: ['BIOSTATISTICS'],
        decision: 'CHANGES_REQUESTED',
        isIndependent: true,
        conflictsOfInterest: 'None declared',
        reviewNote: 'The population wording needed a narrower scope.',
        reviewedAt: '2026-08-22T01:00:00.000Z',
      },
    ],
    adjudication: {
      adjudicatorName: 'Independent Steward',
      adjudicatorOrcid: '0000-0001-5109-3700',
      expertiseTags: ['REGULATORY_SCIENCE', 'BIOSTATISTICS'],
      decision: 'APPROVE',
      rationale: 'The narrower population wording resolves the reviewer concern.',
      conflictsOfInterest: 'No relevant interests',
      adjudicatedAt: '2026-08-22T02:00:00.000Z',
    },
  }
}

async function renderHistoryPage(
  revision: PublicProgrammeVerdictHistoryRevision,
  programmeSlug: string,
): Promise<string> {
  getPublicHistoryMock.mockResolvedValue({
    medicine: { slug: 'history-medicine', name: 'History medicine' },
    programme: {
      slug: programmeSlug,
      title: 'History programme',
      indication: 'Condition alpha',
      targetPopulation: 'Adults with condition alpha',
      status: 'ACTIVE',
    },
    revisions: [revision],
  })
  const page = await ProgrammeVerdictHistoryPage({
    params: Promise.resolve({ slug: 'history-medicine', programme: programmeSlug }),
  })
  return renderToStaticMarkup(page)
}

describe('public programme verdict history boundary', () => {
  it('allows exactly published and superseded revisions', () => {
    expect(EVIDENCE_REVIEW_STATUSES.filter(isPublicProgrammeVerdictHistoryStatus)).toEqual([
      'PUBLISHED',
      'SUPERSEDED',
    ])
    expect(PUBLIC_PROGRAMME_VERDICT_HISTORY_STATUSES).toEqual(['PUBLISHED', 'SUPERSEDED'])
  })

  it('does not expose any pre-publication review state', () => {
    const privateStatuses = [
      'DRAFT',
      'MACHINE_CHECKED',
      'AWAITING_REVIEW',
      'CHANGES_REQUESTED',
      'APPROVED',
    ] as const

    for (const status of privateStatuses) {
      expect(isPublicProgrammeVerdictHistoryStatus(status)).toBe(false)
    }
  })

  it('explains a disagreement and renders only the safe attributed adjudication record', async () => {
    const html = await renderHistoryPage(publishedRevision(), 'disagreement-programme')

    expect(html).toContain('How a review disagreement was settled')
    expect(html).toContain('same proposed conclusion and evidence record')
    expect(html).toContain('Independent Steward')
    expect(html).toContain('Approved for publication')
    expect(html).toContain('https://orcid.org/0000-0001-5109-3700')
    expect(html).toContain('Regulatory science, Biostatistics')
    expect(html).toContain('The narrower population wording resolves the reviewer concern.')
    expect(html).toContain('No relevant interests')
    expect(html).toContain('Decision recorded 22 August 2026, 02:00 UTC')
    expect(html).toContain('ORCID 0000-0002-1825-0097')
    expect(html).toContain('Scientific qualifications used: Clinical development')
    expect(html).toContain('Scientific qualifications used: Biostatistics')
    expect(html).toContain('data-testid="revision-2-reviewer-1-orcid"')
    expect(html).toContain('data-testid="revision-2-adjudication"')
    expect(html).not.toContain('adjudicatorUserId')
  })

  it('does not invent a disagreement explanation when the two public reviews agree', async () => {
    const revision = publishedRevision()
    revision.reviews[1] = { ...revision.reviews[1]!, decision: 'APPROVE' }
    revision.adjudication = null

    const html = await renderHistoryPage(revision, 'agreement-programme')

    expect(html).not.toContain('How a review disagreement was settled')
    expect(html).not.toContain('No separate adjudication record')
  })

  it('shows the exact mechanism, source event, and saved source-version rows for a revision', async () => {
    const html = await renderHistoryPage(publishedRevision(), 'presentation-programme')

    expect(html).toContain('data-testid="history-presentation-snapshot"')
    expect(html.match(/data-testid="history-mechanism-stage"/g)).toHaveLength(3)
    expect(html).toContain('The medicine reaches the intended cells')
    expect(html).toContain('Evidence: Measured in people')
    expect(html).toContain('“Measured in people” comes from a human study')
    expect(html).toContain('“Not yet known” means the reviewed sources do not establish it')
    expect(html).toContain(
      'RNA Intelligence checks that the stage has a linked statement and saved source version',
    )
    expect(html).toContain('A result changed the reviewed conclusion')
    expect(html).toContain('Important result · Date occurred')
    expect(html).toContain('“planned date” is a schedule, not a completed event')
    expect(html).toContain('data-testid="history-timeline-event"')
    expect(html).toContain('Exact historical registry source')
    expect(html).toContain('Exact source version saved 21 August 2026, 03:00 UTC')
    expect(html).toContain('Technical source-version details')
    expect(html).toContain('Saved version snapshot-history-1')
    expect(html).toContain(`Source fingerprint sha256:${'f'.repeat(64)}`)
    expect(html).toContain('href="https://clinicaltrials.gov/study/NCT00000000"')
  })

  it('keeps a pre-presentation historical revision quiet instead of showing an empty module', async () => {
    const revision = publishedRevision()
    revision.presentation = null

    const html = await renderHistoryPage(revision, 'older-programme')

    expect(html).not.toContain('data-testid="history-presentation-snapshot"')
    expect(html).not.toContain('Mechanism map in this version')
    expect(html).not.toContain('Source events in this version')
  })
})
