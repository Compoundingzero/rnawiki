import { describe, expect, it } from 'vitest'

import {
  EVIDENCE_ENGINE_VERSION,
  runEvidenceIntelligence,
  type EvidenceIntelligenceInput,
} from '@/lib/rna-intelligence'
import { sha256Hex } from '@/lib/rna-intelligence/evidence-digest'
import { cloneEvidenceInput, validEvidenceInput } from './evidence-fixture'

function findingCodes(input: EvidenceIntelligenceInput): string[] {
  return runEvidenceIntelligence(input).findings.map((finding) => finding.code)
}

interface RuleCase {
  code: string
  mutate: (input: EvidenceIntelligenceInput) => void
}

describe('runEvidenceIntelligence contract', () => {
  it('returns a publication-eligible deterministic report for a complete unanswered-test record', () => {
    const input = validEvidenceInput()
    const first = runEvidenceIntelligence(input)
    const second = runEvidenceIntelligence(structuredClone(input))

    expect(first).toEqual(second)
    expect(first.engineVersion).toBe(EVIDENCE_ENGINE_VERSION)
    expect(first.inputDigestAlgorithm).toBe('sha256')
    expect(first.inputDigest).toMatch(/^[0-9a-f]{64}$/)
    expect(first.canPublish).toBe(true)
    expect(first.blocks).toEqual([])
    expect(first.humanJudgment).toMatchObject({
      required: true,
      verdictSelectedByEngine: false,
    })
    expect(first).not.toHaveProperty('timestamp')
  })

  it('uses standards-compatible SHA-256 without a runtime-only dependency', () => {
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
    expect(sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    )
    expect(sha256Hex('🧬 RNA evidence')).toHaveLength(64)
  })

  it('changes the digest when a semantic evidence input changes', () => {
    const first = validEvidenceInput()
    const second = cloneEvidenceInput()
    second.programmes[0]!.population = 'A different sourced population'

    expect(runEvidenceIntelligence(first).inputDigest).not.toBe(
      runEvidenceIntelligence(second).inputDigest,
    )
  })

  it('gives every finding the stable actionable contract', () => {
    const input = cloneEvidenceInput()
    input.claims.find((claim) => claim.id === 'claim-human')!.sourceIds = []
    const finding = runEvidenceIntelligence(input).findings.find(
      (entry) => entry.code === 'C_MEASURED_CLAIM_SOURCE_MISSING',
    )

    expect(finding).toMatchObject({
      level: 'BLOCK',
      group: 'C',
      code: 'C_MEASURED_CLAIM_SOURCE_MISSING',
      affectedField: 'sourceIds',
      claimId: 'claim-human',
    })
    expect(finding?.affectedEntity).toEqual({
      type: 'CLAIM',
      id: 'claim-human',
      field: 'sourceIds',
    })
    expect(finding?.message.length).toBeGreaterThan(10)
    expect(finding?.correctiveAction.length).toBeGreaterThan(10)
  })
})

