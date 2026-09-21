/**
 * The dossier v4 view model over hand-built inputs.
 *
 * Every case asserts a rule the Substance Compass exists to keep: a statement carries its origin, a
 * mechanism is never promoted to a benefit, an absence is a sentence rather than a gap, a
 * prescription medicine never gets a self-experiment plan, and no internal key reaches the reader.
 *
 * Fixtures only. Nothing here is seed data and no sentence here describes a real result.
 */
import { describe, expect, it } from 'vitest'

import type { CorpusDossier } from '@/lib/corpus/dossier-page'
import { auditCopy, copyPasses, findInternalKeys } from '@/lib/dossier-v3/copy-contract'
import { NO_REVIEWED_CONCLUSION_SENTENCE } from '@/lib/dossier-v3/taxonomy'
import type { RoleAwareRegistryAggregate } from '@/lib/dossier-v3/trial-roles'
import { decideMedicinePageIndexing } from '@/lib/dossier-v4/indexability'
import { humaniseReaderText } from '@/lib/dossier-v4/reader-text'
import {
  COMPASS_SECTIONS,
  buildDossierV4,
  splitForReader,
  type DossierV4Inputs,
  type DossierV4ViewModel,
} from '@/lib/dossier-v4/view-model'
import type { DrugDossier } from '@/lib/types'

function corpus(overrides: Partial<CorpusDossier> = {}): CorpusDossier {
  return {
    key: 'K1:TEST',
    slug: 'testamab',
    displayName: 'Testamab',
    model: 'LONGEVITY',
    tier: 1,
    pageType: 'longevity',
    indexable: true,
    suppressed: false,
    suppressionClasses: [],
    suppressionEvidence: [],
    withdrawn: false,
    presentFieldCount: 8,
    applicableFieldCount: 12,
    synonyms: [{ kind: 'salt', label: 'Salt form', names: ['Testamab sodium'] }],
    register: 'test register',
    lastVerified: '2026-09-04',
    humanData: true,
    ladder: [
      { rung: 'mouse', label: 'Mouse', filled: true },
      { rung: 'human', label: 'Human', filled: false },
    ],
    blocks: [],
    registerEvents: [],
    identifiers: [],
    // The labels the corpus loader emits, not invented ones. "Same target as" is the case that
    // matters most: it names a different substance entirely and must never carry a result.
    relations: [
      { label: 'Stereoisomer of', name: 'Testamab isomer', slug: 'testamab-isomer' },
      { label: 'Same target as', name: 'Another fixture compound', slug: 'other-fixture' },
    ],
    hubs: [],
    sources: [
      { label: 'ClinicalTrials.gov', kind: 'registry', id: 'x', sourceDate: '2026-09-01' },
    ] as unknown as CorpusDossier['sources'],
    licenceNotes: [],
    registeredStudies: 3,
    controlled: false,
    controlledBasis: [],
    registration: [
      {
        id: 'US',
        jurisdiction: 'US',
        label: 'United States',
        status: 'Approved',
        ordinal: 0,
        line: 'Approved · 2 applications: prescription · checked 2026-08-28',
        disclosed: false,
        upstreamRegisters: [],
        applications: [],
        dateChecked: '2026-08-28',
      },
    ],
    controlledSchedules: [],
    interactions: {
      lines: [],
      sourcesChecked: ['register A', 'register B'],
      date: '2026-09-06',
      totals: {},
      predictedOnly: false,
    },
    computedSections: [],
    formOfNotes: [],
    relationNotes: [],
    ...overrides,
  } as CorpusDossier
}

const AGGREGATE: RoleAwareRegistryAggregate = {
  classifierVersion: 'trial-role-classifier/v1',
  snapshotDate: '2026-09-01',
  matchedStudies: 3,
  byRole: { experimental_intervention: 1, administered_role_unclear: 1, observational_exposure: 1 },
  synonymMatched: 0,
  excludedFromSizeStatistics: 0,
  plannedCompletionIgnored: 1,
  tested: {
    studies: 1,
    largest: { nctId: 'NCT00000001', enrollment: 120, enrollmentType: 'ACTUAL' },
    longestCompletedWindow: {
      nctId: 'NCT00000001',
      days: 365,
      startDate: '2020-01',
      completionDate: '2021-01',
    },
    medianEnrollment: 120,
    completedWithPostedResults: 0,
  },
  administeredRoleUnclear: 1,
  observationalExposure: 1,
  rows: [
    {
      nctId: 'NCT00000001',
      role: 'experimental_intervention',
      enrollment: 120,
      enrollmentType: 'ACTUAL',
      status: 'COMPLETED',
      startDate: '2020-01',
      completionDate: '2021-01',
      completionIsPlanned: false,
      phases: ['PHASE2'],
      synonymMatched: false,
    },
  ],
}

