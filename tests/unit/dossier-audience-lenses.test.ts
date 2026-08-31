import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import type { MedicineRecordedBackground } from '@/lib/background/types'
import {
  dossierAudienceLensProjections,
  DOSSIER_AUDIENCE_LENSES,
} from '@/lib/dossier-audience-lenses'
import { dossierNavigatorSections } from '@/lib/dossier-navigator-sections'
import { medicineBackgroundContext } from '@/lib/medicine-background-view'
import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'

function dossier(): MedicineDossierViewModel {
  return {
    slug: 'lens-medicine',
    name: 'Lens medicine',
    modality: 'Small Molecule',
    approvalStatus: 'Active',
    statusBadge: { kind: 'programme_status', value: 'ACTIVE' },
    programmes: [],
    selectedProgrammeId: 'programme-1',
    selectedProgrammeLabel: 'Recorded use',
    selectedProgrammeStatus: 'ACTIVE',
    bindingState: 'legacy_record',
    verdict: '',
    readerSummary: {
      basis: 'older_record',
      usedFor: 'A recorded use.',
      takeaway: '',
      simplified: false,
      contextItems: [],
    },
    mechanismSummary: {},
    tenSecondWordCount: 0,
    evidenceNodes: [],
    studies: [],
    keyOutcomes: [],
    mechanismSteps: [],
    timelineEvents: [],
    sources: [],
    freshness: 'unknown',
    freshnessLabel: 'Freshness not yet verified',
    review: { historyHref: '/d/lens-medicine/history' },
    machineFindingCodes: [],
    medicineRecord: {
      conventionalAlternatives: [],
      commonQuestions: [],
      communityNotes: [],
    },
  }
}

