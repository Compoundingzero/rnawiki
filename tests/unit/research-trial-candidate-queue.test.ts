import { describe, expect, it } from 'vitest'
import {
  buildTrialReviewCandidate,
  loadLegacyTrialRows,
  type LegacyTrialRow,
  type RegistryStudy,
} from '../../scripts/research/trial-candidate-queue'

const row: LegacyTrialRow = {
  record: 'test-drug',
  rowIndex: 0,
  trialIdentifier: 'NCT12345678',
  endpointAsRecorded: 'Change in blood pressure at Week 12',
  activeResultAsRecorded: 'Test drug: -5.2',
  comparatorResultAsRecorded: 'Placebo: -1.1',
  differenceAsRecorded: '-4.1',
  uncertaintyAsRecorded: '95% CI -6.0 to -2.2',
  timepointAsRecorded: 'Week 12',
  source: { kind: 'CLINICALTRIALS', identifier: 'NCT12345678' },
}

const study: RegistryStudy = {
  hasResults: true,
  protocolSection: {
    identificationModule: { nctId: 'NCT12345678' },
    statusModule: { resultsFirstPostDateStruct: { date: '2025-01-01' } },
    conditionsModule: { conditions: ['Hypertension'] },
    eligibilityModule: {
      sex: 'ALL',
      minimumAge: '18 Years',
      eligibilityCriteria: 'Adults with hypertension',
    },
    armsInterventionsModule: {
      armGroups: [
        {
          label: 'Test drug',
          type: 'EXPERIMENTAL',
          description: 'Oral tablet once daily',
          interventionNames: ['Drug: Test drug'],
        },
        {
          label: 'Placebo',
          type: 'PLACEBO_COMPARATOR',
          description: 'Oral tablet once daily',
          interventionNames: ['Drug: Placebo'],
        },
      ],
      interventions: [
        {
          type: 'DRUG',
          name: 'Test drug',
          description: 'Oral tablet',
          armGroupLabels: ['Test drug'],
        },
        { type: 'DRUG', name: 'Placebo', description: 'Oral tablet', armGroupLabels: ['Placebo'] },
      ],
    },
  },
  resultsSection: {
    outcomeMeasuresModule: {
      outcomeMeasures: [
        {
          type: 'PRIMARY',
          title: 'Change in blood pressure',
          timeFrame: 'Week 12',
          reportingStatus: 'POSTED',
          unitOfMeasure: 'mmHg',
          groups: [
            { id: 'OG000', title: 'Test drug' },
            { id: 'OG001', title: 'Placebo' },
          ],
          classes: [
            {
              categories: [
                {
                  measurements: [
                    { groupId: 'OG000', value: '-5.2' },
                    { groupId: 'OG001', value: '-1.1' },
                  ],
                },
              ],
            },
          ],
          analyses: [
            {
              groupIds: ['OG000', 'OG001'],
              paramType: 'Difference',
              paramValue: '-4.1',
              ciPctValue: '95',
              ciLowerLimit: '-6.0',
              ciUpperLimit: '-2.2',
            },
          ],
        },
      ],
    },
  },
}