function legacyRecord(overrides: Partial<DrugDossier> = {}): DrugDossier {
  return {
    id: 'testamab',
    name: 'Testamab',
    sponsor: 'Fixture sponsor',
    targetGene: 'FIX1',
    targetProtein: 'Fixture protein',
    modality: 'Small Molecule',
    approvalStatus: 'Non-FDA / Dietary Supplement',
    indication: 'Fixture indication.',
    patientFriendlyIndication: 'Taken in this fixture for a fixture goal.',
    oneSentenceVerdict: 'A fixture verdict.',
    laymanHowItWorks:
      'It reaches the fixture tissue. Inside the cell it changes one step. Nothing else is described.',
    auditConfidence: 'Rigorous Replicated',
    confidenceScore: 50,
    anatomicalSite: 'Fixture tissue',
    hasDiscrepancy: false,
    auditPointsCount: { measured: 1, inferred: 0, failed: 1, conclusionShift: 0 },
    recentAuditDate: '2026-09-01',
    conditionContext: {
      conditionExplainer: 'A fixture explanation.',
      whyItMatters: 'It matters for the fixture.',
      whoTakesThis: 'Fixture adults aged 30 to 50.',
    },
    mechanismSteps: [
      {
        step: 1,
        title: 'Swallowed and absorbed',
        laymanDesc: 'It reaches the blood.',
        molecularDetail: 'Measured in 12 fixture subjects.',
        iconName: 'ArrowDown',
        visualStage: 'delivery',
      },
      {
        step: 2,
        title: 'Into the cell',
        laymanDesc: 'A carrier pulls it in.',
        molecularDetail: 'Shown in fixture mice only.',
        iconName: 'ArrowDownToLine',
        visualStage: 'cellular_entry',
      },
      {
        step: 3,
        title: 'Changes a step',
        laymanDesc: 'One chemical step changes.',
        molecularDetail: 'Described with no measurement named.',
        iconName: 'Zap',
        visualStage: 'target_binding',
      },
    ],
    trials: [
      {
        trialId: 'Fixture trial one (NCT00000001)',
        phase: 'Randomised double-blind placebo-controlled',
        sampleSize: 120,
        primaryEndpoint: 'Change in fixture strength after 12 weeks',
        endpointMet: true,
        endpointStatus: 'met',
        statisticalPValue: 'P = 0.01',
        unreportedAdverseSignals: 'A fixture limit that also names endpointMet in passing.',
        independentReplicationStatus: 'Replicated',
      },
      {
        trialId: 'Fixture trial two',
        phase: 'Phase 3',
        sampleSize: 400,
        primaryEndpoint: 'Overall survival over 4 years',
        endpointMet: false,
        endpointStatus: 'not_met',
        statisticalPValue: 'P = 0.60',
        independentReplicationStatus: 'Failed to Replicate',
      },
    ],
    keyAudits: [
      {
        id: 'fix-a1',
        category: 'measured',
        title: 'Fixture trial one measured strength',
        laymanSummary: 'A fixture summary.',
        technicalDetails: 'A fixture description.',
        evidenceSource: 'Fixture source 2026',
        doi: '10.0000/fixture',
        measuredMetric: 'Fixture strength',
        auditFlag: 'verified',
      },
    ],
    measuredVsInferredSummary: {
      strictlyMeasured: [
        'A cell step was measured in fixture tissue',
        'Fixture strength rose over 12 weeks against a dummy treatment in 120 fixture adults',
      ],
      unsupportedInferences: ['That it extends life, which no trial measured'],
      whatFailedInitially: ['A survival trial in 400 people showed no difference'],
      realWorldOutcome: ['Roughly half showed no change at all'],
    },
    deliverySystem: {
      type: 'Fixture oral powder',
      description: 'Sold in this fixture as a supplement, so no agency reviewed it before sale.',
      safetyProfile: 'A fixture safety note.',
    },
    commonQuestions: [],
    sourceProvenance: ['Fixture source 2026 (10.0000/fixture)'],
    ...overrides,
  } as DrugDossier
}

/**
 * A record whose register row says the substance is sold without a prescription. The default
 * `corpus()` register line says "prescription", and the two must not be mixed: which one a page
 * gets decides whether it is offered a self-experiment plan at all.
 */
function nonPrescriptionCorpus(): CorpusDossier {
  return corpus({
    registration: [
      {
        id: 'US',
        jurisdiction: 'US',
        label: 'United States',
        status: 'Marketed',
        ordinal: 0,
        line: 'Marketed · sold as a supplement · checked 2026-08-28',
        disclosed: false,
        upstreamRegisters: [],
        applications: [],
        dateChecked: '2026-08-28',
      },
    ],
  } as Partial<CorpusDossier>)
}

function inputs(overrides: Partial<DossierV4Inputs> = {}): DossierV4Inputs {
  return {
    corpus: corpus(),
    claims: [],
    fieldStates: [],
    roleAggregate: AGGREGATE,
    registryConditions: ['Type 2 Diabetes', 'Healthy'],
    registryCompletedNoResults: [{ nct: 'NCT00000002', completionDate: '2019-01' }],
    corrections: [],
    legacy: {
      modality: 'Small Molecule',
      approvalStatus: 'Non-FDA / Dietary Supplement',
      indication: 'Fixture indication.',
      entityClass: 'SUPPLEMENT',
      sourceProvenance: ['Label 2026'],
    },
    fields: {
      biomarkers: {
        state: 'present',
        value: {
          terms: [
            'muscle strength',
            'overall survival',
            'glycated hemoglobin',
            'hamilton depression rating scale',
            'completion of study',
          ],
        },
      },
    },
    reviewedConclusionState: 'NOT_APPLICABLE',
    hubs: [],
    now: new Date('2026-09-11T00:00:00Z'),
    legacyRecord: legacyRecord(),
    boundAnswer: null,
    ...overrides,
  }
}

