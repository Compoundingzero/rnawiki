import { describe, expect, it } from 'vitest'

import type { ProgrammeEvidenceReadModel } from '@/lib/evidence/types'
import { programmeEvidenceMedicineDossierView } from '@/lib/programme-dossier-view'
import type { DrugDossier } from '@/lib/types'

function drug(): DrugDossier {
  return {
    id: 'synthetic-medicine',
    name: 'Synthetic Medicine',
    sponsor: '',
    targetGene: '',
    targetProtein: '',
    modality: 'ASO (Antisense Oligonucleotide)',
    approvalStatus: 'Pre-clinical / Open Source',
    indication: 'Legacy medicine-level text',
    patientFriendlyIndication: 'Legacy medicine-level text',
    conditionContext: {
      conditionExplainer: 'Legacy medicine-wide condition background.',
      whyItMatters: 'Legacy medicine-wide context.',
      whoTakesThis: 'People named by the older record.',
      clinicalGoals: 'A goal named by the older record.',
    },
    oneSentenceVerdict:
      'A legacy medicine-level sentence that must not become a programme verdict.',
    laymanHowItWorks: '',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 50,
    pricing: {
      synthesisCostPerDose: '',
      retailPricePerDoseOrYear: 'An older reported price.',
      markupEstimate: '',
      openPatentNotes: 'An older pricing note.',
      synthesisComplexity: 'Moderate',
    },
    substitutes: {
      summary: 'Older medicine-wide comparison context.',
      conventionalRx: [
        {
          name: 'Another recorded approach',
          howItCompares: 'It answers a different clinical question.',
          typicalCost: '',
        },
      ],
      naturalFoods: [],
      homeRemedies: [],
    },
    molecularSchema: {
      structureType: 'generic_formula',
      chemicalFormula: 'C1H1',
      isMachineVerified: false,
      laboratoryWorkflow: [],
    },
    auditPointsCount: { measured: 0, inferred: 0, failed: 0, conclusionShift: 0 },
    keyAudits: [],
    mechanismSteps: [],
    trials: [],
    measuredVsInferredSummary: {
      strictlyMeasured: [],
      unsupportedInferences: [],
      whatFailedInitially: [],
      realWorldOutcome: [],
    },
    deliverySystem: { type: '', description: '', safetyProfile: '' },
    commonQuestions: [
      {
        q: 'An older medicine-wide question?',
        a: 'An older medicine-wide answer.',
      },
    ],
    communityNotes: [
      {
        id: 'community-note-1',
        author: 'Synthetic Reader',
        role: 'Community member',
        date: '2026-08-20T00:00:00.000Z',
        content: 'A published community comment.',
        upvotes: 1,
      },
    ],
    recentAuditDate: '',
    hasDiscrepancy: false,
    anatomicalSite: '',
  }
}

