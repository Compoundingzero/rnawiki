import { describe, expect, it } from 'vitest'

import {
  auditCopy,
  copyPasses,
  findForbiddenPhrases,
  findInternalKeys,
  findUndefinedAcronyms,
  findUnscopedCertainty,
  plainVersionViolations,
  sentenceStats,
  type ClaimReading,
} from '@/lib/dossier-v3/copy-contract'

describe('internal keys never reach public copy', () => {
  it('flags the derived-seed test id that rendered on the live creatine page', () => {
    const hits = findInternalKeys('Show the evidence missing b_halfLifeRecorded biomarkers')
    expect(hits.map((hit) => hit.match)).toContain('b_halfLifeRecorded')
  })

  it('flags camelCase, screaming-snake, snake_case, slot and canonical-key tokens', () => {
    const text =
      'c_smallHumanTrialReportedEffect halfLifeRecorded NOT_MEASURED trial_count seed12 field15 K1:MU72812GK0'
    const kinds = new Set(findInternalKeys(text).map((hit) => hit.kind))
    expect(kinds).toEqual(
      new Set([
        'derived-seed test id',
        'camelCase key',
        'screaming-snake enum',
        'snake_case key',
        'derivation slot',
        'canonical identity key',
      ]),
    )
  })

  it('does not flag ordinary scientific names or reader words', () => {
    const text =
      'mTOR, ApoB, HbA1c, GrimAge and mRNA are names. Semaglutide 2.4 mg once weekly was studied.'
    expect(findInternalKeys(text)).toEqual([])
  })
})

describe('forbidden phrases', () => {
  it('finds hype phrases regardless of case and only as whole words', () => {
    const hits = findForbiddenPhrases(
      'Unlock your potential with this Game Changer. Unlocked doors.',
    )
    expect(hits.map((hit) => hit.match.toLowerCase())).toEqual(['unlock', 'game changer'])
  })
})

describe('unscoped certainty', () => {
  it('flags bare "safe", "proven" and "works"', () => {
    expect(findUnscopedCertainty('Creatine is safe. It works. Benefits are proven.')).toHaveLength(
      3,
    )
  })

  it('accepts negated or scoped uses and verbatim quotations', () => {
    const text =
      'It is not proven. No evidence shows it works. Strong human evidence for this specific use: it works for short-term strength in trained adults. The label says "safe and effective".'
    expect(findUnscopedCertainty(text)).toEqual([])
  })
})

describe('sentence statistics', () => {
  it('counts sentences over the soft and hard limits', () => {
    const short = 'One idea per sentence.'
    const long =
      Array.from({ length: 31 }, (_, index) => (index === 0 ? 'Word0' : `word${index}`)).join(' ') +
      '.'
    const stats = sentenceStats(`${short} ${long}`)
    expect(stats.sentences).toBe(2)
    expect(stats.over20).toBe(1)
    expect(stats.over30).toBe(1)
    expect(stats.longest[0]?.words).toBe(31)
  })
})

describe('undefined acronyms', () => {
  it('reports acronyms with no inline definition and accepts defined ones', () => {
    const text =
      'LDL cholesterol fell. HbA1c (glycated haemoglobin) also fell. The FDA label says so.'
    expect(findUndefinedAcronyms(text)).toEqual(['FDA', 'LDL'])
    expect(findUndefinedAcronyms(text, new Set(['LDL', 'FDA']))).toEqual([])
  })
})

describe('a plain version may not strengthen the technical claim', () => {
  const technical: ClaimReading = {
    direction: 'decrease',
    outcomeClass: 'biomarker_surrogate',
    populationScope: 'adults with type 2 diabetes',
    causality: 'causal_randomized',
    uncertainty: 'moderate',
    magnitude: { value: -0.87, unit: 'mmol/L', kind: 'absolute' },
  }

  it('passes an identical reading', () => {
    expect(plainVersionViolations(technical, { ...technical })).toEqual([])
  })

  it('refuses a plain version that turns a biomarker into a clinical event', () => {
    const violations = plainVersionViolations(technical, {
      ...technical,
      outcomeClass: 'clinical_event',
    })
    expect(violations.map((violation) => violation.field)).toEqual(['outcomeClass'])
  })

  it('refuses broader population, stronger causality, lower uncertainty and a dropped effect size', () => {
    const violations = plainVersionViolations(
      { ...technical, causality: 'associational', uncertainty: 'high' },
      {
        ...technical,
        populationScope: 'everyone',
        causality: 'causal_randomized',
        uncertainty: 'low',
        magnitude: undefined,
      },
    )
    expect(violations.map((violation) => violation.field).sort()).toEqual(
      ['causality', 'magnitude', 'populationScope', 'uncertainty'].sort(),
    )
  })

  it('allows a plain version that claims less', () => {
    const violations = plainVersionViolations(technical, {
      ...technical,
      causality: 'associational',
      uncertainty: 'high',
    })
    expect(violations).toEqual([])
  })
})

describe('auditCopy', () => {
  it('passes honest plain copy and fails copy with a raw key', () => {
    const good = auditCopy(
      'Semaglutide is a prescription medicine. People use it for type 2 diabetes and weight management. RNAWiki has not yet published a reviewed conclusion for this use.',
    )
    expect(copyPasses(good)).toBe(true)
    const bad = auditCopy('missing: b_halfLifeRecorded')
    expect(copyPasses(bad)).toBe(false)
  })
})