describe('Group B — programme scope and identifier consistency', () => {
  const blockers: RuleCase[] = [
    {
      code: 'B_PROGRAMME_CLAIM_MISSING_PROGRAMME',
      mutate: (input) => {
        input.claims[0]!.programmeId = undefined
      },
    },
    {
      code: 'B_CLAIM_MEDICINE_MISMATCH',
      mutate: (input) => {
        input.claims[0]!.medicineId = 'medicine-2'
      },
    },
    {
      code: 'B_TRIAL_MEDICINE_MISMATCH',
      mutate: (input) => {
        input.trials[0]!.medicineId = 'medicine-2'
      },
    },
    {
      code: 'B_TRIAL_INDICATION_MISMATCH',
      mutate: (input) => {
        input.trials[0]!.indication = 'Another condition'
      },
    },
    {
      code: 'B_VERDICT_ATTACHED_TO_MEDICINE',
      mutate: (input) => {
        input.verdicts[0]!.programmeId = undefined
      },
    },
    {
      code: 'B_VERDICT_INDICATION_SCOPE_MISSING',
      mutate: (input) => {
        input.verdicts[0]!.scope.indication = ''
      },
    },
    {
      code: 'B_VERDICT_POPULATION_SCOPE_MISSING',
      mutate: (input) => {
        input.verdicts[0]!.scope.population = ''
      },
    },
    {
      code: 'B_VERDICT_DOSE_SCOPE_MISSING',
      mutate: (input) => {
        input.verdicts[0]!.scope.doseOrExposure = ''
      },
    },
    {
      code: 'B_VERDICT_PERIOD_SCOPE_MISSING',
      mutate: (input) => {
        input.verdicts[0]!.scope.period = ''
      },
    },
    {
      code: 'B_VERDICT_TRIAL_SCOPE_MISSING',
      mutate: (input) => {
        input.verdicts[0]!.scope.trialIds = []
      },
    },
    {
      code: 'B_VERDICT_OUTCOME_SCOPE_MISSING',
      mutate: (input) => {
        input.verdicts[0]!.scope.outcome = ''
      },
    },
    {
      code: 'B_STOPPED_VERDICT_ON_ACTIVE_PROGRAMME',
      mutate: (input) => {
        input.programmes[0]!.status = 'ACTIVE'
      },
    },
    {
      code: 'B_MUTABLE_VERDICT_SHARED',
      mutate: (input) => {
        input.programmes.push({
          ...structuredClone(input.programmes[0]!),
          id: 'programme-2',
          currentVerdictId: 'verdict-1',
        })
      },
    },
  ]

  for (const testCase of blockers) {
    it(`emits ${testCase.code}`, () => {
      const input = cloneEvidenceInput()
      testCase.mutate(input)
      const report = runEvidenceIntelligence(input)
      expect(report.blocks.map((finding) => finding.code)).toContain(testCase.code)
    })
  }

  const warnings: RuleCase[] = [
    {
      code: 'B_POPULATION_SCOPE_VAGUE',
      mutate: (input) => {
        input.programmes[0]!.population = 'Patients'
      },
    },
    {
      code: 'B_DOSE_CONTEXT_MISSING',
      mutate: (input) => {
        input.programmes[0]!.doseOrExposure = ''
      },
    },
    {
      code: 'B_APPROVAL_JURISDICTION_MISSING',
      mutate: (input) => {
        input.programmes[0]!.approvalIsJurisdictionSpecific = true
        input.programmes[0]!.jurisdiction = ''
      },
    },
    {
      code: 'B_DISTINCT_POPULATIONS_COMBINED',
      mutate: (input) => {
        input.programmes[0]!.combinesDistinctPopulations = true
      },
    },
  ]

  for (const testCase of warnings) {
    it(`emits ${testCase.code} as a warning`, () => {
      const input = cloneEvidenceInput()
      testCase.mutate(input)
      expect(runEvidenceIntelligence(input).warnings.map((finding) => finding.code)).toContain(
        testCase.code,
      )
    })
  }
})

describe('Group C — citation, source, and snapshot provenance', () => {
  const blockers: RuleCase[] = [
    {
      code: 'C_MEASURED_CLAIM_SOURCE_MISSING',
      mutate: (input) => {
        input.claims[0]!.sourceIds = []
      },
    },
    {
      code: 'C_NUMERIC_CLAIM_UNIT_MISSING',
      mutate: (input) => {
        input.claims[0]!.numericValue = 12
        input.claims[0]!.numericUnitRequired = true
      },
    },
    {
      code: 'C_CLAIM_SOURCE_NOT_FOUND',
      mutate: (input) => {
        input.claims[0]!.sourceIds = ['missing-source']
      },
    },
    {
      code: 'C_SOURCE_IDENTIFIER_MISSING',
      mutate: (input) => {
        input.sources[0]!.externalIdentifier = ''
      },
    },
    {
      code: 'C_SOURCE_LOCATOR_MALFORMED',
      mutate: (input) => {
        input.sources[0]!.canonicalLocator = 'not a locator'
      },
    },
    {
      code: 'C_SOURCE_UNRESOLVABLE',
      mutate: (input) => {
        input.sources[0]!.resolutionStatus = 'UNRESOLVABLE'
      },
    },
    {
      code: 'C_SOURCE_SNAPSHOT_MISSING',
      mutate: (input) => {
        input.sourceSnapshots = []
      },
    },
    {
      code: 'C_SNAPSHOT_HASH_MISSING',
      mutate: (input) => {
        input.sourceSnapshots[0]!.contentHash = ''
      },
    },
    {
      code: 'C_SOURCE_DEPENDENT_VERDICT_NO_CLAIMS',
      mutate: (input) => {
        input.verdicts[0]!.supportingClaimIds = []
      },
    },
    {
      code: 'C_SOURCE_TRIAL_MISMATCH',
      mutate: (input) => {
        input.sources[0]!.trialId = 'another-trial'
      },
    },
  ]

  for (const testCase of blockers) {
    it(`emits ${testCase.code}`, () => {
      const input = cloneEvidenceInput()
      testCase.mutate(input)
      expect(runEvidenceIntelligence(input).blocks.map((finding) => finding.code)).toContain(
        testCase.code,
      )
    })
  }

  it('warns for stale, unavailable, corrected, sponsor-only, and unavailable-result sources', () => {
    const input = cloneEvidenceInput()
    input.asOfDate = '2028-08-22'
    input.sources[0]!.resolutionStatus = 'TEMPORARILY_UNAVAILABLE'
    input.sources[0]!.correctionStatus = 'CORRECTED'
    input.programmes[0]!.stoppingReasonClaimIds = ['claim-unanswered']
    const stopping = input.claims.find((claim) => claim.id === 'claim-unanswered')!
    stopping.nature = 'SPONSOR_REPORTED'
    stopping.stoppingReason = true
    input.trials[0]!.resultsStatus = 'UNAVAILABLE'

    const codes = runEvidenceIntelligence(input).warnings.map((finding) => finding.code)
    expect(codes).toEqual(
      expect.arrayContaining([
        'C_SOURCE_STALE',
        'C_SOURCE_TEMPORARILY_UNAVAILABLE',
        'C_SOURCE_CORRECTION_OR_RETRACTION',
        'C_STOPPING_REASON_SPONSOR_ONLY',
        'C_PRIMARY_RESULTS_UNAVAILABLE',
      ]),
    )
  })

  it('warns when a secondary source is cited while a matching primary source exists', () => {
    const input = cloneEvidenceInput()
    input.sources[0]!.hierarchy = 'SECONDARY'
    input.sources.push({
      ...structuredClone(input.sources[0]!),
      id: 'source-primary-2',
      hierarchy: 'PRIMARY',
      externalIdentifier: 'NCT00000001-primary',
      canonicalLocator: 'https://example.org/primary/NCT00000001',
    })
    input.sourceSnapshots.push({
      id: 'snapshot-primary-2',
      sourceId: 'source-primary-2',
      retrievedAt: '2026-08-01',
      contentHash: 'sha256:primary-2',
    })

    expect(findingCodes(input)).toContain('C_SECONDARY_SOURCE_WHEN_PRIMARY_AVAILABLE')
  })

  it('warns when linked evidence claims conflict', () => {
    const input = cloneEvidenceInput()
    input.claims[0]!.conflictsWithClaimIds = ['claim-useful']
    expect(findingCodes(input)).toContain('C_IMPORTANT_SOURCES_CONFLICT')
  })
})

