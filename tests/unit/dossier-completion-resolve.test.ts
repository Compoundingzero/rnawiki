import { describe, expect, it } from 'vitest'

import type { MedicineRecordedBackground } from '@/lib/background/types'
import {
  assessDossierCompletion,
  completionInputDigest,
  type CompletionInput,
} from '@/lib/dossier-completion/resolve'
import {
  DOSSIER_SECTION_IDS,
  SECTION_STATES,
  TERMINAL_SECTION_STATES,
  isTerminalSectionState,
} from '@/lib/dossier-completion/types'
import {
  SECTION_LABELS,
  SECTION_STATE_LABELS,
  dossierCompletionAssessmentView,
} from '@/lib/dossier-completion/view'
import { findForbiddenPhrases } from '@/lib/agents/core/types'

const READ_SECTIONS = [
  'indications_and_usage',
  'clinical_pharmacology',
  'pharmacokinetics',
  'mechanism_of_action',
  'contraindications',
  'boxed_warning',
  'warnings_and_cautions',
  'adverse_reactions',
  'use_in_specific_populations',
  'pregnancy',
  'pediatric_use',
  'geriatric_use',
  'nursing_mothers',
]

const ARCHIVES: CompletionInput['archives'] = {
  labelArchive: '2026-08-29',
  ndcDirectory: '2026-08-29',
  drugsAtFda: '2026-08-29',
  supplementDatabase: '2026-08-29',
  pricingFile: '2026-08-28',
  compoundDatabase: '2026-08-29',
  taxonomy: '2026-08-29',
  substanceRegistry: '2026-08-29',
}

const SOURCE = {
  kind: 'FDA_LABEL',
  identifier: 'set-1',
  label: 'Example label',
  retrievedAt: '2026-08-28',
}

function input(
  overrides: Partial<CompletionInput> & { background?: Partial<MedicineRecordedBackground> | null },
): CompletionInput {
  const { background, ...rest } = overrides
  return {
    drug: {
      id: 'example',
      slug: 'example',
      name: 'Example',
      dossierDepth: 'curated',
      modality: 'Small Molecule',
      approvalStatus: 'FDA Approved',
      recordedBackground:
        background === null
          ? null
          : ({
              version: 'medicine-background/v1',
              authoredAt: '2026-08-28',
              provenanceTier: 'extracted',
              ...(background ?? {}),
            } as MedicineRecordedBackground),
      legacyTrials: [],
      keyAudits: [],
      sourceProvenance: ['openFDA NDC Directory'],
      molecularSchema: null,
    },
    resolution: {
      entityClass: 'APPROVED_MEDICINE',
      identitySources: [
        { kind: 'UNII', identifier: 'ABC123', path: 'recordedBackground.registryIdentifiers.unii' },
      ],
      attributionWarnings: [],
    },
    duplicateRecords: [],
    labels: [],
    readLabelSections: READ_SECTIONS,
    archives: ARCHIVES,
    registrySearch: null,
    literatureSearch: null,
    programmes: { total: 0, published: 0 },
    labelExtractorRan: true,
    ...rest,
  }
}

const registrySearch = (
  studies: Array<{ nctId: string; hasResults: boolean }>,
): CompletionInput['registrySearch'] => ({
  status: 'SUCCEEDED',
  sourceIdentifier: 'clinicaltrials.gov/api/v2 studies snapshot 2026-09-01T09:00:05 sha256:abc',
  requestedAt: '2026-09-02T00:00:00.000Z',
  resultCount: studies.length,
  error: null,
  matched: [
    {
      totalMatchedStudies: studies.length,
      storedStudies: studies.length,
      withPostedResults: studies.filter((s) => s.hasResults).length,
      studies: studies.map((s) => ({
        ...s,
        eligibility: { sex: 'ALL', minimumAge: '18 Years', stdAges: ['ADULT'] },
      })),
    },
  ],
})

const literatureSearch = (count: number): CompletionInput['literatureSearch'] => ({
  status: 'SUCCEEDED',
  sourceIdentifier: 'pubmed/eutils esearch (clinical trial[pt]) 2026-09-02',
  requestedAt: '2026-09-02T00:00:00.000Z',
  resultCount: count,
  error: null,
  matched: [],
})

