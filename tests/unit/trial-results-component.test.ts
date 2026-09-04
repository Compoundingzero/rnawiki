import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  TrialResults,
  trialResultsCapSentence,
  trialResultsFraming,
} from '@/components/dossier/TrialResults'
import { buildTrialResultsView, TRIAL_RESULTS_SHOWN_LIMIT } from '@/lib/dossier'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import type { TrialResultRecord, TrialResultsView } from '@/lib/types'

// Next preserves JSX for its own compiler; Vitest's direct server render uses the classic runtime.
;(globalThis as typeof globalThis & { React: typeof React }).React = React

/**
 * The property under test is that this surface transcribes and never interprets. A posted value
 * appears with its own unit and its own arm; a stated comparison is attributed to the people who
 * ran the study; nothing on the page characterises a result; and a record with registrations but
 * no usable result says so rather than vanishing. Any of those failing is a release failure.
 */

const SOURCE_IDENTIFIER =
  'clinicaltrials.gov/api/v2 results fetch 2026-09-03 queue-sha256:' + 'a'.repeat(16)

function outcome(overrides: Partial<TrialResultRecord['outcomes'][number]> = {}) {
  return {
    type: 'PRIMARY',
    title: 'Change in forced vital capacity',
    description: null,
    timeFrame: '52 weeks',
    unitOfMeasure: 'mL',
    paramType: 'MEAN',
    dispersionType: 'Standard Deviation',
    denominators: [{ groupTitle: 'Drug', value: 174, units: 'Participants' }],
    values: [
      {
        classTitle: null,
        categoryTitle: null,
        groupTitle: 'Drug',
        value: '-235.9',
        spread: '30.1',
        lowerLimit: null,
        upperLimit: null,
      },
      {
        classTitle: null,
        categoryTitle: null,
        groupTitle: 'Placebo',
        value: '-428.0',
        spread: '31.2',
        lowerLimit: null,
        upperLimit: null,
      },
    ],
    statedComparisons: [],
    ...overrides,
  }
}

function study(overrides: Partial<TrialResultRecord> = {}): TrialResultRecord {
  return {
    nctId: 'NCT01366209',
    briefTitle: 'A study of the drug against placebo',
    phases: ['PHASE3'],
    studyType: 'INTERVENTIONAL',
    allocation: 'RANDOMIZED',
    masking: 'DOUBLE',
    primaryPurpose: 'TREATMENT',
    armCount: 2,
    overallStatus: 'COMPLETED',
    enrolment: {
      count: 555,
      type: 'ACTUAL',
      perArm: [{ groupTitle: 'Drug', started: 278, completed: 261 }],
    },
    primaryCompletion: '2013-06-30',
    resultsFirstPosted: '2014-08-12',
    delayedPosting: false,
    outcomes: [outcome()],
    primaryOutcomeCount: 1,
    secondaryOutcomeCount: 0,
    secondaryOutcomesShown: 0,
    adverseEvents: {
      frequencyThreshold: '5',
      timeFrame: '52 weeks',
      perArm: [
        {
          groupTitle: 'Drug',
          seriousAffected: 27,
          seriousAtRisk: 278,
          otherAffected: 270,
          otherAtRisk: 278,
          deathsAffected: null,
          deathsAtRisk: null,
        },
      ],
    },
    publications: [],
    ...overrides,
  }
}

function view(overrides: Partial<TrialResultsView> = {}): TrialResultsView {
  return {
    sourceIdentifier: SOURCE_IDENTIFIER,
    fetchedOn: '2026-09-03',
    fetchedAt: '2026-09-03T00:00:00.000Z',
    totalQualifying: 1,
    withResultsSection: 1,
    failedQualifyingBar: 0,
    rankingRule: 'actual enrolment, then most recently posted results',
    shown: [study()],
    shownLimit: TRIAL_RESULTS_SHOWN_LIMIT,
    secondaryShownLimit: 3,
    ...overrides,
  }
}

function render(current: TrialResultsView | undefined): string {
  return renderToStaticMarkup(
    React.createElement(TrialResults, {
      dossier: { trialResults: current } as unknown as MedicineDossierViewModel,
    }),
  )
}