describe('Group D — chronology and study structure', () => {
  const blockers: RuleCase[] = [
    {
      code: 'D_PROGRAMME_END_BEFORE_START',
      mutate: (input) => {
        input.programmes[0]!.endDate = '2023-01-01'
      },
    },
    {
      code: 'D_TRIAL_END_BEFORE_START',
      mutate: (input) => {
        input.trials[0]!.endDate = '2024-01-01'
      },
    },
    {
      code: 'D_RESULT_BEFORE_TRIAL_START',
      mutate: (input) => {
        input.claims[0]!.resultDate = '2024-12-01'
      },
    },
    {
      code: 'D_DUPLICATE_TRIAL_IDENTIFIER',
      mutate: (input) => {
        input.trials.push({ ...structuredClone(input.trials[0]!), id: 'trial-2' })
      },
    },
    {
      code: 'D_PARTICIPANT_OUTCOME_ON_NON_HUMAN_TRIAL',
      mutate: (input) => {
        input.trials[0]!.subjectType = 'ANIMAL'
      },
    },
    {
      code: 'D_COMPARATOR_GROUP_MISSING',
      mutate: (input) => {
        input.claims[0]!.comparatorResult = { value: 7 }
      },
    },
    {
      code: 'D_PHASE_ORDER_IMPOSSIBLE',
      mutate: (input) => {
        input.programmes[0]!.phaseEvents = [
          { id: 'phase-3', phase: 'PHASE_3', date: '2024-01-01' },
          { id: 'phase-1', phase: 'PHASE_1', date: '2025-01-01' },
        ]
      },
    },
    {
      code: 'D_SOURCE_PUBLISHED_AFTER_RETRIEVAL',
      mutate: (input) => {
        input.sources[0]!.publicationDate = '2027-01-01'
      },
    },
    {
      code: 'D_SNAPSHOT_DATE_IN_FUTURE',
      mutate: (input) => {
        input.sourceSnapshots[0]!.retrievedAt = '2027-01-01'
      },
    },
  ]

  for (const testCase of blockers) {
    it(`emits ${testCase.code}`, () => {
      const input = cloneEvidenceInput()
      testCase.mutate(input)
      expect(runEvidenceIntelligence(input).blocks.map((finding) => finding.code)).toContain(
        testCase.code,
      )
    })
  }

  it('warns rather than blocks a sourced phase-order exception', () => {
    const input = cloneEvidenceInput()
    input.programmes[0]!.phaseEvents = [
      { id: 'phase-3', phase: 'PHASE_3', date: '2024-01-01' },
      {
        id: 'phase-1',
        phase: 'PHASE_1',
        date: '2025-01-01',
        orderingExceptionReason: 'A separate formulation entered phase 1 later.',
      },
    ]
    const report = runEvidenceIntelligence(input)
    expect(report.warnings.map((finding) => finding.code)).toContain(
      'D_PHASE_ORDER_EXCEPTION_RECORDED',
    )
    expect(report.blocks.map((finding) => finding.code)).not.toContain('D_PHASE_ORDER_IMPOSSIBLE')
  })
})
