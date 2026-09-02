import { describe, expect, it } from 'vitest'

import { lexicalSearch } from '@/lib/semantic/lexical'
import { applyScopeGates, buildEntityIndex, findEntityMentions } from '@/lib/semantic/scope-gates'
import { answerEvidenceQuery } from '@/lib/semantic/search'
import type { EvidenceReadingUnit } from '@/lib/semantic/units'

let counter = 0
function unit(overrides: Partial<EvidenceReadingUnit>): EvidenceReadingUnit {
  counter += 1
  const id = counter.toString(16).padStart(64, '0')
  return {
    id,
    drugId: 'drg_a',
    canonicalSlug: 'alfacillin',
    unitKind: 'RECORDED_VALUE',
    assertion: 'ASSERTED',
    sectionId: 'pharmacokinetics',
    fieldPath: 'pharmacokinetics.halfLife',
    populationScope: null,
    formulationScope: null,
    text: 'Alfacillin — elimination half-life: 6 hours',
    sourceRefs: [{ kind: 'FDA_LABEL', identifier: 'set-1' }],
    comparisonState: null,
    projectorVersion: 'semantic-units/v1',
    contentDigest: id,
    ...overrides,
  }
}

const index = buildEntityIndex([
  { slug: 'alfacillin', name: 'Alfacillin', aliases: ['alfa sodium'] },
  { slug: 'bravostatin', name: 'Bravostatin', aliases: ['shared trade name'] },
  { slug: 'charliezumab', name: 'Charliezumab', aliases: ['shared trade name'] },
  { slug: 'liver', name: 'Liver' },
])

const alfaHalfLife = unit({})
const alfaPediatric = unit({
  unitKind: 'POPULATION_STATEMENT',
  sectionId: 'population-statements',
  populationScope: 'PEDIATRIC',
  text: 'Alfacillin — population statement for children: studied in patients aged 2 to 11.',
})
const alfaAbsence = unit({
  unitKind: 'SECTION_STATE',
  assertion: 'ABSENT',
  sectionId: 'cost-context',
  text: 'Alfacillin — cost context: no price was found in the searched pricing file.',
})
const alfaExtended = unit({ formulationScope: 'EXTENDED_RELEASE' })
const bravoHalfLife = unit({
  drugId: 'drg_b',
  canonicalSlug: 'bravostatin',
  text: 'Bravostatin — elimination half-life: 6 hours',
})

const pool = [alfaHalfLife, alfaPediatric, alfaAbsence, alfaExtended, bravoHalfLife]

describe('semantic scope gates', () => {
  it('prefers a record own name over another record alias', () => {
    const mentions = findEntityMentions('half-life of alfacillin', index)
    expect(mentions.map((mention) => mention.slugs)).toEqual([['alfacillin']])
  })

  it('drops units of a different medicine even when the text is nearly identical', () => {
    const gated = applyScopeGates('half-life of alfacillin', pool, index)
    expect(gated.refusal).toBeNull()
    expect(gated.slug).toBe('alfacillin')
    expect(gated.kept.map((entry) => entry.id)).not.toContain(bravoHalfLife.id)
    expect(gated.dropped.get(bravoHalfLife.id)).toContain('bravostatin')
  })

  it('refuses a query naming two medicines', () => {
    const gated = applyScopeGates('alfacillin and bravostatin together', pool, index)
    expect(gated.refusal?.code).toBe('TWO_MEDICINES')
    expect(gated.kept).toEqual([])
    expect(gated.refusal?.candidates).toEqual(['alfacillin', 'bravostatin'])
  })

  it('refuses a name that answers to more than one record', () => {
    const gated = applyScopeGates('half-life of shared trade name', pool, index)
    expect(gated.refusal?.code).toBe('AMBIGUOUS_ENTITY')
    expect(gated.refusal?.candidates).toEqual(['bravostatin', 'charliezumab'])
  })

  it('restricts a population question to matching units and to the recorded absence', () => {
    const gated = applyScopeGates('is alfacillin studied in children', pool, index)
    expect(gated.populationScope).toBe('PEDIATRIC')
    const kept = gated.kept.map((entry) => entry.id)
    expect(kept).toContain(alfaPediatric.id)
    expect(kept).toContain(alfaAbsence.id)
    expect(kept).not.toContain(alfaHalfLife.id)
  })

  it('reads a two-word scope phrase as a scope even when a record is named Liver', () => {
    const gated = applyScopeGates('is alfacillin studied in liver impairment', pool, index)
    expect(gated.refusal).toBeNull()
    expect(gated.slug).toBe('alfacillin')
    expect(gated.populationScope).toBe('HEPATIC_IMPAIRMENT')
  })

  it('restricts a formulation question to matching units', () => {
    const gated = applyScopeGates('extended release half-life of alfacillin', pool, index)
    expect(gated.formulationScope).toBe('EXTENDED_RELEASE')
    const kept = gated.kept.map((entry) => entry.id)
    expect(kept).toContain(alfaExtended.id)
    expect(kept).not.toContain(alfaHalfLife.id)
  })
})

describe('answerEvidenceQuery', () => {
  const deps = {
    entityIndex: index,
    retrieve: async (_query: string, limit: number) =>
      pool.slice(0, limit).map((entry, position) => ({ unit: entry, score: 1 - position / 100 })),
  }

  it('returns readings and recorded absences apart from each other', async () => {
    const answer = await answerEvidenceQuery('half-life of alfacillin', deps)
    expect(answer.status).toBe('ANSWERED')
    expect(answer.slug).toBe('alfacillin')
    expect(answer.units.every((hit) => hit.unit.assertion !== 'ABSENT')).toBe(true)
    expect(answer.absences.map((entry) => entry.id)).toEqual([alfaAbsence.id])
    for (const hit of answer.units) expect(hit.unit.sourceRefs.length).toBeGreaterThan(0)
  })

  it('refuses a two-medicine query with an explanation rather than answering half of it', async () => {
    const answer = await answerEvidenceQuery('alfacillin versus bravostatin', deps)
    expect(answer.status).toBe('REFUSED')
    expect(answer.refusal?.code).toBe('TWO_MEDICINES')
    expect(answer.units).toEqual([])
    expect(answer.absences).toEqual([])
  })

  it('reports no match for an empty query without calling retrieval', async () => {
    let calls = 0
    const answer = await answerEvidenceQuery('   ', {
      entityIndex: index,
      retrieve: async () => {
        calls += 1
        return []
      },
    })
    expect(answer.status).toBe('NO_MATCH')
    expect(calls).toBe(0)
  })

  it('exposes the lexical retriever without wiring it to a page', () => {
    expect(typeof lexicalSearch).toBe('function')
  })
})
