import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  AgentEvidenceDetail,
  AgentReviewWorkbench,
} from '@/app/review-queue/agents/AgentReviewWorkbench'
import { AppProvider } from '@/components/app-context'
import type { AgentReviewQueueDetail, AgentReviewQueueList } from '@/lib/queries/agent-review-queue'
import type { CommentUser } from '@/lib/types'

;(globalThis as typeof globalThis & { React: typeof React }).React = React

const steward: CommentUser = {
  id: 'agent-reviewer',
  name: 'Agent Reviewer',
  email: 'reviewer@example.test',
  trustTier: 'steward',
}

const emptyList: AgentReviewQueueList = { items: [], limit: 40, offset: 0, hasMore: false }

function renderWorkbench(props: React.ComponentProps<typeof AgentReviewWorkbench>): string {
  return renderToStaticMarkup(
    React.createElement(
      AppProvider,
      { initialUser: steward } as React.ComponentProps<typeof AppProvider>,
      React.createElement(AgentReviewWorkbench, props),
    ),
  )
}

function detailFixture(): AgentReviewQueueDetail {
  const candidateKey = '1'.repeat(64)
  const occurrenceKey = '2'.repeat(64)
  const evidenceDigest = '3'.repeat(64)
  return {
    candidateKey,
    occurrenceKey,
    medicine: { slug: 'fixture-medicine', name: 'Fixture medicine' },
    fieldPath: 'pharmacokinetics.halfLife',
    agent: { id: 'numeric-distributions', version: '2.3.1', reasonSchemaVersion: '4' },
    reason: 'UNUSUAL_FOR_PEER_GROUP',
    severity: 'high',
    lane: 'quantitative',
    provenanceTier: 'transcribed',
    occurrenceState: 'reopened',
    state: 'EVIDENCE_CHANGED',
    evidenceChanged: true,
    score: 0.97,
    scoreExplanation:
      'Deterministic ranking features: agentPriority=0.97; calibration="INSUFFICIENT_REVIEW_HISTORY".',
    rankingFeatures: {
      agentPriority: 0.97,
      calibration: 'INSUFFICIENT_REVIEW_HISTORY',
      occurrenceState: 'reopened',
      sourceChanged: true,
    },
    calibrationMessage: 'Not enough review history to calibrate this reason.',
    question: 'Does the exact source excerpt state this recorded half-life?',
    sourceCount: 1,
    decisionEventCount: 1,
    latestDecision: null,
    evidenceDigest,
    corpusVersion: '4'.repeat(64),
    timestamps: {
      firstSeenAt: '2026-08-30T00:00:00.000Z',
      lastSeenAt: '2026-09-01T00:00:00.000Z',
      observedAt: '2026-09-01T00:00:00.000Z',
      activatedAt: '2026-09-01T00:05:00.000Z',
      runStartedAt: '2026-09-01T00:00:00.000Z',
      runDate: '2026-09-01',
    },
    basis: 'The exact recorded value is outside the deterministic peer interval.',
    evidence: {
      digest: evidenceDigest,
      canonical: {
        schema: 'agent-decision-evidence/v1',
        observation: { recordedValue: { display: '10 hours', numeric: 10, unit: 'hours' } },
      },
      observation: { recordedValue: { display: '10 hours', numeric: 10, unit: 'hours' } },
      sourceReadings: [
        {
          sourceKey: 'FDA_LABEL:fixture-label',
          kind: 'FDA_LABEL',
          identifier: 'fixture-label',
          label: 'Fixture prescribing information',
          locator: 'https://example.test/fixture-label',
          version: 'label-v7',
          effectiveDate: '2026-08-15',
          retrievedAt: '2026-08-31T12:00:00.000Z',
          excerpt: 'The terminal half-life was approximately 10 hours.',
        },
      ],
      sourceMetadata: [{ version: 'label-v7', effectiveDate: '2026-08-15' }],
      sourceLinks: [
        'https://api.fda.gov/drug/label.json?search=set_id:%22fixture-label%22&limit=1',
      ],
      sourceReadingDigests: ['8'.repeat(64)],
      sourceSnapshotDigests: ['8'.repeat(64)],
    },
    liveDecision: {
      contextDigest: '9'.repeat(64),
      baselineDigest: '9'.repeat(64),
      ready: true,
      staleReason: null,
      storedField: {
        state: 'present',
        value: { display: '9.5 hours', numeric: 9.5, unit: 'hours' },
        valueDigest: 'a'.repeat(64),
        guardScope: 'exact_field_and_sources',
      },
      relevantMedicineSlugs: ['fixture-medicine'],
      missingMedicineSlugs: [],
      sourceBindings: [
        {
          sourceKey: 'FDA_LABEL:fixture-label',
          sourceReadingDigest: '8'.repeat(64),
          matches: [
            {
              medicineSlug: 'fixture-medicine',
              path: 'recordedBackground.pharmacokinetics.halfLife.source',
            },
          ],
        },
      ],
      allSourcesBound: true,
    },
    priorOccurrences: [
      {
        occurrenceKey: '5'.repeat(64),
        evidenceDigest: '6'.repeat(64),
        agentVersion: '2.2.0',
        reasonSchemaVersion: '4',
        corpusVersion: '7'.repeat(64),
        sourceCount: 1,
        firstSeenAt: '2026-08-20T00:00:00.000Z',
        lastSeenAt: '2026-08-21T00:00:00.000Z',
        changesFromCurrent: {
          evidence: true,
          observation: true,
          sources: true,
          agentVersion: true,
          corpusVersion: true,
        },
      },
    ],
    decisions: [
      {
        id: 'decision-one',
        candidateKey,
        occurrenceKey: '5'.repeat(64),
        decision: 'NEEDS_MORE_EVIDENCE',
        explanation: 'The earlier source snapshot did not include the relevant section.',
        evidenceDigest: '6'.repeat(64),
        evidenceChanged: true,
        decidedAt: '2026-08-22T00:00:00.000Z',
        reviewer: { id: 'reviewer-one', name: 'Reviewer One', handle: 'reviewer-one' },
      },
    ],
    historyPagination: {
      occurrences: { offset: 0, limit: 50, hasMore: false },
      decisions: { offset: 0, limit: 50, hasMore: false },
    },
    historyTruncated: { occurrences: false, decisions: false },
  }
}