describe('every reader statement carries its origin', () => {
  it('passes exact linked study and listing facts to the reader-facing sections', () => {
    const registrySource = {
      kind: 'CLINICALTRIALS' as const,
      identifier: 'NCT00000001',
      label: 'Fixture registry result',
      retrievedAt: '2026-09-19',
    }
    const listingSource = {
      kind: 'FDA_NDC' as const,
      identifier: '00000-001',
      label: 'Fixture directory',
      locator: 'https://api.fda.gov/drug/ndc.json?search=product_ndc%3A%2200000-001%22',
      retrievedAt: '2026-09-19',
    }
    const model = buildDossierV4(
      inputs({
        legacyRecord: legacyRecord({
          recordedBackground: {
            version: 'medicine-background/v1',
            authoredAt: '2026-09-19',
            provenanceTier: 'curated',
            pivotalResults: [
              {
                trialIdentifier: 'NCT00000001',
                endpointAsRecorded: 'Fixture test result',
                activeResultAsRecorded: '12 of 100',
                comparatorResultAsRecorded: '20 of 100',
                timepointAsRecorded: '12 weeks',
                source: registrySource,
                trialContext: {
                  trialIdentifier: 'NCT00000001',
                  studiedConditionAsRecorded: 'fixture condition',
                  testedInterventionAsRecorded: 'fixture compound',
                  formulationAndRouteAsRecorded: 'oral capsule',
                  source: registrySource,
                },
              },
            ],
            applicability: {
              trialIdentifier: 'NCT00000001',
              studiedGroupAsRecorded: 'adults with the fixture condition',
              includedAsRecorded: [],
              excludedAsRecorded: ['children'],
              source: registrySource,
            },
            productListing: {
              productCount: 2,
              singleIngredientProductCount: 1,
              dosageFormsAsRecorded: ['CAPSULE'],
              routesAsRecorded: ['ORAL'],
              marketingCategoriesAsRecorded: ['NDA'],
              pharmacologicClassesAsRecorded: [],
              sampleProductNdcs: ['00000-001'],
              source: listingSource,
            },
            productVariants: [
              {
                brandName: 'Fixture capsule',
                formAsRecorded: 'Capsule',
                strengthsAsRecorded: 'fixture strength',
                approvedUseAsRecorded: 'fixture condition',
                jurisdiction: 'US_FDA',
                statusAsRecorded: 'listed',
                source: listingSource,
              },
            ],
          } as unknown as DrugDossier['recordedBackground'],
        }),
      }),
    )
    expect(model.checkpoint.kind).toBe('human_result')
    expect(model.noResponse.measuredOutcome?.text).toContain('Fixture test result')
    expect(model.measurement.studyMeasure?.sources[0]?.url).toContain('NCT00000001')
    expect(model.unknowns.sourceBoundBoundary?.text).toContain('children')
    expect(model.practical.sourceBoundSupply[0]?.text).toContain('Fixture capsule is capsule')
    expect(model.practical.sourceBoundSupply.some((fact) => fact.text.includes('2 products'))).toBe(
      false,
    )
  })

  it('does not lead with an uncited authored use when a directly linked label use exists', () => {
    const source = {
      kind: 'DAILYMED' as const,
      identifier: 'adec4fd2-6858-4c99-91d4-531f5f2a2d79',
      label: 'Fixture product label',
      retrievedAt: '2026-09-19',
    }
    const record = legacyRecord({
      sourceProvenance: ['An uncited note'],
      recordedBackground: {
        recordedUses: {
          statements: [
            {
              textAsRecorded: 'For a specific fixture indication.',
              source,
            },
          ],
        },
      } as DrugDossier['recordedBackground'],
    })
    const model = buildDossierV4(inputs({ legacyRecord: record }))
    expect(model.hero.simpleAction.text).toBe('For a specific fixture indication.')
    expect(model.hero.simpleAction.origin).toBe('stored_source')
    expect(model.hero.simpleAction.sources[0]?.url).toContain('dailymed.nlm.nih.gov')
    expect(model.hero.simpleAction.text).not.toContain('fixture step')
  })

  it('does not promote legacy prose merely because its bibliography contains a DOI', () => {
    const model = buildDossierV4(inputs())
    expect(model.hero.simpleAction.origin).toBe('contract_sentence')
    expect(model.hero.simpleAction.state).toBe('awaiting_review')
    expect(model.hero.simpleAction.sources).toEqual([])
    expect(model.hero.whyPeopleCare.origin).toBe('absent')
    expect(model.hero.actionDetail.origin).toBe('absent')
    expect(model.hero.immediateChange.origin).toBe('absent')
    expect(model.hero.strongestGoalResult.origin).toBe('contract_sentence')
  })

  it('does not let a fingerprint-approved first-read note stand in for a source-linked result', () => {
    const model = buildDossierV4(
      inputs({
        boundAnswer: {
          copy: {
            usedFor: 'Used in this fixture for a fixture goal.',
            whatStudiesFound: 'A fixture result in fixture adults.',
            biggestLimit: 'A fixture limit.',
          },
          evidenceBinding: {
            kind: 'legacy_answer_and_evidence_fingerprint',
            version: 'legacy-ten-second-answer/v2',
            fingerprint: 'sha256:fixture',
          },
        },
      }),
    )
    // A fingerprint-approved summary is not an independently reviewed effect claim.
    expect(model.hero.strongestGoalResult.origin).toBe('contract_sentence')
    expect(model.hero.simpleAction.origin).toBe('contract_sentence')
    expect(model.hero.simpleAction.text).not.toContain('fixture goal')
    expect(model.publication.state).toBe('limited')
  })

  it('keeps use and mechanism tied to their respective label documents', () => {
    const useSource = {
      kind: 'DAILYMED' as const,
      identifier: 'adec4fd2-6858-4c99-91d4-531f5f2a2d79',
      label: 'Fixture use label',
      retrievedAt: '2026-09-19',
    }
    const mechanismSource = {
      kind: 'DAILYMED' as const,
      identifier: '42bdd912-2393-44c4-b7e0-47672ca28991',
      label: 'Fixture mechanism label',
      retrievedAt: '2026-09-19',
    }
    const model = buildDossierV4(
      inputs({
        legacyRecord: legacyRecord({
          recordedBackground: {
            recordedUses: {
              statements: [{ textAsRecorded: 'For the fixture condition.', source: useSource }],
            },
            mechanism: {
              statements: [
                { textAsRecorded: 'Acts on the fixture target.', source: mechanismSource },
              ],
            },
          } as DrugDossier['recordedBackground'],
        }),
      }),
    )
    expect(model.hero.simpleAction.origin).toBe('stored_source')
    expect(model.hero.whyPeopleCare.origin).toBe('stored_source')
    expect(model.hero.actionDetail.origin).toBe('stored_source')
    expect(model.hero.simpleAction.sources[0]?.url).toContain(useSource.identifier)
    expect(model.hero.actionDetail.sources[0]?.url).toContain(mechanismSource.identifier)
    expect(model.hero.actionDetail.sources[0]?.url).not.toContain(useSource.identifier)
    expect(model.hero.actionDetail.text).not.toContain('fixture step')
  })

  it('falls back to the contract sentence when the record holds no measured finding', () => {
    const model = buildDossierV4(
      inputs({
        legacyRecord: legacyRecord({
          measuredVsInferredSummary: {
            strictlyMeasured: [],
            unsupportedInferences: [],
            whatFailedInitially: [],
            realWorldOutcome: [],
          },
        }),
      }),
    )
    expect(model.hero.strongestGoalResult.text).toBe(NO_REVIEWED_CONCLUSION_SENTENCE)
    expect(model.hero.strongestGoalResult.origin).toBe('contract_sentence')
  })

  it('never claims a reviewed conclusion when no reviewed claim exists', () => {
    const model = buildDossierV4(inputs())
    const reviewed = model.sections.filter((section) => section.state === 'reviewed_content')
    expect(reviewed).toEqual([])
  })
})

