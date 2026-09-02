import { describe, expect, it } from 'vitest'

import type { MedicineRecordedBackground } from '@/lib/background/types'
import { DOSSIER_SECTION_IDS, type SectionAssessment } from '@/lib/dossier-completion/types'
import { evidenceUnitAssertionEnum, evidenceUnitKindEnum } from '@/db/schema'
import {
  ABSENCE_SECTION_STATES,
  SECTION_LABELS,
  UNIT_ASSERTIONS,
  UNIT_KINDS,
  formulationScopeOf,
  populationScopeOf,
  projectEvidenceUnits,
  projectionInputDigest,
  type UnitProjectionInput,
} from '@/lib/semantic/units'

const source = {
  kind: 'FDA_LABEL' as const,
  identifier: 'set-1',
  label: 'Test label',
  retrievedAt: '2026-08-01',
  excerpt: 'The plasma elimination half-life is approximately 6.2 hours.',
}

const background: MedicineRecordedBackground = {
  version: 'medicine-background/v1',
  authoredAt: '2026-08-01',
  pharmacokinetics: {
    routeAsRecorded: 'Oral (extended-release tablets)',
    halfLife: {
      display: 'approximately 6.2 hours',
      numeric: 6.2,
      unit: 'hours',
      populationContext: 'plasma elimination half-life following oral administration',
      source,
    },
  },
  populationStatements: [
    {
      population: 'PEDIATRIC',
      state: 'NOT_ESTABLISHED',
      textAsRecorded: 'Safety and effectiveness in pediatric patients have not been established.',
      source: { ...source, identifier: 'set-2' },
    },
    {
      population: 'GERIATRIC',
      state: 'STUDIED',
      textAsRecorded: 'Clinical studies included patients aged 65 and over.',
      source: { ...source, identifier: 'set-3' },
    },
  ],
  interactionSignals: [
    {
      counterpartyAsRecorded: 'CYP3A4',
      kind: 'ENZYME',
      roleAsRecorded: 'INHIBITOR',
      polarity: 'NEGATED',
      source: { ...source, identifier: 'set-4' },
    },
  ],
}

function section(
  sectionId: (typeof DOSSIER_SECTION_IDS)[number],
  state: SectionAssessment['state'],
): SectionAssessment {
  return {
    sectionId,
    state,
    basisKind: 'RECORDED_MODULE',
    basis: `Basis sentence for ${sectionId}.`,
    sourceRefs: [{ kind: 'FDA_LABEL', identifier: 'set-1' }],
  }
}

const input: UnitProjectionInput = {
  drug: {
    id: 'drg_test',
    canonicalSlug: 'testmedicine',
    name: 'Testmedicine',
    recordedBackground: background,
  },
  sections: [
    section('pharmacokinetics', 'EXACT_SOURCE_BACKED'),
    section('cost-context', 'NOT_APPLICABLE'),
    section('trial-results', 'RESULTS_NOT_POSTED'),
    section('population-statements', 'SOURCE_STATED_NOT_ESTABLISHED'),
    section('recorded-uses', 'BLOCKED_HUMAN_REVIEW'),
  ],
  searches: [
    {
      searchKind: 'CLINICALTRIALS_SNAPSHOT_EXACT_INTERVENTION',
      sourceIdentifier: 'clinicaltrials.gov snapshot 2026-09-01',
      query: 'testmedicine',
      requestedAt: '2026-09-01T00:00:00Z',
      status: 'SUCCEEDED',
      resultCount: 0,
      matched: [],
      error: null,
    },
  ],
}

