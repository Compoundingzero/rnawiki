import { describe, expect, it } from 'vitest'

import type { MedicineRecordedBackground } from '@/lib/background/types'
import { recordedFactsFor, type ContextualPivotalResult } from '@/lib/dossier-v4/recorded-facts'

const studySource = {
  kind: 'CLINICALTRIALS' as const,
  identifier: 'NCT00000001',
  label: 'Fixture trial registry',
  retrievedAt: '2026-09-19',
}

function background(
  populationTrial = 'NCT00000001',
): MedicineRecordedBackground & { pivotalResults: ContextualPivotalResult[] } {
  return {
    pivotalResults: [
      {
        trialIdentifier: 'NCT00000001',
        trialContext: {
          trialIdentifier: 'NCT00000001',
          studiedConditionAsRecorded: 'Fixture condition',
          testedInterventionAsRecorded: 'Fixture treatment, 10 mg daily',
          formulationAndRouteAsRecorded: 'Oral tablet',
          source: studySource,
        },
        endpointAsRecorded: 'Change in an invented walking score',
        activeResultAsRecorded: '5 points',
        comparatorResultAsRecorded: '3 points',
        differenceAsRecorded: '2 points',
        uncertaintyAsRecorded: '95% CI 1 to 3',
        timepointAsRecorded: '12 weeks',
        source: studySource,
      },
    ],
    applicability: {
      trialIdentifier: populationTrial,
      studiedGroupAsRecorded: 'Adults aged 40–60 with fixture condition',
      includedAsRecorded: ['Fixture diagnosis'],
      excludedAsRecorded: ['Severe kidney impairment'],
      source: studySource,
    },
  } as MedicineRecordedBackground & { pivotalResults: ContextualPivotalResult[] }
}

describe('source-bound study snapshots', () => {
  it('carries the exact result, matched population, and inspectable source', () => {
    const [study] = recordedFactsFor(background()).trialSnapshots
    expect(study).toMatchObject({
      trialIdentifier: 'NCT00000001',
      condition: 'Fixture condition',
      testedIntervention: 'Fixture treatment, 10 mg daily',
      formulationAndRoute: 'Oral tablet',
      population: 'Adults aged 40–60 with fixture condition',
      endpoint: 'Change in an invented walking score',
      activeResult: '5 points',
      comparatorResult: '3 points',
      timepoint: '12 weeks',
      excluded: ['Severe kidney impairment'],
    })
    expect(study?.citation.url).toBe('https://clinicaltrials.gov/study/NCT00000001')
    expect(study?.contextCitation.url).toBe('https://clinicaltrials.gov/study/NCT00000001')
  })

  it('withholds reader-facing numbers without all study-specific context but retains the raw source fact', () => {
    const record = background()
    delete record.pivotalResults![0]!.trialContext
    const facts = recordedFactsFor(record)
    expect(facts.trialSnapshots).toEqual([])
    expect(facts.namedTrial).toHaveLength(1)
    expect(facts.namedTrial[0]?.citation.url).toBe('https://clinicaltrials.gov/study/NCT00000001')
  })

  it.each([
    'studiedConditionAsRecorded',
    'testedInterventionAsRecorded',
    'formulationAndRouteAsRecorded',
  ] as const)('withholds a result whose context lacks %s', (field) => {
    const record = background()
    record.pivotalResults![0]!.trialContext![field] = '  '
    expect(recordedFactsFor(record).trialSnapshots).toEqual([])
  })

  it('withholds context from a different trial or source', () => {
    const otherTrial = background()
    otherTrial.pivotalResults![0]!.trialContext!.trialIdentifier = 'NCT00000002'
    expect(recordedFactsFor(otherTrial).trialSnapshots).toEqual([])

    const otherSource = background()
    otherSource.pivotalResults![0]!.trialContext!.source = {
      ...studySource,
      identifier: 'NCT00000002',
    }
    expect(recordedFactsFor(otherSource).trialSnapshots).toEqual([])
  })

  it('does not borrow the population of a different trial', () => {
    const [study] = recordedFactsFor(background('NCT00000002')).trialSnapshots
    expect(study?.population).toBeNull()
    expect(study?.excluded).toEqual([])
    expect(study?.populationCitation).toBeNull()
    expect(study?.condition).toBe('Fixture condition')
  })

  it('does not attach a registry source whose study number disagrees with the result', () => {
    const record = background()
    record.pivotalResults![0]!.source = {
      ...studySource,
      identifier: 'NCT00000002',
    }
    expect(recordedFactsFor(record).trialSnapshots).toEqual([])
  })

  it('does not render an uninspectable reported number as a checkpoint', () => {
    const record = background()
    record.pivotalResults![0]!.source = {
      kind: 'PUBLISHED_ANALYSIS',
      identifier: 'Unresolved report',
      label: 'Unresolved source',
      retrievedAt: '2026-09-19',
    }
    expect(recordedFactsFor(record).trialSnapshots).toEqual([])
  })
})