describe('a human result needs an exact reviewed claim', () => {
  it('does not promote a legacy strength sentence into a reviewed result', () => {
    const model = buildDossierV4(inputs())
    expect(model.hero.strongestGoalResult.text).toBe(NO_REVIEWED_CONCLUSION_SENTENCE)
    expect(model.hero.resultScope).toBeNull()
  })

  it('reports the kind of result as unrecorded rather than guessing', () => {
    const model = buildDossierV4(
      inputs({
        legacyRecord: legacyRecord({
          measuredVsInferredSummary: {
            strictlyMeasured: ['A fixture observation with no named category'],
            unsupportedInferences: [],
            whatFailedInitially: [],
            realWorldOutcome: [],
          },
        }),
      }),
    )
    expect(model.hero.outcomeType).toBe('No result is published, so no kind of result applies yet')
  })
})

describe('a mechanism, an animal result and a biomarker stay off the benefit line', () => {
  it('draws an unmeasured path step as unverified and says why', () => {
    const model = buildDossierV4(inputs())
    const unverified = model.journey.edges.filter((edge) => !edge.verified)
    expect(unverified.length).toBeGreaterThan(0)
    expect(unverified.some((edge) => edge.evidenceOrigin === 'animal')).toBe(true)
    for (const edge of unverified) expect(edge.uncertaintyReason.length).toBeGreaterThan(10)
  })

  it('states that a body step is not a result in a person', () => {
    const model = buildDossierV4(inputs())
    expect(model.journey.truth.notProve).toMatch(/not a result in a person/i)
  })

  it('puts a test result in the measured lane and survival in the meaningful lane', () => {
    const model = buildDossierV4(inputs())
    expect(model.experience.measured.map((entry) => entry.term)).toContain('glycated hemoglobin')
    expect(model.experience.meaningful.map((entry) => entry.term)).toContain('overall survival')
    expect(model.experience.felt.map((entry) => entry.term)).toContain(
      'hamilton depression rating scale',
    )
  })

  it('never gives a goal a demonstrated state without a reviewed claim', () => {
    const model = buildDossierV4(inputs())
    const states = model.fingerprint.rows.flatMap((row) => row.cells.map((cell) => cell.state))
    expect(states).not.toContain('demonstrated')
  })

  it('holds no predicted edge on the public path', () => {
    const model = buildDossierV4(inputs())
    expect(model.journey.hiddenPredicted).toBe(0)
    expect(model.journey.edges.every((edge) => edge.evidenceOrigin !== 'predicted')).toBe(true)
  })
})

describe('time facets are never read off one another', () => {
  it('reports the study window and leaves exposure and follow-up unrecorded', () => {
    const model = buildDossierV4(inputs())
    const byFacet = new Map(model.timeline.entries.map((entry) => [entry.facet, entry]))
    expect(byFacet.get('assessed_outcome_duration')?.value.text).toContain('365 days')
    expect(byFacet.get('treatment_exposure_duration')?.value.origin).toBe('absent')
    expect(byFacet.get('follow_up_duration')?.value.origin).toBe('absent')
    expect(byFacet.get('follow_up_duration')?.value.basis).toMatch(/a different thing/i)
  })

  it('bounds the long term by the longest finished study', () => {
    const model = buildDossierV4(inputs())
    const longTerm = model.timeline.entries.find((entry) => entry.facet === 'long_term_unknown')
    expect(longTerm?.value.text).toContain('365 days')
  })
})

