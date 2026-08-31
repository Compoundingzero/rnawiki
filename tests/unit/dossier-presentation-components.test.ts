import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DossierEvidenceIntroduction } from '@/components/dossier/DossierEvidenceIntroduction'
import { DossierHeader } from '@/components/dossier/DossierHeader'
import { DossierAudienceLensSelector } from '@/components/dossier/DossierAudienceLensSelector'
import { DossierEvidencePath, evidenceNodeAnchorId } from '@/components/dossier/DossierEvidencePath'
import { DossierNavigation } from '@/components/dossier/DossierNavigation'
import { DossierResearchQuestion } from '@/components/dossier/DossierResearchQuestion'
import {
  hasResolvedProgrammeMechanismSupport,
  TenSecondAnswer,
} from '@/components/dossier/TenSecondAnswer'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import { dossierAudienceLensProjections } from '@/lib/dossier-audience-lenses'

// Next preserves JSX for its compiler; this direct server render uses the classic runtime.
;(globalThis as typeof globalThis & { React: typeof React }).React = React

function dossier(overrides: Partial<MedicineDossierViewModel> = {}): MedicineDossierViewModel {
  const bindingState = overrides.bindingState ?? 'published_programme'
  return {
    slug: 'plain-medicine',
    name: 'Plain Medicine',
    tradeName: 'Clearbrand',
    modality: 'siRNA (Small Interfering RNA)',
    approvalStatus: 'Active',
    statusBadge: { kind: 'programme_status', value: 'ACTIVE' },
    programmes: [
      {
        id: 'question-a',
        label: 'Adults with a recorded condition',
        status: 'ACTIVE',
        href: '?programme=question-a',
        selected: true,
      },
    ],
    selectedProgrammeId: 'question-a',
    selectedProgrammeLabel: 'Adults with a recorded condition',
    selectedProgrammeStatus: 'Active',
    bindingState,
    verdict: 'Exact technical wording that belongs after the first read.',
    readerSummary: {
      basis:
        bindingState === 'published_programme'
          ? 'published_programme'
          : bindingState === 'programme_unpublished'
            ? 'unpublished_programme'
            : 'older_record',
      usedFor: 'Studied for adults with a recorded condition.',
      whatStudiesFound: 'Studies found a clear recorded change compared with a dummy treatment.',
      biggestLimit: 'The studies did not measure whether people lived longer.',
      practicalNote: 'People received it by injection during the study.',
      criticalSafety: 'A stored safety issue needs attention before treatment.',
      takeaway: 'Studies found a clear recorded change compared with a dummy treatment.',
      exactText: 'Exact technical wording that belongs after the first read.',
      simplified: true,
      contextItems: [],
    },
    mechanismSummary: {},
    tenSecondWordCount: 32,
    evidenceNodes: [],
    studies: [],
    keyOutcomes: [],
    mechanismSteps: [],
    timelineEvents: [],
    sources: [],
    freshness: 'unknown',
    freshnessLabel: 'Freshness not yet verified',
    review: { historyHref: '/d/plain-medicine/history' },
    machineFindingCodes: [],
    medicineRecord: {
      conventionalAlternatives: [],
      commonQuestions: [],
      communityNotes: [],
    },
    ...overrides,
  }
}

function renderHeader(view: MedicineDossierViewModel): string {
  return renderToStaticMarkup(React.createElement(DossierHeader, { dossier: view }))
}

function renderAudienceLenses(view: MedicineDossierViewModel): string {
  return renderToStaticMarkup(
    React.createElement(DossierAudienceLensSelector, {
      projections: dossierAudienceLensProjections(view),
    }),
  )
}

function renderAnswer(view: MedicineDossierViewModel, mechanismPreviewAllowed = false): string {
  return renderToStaticMarkup(
    React.createElement(TenSecondAnswer, { dossier: view, mechanismPreviewAllowed }),
  )
}