describe('registry research candidate queue', () => {
  it('selects only registry-cited rows from the recorded corpus', () => {
    const line = JSON.stringify({
      id: 'test-drug',
      recordedBackground: {
        pivotalResults: [row, { ...row, source: { kind: 'FDA_LABEL', identifier: 'label-id' } }],
      },
    })
    expect(loadLegacyTrialRows(line)).toMatchObject({
      excludedNonRegistry: 1,
      rows: [{ record: 'test-drug', rowIndex: 0 }],
    })
  })

  it('extracts same-study scope, module-local groups, numeric values and uncertainty as review-only', () => {
    const candidate = buildTrialReviewCandidate(row, study)
    expect(candidate.status).toBe('REVIEW_ONLY')
    expect(candidate.blockers).toEqual([])
    expect(candidate.condition.candidatesAsRegistered).toEqual(['Hypertension'])
    expect(candidate.formulationAndRoute).toMatchObject({ explicitForm: true, explicitRoute: true })
    expect(candidate.result?.measurements).toMatchObject([
      { groupId: 'OG000', groupTitle: 'Test drug', value: '-5.2' },
      { groupId: 'OG001', groupTitle: 'Placebo', value: '-1.1' },
    ])
    expect(candidate.result?.analyses[0]).toMatchObject({
      estimate: '-4.1',
      confidenceLevel: '95',
      lowerLimit: '-6.0',
      upperLimit: '-2.2',
    })
  })

  it('never binds a value to a different NCT or unmatched source identifier', () => {
    const wrongStudy = structuredClone(study)
    wrongStudy.protocolSection!.identificationModule!.nctId = 'NCT00000001'
    expect(buildTrialReviewCandidate(row, wrongStudy)).toMatchObject({
      result: undefined,
      blockers: expect.arrayContaining(['api_nct_mismatch']),
    })
    expect(
      buildTrialReviewCandidate(
        { ...row, source: { kind: 'CLINICALTRIALS', identifier: 'NCT00000001' } },
        study,
      ),
    ).toMatchObject({
      result: undefined,
      blockers: expect.arrayContaining(['legacy_source_not_same_nct']),
    })
  })

  it('does not infer formulation or route, and flags unreconciled legacy numbers', () => {
    const noForm = structuredClone(study)
    noForm.protocolSection!.armsInterventionsModule!.interventions![0]!.description = 'Once daily'
    noForm.protocolSection!.armsInterventionsModule!.armGroups![0]!.description = 'Once daily'
    const candidate = buildTrialReviewCandidate(
      { ...row, activeResultAsRecorded: 'Test drug: -9.9' },
      noForm,
    )
    expect(candidate.blockers).toEqual(
      expect.arrayContaining([
        'product_form_not_explicit_in_matched_intervention',
        'route_not_explicit_in_matched_intervention',
        'legacy_numbers_not_all_reconciled',
      ]),
    )
    expect(candidate.legacyNumberChecks.activeResultAsRecorded?.absentFromSelectedOutcome).toEqual([
      '-9.9',
    ])
  })

  it('requires a human choice for close co-primary outcomes', () => {
    const ambiguous = structuredClone(study)
    ambiguous.resultsSection!.outcomeMeasuresModule!.outcomeMeasures!.push({
      ...structuredClone(ambiguous.resultsSection!.outcomeMeasuresModule!.outcomeMeasures![0]),
      title: 'Change in blood pressure',
    })
    const candidate = buildTrialReviewCandidate(row, ambiguous)
    expect(candidate.blockers).toContain('outcome_match_requires_review')
    expect(candidate.result).toBeUndefined()
    expect(candidate.outcomeMatch.ranked).toHaveLength(2)
  })

  it('does not select a secondary outcome for a recorded primary row', () => {
    const twoOutcomes = structuredClone(study)
    twoOutcomes.resultsSection!.outcomeMeasuresModule!.outcomeMeasures!.push({
      ...structuredClone(twoOutcomes.resultsSection!.outcomeMeasuresModule!.outcomeMeasures![0]),
      type: 'SECONDARY',
      title: 'Change in blood pressure at Week 12',
    })
    const primaryRow = { ...row, endpointAsRecorded: 'Primary change in blood pressure at Week 12' }
    expect(buildTrialReviewCandidate(primaryRow, twoOutcomes).outcomeMatch.selectedIndex).toBe(0)
  })

  it('does not join an analysis to a group ID outside its selected outcome', () => {
    const wrongGroups = structuredClone(study)
    wrongGroups.resultsSection!.outcomeMeasuresModule!.outcomeMeasures![0]!.analyses![0]!.groupIds =
      ['OG000', 'FG001']
    expect(buildTrialReviewCandidate(row, wrongGroups).blockers).toContain(
      'analysis_group_outside_selected_outcome',
    )
  })

  it('holds measurements with unknown groups or multiple denominators for review', () => {
    const wrongGroup = structuredClone(study)
    wrongGroup.resultsSection!.outcomeMeasuresModule!.outcomeMeasures![0]!.classes![0]!.categories![0]!.measurements![0]!.groupId =
      'FG000'
    expect(buildTrialReviewCandidate(row, wrongGroup).blockers).toContain(
      'measurement_group_outside_selected_outcome',
    )

    const multipleDenoms = structuredClone(study)
    multipleDenoms.resultsSection!.outcomeMeasuresModule!.outcomeMeasures![0]!.denoms = [
      { units: 'Participants', counts: [{ groupId: 'OG000', value: '100' }] },
      { units: 'Participants', counts: [{ groupId: 'OG000', value: '95' }] },
    ]
    const candidate = buildTrialReviewCandidate(row, multipleDenoms)
    expect(candidate.blockers).toContain('multiple_denominators_require_review')
    expect(candidate.result?.measurements[0]?.denominatorCandidates).toHaveLength(2)
  })

  it('rejects registration-only results and absent comparator measurements', () => {
    const unposted = structuredClone(study)
    unposted.hasResults = false
    unposted.resultsSection = undefined
    expect(buildTrialReviewCandidate(row, unposted).blockers).toContain('results_not_posted')
    const oneArm = structuredClone(study)
    oneArm.resultsSection!.outcomeMeasuresModule!.outcomeMeasures![0]!.classes![0]!.categories![0]!.measurements!.pop()
    expect(buildTrialReviewCandidate(row, oneArm).blockers).toContain(
      'comparator_measurement_requires_review',
    )
  })
})
