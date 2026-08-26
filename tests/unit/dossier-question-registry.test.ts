import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { DossierQuestionCoverage } from '@/components/dossier/DossierQuestionCoverage'
import { buildDossierQuestionRegistry } from '@/lib/dossier-question-registry'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'

;(globalThis as typeof globalThis & { React: typeof React }).React = React

function dossier(overrides: Partial<MedicineDossierViewModel> = {}): MedicineDossierViewModel {
  return {
    slug: 'source-bound-medicine',
    name: 'Source-bound medicine',
    modality: 'Small Molecule',
    approvalStatus: 'Active',
    statusBadge: { kind: 'programme_status', value: 'ACTIVE' },
    programmes: [],
    selectedProgrammeId: 'programme-1',
    selectedProgrammeLabel: 'Adults with a recorded condition',
    selectedProgrammeStatus: 'ACTIVE',
    bindingState: 'published_programme',
    verdict: 'Exact reviewed wording.',
    readerSummary: {
      basis: 'published_programme',
      usedFor: 'One reviewed use.',
      whatStudiesFound: 'The reviewed finding.',
      biggestLimit: 'The reviewed limit.',
      takeaway: 'The reviewed finding.',
      simplified: false,
      contextItems: [],
    },
    mechanismSummary: {},
    tenSecondWordCount: 12,
    evidenceNodes: [
      {
        id: 'patient-outcome',
        order: 5,
        label: 'Patient outcome',
        title: 'Whether people felt or functioned better',
        summary: 'The stored source reports no improvement in this patient outcome.',
        state: 'contradicted',
        claimNature: 'measured',
        sourceIds: ['source-boundary-support', 'source-boundary'],
        machineChecked: true,
        findingCodes: [],
        claims: [
          {
            id: 'claim-boundary',
            nature: 'measured',
            nodeRelationships: ['CONTRADICTS'],
            text: 'The recorded source reports no improvement in this patient outcome.',
            sourceIds: ['source-boundary-support', 'source-boundary'],
            sourceClaimBindings: [
              {
                sourceId: 'source-boundary-support',
                claimId: 'claim-boundary',
                relationship: 'SUPPORTS',
                statement: 'The source supports the recorded evidence-boundary claim.',
              },
              {
                sourceId: 'source-boundary',
                claimId: 'claim-boundary',
                relationship: 'CONTRADICTS',
                statement: 'The recorded source reports no improvement in this patient outcome.',
              },
            ],
          },
        ],
      },
    ],
    studies: [
      {
        id: 'NCT00000001',
        title: 'Recorded Study',
        state: 'measured',
        sourceIds: ['source-study'],
        interpretability: [
          {
            id: 'assessment-1',
            question: 'Was the right outcome measured?',
            professionalTerm: 'Endpoint validity',
            state: 'unclear',
            explanation:
              'The stored assessment says the outcome only answered part of the question.',
            claimIds: ['claim-study'],
            sourceIds: ['source-study-support', 'source-study'],
            sourceClaimBindings: [
              {
                sourceId: 'source-study-support',
                claimId: 'claim-study',
                relationship: 'SUPPORTS',
                statement: 'The source supports the recorded study-quality assessment.',
              },
              {
                sourceId: 'source-study',
                claimId: 'claim-study',
                relationship: 'QUALIFIES',
                statement: 'The measured outcome answered only part of the research question.',
              },
            ],
          },
        ],
      },
    ],
    keyOutcomes: [
      {
        id: 'outcome-1',
        label: 'Recorded blood measurement',
        state: 'measured',
        claimNature: 'measured',
        endpoint: 'Recorded endpoint',
        comparator: 'Dummy treatment',
        numericValue: '12.4',
        numericUnit: 'percentage points',
        timepoint: 'Week 48',
        sourceIds: ['source-outcome'],
        sourceClaimBindings: [
          {
            sourceId: 'source-outcome',
            claimId: 'outcome-1',
            relationship: 'SUPPORTS',
            statement: 'The study recorded this measurement at week 48.',
          },
        ],
      },
      {
        id: 'orphan-outcome',
        label: 'An outcome whose source is not on the page',
        state: 'measured',
        claimNature: 'measured',
        sourceIds: ['missing-source'],
      },
    ],
    mechanismSteps: [
      {
        id: 'mechanism-1',
        order: 1,
        title: 'Reaches the recorded target',
        plainLanguage: 'The stored explanation says the medicine reaches its intended target.',
        evidenceBasis: 'MEASURED_IN_PEOPLE',
        claimIds: ['claim-mechanism'],
        sourceIds: ['source-mechanism-support', 'source-mechanism'],
        sourceClaimBindings: [
          {
            sourceId: 'source-mechanism-support',
            claimId: 'claim-mechanism',
            relationship: 'SUPPORTS',
            statement: 'The source supports the recorded mechanism statement.',
          },
          {
            sourceId: 'source-mechanism',
            claimId: 'claim-mechanism',
            relationship: 'CONTEXT',
            statement: 'The source records this step as measured in people.',
          },
        ],
      },
    ],
    timelineEvents: [],
    sources: [
      {
        id: 'source-outcome',
        label: 'Outcome source',
        href: 'https://example.test/outcome',
        freshness: 'current',
      },
      {
        id: 'source-study',
        label: 'Study source',
        href: 'https://example.test/study',
        freshness: 'current',
      },
      {
        id: 'source-study-support',
        label: 'Supporting study source',
        href: 'https://example.test/study-support',
        freshness: 'current',
      },
      {
        id: 'source-mechanism',
        label: 'Mechanism source',
        href: 'https://example.test/mechanism',
        freshness: 'current',
      },
      {
        id: 'source-mechanism-support',
        label: 'Supporting mechanism source',
        href: 'https://example.test/mechanism-support',
        freshness: 'current',
      },
      {
        id: 'source-boundary',
        label: 'Evidence-boundary source',
        href: 'https://example.test/boundary',
        freshness: 'current',
      },
      {
        id: 'source-boundary-support',
        label: 'Supporting evidence-boundary source',
        href: 'https://example.test/boundary-support',
        freshness: 'current',
      },
    ],
    freshness: 'current',
    freshnessLabel: 'Checked',
    review: {
      publishedAt: '2026-08-22T00:00:00.000Z',
      reviewedAt: '2026-08-21T00:00:00.000Z',
      historyHref: '/history',
    },
    conclusion: {
      publicLabel: 'Reviewed conclusion',
      professionalLabel: 'Professional conclusion',
      reason: 'Recorded reason',
      scope: {
        indication: 'Recorded use',
        population: 'Recorded population',
        doseExposure: 'Recorded exposure',
        period: 'Recorded period',
        trials: 'Recorded trials',
        outcome: 'Recorded outcome',
      },
      whatWasDisproven: [],
      whatWasNotDisproven: [],
      whatRemainsUnknown: [],
      confidence: 'Moderate',
      conditionsThatWouldChangeVerdict: [],
      authorName: 'Recorded author',
      independentReviewCount: 1,
      reviewers: [],
    },
    machineFindingCodes: [],
    medicineRecord: {
      conventionalAlternatives: [],
      commonQuestions: [],
      communityNotes: [],
    },
    ...overrides,
  }
}

