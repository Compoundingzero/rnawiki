import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import {
  DossierPharmacokinetics,
  DossierProgrammeFailure,
} from '@/components/dossier/DossierDynamicEvidenceModules'
import { DossierOutcomeComparison } from '@/components/dossier/DossierOutcomeComparison'

import {
  legacyDossierDynamicModules,
  programmeDossierDynamicModules,
  reportedCostsModule,
} from '@/lib/dossier-dynamic-modules'
import type { ProgrammeEvidenceReadModel, PublishedClaimReadModel } from '@/lib/evidence/types'
import { normalizedMedicineDossierView } from '@/lib/medicine-dossier-view-model'
import type { DrugDossier } from '@/lib/types'
import { SEED_DOSSIERS } from '@/scripts/seed-data'

;(globalThis as typeof globalThis & { React: typeof React }).React = React

type SelectedProgramme = NonNullable<ProgrammeEvidenceReadModel['selectedProgramme']>

const source = {
  id: 'snapshot-1',
  sourceId: 'source-1',
  sourceType: 'PEER_REVIEWED_PUBLICATION' as const,
  externalIdentifier: '10.0000/synthetic',
  canonicalLocator: 'doi:10.0000/synthetic',
  title: 'Synthetic publication',
  publisher: 'Synthetic journal',
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

function claim(overrides: Partial<PublishedClaimReadModel> = {}): PublishedClaimReadModel {
  return {
    id: 'claim-1',
    claimKey: 'synthetic.claim',
    revisionNumber: 1,
    programmeTrialId: 'programme-trial-1',
    trialIdentifier: 'NCT00000001',
    evidenceNodeType: 'PATIENT_OUTCOME',
    nature: 'MEASURED',
    plainLanguageText: 'A reviewed result was measured.',
    technicalText: null,
    population: 'Adults in the selected programme',
    intervention: 'The studied medicine',
    comparator: 'A dummy treatment',
    dose: 'DO NOT EXPOSE STUDIED DOSE',
    route: 'DO NOT EXPOSE ROUTE AS INSTRUCTIONS',
    duration: '68 weeks',
    endpoint: 'Recorded outcome',
    endpointHierarchy: 'PRIMARY',
    outcomeType: 'PATIENT_OUTCOME',
    numericValue: '12.400000',
    numericUnit: 'percentage points',
    comparatorValue: null,
    comparatorGroup: null,
    uncertaintyInterval: '95% interval: 10 to 14',
    direction: 'DECREASE',
    timepoint: 'Week 68',
    reviewerInterpretation: null,
    lastVerifiedAt: '2026-08-20T00:00:00.000Z',
    publishedAt: '2026-08-21T00:00:00.000Z',
    sources: [source],
    ...overrides,
  }
}

function selectedProgramme(overrides: Partial<SelectedProgramme> = {}): SelectedProgramme {
  const baseClaim = claim()
  return {
    id: 'programme-1',
    slug: 'selected-programme',
    title: 'Selected programme',
    indication: 'Synthetic indication',
    targetPopulation: 'Adults in the selected programme',
    jurisdiction: null,
    sponsor: null,
    partners: [],
    status: 'ACTIVE',
    highestPhaseReached: 'Phase 3',
    route: null,
    doseExposureContext: null,
    startDate: null,
    endDate: null,
    rawStoppingReason: null,
    stoppingReasonCategory: 'UNKNOWN',
    updateStatus: 'CURRENT',
    trials: [],
    claims: [baseClaim],
    evidenceNodes: [],
    verdict: {
      id: 'verdict-1',
      revisionNumber: 1,
      programmeStatusAtReview: 'ACTIVE',
      verdictCode: null,
      publicLabel: 'Reviewed programme answer',
      professionalLabel: 'Reviewed programme answer',
      indicationScope: 'Synthetic indication',
      populationScope: 'Adults in the selected programme',
      doseExposureScope: 'The reviewed exposure scope',
      periodScope: '68 weeks',
      trialScope: 'NCT00000001',
      outcomeScope: 'Recorded outcome',
      plainMechanism: 'A reviewed mechanism statement.',
      bestSupportedFinding: 'A reviewed result was measured.',
      mainLimitation: 'The result does not answer every clinical question.',
      oneSentenceReason: 'The reviewed sources support this programme-scoped answer.',
      whatWasDisproven: [],
      whatWasNotDisproven: [],
      whatRemainsUnknown: ['Long-term outcomes remain unknown.'],
      confidence: 'MODERATE',
      confidenceExplanation: null,
      conditionsThatWouldChangeVerdict: [],
      authorName: 'Synthetic author',
      conflictsOfInterest: null,
      engineVersion: 'rna-intelligence/2.0.0',
      inputDigestAlgorithm: 'sha256',
      inputDigest: 'b'.repeat(64),
      reviewedAt: '2026-08-21T00:00:00.000Z',
      publishedAt: '2026-08-22T00:00:00.000Z',
      independentReviewCount: 1,
      reviewers: [],
      claimRelationships: [{ claimId: baseClaim.id, relationship: 'SUPPORTING' }],
      supportingClaimIds: [baseClaim.id],
      contradictoryClaimIds: [],
    },
    summaryFieldDependencies: [],
    presentation: null,
    publicationHistory: [],
    freshness: [],
    ...overrides,
  }
}

function medicine(overrides: Partial<DrugDossier> = {}): DrugDossier {
  return {
    id: 'synthetic-medicine',
    name: 'Synthetic medicine',
    tradeName: 'Synthetic trade name',
    sponsor: '',
    targetGene: '',
    targetProtein: '',
    modality: 'Small Molecule',
    approvalStatus: 'FDA Approved',
    indication: 'Synthetic indication',
    patientFriendlyIndication: 'Synthetic indication',
    oneSentenceVerdict: '',
    laymanHowItWorks: '',
    auditConfidence: 'Moderate / Debated',
    confidenceScore: 50,
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
    deliverySystem: {
      type: 'Recorded delivery form',
      description: 'DO NOT EXPOSE A TREATMENT SCHEDULE',
      safetyProfile: 'Older medicine-wide safety text.',
    },
    commonQuestions: [],
    recentAuditDate: '',
    hasDiscrepancy: false,
    anatomicalSite: 'Liver cells',
    ...overrides,
  }
}

describe('dynamic dossier module contract', () => {
  it('publishes only exact source-bound safety and pharmacokinetic findings', () => {
    const safety = claim({
      id: 'safety-claim',
      claimKey: 'synthetic.safety',
      outcomeType: 'SAFETY',
      endpoint: 'Recorded adverse events',
      plainLanguageText: 'The study recorded three adverse events.',
      numericValue: '3.0000',
      numericUnit: 'events',
    })
    const pharmacokinetics = claim({
      id: 'pk-claim',
      claimKey: 'synthetic.pk',
      evidenceNodeType: 'USEFUL_EXPOSURE',
      outcomeType: 'PHARMACOKINETICS',
      endpoint: 'Peak blood concentration',
      plainLanguageText: 'Researchers recorded when blood levels peaked.',
      numericValue: null,
      numericUnit: null,
      timepoint: '24 to 72 hours',
    })
    const selected = selectedProgramme({
      claims: [safety, pharmacokinetics],
    })
    selected.verdict!.supportingClaimIds = [safety.id, pharmacokinetics.id]

    const modules = programmeDossierDynamicModules(medicine(), selected)

    expect(modules.safety).toMatchObject({
      status: 'ready',
      data: {
        scope: 'selected_programme',
        withheldFindingCount: 0,
        findings: [
          {
            id: 'safety-claim',
            exactResult: '3 events',
            sourceIds: ['snapshot-1'],
            sourceClaimBindings: [
              {
                sourceId: 'snapshot-1',
                claimId: 'safety-claim',
                relationship: 'SUPPORTS',
              },
            ],
          },
        ],
      },
    })
    expect(modules.pharmacokinetics).toMatchObject({
      status: 'ready',
      data: {
        presentation: 'independent_findings',
        chronology: 'not_established',
        findings: [{ id: 'pk-claim', timepoint: '24 to 72 hours' }],
      },
    })
    expect(JSON.stringify({ safety: modules.safety, pk: modules.pharmacokinetics })).not.toMatch(
      /DO NOT EXPOSE STUDIED DOSE|DO NOT EXPOSE ROUTE/,
    )
  })

  it('does not parse a second comparison value or timepoint out of prose', () => {
    const proseOnly = claim({
      plainLanguageText:
        'The result was 14.9% with treatment and 2.4% with the dummy treatment at 68 weeks.',
      numericValue: null,
      numericUnit: null,
      timepoint: null,
    })
    const pkProseOnly = claim({
      id: 'pk-prose-only',
      evidenceNodeType: 'USEFUL_EXPOSURE',
      outcomeType: 'PK',
      plainLanguageText: 'Blood levels peaked after 24 hours.',
      numericValue: null,
      numericUnit: null,
      timepoint: null,
    })
    const selected = selectedProgramme({ claims: [proseOnly, pkProseOnly] })

    const modules = programmeDossierDynamicModules(medicine(), selected)

    expect(modules.outcomeComparison).toEqual({
      status: 'hidden',
      reason: 'missing_structured_comparator_values',
    })
    expect(modules.pharmacokinetics).toEqual({
      status: 'hidden',
      reason: 'missing_structured_timepoints',
    })
  })

  it('publishes one exact two-arm comparison only when it is source-bound and verdict-safe', () => {
    const comparativeClaim = claim({
      numericValue: '-14.900000',
      numericUnit: '%',
      comparatorValue: '-2.400000',
      comparatorGroup: 'Dummy treatment',
      endpoint: 'Average body-weight change',
      intervention: 'Studied medicine',
      timepoint: 'Week 68',
    })
    const selected = selectedProgramme({
      claims: [comparativeClaim],
      summaryFieldDependencies: [
        {
          id: 'summary-dependency-finding',
          programmeId: 'programme-1',
          claimId: comparativeClaim.id,
          dependentSurfaceType: 'PROGRAMME_SUMMARY',
          evidenceNodeId: null,
          verdictRevisionId: 'verdict-1',
          fieldPath: 'summary.bestSupportedFinding',
          impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED',
        },
      ],
    })

    const comparison = programmeDossierDynamicModules(medicine(), selected).outcomeComparison

    expect(comparison).toEqual({
      status: 'ready',
      data: {
        claimId: 'claim-1',
        endpoint: 'Average body-weight change',
        population: 'Adults in the selected programme',
        timepoint: 'Week 68',
        intervention: { label: 'Studied medicine', value: '-14.9', unit: '%' },
        comparator: { label: 'Dummy treatment', value: '-2.4', unit: '%' },
        sourceIds: ['snapshot-1'],
        sourceClaimBindings: [
          {
            sourceId: 'snapshot-1',
            claimId: 'claim-1',
            relationship: 'SUPPORTS',
            statement: 'A reviewed result was measured.',
          },
        ],
      },
    })
  })

  it('withholds ambiguous, non-supporting, unsourced, and non-numeric comparisons', () => {
    const first = claim({
      id: 'comparison-1',
      comparatorValue: '2.4',
      comparatorGroup: 'Dummy treatment',
    })
    const second = claim({
      id: 'comparison-2',
      claimKey: 'synthetic.claim.2',
      comparatorValue: '3.1',
      comparatorGroup: 'Usual care',
    })
    const selected = selectedProgramme({ claims: [first, second] })
    selected.verdict!.claimRelationships = [
      { claimId: first.id, relationship: 'SUPPORTING' },
      { claimId: second.id, relationship: 'SUPPORTING' },
    ]

    expect(programmeDossierDynamicModules(medicine(), selected).outcomeComparison).toEqual({
      status: 'hidden',
      reason: 'ambiguous_structured_comparison',
    })

    selected.summaryFieldDependencies = [
      {
        id: 'summary-dependency-finding',
        programmeId: selected.id,
        claimId: second.id,
        dependentSurfaceType: 'PROGRAMME_SUMMARY',
        evidenceNodeId: null,
        verdictRevisionId: selected.verdict!.id,
        fieldPath: 'summary.bestSupportedFinding',
        impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED',
      },
    ]
    expect(programmeDossierDynamicModules(medicine(), selected).outcomeComparison).toMatchObject({
      status: 'ready',
      data: { claimId: second.id },
    })

    selected.verdict!.claimRelationships = [{ claimId: second.id, relationship: 'CONTRADICTORY' }]
    expect(programmeDossierDynamicModules(medicine(), selected).outcomeComparison).toEqual({
      status: 'hidden',
      reason: 'missing_safe_verdict_dependency',
    })

    selected.verdict!.claimRelationships = [{ claimId: second.id, relationship: 'SUPPORTING' }]
    selected.claims = [second]
    second.sources = []
    expect(programmeDossierDynamicModules(medicine(), selected).outcomeComparison).toEqual({
      status: 'hidden',
      reason: 'missing_exact_source_binding',
    })

    second.sources = [source]
    second.comparatorValue = '3.1% from prose'
    expect(programmeDossierDynamicModules(medicine(), selected).outcomeComparison).toEqual({
      status: 'hidden',
      reason: 'missing_structured_comparator_values',
    })

    second.comparatorValue = '3.1'
    second.timepoint = null
    expect(programmeDossierDynamicModules(medicine(), selected).outcomeComparison).toEqual({
      status: 'hidden',
      reason: 'missing_structured_timepoints',
    })

    second.timepoint = 'Week 68'
    second.sources = [{ ...source, relationship: 'CONTEXT' }]
    expect(programmeDossierDynamicModules(medicine(), selected).outcomeComparison).toEqual({
      status: 'hidden',
      reason: 'missing_exact_source_binding',
    })
  })

  it('renders exact visible values, an aria-hidden visual aid, and a closed source disclosure', () => {
    const selected = selectedProgramme({
      claims: [
        claim({
          numericValue: '-14.9',
          numericUnit: '%',
          comparatorValue: '-2.4',
          comparatorGroup: 'Dummy treatment',
          endpoint: 'Average body-weight change',
          intervention: 'Studied medicine',
        }),
      ],
    })
    const comparison = programmeDossierDynamicModules(medicine(), selected).outcomeComparison
    const html = renderToStaticMarkup(
      React.createElement(DossierOutcomeComparison, {
        module: comparison,
        sources: new Map([
          [
            'snapshot-1',
            {
              id: 'snapshot-1',
              label: 'Synthetic publication',
              href: 'https://example.test/synthetic-publication',
              freshness: 'current' as const,
            },
          ],
        ]),
      }),
    )

    expect(html).toContain('Recorded comparison at Week 68')
    expect(html).toContain('Studied medicine')
    expect(html).toContain('-14.9%')
    expect(html).toContain('Dummy treatment')
    expect(html).toContain('-2.4%')
    expect(html).toContain('aria-hidden="true"')
    expect(html).toContain('<details')
    expect(html).not.toContain('<details open=""')
    expect(html).toContain('Exact sources for this comparison')
    expect(html).toContain('Synthetic publication')
  })

  it('withholds a safety visual when no exact supporting source is bound', () => {
    const unsourcedSafety = claim({
      outcomeType: 'SAFETY',
      sources: [],
    })
    const selected = selectedProgramme({ claims: [unsourcedSafety] })

    expect(programmeDossierDynamicModules(medicine(), selected).safety).toEqual({
      status: 'hidden',
      reason: 'missing_exact_source_binding',
    })
  })

  it('retains sponsor-reported safety nature instead of flattening it to measured', () => {
    const sponsorReported = claim({
      outcomeType: 'SAFETY',
      nature: 'SPONSOR_REPORTED',
      plainLanguageText: 'The sponsor reported a safety observation.',
    })
    const selected = selectedProgramme({ claims: [sponsorReported] })
    const safetyModule = programmeDossierDynamicModules(medicine(), selected).safety

    expect(safetyModule.status).toBe('ready')
    if (safetyModule.status === 'ready') {
      expect(safetyModule.data.findings[0]?.claimNature).toBe('SPONSOR_REPORTED')
    }
  })

  it.each(['CONTEXT', 'CONTRADICTS', 'QUALIFIES'] as const)(
    'does not treat a %s relationship as exact supporting evidence',
    (relationship) => {
      const nonSupportingSafety = claim({
        outcomeType: 'SAFETY',
        sources: [
          {
            ...source,
            // QUALIFIES is not a valid claim-to-source relationship. Including it adversarially
            // proves the gate accepts only the exact SUPPORTS value, even for malformed input.
            relationship,
          },
        ] as PublishedClaimReadModel['sources'],
      })
      const selected = selectedProgramme({ claims: [nonSupportingSafety] })

      expect(programmeDossierDynamicModules(medicine(), selected).safety).toEqual({
        status: 'hidden',
        reason: 'missing_exact_source_binding',
      })
    },
  )

  it('does not claim chronology when pharmacokinetic time labels are not normalized', () => {
    const laterTextFirst = claim({
      id: 'pk-later-text-first',
      evidenceNodeType: 'USEFUL_EXPOSURE',
      outcomeType: 'PK',
      timepoint: 'Week 48',
    })
    const earlierTextSecond = claim({
      id: 'pk-earlier-text-second',
      evidenceNodeType: 'USEFUL_EXPOSURE',
      outcomeType: 'PK',
      timepoint: 'Hour 1',
    })
    const selected = selectedProgramme({ claims: [laterTextFirst, earlierTextSecond] })
    const pkModule = programmeDossierDynamicModules(medicine(), selected).pharmacokinetics

    expect(pkModule.status).toBe('ready')
    if (pkModule.status === 'ready') {
      expect(pkModule.data).toMatchObject({
        presentation: 'independent_findings',
        chronology: 'not_established',
      })
      expect(pkModule.data.findings.map((finding) => finding.id)).toEqual([
        'pk-later-text-first',
        'pk-earlier-text-second',
      ])
    }
  })

  it('shows a failure classification only for a source-bound reviewed stopped programme', () => {
    const stopped = selectedProgramme({
      status: 'STOPPED',
      stoppingReasonCategory: 'OPERATIONAL_EXECUTION',
    })
    stopped.verdict!.programmeStatusAtReview = 'STOPPED'
    stopped.verdict!.verdictCode = 'TEST_UNANSWERED'

    expect(programmeDossierDynamicModules(medicine(), stopped).programmeFailure).toMatchObject({
      status: 'ready',
      data: {
        code: 'TEST_UNANSWERED',
        readerLabel: 'The studies did not answer this question',
        stoppingReasonCategory: 'OPERATIONAL_EXECUTION',
        sourceIds: ['snapshot-1'],
      },
    })

    stopped.status = 'ACTIVE'
    expect(programmeDossierDynamicModules(medicine(), stopped).programmeFailure).toEqual({
      status: 'hidden',
      reason: 'inconsistent_programme_state',
    })

    stopped.status = 'STOPPED'
    stopped.claims[0]!.sources = []
    expect(programmeDossierDynamicModules(medicine(), stopped).programmeFailure).toEqual({
      status: 'hidden',
      reason: 'missing_exact_source_binding',
    })

    stopped.claims[0]!.sources = [source]
    stopped.verdict = null
    expect(programmeDossierDynamicModules(medicine(), stopped).programmeFailure).toEqual({
      status: 'hidden',
      reason: 'missing_reviewed_failure_classification',
    })
  })

  it('keeps source-to-claim support separate from each claim role in a failure conclusion', () => {
    const supportingClaim = claim({
      id: 'supporting-failure-claim',
      plainLanguageText: 'This claim supports the reviewed failure conclusion.',
    })
    const contradictoryClaim = claim({
      id: 'contradictory-failure-claim',
      plainLanguageText: 'This claim challenges the reviewed failure conclusion.',
    })
    const stopped = selectedProgramme({
      status: 'STOPPED',
      claims: [supportingClaim, contradictoryClaim],
    })
    stopped.verdict!.programmeStatusAtReview = 'STOPPED'
    stopped.verdict!.verdictCode = 'TEST_UNANSWERED'
    stopped.verdict!.supportingClaimIds = [supportingClaim.id]
    stopped.verdict!.contradictoryClaimIds = [contradictoryClaim.id]

    const failureModule = programmeDossierDynamicModules(medicine(), stopped).programmeFailure

    expect(failureModule).toMatchObject({
      status: 'ready',
      data: {
        sourceClaimBindings: [
          {
            claimId: 'supporting-failure-claim',
            relationship: 'SUPPORTS',
            verdictRelationship: 'SUPPORTING',
          },
          {
            claimId: 'contradictory-failure-claim',
            relationship: 'SUPPORTS',
            verdictRelationship: 'CONTRADICTORY',
          },
        ],
      },
    })
    const html = renderToStaticMarkup(
      React.createElement(DossierProgrammeFailure, {
        module: failureModule,
        sources: new Map([
          [
            'snapshot-1',
            {
              id: 'snapshot-1',
              label: 'Synthetic publication',
              href: 'https://example.test/synthetic-publication',
              freshness: 'current' as const,
            },
          ],
        ]),
      }),
    )

    expect(html).toContain('Exact sources for and against this conclusion')
    expect(html).toContain('Supports the reviewed conclusion')
    expect(html).toContain('Challenges the reviewed conclusion')
    expect(html.match(/Source relationship to this claim:/gu)).toHaveLength(2)
  })

  it('renders pharmacokinetic records as unnumbered, explicitly non-chronological cards', () => {
    const laterTextFirst = claim({
      id: 'pk-week-48',
      evidenceNodeType: 'USEFUL_EXPOSURE',
      outcomeType: 'PK',
      timepoint: 'Week 48',
    })
    const earlierTextSecond = claim({
      id: 'pk-hour-1',
      evidenceNodeType: 'USEFUL_EXPOSURE',
      outcomeType: 'PK',
      timepoint: 'Hour 1',
    })
    const selected = selectedProgramme({ claims: [laterTextFirst, earlierTextSecond] })
    const pkModule = programmeDossierDynamicModules(medicine(), selected).pharmacokinetics
    const html = renderToStaticMarkup(
      React.createElement(DossierPharmacokinetics, {
        module: pkModule,
        sources: new Map(),
      }),
    )

    expect(html).toContain('These are separate findings, not a timeline.')
    expect(html).toContain('not arranged from earliest to latest')
    expect(html).toContain('data-testid="pharmacokinetics-findings"')
    expect(html).toContain('<ul')
    expect(html).not.toContain('<ol')
    expect(html).not.toContain('reviewed order')
    expect(html).not.toContain('proportional time scale')
  })

  it('keeps sourced cost reports field-specific and never manufactures regional fields', () => {
    const costModule = reportedCostsModule({
      synthesisCostPerDose: 'Unbound production estimate',
      retailPricePerDoseOrYear: 'US list price reported for 2026',
      priceSource: {
        label: 'Public price file',
        identifier: 'https://example.test/public-price-file',
        kind: 'url',
      },
    })

    expect(costModule).toMatchObject({
      status: 'ready',
      data: {
        presentation: 'separate_source_reports',
        regionalComparisonAvailable: false,
        withheldReportCount: 1,
        reports: [
          {
            kind: 'reported_retail_or_list_price',
            value: 'US list price reported for 2026',
            source: { identifier: 'https://example.test/public-price-file' },
          },
        ],
      },
    })
    expect(JSON.stringify(costModule)).not.toContain('Unbound production estimate')
    expect(reportedCostsModule({ retailPricePerDoseOrYear: 'Unsourced price' })).toEqual({
      status: 'hidden',
      reason: 'missing_exact_source_binding',
    })
  })

  it('does not create product matrices or body coordinates from legacy strings', () => {
    const modules = legacyDossierDynamicModules(medicine())

    expect(modules.productsAndForms).toEqual({
      status: 'hidden',
      reason: 'missing_structured_product_records',
    })
    expect(modules.bodyMap).toEqual({
      status: 'hidden',
      reason: 'missing_anatomy_coordinates',
    })
    expect(JSON.stringify(modules)).not.toMatch(
      /DO NOT EXPOSE A TREATMENT SCHEDULE|Older medicine-wide safety text|"x"|"y"/,
    )
  })

  it('restores safe identity and source-labelled background without restoring dosing', () => {
    const testMedicine = medicine({
      pricing: {
        synthesisCostPerDose: 'Unbound production cost',
        retailPricePerDoseOrYear: 'Reported retail price',
        markupEstimate: 'Unbound comparison',
        openPatentNotes: 'Unbound note',
        synthesisComplexity: 'Moderate',
        priceSource: {
          label: 'Public price source',
          identifier: 'https://example.test/prices',
          kind: 'url',
        },
      } as DrugDossier['pricing'],
      substitutes: {
        summary: '',
        conventionalRx: [],
        naturalFoods: [
          {
            name: 'Recorded supplement context',
            biologicalMechanism: 'DO NOT EXPOSE UNSOURCED MECHANISM',
            evidenceStrength: 'Recorded legacy evidence label',
            dailyUsage: 'DO NOT EXPOSE DAILY USE',
            monthlyCost: 'DO NOT EXPOSE MONTHLY COST',
          },
        ],
        homeRemedies: [],
      },
      molecularSchema: {
        structureType: 'rna_sequence',
        sequence5to3: 'AUGC',
        isMachineVerified: true,
        laboratoryWorkflow: [
          {
            id: 'unsafe-workflow',
            stepNumber: 1,
            phase: 'Synthesis',
            name: 'DO NOT EXPOSE LAB STEP',
            description: 'DO NOT EXPOSE LAB INSTRUCTIONS',
            reagentsAndBuffer: 'DO NOT EXPOSE REAGENTS',
          },
        ],
      },
      isMachineVerifiedStructure: true,
    })
    const selected = selectedProgramme()
    const view = normalizedMedicineDossierView(testMedicine, {
      selected: {
        id: selected.slug,
        label: selected.title,
        status: 'Active',
        verdict: selected.verdict!.oneSentenceReason,
        mechanismSummary: {},
        evidenceNodes: [],
        studies: [],
        keyOutcomes: [],
        mechanismSteps: [],
        timelineEvents: [],
        sources: [],
        freshness: 'unknown',
        freshnessLabel: 'Source check not completed',
        review: {},
        machineFindingCodes: [],
        dynamicModules: programmeDossierDynamicModules(testMedicine, selected),
      },
      programmes: [],
    })

    expect(view.medicineRecord.molecular?.identifiers).toContainEqual(
      expect.objectContaining({ kind: 'nucleotide_sequence', value: 'AUGC' }),
    )
    expect(view.medicineRecord.foodSupplementContext).toEqual([
      {
        name: 'Recorded supplement context',
        recordedEvidenceLabel: 'Recorded legacy evidence label',
        sourceStatus: 'not_linked',
      },
    ])
    expect(view.medicineRecord.pricing).toMatchObject({
      reportedRetailOrListPrice: 'Reported retail price',
      reports: [{ kind: 'reported_retail_or_list_price' }],
    })
    expect(view.medicineRecord.pricing?.reportedProductionCost).toBeUndefined()
    expect(view.medicineRecord.safetyAndAdministration?.administrationAndDosing).toBeUndefined()
    expect(JSON.stringify(view.medicineRecord)).not.toMatch(
      /DO NOT EXPOSE DAILY|DO NOT EXPOSE MONTHLY|DO NOT EXPOSE UNSOURCED|DO NOT EXPOSE LAB|DO NOT EXPOSE REAGENTS|DO NOT EXPOSE A TREATMENT SCHEDULE/,
    )
  })

  it('keeps all curated legacy modules free of dosing, recipes, inferred coordinates and fake regions', () => {
    expect(SEED_DOSSIERS.length).toBeGreaterThan(400)

    for (const dossier of SEED_DOSSIERS) {
      const modules = legacyDossierDynamicModules(dossier)
      const rendered = JSON.stringify(modules)

      expect(rendered).not.toContain(dossier.deliverySystem.description)
      expect(rendered).not.toContain(dossier.deliverySystem.safetyProfile)
      expect(modules.productsAndForms.status).not.toBe('ready')
      expect(modules.bodyMap.status).not.toBe('ready')
      if (modules.reportedCosts.status === 'ready') {
        expect(modules.reportedCosts.data.regionalComparisonAvailable).toBe(false)
        expect(modules.reportedCosts.data.reports.every((report) => report.source.identifier)).toBe(
          true,
        )
      }
    }
  })
})
