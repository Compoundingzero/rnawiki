import * as React from 'react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import {
  AuthorReviewFeedback,
  contributionDialogCloseDisabled,
  contributionsBoundToSourceTask,
  contributionRevisionWorkspace,
  isRevisableContributionReviewStatus,
  isStoppedProgrammeStatus,
  readerFieldLabel,
  replacementChannels,
  selectedProgrammeMatchesContext,
  sourcePreview,
  sourceTaskPrefillFromSearch,
  splitStructuredList,
} from '@/components/DossierContributionActions'
import type {
  ContributionReviewStateView,
  PublicContributionReviewAudit,
} from '@/lib/contributions/review-types'

;(globalThis as typeof globalThis & { React: typeof React }).React = React

const componentSource = readFileSync(
  join(process.cwd(), 'components/DossierContributionActions.tsx'),
  'utf8',
)

type Proposal = Parameters<typeof contributionRevisionWorkspace>[0][number]

function reviewAudit(status: ContributionReviewStateView['status']): PublicContributionReviewAudit {
  return {
    reviewState: {
      status,
      reviewCount: 2,
      requiredReviewCount: 2,
      consensus:
        status === 'CHANGES_REQUESTED'
          ? 'CHANGES_REQUESTED'
          : status === 'REJECTED'
            ? 'REJECT'
            : status === 'ACCEPTED_FOR_IMPLEMENTATION'
              ? 'APPROVE'
              : null,
      updatedAt: '2026-08-22T07:00:00.000Z',
      resolvedAt:
        status === 'CHANGES_REQUESTED' ||
        status === 'REJECTED' ||
        status === 'ACCEPTED_FOR_IMPLEMENTATION'
          ? '2026-08-22T07:00:00.000Z'
          : null,
    },
    reviews: [
      {
        id: 'review-1',
        reviewer: { name: 'Reviewer One', handle: 'reviewer-one', orcid: '0000-0001-2345-6789' },
        expertiseTags: ['CLINICAL_PHARMACOLOGY'],
        decision: status === 'REJECTED' ? 'REJECT' : 'CHANGES_REQUESTED',
        independenceAttested: true,
        conflictsOfInterest: 'No conflicts declared.',
        conflictsOfInterestAttested: true,
        reviewNote: 'Narrow the proposed conclusion to the population in the cited source.',
        reviewedAt: '2026-08-22T06:30:00.000Z',
      },
    ],
    adjudication: null,
  }
}

function proposal(overrides: Partial<Proposal> = {}): Proposal {
  return {
    id: 'proposal-1',
    proposalKey: 'lineage-1',
    revisionNumber: 1,
    previousProposalId: null,
    status: 'SUBMITTED',
    proposalType: 'CORRECTION',
    review: reviewAudit('CHANGES_REQUESTED'),
    ...overrides,
  }
}