describe('dossier presentation components', () => {
  it('uses one quiet anchor navigation rather than duplicate audience modes', () => {
    const html = renderToStaticMarkup(
      React.createElement(DossierNavigation, {
        hasEvidence: true,
        hasMechanism: true,
        hasStudyEvidence: true,
        safetyHref: '#safety-and-administration',
      }),
    )

    expect(html).toContain('data-testid="dossier-local-navigation"')
    expect(html).toContain('aria-label="Medicine dossier sections"')
    expect(html).toContain('href="#what-it-is"')
    expect(html).toContain('href="#evidence-support"')
    expect(html).toContain('href="#safety-and-administration"')
    expect(html).toContain('href="#mechanism-map"')
    expect(html).toContain('href="#sources"')
    expect(html.match(/href="#what-it-is"/gu)).toHaveLength(1)
    expect(html).not.toContain('Choose where to start')
    expect(html).not.toContain('role="tab"')
    expect(html).not.toContain('aria-selected')
    expect(html).not.toContain('<button')
  })

  it('renders one selectable four-audience projection over the same record', () => {
    const view = dossier()
    view.medicineRecord.background = {
      authoredAt: '2026-08-31',
      recordedUses: {
        statements: [
          {
            text: 'Exact recorded use statement.',
            source: {
              kindLabel: 'FDA label',
              label: 'Exact label source',
              identifier: 'label-123',
              href: 'https://example.test/label-123',
              version: 'revision-7',
              effectiveDate: '2026-08-15',
              retrievedAt: '2026-08-31',
            },
          },
          {
            text: 'Second exact recorded use statement.',
            source: {
              kindLabel: 'FDA label',
              label: 'Unversioned label source',
              identifier: 'label-unversioned',
              href: 'https://example.test/label-unversioned',
              retrievedAt: '2026-08-31',
            },
          },
        ],
      },
    }
    const header = renderHeader(view)
    const projection = renderAudienceLenses(view)
    const introduction = renderToStaticMarkup(
      React.createElement(DossierEvidenceIntroduction, { dossier: view }),
    )

    expect(header).not.toContain('data-testid="dossier-audience-lenses"')
    expect(projection.match(/data-testid="dossier-audience-lenses"/gu)).toHaveLength(1)
    expect(projection).toContain('aria-label="Choose a reading lens"')
    expect(projection).toContain('Ordinary reader')
    expect(projection).toContain('Biotech researcher')
    expect(projection).toContain('Chemist')
    expect(projection).toContain('Physicist or quantitative scientist')
    expect(projection.match(/type="radio"/gu)).toHaveLength(4)
    expect(projection).toContain('data-audience-lens="ordinary"')
    expect(projection).toContain('data-selected-audience-lens="ordinary"')
    expect(projection).toContain('1. What is this medicine used or studied for?')
    expect(projection).toContain('6. What is unknown, conflicting or stale?')
    expect(projection).toContain('Canonical field')
    expect(projection).toContain('Projection record type')
    expect(projection).toContain('Medical or evidence record')
    expect(projection).toContain('Explicit coverage gap')
    expect(projection).toContain('Observed or derived status')
    expect(projection).toContain('Exact source binding')
    expect(projection).toContain('href="https://example.test/label-123"')
    expect(projection).toContain('Identifier:')
    expect(projection).toContain('label-123')
    expect(projection).toContain('Source version:')
    expect(projection).toContain('revision-7')
    expect(projection).toContain('Source effective date:')
    expect(projection).toContain('2026-08-15')
    expect(projection).toMatch(/Source version: <\/dt><dd[^>]*>Not recorded<\/dd>/u)
    expect(projection).toMatch(/Source effective date: <\/dt><dd[^>]*>Not recorded<\/dd>/u)
    expect(projection).toContain('Freshness:')
    expect(projection).toContain('Not recorded for this source')
    expect(projection).toContain('href="#what-it-is"')
    expect(projection).not.toContain('role="tab"')
    expect(projection).not.toContain('aria-selected')
    expect(introduction).not.toContain('Evidence reading depth')
    expect(introduction).not.toContain('data-audience-lens=')
  })

  it('does not give unpublished or general research a reviewed-green status treatment', () => {
    const unpublished = renderHeader(dossier({ bindingState: 'programme_unpublished' }))
    const general = renderHeader(dossier({ bindingState: 'legacy_record' }))

    expect(unpublished).toContain('No reviewed answer yet')
    expect(unpublished).toContain('text-amber-700')
    expect(unpublished).not.toContain('text-emerald-700')
    expect(general).toContain('General research summary')
    expect(general).not.toContain('text-emerald-700')
  })

  it('omits section links when their stored content is absent', () => {
    const html = renderToStaticMarkup(
      React.createElement(DossierNavigation, {
        hasEvidence: false,
        hasMechanism: false,
        hasStudyEvidence: false,
      }),
    )

    expect(html).toContain('href="#what-it-is"')
    expect(html).toContain('href="#sources"')
    expect(html).not.toContain('href="#evidence-support"')
    expect(html).not.toContain('href="#study-measurements"')
    expect(html).not.toContain('href="#safety-and-administration"')
    expect(html).not.toContain('href="#mechanism-map"')
  })

  it('links Safety to the selected programme evidence when that evidence is available', () => {
    const html = renderToStaticMarkup(
      React.createElement(DossierNavigation, {
        hasEvidence: true,
        hasMechanism: true,
        hasStudyEvidence: true,
        safetyHref: '#selected-programme-safety',
      }),
    )

    expect(html).toContain('href="#selected-programme-safety"')
    expect(html).not.toContain('href="#safety-and-administration"')
  })

  it('renders one quiet, programme-scoped medicine header', () => {
    const html = renderHeader(dossier())

    expect(html.match(/<h1\b/gu)).toHaveLength(1)
    expect(html).toContain('Plain Medicine')
    expect(html).toContain('Clearbrand')
    expect(html).toContain('RNA-silencing medicine')
    expect(html).toContain('Research status: Active')
    expect(html).toContain('id="approval-status"')
    expect(html).toContain('Reviewed answer')
    expect(html).toContain('This answer is for')
    expect(html).toContain('Adults with a recorded condition')
    expect(html).not.toContain('What studies found')
    expect(html).not.toContain('See how we know')
  })

  it('shows a native question switch only when several questions exist', () => {
    const oneQuestion = renderHeader(dossier())
    const severalQuestions = renderHeader(
      dossier({
        programmes: [
          ...dossier().programmes,
          {
            id: 'question-b',
            label: 'Children with a different recorded condition',
            status: 'STOPPED',
            href: '?programme=question-b',
            selected: false,
          },
        ],
      }),
    )

    expect(oneQuestion).not.toContain('Change use')
    expect(severalQuestions).toContain('<details')
    expect(severalQuestions).toContain('Change use')
    expect(severalQuestions).toContain('?programme=question-b')
    expect(severalQuestions).toContain('The answer and evidence may change')
  })

  it.each([
    ['published_programme', 'This answer is for'],
    ['programme_unpublished', 'Research question'],
    ['legacy_record', 'Research covered on this page'],
  ] as const)('labels the %s scope without internal jargon', (bindingState, label) => {
    const html = renderHeader(dossier({ bindingState }))

    expect(html).toContain(label)
    expect(html).not.toMatch(/programme scope|canonical locator|verdict-scoped/iu)
  })

  it('renders one self-contained answer surface with a readable finding and limit', () => {
    const html = renderAnswer(dossier())

    expect(html.match(/data-testid="ten-second-answer"/gu)).toHaveLength(1)
    expect(html.match(/data-testid="main-takeaway-card"/gu)).toHaveLength(1)
    expect(html).toContain('id="what-it-is"')
    expect(html).toContain('id="what-the-evidence-shows"')
    expect(html).toContain('id="what-remains-unknown"')
    expect(html).toContain('In 10 seconds')
    expect(html).toContain('What is it for?')
    expect(html).toContain('What studies found')
    expect(html).toContain('Main limit')
    expect(html).toContain('How it was used in this research:')
    expect(html).toContain('Safety at a glance')
    expect(html).toContain(
      'This answer is for this use and group. Other uses can have different answers.',
    )
    expect(html).not.toContain('Exact technical wording')
    expect(html).not.toContain('<details')
    expect(html).not.toContain('<button')
    expect(html).not.toContain('role="tooltip"')
    expect(html).not.toContain('See how we know')

    const limitStart = html.indexOf('data-testid="ten-second-limit"')
    const limitEnd = html.indexOf('</div>', limitStart)
    const limitRow = html.slice(limitStart, limitEnd)
    expect(limitStart).toBeGreaterThanOrEqual(0)
    expect(limitRow).toContain('Main limit')
    expect(limitRow).toContain('The studies did not measure whether people lived longer.')
  })

  it('keeps a source-bound programme mechanism behind a native optional disclosure', () => {
    const html = renderAnswer(
      dossier({
        mechanismSummary: {
          where: 'Mainly in the liver',
          change: 'It helps the liver remove more of a type of cholesterol from the blood.',
        },
      }),
      true,
    )

    expect(html).toContain('<details')
    expect(html).toContain('How does it work?')
    expect(html).toContain('Mainly in the liver')
    expect(html).toContain(
      'It helps the liver remove more of a type of cholesterol from the blood.',
    )
  })

  it('omits mechanism copy unless the composition layer resolved a SUPPORTS binding', () => {
    const html = renderAnswer(
      dossier({
        mechanismSummary: {
          where: 'Mainly in the liver',
          change: 'It changes a stored biological step.',
        },
      }),
    )

    expect(html).not.toContain('How does it work?')
    expect(html).not.toContain('It changes a stored biological step.')
  })

  it('requires a published programme and an internally consistent resolved SUPPORTS binding', () => {
    const source = {
      id: 'mechanism-source',
      label: 'Saved mechanism source',
      freshness: 'current' as const,
    }
    const support = {
      fieldPath: 'summary.plainMechanism' as const,
      claimIds: ['mechanism-claim'],
      sourceIds: ['mechanism-source'],
      verdictClaimBindings: [
        {
          claimId: 'mechanism-claim',
          relationship: 'SUPPORTING' as const,
        },
      ],
      sourceClaimBindings: [
        {
          sourceId: 'mechanism-source',
          claimId: 'mechanism-claim',
          relationship: 'SUPPORTS' as const,
          statement: 'Stored programme mechanism.',
        },
      ],
    }
    const view = dossier({
      sources: [source],
      summaryEvidence: { 'summary.plainMechanism': support },
    })

    expect(hasResolvedProgrammeMechanismSupport(view)).toBe(true)
    expect(hasResolvedProgrammeMechanismSupport({ ...view, bindingState: 'legacy_record' })).toBe(
      false,
    )
    expect(
      hasResolvedProgrammeMechanismSupport({ ...view, bindingState: 'programme_unpublished' }),
    ).toBe(false)
    expect(hasResolvedProgrammeMechanismSupport({ ...view, summaryEvidence: {} })).toBe(false)
    expect(hasResolvedProgrammeMechanismSupport({ ...view, sources: [] })).toBe(false)
    for (const relationship of [
      'CONTRADICTORY',
      'CANDIDATE_LIMITATION',
      'QUALIFYING',
      'UNKNOWN',
    ] as const) {
      expect(
        hasResolvedProgrammeMechanismSupport({
          ...view,
          summaryEvidence: {
            'summary.plainMechanism': {
              ...support,
              verdictClaimBindings: [
                {
                  claimId: 'mechanism-claim',
                  // The last two values model malformed or stale runtime data outside the enum.
                  relationship: relationship as unknown as 'SUPPORTING',
                },
              ],
            },
          },
        }),
      ).toBe(false)
    }
    expect(
      hasResolvedProgrammeMechanismSupport({
        ...view,
        summaryEvidence: {
          'summary.plainMechanism': { ...support, verdictClaimBindings: [] },
        },
      }),
    ).toBe(false)
    expect(
      hasResolvedProgrammeMechanismSupport({
        ...view,
        summaryEvidence: {
          'summary.plainMechanism': {
            ...support,
            claimIds: ['mechanism-claim', 'second-claim'],
            verdictClaimBindings: [
              { claimId: 'mechanism-claim', relationship: 'SUPPORTING' },
              { claimId: 'second-claim', relationship: 'SUPPORTING' },
            ],
          },
        },
      }),
    ).toBe(false)
    expect(
      hasResolvedProgrammeMechanismSupport({
        ...view,
        summaryEvidence: {
          'summary.plainMechanism': {
            ...support,
            verdictClaimBindings: [{ claimId: 'different-claim', relationship: 'SUPPORTING' }],
          },
        },
      }),
    ).toBe(false)
    expect(
      hasResolvedProgrammeMechanismSupport({
        ...view,
        summaryEvidence: {
          'summary.plainMechanism': {
            ...support,
            verdictClaimBindings: [
              { claimId: 'mechanism-claim', relationship: 'SUPPORTING' },
              { claimId: 'mechanism-claim', relationship: 'CONTRADICTORY' },
            ],
          },
        },
      }),
    ).toBe(false)
    expect(
      hasResolvedProgrammeMechanismSupport({
        ...view,
        summaryEvidence: {
          'summary.plainMechanism': {
            ...support,
            sourceClaimBindings: [
              { ...support.sourceClaimBindings[0]!, relationship: 'QUALIFIES' },
            ],
          },
        },
      }),
    ).toBe(false)
    expect(
      hasResolvedProgrammeMechanismSupport({
        ...view,
        summaryEvidence: {
          'summary.plainMechanism': {
            ...support,
            claimIds: ['different-claim'],
          },
        },
      }),
    ).toBe(false)
  })

  it('renders a reviewed research question only from stored programme scope', () => {
    const view = dossier({
      conclusion: {
        publicLabel: 'Reviewed conclusion',
        professionalLabel: 'Professional conclusion',
        reason: 'Stored reason',
        scope: {
          indication: 'Recorded use',
          population: 'Adults in the reviewed studies',
          doseExposure: 'Recorded exposure',
          period: '68 weeks',
          trials: 'Study One',
          outcome: 'Average change in weight',
        },
        whatWasDisproven: [],
        whatWasNotDisproven: [],
        whatRemainsUnknown: [],
        confidence: 'Recorded confidence',
        conditionsThatWouldChangeVerdict: [],
        authorName: 'Saved author',
        independentReviewCount: 2,
        reviewers: [],
      },
      keyOutcomes: [
        {
          id: 'outcome-a',
          label: 'Average change in weight',
          state: 'measured',
          claimNature: 'measured',
          sourceIds: [],
          comparator: 'Dummy treatment',
        },
      ],
    })
    const html = renderToStaticMarkup(
      React.createElement(DossierResearchQuestion, { dossier: view }),
    )

    expect(html).toContain('data-testid="dossier-research-question"')
    expect(html).toContain('Adults with a recorded condition')
    expect(html).toContain('Adults in the reviewed studies')
    expect(html).toContain('68 weeks')
    expect(html).toContain('Dummy treatment')
    expect(html).not.toContain('Recorded exposure')
  })

  it('omits a single-question card for a medicine-wide research summary', () => {
    const html = renderToStaticMarkup(
      React.createElement(DossierResearchQuestion, {
        dossier: dossier({ bindingState: 'legacy_record' }),
      }),
    )

    expect(html).toBe('')
  })

  it('uses a five-step overview only as links to the complete evidence cards', () => {
    const nodes: MedicineDossierViewModel['evidenceNodes'] = Array.from(
      { length: 5 },
      (_, index) => ({
        id: `node-${index + 1}`,
        order: index + 1,
        label: `Evidence step ${index + 1}`,
        title: `Stored step ${index + 1}`,
        summary: `Stored summary ${index + 1}`,
        state: index === 3 ? 'not_measured' : 'confirmed',
        claimNature: 'measured',
        sourceIds: [],
        machineChecked: true,
        findingCodes: [],
      }),
    )
    const html = renderToStaticMarkup(React.createElement(DossierEvidencePath, { nodes }))

    expect(html).toContain('data-testid="dossier-evidence-path"')
    expect(html.match(/href="#evidence-step-/gu)).toHaveLength(5)
    expect(html).toContain('Not measured')
    expect(html).toContain('border-dotted')
    expect(html).toContain('border-solid')
    expect(evidenceNodeAnchorId(4)).toBe('evidence-step-4')
    expect(html).not.toMatch(/score|rating|percent/iu)
  })

  it('keeps exact source statements out of the first read even when the bindings exist', () => {
    const sources: MedicineDossierViewModel['sources'] = [
      {
        id: 'finding-source',
        label: 'Exact finding source',
        href: 'https://example.test/finding',
        freshness: 'current',
      },
      {
        id: 'limitation-source',
        label: 'Exact limitation source',
        href: 'https://example.test/limitation',
        freshness: 'current',
      },
    ]
    const summaryEvidence: NonNullable<MedicineDossierViewModel['summaryEvidence']> = {
      'summary.bestSupportedFinding': {
        fieldPath: 'summary.bestSupportedFinding',
        claimIds: ['finding-claim'],
        sourceIds: ['finding-source'],
        verdictClaimBindings: [{ claimId: 'finding-claim', relationship: 'SUPPORTING' }],
        sourceClaimBindings: [
          {
            sourceId: 'finding-source',
            claimId: 'finding-claim',
            relationship: 'SUPPORTS',
            statement: 'This exact source supports the stored finding.',
          },
        ],
      },
      'summary.mainLimitation': {
        fieldPath: 'summary.mainLimitation',
        claimIds: ['limitation-claim'],
        sourceIds: ['limitation-source'],
        verdictClaimBindings: [
          { claimId: 'limitation-claim', relationship: 'CANDIDATE_LIMITATION' },
        ],
        sourceClaimBindings: [
          {
            sourceId: 'limitation-source',
            claimId: 'limitation-claim',
            relationship: 'CONTEXT',
            statement: 'This exact source records the stored limitation.',
          },
        ],
      },
    }

    const unmarkedText = renderAnswer(dossier({ sources, summaryEvidence }))
    expect(unmarkedText).not.toContain('finding-adjacent-sources')
    expect(unmarkedText).not.toContain('limitation-adjacent-sources')
    expect(unmarkedText).not.toContain('This exact source supports the stored finding.')
    expect(unmarkedText).not.toContain('This exact source records the stored limitation.')

    const fallbackText = renderAnswer(
      dossier({
        sources,
        summaryEvidence,
        readerSummary: {
          ...dossier().readerSummary,
          whatStudiesFound: undefined,
          whatStudiesFoundSourceFieldPath: 'summary.bestSupportedFinding',
          biggestLimit: undefined,
          biggestLimitSourceFieldPath: 'summary.mainLimitation',
        },
      }),
    )
    expect(fallbackText).toContain(
      'A reviewed answer exists, but a short plain-language study finding is not available yet.',
    )
    expect(fallbackText).toContain('No main limitation is recorded in the short summary.')
    expect(fallbackText).not.toContain('finding-adjacent-sources')
    expect(fallbackText).not.toContain('limitation-adjacent-sources')
  })

  it.each([
    [
      'programme_unpublished',
      'RNAWiki has found a specific use and its studies, but reviewers have not published an answer yet.',
    ],
    [
      'legacy_record',
      'This combines research on different uses and groups. It is background, not a reviewed answer for one specific use.',
    ],
  ] as const)('uses an honest %s boundary', (bindingState, expectedBoundary) => {
    const html = renderAnswer(
      dossier({
        bindingState,
        readerSummary: {
          ...dossier().readerSummary,
          basis: bindingState === 'legacy_record' ? 'older_record' : 'unpublished_programme',
          whatStudiesFound: undefined,
          biggestLimit: undefined,
        },
      }),
    )

    expect(html).toContain(expectedBoundary)
    expect(html).not.toContain('A reviewed answer exists')
  })
})
