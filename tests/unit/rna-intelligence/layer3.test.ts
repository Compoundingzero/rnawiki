import { describe, expect, it } from 'vitest'

import { CANONICAL_PHASE_ORDER, validateLayer3 } from '@/lib/rna-intelligence/layer3-protocol'
import type { LaboratoryProtocolStep, ProtocolPhase } from '@/lib/types'

/** Minimal step builder. Layer 3 reads id, stepNumber, phase, name and dependsOnStepId. */
function step(
  id: string,
  stepNumber: number,
  phase: ProtocolPhase,
  dependsOnStepId?: string,
): LaboratoryProtocolStep {
  return {
    id,
    stepNumber,
    phase,
    name: `Step ${id}`,
    description: 'Reaction conditions omitted for the fixture.',
    reagentsAndBuffer: 'Standard buffer (pH 7.4)',
    ...(dependsOnStepId === undefined ? {} : { dependsOnStepId }),
  }
}

function codes(result: { diagnostics: { code: string }[] }): string[] {
  return result.diagnostics.map((d) => d.code)
}

describe('validateLayer3', () => {
  it('passes an empty workflow with a warning, because a stub record is not a broken one', () => {
    const result = validateLayer3([])

    expect(result.passed).toBe(true)
    expect(result.isDagValid).toBe(true)
    expect(result.totalSteps).toBe(0)
    expect(codes(result)).toEqual(['L3_NO_WORKFLOW'])
    expect(result.diagnostics[0]?.severity).toBe('warning')
    expect(result.edges).toEqual([])
  })

  it('chains steps by stepNumber when no dependency is declared anywhere', () => {
    // Submitted out of order on purpose: the chain follows stepNumber, not array position.
    const result = validateLayer3([
      step('c', 3, 'Purification'),
      step('a', 1, 'QC'),
      step('b', 2, 'Synthesis'),
    ])

    expect(result.passed).toBe(true)
    expect(result.edges).toEqual([
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
    ])
    expect(result.topologicalOrder).toEqual(['a', 'b', 'c'])
    expect(result.orphanSteps).toEqual([])
    expect(codes(result)).toContain('L3_DAG_VALID')
  })

  it('does not invent implicit edges once any step declares a dependency', () => {
    // 'c' declares its parent, so 'a' and 'b' are read as genuine roots rather than a chain.
    const result = validateLayer3([
      step('a', 1, 'QC'),
      step('b', 2, 'Synthesis'),
      step('c', 3, 'Purification', 'b'),
    ])

    expect(result.edges).toEqual([{ from: 'b', to: 'c' }])
    expect(result.orphanSteps).toEqual(['a'])
    expect(codes(result)).toContain('L3_ORPHAN_STEP')
    // An orphan is a warning: a parallel branch is legitimate.
    expect(result.passed).toBe(true)
  })

  it('detects a dependency cycle and refuses to publish a partial order', () => {
    const result = validateLayer3([
      step('a', 1, 'Synthesis', 'b'),
      step('b', 2, 'Purification', 'a'),
    ])

    expect(result.passed).toBe(false)
    expect(result.isDagValid).toBe(false)
    expect(result.cycleMembers.sort()).toEqual(['a', 'b'])
    expect(result.topologicalOrder).toEqual([])
    expect(codes(result)).toContain('L3_CYCLE_DETECTED')
  })

  it('treats a self-dependency as a one-member cycle', () => {
    const result = validateLayer3([step('a', 1, 'QC', 'a'), step('b', 2, 'Synthesis', 'a')])

    expect(result.passed).toBe(false)
    expect(result.cycleMembers).toEqual(['a', 'b'])
    expect(codes(result)).toContain('L3_CYCLE_DETECTED')
  })

  it('detects a dependency naming a step that is not in the workflow', () => {
    const result = validateLayer3([
      step('a', 1, 'QC'),
      step('b', 2, 'Synthesis', 'step-deleted-last-week'),
    ])

    expect(result.passed).toBe(false)
    expect(result.isDagValid).toBe(false)
    expect(result.danglingDependencies).toEqual(['step-deleted-last-week'])
    expect(result.edges).toEqual([])
    expect(codes(result)).toContain('L3_DANGLING_DEPENDENCY')
    expect(result.brokenDependencies[0]).toContain('step-deleted-last-week')
  })

  it('detects a phase regression on an edge, naming both steps and both phases', () => {
    // A Synthesis step waiting on a Purification step: purified material is not re-synthesised.
    const result = validateLayer3([
      step('purify', 1, 'Purification'),
      step('synth', 2, 'Synthesis', 'purify'),
    ])

    expect(result.passed).toBe(false)
    // The graph itself is a perfectly good DAG — only the chemistry is impossible.
    expect(result.isDagValid).toBe(true)
    expect(codes(result)).toContain('L3_PHASE_REGRESSION')
    expect(result.brokenDependencies).toHaveLength(1)
    const sentence = result.brokenDependencies[0] ?? ''
    expect(sentence).toContain('Step synth')
    expect(sentence).toContain('Step purify')
    expect(sentence).toContain('Synthesis')
    expect(sentence).toContain('Purification')
  })

  it('allows repeated and skipped phases as long as the order moves forward', () => {
    const result = validateLayer3([
      step('a', 1, 'Synthesis'),
      step('b', 2, 'Synthesis'),
      step('c', 3, 'Assay_Quantification'),
    ])

    expect(result.passed).toBe(true)
    expect(result.brokenDependencies).toEqual([])
  })

  it('fails hard on duplicate step ids without reporting derived findings', () => {
    const result = validateLayer3([
      step('a', 1, 'QC'),
      step('a', 2, 'Synthesis'),
      step('b', 3, 'Purification'),
    ])

    expect(result.passed).toBe(false)
    expect(result.isDagValid).toBe(false)
    expect(codes(result)).toEqual(['L3_DUPLICATE_STEP_ID'])
    expect(result.edges).toEqual([])
    expect(result.topologicalOrder).toEqual([])
    expect(result.cycleMembers).toEqual([])
  })

  it('reports missing phases as a warning, never as a failure', () => {
    const result = validateLayer3([step('only', 1, 'Purification')])

    expect(result.passed).toBe(true)
    expect(result.missingPhases).toEqual(
      CANONICAL_PHASE_ORDER.filter((phase) => phase !== 'Purification'),
    )
    expect(codes(result)).toContain('L3_MISSING_PHASES')
    expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([])
    // A single-step workflow has no orphan: it is a complete one-step protocol.
    expect(result.orphanSteps).toEqual([])
  })

  it('is deterministic and does not mutate the caller array', () => {
    const steps = [step('c', 3, 'Purification'), step('a', 1, 'QC'), step('b', 2, 'Synthesis')]
    const before = steps.map((s) => s.id)

    const first = validateLayer3(steps)
    const second = validateLayer3(steps)

    expect(second).toEqual(first)
    expect(steps.map((s) => s.id)).toEqual(before)
  })

  it('orders a diamond deterministically', () => {
    // root -> left, root -> right, both -> merge. Kahn admits two valid orders; the engine must
    // always pick the same one, or the topological order shown to a reader would flicker.
    const steps = [
      step('root', 1, 'QC'),
      step('left', 2, 'Synthesis', 'root'),
      step('right', 3, 'Synthesis', 'root'),
      step('merge', 4, 'Purification', 'left'),
    ]

    const result = validateLayer3(steps)

    expect(result.passed).toBe(true)
    expect(result.topologicalOrder).toEqual(['root', 'left', 'right', 'merge'])
  })
})