describe('agent evidence review workbench', () => {
  it('server-renders explicit loading, empty and error states', () => {
    expect(renderWorkbench({})).toContain('Loading active candidates')
    expect(renderWorkbench({ initialList: emptyList })).toContain(
      'No active candidates match these filters.',
    )
    expect(
      renderWorkbench({ initialError: 'The private queue is temporarily unavailable.' }),
    ).toContain('The private queue is temporarily unavailable.')
  })

  it('fails closed in the client if a reconciled user is no longer a steward or administrator', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        AppProvider,
        {
          initialUser: { ...steward, trustTier: 'trusted' },
        } as React.ComponentProps<typeof AppProvider>,
        React.createElement(AgentReviewWorkbench, { initialList: emptyList }),
      ),
    )

    expect(html).toContain('no longer has access to this private queue')
    expect(html).not.toContain('Active candidates')
  })

  it('distinguishes the exact live medicine value from agent context and shows source bindings', () => {
    const html = renderToStaticMarkup(
      React.createElement(AgentEvidenceDetail, {
        detail: detailFixture(),
        loading: false,
        error: null,
        saving: false,
        notice: null,
        onDecision: async () => undefined,
      }),
    )

    expect(html).toContain('Current stored medicine value')
    expect(html).toContain('9.5 hours')
    expect(html).toContain('Agent observation (detector context)')
    expect(html).toContain('10 hours')
    expect(html).toContain('Fixture prescribing information')
    expect(html).toContain('label-v7')
    expect(html).toContain('2026-08-15')
    expect(html).toContain('The terminal half-life was approximately 10 hours.')
    expect(html).toContain('https://example.test/fixture-label')
    expect(html).toContain('Prior occurrences')
    expect(html).toContain('Showing 1–1 prior occurrences in newest-first order.')
    expect(html).toContain('Showing 1–1 decision events in newest-first order.')
    expect(html).toContain('Evidence, Observation, Sources, Agent version, Corpus version')
    expect(html).toContain('The earlier source snapshot did not include the relevant section.')
    expect(html.match(/type="radio"/g)).toHaveLength(4)
    for (const outcome of [
      'Correction needed',
      'Not a problem',
      'Confirmed as recorded',
      'Needs more evidence',
    ]) {
      expect(html).toContain(outcome)
    }
    expect(html).toContain('required=""')
    expect(html).toContain('does not edit the medicine or choose a source')
    expect(html).toContain('does not create a correction draft or handoff')
    expect(html).toContain('Not enough review history to calibrate this reason.')
    expect(html).toContain('Occurrence state')
    expect(html).toContain('Reopened')
    for (const explanation of [
      'The stored record does not match its source or schema.',
      'The detector raised this, but it is not a defect.',
      'The value is unusual, but the source really prints it.',
      'The current material is insufficient to decide.',
    ]) {
      expect(html).toContain(explanation)
    }
    expect(html).toContain('sourceChanged')
    expect(html).toContain('recordedValue.numeric')
    expect(html).toContain('href="https://api.fda.gov/drug/label.json?')
    expect(html).toContain('fixture-medicine:recordedBackground.pharmacokinetics.halfLife.source')
  })

  it('discloses capped history pages and renders navigation for older events', () => {
    const fixture = detailFixture()
    const html = renderToStaticMarkup(
      React.createElement(AgentEvidenceDetail, {
        detail: {
          ...fixture,
          historyPagination: {
            occurrences: { offset: 0, limit: 50, hasMore: true },
            decisions: { offset: 50, limit: 50, hasMore: true },
          },
          historyTruncated: { occurrences: true, decisions: true },
        },
        loading: false,
        error: null,
        saving: false,
        notice: null,
        onDecision: async () => undefined,
      }),
    )

    expect(html).toContain('Older')
    expect(html).toContain('Newer')
    expect(html).toContain('Showing 51–51 decision events in newest-first order.')
  })

  it('shows exact absence and disables decisions when the live snapshot is stale', () => {
    const fixture = detailFixture()
    const html = renderToStaticMarkup(
      React.createElement(AgentEvidenceDetail, {
        detail: {
          ...fixture,
          liveDecision: {
            ...fixture.liveDecision,
            ready: false,
            staleReason: 'stored_value_or_source_changed',
            storedField: {
              state: 'absent',
              value: null,
              valueDigest: 'b'.repeat(64),
              guardScope: 'relevant_medicine_backgrounds_and_sources',
            },
          },
        },
        loading: false,
        error: null,
        saving: false,
        notice: null,
        onDecision: async () => undefined,
      }),
    )

    expect(html).toContain('No literal value is stored at this field path')
    expect(html).toContain('cannot be decided')
    expect(html).toContain('type="submit" disabled=""')
  })

  it('renders exact-evidence loading and failure states without a decision form', () => {
    const loading = renderToStaticMarkup(
      React.createElement(AgentEvidenceDetail, {
        detail: null,
        loading: true,
        error: null,
        saving: false,
        notice: null,
        onDecision: async () => undefined,
      }),
    )
    const error = renderToStaticMarkup(
      React.createElement(AgentEvidenceDetail, {
        detail: null,
        loading: false,
        error: 'The exact current occurrence could not be loaded.',
        saving: false,
        notice: null,
        onDecision: async () => undefined,
      }),
    )

    expect(loading).toContain('Loading exact evidence')
    expect(loading).not.toContain('<form')
    expect(error).toContain('The exact current occurrence could not be loaded.')
    expect(error).not.toContain('<form')
  })

  it('does not fabricate a source version from the fetch snapshot or checker version', () => {
    const fixture = detailFixture()
    const [reading] = fixture.evidence.sourceReadings
    const html = renderToStaticMarkup(
      React.createElement(AgentEvidenceDetail, {
        detail: {
          ...fixture,
          evidence: {
            ...fixture.evidence,
            observation: {
              confirmedSourceSnapshot: {
                sourceSnapshotId: 'snapshot-source-drift-1',
                sourceContentHash: 'a'.repeat(64),
                checkerVersion: 'background-assertion/1.0.0',
              },
            },
            sourceReadings: [
              Object.fromEntries(Object.entries(reading!).filter(([key]) => key !== 'version')),
            ],
            sourceMetadata: [
              {
                version: null,
                effectiveDate:
                  typeof reading!.effectiveDate === 'string' ? reading!.effectiveDate : null,
              },
            ],
          },
        },
        loading: false,
        error: null,
        saving: false,
        notice: null,
        onDecision: async () => undefined,
      }),
    )

    expect(html).toContain('snapshot-source-drift-1')
    expect(html).toContain('background-assertion/1.0.0')
    expect(html).toContain('<dt class="font-bold">Version</dt><dd>Not recorded</dd>')
  })
})
