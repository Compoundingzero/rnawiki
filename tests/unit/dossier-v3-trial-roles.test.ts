import { describe, expect, it } from 'vitest'

import {
  classifyTrialRole,
  registryStudyForRoles,
  roleAwareRegistryAggregate,
  type RegistryStudyForRoles,
} from '@/lib/dossier-v3/trial-roles'

const SNAPSHOT = '2026-09-01'

function study(overrides: Partial<RegistryStudyForRoles>): RegistryStudyForRoles {
  return {
    nctId: 'NCT00000000',
    briefTitle: null,
    studyType: 'INTERVENTIONAL',
    overallStatus: 'COMPLETED',
    phases: ['PHASE3'],
    startDate: '2010-01',
    primaryCompletionDate: '2011-01',
    completionDate: '2012-01',
    enrollment: { count: 100, type: 'ACTUAL' },
    interventions: [],
    whyStopped: null,
    hasResults: true,
    ...overrides,
  }
}

/* The shapes below copy the 2026-09-01 snapshot rows that produced the live defects. */

const OBSERVATIONAL_SEMAGLUTIDE = study({
  nctId: 'NCT07096063',
  briefTitle:
    'Comparative Effectiveness of Tirzepatide and Semaglutide in Individuals at Cardiovascular Risk',
  studyType: 'OBSERVATIONAL',
  phases: [],
  enrollment: { count: 887132, type: 'ACTUAL' },
  interventions: [
    { type: 'DRUG', name: 'Tirzepatide', otherNames: [] },
    { type: 'DRUG', name: 'Dulaglutide', otherNames: [] },
    { type: 'DRUG', name: 'Semaglutide', otherNames: [] },
    { type: 'DRUG', name: 'Sitagliptin', otherNames: [] },
  ],
})

const PLANNED_SEMAGLUTIDE = study({
  nctId: 'NCT05441267',
  overallStatus: 'ACTIVE_NOT_RECRUITING',
  phases: ['PHASE4'],
  startDate: '2023-03-13',
  completionDate: '2048-08-17',
  enrollment: { count: 21296, type: 'ACTUAL' },
  interventions: [
    { type: 'DRUG', name: 'Semaglutide Oral Tablet', otherNames: [] },
    { type: 'DRUG', name: 'Placebo oral tablet', otherNames: [] },
  ],
  hasResults: false,
})

const PLANNED_INCLISIRAN = study({
  nctId: 'NCT03705234',
  overallStatus: 'ACTIVE_NOT_RECRUITING',
  startDate: '2018-10-30',
  completionDate: '2049-12',
  enrollment: { count: 16124, type: 'ACTUAL' },
  interventions: [
    { type: 'DRUG', name: 'Inclisiran', otherNames: [] },
    { type: 'DRUG', name: 'Placebo', otherNames: ['Saline solution'] },
  ],
  hasResults: false,
})

const TRIBULUS = study({
  nctId: 'NCT06260007',
  overallStatus: 'RECRUITING',
  phases: ['PHASE4'],
  startDate: '2024-07-12',
  completionDate: '2026-08-17',
  enrollment: { count: 204, type: 'ESTIMATED' },
  interventions: [
    { type: 'DRUG', name: 'Tribulus terrestris', otherNames: [] },
    { type: 'OTHER', name: 'Placebo', otherNames: [] },
  ],
  hasResults: false,
})

const CREATINE_SOLE = study({
  nctId: 'NCT00081250',
  startDate: '2004-12',
  completionDate: '2017-07',
  enrollment: { count: 300, type: 'ESTIMATED' },
  interventions: [
    { type: 'DIETARY_SUPPLEMENT', name: 'creatine monohydrate', otherNames: [] },
    { type: 'OTHER', name: 'placebo', otherNames: [] },
  ],
})

const HEAD_TO_HEAD = study({
  nctId: 'NCT03987919',
  interventions: [
    { type: 'DRUG', name: 'Tirzepatide', otherNames: [] },
    { type: 'DRUG', name: 'Semaglutide', otherNames: [] },
  ],
})

const WITHDRAWN_ZERO = study({
  nctId: 'NCT06280976',
  overallStatus: 'WITHDRAWN',
  enrollment: { count: 0, type: 'ESTIMATED' },
  completionDate: '2025-01',
  interventions: [{ type: 'DRUG', name: 'Inclisiran', otherNames: [] }],
  whyStopped: 'study withdrawn, no participants enrolled',
  hasResults: false,
})