describe('dossier completion resolver', () => {
  it('assesses every section exactly once, in the fixed order, for every record', () => {
    const assessment = assessDossierCompletion(input({}))
    expect(assessment.sections.map((s) => s.sectionId)).toEqual([...DOSSIER_SECTION_IDS])
    expect(assessment.applicableSectionCount).toBe(DOSSIER_SECTION_IDS.length)
    for (const state of SECTION_STATES) expect(SECTION_STATE_LABELS[state]).toBeTruthy()
    for (const id of DOSSIER_SECTION_IDS) expect(SECTION_LABELS[id]).toBeTruthy()
  })

  it('stays incomplete while a search is pending and completes once both searches are recorded', () => {
    const pending = assessDossierCompletion(input({}))
    expect(pending.status).toBe('INCOMPLETE')
    expect(pending.nonTerminalSectionIds).toEqual([
      'trial-registry',
      'trial-results',
      'trial-eligibility',
      'literature-search',
    ])
    const searched = assessDossierCompletion(
      input({ registrySearch: registrySearch([]), literatureSearch: literatureSearch(0) }),
    )
    expect(searched.status).toBe('COMPLETE')
    expect(searched.nonTerminalSectionIds).toEqual([])
    expect(searched.terminalSectionCount).toBe(searched.applicableSectionCount)
    const registry = searched.sections.find((s) => s.sectionId === 'trial-registry')!
    expect(registry.state).toBe('NO_QUALIFYING_EVIDENCE_AFTER_SEARCH')
    expect(registry.basis).toContain('not evidence that no study exists')
  })

  it('keeps registration, posted results and measurement apart', () => {
    const withResults = assessDossierCompletion(
      input({
        registrySearch: registrySearch([
          { nctId: 'NCT00000001', hasResults: false },
          { nctId: 'NCT00000002', hasResults: true },
        ]),
        literatureSearch: literatureSearch(3),
      }),
    )
    const states = Object.fromEntries(withResults.sections.map((s) => [s.sectionId, s.state]))
    expect(states['trial-registry']).toBe('EXACT_STRUCTURED_SOURCE_DATA')
    expect(states['trial-results']).toBe('EXACT_STRUCTURED_SOURCE_DATA')
    expect(states['trial-eligibility']).toBe('EXACT_STRUCTURED_SOURCE_DATA')
    expect(withResults.sections.find((s) => s.sectionId === 'trial-results')?.basis).toContain(
      'have not been read',
    )
    const unposted = assessDossierCompletion(
      input({
        registrySearch: registrySearch([{ nctId: 'NCT00000001', hasResults: false }]),
        literatureSearch: literatureSearch(0),
      }),
    )
    expect(unposted.sections.find((s) => s.sectionId === 'trial-results')?.state).toBe(
      'RESULTS_NOT_POSTED',
    )
  })

  it('records an unreachable search as unavailable rather than as absence', () => {
    const assessment = assessDossierCompletion(
      input({
        registrySearch: registrySearch([]),
        literatureSearch: {
          status: 'UNREACHABLE',
          sourceIdentifier: 'pubmed',
          requestedAt: '2026-09-02T00:00:00.000Z',
          resultCount: null,
          error: 'HTTP 503',
          matched: [],
        },
      }),
    )
    const literature = assessment.sections.find((s) => s.sectionId === 'literature-search')!
    expect(literature.state).toBe('SOURCE_UNAVAILABLE')
    expect(isTerminalSectionState(literature.state)).toBe(true)
    expect(assessment.status).toBe('COMPLETE')
  })

  it('distinguishes a read label section with no statement from no label at all', () => {
    const withSection = assessDossierCompletion(
      input({
        labels: [
          {
            setId: 'set-1',
            declared: 1,
            sections: ['indications_and_usage', 'mechanism_of_action'],
            productTypes: ['HUMAN PRESCRIPTION DRUG'],
          },
        ],
        registrySearch: registrySearch([]),
        literatureSearch: literatureSearch(0),
      }),
    )
    const mechanism = withSection.sections.find((s) => s.sectionId === 'mechanism')!
    expect(mechanism.state).toBe('NO_QUALIFYING_EVIDENCE_AFTER_SEARCH')
    expect(mechanism.basisKind).toBe('LABEL_SECTION_READ_NO_QUALIFYING_STATEMENT')
    expect(mechanism.humanReadSuggested).toBe(true)
    expect(mechanism.sourceRefs.map((r) => r.identifier)).toEqual(['set-1'])
    const safety = withSection.sections.find((s) => s.sectionId === 'safety-statements')!
    expect(safety.basisKind).toBe('LABEL_ARCHIVE_SEARCH')
    expect(safety.basis).toContain('were not read')
    const noLabel = assessDossierCompletion(
      input({ registrySearch: registrySearch([]), literatureSearch: literatureSearch(0) }),
    )
    expect(noLabel.sections.find((s) => s.sectionId === 'mechanism')?.basis).toContain(
      'No label in the openFDA archive',
    )
    const curated = assessDossierCompletion(
      input({
        background: { provenanceTier: 'curated' },
        labelExtractorRan: false,
        labels: [
          { setId: 'set-1', declared: 1, sections: ['mechanism_of_action'], productTypes: [] },
        ],
        registrySearch: registrySearch([]),
        literatureSearch: literatureSearch(0),
      }),
    )
    const curatedMechanism = curated.sections.find((s) => s.sectionId === 'mechanism')!
    expect(curatedMechanism.state).toBe('BLOCKED_HUMAN_REVIEW')
    expect(curatedMechanism.basis).toContain('has not been run')
    expect(curated.status).toBe('INCOMPLETE')
    const combinationOnly = assessDossierCompletion(
      input({
        labels: [
          { setId: 'set-2', declared: 2, sections: ['mechanism_of_action'], productTypes: [] },
        ],
        registrySearch: registrySearch([]),
        literatureSearch: literatureSearch(0),
      }),
    )
    expect(combinationOnly.sections.find((s) => s.sectionId === 'mechanism')?.basis).toContain(
      'none is about it alone',
    )
  })

  it('reads recorded modules as source-backed and reports source-stated non-establishment and conflict', () => {
    const assessment = assessDossierCompletion(
      input({
        background: {
          mechanism: { statement: { textAsRecorded: 'x', source: SOURCE }, targets: [] } as never,
          populationStatements: [
            {
              population: 'PEDIATRIC',
              state: 'NOT_ESTABLISHED',
              textAsRecorded:
                'Safety and effectiveness in pediatric patients have not been established.',
              source: SOURCE,
            },
          ] as never,
          sourceConsensus: { fields: [{ field: 'halfLife', comparisonState: 'differ' }] } as never,
          pharmacokinetics: { halfLife: { display: '2 h', source: SOURCE } } as never,
        },
        registrySearch: registrySearch([]),
        literatureSearch: literatureSearch(0),
      }),
    )
    const states = Object.fromEntries(assessment.sections.map((s) => [s.sectionId, s.state]))
    expect(states.mechanism).toBe('EXACT_SOURCE_BACKED')
    expect(states['population-statements']).toBe('SOURCE_STATED_NOT_ESTABLISHED')
    expect(states['source-consensus']).toBe('SOURCE_CONFLICT')
    expect(states.pharmacokinetics).toBe('SOURCE_CONFLICT')
    expect(assessment.sections.find((s) => s.sectionId === 'mechanism')?.sourceRefs).toEqual([
      SOURCE,
    ])
  })

  it('credits a merged duplicate record and says where the module lives', () => {
    const assessment = assessDossierCompletion(
      input({
        duplicateRecords: [
          {
            slug: 'example-2',
            recordedBackground: {
              version: 'medicine-background/v1',
              authoredAt: '2026-08-28',
              supplementMarket: {
                labelCount: 4,
                categoriesAsRecorded: ['botanical'],
                source: { ...SOURCE, kind: 'DSLD', identifier: 'g1' },
              } as never,
            } as MedicineRecordedBackground,
          },
        ],
        registrySearch: registrySearch([]),
        literatureSearch: literatureSearch(0),
      }),
    )
    const market = assessment.sections.find((s) => s.sectionId === 'supplement-market')!
    expect(market.state).toBe('EXACT_STRUCTURED_SOURCE_DATA')
    expect(market.basisKind).toBe('RECORDED_MODULE_ON_DUPLICATE_RECORD')
    expect(market.basis).toContain('example-2')
  })

  it('treats the reviewed conclusion as not applicable without a programme and blocked with an unpublished one', () => {
    const none = assessDossierCompletion(
      input({ registrySearch: registrySearch([]), literatureSearch: literatureSearch(0) }),
    )
    expect(none.sections.find((s) => s.sectionId === 'reviewed-conclusion')?.state).toBe(
      'NOT_APPLICABLE',
    )
    const unpublished = assessDossierCompletion(
      input({
        programmes: { total: 1, published: 0 },
        registrySearch: registrySearch([]),
        literatureSearch: literatureSearch(0),
      }),
    )
    const section = unpublished.sections.find((s) => s.sectionId === 'reviewed-conclusion')!
    expect(section.state).toBe('BLOCKED_HUMAN_REVIEW')
    expect(unpublished.status).toBe('INCOMPLETE')
    expect(section.blockedReason).toContain('software cannot author one')
  })

  it('applies entity-class rules for organisms, biologics and unpriced records', () => {
    const organismBase = input({
      resolution: {
        entityClass: 'BOTANICAL_OR_ORGANISM_PREPARATION',
        identitySources: [],
        attributionWarnings: [],
      },
      background: {
        biologicalIdentity: {
          scientificName: 'Haliotis corrugata',
          source: { kind: 'NCBI_TAXONOMY', identifier: '6453' },
        } as never,
      },
      registrySearch: registrySearch([]),
      literatureSearch: literatureSearch(0),
    })
    const organism = assessDossierCompletion({
      ...organismBase,
      drug: {
        ...organismBase.drug,
        approvalStatus: 'Non-FDA / Dietary Supplement',
        modality: 'Nutraceutical / Botanical',
      },
    })
    const states = Object.fromEntries(organism.sections.map((s) => [s.sectionId, s.state]))
    expect(states['molecular-identity']).toBe('NOT_APPLICABLE')
    expect(states['biological-identity']).toBe('EXACT_STRUCTURED_SOURCE_DATA')
    expect(states['cost-context']).toBe('NOT_APPLICABLE')
    expect(states.identity).toBe('EXACT_STRUCTURED_SOURCE_DATA')
    expect(organism.sections.find((s) => s.sectionId === 'identity')?.humanReadSuggested).toBe(true)
    const antibody = assessDossierCompletion(
      input({
        drug: { ...input({}).drug, modality: 'Monoclonal Antibody (mAb)' },
        registrySearch: registrySearch([]),
        literatureSearch: literatureSearch(0),
      }),
    )
    expect(antibody.sections.find((s) => s.sectionId === 'molecular-identity')?.state).toBe(
      'NOT_APPLICABLE',
    )
  })

  it('is deterministic and produces a stable digest that ignores request clocks', () => {
    const first = input({
      registrySearch: registrySearch([]),
      literatureSearch: literatureSearch(0),
    })
    const second = input({
      registrySearch: { ...registrySearch([])!, requestedAt: '2026-09-03T00:00:00.000Z' },
      literatureSearch: { ...literatureSearch(0)!, requestedAt: '2026-09-03T00:00:00.000Z' },
    })
    expect(completionInputDigest(first)).toBe(completionInputDigest(second))
    expect(JSON.stringify(assessDossierCompletion(first).sections.map((s) => s.state))).toBe(
      JSON.stringify(assessDossierCompletion(second).sections.map((s) => s.state)),
    )
  })

  it('writes reader-facing basis sentences that pass the boundary screen and never name a patient action', () => {
    const variants = [
      input({}),
      input({
        registrySearch: registrySearch([{ nctId: 'NCT00000002', hasResults: true }]),
        literatureSearch: literatureSearch(2),
      }),
      input({
        labels: [{ setId: 'set-1', declared: 1, sections: READ_SECTIONS, productTypes: [] }],
      }),
    ]
    for (const variant of variants) {
      const view = dossierCompletionAssessmentView({
        ...assessDossierCompletion(variant),
        contentChangedAt: '2026-09-02T00:00:00.000Z',
        assessedAt: '2026-09-02T00:00:00.000Z',
      })
      for (const section of view.sections) {
        expect(
          findForbiddenPhrases(`${section.basis} ${section.stateLabel} ${section.label}`),
        ).toEqual([])
      }
      expect(findForbiddenPhrases(view.statusCopy)).toEqual([])
    }
    expect(TERMINAL_SECTION_STATES).toHaveLength(10)
  })
})
