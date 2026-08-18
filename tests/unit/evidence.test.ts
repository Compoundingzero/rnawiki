import { describe, expect, it } from 'vitest'
import {
  PROOF_BOUNDARY_STAGES,
  PROOF_BOUNDARY_LABELS,
  isHumanTested,
  stageRank,
  boundaryMovedForward,
  isClarityTested,
  comprehensionRate,
  CLARITY_MIN_RESPONSES,
  CLARITY_MIN_CORRECT_RATE,
  type ProofBoundaryStage,
} from '@/lib/evidence'

describe('PROOF_BOUNDARY_STAGES ordering', () => {
  it('is exactly the eight stages, weakest to strongest', () => {
    expect(PROOF_BOUNDARY_STAGES).toEqual([
      'biological_rationale_only',
      'isolated_cell_evidence',
      'animal_evidence',
      'observational_human_evidence',
      'uncontrolled_human_intervention',
      'controlled_human_evidence',
      'independently_supported_controlled_human_evidence',
      'regulatory_evidence',
    ])
  })

  it('has a label for every stage and no extras', () => {
    const stageSet = new Set<string>(PROOF_BOUNDARY_STAGES)
    expect(Object.keys(PROOF_BOUNDARY_LABELS).sort()).toEqual([...stageSet].sort())
    for (const stage of PROOF_BOUNDARY_STAGES) {
      expect(PROOF_BOUNDARY_LABELS[stage]).toBeTruthy()
    }
  })
})

describe('stageRank', () => {
  it('ranks the first stage 0 and the last stage at length - 1', () => {
    expect(stageRank('biological_rationale_only')).toBe(0)
    expect(stageRank('regulatory_evidence')).toBe(PROOF_BOUNDARY_STAGES.length - 1)
  })

  it('is strictly increasing along the declared order', () => {
    const ranks = PROOF_BOUNDARY_STAGES.map(stageRank)
    for (let i = 1; i < ranks.length; i++) {
      expect(ranks[i]).toBeGreaterThan(ranks[i - 1]!)
    }
  })
})

describe('boundaryMovedForward', () => {
  it('is true when the new stage outranks the previous one', () => {
    expect(boundaryMovedForward('animal_evidence', 'controlled_human_evidence')).toBe(true)
  })

  it('is false when the new stage is weaker (a regression)', () => {
    expect(boundaryMovedForward('controlled_human_evidence', 'animal_evidence')).toBe(false)
  })

  it('is false when the stage is unchanged', () => {
    expect(boundaryMovedForward('animal_evidence', 'animal_evidence')).toBe(false)
  })

  it('is true across the full weakest-to-strongest span', () => {
    expect(boundaryMovedForward('biological_rationale_only', 'regulatory_evidence')).toBe(true)
  })
})

describe('isHumanTested per stage', () => {
  const expected: Record<ProofBoundaryStage, boolean> = {
    biological_rationale_only: false,
    isolated_cell_evidence: false,
    animal_evidence: false,
    observational_human_evidence: true,
    uncontrolled_human_intervention: true,
    controlled_human_evidence: true,
    independently_supported_controlled_human_evidence: true,
    regulatory_evidence: true,
  }

  for (const stage of PROOF_BOUNDARY_STAGES) {
    it(`${stage} -> ${expected[stage]}`, () => {
      expect(isHumanTested(stage)).toBe(expected[stage])
    })
  }
})

describe('isClarityTested / comprehensionRate — the 20-response / 80%-correct gate', () => {
  it('is not clarity-tested below the minimum response count, even at 100% correct', () => {
    expect(isClarityTested({ totalResponses: CLARITY_MIN_RESPONSES - 1, correctResponses: CLARITY_MIN_RESPONSES - 1 })).toBe(
      false
    )
  })

  it('exactly 19 responses (one short) is never clarity-tested regardless of correctness', () => {
    expect(isClarityTested({ totalResponses: 19, correctResponses: 19 })).toBe(false)
    expect(isClarityTested({ totalResponses: 19, correctResponses: 15 })).toBe(false)
  })

  it('exactly 20 responses at just under 80% correct is not clarity-tested', () => {
    // 15/20 = 75% < 80%
    expect(isClarityTested({ totalResponses: 20, correctResponses: 15 })).toBe(false)
    expect(comprehensionRate({ totalResponses: 20, correctResponses: 15 })).toBeCloseTo(0.75)
  })

  it('exactly 20 responses at exactly 80% correct (16/20) is clarity-tested — boundary is inclusive', () => {
    expect(isClarityTested({ totalResponses: 20, correctResponses: 16 })).toBe(true)
    expect(comprehensionRate({ totalResponses: 20, correctResponses: 16 })).toBeCloseTo(CLARITY_MIN_CORRECT_RATE)
  })

  it('more than the minimum responses at exactly the correctness threshold is clarity-tested', () => {
    // 80/100 = 80%
    expect(isClarityTested({ totalResponses: 100, correctResponses: 80 })).toBe(true)
  })

  it('comprehensionRate is 0 for zero responses, and does not divide by zero', () => {
    expect(comprehensionRate({ totalResponses: 0, correctResponses: 0 })).toBe(0)
    expect(isClarityTested({ totalResponses: 0, correctResponses: 0 })).toBe(false)
  })

  it('comprehensionRate reflects an exact fraction', () => {
    expect(comprehensionRate({ totalResponses: 25, correctResponses: 20 })).toBeCloseTo(0.8)
  })
})