describe('dossier audience lenses', () => {
  it('is a closed four-lens contract with the required reader labels', () => {
    const projections = dossierAudienceLensProjections(dossier())

    expect(DOSSIER_AUDIENCE_LENSES).toEqual(['ordinary', 'biotech', 'chemist', 'quantitative'])
    expect(projections.map((projection) => projection.label)).toEqual([
      'Ordinary reader',
      'Biotech researcher',
      'Chemist',
      'Physicist or quantitative scientist',
    ])
  })

  it('uses always-rendered question anchors when a sparse record lacks specialist modules', () => {
    const byLens = new Map(
      dossierAudienceLensProjections(dossier()).map((projection) => [projection.lens, projection]),
    )

    expect(byLens.get('ordinary')?.href).toBe('#what-it-is')
    expect(byLens.get('biotech')?.href).toBe('#q-mechanism')
    expect(byLens.get('chemist')?.href).toBe('#q-identity')
    expect(byLens.get('quantitative')?.href).toBe('#q-measurement')
  })

  it('starts specialist readers at recorded canonical sections when those sections exist', () => {
    const view = dossier()
    view.mechanismSteps = [
      {
        id: 'mechanism-1',
        order: 1,
        title: 'Recorded mechanism step',
        plainLanguage: 'A stored explanation.',
        claimIds: [],
        sourceIds: [],
      },
    ]
    view.keyOutcomes = [
      {
        id: 'outcome-1',
        label: 'Recorded outcome',
        state: 'measured',
        sourceIds: [],
      },
    ]
    view.medicineRecord.background = {
      authoredAt: '2026-08-31',
      molecularIdentity: {
        values: [
          {
            label: 'Molecular formula',
            display: 'C8H9NO2',
            populationContext: 'As recorded',
            source: {
              kindLabel: 'Saved record',
              label: 'Example source',
              identifier: 'example-1',
              retrievedAt: '2026-08-31',
            },
          },
        ],
      },
    }

    const byLens = new Map(
      dossierAudienceLensProjections(view).map((projection) => [projection.lens, projection]),
    )

    expect(byLens.get('biotech')?.href).toBe('#mechanism-map')
    expect(byLens.get('chemist')?.href).toBe('#chemical-identity')
    expect(byLens.get('quantitative')?.href).toBe('#key-outcomes')
  })

  it('recognises an evidence anchor rendered from exact reviewed wording', () => {
    const view = dossier()
    view.readerSummary.exactText = 'Exact reviewed wording retained on the canonical record.'

    const biotech = dossierAudienceLensProjections(view).find(
      (projection) => projection.lens === 'biotech',
    )
    expect(biotech?.href).toBe('#evidence-support')
  })

  it('reorders only the complete section index and does not mutate the canonical record', () => {
    const view = dossier()
    const before = JSON.stringify(view)
    const canonicalIds = dossierNavigatorSections(view).map((section) => section.id)
    const projections = dossierAudienceLensProjections(view)

    for (const projection of projections) {
      const projectedIds = projection.orderedSections.map((section) => section.id)
      expect(projectedIds).toHaveLength(canonicalIds.length)
      expect(new Set(projectedIds)).toEqual(new Set(canonicalIds))
    }
    expect(JSON.stringify(view)).toBe(before)
  })

  it('projects the mandated scope, evidence state and provenance for every audience', () => {
    const view = dossier()
    view.bindingState = 'published_programme'
    view.sources = [
      {
        id: 'source-1',
        label: 'Exact study source',
        href: 'https://example.test/study',
        identifier: 'NCT00000001',
        snapshotHash: 'sha256:source',
        retrievedAt: '2026-08-30',
        verifiedAt: '2026-08-31',
        freshness: 'current',
      },
    ]
    view.keyOutcomes = [
      {
        id: 'outcome-1',
        label: 'Recorded endpoint',
        state: 'measured',
        claimNature: 'measured',
        endpoint: 'Recorded endpoint',
        comparator: 'Recorded comparator',
        numericValue: '12.4',
        numericUnit: 'percentage points',
        uncertaintyInterval: '95% CI 10.1 to 14.7',
        timepoint: 'Week 48',
        sourceIds: ['source-1'],
        sourceClaimBindings: [
          {
            sourceId: 'source-1',
            claimId: 'outcome-1',
            relationship: 'SUPPORTS',
            statement: 'The source records this endpoint.',
          },
        ],
      },
    ]
    view.medicineRecord.background = {
      authoredAt: '2026-08-31',
      molecularIdentity: {
        values: [
          {
            label: 'Molecular formula',
            display: 'C8H9NO2',
            populationContext: 'Represented substance',
            source: {
              kindLabel: 'PubChem compound record',
              label: 'PubChem',
              identifier: '123',
              href: 'https://pubchem.ncbi.nlm.nih.gov/compound/123',
              version: 'pubchem-release-2026-08',
              effectiveDate: '2026-08-15',
              retrievedAt: '2026-08-31',
            },
          },
        ],
      },
      sourceConsensus: {
        documentsExaminedLabel: '2 documents examined',
        fields: [
          {
            field: 'halfLife',
            fieldLabel: 'Half-life',
            agreementLabel: 'Sources differ',
            comparisonState: 'differ',
            comparisonReasons: ['Same unit and population context'],
            readings: [
              {
                display: '4 hours',
                supportLabel: 'One source',
                sources: [
                  {
                    kindLabel: 'FDA label',
                    label: 'Label A',
                    identifier: 'label-a',
                    retrievedAt: '2026-08-30',
                  },
                ],
              },
              {
                display: '6 hours',
                supportLabel: 'One source',
                sources: [
                  {
                    kindLabel: 'FDA label',
                    label: 'Label B',
                    identifier: 'label-b',
                    retrievedAt: '2026-08-30',
                  },
                ],
              },
            ],
          },
        ],
      },
    }

    const byLens = new Map(
      dossierAudienceLensProjections(view).map((projection) => [projection.lens, projection]),
    )
    const ordinary = byLens.get('ordinary')!
    const biotech = byLens.get('biotech')!
    const chemist = byLens.get('chemist')!
    const quantitative = byLens.get('quantitative')!

    expect(ordinary.sections.map((section) => section.heading)).toEqual([
      '1. What is this medicine used or studied for?',
      '2. What happened to people in the cited study or label?',
      '3. How large was the measured result?',
      '4. What important harm or limitation was recorded?',
      '5. Who might this evidence not apply to?',
      '6. What is unknown, conflicting or stale?',
    ])
    expect(biotech.sections.flatMap((section) => section.requiredFields)).toEqual(
      expect.arrayContaining([
        'trial and registry ids',
        'endpoint hierarchy',
        'adverse events',
        'source drift',
        'review history',
      ]),
    )
    expect(chemist.sections.flatMap((section) => section.requiredFields)).toEqual(
      expect.arrayContaining([
        'parent versus salt',
        'hydrate or solvate',
        'stereochemistry state',
        'unresolved identity warnings',
      ]),
    )
    expect(chemist.sections.flatMap((section) => section.records)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          heading: 'Molecular formula',
          summary: 'C8H9NO2',
          sources: [
            expect.objectContaining({
              href: 'https://pubchem.ncbi.nlm.nih.gov/compound/123',
              version: 'pubchem-release-2026-08',
              effectiveDate: '2026-08-15',
              freshness: 'not_recorded',
            }),
          ],
        }),
      ]),
    )
    const unversionedConsensusSource = quantitative.sections
      .flatMap((section) => section.records)
      .find((record) => record.id === 'quantitative-consensus-halfLife-1')?.sources[0]
    expect(unversionedConsensusSource).toMatchObject({
      identifier: 'label-a',
      freshness: 'not_recorded',
    })
    expect(unversionedConsensusSource).not.toHaveProperty('version')
    expect(unversionedConsensusSource).not.toHaveProperty('effectiveDate')
    expect(quantitative.sections.flatMap((section) => section.requiredFields)).toEqual(
      expect.arrayContaining([
        'unit',
        'uncertainty type',
        'observed versus derived',
        'formula for derived values',
        'all source readings',
      ]),
    )
    expect(quantitative.sections.flatMap((section) => section.records)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'quantitative-outcome-outcome-1',
          evidenceState: 'measured',
          facts: expect.arrayContaining([
            { label: 'Unit', value: 'percentage points' },
            { label: 'Dispersion or interval', value: '95% CI 10.1 to 14.7' },
          ]),
          sources: [
            expect.objectContaining({
              href: 'https://example.test/study',
              freshness: 'current',
              snapshotHash: 'sha256:source',
            }),
          ],
        }),
        expect.objectContaining({
          id: 'quantitative-consensus-halfLife-1',
          evidenceState: 'conflicting',
        }),
        expect.objectContaining({
          id: 'quantitative-consensus-halfLife-2',
          evidenceState: 'conflicting',
        }),
      ]),
    )
    for (const projection of byLens.values()) {
      for (const item of projection.sections.flatMap((section) => section.records)) {
        expect(item.canonicalFields.length).toBeGreaterThan(0)
        expect(item.scope).not.toBe('')
        expect(item.evidenceStateLabel).not.toBe('')
        expect(item.recordKind).toMatch(/^(medical_evidence|identity|operational|missing)$/u)
        if (item.recordKind === 'medical_evidence') {
          expect(item.sources.length).toBeGreaterThan(0)
          expect(item.sources.every((source) => Boolean(source.freshness))).toBe(true)
        }
      }
    }
  })

  it('does not project reviewed medical wording when its exact source binding is unresolved', () => {
    const view = dossier()
    view.bindingState = 'published_programme'
    view.review.publishedAt = '2026-08-31'
    view.conclusion = {
      publicLabel: 'UNSOURCED CONCLUSION LABEL',
      professionalLabel: 'UNSOURCED PROFESSIONAL CONCLUSION',
      reason: 'UNSOURCED CONCLUSION REASON',
      scope: {
        indication: 'UNSOURCED INDICATION',
        population: 'UNSOURCED POPULATION',
        doseExposure: 'UNSOURCED DOSE',
        period: 'UNSOURCED PERIOD',
        trials: 'UNSOURCED TRIAL SCOPE',
        outcome: 'UNSOURCED OUTCOME SCOPE',
      },
      whatWasDisproven: [],
      whatWasNotDisproven: [],
      whatRemainsUnknown: ['UNSOURCED UNKNOWN'],
      confidence: 'UNSOURCED CONFIDENCE',
      conditionsThatWouldChangeVerdict: [],
      authorName: 'Reviewer',
      independentReviewCount: 1,
      reviewers: [],
    }
    view.mainLimitation = 'UNSOURCED LIMITATION'

    const projections = dossierAudienceLensProjections(view)
    const renderedProjection = JSON.stringify(projections)
    expect(
      projections.every((projection) => projection.sourceBoundMedicalEvidenceRecords === 0),
    ).toBe(true)
    for (const medicalText of [
      'UNSOURCED CONCLUSION LABEL',
      'UNSOURCED PROFESSIONAL CONCLUSION',
      'UNSOURCED CONCLUSION REASON',
      'UNSOURCED INDICATION',
      'UNSOURCED POPULATION',
      'UNSOURCED DOSE',
      'UNSOURCED PERIOD',
      'UNSOURCED TRIAL SCOPE',
      'UNSOURCED OUTCOME SCOPE',
      'UNSOURCED UNKNOWN',
      'UNSOURCED CONFIDENCE',
      'UNSOURCED LIMITATION',
    ]) {
      expect(renderedProjection).not.toContain(medicalText)
    }

    const programmeIdentity = projections
      .find((projection) => projection.lens === 'biotech')
      ?.sections.flatMap((section) => section.records)
      .find((record) => record.id === 'biotech-programme-identity')
    const programmeScope = projections
      .find((projection) => projection.lens === 'biotech')
      ?.sections.flatMap((section) => section.records)
      .find((record) => record.id === 'biotech-programme-scope')
    expect(programmeIdentity).toMatchObject({ recordKind: 'identity', sources: [] })
    expect(programmeIdentity?.canonicalFields).toEqual([
      'selectedProgrammeId',
      'selectedProgrammeLabel',
    ])
    expect(programmeScope).toMatchObject({
      recordKind: 'missing',
      evidenceState: 'not_recorded',
      facts: [],
      sources: [],
    })
  })

  it('keeps source-free identity to routing keys and fails closed for chemical identity claims', () => {
    const view = dossier()
    view.medicineRecord.background = {
      authoredAt: '2026-08-31',
      sourceMaterial: {
        substanceClassLabel: 'Specified salt',
        parentSubstance: 'Example parent',
        originLabel: 'Synthetic',
        parts: [],
        source: {
          kindLabel: 'FDA substance registry record',
          label: 'FDA substance registry',
          identifier: 'UNII-MATERIAL',
          retrievedAt: '2026-08-31',
        },
      },
      composition: {
        summary: 'Two active ingredients are recorded.',
        ingredients: [
          {
            name: 'UNSOURCED INGREDIENT NAME',
            strength: 'UNSOURCED 25 MG',
            dataStateLabel: 'Sources describe this ingredient on its own',
            molecularIdentity: [
              {
                label: 'Molecular formula',
                display: 'C2H6O',
                populationContext: 'Ingredient record',
                source: {
                  kindLabel: 'PubChem compound record',
                  label: 'Unrelated ingredient molecular source',
                  identifier: '702',
                  retrievedAt: '2026-08-31',
                },
              },
            ],
          },
        ],
      },
      nameFamily: {
        summary: 'The name could mean either registered substance.',
        members: [
          { name: 'Example base', unii: 'BASE123', marketLabel: '3 listed products' },
          { name: 'Example salt', unii: 'SALT456', marketLabel: '2 listed products' },
        ],
        moreCount: 0,
        source: {
          kindLabel: 'FDA substance registry record',
          label: 'FDA substance registry results',
          identifier: 'BASE123',
          retrievedAt: '2026-08-31',
        },
      },
    }

    const records = dossierAudienceLensProjections(view)
      .find((projection) => projection.lens === 'chemist')!
      .sections.flatMap((section) => section.records)
    const selectedRecord = records.find((item) => item.id === 'chemist-record-identity')
    const material = records.find((item) => item.id === 'chemist-source-material')
    const composition = records.find((item) => item.id === 'chemist-composition-1')
    const ambiguity = records.find((item) => item.id === 'chemist-name-ambiguity')

    expect(selectedRecord).toMatchObject({
      recordKind: 'identity',
      canonicalFields: ['slug', 'name'],
      facts: [{ label: 'Record key', value: 'lens-medicine' }],
      sources: [],
    })
    expect(selectedRecord?.summary).toBeUndefined()
    expect(JSON.stringify(selectedRecord)).not.toContain('Small Molecule')
    expect(material).toMatchObject({
      recordKind: 'medical_evidence',
      canonicalFields: ['medicineRecord.background.sourceMaterial'],
      sources: [expect.objectContaining({ identifier: 'UNII-MATERIAL' })],
    })
    expect(composition).toMatchObject({
      recordKind: 'missing',
      canonicalFields: ['medicineRecord.background.composition.ingredients.0'],
      facts: [],
      sources: [],
    })
    expect(JSON.stringify(composition)).not.toContain('UNSOURCED INGREDIENT NAME')
    expect(JSON.stringify(composition)).not.toContain('UNSOURCED 25 MG')
    expect(ambiguity).toMatchObject({
      recordKind: 'medical_evidence',
      sources: [expect.objectContaining({ identifier: 'BASE123' })],
    })
  })

  it('fails closed for programme status and permits only a closed set of source-free workflow rows', () => {
    const view = dossier()
    view.freshness = 'current'
    view.freshnessLabel = 'Checked and current'

    const projections = dossierAudienceLensProjections(view)
    const sourceFreeOperationalIds = projections
      .flatMap((projection) => projection.sections)
      .flatMap((section) => section.records)
      .filter((item) => item.recordKind === 'operational' && item.sources.length === 0)
      .map((item) => item.id)

    expect(new Set(sourceFreeOperationalIds)).toEqual(
      new Set(['lens-q-freshness-record', 'biotech-review-history']),
    )

    const programmeStatus = projections
      .find((projection) => projection.lens === 'biotech')
      ?.sections.flatMap((section) => section.records)
      .find((item) => item.id === 'biotech-programme-status')
    expect(programmeStatus).toMatchObject({
      recordKind: 'missing',
      evidenceState: 'not_recorded',
      sources: [],
    })
    expect(programmeStatus?.summary).not.toContain(view.selectedProgrammeStatus)
  })

  it('does not attach conclusion population or dose scope to an outcome-only source binding', () => {
    const view = dossier()
    view.sources = [
      {
        id: 'outcome-source',
        label: 'Outcome source',
        identifier: 'NCT00000001',
        freshness: 'current',
      },
    ]
    view.keyOutcomes = [
      {
        id: 'outcome-1',
        label: 'Bound outcome',
        state: 'measured',
        claimNature: 'measured',
        numericValue: '12',
        numericUnit: '%',
        sourceIds: ['outcome-source'],
      },
    ]
    view.conclusion = {
      publicLabel: 'Reviewed label',
      professionalLabel: 'Reviewed professional label',
      reason: 'Reviewed reason',
      scope: {
        indication: 'Use',
        population: 'UNBOUND OUTCOME POPULATION',
        doseExposure: 'UNBOUND OUTCOME DOSE',
        period: 'Period',
        trials: 'Trials',
        outcome: 'Outcome',
      },
      whatWasDisproven: [],
      whatWasNotDisproven: [],
      whatRemainsUnknown: [],
      confidence: 'Moderate',
      conditionsThatWouldChangeVerdict: [],
      authorName: 'Reviewer',
      independentReviewCount: 1,
      reviewers: [],
    }

    const outcome = dossierAudienceLensProjections(view)
      .find((projection) => projection.lens === 'quantitative')!
      .sections.flatMap((section) => section.records)
      .find((item) => item.id === 'quantitative-outcome-outcome-1')

    expect(outcome).toMatchObject({
      recordKind: 'medical_evidence',
      canonicalFields: ['keyOutcomes.outcome-1'],
      sources: [expect.objectContaining({ id: 'outcome-source' })],
    })
    expect(JSON.stringify(outcome)).not.toContain('UNBOUND OUTCOME POPULATION')
    expect(JSON.stringify(outcome)).not.toContain('UNBOUND OUTCOME DOSE')
  })

  it('emits no unsourced medical or evidence record across all recorded-background envelopes', () => {
    const rows = readFileSync(join(process.cwd(), 'data', 'recorded-background.ndjson'), 'utf8')
      .trim()
      .split('\n')
      .map(
        (line) =>
          JSON.parse(line) as {
            slug: string
            name: string
            recordedBackground: Omit<MedicineRecordedBackground, 'version'>
          },
      )
    const violations: string[] = []

    for (const row of rows) {
      const view = dossier()
      view.slug = row.slug
      view.name = row.name
      view.medicineRecord.background = medicineBackgroundContext({
        ...row.recordedBackground,
        version: 'medicine-background/v1',
      })
      for (const projection of dossierAudienceLensProjections(view)) {
        const sourceBoundRows = projection.sections
          .flatMap((section) => section.records)
          .filter((item) => item.recordKind === 'medical_evidence' && item.sources.length > 0)
        if (sourceBoundRows.length !== projection.sourceBoundMedicalEvidenceRecords) {
          violations.push(`${row.slug}:${projection.lens}:incorrect-source-bound-count`)
        }
        for (const item of projection.sections.flatMap((section) => section.records)) {
          if (item.recordKind === 'medical_evidence' && item.sources.length === 0) {
            violations.push(`${row.slug}:${projection.lens}:${item.id}:missing-source`)
          }
          if (
            item.recordKind === 'medical_evidence' &&
            item.sources.some((source) => !source.id || !source.label || !source.freshness)
          ) {
            violations.push(`${row.slug}:${projection.lens}:${item.id}:incomplete-source`)
          }
          if (item.recordKind === 'identity') {
            const permittedShape =
              (item.id === 'biotech-programme-identity' &&
                JSON.stringify(item.canonicalFields) ===
                  JSON.stringify(['selectedProgrammeId', 'selectedProgrammeLabel']) &&
                item.summary === undefined &&
                item.facts.length === 1 &&
                item.facts[0]?.label === 'Programme id') ||
              (item.id === 'chemist-record-identity' &&
                JSON.stringify(item.canonicalFields) === JSON.stringify(['slug', 'name']) &&
                item.summary === undefined &&
                item.facts.length === 1 &&
                item.facts[0]?.label === 'Record key')
            if (!permittedShape || item.sources.length > 0) {
              violations.push(
                `${row.slug}:${projection.lens}:${item.id}:invalid-identity-exemption`,
              )
            }
          }
        }
      }
    }

    expect(rows).toHaveLength(9_855)
    expect(violations).toEqual([])
  })
})
