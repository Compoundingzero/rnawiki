import { describe, expect, it } from 'vitest'

import {
  applyExactReleaseA1Repair,
  RELEASE_A1_SELF_CERTIFICATION_REPAIRS,
  type ReleaseA1SelfCertificationRepair,
} from '@/lib/release-a1-self-certification-repairs'

function valueAtPath(root: unknown, path: readonly (string | number)[]): unknown {
  let current = root
  for (const segment of path) {
    if (typeof segment === 'number') {
      if (!Array.isArray(current)) return undefined
      current = current[segment]
    } else {
      if (!current || typeof current !== 'object' || Array.isArray(current)) return undefined
      current = (current as Record<string, unknown>)[segment]
    }
  }
  return current
}

function columnWithValue(path: readonly (string | number)[], value: unknown): unknown {
  if (path.length === 0) throw new Error('Test repair paths cannot be empty.')
  const root: unknown = typeof path[0] === 'number' ? [] : {}
  let current = root

  for (const [index, segment] of path.entries()) {
    const last = index === path.length - 1
    if (typeof segment === 'number') {
      if (!Array.isArray(current)) throw new Error(`Expected test array at ${segment}.`)
      if (last) {
        current[segment] = value
        continue
      }
      const next: unknown = typeof path[index + 1] === 'number' ? [] : {}
      current[segment] = next
      current = next
      continue
    }

    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      throw new Error(`Expected test object at ${segment}.`)
    }
    if (last) {
      ;(current as Record<string, unknown>)[segment] = value
      continue
    }
    const next: unknown = typeof path[index + 1] === 'number' ? [] : {}
    ;(current as Record<string, unknown>)[segment] = next
    current = next
  }

  return root
}

function repairLabel(repair: ReleaseA1SelfCertificationRepair): string {
  return `${repair.slug}:${repair.column}:${repair.path.join('.')}`
}

describe('Release A.1 exact self-certification repairs', () => {
  it('defines all 17 repair targets exactly once across 15 medicines', () => {
    const targetKeys = RELEASE_A1_SELF_CERTIFICATION_REPAIRS.map(repairLabel)
    expect(RELEASE_A1_SELF_CERTIFICATION_REPAIRS).toHaveLength(17)
    expect(new Set(targetKeys).size).toBe(17)
    expect(targetKeys).toEqual([
      'buspirone:keyAudits:0.technicalDetails',
      'caffeine:conditionContext:whyItMatters',
      'caffeine:substitutes:summary',
      'caplacizumab-yhdp:keyAudits:5.technicalDetails',
      'cefdinir:conditionContext:whyItMatters',
      'cephalexin:commonQuestions:4.a',
      'colchicine:commonQuestions:0.a',
      'collagen-peptides:commonQuestions:1.a',
      'collagen-peptides:measuredVsInferredSummary:realWorldOutcome.0',
      'fondaparinux:commonQuestions:4.a',
      'idarucizumab:commonQuestions:1.a',
      'ligandrol:commonQuestions:2.a',
      'nortriptyline:keyAudits:2.technicalDetails',
      'paliperidone:commonQuestions:1.a',
      'resmetirom:commonQuestions:0.a',
      'sitagliptin:conditionContext:whyItMatters',
      'tirzepatide:commonQuestions:2.auditNote',
    ])
    expect(new Set(RELEASE_A1_SELF_CERTIFICATION_REPAIRS.map((repair) => repair.slug)).size).toBe(
      15,
    )
    expect(
      RELEASE_A1_SELF_CERTIFICATION_REPAIRS.filter(
        (repair) => repair.slug === 'collagen-peptides',
      ).map((repair) => `${repair.column}.${repair.path.join('.')}`),
    ).toEqual(['commonQuestions.1.a', 'measuredVsInferredSummary.realWorldOutcome.0'])
  })

  it.each(
    RELEASE_A1_SELF_CERTIFICATION_REPAIRS.map((repair) => [repairLabel(repair), repair] as const),
  )('%s applies only when the exact expected fragment is present once', (_label, repair) => {
    const before = `Prefix retained. ${repair.expectedText} Suffix retained.`
    const column = columnWithValue(repair.path, before)

    expect(applyExactReleaseA1Repair(column, repair)).toBe('applied')
    expect(valueAtPath(column, repair.path)).toBe(
      `Prefix retained. ${repair.replacementText} Suffix retained.`,
    )
  })

  it('is idempotent for every exact replacement', () => {
    for (const repair of RELEASE_A1_SELF_CERTIFICATION_REPAIRS) {
      const alreadyRepaired = `Prefix retained. ${repair.replacementText} Suffix retained.`
      const column = columnWithValue(repair.path, alreadyRepaired)

      expect(applyExactReleaseA1Repair(column, repair), repairLabel(repair)).toBe('already_applied')
      expect(valueAtPath(column, repair.path)).toBe(alreadyRepaired)
    }
  })

  it('fails closed on a stale human-edited value for every target', () => {
    for (const repair of RELEASE_A1_SELF_CERTIFICATION_REPAIRS) {
      const column = columnWithValue(repair.path, 'A later human edit that must be preserved.')
      expect(() => applyExactReleaseA1Repair(column, repair), repairLabel(repair)).toThrow(
        'failed its exact expected-value guard',
      )
      expect(valueAtPath(column, repair.path)).toBe('A later human edit that must be preserved.')
    }
  })

  it('rejects duplicate expected fragments and an expected/replacement collision', () => {
    const repair = RELEASE_A1_SELF_CERTIFICATION_REPAIRS[0]
    expect(repair).toBeDefined()
    if (!repair) return

    const duplicate = columnWithValue(repair.path, `${repair.expectedText} ${repair.expectedText}`)
    const duplicateBefore = valueAtPath(duplicate, repair.path)
    expect(() => applyExactReleaseA1Repair(duplicate, repair)).toThrow(
      'failed its exact expected-value guard',
    )
    expect(valueAtPath(duplicate, repair.path)).toBe(duplicateBefore)

    const collision = columnWithValue(
      repair.path,
      `${repair.expectedText} ${repair.replacementText}`,
    )
    const collisionBefore = valueAtPath(collision, repair.path)
    expect(() => applyExactReleaseA1Repair(collision, repair)).toThrow(
      'failed its exact expected-value guard',
    )
    expect(valueAtPath(collision, repair.path)).toBe(collisionBefore)
  })

  it('rejects a missing or non-string target path', () => {
    const repair = RELEASE_A1_SELF_CERTIFICATION_REPAIRS[0]
    expect(repair).toBeDefined()
    if (!repair) return

    expect(() => applyExactReleaseA1Repair({}, repair)).toThrow('is not the expected string field')
    expect(() => applyExactReleaseA1Repair(columnWithValue(repair.path, 42), repair)).toThrow(
      'is not the expected string field',
    )
  })
})