function model(withVerdict: boolean): ProgrammeEvidenceReadModel {
  const source = {
    id: 'snapshot-1',
    sourceId: 'source-1',
    sourceType: 'CLINICAL_TRIAL_REGISTRY' as const,
    externalIdentifier: 'SYNTHETIC-TRIAL-1',
    canonicalLocator: 'https://example.test/trial/1',
    title: 'Synthetic registry record',
    publisher: 'Synthetic registry',
    publicationDate: '2026-01-01',
    correctionStatus: 'CURRENT' as const,
    hierarchy: 'PRIMARY' as const,
    retrievedAt: '2026-08-20T00:00:00.000Z',
    sourcePublishedAt: '2026-01-01T00:00:00.000Z',
    lastVerifiedAt: '2026-08-20T00:00:00.000Z',
    contentHash: 'a'.repeat(64),
    sourceLocator: 'results.primary',
    relationship: 'SUPPORTS' as const,
  }
  const presentationSource = {
    sourceId: source.sourceId,
    sourceSnapshotId: source.id,
    sourceType: source.sourceType,
    externalIdentifier: source.externalIdentifier,
    canonicalLocator: source.canonicalLocator,
    title: source.title,
    publisher: source.publisher,
    publicationDate: source.publicationDate,
    retrievedAt: source.retrievedAt,
    contentHash: source.contentHash,
    claimBindings: [
      {
        claimId: 'claim-1',
        relationship: 'SUPPORTS' as const,
        plainLanguageText: 'The exact source supports the reviewed statement.',
      },
    ],
  }

  return {
    medicine: {
      id: 'drug-internal-1',
      slug: 'synthetic-medicine',
      name: 'Synthetic Medicine',
      modality: 'ASO (Antisense Oligonucleotide)',
    },
    programmes: [
      {
        id: 'programme-internal-1',
        slug: 'synthetic-programme',
        title: 'Synthetic programme',
        indication: 'Synthetic indication',
        targetPopulation: 'Synthetic population',
        status: 'ACTIVE',
        updateStatus: 'CURRENT',
        hasPublishedVerdict: withVerdict,
      },
    ],
    selectedProgramme: {
      id: 'programme-internal-1',
      slug: 'synthetic-programme',
      title: 'Synthetic programme',
      indication: 'Synthetic indication',
      targetPopulation: 'Synthetic population',
      jurisdiction: 'Synthetic jurisdiction',
      sponsor: 'Synthetic sponsor',
      partners: [],
      status: 'ACTIVE',
      highestPhaseReached: 'Phase 1',
      route: 'Synthetic route',
      doseExposureContext: 'Synthetic exposure scope',
      startDate: '2026-01-01',
      endDate: null,
      rawStoppingReason: null,
      stoppingReasonCategory: 'UNKNOWN',
      updateStatus: 'CURRENT',
      trials: [
        {
          id: 'programme-trial-1',
          trialIdentifier: 'SYNTHETIC-TRIAL-1',
          title: 'Synthetic trial',
          phase: 'Phase 1',
          status: 'ACTIVE_NOT_RECRUITING',
          enrolment: 20,
          enrolmentType: 'ACTUAL',
          startDate: '2026-01-01',
          primaryCompletionDate: null,
          completionDate: '2026-12-31',
          humanStudyStatus: 'YES',
          lastVerifiedAt: '2026-08-20T00:00:00.000Z',
          registrySnapshot: {
            sourceId: 'source-1',
            sourceType: 'CLINICAL_TRIAL_REGISTRY',
            externalIdentifier: 'SYNTHETIC-TRIAL-1',
            canonicalLocator: 'https://example.test/trial/1',
            sourceTitle: 'Synthetic registry record',
            snapshotId: 'snapshot-1',
            contentHash: 'a'.repeat(64),
            retrievedAt: '2026-08-20T00:00:00.000Z',
            lastVerifiedAt: '2026-08-20T00:00:00.000Z',
          },
          interpretability: [
            {
              id: 'assessment-1',
              criterion: 'STATISTICAL_POWER',
              state: 'UNCLEAR',
              revisionNumber: 1,
              explanation: 'The published record does not settle this criterion.',
              lastVerifiedAt: '2026-08-20T00:00:00.000Z',
              publishedAt: '2026-08-21T00:00:00.000Z',
              supportingClaimIds: ['claim-1'],
              contradictingClaimIds: [],
              qualifyingClaimIds: [],
            },
          ],
        },
      ],
      claims: [
        {
          id: 'claim-1',
          claimKey: 'synthetic.claim.1',
          revisionNumber: 1,
          programmeTrialId: 'programme-trial-1',
          trialIdentifier: 'SYNTHETIC-TRIAL-1',
          evidenceNodeType: 'BIOLOGICAL_RESPONSE',
          nature: 'MEASURED',
          plainLanguageText: 'A synthetic measurement was recorded.',
          technicalText: 'Synthetic technical detail.',
          population: 'Synthetic population',
          intervention: 'Synthetic intervention',
          comparator: 'Synthetic comparator',
          dose: 'Synthetic dose',
          route: 'Synthetic route',
          duration: 'Synthetic duration',
          endpoint: 'Synthetic endpoint',
          endpointHierarchy: 'PRIMARY',
          outcomeType: 'BIOMARKER',
          numericValue: '10.0000000000',
          numericUnit: 'synthetic units',
          uncertaintyInterval: '95% interval: 8 to 12',
          direction: 'INCREASE',
          timepoint: 'Synthetic timepoint',
          reviewerInterpretation: null,
          lastVerifiedAt: '2026-08-20T00:00:00.000Z',
          publishedAt: '2026-08-21T00:00:00.000Z',
          sources: [source],
        },
      ],
      evidenceNodes: [
        {
          id: 'node-1',
          nodeType: 'BIOLOGICAL_RESPONSE',
          revisionNumber: 1,
          state: 'CONFIRMED',
          plainSummary: 'A biological response was documented in the synthetic fixture.',
          professionalSummary: null,
          rationale: null,
          lastVerifiedAt: '2026-08-20T00:00:00.000Z',
          publishedAt: '2026-08-21T00:00:00.000Z',
          supportingClaimIds: ['claim-1'],
          contradictingClaimIds: [],
          qualifyingClaimIds: [],
        },
      ],
      verdict: withVerdict
        ? {
            id: 'verdict-1',
            revisionNumber: 1,
            programmeStatusAtReview: 'ACTIVE',
            verdictCode: null,
            publicLabel: 'No final programme verdict',
            professionalLabel: 'Active programme conclusion',
            indicationScope: 'Synthetic indication',
            populationScope: 'Synthetic population',
            doseExposureScope: 'Synthetic exposure scope',
            periodScope: 'Synthetic period',
            trialScope: 'SYNTHETIC-TRIAL-1',
            outcomeScope: 'Synthetic endpoint',
            plainMechanism: 'The synthetic programme describes a recorded mechanism.',
            bestSupportedFinding: 'A synthetic measurement was recorded.',
            mainLimitation: 'The synthetic fixture has no final outcome.',
            oneSentenceReason: 'Testing remains underway in this synthetic fixture.',
            whatWasDisproven: [],
            whatWasNotDisproven: ['The programme question remains open.'],
            whatRemainsUnknown: ['The final outcome is unknown.'],
            confidence: 'MODERATE',
            confidenceExplanation: 'The synthetic record is incomplete.',
            conditionsThatWouldChangeVerdict: ['A reviewed final outcome would change it.'],
            authorName: 'Synthetic Author',
            conflictsOfInterest: null,
            engineVersion: 'rna-intelligence/2.0.0',
            inputDigestAlgorithm: 'sha256',
            inputDigest: 'b'.repeat(64),
            reviewedAt: '2026-08-21T00:00:00.000Z',
            publishedAt: '2026-08-22T00:00:00.000Z',
            reviewers: [
              {
                id: 'review-1',
                reviewerName: 'Synthetic Reviewer',
                reviewerOrcidSnapshot: '0000-0001-2345-6789',
                expertiseTags: ['CLINICAL_PHARMACOLOGY', 'BIOSTATISTICS'],
                decision: 'APPROVE',
                isIndependent: true,
                conflictsOfInterest: null,
                reviewNote: null,
                reviewedAt: '2026-08-21T00:00:00.000Z',
              },
            ],
            supportingClaimIds: ['claim-1'],
            contradictoryClaimIds: [],
          }
        : null,
      presentation: withVerdict
        ? {
            schemaVersion: 'programme-presentation/v1',
            mechanismSteps: [
              {
                stepKey: 'delivery',
                stepOrder: 1,
                plainTitle: 'The medicine reaches the intended cells',
                plainDescription: 'The linked source recorded delivery to the intended cells.',
                technicalDescription: 'Synthetic delivery measurement.',
                evidenceBasis: 'MEASURED_IN_PEOPLE',
                claimLinks: [{ claimId: 'claim-1', relationship: 'SUPPORTS' }],
                sources: [presentationSource],
              },
              {
                stepKey: 'target',
                stepOrder: 2,
                plainTitle: 'It changes the intended target',
                plainDescription: 'The target change was measured outside people.',
                technicalDescription: null,
                evidenceBasis: 'MEASURED_OUTSIDE_PEOPLE',
                claimLinks: [{ claimId: 'claim-1', relationship: 'SUPPORTS' }],
                sources: [presentationSource],
              },
              {
                stepKey: 'effect',
                stepOrder: 3,
                plainTitle: 'A later effect is predicted',
                plainDescription: 'This later stage remains a prediction for the selected use.',
                technicalDescription: null,
                evidenceBasis: 'PREDICTED',
                claimLinks: [{ claimId: 'claim-1', relationship: 'SUPPORTS' }],
                sources: [presentationSource],
              },
            ],
            timelineEvents: [
              {
                eventKey: 'important-result',
                eventDate: '2026-08-20',
                eventType: 'IMPORTANT_RESULT',
                dateBasis: 'ACTUAL',
                plainTitle: 'The result changed the programme record',
                plainDescription: 'The exact linked source reported a decision-changing result.',
                technicalDescription: null,
                programmeTrialId: 'programme-trial-1',
                sourceId: 'source-1',
                sourceSnapshotId: 'snapshot-1',
                claimLinks: [{ claimId: 'claim-1', relationship: 'SUPPORTS' }],
                source: presentationSource,
              },
            ],
          }
        : null,
      publicationHistory: withVerdict
        ? [
            {
              revisionId: 'verdict-1',
              revisionNumber: 1,
              publishedAt: '2026-08-22T00:00:00.000Z',
              supersededAt: null,
            },
          ]
        : [],
      freshness: [
        {
          sourceId: 'source-1',
          sourceTitle: 'Synthetic registry record',
          sourceType: 'CLINICAL_TRIAL_REGISTRY',
          checkStatus: 'SUCCEEDED',
          freshnessStatus: 'CURRENT',
          currentSnapshotId: 'snapshot-1',
          pendingSnapshotId: null,
          lastCheckAttemptAt: '2026-08-20T00:00:00.000Z',
          lastSuccessfulCheckAt: '2026-08-20T00:00:00.000Z',
          lastVerifiedAt: '2026-08-20T00:00:00.000Z',
          nextCheckDueAt: '2026-08-27T00:00:00.000Z',
          consecutiveFailures: 0,
        },
      ],
    },
  }
}

