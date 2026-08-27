import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

import {
  blankPrivateReviewFields,
  ContributionReviewPanel,
  contributionReviewNeedsNote,
  contributionReviewStatusMessage,
  isCurrentReviewRequest,
} from '@/app/review-queue/ContributionReviewPanel'
import { AppProvider } from '@/components/app-context'
import type {
  ContributionAdjudicationView,
  ContributionReviewStateView,
  ContributionReviewView,
} from '@/lib/contributions/review-types'
import type { CommentUser } from '@/lib/types'

;(globalThis as typeof globalThis & { React: typeof React }).React = React

function state(
  status: ContributionReviewStateView['status'],
  reviewCount: number,
  requiredReviewCount = 3,
): ContributionReviewStateView {
  return {
    status,
    reviewCount,
    requiredReviewCount,
    consensus:
      status === 'ACCEPTED_FOR_IMPLEMENTATION'
        ? 'APPROVE'
        : status === 'CHANGES_REQUESTED'
          ? 'CHANGES_REQUESTED'
          : status === 'REJECTED'
            ? 'REJECT'
            : null,
    updatedAt: '2026-08-22T06:00:00.000Z',
    resolvedAt: status === 'REJECTED' ? '2026-08-22T06:00:00.000Z' : null,
  }
}

function review(
  id: string,
  name: string,
  decision: ContributionReviewView['decision'],
): ContributionReviewView {
  return {
    id,
    reviewer: { name, handle: name.toLowerCase().replace(' ', '-') },
    expertiseTags: ['CLINICAL_PHARMACOLOGY'],
    decision,
    independenceAttested: true,
    conflictsOfInterest: 'None',
    conflictsOfInterestAttested: true,
    reviewNote: decision === 'APPROVE' ? null : 'The scope does not match the cited population.',
    reviewedAt: '2026-08-22T05:30:00.000Z',
  }
}

function renderPanel(
  initialState: ContributionReviewStateView,
  publicReviews: ContributionReviewView[] = [],
  publicAdjudication: ContributionAdjudicationView | null = null,
  initialUser: CommentUser | null = null,
): string {
  return renderToStaticMarkup(
    React.createElement(
      AppProvider,
      { initialUser } as React.ComponentProps<typeof AppProvider>,
      React.createElement(ContributionReviewPanel, {
        proposalId: 'proposal-1',
        medicineName: 'Synthetic medicine',
        initialState,
        publicReviews,
        publicAdjudication,
      }),
    ),
  )
}

describe('ContributionReviewPanel', () => {
  it('server-renders a real sign-in action for a signed-out pending review', () => {
    const html = renderPanel(state('AWAITING_REVIEWS', 0))

    expect(html).toContain('Awaiting three independent reviews')
    expect(html).toContain('0 of 3 independent reviews recorded')
    expect(html).toContain('Sign in to review')
    expect(html).not.toContain('Submit independent review')
  })

  it('describes the frozen two-review policy for a state opened before migration 0015', () => {
    expect(contributionReviewStatusMessage(state('AWAITING_REVIEWS', 0, 2))).toBe(
      'Awaiting two independent reviews. No public record has changed.',
    )
  })

  it('explains the pending third decision without exposing the recorded agreement direction', () => {
    const html = renderPanel(state('AWAITING_THIRD_REVIEW', 2))

    expect(html).toContain(
      'Two agreeing independent reviews are recorded; the third decision remains pending.',
    )
    expect(html).toContain('2 of 3 independent reviews recorded')
    expect(html).toContain('Sign in to review')
  })

  it('server-renders the eligibility gate label for a signed-in reviewer', () => {
    const html = renderPanel(state('AWAITING_SECOND_REVIEW', 1), [], null, {
      id: 'reviewer-1',
      name: 'Reviewer One',
      email: 'reviewer@example.test',
      trustTier: 'trusted',
    })

    expect(html).toContain('Review this proposal')
    expect(html).not.toContain('Sign in to review')
    expect(html).not.toContain('Submit independent review')
  })

  it('makes accepted-for-implementation semantics explicit without implying publication', () => {
    expect(contributionReviewStatusMessage(state('ACCEPTED_FOR_IMPLEMENTATION', 2))).toBe(
      'Reviewers accepted this proposal for RNAWiki staff to apply. It has not changed the public record.',
    )
  })

  it('explains disagreement and change-request states without relying on workflow jargon', () => {
    expect(contributionReviewStatusMessage(state('DISAGREEMENT', 2))).toContain(
      'make the final decision; this step is called adjudication',
    )
    expect(contributionReviewStatusMessage(state('CHANGES_REQUESTED', 2))).toBe(
      'Reviewers requested changes. The submitted version cannot be edited, and the public record is unchanged.',
    )
  })

  it('requires actionable notes for change requests and rejections only', () => {
    expect(contributionReviewNeedsNote('APPROVE')).toBe(false)
    expect(contributionReviewNeedsNote('CHANGES_REQUESTED')).toBe(true)
    expect(contributionReviewNeedsNote('REJECT')).toBe(true)
  })

  it('rejects delayed reads from an old request or signed-in account scope', () => {
    expect(
      isCurrentReviewRequest({
        requestGeneration: 3,
        currentRequestGeneration: 3,
        scopeGeneration: 7,
        currentScopeGeneration: 7,
      }),
    ).toBe(true)
    expect(
      isCurrentReviewRequest({
        requestGeneration: 2,
        currentRequestGeneration: 3,
        scopeGeneration: 7,
        currentScopeGeneration: 7,
      }),
    ).toBe(false)
    expect(
      isCurrentReviewRequest({
        requestGeneration: 3,
        currentRequestGeneration: 3,
        scopeGeneration: 6,
        currentScopeGeneration: 7,
      }),
    ).toBe(false)
  })

  it('clears every private reviewer and adjudicator field for a new account scope', () => {
    expect(blankPrivateReviewFields()).toEqual({
      decision: '',
      expertise: [],
      independenceAttested: false,
      conflictsOfInterest: '',
      conflictsOfInterestAttested: false,
      reviewNote: '',
      adjudicationDecision: '',
      adjudicationExpertise: [],
      adjudicationRationale: '',
      adjudicationCoi: '',
      adjudicationCoiAttested: false,
    })
    expect(blankPrivateReviewFields().expertise).not.toBe(blankPrivateReviewFields().expertise)
  })

  it('server-renders the safe independent-review and adjudication audit once public', () => {
    const adjudication: ContributionAdjudicationView = {
      id: 'adjudication-1',
      adjudicator: { name: 'Steward Three', handle: 'steward-three' },
      expertiseTags: ['REGULATORY_SCIENCE'],
      decision: 'REJECT',
      rationale: 'The source does not support the proposed programme-wide scope.',
      conflictsOfInterest: 'None',
      conflictsOfInterestAttested: true,
      adjudicatedAt: '2026-08-22T06:00:00.000Z',
    }
    const html = renderPanel(
      state('REJECTED', 2),
      [review('review-1', 'Reviewer One', 'APPROVE'), review('review-2', 'Reviewer Two', 'REJECT')],
      adjudication,
    )

    expect(html).toContain('Independent reviews')
    expect(html).toContain('Reviewer One')
    expect(html).toContain('Reviewer Two')
    expect(html).toContain('Steward’s final decision: Reject')
    expect(html).toContain('Steward Three')
    expect(html).toContain(adjudication.rationale)
    expect(html).not.toContain('Sign in to review')
    expect(html).not.toContain('COI disclosure attested')
  })
})