describe('classifyTrialRole', () => {
  it('an observational study is an exposure, never a tested intervention (fixture 7)', () => {
    const assignment = classifyTrialRole(
      OBSERVATIONAL_SEMAGLUTIDE,
      ['Semaglutide'],
      'intervention',
      SNAPSHOT,
    )
    expect(assignment.role).toBe('observational_exposure')
    expect(assignment.supportsTestedClaim).toBe(false)
    expect(assignment.administered).toBe(false)
  })

  it('the sole active intervention against placebo is the tested intervention', () => {
    const assignment = classifyTrialRole(
      CREATINE_SOLE,
      ['creatine monohydrate'],
      'intervention',
      SNAPSHOT,
    )
    expect(assignment.role).toBe('experimental_intervention')
    expect(assignment.supportsTestedClaim).toBe(true)
  })

  it('a head-to-head trial cannot name a comparator without arm groups (fixture 5)', () => {
    const assignment = classifyTrialRole(HEAD_TO_HEAD, ['Semaglutide'], 'intervention', SNAPSHOT)
    expect(assignment.role).toBe('administered_role_unclear')
    expect(assignment.supportsTestedClaim).toBe(false)
    expect(assignment.basis).toContain('Tirzepatide')
  })

  it('a synonym-matched trial is marked so identity review can find it (fixture 1)', () => {
    const assignment = classifyTrialRole(TRIBULUS, ['Tribulus Terrestris'], 'otherName', SNAPSHOT)
    expect(assignment.synonymMatched).toBe(true)
  })

  it('a stored match with no intervention entry naming the substance is unclear (fixture 10)', () => {
    const assignment = classifyTrialRole(CREATINE_SOLE, ['Tribulus Terrestris'], 'stored', SNAPSHOT)
    expect(assignment.role).toBe('unclear')
    expect(assignment.supportsTestedClaim).toBe(false)
  })

  it('a placebo-only match is a placebo arm', () => {
    const assignment = classifyTrialRole(
      study({
        interventions: [{ type: 'OTHER', name: 'Placebo', otherNames: ['Saline solution'] }],
      }),
      ['Saline solution'],
      'otherName',
      SNAPSHOT,
    )
    expect(assignment.role).toBe('placebo')
  })

  it('a withdrawn zero-enrolment study is kept out of size statistics (fixture 8)', () => {
    const assignment = classifyTrialRole(WITHDRAWN_ZERO, ['Inclisiran'], 'intervention', SNAPSHOT)
    expect(assignment.role).toBe('experimental_intervention')
    expect(assignment.excludedFromSizeStatistics).toBe(true)
  })

  it('a completion date after the snapshot is planned, not a duration (fixture 9)', () => {
    expect(
      classifyTrialRole(PLANNED_INCLISIRAN, ['Inclisiran'], 'intervention', SNAPSHOT)
        .completionIsPlanned,
    ).toBe(true)
    expect(
      classifyTrialRole(CREATINE_SOLE, ['creatine monohydrate'], 'intervention', SNAPSHOT)
        .completionIsPlanned,
    ).toBe(false)
  })
})

describe('roleAwareRegistryAggregate', () => {
  const entries = [
    OBSERVATIONAL_SEMAGLUTIDE,
    PLANNED_SEMAGLUTIDE,
    PLANNED_INCLISIRAN,
    CREATINE_SOLE,
    HEAD_TO_HEAD,
    WITHDRAWN_ZERO,
  ].map((item) => ({
    study: item,
    assignment: classifyTrialRole(
      item,
      ['Semaglutide', 'Inclisiran', 'creatine monohydrate', 'Semaglutide Oral Tablet'],
      'intervention',
      SNAPSHOT,
    ),
  }))
  const aggregate = roleAwareRegistryAggregate(entries, SNAPSHOT)

  it('never lets the observational cohort become the largest trial', () => {
    expect(aggregate.tested.largest?.nctId).not.toBe('NCT07096063')
    expect(aggregate.tested.largest?.enrollment).toBe(21296)
  })

  it('never lets a planned completion date become the longest trial', () => {
    expect(aggregate.tested.longestCompletedWindow?.nctId).toBe('NCT00081250')
    expect(aggregate.plannedCompletionIgnored).toBeGreaterThanOrEqual(2)
  })

  it('keeps the withdrawn zero-enrolment study out of the median and the smallest', () => {
    expect(aggregate.excludedFromSizeStatistics).toBe(1)
    expect(aggregate.tested.medianEnrollment).not.toBe(0)
  })

  it('counts roles separately instead of one total', () => {
    expect(aggregate.byRole.observational_exposure).toBe(1)
    expect(aggregate.byRole.administered_role_unclear).toBe(1)
    expect(aggregate.byRole.experimental_intervention).toBe(4)
    expect(aggregate.matchedStudies).toBe(6)
  })
})

describe('registryStudyForRoles', () => {
  it('reads the API v2 record shape and refuses a record without an NCT id', () => {
    const parsed = registryStudyForRoles({
      hasResults: false,
      protocolSection: {
        identificationModule: { nctId: 'NCT07096063', briefTitle: 'x' },
        designModule: {
          studyType: 'OBSERVATIONAL',
          enrollmentInfo: { count: 887132, type: 'ACTUAL' },
        },
        statusModule: { overallStatus: 'COMPLETED', completionDateStruct: { date: '2025-01' } },
        armsInterventionsModule: { interventions: [{ type: 'DRUG', name: 'Semaglutide' }] },
      },
    })
    expect(parsed?.studyType).toBe('OBSERVATIONAL')
    expect(parsed?.interventions[0]?.otherNames).toEqual([])
    expect(registryStudyForRoles({ protocolSection: {} })).toBeNull()
  })
})