describe('the measurement section follows the risk of the substance', () => {
  it('offers a self-experiment plan for a non-prescription supplement that holds a recorded safety entry, with no amount', () => {
    const base = inputs({
      corpus: nonPrescriptionCorpus(),
      legacyRecord: legacyRecord({ modality: 'Nutraceutical / Botanical' }),
    })
    /*
     * Recorded safety is now part of the gate. Availability without a prescription is a legal and
     * market fact rather than evidence of low risk, so before this page offers a reader a protocol
     * to run on themselves, the record has to hold something about harm.
     */
    const model = buildDossierV4({
      ...base,
      fields: {
        ...base.fields,
        faers: { state: 'present', value: { terms: [{ term: 'headache', count: 3 }] } },
      },
    })
    expect(model.measurement.mode).toBe('self_experiment')
    const planText = model.measurement.plan.map((step) => step.text).join(' ')
    expect(planText).not.toMatch(/\b\d+\s?(mg|g|mcg|ml|iu)\b/i)
    expect(model.measurement.whatNotToMeasure.length).toBeGreaterThan(2)
    expect(model.measurement.stopRules.length).toBeGreaterThan(1)
  })

  it('refuses the plan on a non-prescription supplement with no recorded safety', () => {
    const model = buildDossierV4(
      inputs({
        corpus: nonPrescriptionCorpus(),
        legacyRecord: legacyRecord({ modality: 'Nutraceutical / Botanical' }),
      }),
    )
    expect(model.measurement.mode).toBe('clinician_questions')
    expect(model.measurement.plan).toEqual([])
  })

  it('replaces the plan with clinician questions on a supervised medicine', () => {
    const model = buildDossierV4(
      inputs({
        corpus: corpus({ controlled: true }),
        legacyRecord: legacyRecord({ approvalStatus: 'FDA Approved' }),
        legacy: {
          modality: 'Small Molecule',
          approvalStatus: 'FDA Approved',
          indication: 'A fixture prescription indication.',
          entityClass: 'APPROVED_MEDICINE',
          sourceProvenance: ['Label 2026'],
        },
      }),
    )
    expect(model.measurement.mode).toBe('clinician_questions')
    expect(model.measurement.plan).toEqual([])
    expect(model.measurement.stopRules).toEqual([])
  })

  it('keeps the planner away when the record contradicts itself', () => {
    /*
     * The fixture says "Small Molecule" and "Non-FDA / Dietary Supplement" at once. A record that
     * cannot say what it is does not get a measurement plan: the type resolves to unresolved and
     * the gate refuses, which is the conservative reading and the one a reader is safer with.
     */
    const model = buildDossierV4(inputs())
    expect(model.identity.substanceTypeCode).toBe('unknown_type')
    expect(model.measurement.mode).toBe('clinician_questions')
  })

  it('a supplement carrying a register classification loses the planner', () => {
    const model = buildDossierV4(
      inputs({
        corpus: corpus({ suppressionClasses: ['S6'], suppressed: true } as Partial<CorpusDossier>),
        legacyRecord: legacyRecord({ modality: 'Nutraceutical / Botanical' }),
      }),
    )
    expect(model.measurement.mode).toBe('clinician_questions')
  })

  it('states the boundary of what tracking can show', () => {
    const model = buildDossierV4(
      inputs({
        corpus: nonPrescriptionCorpus(),
        legacyRecord: legacyRecord({ modality: 'Nutraceutical / Botanical' }),
      }),
    )
    expect(model.measurement.boundary).toMatch(/cannot show what caused it/i)
  })
})

