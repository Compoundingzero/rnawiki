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

const UNIVERSE_IDS = [
  'q-identity',
  'q-purpose',
  'q-regulatory-status',
  'q-bottom-line',
  'q-evidence-scope',
  'q-measurement',
  'q-results-magnitude',
  'q-meaning-limitations',
  'q-applicability',
  'q-harms',
  'q-mechanism',
  'q-evidence-certainty',
  'q-programme-history',
  'q-failure-analysis',
  'q-unknowns',
  'q-sources',
  'q-review-provenance',
  'q-freshness',
  'q-corrections',
]

describe('controlled dossier question registry', () => {
  it('asks the same fixed question universe of every record, with unique anchors', () => {
    const questions = buildDossierQuestionRegistry(dossier())

    expect(questions.map((question) => question.id)).toEqual(UNIVERSE_IDS)
    expect(new Set(questions.map((question) => question.id)).size).toBe(UNIVERSE_IDS.length)
    const itemIds = questions.flatMap((question) => question.items.map((item) => item.id))
    expect(new Set(itemIds).size).toBe(itemIds.length)
  })

  it('answers evidence questions only from source-bound reviewed fields', () => {
    const questions = buildDossierQuestionRegistry(dossier())
    const byId = new Map(questions.map((question) => [question.id, question]))

    const measurement = byId.get('q-measurement')
    expect(measurement?.coverage).toBe('answered')
    expect(measurement?.items[0]?.heading).toBe('Recorded blood measurement')
    expect(
      measurement?.items.every((item) =>
        item.sourceBindings.some((binding) => binding.relationship === 'SUPPORTS'),
      ),
    ).toBe(true)

    const magnitude = byId.get('q-results-magnitude')
    expect(magnitude?.coverage).toBe('answered')
    expect(magnitude?.items[0]?.facts).toEqual(
      expect.arrayContaining([{ label: 'Exact result', value: '12.4 percentage points' }]),
    )

    // The orphan outcome's source is not on the page, so it may not appear anywhere.
    expect(
      questions.flatMap((question) => question.items.map((item) => item.heading)),
    ).not.toContain('An outcome whose source is not on the page')
  })

  it('resolves every evidence question to an honest state for a legacy record', () => {
    const questions = buildDossierQuestionRegistry(
      dossier({ bindingState: 'legacy_record', conclusion: undefined }),
    )
    const byId = new Map(questions.map((question) => [question.id, question]))

    expect(questions.map((question) => question.id)).toEqual(UNIVERSE_IDS)
    expect(byId.get('q-bottom-line')?.coverage).toBe('not_yet_documented')
    expect(byId.get('q-bottom-line')?.coverageNote).toContain('has not been reviewed')
    expect(byId.get('q-bottom-line')?.items).toEqual([])
    // Identity and the corrections process are recorded facts on every record.
    expect(byId.get('q-identity')?.coverage).toBe('answered')
    expect(byId.get('q-corrections')?.coverage).toBe('answered')
    // A legacy mechanism answer mirrors the page and names its medicine-wide basis.
    expect(byId.get('q-mechanism')?.coverage).toBe('answered')
    expect(byId.get('q-mechanism')?.answerLead).toContain('medicine-wide research record')
  })

  it('marks evidence questions as awaiting review for an unpublished programme', () => {
    const questions = buildDossierQuestionRegistry(
      dossier({ bindingState: 'programme_unpublished', conclusion: undefined }),
    )
    const byId = new Map(questions.map((question) => [question.id, question]))

    expect(byId.get('q-bottom-line')?.coverage).toBe('awaiting_review')
    expect(byId.get('q-measurement')?.coverage).toBe('awaiting_review')
    expect(byId.get('q-measurement')?.items).toEqual([])
  })

  it('never answers an evidence question without a completed independent review', () => {
    const questions = buildDossierQuestionRegistry(dossier({ review: { historyHref: '/history' } }))
    const byId = new Map(questions.map((question) => [question.id, question]))

    expect(byId.get('q-bottom-line')?.coverage).toBe('awaiting_review')
    expect(byId.get('q-measurement')?.coverage).toBe('awaiting_review')
    expect(byId.get('q-review-provenance')?.coverage).toBe('awaiting_review')
  })

  it('downgrades honestly when no source binding supports a recorded claim', () => {
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

    const byId = new Map(
      buildDossierQuestionRegistry(unsupported).map((question) => [question.id, question]),
    )
    expect(byId.get('q-measurement')?.coverage).toBe('not_yet_documented')
    expect(byId.get('q-measurement')?.coverageNote).toContain(
      'not yet linked to an exact saved source',
    )
    expect(byId.get('q-measurement')?.items).toEqual([])
    expect(byId.get('q-mechanism')?.coverage).toBe('not_yet_documented')
    expect(byId.get('q-mechanism')?.items).toEqual([])
  })

  it('keeps corpus-wide honesty for questions no record can answer yet', () => {
    const byId = new Map(
      buildDossierQuestionRegistry(dossier()).map((question) => [question.id, question]),
    )
    expect(byId.get('q-applicability')?.coverage).toBe('not_yet_documented')
    expect(byId.get('q-applicability')?.coverageNote).toContain('who was excluded')
  })

  it('server-renders the universe with honest state badges and no special SEO schema', () => {
    const html = renderToStaticMarkup(
      React.createElement(DossierQuestionCoverage, { dossier: dossier() }),
    )

    expect(html).toContain('Questions this record can answer')
    expect(html.match(/<details/gu)).toHaveLength(UNIVERSE_IDS.length)
    expect(html).toContain('says so plainly instead of being filled in')
    expect(html).toContain('Answered')
    expect(html).toContain('Not yet documented')
    expect(html).toContain('12.4 percentage points')
    expect(html).toContain('Source 1: Outcome source')
    expect(html).toContain('Supports:')
    expect(html).toContain('id="q-measurement"')
    expect(html).toContain('Link to this question: #q-measurement')
    expect(html).not.toMatch(/Universal Clinical Question Universe|Q-20|FAQPage|QAPage/iu)
    expect(html).not.toContain('An outcome whose source is not on the page')
  })
})