describe('dossier contribution helpers', () => {
  it('keeps non-idempotent writes open and clears both write locks before a fresh open', () => {
    expect(contributionDialogCloseDisabled(false, false)).toBe(false)
    expect(contributionDialogCloseDisabled(true, false)).toBe(true)
    expect(contributionDialogCloseDisabled(false, true)).toBe(true)
    expect(contributionDialogCloseDisabled(true, true)).toBe(true)
    expect(componentSource).toMatch(
      /const open = useCallback\([\s\S]*setIsSaving\(false\)[\s\S]*setIsRevising\(false\)[\s\S]*showModal\(\)/,
    )
    expect(componentSource).toContain('if (dialogCloseIsDisabled) return')
    expect(componentSource).toContain('if (dialogCloseIsDisabled) event.preventDefault()')
    expect(componentSource).toContain('disabled={dialogCloseIsDisabled}')
    expect(componentSource).toContain('if (dialogRef.current?.open) dialogRef.current.close()')
  })
  it.each(['STOPPED', 'stopped', ' Withdrawn '])(
    'allows a stopped-programme classification for %s',
    (status) => {
      expect(isStoppedProgrammeStatus(status)).toBe(true)
    },
  )

  it.each(['ACTIVE', 'COMPLETED', 'UNKNOWN', ''])(
    'does not offer a stopped-programme classification for %s',
    (status) => {
      expect(isStoppedProgrammeStatus(status)).toBe(false)
    },
  )

  it('matches a selected programme route slug without confusing it with the database id', () => {
    expect(
      selectedProgrammeMatchesContext('cardiovascular-outcomes', {
        id: 'programme-db-id',
        slug: 'cardiovascular-outcomes',
      }),
    ).toBe(true)
    expect(
      selectedProgrammeMatchesContext('programme-db-id', {
        id: 'programme-db-id',
        slug: 'cardiovascular-outcomes',
      }),
    ).toBe(true)
    expect(
      selectedProgrammeMatchesContext('different-programme', {
        id: 'programme-db-id',
        slug: 'cardiovascular-outcomes',
      }),
    ).toBe(false)
  })

  it('previews only the address supplied by the contributor without inventing metadata', () => {
    expect(sourcePreview('https://www.clinicaltrials.gov/study/NCT01234567?tab=results')).toEqual({
      label: 'clinicaltrials.gov',
      detail: '/study/NCT01234567?tab=results',
      isUrl: true,
    })
    expect(sourcePreview('10.1000/example')).toEqual({
      label: 'Source identifier entered',
      detail: '10.1000/example',
      isUrl: false,
    })
    expect(sourcePreview('')).toBeNull()
  })

  it('accepts only a complete task, trigger-snapshot, and source binding from the review queue', () => {
    const query = new URLSearchParams({
      contribute: 'correction',
      sourceTask: 'task-1',
      sourceSnapshot: 'snapshot-1',
      sourceType: 'CLINICAL_TRIAL_REGISTRY',
      sourceLocator: 'https://clinicaltrials.gov/study/NCT01234567',
      sourceIdentifier: 'NCT01234567',
      sourceField: 'programme.status',
    })

    expect(sourceTaskPrefillFromSearch(`?${query.toString()}`)).toEqual({
      taskId: 'task-1',
      snapshotId: 'snapshot-1',
      sourceType: 'CLINICAL_TRIAL_REGISTRY',
      sourceLocator: 'https://clinicaltrials.gov/study/NCT01234567',
      sourceIdentifier: 'NCT01234567',
      selectedField: 'programme.status',
    })

    for (const field of ['sourceTask', 'sourceSnapshot', 'sourceType', 'sourceIdentifier']) {
      const incomplete = new URLSearchParams(query)
      incomplete.delete(field)
      expect(sourceTaskPrefillFromSearch(`?${incomplete.toString()}`)).toBeNull()
    }

    const unsafe = new URLSearchParams(query)
    unsafe.set('sourceLocator', 'javascript:alert(1)')
    expect(sourceTaskPrefillFromSearch(`?${unsafe.toString()}`)).toBeNull()
  })

  it('ignores an unsupported affected field without losing an otherwise valid source task', () => {
    const query = new URLSearchParams({
      contribute: 'correction',
      sourceTask: 'task-1',
      sourceSnapshot: 'snapshot-1',
      sourceType: 'REGULATORY_RECORD',
      sourceLocator: 'https://example.test/regulatory-record',
      sourceIdentifier: 'record-1',
      sourceField: 'verdict.publicLabel',
    })

    expect(sourceTaskPrefillFromSearch(`?${query.toString()}`)?.selectedField).toBe('')
    query.set('contribute', 'challenge')
    expect(sourceTaskPrefillFromSearch(`?${query.toString()}`)).toBeNull()
  })

  it('does not repurpose an unrelated private proposal for a source-review task', () => {
    const unrelated = proposal({
      id: 'unrelated-draft',
      status: 'DRAFT',
      review: null,
      source: {
        type: 'CLINICAL_TRIAL_REGISTRY',
        locator: 'https://example.test/unrelated',
        identifier: 'unrelated',
        reviewTaskId: 'another-task',
        reviewSnapshotId: 'another-snapshot',
      },
    })
    const bound = proposal({
      id: 'bound-draft',
      status: 'DRAFT',
      review: null,
      source: {
        type: 'CLINICAL_TRIAL_REGISTRY',
        locator: 'https://example.test/bound',
        identifier: 'bound',
        reviewTaskId: 'task-1',
        reviewSnapshotId: 'snapshot-1',
      },
    })

    expect(
      contributionsBoundToSourceTask([unrelated, bound], 'task-1', 'snapshot-1').map(
        (item) => item.id,
      ),
    ).toEqual(['bound-draft'])
    expect(contributionsBoundToSourceTask([unrelated], 'task-1', 'snapshot-1')).toEqual([])
  })

  it('normalizes structured list replacements without inventing items', () => {
    expect(splitStructuredList('  First finding  \n\nSecond finding\n ')).toEqual([
      'First finding',
      'Second finding',
    ])
  })

  it('uses one mutually exclusive replacement channel for each field value kind', () => {
    expect(
      replacementChannels({
        kind: 'text',
        proposedText: ' Narrower wording ',
        proposedValueText: 'IGNORED',
        proposedStoppedVerdict: 'IDEA_FAILED',
      }),
    ).toEqual({
      proposedText: 'Narrower wording',
      proposedValue: null,
      proposedStoppedVerdict: null,
    })
    expect(
      replacementChannels({
        kind: 'list',
        proposedText: 'IGNORED',
        proposedValueText: 'One\nTwo',
        proposedStoppedVerdict: 'IDEA_FAILED',
      }),
    ).toEqual({
      proposedText: null,
      proposedValue: ['One', 'Two'],
      proposedStoppedVerdict: null,
    })
    expect(
      replacementChannels({
        kind: 'enum',
        proposedText: 'IGNORED',
        proposedValueText: 'STOPPED',
        proposedStoppedVerdict: 'IDEA_FAILED',
      }),
    ).toEqual({
      proposedText: null,
      proposedValue: 'STOPPED',
      proposedStoppedVerdict: null,
    })
    expect(
      replacementChannels({
        kind: 'stoppedVerdict',
        proposedText: 'IGNORED',
        proposedValueText: 'IGNORED',
        proposedStoppedVerdict: 'MOLECULE_FAILED',
      }),
    ).toEqual({
      proposedText: null,
      proposedValue: null,
      proposedStoppedVerdict: 'MOLECULE_FAILED',
    })
    expect(
      replacementChannels({
        kind: 'list',
        proposedText: '',
        proposedValueText: '  \n ',
        proposedStoppedVerdict: '',
      }).proposedValue,
    ).toBeNull()
  })

  it('translates stored field names into reader-facing labels without changing their keys', () => {
    expect(readerFieldLabel('programme.targetPopulation', 'Target population')).toBe(
      'People included',
    )
    expect(readerFieldLabel('verdict.professionalLabel', 'Professional verdict label')).toBe(
      'Clinical classification',
    )
    expect(readerFieldLabel('evidenceNode.state', 'Evidence-node state')).toBe(
      'Evidence-step status',
    )
    expect(readerFieldLabel('unknown.field', 'Server label')).toBe('Server label')
  })

  it.each(['CHANGES_REQUESTED', 'REJECTED'] as const)(
    'allows the server-approved terminal %s state to start a lineage revision',
    (status) => {
      expect(isRevisableContributionReviewStatus(status)).toBe(true)
    },
  )

  it.each([
    'AWAITING_REVIEWS',
    'AWAITING_SECOND_REVIEW',
    'DISAGREEMENT',
    'ACCEPTED_FOR_IMPLEMENTATION',
  ] as const)('keeps the %s state immutable', (status) => {
    expect(isRevisableContributionReviewStatus(status)).toBe(false)
    expect(
      contributionRevisionWorkspace([proposal({ review: reviewAudit(status) })], 'CORRECTION'),
    ).toEqual({ draft: null, feedbackParent: null })
  })

  it('selects a terminal adverse leaf as reviewer feedback instead of creating a fresh root', () => {
    const reviewed = proposal()

    expect(contributionRevisionWorkspace([reviewed], 'CORRECTION')).toEqual({
      draft: null,
      feedbackParent: reviewed,
    })
  })

  it('restores the existing next revision and links it to its reviewed parent', () => {
    const reviewed = proposal()
    const nextDraft = proposal({
      id: 'proposal-2',
      revisionNumber: 2,
      previousProposalId: reviewed.id,
      status: 'DRAFT',
      review: null,
    })

    expect(contributionRevisionWorkspace([nextDraft, reviewed], 'CORRECTION')).toEqual({
      draft: nextDraft,
      feedbackParent: reviewed,
    })
  })

  it('shows attributed actionable feedback and the explicit revise action', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuthorReviewFeedback, {
        proposal: proposal(),
        draftOpen: false,
        isRevising: false,
        onRevise: vi.fn(),
      }),
    )

    expect(html).toContain('Reviewer feedback on version 1')
    expect(html).toContain('Reviewer One')
    expect(html).toContain('Narrow the proposed conclusion')
    expect(html).toContain('No conflicts declared.')
    expect(html).toContain('Revise proposal')
  })

  it('shows an existing lineage draft without offering another revision action', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuthorReviewFeedback, {
        proposal: proposal({ review: reviewAudit('REJECTED') }),
        draftOpen: true,
        isRevising: false,
        onRevise: vi.fn(),
      }),
    )

    expect(html).toContain('A new editable version is open below')
    expect(html).not.toContain('>Revise proposal<')
  })
})