describe('published programme dossier mapping', () => {
  it('does not relabel legacy medicine prose as an unpublished programme verdict', () => {
    const view = programmeEvidenceMedicineDossierView(
      drug(),
      model(false),
      new Date('2026-08-22T12:00:00.000Z'),
    )

    expect(view.bindingState).toBe('programme_unpublished')
    expect(view.statusBadge).toEqual({ kind: 'programme_status', value: 'ACTIVE' })
    expect(view.selectedProgrammeId).toBe('synthetic-programme')
    expect(view.verdict).toBe('')
    expect(view.readerSummary).toMatchObject({
      basis: 'unpublished_programme',
      takeaway: 'No reviewed plain-language answer has been published for this use.',
      simplified: false,
    })
    expect(view.readerSummary.exactText).toBeUndefined()
    expect(view.evidenceNodes).toEqual([])
    expect(view.studies).toEqual([
      expect.objectContaining({
        id: 'SYNTHETIC-TRIAL-1',
        title: 'Synthetic trial',
        phase: 'Phase 1',
        status: 'Active Not Recruiting',
        studyType: 'Human study',
        startDate: '2026-01-01',
        completionDate: '2026-12-31',
        sampleSize: 20,
        enrolmentType: 'ACTUAL',
        state: 'unknown',
        registrySourceId: 'snapshot-1',
        sourceIds: ['snapshot-1'],
      }),
    ])
    expect(view.studies[0]?.interpretability?.[0]).toMatchObject({
      claimIds: ['claim-1'],
      sourceIds: ['snapshot-1'],
    })
    expect(view.sources).toEqual([
      expect.objectContaining({
        identifier: 'SYNTHETIC-TRIAL-1',
        snapshotHash: 'a'.repeat(64),
        freshness: 'current',
      }),
    ])
    expect(view.machineFindingCodes).toContain('PROGRAMME_VERDICT_NOT_PUBLISHED')
    expect(view.review.historyHref).toBe(
      '/d/synthetic-medicine/programme/synthetic-programme/history',
    )
    expect(view.medicineRecord.condition?.conditionExplainer).toBe(
      'Legacy medicine-wide condition background.',
    )
    expect(view.medicineRecord.pricing?.reportedRetailOrListPrice).toBe('An older reported price.')
    expect(view.medicineRecord.communityNotes).toHaveLength(1)
  })

  it('maps the current published programme lineage without inventing missing fields', () => {
    const view = programmeEvidenceMedicineDossierView(
      drug(),
      model(true),
      new Date('2026-08-22T12:00:00.000Z'),
    )

    expect(view.bindingState).toBe('published_programme')
    expect(view.statusBadge).toEqual({ kind: 'programme_status', value: 'ACTIVE' })
    expect(view.approvalStatus).toBe('Active')
    expect(view.programmes[0]?.href).toBe('?programme=synthetic-programme')
    expect(view.verdict).toBe('Testing remains underway in this synthetic fixture.')
    expect(view.readerSummary).toMatchObject({
      basis: 'published_programme',
      takeaway: 'A synthetic measurement was recorded.',
      exactText: 'Testing remains underway in this synthetic fixture.',
      simplified: true,
    })
    expect(view.readerSummary.contextItems).toEqual([
      { label: 'What this page covers', text: 'Synthetic programme' },
      {
        label: 'How it is meant to work',
        text: 'The synthetic programme describes a recorded mechanism.',
      },
      { label: 'Best-supported finding', text: 'A synthetic measurement was recorded.' },
      { label: 'What remains uncertain', text: 'The synthetic fixture has no final outcome.' },
    ])
    expect(view.mechanismSummary.change).toBe(
      'The synthetic programme describes a recorded mechanism.',
    )
    expect(view.mechanismSummary.observed).toBe('A synthetic measurement was recorded.')
    expect(view.mainLimitation).toBe('The synthetic fixture has no final outcome.')
    expect(view.evidenceNodes[0]?.state).toBe('confirmed')
    expect(view.evidenceNodes[0]?.label).toBe('Change measured in the body')
    expect(view.evidenceNodes[0]?.professionalLabel).toBe('Pharmacodynamic or biomarker effect')
    expect(view.evidenceNodes[0]?.claims?.[0]).toMatchObject({
      intervention: 'Synthetic intervention',
      comparator: 'Synthetic comparator',
      route: 'Synthetic route',
      duration: 'Synthetic duration',
      endpoint: 'Synthetic endpoint',
      endpointHierarchy: 'PRIMARY',
      outcomeType: 'BIOMARKER',
      direction: 'INCREASE',
      exactResult: '10 synthetic units',
      uncertaintyInterval: '95% interval: 8 to 12',
      sourceIds: ['snapshot-1'],
    })
    expect(view.studies[0]?.interpretability?.[0]).toMatchObject({
      state: 'unclear',
      claimIds: ['claim-1'],
      sourceIds: ['snapshot-1'],
    })
    expect(view.studies[0]).toMatchObject({
      studyType: 'Human study',
      startDate: '2026-01-01',
      completionDate: '2026-12-31',
      enrolmentType: 'ACTUAL',
      endpoint: 'Synthetic endpoint',
      endpointHierarchy: 'PRIMARY',
      registrySourceId: 'snapshot-1',
    })
    expect(view.keyOutcomes[0]).toMatchObject({
      label: 'A synthetic measurement was recorded.',
      endpoint: 'Synthetic endpoint',
      endpointHierarchy: 'PRIMARY',
      intervention: 'Synthetic intervention',
      comparator: 'Synthetic comparator',
      numericValue: '10',
      numericUnit: 'synthetic units',
      uncertaintyInterval: '95% interval: 8 to 12',
      direction: 'INCREASE',
      timepoint: 'Synthetic timepoint',
      outcomeType: 'BIOMARKER',
      sourceIds: ['snapshot-1'],
    })
    expect(view.mechanismSteps).toEqual([
      expect.objectContaining({
        id: 'delivery',
        order: 1,
        evidenceBasis: 'MEASURED_IN_PEOPLE',
        claimIds: ['claim-1'],
        sourceIds: ['snapshot-1'],
      }),
      expect.objectContaining({
        id: 'target',
        order: 2,
        evidenceBasis: 'MEASURED_OUTSIDE_PEOPLE',
      }),
      expect.objectContaining({ id: 'effect', order: 3, evidenceBasis: 'PREDICTED' }),
    ])
    expect(view.timelineEvents).toEqual([
      expect.objectContaining({
        id: 'source:important-result',
        provenance: 'source',
        eventType: 'IMPORTANT_RESULT',
        sourceIds: ['snapshot-1'],
      }),
      expect.objectContaining({
        id: 'rnawiki:verdict-1',
        provenance: 'rnawiki',
        eventType: 'PUBLICATION',
      }),
    ])
    expect(view.sources[0]?.snapshotHash).toBe('a'.repeat(64))
    expect(view.freshnessLabel).toBe('Checked on 2026-08-20')
    expect(view.conclusion?.authorName).toBe('Synthetic Author')
    expect(view.conclusion?.reviewers[0]).toMatchObject({
      name: 'Synthetic Reviewer',
      orcid: '0000-0001-2345-6789',
      expertiseTags: ['CLINICAL_PHARMACOLOGY', 'BIOSTATISTICS'],
    })
    expect(view.review.historyHref).toBe(
      '/d/synthetic-medicine/programme/synthetic-programme/history',
    )
    expect(view.medicineRecord.conventionalAlternatives[0]?.name).toBe('Another recorded approach')
    expect(view.medicineRecord.commonQuestions[0]?.question).toBe(
      'An older medicine-wide question?',
    )
    expect(view.medicineRecord.molecular?.identifiers).toEqual([
      { kind: 'formula', label: 'Chemical formula', value: 'C1H1' },
    ])
  })

  it('limits the reviewed outcome list to five stored claims', () => {
    const manyOutcomes = model(true)
    const template = manyOutcomes.selectedProgramme!.claims[0]!
    manyOutcomes.selectedProgramme!.claims = Array.from({ length: 6 }, (_, index) => ({
      ...template,
      id: `claim-${index + 1}`,
      claimKey: `synthetic.claim.${index + 1}`,
      endpoint: `Synthetic endpoint ${index + 1}`,
    }))

    const view = programmeEvidenceMedicineDossierView(
      drug(),
      manyOutcomes,
      new Date('2026-08-22T12:00:00.000Z'),
    )

    expect(view.keyOutcomes).toHaveLength(5)
    expect(view.keyOutcomes.map((outcome) => outcome.id)).toEqual([
      'claim-1',
      'claim-2',
      'claim-3',
      'claim-4',
      'claim-5',
    ])
  })

  it('keeps the evidence-chain question plain and the professional taxonomy separate', () => {
    const targetModel = model(true)
    targetModel.selectedProgramme!.evidenceNodes[0]!.nodeType = 'TARGET_ENGAGEMENT'

    const view = programmeEvidenceMedicineDossierView(
      drug(),
      targetModel,
      new Date('2026-08-22T12:00:00.000Z'),
    )

    expect(view.evidenceNodes[0]).toMatchObject({
      label: 'Reaching its target',
      professionalLabel: 'Target engagement',
      title: 'Did it hit the intended target?',
    })
  })

  it('hides the whole mechanism map instead of publishing a partial sourced path', () => {
    const incomplete = model(true)
    incomplete.selectedProgramme!.presentation!.mechanismSteps[0]!.sources = []

    const view = programmeEvidenceMedicineDossierView(
      drug(),
      incomplete,
      new Date('2026-08-22T12:00:00.000Z'),
    )

    expect(view.mechanismSteps).toEqual([])
  })

  it('keeps a source-linked mechanism stage when a claim qualifies its wording', () => {
    const qualified = model(true)
    qualified.selectedProgramme!.presentation!.mechanismSteps[1]!.claimLinks = [
      { claimId: 'claim-1', relationship: 'QUALIFIES' },
    ]
    qualified.selectedProgramme!.presentation!.mechanismSteps[1]!.sources =
      qualified.selectedProgramme!.presentation!.mechanismSteps[1]!.sources.map((source) => ({
        ...source,
        claimBindings: source.claimBindings.map((binding) => ({
          ...binding,
          relationship: 'QUALIFIES' as const,
        })),
      }))

    const view = programmeEvidenceMedicineDossierView(
      drug(),
      qualified,
      new Date('2026-08-22T12:00:00.000Z'),
    )

    expect(view.mechanismSteps).toHaveLength(3)
    expect(view.mechanismSteps[1]).toMatchObject({ id: 'target', claimIds: ['claim-1'] })

    qualified.selectedProgramme!.presentation!.mechanismSteps[1]!.claimLinks = [
      { claimId: 'claim-1', relationship: 'CONTRADICTS' },
    ]
    qualified.selectedProgramme!.presentation!.mechanismSteps[1]!.sources =
      qualified.selectedProgramme!.presentation!.mechanismSteps[1]!.sources.map((source) => ({
        ...source,
        claimBindings: source.claimBindings.map((binding) => ({
          ...binding,
          relationship: 'CONTRADICTS' as const,
        })),
      }))
    expect(
      programmeEvidenceMedicineDossierView(drug(), qualified, new Date('2026-08-22T12:00:00.000Z'))
        .mechanismSteps,
    ).toEqual([])
  })

  it('does not create an RNAWiki-only timeline when no sourced decision event is published', () => {
    const withoutSourceEvent = model(true)
    withoutSourceEvent.selectedProgramme!.presentation!.timelineEvents = []

    const view = programmeEvidenceMedicineDossierView(
      drug(),
      withoutSourceEvent,
      new Date('2026-08-22T12:00:00.000Z'),
    )

    expect(view.timelineEvents).toEqual([])
  })

  it('adds a presentation-only saved source so every mechanism link resolves publicly', () => {
    const presentationOnly = model(true)
    presentationOnly.selectedProgramme!.presentation!.mechanismSteps[0]!.sources = [
      {
        sourceId: 'mechanism-source-only',
        sourceSnapshotId: 'mechanism-snapshot-only',
        sourceType: 'PEER_REVIEWED_PUBLICATION',
        externalIdentifier: '10.0000/example',
        canonicalLocator: 'https://doi.org/10.0000/example',
        title: 'Mechanism-only publication',
        publisher: 'Example journal',
        publicationDate: '2026-01-01',
        retrievedAt: '2026-08-20T00:00:00.000Z',
        contentHash: 'd'.repeat(64),
        claimBindings: [
          {
            claimId: 'claim-1',
            relationship: 'SUPPORTS',
            plainLanguageText: 'The publication supports the first mechanism stage.',
          },
        ],
      },
    ]

    const view = programmeEvidenceMedicineDossierView(
      drug(),
      presentationOnly,
      new Date('2026-08-22T12:00:00.000Z'),
    )

    expect(view.mechanismSteps[0]?.sourceIds).toEqual(['mechanism-snapshot-only'])
    expect(view.sources).toContainEqual(
      expect.objectContaining({
        id: 'mechanism-snapshot-only',
        label: 'Mechanism-only publication',
        href: 'https://doi.org/10.0000/example',
        snapshotHash: 'd'.repeat(64),
      }),
    )
  })

  it('keeps a mechanism map visible when exact provenance is a non-clickable URN', () => {
    const presentationOnly = model(true)
    const source = presentationOnly.selectedProgramme!.presentation!.mechanismSteps[0]!.sources[0]!
    source.sourceId = 'urn-source-only'
    source.sourceSnapshotId = 'urn-snapshot-only'
    source.canonicalLocator = 'urn:rnawiki:source:version-1'
    source.externalIdentifier = 'RNAWiki source version 1'

    const view = programmeEvidenceMedicineDossierView(
      drug(),
      presentationOnly,
      new Date('2026-08-22T12:00:00.000Z'),
    )

    expect(view.mechanismSteps).toHaveLength(3)
    expect(view.sources).toContainEqual(
      expect.objectContaining({ id: 'urn-snapshot-only', href: undefined }),
    )
  })

  it('keeps exposure and sponsor context out of the headline result while retaining measured safety', () => {
    const contextOnly = model(true)
    const selected = contextOnly.selectedProgramme!
    const template = selected.claims[0]!
    selected.trials[0]!.status = 'RECRUITING'
    selected.claims = [
      {
        ...template,
        id: 'claim-exposure-context',
        claimKey: 'synthetic.exposure.context',
        evidenceNodeType: 'HUMAN_EXPOSURE',
        plainLanguageText: 'People in the ongoing study received a dose.',
        endpoint: 'Participants who received a dose',
        outcomeType: 'OTHER',
        numericValue: '20',
        numericUnit: 'participants',
        direction: 'INCREASE',
      },
      {
        ...template,
        id: 'claim-safety-context',
        claimKey: 'synthetic.safety.context',
        evidenceNodeType: 'BIOLOGICAL_RESPONSE',
        plainLanguageText: 'The study recorded safety observations.',
        endpoint: 'Reported adverse events',
        outcomeType: 'SAFETY',
        numericValue: '3',
        numericUnit: 'events',
        direction: 'INCREASE',
      },
      {
        ...template,
        id: 'claim-sponsor-context',
        claimKey: 'synthetic.sponsor.context',
        evidenceNodeType: 'PATIENT_OUTCOME',
        nature: 'SPONSOR_REPORTED',
        plainLanguageText: 'The sponsor recorded an outcome claim.',
        endpoint: 'Sponsor-described patient outcome',
        outcomeType: 'PATIENT_OUTCOME',
        numericValue: '10',
        numericUnit: 'points',
        direction: 'DECREASE',
      },
    ]
    selected.evidenceNodes[0]!.supportingClaimIds = selected.claims.map((claim) => claim.id)

    const view = programmeEvidenceMedicineDossierView(
      drug(),
      contextOnly,
      new Date('2026-08-22T12:00:00.000Z'),
    )

    expect(view.studies[0]).toMatchObject({
      status: 'Recruiting',
      sampleSize: 20,
      state: 'measured',
      result: 'The study recorded safety observations.',
    })
    expect(view.evidenceNodes[0]?.claims?.map((claim) => claim.id)).toEqual([
      'claim-exposure-context',
      'claim-safety-context',
      'claim-sponsor-context',
    ])
    expect(view.keyOutcomes.map((outcome) => outcome.state)).toEqual([
      'measured',
      'measured',
      'recorded_context',
    ])
  })

  it('skips earlier context claims and selects only a structured measured study result', () => {
    const withResult = model(true)
    const selected = withResult.selectedProgramme!
    const template = selected.claims[0]!
    selected.claims = [
      {
        ...template,
        id: 'claim-human-context-first',
        claimKey: 'synthetic.human.context.first',
        evidenceNodeType: 'HUMAN_EXPOSURE',
        plainLanguageText: 'Participants received the medicine.',
        endpoint: null,
        outcomeType: null,
        numericValue: null,
        numericUnit: null,
        uncertaintyInterval: null,
        direction: 'NOT_APPLICABLE',
      },
      {
        ...template,
        id: 'claim-safety-second',
        claimKey: 'synthetic.safety.second',
        evidenceNodeType: 'BIOLOGICAL_RESPONSE',
        plainLanguageText: 'Safety observations were recorded.',
        endpoint: 'Adverse events',
        outcomeType: 'SAFETY',
        numericValue: '2',
        numericUnit: 'events',
        direction: 'INCREASE',
      },
      {
        ...template,
        id: 'claim-result-third',
        claimKey: 'synthetic.result.third',
        evidenceNodeType: 'BIOLOGICAL_RESPONSE',
        plainLanguageText: 'The measured biomarker fell by 10 points.',
        endpoint: 'Change in the measured biomarker',
        outcomeType: 'BIOMARKER',
        numericValue: '-10',
        numericUnit: 'points',
        direction: 'DECREASE',
      },
    ]

    const view = programmeEvidenceMedicineDossierView(
      drug(),
      withResult,
      new Date('2026-08-22T12:00:00.000Z'),
    )

    expect(view.studies[0]).toMatchObject({
      result: 'The measured biomarker fell by 10 points.',
      endpoint: 'Change in the measured biomarker',
      state: 'measured',
    })
  })

  it('does not infer key-outcome state from sponsor, regulator, or reviewer provenance', () => {
    const provenance = model(true)
    const selected = provenance.selectedProgramme!
    const template = selected.claims[0]!
    selected.claims = [
      {
        ...template,
        id: 'claim-sponsor',
        claimKey: 'synthetic.outcome.sponsor',
        nature: 'SPONSOR_REPORTED',
      },
      {
        ...template,
        id: 'claim-regulator',
        claimKey: 'synthetic.outcome.regulator',
        nature: 'REGULATORY_FINDING',
      },
      {
        ...template,
        id: 'claim-reviewer',
        claimKey: 'synthetic.outcome.reviewer',
        nature: 'RNAWIKI_JUDGEMENT',
        reviewerInterpretation: 'A reviewer recorded this interpretation.',
      },
      {
        ...template,
        id: 'claim-unknown',
        claimKey: 'synthetic.outcome.unknown',
        nature: 'UNKNOWN',
      },
      {
        ...template,
        id: 'claim-direct-measurement',
        claimKey: 'synthetic.outcome.measured',
        nature: 'MEASURED',
      },
    ]

    const view = programmeEvidenceMedicineDossierView(
      drug(),
      provenance,
      new Date('2026-08-22T12:00:00.000Z'),
    )

    expect(view.keyOutcomes.map(({ id, state }) => [id, state])).toEqual([
      ['claim-sponsor', 'recorded_context'],
      ['claim-regulator', 'recorded_context'],
      ['claim-reviewer', 'recorded_context'],
      ['claim-unknown', 'unknown'],
      ['claim-direct-measurement', 'measured'],
    ])
  })

  it('labels an evidence node with several known claim natures as mixed', () => {
    const mixed = model(true)
    const selected = mixed.selectedProgramme!
    const template = selected.claims[0]!
    selected.claims = [
      template,
      {
        ...template,
        id: 'claim-regulatory-nature',
        claimKey: 'synthetic.claim.regulatory-nature',
        nature: 'REGULATORY_FINDING',
      },
      {
        ...template,
        id: 'claim-unknown-nature',
        claimKey: 'synthetic.claim.unknown-nature',
        nature: 'UNKNOWN',
      },
    ]
    selected.evidenceNodes[0]!.supportingClaimIds = selected.claims.map((claim) => claim.id)

    const view = programmeEvidenceMedicineDossierView(
      drug(),
      mixed,
      new Date('2026-08-22T12:00:00.000Z'),
    )

    expect(view.evidenceNodes[0]?.claimNature).toBe('mixed')

    selected.claims[1]!.nature = 'UNKNOWN'
    const oneKnownNature = programmeEvidenceMedicineDossierView(
      drug(),
      mixed,
      new Date('2026-08-22T12:00:00.000Z'),
    )
    expect(oneKnownNature.evidenceNodes[0]?.claimNature).toBe('measured')
  })

  it('treats a passed CURRENT check deadline as stale on the dossier and source card', () => {
    const overdue = model(true)
    overdue.selectedProgramme!.freshness[0]!.nextCheckDueAt = '2026-08-23T00:00:00.000Z'

    const view = programmeEvidenceMedicineDossierView(
      drug(),
      overdue,
      new Date('2026-08-23T00:00:00.000Z'),
    )

    expect(view.freshness).toBe('stale')
    expect(view.freshnessLabel).toBe('Evidence may be out of date')
    expect(view.sources[0]?.freshness).toBe('stale')
  })
})
