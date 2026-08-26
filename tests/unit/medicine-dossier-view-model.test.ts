import { describe, expect, it } from 'vitest'

import {
  countPlainWords,
  legacyMedicineDossierView,
  normalizedMedicineDossierView,
  trialDisplayState,
} from '@/lib/medicine-dossier-view-model'
import type { ClinicalTrialRecord, DrugDossier } from '@/lib/types'

function trial(overrides: Partial<ClinicalTrialRecord> = {}): ClinicalTrialRecord {
  return {
    trialId: 'STUDY-1',
    phase: 'Phase 3',
    sampleSize: 100,
    primaryEndpoint: 'A recorded endpoint',
    endpointMet: true,
    statisticalPValue: 'P < 0.01',
    independentReplicationStatus: 'Replicated',
    ...overrides,
  }
}

function dossier(): DrugDossier {
  return {
    id: 'example-medicine',
    name: 'Example Medicine',
    sponsor: '',
    targetGene: '',
    targetProtein: '',
    modality: 'siRNA (Small Interfering RNA)',
    approvalStatus: 'Phase 3 Clinical Trial',
    indication: 'A documented study scope',
    patientFriendlyIndication: 'A documented plain-language study scope',
    conditionContext: {
      conditionExplainer: 'A recorded condition explanation.',
      whyItMatters: 'A recorded explanation of why the condition matters.',
      whoTakesThis: 'People included in the older medicine record.',
      clinicalGoals: 'A result named in the older study or label.',
    },
    oneSentenceVerdict: 'A reviewed short answer based on the current record.',
    laymanHowItWorks: '',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 50,
    pricing: {
      synthesisCostPerDose: 'Reported cost: 1 unit',
      retailPricePerDoseOrYear: 'Reported price: 20 units in Exampleland in 2025',
      markupEstimate: 'A reported comparison, not a current estimate.',
      openPatentNotes: 'The older record includes a pricing note.',
      synthesisComplexity: 'Moderate',
      priceSource: {
        label: 'Example public price file',
        identifier: 'https://example.test/prices',
        kind: 'url',
      },
    } as DrugDossier['pricing'],
    substitutes: {
      summary: 'Several approaches are used for the same broad goal.',
      conventionalRx: [
        {
          name: 'Recorded conventional approach',
          class: 'A different treatment class',
          howItCompares: 'It was studied in a different setting.',
          typicalCost: 'A reported older cost',
          prosAndCons: 'The older record describes different tradeoffs.',
        },
      ],
      naturalFoods: [
        {
          name: 'Recorded related context',
          activeCompound: 'DO NOT RENDER ACTIVE COMPOUND',
          biologicalMechanism: 'DO NOT RENDER UNSOURCED MECHANISM OR 900 mg DAILY',
          evidenceStrength: 'Moderate Evidence',
          dailyUsage: 'DO NOT RENDER DAILY USE',
          monthlyCost: 'DO NOT RENDER MONTHLY COST',
        },
        {
          name: 'Related context without an evidence label',
          dailyUsage: '',
          monthlyCost: '',
        },
      ],
      homeRemedies: [
        {
          name: 'DO NOT RENDER HOME REMEDY',
          action: 'DO NOT RENDER ACTION',
          patientImpact: '',
          clinicalPrecaution: '',
        },
      ],
    },
    molecularSchema: {
      structureType: 'small_molecule_smiles',
      smilesString: 'CC(=O)OC1=CC=CC=C1C(=O)O',
      chemicalFormula: 'C9H8O4',
      molecularWeight: '180.16 g/mol',
      isMachineVerified: true,
      lastVerifiedTimestamp: '2026-08-20T00:00:00.000Z',
      laboratoryWorkflow: [
        {
          id: 'DO-NOT-RENDER-WORKFLOW',
          stepNumber: 1,
          phase: 'Synthesis',
          name: 'DO NOT RENDER SYNTHESIS STEP',
          description: 'DO NOT RENDER PROCEDURE',
          reagentsAndBuffer: 'DO NOT RENDER REAGENTS',
        },
      ],
    },
    auditPointsCount: { measured: 1, inferred: 1, failed: 0, conclusionShift: 0 },
    keyAudits: [
      {
        id: 'audit-measured',
        category: 'measured',
        title: 'A measured result',
        laymanSummary: 'The recorded measurement changed.',
        technicalDetails: 'A structured technical note.',
        evidenceSource: 'Example Journal 2026',
        doi: '10.0000/example',
        measuredMetric: 'An exact stored measurement name',
        auditFlag: 'verified',
      },
      {
        id: 'audit-inferred',
        category: 'inferred',
        title: 'An inference boundary',
        laymanSummary: 'The patient outcome has not been measured.',
        technicalDetails: 'The registered outcome study has not reported.',
        evidenceSource: 'Example Journal 2026',
        doi: '10.0000/example',
        inferredClaim: 'An exact stored inference',
        auditFlag: 'caution',
      },
    ],
    mechanismSteps: [
      {
        step: 1,
        title: 'The target changes',
        laymanDesc: 'A plain mechanism description.',
        molecularDetail: 'A technical mechanism description.',
        iconName: 'Target',
        visualStage: 'catalytic_action',
      },
      {
        step: 2,
        title: 'The measured marker changes',
        laymanDesc: 'A plain observed-effect description.',
        molecularDetail: 'A technical observed-effect description.',
        iconName: 'Activity',
        visualStage: 'therapeutic_result',
      },
    ],
    trials: [trial()],
    measuredVsInferredSummary: {
      strictlyMeasured: ['A measured result'],
      unsupportedInferences: ['An outcome inference'],
      whatFailedInitially: [],
      realWorldOutcome: [],
    },
    deliverySystem: {
      type: 'A recorded injection device',
      description: 'A clinician gives the recorded dose on the saved schedule.',
      safetyProfile:
        'The older record names common effects, a serious risk, and who should not receive it.',
    },
    commonQuestions: [
      {
        q: 'A recorded medicine-wide question?',
        a: 'A recorded medicine-wide answer.',
        auditNote: 'An internal audit note that is not part of the public question module.',
      },
    ],
    communityNotes: [
      {
        id: 'note-1',
        author: 'Example Reader',
        role: 'Community member',
        date: '2026-08-20T00:00:00.000Z',
        content: 'A substantive published community note.',
        upvotes: 2,
      },
    ],
    recentAuditDate: 'August 2026',
    hasDiscrepancy: true,
    anatomicalSite: 'A documented cellular location',
    isMachineVerifiedStructure: true,
  }
}

