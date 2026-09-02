import { describe, expect, it } from 'vitest'

import { SILENCE_QUESTION_IDS } from '@/lib/agents/dataset/silence-ledger'
import { DOSSIER_SECTION_IDS } from '@/lib/dossier-completion/types'
import {
  SILENCE_QUESTION_ROUTES,
  createUnitLookupSource,
  formulationBoundary,
  lookupSection,
  lookupSilenceQuestion,
  populationBoundary,
} from '@/lib/semantic/lookups'
import type { EvidenceReadingUnit } from '@/lib/semantic/units'

let counter = 0
function unit(overrides: Partial<EvidenceReadingUnit>): EvidenceReadingUnit {
  counter += 1
  const id = counter.toString(16).padStart(64, '0')
  return {
    id,
    drugId: 'drg_a',
    canonicalSlug: 'alfa',
    unitKind: 'RECORDED_VALUE',
    assertion: 'ASSERTED',
    sectionId: 'pharmacokinetics',
    fieldPath: 'pharmacokinetics.halfLife',
    populationScope: null,
    formulationScope: null,
    text: 'Alfa — elimination half-life: 6 hours',
    sourceRefs: [{ kind: 'FDA_LABEL', identifier: 'set-1' }],
    comparisonState: null,
    projectorVersion: 'semantic-units/v1',
    contentDigest: id,
    ...overrides,
  }
}

const halfLife = unit({})
const pediatricDenial = unit({
  unitKind: 'POPULATION_STATEMENT',
  assertion: 'NEGATED',
  sectionId: 'population-statements',
  fieldPath: 'populationStatements[0]',
  populationScope: 'PEDIATRIC',
  text: 'Alfa — population statement for children: Safety and effectiveness in pediatric patients have not been established.',
})
const costAbsence = unit({
  unitKind: 'SECTION_STATE',
  assertion: 'ABSENT',
  sectionId: 'cost-context',
  fieldPath: 'sections[cost-context].state',
  text: 'Alfa — cost context: No price for this entity was found in the searched pricing file.',
})
const bravoHalfLife = unit({
  drugId: 'drg_b',
  canonicalSlug: 'bravo',
  text: 'Bravo — elimination half-life: 2 hours',
})

const units = [halfLife, pediatricDenial, costAbsence, bravoHalfLife]
const aliases = new Map<string, string[]>([
  ['alfa sodium', ['alfa']],
  ['shared name', ['alfa', 'bravo']],
])
const source = createUnitLookupSource(units, aliases)

describe('deterministic evidence lookups', () => {
  it('routes every silence-ledger question to a real section', () => {
    for (const id of SILENCE_QUESTION_IDS) {
      const route = SILENCE_QUESTION_ROUTES[id]
      expect(route).toBeDefined()
      expect(DOSSIER_SECTION_IDS).toContain(route.sectionId)
    }
  })

  it('returns the recorded reading for an exact slug', () => {
    const result = lookupSection(source, 'alfa', 'pharmacokinetics')
    expect(result.status).toBe('FOUND')
    expect(result.units.map((entry) => entry.id)).toEqual([halfLife.id])
  })

  it('resolves an unambiguous alias to the same record', () => {
    const result = lookupSilenceQuestion(source, 'Alfa Sodium', 'half_life')
    expect(result.status).toBe('FOUND')
    expect(result.slug).toBe('alfa')
  })

  it('refuses an ambiguous name instead of guessing', () => {
    const result = lookupSection(source, 'shared name', 'pharmacokinetics')
    expect(result.status).toBe('REFUSED')
    expect(result.units).toEqual([])
    expect(result.candidates).toEqual(['alfa', 'bravo'])
    expect(result.explanation).toContain('more than one record')
  })

  it('refuses a name no record answers to', () => {
    const result = lookupSection(source, 'charlie', 'pharmacokinetics')
    expect(result.status).toBe('REFUSED')
    expect(result.units).toEqual([])
  })

  it('never turns an absence into a finding', () => {
    const result = lookupSection(source, 'alfa', 'cost-context')
    expect(result.status).toBe('ABSENT')
    expect(result.units).toEqual([])
    expect(result.absence?.id).toBe(costAbsence.id)
    expect(result.explanation).toBe(costAbsence.text)
  })

  it('keeps a question with no projected unit apart from a recorded absence', () => {
    const result = lookupSilenceQuestion(source, 'alfa', 'boxed_warning')
    expect(result.status).toBe('NOT_PROJECTED')
    expect(result.units).toEqual([])
    expect(result.absence).toBeNull()
  })

  it('returns the source-stated denial for a population question', () => {
    const result = lookupSilenceQuestion(source, 'alfa', 'population_pediatric')
    expect(result.status).toBe('FOUND')
    expect(result.units[0]?.assertion).toBe('NEGATED')
  })

  it('states a population boundary from the stored statements only', () => {
    const inside = populationBoundary(source, 'alfa', 'PEDIATRIC')
    expect(inside.status).toBe('WITHIN_RECORDED_SCOPE')

    const outside = populationBoundary(source, 'alfa', 'PREGNANCY')
    expect(outside.status).toBe('OUTSIDE_RECORDED_SCOPE')
    expect(outside.units).toEqual([])
    expect(outside.statement).toBe(
      'No recorded statement for pregnancy; the recorded statements cover children only.',
    )
  })

  it('says so plainly when a record holds no population statement at all', () => {
    const bravoOnly = createUnitLookupSource([bravoHalfLife], new Map())
    const result = populationBoundary(bravoOnly, 'bravo', 'PEDIATRIC')
    expect(result.status).toBe('OUTSIDE_RECORDED_SCOPE')
    expect(result.statement).toContain('no recorded population statement at all')
  })

  it('states a formulation boundary the same way', () => {
    const result = formulationBoundary(source, 'alfa', 'EXTENDED_RELEASE')
    expect(result.status).toBe('OUTSIDE_RECORDED_SCOPE')
    expect(result.units).toEqual([])
    expect(result.statement).toContain('No recorded reading')
  })

  it('refuses a boundary question for an ambiguous name', () => {
    const result = populationBoundary(source, 'shared name', 'PEDIATRIC')
    expect(result.status).toBe('REFUSED')
    expect(result.units).toEqual([])
  })
})