describe('evidence reading unit projector', () => {
  it('mirrors the database enum lists exactly', () => {
    expect([...evidenceUnitKindEnum.enumValues]).toEqual([...UNIT_KINDS])
    expect([...evidenceUnitAssertionEnum.enumValues]).toEqual([...UNIT_ASSERTIONS])
  })

  it('names every dossier section', () => {
    for (const id of DOSSIER_SECTION_IDS) expect(SECTION_LABELS[id]).toBeTruthy()
  })

  it('is pure: the same input projects the same ids twice', () => {
    const first = projectEvidenceUnits(input)
    const second = projectEvidenceUnits(input)
    expect(first.map((unit) => unit.id)).toEqual(second.map((unit) => unit.id))
    expect(projectionInputDigest(input)).toBe(projectionInputDigest(input))
  })

  it('records a source-stated NOT_ESTABLISHED population statement as NEGATED', () => {
    const units = projectEvidenceUnits(input)
    const pediatric = units.find(
      (unit) => unit.unitKind === 'POPULATION_STATEMENT' && unit.populationScope === 'PEDIATRIC',
    )
    expect(pediatric?.assertion).toBe('NEGATED')
    expect(pediatric?.text).toContain('have not been established')
    const geriatric = units.find(
      (unit) => unit.unitKind === 'POPULATION_STATEMENT' && unit.populationScope === 'GERIATRIC',
    )
    expect(geriatric?.assertion).toBe('ASSERTED')
  })

  it('records a negated enzyme role as NEGATED', () => {
    const units = projectEvidenceUnits(input)
    const signal = units.find((unit) => unit.sectionId === 'interaction-signals')
    expect(signal?.assertion).toBe('NEGATED')
    expect(signal?.text).toContain('polarity: negated')
  })

  it('turns every terminal absence state into an ABSENT section unit carrying the basis', () => {
    const units = projectEvidenceUnits(input)
    for (const state of ABSENCE_SECTION_STATES) {
      const stored = input.sections.find((entry) => entry.state === state)
      if (!stored) continue
      const unit = units.find(
        (candidate) =>
          candidate.unitKind === 'SECTION_STATE' && candidate.sectionId === stored.sectionId,
      )
      expect(unit?.assertion).toBe('ABSENT')
      expect(unit?.text).toContain(stored.basis)
    }
    const notEstablished = units.find(
      (unit) => unit.unitKind === 'SECTION_STATE' && unit.sectionId === 'population-statements',
    )
    expect(notEstablished?.assertion).toBe('NEGATED')
  })

  it('carries exact source refs on every unit and never an empty text', () => {
    for (const unit of projectEvidenceUnits(input)) {
      expect(unit.text.trim().length).toBeGreaterThan(0)
      expect(unit.sourceRefs.length).toBeGreaterThan(0)
      for (const ref of unit.sourceRefs) {
        expect(ref.kind.length).toBeGreaterThan(0)
        expect(ref.identifier.length).toBeGreaterThan(0)
      }
      expect(unit.id).toMatch(/^[0-9a-f]{64}$/u)
      expect(unit.contentDigest).toMatch(/^[0-9a-f]{64}$/u)
    }
  })

  it('quotes the recorded value and its excerpt without composing a claim', () => {
    const unit = projectEvidenceUnits(input).find(
      (candidate) => candidate.fieldPath === 'pharmacokinetics.halfLife',
    )
    expect(unit?.text).toContain('approximately 6.2 hours')
    expect(unit?.text).toContain(source.excerpt)
    // The recorded route names two forms at once ("Oral (extended-release tablets)"), so no single
    // formulation scope is assigned. A reading is never filed under a form the context did not
    // name on its own.
    expect(unit?.formulationScope).toBeNull()
  })

  it('projects a search record as an ASSERTED unit even when it matched nothing', () => {
    const unit = projectEvidenceUnits(input).find(
      (candidate) => candidate.unitKind === 'SEARCH_RESULT',
    )
    expect(unit?.assertion).toBe('ASSERTED')
    expect(unit?.text).toContain('0 exact match(es)')
    expect(unit?.sectionId).toBe('trial-registry')
  })

  it('assigns a scope only when exactly one vocabulary term is named', () => {
    expect(populationScopeOf('safety in pediatric patients')).toBe('PEDIATRIC')
    expect(populationScopeOf('pediatric patients and pregnancy')).toBeNull()
    expect(populationScopeOf('healthy adults')).toBeNull()
    expect(formulationScopeOf('extended-release tablets')).toBeNull()
    expect(formulationScopeOf('extended-release form')).toBe('EXTENDED_RELEASE')
  })

  it('projects nothing for a record with no background, assessment or search', () => {
    expect(
      projectEvidenceUnits({
        drug: { id: 'd', canonicalSlug: 's', name: 'S', recordedBackground: null },
        sections: [],
        searches: [],
      }),
    ).toEqual([])
  })
})
