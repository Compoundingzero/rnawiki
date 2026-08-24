import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

import {
  isCurrentSourceRefreshMutation,
  sourceRefreshPrivateScopeKey,
  SourceRefreshAuthoringPanel,
} from '@/app/review-queue/SourceRefreshAuthoringPanel'
import { AppProvider } from '@/components/app-context'
import type { PublicSourceReviewTask } from '@/lib/queries/public-source-review-tasks'
import type { CommentUser } from '@/lib/types'

;(globalThis as typeof globalThis & { React: typeof React }).React = React

function task(action: 'CANONICAL_REFRESH' | 'NEEDS_SCIENTIFIC_REVISION'): PublicSourceReviewTask {
  return {
    id: 'task-1',
    category: 'SOURCE_FRESHNESS_UPDATE',
    medicine: { slug: 'medicine-one', name: 'Medicine one' },
    programme: { id: 'programme-1', slug: 'programme-one', title: 'Programme one' },
    status: 'OPEN',
    impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED',
    reason: 'The official registry changed.',
    affectedClaimIds: action === 'CANONICAL_REFRESH' ? [] : ['claim-1'],
    affectedSurfacePaths: ['TIMELINE:trial.overallStatus'],
    reviewSnapshotId: 'snapshot-new',
    sourceRefreshDeltaSnapshot: {
      version: 'rna-intelligence/source-refresh-delta-v1',
      reviewTaskId: 'task-1',
      programmeId: 'programme-1',
      sourceId: 'source-1',
      baselineSnapshotId: 'snapshot-old',
      pendingSnapshotId: 'snapshot-new',
      adapterKey: 'clinicaltrials.gov/v2',
      action,
      changedTrialFields: [
        {
          path: 'trial.overallStatus',
          before: 'RECRUITING',
          after: 'COMPLETED',
          risk: 'LOW_RISK_EXACT',
        },
      ],
      affectedClaimIds: action === 'CANONICAL_REFRESH' ? [] : ['claim-1'],
      affectedInterpretability: [],
      affectedSurfacePaths: ['TIMELINE:trial.overallStatus'],
      scientificRevisionRequirements:
        action === 'CANONICAL_REFRESH'
          ? []
          : [
              {
                kind: 'CLAIM',
                id: 'claim-1',
                fieldPath: 'claim.sourceSnapshot',
                reasonCode: 'LINKED_CLAIM_SOURCE_CHANGED',
              },
            ],
      deltaDigestAlgorithm: 'sha256',
      deltaDigest: 'a'.repeat(64),
    },
    source: {
      type: 'CLINICAL_TRIAL_REGISTRY',
      title: 'ClinicalTrials.gov record',
      identifier: 'NCT12345678',
      locator: 'https://clinicaltrials.gov/study/NCT12345678',
    },
    createdAt: '2026-08-23T00:00:00.000Z',
  }
}

function renderPanel(sourceTask: PublicSourceReviewTask, initialUser: CommentUser | null): string {
  return renderToStaticMarkup(
    React.createElement(
      AppProvider,
      { initialUser } as React.ComponentProps<typeof AppProvider>,
      React.createElement(SourceRefreshAuthoringPanel, { task: sourceTask }),
    ),
  )
}

describe('SourceRefreshAuthoringPanel', () => {
  it('offers only disclosure inputs for a parser-approved exact refresh', () => {
    const html = renderPanel(task('CANONICAL_REFRESH'), {
      id: 'author-1',
      name: 'Author One',
      email: 'author@example.test',
      isDoctor: false,
      trustTier: 'contributor',
    })

    expect(html).toContain('only exact fields parsed from ClinicalTrials.gov')
    expect(html).toContain('Build checked review draft')
    expect(html).toContain('Conflict-of-interest disclosure')
    expect(html.match(/<textarea/g)).toHaveLength(1)
    expect(html).not.toContain('Replacement wording')
    expect(html).not.toContain('Write the revised claim')
  })

  it('shows a plain scientific-revision stop and no submission form', () => {
    const html = renderPanel(task('NEEDS_SCIENTIFIC_REVISION'), null)

    expect(html).toContain('Stop here: this is more than an exact registry-data refresh.')
    expect(html).toContain('This task cannot update linked evidence statements automatically')
    expect(html).toContain('there is not yet a one-click form for this kind of revision')
    expect(html).toContain('A steward or administrator must author')
    expect(html).toContain(
      'Two independent qualified reviewers must approve that exact proposed record',
    )
    expect(html).toContain('relevant studies, evidence statements, evidence-chain')
    expect(html).toContain('mechanism map, any sourced timeline events, and conclusion')
    expect(html).toContain('A linked evidence statement needs a reviewed revision.')
    expect(html).not.toContain('<form')
    expect(html).not.toContain('<textarea')
    expect(html).not.toContain('Build checked review draft')
  })

  it('keeps a submitted task read-only after a server refresh', () => {
    const sourceTask = task('CANONICAL_REFRESH')
    const html = renderToStaticMarkup(
      React.createElement(
        AppProvider,
        { initialUser: null } as React.ComponentProps<typeof AppProvider>,
        React.createElement(SourceRefreshAuthoringPanel, {
          task: sourceTask,
          alreadySubmitted: true,
        }),
      ),
    )

    expect(html).toContain('This exact refresh is queued for review.')
    expect(html).toContain('View its public review status')
    expect(html).not.toContain('Build checked review draft')
    expect(html).not.toContain('Submit for two independent reviews')
  })

  it('resets private state by task/account scope and rejects delayed shared-browser responses', () => {
    expect(sourceRefreshPrivateScopeKey('task-1', 'author-a')).not.toBe(
      sourceRefreshPrivateScopeKey('task-1', 'author-b'),
    )
    expect(sourceRefreshPrivateScopeKey('task-1', 'author-a')).not.toBe(
      sourceRefreshPrivateScopeKey('task-2', 'author-a'),
    )
    const current = {
      requestGeneration: 4,
      currentGeneration: 4,
      requestTaskId: 'task-1',
      currentTaskId: 'task-1',
      requestAccountId: 'author-a',
      currentAccountId: 'author-a',
      aborted: false,
    }
    expect(isCurrentSourceRefreshMutation(current)).toBe(true)
    expect(isCurrentSourceRefreshMutation({ ...current, currentAccountId: 'author-b' })).toBe(false)
    expect(isCurrentSourceRefreshMutation({ ...current, currentTaskId: 'task-2' })).toBe(false)
    expect(isCurrentSourceRefreshMutation({ ...current, currentGeneration: 5 })).toBe(false)
    expect(isCurrentSourceRefreshMutation({ ...current, aborted: true })).toBe(false)
  })
})