describe('absences are rendered, not dropped', () => {
  it('gives every section a state and a reason', () => {
    const model = buildDossierV4(inputs())
    expect(model.sections).toHaveLength(COMPASS_SECTIONS.length)
    for (const section of model.sections) {
      expect(section.state).toBeTruthy()
      expect(section.reason.length).toBeGreaterThan(10)
    }
  })

  it('carries no community lane, because RNAWiki collects no reports', () => {
    // The lane described how reports would be weighed, above an empty list, on every page. A
    // description of a feature is not a record of a medicine, so it is gone rather than switched off.
    const model = buildDossierV4(inputs())
    expect(Object.keys(model)).not.toContain('community')
    expect(model.sections.map((section) => section.id)).not.toContain('community')
  })

  it('never renders a stored object as text', () => {
    /*
     * `[object Object]` reached readers on aspirin, ibuprofen, metformin, caffeine, lovastatin,
     * semaglutide and inclisiran. The half-life facet did `String(kinetics)` on a field that is a
     * large object — a precedence note, the label's whole pharmacokinetics section, a list of
     * experimental rows — rather than reading the value out of it.
     *
     * This walks every statement the model produces and refuses the three ways a value that is not
     * a string reaches a page looking like one.
     */
    const model = buildDossierV4(inputs())
    const seen: string[] = []
    const walk = (value: unknown, path: string): void => {
      if (typeof value === 'string') {
        if (/\[object |undefined|NaN/u.test(value)) seen.push(`${path}: ${value.slice(0, 80)}`)
        return
      }
      if (Array.isArray(value)) {
        value.forEach((item, index) => walk(item, `${path}[${index}]`))
        return
      }
      if (value && typeof value === 'object') {
        for (const [key, item] of Object.entries(value)) walk(item, `${path}.${key}`)
      }
    }
    walk(model, 'model')
    expect(seen, `a stored value reached reader text unrendered:\n${seen.join('\n')}`).toEqual([])
  })

  it('does not count a standing sentence as recorded timing', () => {
    /*
     * The "how long anything takes" section emits one sentence on every page whatever the record
     * holds — the one saying nothing is recorded beyond the longest study. Counting it as content
     * made the section render on all 10,250 medicines and produce two distinct pages between them.
     */
    const model = buildDossierV4(inputs())
    const standing = model.timeline.entries.filter(
      (entry) => entry.value.origin === 'contract_sentence',
    )
    expect(standing.length).toBeGreaterThan(0)
    const measured = model.timeline.entries.some(
      (entry) => entry.value.origin !== 'absent' && entry.value.origin !== 'contract_sentence',
    )
    expect(model.timeline.state).toBe(measured ? 'source_checked_draft' : 'no_qualifying_evidence')
  })

  it('never asserts a generic remark as this record’s basis', () => {
    /*
     * Every page used to print "Day-to-day swing in sleep, food and stress moves most home
     * measurements more than a supplement would" under "On this record:", including on injectable
     * hospital medicines. A sentence printed under that heading has to come from the record.
     */
    const model = buildDossierV4(inputs())
    const noise = model.noResponse.entries.find((entry) => entry.code === 'measurement_noise')
    expect(noise?.applies).toBe(false)
    for (const entry of model.noResponse.entries) {
      if (!entry.applies) continue
      expect(entry.basis).not.toMatch(/more than a supplement would/i)
    }
  })

  it('says what was searched when a body path is missing', () => {
    const model = buildDossierV4(inputs({ legacyRecord: legacyRecord({ mechanismSteps: [] }) }))
    expect(model.journey.state).toBe('no_qualifying_evidence')
    expect(model.journey.textEquivalent.join(' ')).toMatch(
      /not the same as showing there is nothing/i,
    )
  })

  it('never turns a missing interaction record into reassurance', () => {
    const model = buildDossierV4(inputs())
    expect(model.stack.neverSafeLine.toLowerCase()).not.toMatch(/is safe|are safe together/)
    expect(model.stack.absenceLine.length).toBeGreaterThan(0)
  })
})

describe('identity decides whether evidence carries', () => {
  it('does not call a known incorrect substance merge identity-checked', () => {
    const model = buildDossierV4(
      inputs({
        corpus: corpus({ slug: 'magnesium-glycinate', displayName: 'Magnesium glycinate' }),
      }),
    )
    expect(model.identity.identityVerified).toBe(false)
    expect(model.identity.identityLabel).toBe('Record link mismatch')
    expect(model.publication.state).toBe('correction_hold')
    expect(model.publication.mayShowConclusions).toBe(false)
    expect(model.publication.reason).toMatch(/different substances/)
  })

  it('marks a mirror form as not carrying the evidence on this page', () => {
    const model = buildDossierV4(inputs())
    const isomer = model.formCheck.entries.find((entry) => entry.relation === 'isomer_of')
    expect(isomer).toBeDefined()
    expect(isomer?.carriesEvidence).toBe(false)
    expect(isomer?.note).toMatch(/does not automatically apply/i)
  })

  it('treats a shared-target link as a confirmed different substance', () => {
    const model = buildDossierV4(inputs())
    const sameTarget = model.formCheck.entries.find(
      (entry) => entry.relation === 'explicitly_not_equivalent_to',
    )
    expect(sameTarget?.counterpart).toBe('Another fixture compound')
    expect(sameTarget?.carriesEvidence).toBe(false)
  })

  it('nothing the corpus vocabulary can express carries evidence across', () => {
    const model = buildDossierV4(inputs())
    expect(model.formCheck.entries.every((entry) => !entry.carriesEvidence)).toBe(true)
  })

  it('shows a recorded identity correction rather than hiding the mistake', () => {
    const model = buildDossierV4(
      inputs({
        corrections: [
          {
            id: 'a'.repeat(64),
            subjectKind: 'synonym',
            subjectRef: 'A plant name',
            action: 'remove_synonym',
            reason: 'A plant is not a name of this substance.',
            before: {},
            after: {},
            recordedAt: new Date('2026-09-11T00:00:00Z'),
            ruleOrClassifierVersion: null,
          },
        ],
      }),
    )
    expect(model.formCheck.corrections).toHaveLength(1)
    expect(model.formCheck.corrections[0]?.why).toContain('A plant is not a name')
  })
})

describe('no internal key reaches the reader', () => {
  it('renders a field name inside a curated note in words', () => {
    const model = buildDossierV4(inputs())
    const card = model.humanResults.cards.find((entry) => entry.verdict === 'met')
    expect(card?.primaryLimitation).toContain('endpoint met')
    expect(card?.primaryLimitation).not.toContain('endpointMet')
  })

  it('removes a canonical record id rather than humanising it', () => {
    const result = humaniseReaderText('The record K1:MU72812GK0 holds this.')
    expect(result.text).not.toContain('K1:MU72812GK0')
    expect(result.text).toContain('an internal record id')
    expect(result.replaced).toContain('K1:MU72812GK0')
  })

  it('leaves ordinary prose untouched', () => {
    const sentence = 'Twelve weeks of training produced greater strength than training alone.'
    expect(humaniseReaderText(sentence).text).toBe(sentence)
  })

  it('keeps the assembled reader copy inside the plain-language contract', () => {
    const model = buildDossierV4(inputs())
    const reader = [
      model.hero.simpleAction.text,
      model.hero.actionDetail.text,
      model.hero.whyPeopleCare.text,
      model.hero.strongestGoalResult.text,
      model.hero.principalUncertainty.text,
      model.pagePromise,
      model.notAdvice,
      model.stack.neverSafeLine,
      ...model.measurement.plan.map((step) => step.text),
      ...model.noResponse.entries.map((entry) => entry.plain),
      // Joined as sentences, not with a bare space. Each of these renders in its own block on the
      // page, and joining them with a space merges two of them into one over-long sentence that no
      // reader ever meets.
    ].join('. ')
    expect(findInternalKeys(reader)).toEqual([])
    const report = auditCopy(reader)
    expect({
      forbidden: report.forbiddenPhrases.map((hit) => hit.match),
      certainty: report.unscopedCertainty.map((hit) => hit.match),
      over30: report.sentences.over30,
    }).toEqual({ forbidden: [], certainty: [], over30: 0 })
    expect(copyPasses(report)).toBe(true)
  })
})

describe('the next question is ranked by what prevents a misunderstanding', () => {
  it('puts the claim decoder first when a claim goes past the evidence', () => {
    const model = buildDossierV4(inputs())
    expect(model.nextQuestions[0]?.target).toBe('#claim-decoder')
    expect(model.nextQuestions[0]?.objective).toBe('Prevent a misunderstanding')
  })

  it('does not link to an unverified result card', () => {
    const model = buildDossierV4(inputs())
    const targets = model.nextQuestions.map((question) => question.target)
    expect(targets).not.toContain('#human-results')
  })

  it('every question points at a section that exists', () => {
    const model = buildDossierV4(inputs())
    const ids = new Set(COMPASS_SECTIONS.map((section) => `#${section.id}`))
    for (const question of model.nextQuestions) expect(ids.has(question.target)).toBe(true)
  })
})

describe('the gates decide whether a slug may be served', () => {
  it('requires an exact source for the opening even when a bibliography and tested study exist', () => {
    const model = buildDossierV4(inputs())
    const failed = model.gates.filter((gate) => !gate.passed).map((gate) => gate.code)
    expect(failed).toEqual(['claim_provenance_present'])
  })

  it('fails the trial-role gate when no study is classified as testing the substance', () => {
    const model = buildDossierV4(
      inputs({ roleAggregate: { ...AGGREGATE, tested: { ...AGGREGATE.tested, studies: 0 } } }),
    )
    const roles = model.gates.find((gate) => gate.code === 'trial_roles_valid')
    expect(roles?.passed).toBe(false)
  })

  it('does not mistake an authored purpose for a label-bound use', () => {
    const model = buildDossierV4(inputs({ legacyRecord: legacyRecord({ laymanHowItWorks: '' }) }))
    expect(model.hero.simpleAction.origin).toBe('contract_sentence')
    expect(model.gates.find((gate) => gate.code === 'claim_provenance_present')?.passed).toBe(false)
  })

  it('fails the provenance gate when neither an explanation nor a purpose is recorded', () => {
    const model = buildDossierV4(
      inputs({
        legacyRecord: legacyRecord({ laymanHowItWorks: '', patientFriendlyIndication: '' }),
      }),
    )
    expect(model.hero.simpleAction.origin).toBe('contract_sentence')
    expect(model.gates.find((gate) => gate.code === 'claim_provenance_present')?.passed).toBe(false)
  })
})

describe('recorded prose never puts a long sentence in the default reader layer', () => {
  it('leads with the sentences that fit and keeps the rest word for word', () => {
    const long =
      'Sold in this fixture as a supplement. Monohydrate is the form used in essentially all of the trial literature cited here, and the alternative salts and esters marketed as superior have not reproduced this evidence base or beaten it in a head to head comparison.'
    const split = splitForReader(long)
    expect(split.lead).toBe('Sold in this fixture as a supplement.')
    expect(split.rest).toContain('Monohydrate is the form used')
    expect(split.overLimit).toBe(false)
  })

  it('still shows a first sentence that is over the limit, and marks it', () => {
    // A truncated medical sentence is worse than a long one, so it is shown and flagged instead.
    const long = `A ${'very '.repeat(40)}long recorded sentence with no earlier break.`
    const split = splitForReader(long)
    expect(split.lead).toBe(long.trim())
    expect(split.overLimit).toBe(true)
  })

  it('returns empty for nothing rather than throwing', () => {
    expect(splitForReader(undefined)).toEqual({ lead: '', rest: '', overLimit: false })
  })

  it('keeps the full correction explanation beside the short one', () => {
    const model = buildDossierV4(
      inputs({
        corrections: [
          {
            id: 'a'.repeat(64),
            subjectKind: 'synonym',
            subjectRef: 'A plant name',
            action: 'remove_synonym',
            reason:
              'A plant is not a name of this substance. The identity stage sent a keyless legacy record to a name lookup, which returned a vendor record whose synonym list contains the plant name, and the merge rule then folded the plant into this page.',
            before: {},
            after: {},
            recordedAt: new Date('2026-09-11T00:00:00Z'),
            ruleOrClassifierVersion: null,
          },
        ],
      }),
    )
    const correction = model.formCheck.corrections[0]
    expect(correction?.why).toBe('A plant is not a name of this substance.')
    expect(correction?.fullReason).toContain('vendor record whose synonym list')
  })

  it('never lets a stored field name reach the change history', () => {
    // The defect this guards: pruning withdrawn studies wrote ledger subjects such as
    // `humanCeiling:NCT01407445`, and the change history put that field name into reader copy.
    const model = buildDossierV4(
      inputs({
        corrections: [
          {
            id: 'b'.repeat(64),
            subjectKind: 'stored_field_reference',
            subjectRef: 'humanCeiling:NCT00000001',
            action: 'remove_stored_reference',
            reason: 'A withdrawn study was still counted in a stored list.',
            before: {},
            after: {},
            recordedAt: new Date('2026-09-11T00:00:00Z'),
            ruleOrClassifierVersion: null,
          },
        ],
      }),
    )
    const reader = [
      ...model.changes.entries.map((entry) => entry.text),
      ...model.formCheck.corrections.map((entry) => `${entry.what} ${entry.why}`),
    ].join(' ')
    expect(reader).not.toContain('humanCeiling')
    expect(findInternalKeys(reader)).toEqual([])
  })
})

describe('the navigator is built from what the page rendered', () => {
  it('keeps a section that found nothing when its emptiness is the point', () => {
    /*
     * An unanswered safety question is a fact about the record, not an absence to tidy away. The
     * sections that carry uncertainty a reader has to see stay in the rail exactly because they are
     * empty: safety, who was studied, which form, what is unresolved, and the receipts.
     */
    const model = buildDossierV4(
      inputs({
        corpus: corpus({
          interactions: { lines: [], sourcesChecked: [], totals: {}, predictedOnly: false },
        } as Partial<CorpusDossier>),
      }),
    )
    const navigator = new Map(model.sections.map((section) => [section.id, section]))
    for (const id of ['safety', 'applicability', 'form-check', 'unknowns', 'evidence-receipts']) {
      expect(navigator.get(id)?.inNavigator).toBe(true)
    }
  })

  it('drops a section that found nothing and carries no uncertainty', () => {
    const model = buildDossierV4(inputs())
    const dropped = model.sections.filter((section) => !section.inNavigator)
    for (const section of dropped) {
      expect(['no_qualifying_evidence', 'not_applicable']).toContain(section.state)
    }
  })

  it('never offers a link to a section the page did not render', () => {
    const model = buildDossierV4(inputs())
    const ids = new Set(model.sections.map((section) => section.id))
    for (const section of model.sections.filter((entry) => entry.inNavigator)) {
      expect(ids.has(section.id)).toBe(true)
    }
  })

  it('a sparse record gets a shorter rail than a full one', () => {
    const full = buildDossierV4(inputs())
    const sparse = buildDossierV4(
      inputs({
        legacyRecord: legacyRecord({
          mechanismSteps: [],
          trials: [],
          keyAudits: [],
          measuredVsInferredSummary: {
            strictlyMeasured: [],
            unsupportedInferences: [],
            whatFailedInitially: [],
            realWorldOutcome: [],
          },
        }),
        fields: {},
      }),
    )
    const count = (model: ReturnType<typeof buildDossierV4>): number =>
      model.sections.filter((section) => section.inNavigator).length
    expect(count(sparse)).toBeLessThan(count(full))
  })
})

/**
 * Incomplete is not the same as wrong, and only wrong hides a page.
 *
 * The first version of this rule required every gate to pass. Two of the seven measure how far
 * RNAWiki has got with its own work rather than whether a page is safe to show, and one of those —
 * `trial_roles_valid` — depends on `page_registry_role_aggregates`, a table that is empty in
 * production. Requiring it de-indexed the entire medicine corpus the moment the layout went live:
 * aspirin, ibuprofen and metformin all came back `noindex, follow` from rnawiki.com.
 *
 * These cases pin the distinction rather than the list, so adding a gate cannot silently take the
 * corpus out of the index again.
 */
describe('indexing blocks on wrongness, not on incompleteness', () => {
  const COMPLETENESS_GATES = ['claim_provenance_present', 'trial_roles_valid'] as const
  const WRONGNESS_GATES = [
    'identity_passed',
    'no_cross_family_merge',
    'no_raw_internal_fields',
    'safety_mode_valid',
    'canonical_metadata_valid',
  ] as const

  function sourceBoundModel(): DossierV4ViewModel {
    return buildDossierV4(
      inputs({
        legacyRecord: legacyRecord({
          recordedBackground: {
            recordedUses: {
              statements: [
                {
                  textAsRecorded: 'For a specific fixture indication.',
                  source: {
                    kind: 'DAILYMED',
                    identifier: 'adec4fd2-6858-4c99-91d4-531f5f2a2d79',
                    label: 'Fixture label',
                    retrievedAt: '2026-09-19',
                  },
                },
              ],
            },
          } as DrugDossier['recordedBackground'],
        }),
      }),
    )
  }

  function withFailingGate(code: string): DossierV4ViewModel {
    const model = sourceBoundModel()
    return {
      ...model,
      identity: { ...model.identity, identityVerified: true },
      gates: model.gates.map((gate) => (gate.code === code ? { ...gate, passed: false } : gate)),
    }
  }

  function withEveryGatePassing(): DossierV4ViewModel {
    const model = sourceBoundModel()
    return {
      ...model,
      identity: { ...model.identity, identityVerified: true },
      gates: model.gates.map((gate) => ({ ...gate, passed: true })),
    }
  }

  it('indexes a page whose gates pass and whose record holds something', () => {
    const model = withEveryGatePassing()
    expect(model.substance.empty).toBe(false)
    expect(decideMedicinePageIndexing(model)).toMatchObject({ index: true, reason: 'indexable' })
  })

  it('does not index a legacy bibliography with no source-bound reader answer', () => {
    const model = buildDossierV4(inputs())
    expect(model.substance.empty).toBe(true)
    expect(decideMedicinePageIndexing(model)).toMatchObject({
      index: false,
      reason: 'record_empty',
    })
  })

  for (const code of COMPLETENESS_GATES) {
    it(`still indexes a page whose ${code} gate fails`, () => {
      const model = withFailingGate(code)
      expect(model.gates.some((gate) => gate.code === code && !gate.passed)).toBe(true)
      expect(decideMedicinePageIndexing(model).index).toBe(true)
    })
  }

  for (const code of WRONGNESS_GATES) {
    it(`refuses to index a page whose ${code} gate fails`, () => {
      expect(decideMedicinePageIndexing(withFailingGate(code))).toMatchObject({
        index: false,
        reason: 'gate_failed',
      })
    })
  }
})