describe('controlled dossier question registry', () => {
  it('builds only applicable, reviewed, source-bound question passages', () => {
    const questions = buildDossierQuestionRegistry(dossier())

    expect(questions.map((question) => question.id)).toEqual([
      'what-did-the-studies-measure',
      'could-the-studies-answer-the-question',
      'how-does-it-work-in-the-body',
      'where-does-the-evidence-stop',
    ])
    expect(questions.flatMap((question) => question.items)).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ heading: 'An outcome whose source is not on the page' }),
      ]),
    )
    expect(
      questions
        .flatMap((question) => question.items)
        .every((item) =>
          item.sourceBindings.some((binding) => binding.relationship === 'SUPPORTS'),
        ),
    ).toBe(true)
  })

  it.each([
    ['legacy_record', 'legacy record'],
    ['programme_unpublished', 'unpublished programme'],
  ] as const)('emits no questions for a %s (%s)', (bindingState, _description) => {
    expect(
      buildDossierQuestionRegistry(
        dossier({
          bindingState,
          conclusion: undefined,
        }),
      ),
    ).toEqual([])
  })

  it('emits no question wall when review or exact sources are absent', () => {
    expect(buildDossierQuestionRegistry(dossier({ review: { historyHref: '/history' } }))).toEqual(
      [],
    )
    expect(buildDossierQuestionRegistry(dossier({ sources: [] }))).toEqual([])
  })

  it('withholds every answer item that has no source binding which supports its claim', () => {
    const unsupported = dossier()
    unsupported.keyOutcomes[0]!.sourceClaimBindings = [
      {
        sourceId: 'source-outcome',
        claimId: 'outcome-1',
        relationship: 'CONTRADICTS',
        statement: 'This source contradicts the recorded numerical result.',
      },
    ]
    unsupported.studies[0]!.interpretability![0]!.sourceClaimBindings = [
      {
        sourceId: 'source-study',
        claimId: 'claim-study',
        relationship: 'QUALIFIES',
        statement: 'This claim only qualifies the assessment.',
      },
    ]
    unsupported.mechanismSteps[0]!.sourceClaimBindings = [
      {
        sourceId: 'source-mechanism',
        claimId: 'claim-mechanism',
        relationship: 'CONTEXT',
        statement: 'This source adds context but does not support the claim.',
      },
    ]
    unsupported.evidenceNodes[0]!.claims![0]!.sourceClaimBindings = [
      {
        sourceId: 'source-boundary',
        claimId: 'claim-boundary',
        relationship: 'CONTRADICTS',
        statement: 'This source contradicts the evidence-boundary claim.',
      },
    ]

    expect(buildDossierQuestionRegistry(unsupported)).toEqual([])
  })

  it('server-renders a small native disclosure list without special SEO schema or fake answers', () => {
    const html = renderToStaticMarkup(
      React.createElement(DossierQuestionCoverage, { dossier: dossier() }),
    )

    expect(html).toContain('Questions this evidence can answer')
    expect(html.match(/<details/gu)).toHaveLength(4)
    expect(html).toContain('Only questions with reviewed information and an exact source link')
    expect(html).toContain('12.4')
    expect(html).toContain('percentage points')
    expect(html).toContain('Source 1: Outcome source')
    expect(html).toContain('Supports:')
    expect(html).toContain('Qualifies:')
    expect(html).toContain('Adds context:')
    expect(html).toContain('Contradicts:')
    expect(html).not.toMatch(/Universal Clinical Question Universe|Q-20|FAQPage|QAPage/iu)
    expect(html).not.toContain('An outcome whose source is not on the page')
  })
})