describe('medicine dossier view model', () => {
  it('counts plain words without splitting apostrophes or hyphenated terms', () => {
    expect(countPlainWords("A programme-scoped reader's answer")).toBe(4)
  })

  it('keeps a not-yet-reported study unknown rather than failed', () => {
    expect(
      trialDisplayState(
        trial({
          endpointMet: false,
          statisticalPValue: 'Not reported — primary completion date October 2027',
        }),
      ),
    ).toBe('unknown')
    expect(
      trialDisplayState(
        trial({ endpointStatus: 'not_reported', endpointMet: false, statisticalPValue: '' }),
      ),
    ).toBe('unknown')
    expect(
      trialDisplayState(
        trial({ endpointMet: false, statisticalPValue: 'Result not recorded on this page' }),
      ),
    ).toBe('unknown')
    expect(trialDisplayState({ endpointMet: false, statisticalPValue: '' })).toBe('unknown')
    expect(trialDisplayState({ endpointMet: false, statisticalPValue: 'Results pending' })).toBe(
      'unknown',
    )
    expect(trialDisplayState(trial({ endpointMet: false, statisticalPValue: 'P = 0.90' }))).toBe(
      'failed',
    )
  })

  it('maps legacy evidence without overstating machine verification', () => {
    const view = legacyMedicineDossierView(dossier())

    expect(view.bindingState).toBe('legacy_record')
    expect(view.statusBadge).toEqual({
      kind: 'medicine_approval',
      value: 'Phase 3 Clinical Trial',
    })
    expect(view.readerSummary).toMatchObject({
      basis: 'older_record',
      takeaway: 'The recorded measurement changed.',
      exactText: 'A reviewed short answer based on the current record.',
      simplified: true,
    })
    expect(view.readerSummary.contextItems).toContainEqual({
      label: 'What remains uncertain',
      text: 'The patient outcome has not been measured.',
    })
    expect(view.tenSecondWordCount).toBe(
      [
        view.readerSummary.usedFor,
        view.readerSummary.whatStudiesFound,
        view.readerSummary.biggestLimit,
        view.readerSummary.practicalNote,
        view.readerSummary.criticalSafety,
      ].reduce((total, value) => total + (value ? countPlainWords(value) : 0), 0),
    )
    expect(view.programmes).toHaveLength(1)
    expect(view.evidenceNodes.every((node) => !node.machineChecked)).toBe(true)
    expect(view.evidenceNodes[0]?.state).toBe('confirmed')
    expect(view.evidenceNodes[0]?.claimNature).toBe('measured')
    expect(view.evidenceNodes[0]?.label).toBe('Research finding')
    expect(view.evidenceNodes[0]?.professionalLabel).toBe('Medicine-wide research finding')
    expect(view.evidenceNodes[0]?.technicalDetail).toEqual({
      technicalDetails: 'A structured technical note.',
      measuredMetric: 'An exact stored measurement name',
      inferredClaim: undefined,
      evidenceSource: 'Example Journal 2026',
      auditFlag: 'verified',
    })
    expect(view.evidenceNodes[1]?.state).toBe('not_measured')
    expect(view.evidenceNodes[1]?.claimNature).toBe('rnawiki_judgement')
    expect(view.evidenceNodes[1]?.technicalDetail).toMatchObject({
      inferredClaim: 'An exact stored inference',
      auditFlag: 'caution',
    })
    expect(view.mechanismSummary.observed).toBe('A measured result')
    expect(view.sources).toHaveLength(1)
    expect(view.studies[0]).toMatchObject({
      state: 'measured',
      technicalResult: 'P < 0.01',
      replication: 'Yes — an independent team reported a similar result.',
    })
    expect(view.studies[0]?.result).toBeUndefined()
    expect(view.sources[0]?.href).toBe('https://doi.org/10.0000%2Fexample')
    expect(view.freshness).toBe('unknown')
    expect(view.freshnessLabel).toBe('Summary last checked: August 2026')
    expect(view.machineFindingCodes).toContain('LEGACY_PROGRAMME_UNSCOPED')
    expect(view.medicineRecord.condition?.conditionExplainer).toBe(
      'A recorded condition explanation.',
    )
    expect(view.medicineRecord.safetyAndAdministration).toEqual({
      deliveryForm: 'A recorded injection device',
      administrationAndDosing: 'A clinician gives the recorded dose on the saved schedule.',
      safetyInformation:
        'The older record names common effects, a serious risk, and who should not receive it.',
    })
    expect(view.medicineRecord.pricing?.sources[0]?.href).toBe('https://example.test/prices')
    expect(view.medicineRecord.conventionalAlternatives[0]?.name).toBe(
      'Recorded conventional approach',
    )
    expect(view.medicineRecord.foodSupplementContext).toEqual([
      {
        name: 'Recorded related context',
        recordedEvidenceLabel: 'Moderate Evidence',
        sourceStatus: 'not_linked',
      },
      {
        name: 'Related context without an evidence label',
        sourceStatus: 'not_linked',
      },
    ])
    expect(view.medicineRecord.commonQuestions).toEqual([
      {
        question: 'A recorded medicine-wide question?',
        answer: 'A recorded medicine-wide answer.',
      },
    ])
    expect(view.medicineRecord.molecular?.structureCheck).toBe('passed')
    expect(view.medicineRecord.molecular?.identifiers[0]).toMatchObject({
      kind: 'smiles',
      label: 'Structure string (SMILES, a text description of a molecule)',
    })
    expect(view.medicineRecord.communityNotes[0]?.content).toBe(
      'A substantive published community note.',
    )
    expect(JSON.stringify(view.medicineRecord)).not.toMatch(
      /DO NOT RENDER ACTIVE|DO NOT RENDER UNSOURCED|DO NOT RENDER DAILY|DO NOT RENDER MONTHLY|DO NOT RENDER HOME|DO NOT RENDER SYNTHESIS|DO NOT RENDER PROCEDURE|DO NOT RENDER REAGENTS/,
    )
  })

  it('does not invent a source for legacy food or supplement context', () => {
    const testDossier = dossier()
    ;(testDossier.substitutes!.naturalFoods[0] as unknown as Record<string, unknown>).source = {
      label: 'DO NOT INFER AN UNTYPED SOURCE',
      identifier: 'https://example.test/untyped-natural-source',
    }

    const view = legacyMedicineDossierView(testDossier)

    expect(view.medicineRecord.foodSupplementContext?.[0]).toEqual({
      name: 'Recorded related context',
      recordedEvidenceLabel: 'Moderate Evidence',
      sourceStatus: 'not_linked',
    })
    expect(JSON.stringify(view.medicineRecord.foodSupplementContext)).not.toContain(
      'DO NOT INFER AN UNTYPED SOURCE',
    )
    expect(JSON.stringify(view.medicineRecord.foodSupplementContext)).not.toContain(
      'untyped-natural-source',
    )
  })

  it('uses an empty legacy food or supplement projection when no stored items exist', () => {
    const testDossier = dossier()
    testDossier.substitutes!.naturalFoods = []

    expect(legacyMedicineDossierView(testDossier).medicineRecord.foodSupplementContext).toEqual([])

    const withoutStoredArray = dossier()
    delete (withoutStoredArray.substitutes as unknown as { naturalFoods?: unknown[] }).naturalFoods
    expect(
      legacyMedicineDossierView(withoutStoredArray).medicineRecord.foodSupplementContext,
    ).toEqual([])
  })

  it('distinguishes nucleotide strands from peptide or protein chains', () => {
    const rna = dossier()
    rna.molecularSchema = {
      structureType: 'rna_sequence',
      sequence5to3: 'AUGGAAUACUCUUGGUUAC',
      isMachineVerified: false,
      laboratoryWorkflow: [],
    }
    const dna = dossier()
    dna.molecularSchema = {
      structureType: 'rna_sequence',
      sequence5to3: 'TCACTTTCATAATGCTGG',
      isMachineVerified: false,
      laboratoryWorkflow: [],
    }
    const peptide = dossier()
    peptide.molecularSchema = {
      structureType: 'peptide_sequence',
      sequence5to3: 'HAEGTFTSDVSSYLEGQAAK',
      isMachineVerified: false,
      laboratoryWorkflow: [],
    }

    expect(legacyMedicineDossierView(rna).medicineRecord.molecular?.identifiers[0]).toEqual({
      kind: 'nucleotide_sequence',
      label: 'Genetic instruction sequence (RNA letters, 5′ to 3′)',
      value: 'AUGGAAUACUCUUGGUUAC',
    })
    expect(legacyMedicineDossierView(rna).medicineRecord.molecular?.format).toBe(
      'RNA sequence, written 5′ to 3′',
    )
    expect(legacyMedicineDossierView(dna).medicineRecord.molecular?.identifiers[0]).toEqual({
      kind: 'nucleotide_sequence',
      label: 'Genetic instruction sequence (DNA letters, 5′ to 3′)',
      value: 'TCACTTTCATAATGCTGG',
    })
    expect(legacyMedicineDossierView(dna).medicineRecord.molecular?.format).toBe(
      'Genetic instruction sequence, written 5′ to 3′',
    )
    expect(legacyMedicineDossierView(peptide).medicineRecord.molecular?.identifiers[0]).toEqual({
      kind: 'peptide_sequence',
      label: 'Protein or peptide building-block sequence',
      value: 'HAEGTFTSDVSSYLEGQAAK',
    })
  })

  it('does not present a p-value, a pending result, or unreplicated status as the outcome', () => {
    const pending = dossier()
    pending.trials = [
      trial({
        trialId: 'PENDING-STUDY',
        endpointMet: false,
        statisticalPValue: 'Not reported — expected after follow-up is complete',
        independentReplicationStatus: 'Unreplicated',
      }),
    ]

    const view = legacyMedicineDossierView(pending)

    expect(view.studies[0]).toMatchObject({
      id: 'PENDING-STUDY',
      state: 'unknown',
      technicalResult: 'Not reported — expected after follow-up is complete',
    })
    expect(view.studies[0]?.result).toBeUndefined()
    expect(view.studies[0]?.replication).toBeUndefined()
  })

  it('shows a stored study effect before its statistical test without changing the study id', () => {
    const testDossier = dossier()
    testDossier.trials = [
      trial({
        trialId: 'ORION-10 (NCT03399370)',
        endpointStatus: 'met',
        endpointMet: true,
        statisticalPValue:
          'After 510 days, the average percentage change in LDL cholesterol was 52.3 percentage points lower than with a dummy treatment; P < 0.001',
      }),
      trial({
        trialId: 'RECORDED-EFFECT',
        endpointStatus: undefined,
        endpointMet: true,
        statisticalPValue: 'The recorded blood measurement was lower after treatment.',
      }),
    ]

    const view = legacyMedicineDossierView(testDossier)

    expect(view.studies[0]).toMatchObject({
      id: 'ORION-10 (NCT03399370)',
      title: 'ORION-10',
      state: 'measured',
      result:
        'After 510 days, the average percentage change in LDL cholesterol was 52.3 percentage points lower than with a dummy treatment',
      technicalResult: 'P < 0.001',
    })
    expect(view.studies[1]).toMatchObject({
      id: 'RECORDED-EFFECT',
      result: 'The recorded blood measurement was lower after treatment.',
    })
    expect(view.studies[1]?.technicalResult).toBeUndefined()
  })

  it('distinguishes a result not yet repeated from a failed independent repeat', () => {
    const testDossier = dossier()
    testDossier.trials = [
      trial({ trialId: 'NOT-YET-REPEATED', independentReplicationStatus: 'Unreplicated' }),
      trial({ trialId: 'FAILED-REPEAT', independentReplicationStatus: 'Failed to Replicate' }),
      trial({ trialId: 'PARTLY-REPEATED', independentReplicationStatus: 'Partially Replicated' }),
    ]

    const view = legacyMedicineDossierView(testDossier)

    expect(view.studies.map((study) => study.replication)).toEqual([
      'Not yet — no independent team has repeated this result.',
      'No — an independent attempt did not find the same result.',
      'Partly — another study found a similar result, but the information on this page does not show that an independent team repeated it.',
    ])
  })

  it('keeps ambiguous legacy events neutral instead of labelling them failed or unknown', () => {
    const testDossier = dossier()
    testDossier.keyAudits.push(
      {
        id: 'audit-administrative-event',
        category: 'failed',
        title: 'An application was delayed after a manufacturing inspection',
        laymanSummary: 'The regulator delayed the application while a factory was inspected.',
        technicalDetails: 'Administrative event detail.',
        evidenceSource: 'Regulatory notice',
      },
      {
        id: 'audit-measured-failure',
        category: 'failed',
        title: 'The measured target did not change',
        laymanSummary: 'The study did not find the expected change.',
        technicalDetails: 'Measured result detail.',
        evidenceSource: 'Example study',
        measuredMetric: 'Change from baseline',
      },
    )
    testDossier.measuredVsInferredSummary.whatFailedInitially = [
      'A manufacturing inspection delayed the application.',
    ]
    testDossier.measuredVsInferredSummary.realWorldOutcome = [
      'A measured result lasted through later follow-up.',
    ]

    const view = legacyMedicineDossierView(testDossier)

    expect(view.evidenceNodes.find((node) => node.id === 'audit-administrative-event')?.state).toBe(
      'recorded_context',
    )
    expect(view.evidenceNodes.find((node) => node.id === 'audit-measured-failure')?.state).toBe(
      'contradicted',
    )
    expect(view.keyOutcomes.slice(-2).map((outcome) => outcome.state)).toEqual([
      'recorded_context',
      'recorded_context',
    ])
    expect(
      view.keyOutcomes.slice(-2).map((outcome) => [outcome.legacyGroup, outcome.legacyGroupLabel]),
    ).toEqual([
      ['earlier_setbacks_or_context', 'Earlier setbacks or context'],
      ['practical_observations', 'Practical observations'],
    ])
  })

  it('keeps sparse legacy JSON honest instead of crashing or inventing evidence', () => {
    const sparse = {
      ...dossier(),
      oneSentenceVerdict: undefined,
      keyAudits: [{}],
      trials: [{}],
      mechanismSteps: [{}],
      measuredVsInferredSummary: {},
      conditionContext: undefined,
      pricing: undefined,
      substitutes: undefined,
      molecularSchema: undefined,
      deliverySystem: undefined,
      commonQuestions: [],
      communityNotes: [],
    } as unknown as DrugDossier

    const view = legacyMedicineDossierView(sparse)

    expect(view.verdict).toBe('')
    expect(view.readerSummary).toMatchObject({
      basis: 'older_record',
      takeaway:
        'This page covers one use of Example Medicine: A documented plain-language study scope. A measured result is not recorded here.',
      simplified: false,
    })
    expect(view.readerSummary.exactText).toBeUndefined()
    expect(view.evidenceNodes).toEqual([])
    expect(view.studies).toEqual([])
    expect(view.mechanismSteps).toEqual([])
    expect(view.keyOutcomes).toEqual([])
    expect(view.mainLimitation).toBeUndefined()
    expect(view.medicineRecord).toEqual({
      condition: undefined,
      safetyAndAdministration: undefined,
      pricing: undefined,
      alternativesSummary: undefined,
      conventionalAlternatives: [],
      foodSupplementContext: [],
      commonQuestions: [],
      molecular: undefined,
      communityNotes: [],
    })
  })

  it('describes a missing intended use without showing database vocabulary', () => {
    const missingUse = dossier()
    missingUse.patientFriendlyIndication = ''
    missingUse.indication = ''
    missingUse.keyAudits = []

    const view = legacyMedicineDossierView(missingUse)

    expect(view.selectedProgrammeLabel).toBe(
      'What this medicine was used or studied for is not documented',
    )
    expect(view.readerSummary.takeaway).toBe('A measured result is not recorded here.')
    expect(JSON.stringify(view.readerSummary)).not.toContain('Scope not documented')
  })

  it('uses only a published programme input for a normalized verdict', () => {
    const drug = dossier()
    const view = normalizedMedicineDossierView(drug, {
      selected: {
        id: 'programme-a',
        label: 'Programme A',
        status: 'active',
        verdict: 'A published programme answer.',
        mechanismSummary: {},
        evidenceNodes: [
          {
            id: 'patient-outcome',
            order: 5,
            label: 'Patient outcome',
            title: 'Outcome not yet measured',
            summary: 'The published programme has no reviewed patient-outcome measurement.',
            state: 'not_measured',
            claimNature: 'sponsor_reported',
            sourceIds: [],
            machineChecked: true,
            findingCodes: [],
          },
        ],
        studies: [],
        keyOutcomes: [],
        mechanismSteps: [],
        timelineEvents: [],
        sources: [],
        freshness: 'current',
        freshnessLabel: 'Verified 22 August 2026',
        review: { revisionId: 'revision-a', engineVersion: 'rna-intelligence/2.0.0' },
        machineFindingCodes: [],
      },
      programmes: [
        {
          id: 'programme-a',
          label: 'Programme A',
          status: 'active',
          href: '?programme=programme-a',
        },
        {
          id: 'programme-b',
          label: 'Programme B',
          status: 'stopped',
        },
      ],
    })

    expect(view.bindingState).toBe('published_programme')
    expect(view.statusBadge).toEqual({ kind: 'programme_status', value: 'active' })
    expect(view.verdict).toBe('A published programme answer.')
    expect(view.readerSummary).toMatchObject({
      basis: 'published_programme',
      takeaway: 'A published programme answer.',
      exactText: 'A published programme answer.',
    })
    expect(view.selectedProgrammeStatus).toBe('active')
    expect(view.programmes.find((programme) => programme.selected)?.id).toBe('programme-a')
    expect(view.programmes.find((programme) => programme.id === 'programme-b')?.href).toBe(
      '?programme=programme-b',
    )
    expect(view.evidenceNodes[0]?.state).toBe('not_measured')
    expect(view.evidenceNodes[0]?.claimNature).toBe('sponsor_reported')
    expect(view.review.historyHref).toBe('/d/example-medicine/history')
    expect(view.medicineRecord.condition?.whyItMatters).toBe(
      'A recorded explanation of why the condition matters.',
    )
    expect(view.medicineRecord.safetyAndAdministration).toEqual({
      deliveryForm: 'A recorded injection device',
      safetyInformation:
        'The older record names common effects, a serious risk, and who should not receive it.',
    })
    expect(view.medicineRecord.pricing).toMatchObject({
      reportedRetailOrListPrice: 'Reported price: 20 units in Exampleland in 2025',
      reports: [
        {
          kind: 'reported_retail_or_list_price',
          source: { identifier: 'https://example.test/prices' },
        },
      ],
    })
    expect(view.medicineRecord.pricing?.reportedProductionCost).toBeUndefined()
    expect(view.medicineRecord.alternativesSummary).toBeUndefined()
    expect(view.medicineRecord.conventionalAlternatives).toEqual([])
    expect(view.medicineRecord.foodSupplementContext).toEqual([
      {
        name: 'Recorded related context',
        recordedEvidenceLabel: 'Moderate Evidence',
        sourceStatus: 'not_linked',
      },
      {
        name: 'Related context without an evidence label',
        sourceStatus: 'not_linked',
      },
    ])
    expect(view.medicineRecord.commonQuestions).toEqual([])
    expect(view.medicineRecord.molecular?.identifiers).toContainEqual(
      expect.objectContaining({ kind: 'smiles', value: 'CC(=O)OC1=CC=CC=C1C(=O)O' }),
    )
    expect(JSON.stringify(view.medicineRecord)).not.toMatch(
      /DO NOT RENDER DAILY|DO NOT RENDER MONTHLY|DO NOT RENDER SYNTHESIS|DO NOT RENDER PROCEDURE|DO NOT RENDER REAGENTS/,
    )
    expect(view.medicineRecord.communityNotes).toEqual([])
  })
})
