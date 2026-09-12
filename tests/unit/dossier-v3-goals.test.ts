import { describe, expect, it } from 'vitest'

import { buildGoalLenses, goalsFromConditions } from '@/lib/dossier-v3/goals'

describe('goal lens from registry conditions', () => {
  it('maps registry condition strings to goals by the fixed keyword table only', () => {
    const goals = goalsFromConditions(['Type 2 Diabetes', 'Obesity', 'Healthy', 'Insomnia'])
    expect([...goals.keys()].sort()).toEqual(['body_fat_weight', 'glucose_metabolic', 'sleep'])
    expect(goals.get('sleep')).toEqual(['Insomnia'])
  })

  it('labels a reviewed goal as reviewed and a registry-only goal as registered', () => {
    const lenses = buildGoalLenses(new Set(['sleep']), ['Obesity'])
    expect(lenses.map((lens) => `${lens.code}:${lens.basis}`)).toEqual([
      'sleep:reviewed',
      'body_fat_weight:registered',
    ])
  })

  it('never invents a goal from prose: an unmatched condition lists nothing', () => {
    expect(goalsFromConditions(['Healthy Volunteers']).size).toBe(0)
  })
})