describe('trial results surface', () => {
  it('prints each posted value with its own arm and the measure’s own dispersion label', () => {
    const markup = render(view())
    expect(markup).toContain('-235.9 (standard deviation 30.1)')
    expect(markup).toContain('-428.0 (standard deviation 31.2)')
    expect(markup).toContain('Drug')
    expect(markup).toContain('Placebo')
  })

  it('never characterises a result', () => {
    const markup = render(view()).toLowerCase()
    for (const phrase of [
      'showed benefit',
      'was effective',
      'well tolerated',
      'worked',
      'improved outcomes',
      'superior to',
      'demonstrated efficacy',
    ]) {
      expect(markup).not.toContain(phrase)
    }
  })

  it('attributes a stated comparison to the people who ran the study, and states nothing else', () => {
    const markup = render(
      view({
        shown: [
          study({
            outcomes: [
              outcome({
                statedComparisons: [
                  {
                    groupTitles: ['Drug', 'Placebo'],
                    groupDescription: 'Difference in annual rate of decline',
                    paramType: 'Mean difference',
                    paramValue: '192.1',
                    dispersionType: null,
                    dispersionValue: null,
                    ciPctValue: '95',
                    ciLowerLimit: '77.7',
                    ciUpperLimit: '306.6',
                    pValue: '0.001',
                    pValueComment: null,
                    statisticalMethod: 'ANCOVA',
                    statisticalComment: null,
                    estimateComment: null,
                    nonInferiorityType: null,
                    nonInferiorityComment: null,
                  },
                ],
              }),
            ],
          }),
        ],
      }),
    )
    expect(markup).toContain('Comparison stated by the people who ran the study')
    expect(markup).toContain('Mean difference: 192.1')
    expect(markup).toContain('95% confidence interval 77.7 to 306.6')
    expect(markup).toContain('p value 0.001')
    expect(markup).toContain('Difference in annual rate of decline')
  })

  it('states the ranking rule and counts what it does not list', () => {
    const sentence = trialResultsCapSentence(view({ totalQualifying: 27 }))
    expect(sentence).toContain('1 of 27 studies with posted results are listed here')
    expect(sentence).toContain('largest first')
    expect(sentence).toContain('26 more studies have posted results that are not listed')
  })

  it('says so plainly when registrations matched but nothing qualified', () => {
    const markup = render(
      view({ shown: [], totalQualifying: 0, withResultsSection: 4, failedQualifyingBar: 4 }),
    )
    expect(markup).toContain('4 of the registered trials')
    expect(markup).toContain('none carries')
    expect(markup).toContain('no value is shown here')
    expect(markup).not.toContain('Posted value')
  })

  it('does not claim a results section when none of the matched trials has one', () => {
    const markup = render(view({ shown: [], totalQualifying: 0, withResultsSection: 0 }))
    expect(markup).toContain('None of the registered trials matched to this record has results')
    expect(markup).toContain('not about whether the medicine works')
  })

  it('reads correctly when exactly one trial has a results section that falls short', () => {
    const markup = render(
      view({ shown: [], totalQualifying: 0, withResultsSection: 1, failedQualifyingBar: 1 }),
    )
    expect(markup).toContain('has a results section')
    expect(markup).toContain('it does not carry')
    expect(markup).not.toContain('but it carries a main measure')
  })

  it('says “1 group”, not “1 groups”', () => {
    const markup = render(view({ shown: [study({ armCount: 1 })] }))
    expect(markup).toContain('1 group')
    expect(markup).not.toContain('1 groups')
  })

  it('never prints the registered title, which routinely characterises a result', () => {
    const markup = render(
      view({
        shown: [study({ briefTitle: 'A Study to Evaluate the Efficacy and Safety of the Drug' })],
      }),
    )
    expect(markup).not.toContain('Efficacy')
    expect(markup).toContain('Registration NCT01366209')
  })

  it('links every shown study to its registry record and marks the new tab', () => {
    const markup = render(view())
    expect(markup).toContain('https://clinicaltrials.gov/study/NCT01366209')
    expect(markup).toContain('opens in a new tab')
  })

  it('counts the additional measures it does not list', () => {
    const markup = render(
      view({ shown: [study({ secondaryOutcomeCount: 9, secondaryOutcomesShown: 3 })] }),
    )
    expect(markup).toContain('6 further additional measures were posted and are not listed here')
  })

  it('renders nothing at all when no results fetch has run for the record', () => {
    expect(render(undefined)).toBe('')
  })

  it('says what a posted value is not', () => {
    const framing = trialResultsFraming()
    expect(framing).toContain('has not calculated anything')
    expect(framing).toContain('not a conclusion about this medicine')
  })

  it('builds a view that carries zero rather than disappearing', () => {
    const built = buildTrialResultsView({
      sourceIdentifier: SOURCE_IDENTIFIER,
      requestedAt: '2026-09-03T00:00:00.000Z',
      envelope: {
        totalQualifying: 0,
        withResultsSection: 2,
        failedQualifyingBar: 2,
        shownLimit: 3,
        secondaryShownLimit: 3,
        rankingRule: 'actual enrolment, then most recently posted results',
        studies: [],
      },
    })
    expect(built).not.toBeNull()
    expect(built?.totalQualifying).toBe(0)
    expect(built?.failedQualifyingBar).toBe(2)
    expect(built?.fetchedOn).toBe('2026-09-03')
  })

  it('caps what it shows even if the stored envelope carries more', () => {
    const built = buildTrialResultsView({
      sourceIdentifier: SOURCE_IDENTIFIER,
      requestedAt: '2026-09-03T00:00:00.000Z',
      envelope: {
        totalQualifying: 9,
        studies: [
          study({ nctId: 'NCT00000001' }),
          study({ nctId: 'NCT00000002' }),
          study({ nctId: 'NCT00000003' }),
          study({ nctId: 'NCT00000004' }),
        ],
      },
    })
    expect(built?.shown).toHaveLength(TRIAL_RESULTS_SHOWN_LIMIT)
  })
})
