import * as React from 'react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

import {
  ExactBundle,
  hasCompleteExactPublicationPreview,
  isCurrentCanonicalUiRequest,
  shouldBlindCanonicalReview,
} from '@/app/review-queue/CanonicalPublicationPanel'

;(globalThis as typeof globalThis & { React: typeof React }).React = React

type WorkflowState = React.ComponentProps<typeof ExactBundle>['state']

const PROPOSAL_DIGEST = 'a'.repeat(64)
const INPUT_DIGEST = 'b'.repeat(64)

function completeState(): WorkflowState {
  const presentationSource = {
    sourceId: 'source-1',
    sourceSnapshotId: 'source-snapshot-1',
    sourceType: 'CLINICAL_TRIAL_REGISTRY' as const,
    externalIdentifier: 'NCT00000001',
    canonicalLocator: 'https://clinicaltrials.gov/study/NCT00000001',
    title: 'ClinicalTrials.gov record for the main trial',
    publisher: 'U.S. National Library of Medicine',
    publicationDate: '2025-01-10',
    retrievedAt: '2026-08-22T01:00:00.000Z',
    contentHash: 'c'.repeat(64),
    claimBindings: [
      {
        claimId: 'claim-1',
        relationship: 'SUPPORTS' as const,
        plainLanguageText: 'The source supports the reviewed mechanism statement.',
      },
    ],
  }

  return {
    revisionId: 'revision-1',
    programmeId: 'programme-1',
    reviewStatus: 'AWAITING_REVIEW',
    proposalDigestAlgorithm: 'sha256',
    proposalDigest: PROPOSAL_DIGEST,
    engineVersion: 'rna-intelligence/evidence-2.0.1',
    inputDigestAlgorithm: 'sha256',
    inputDigest: INPUT_DIGEST,
    proposalPreparedAt: '2026-08-23T01:00:00.000Z',
    contributionProposalId: 'proposal-1',
    sourceReviewTaskId: 'source-task-1',
    activeQualifications: ['CLINICAL_PHARMACOLOGY'],
    availableQualifications: ['CLINICAL_PHARMACOLOGY'],
    viewerHasReviewed: false,
    reviewQuorumFinal: false,
    reviewEligibility: { canReview: true, reason: null },
    adjudicationEligibility: {
      canAdjudicate: false,
      reason: 'A final steward decision is needed only when the two reviewers disagree.',
    },
    exactBundle: {
      digestAlgorithm: 'sha256',
      digest: PROPOSAL_DIGEST,
      asOfDate: '2026-08-23',
      programme: null,
      programmeScope: {
        id: 'programme-1',
        drugId: 'drug-1',
        slug: 'cardiovascular-outcomes',
        title: 'Cardiovascular outcomes programme',
        indication: 'Lowering cardiovascular risk',
        targetPopulation: 'Adults with established cardiovascular disease',
        jurisdiction: 'Global',
        sponsor: 'Example sponsor',
        partners: ['Example partner'],
        status: 'STOPPED',
        highestPhaseReached: '3',
        route: 'Subcutaneous injection',
        doseExposureContext: '300 mg every six months',
        startDate: '2020-01-01',
        endDate: '2025-01-01',
        rawStoppingReason: 'The planned outcome was not reached.',
        stoppingReasonCategory: 'EFFICACY',
      },
      publicConclusion: {
        presentationSchemaVersion: 'programme-presentation/v1',
        verdictCode: 'IDEA_FAILED',
        publicLabel: 'This development programme did not show the planned benefit.',
        professionalLabel: 'The programme did not meet its prespecified efficacy objective.',
        oneSentenceReason: 'The main trial did not reach its planned cardiovascular outcome.',
        indicationScope: 'Lowering cardiovascular risk',
        populationScope: 'Adults with established cardiovascular disease',
        doseExposureScope: '300 mg every six months',
        periodScope: '2020 to 2025',
        trialScope: 'One phase 3 outcomes trial',
        outcomeScope: 'Major cardiovascular events',
        plainMechanism: 'It was intended to lower a liver-made protein.',
        bestSupportedFinding: 'The medicine lowered the target protein.',
        mainLimitation: 'The trial did not show the planned clinical benefit.',
        whatWasDisproven: ['The tested plan did not achieve its prespecified outcome.'],
        whatWasNotDisproven: ['A different dose was not tested.'],
        whatRemainsUnknown: ['Whether another population would respond differently.'],
        confidence: 'HIGH',
        confidenceExplanation: 'The conclusion follows a completed phase 3 trial.',
        conditionsThatWouldChangeVerdict: ['A new well-controlled outcomes trial.'],
      },
      verdict: null,
      tenSecondSummary: null,
      trials: [],
      trialSnapshots: [
        {
          id: 'trial-snapshot-1',
          programmeId: 'programme-1',
          trialIdentifier: 'NCT00000001',
          title: 'Main cardiovascular outcomes trial',
          phase: '3',
          status: 'COMPLETED',
          resultsStatus: 'RESULTS_POSTED',
          enrolment: 5_000,
          enrolmentType: 'ACTUAL',
          startDate: '2020-01-01',
          primaryCompletionDate: '2024-06-01',
          completionDate: '2024-08-01',
          humanStudyStatus: 'HUMAN',
          registrySourceId: 'source-1',
          registrySnapshotId: 'source-snapshot-1',
          lastVerifiedAt: '2026-08-22T01:00:00.000Z',
        },
      ],
      evidenceNodes: [],
      evidenceNodeRecords: [
        {
          id: 'evidence-node-1',
          programmeId: 'programme-1',
          nodeType: 'CLINICAL_OUTCOME',
          revisionNumber: 1,
          previousEvidenceNodeId: null,
          state: 'NOT_SUPPORTED',
          reviewStatus: 'REVIEWED',
          plainSummary: 'The main clinical outcome was not improved.',
          professionalSummary: 'The primary endpoint was not met.',
          rationale: 'The confidence interval crossed the prespecified boundary.',
          visible: true,
          presentedAsPositive: false,
          presentedAsNegative: true,
          lastVerifiedAt: '2026-08-22T01:00:00.000Z',
          publishedAt: null,
          supersededAt: null,
        },
      ],
      claims: [],
      claimRecords: [
        {
          id: 'claim-1',
          programmeId: 'programme-1',
          claimKey: 'primary-outcome',
          revisionNumber: 1,
          previousClaimId: null,
          programmeTrialId: 'trial-snapshot-1',
          evidenceNodeType: 'CLINICAL_OUTCOME',
          nature: 'MEASURED',
          reviewStatus: 'REVIEWED',
          plainLanguageText: 'The main outcome was not significantly improved.',
          technicalText: 'The primary time-to-event analysis did not meet significance.',
          population: 'Adults with established cardiovascular disease',
          intervention: 'Example medicine',
          comparator: 'Placebo',
          dose: '300 mg',
          route: 'Subcutaneous injection',
          duration: 'Four years',
          direction: 'NULL',
          endpoint: 'Major cardiovascular events',
          endpointHierarchy: 'PRIMARY',
          outcomeType: 'PARTICIPANT',
          numericValue: 0.94,
          numericUnitRequired: true,
          numericUnit: 'hazard ratio',
          resultDate: '2025-01-10',
          participantOutcome: true,
          comparatorValue: null,
          comparatorGroup: 'Placebo',
          presentedAsPatientBenefit: false,
          exploratoryNatureDisclosed: false,
          stoppingReason: false,
          conflictsWithClaimIds: [],
          uncertaintyInterval: '95% CI 0.85–1.04',
          timepoint: 'Four years',
          reviewerInterpretation: 'This does not establish benefit for the tested plan.',
          lastVerifiedAt: '2026-08-22T01:00:00.000Z',
          publishedAt: null,
          supersededAt: null,
        },
      ],
      interpretabilityRecords: [
        {
          id: 'interpretability-1',
          programmeId: 'programme-1',
          programmeTrialId: 'trial-snapshot-1',
          criterion: 'OUTCOME_FIT',
          state: 'ADEQUATE',
          revisionNumber: 1,
          previousAssessmentId: null,
          reviewStatus: 'REVIEWED',
          explanation: 'The measured outcome matched the planned clinical question.',
          lastVerifiedAt: '2026-08-22T01:00:00.000Z',
          publishedAt: null,
          supersededAt: null,
        },
      ],
      sources: [],
      sourceRecords: [
        {
          id: 'source-1',
          sourceType: 'CLINICAL_TRIAL_REGISTRY',
          externalIdentifier: 'NCT00000001',
          canonicalLocator: 'https://clinicaltrials.gov/study/NCT00000001',
          title: 'ClinicalTrials.gov record for the main trial',
          publisher: 'U.S. National Library of Medicine',
          sponsor: null,
          publicationDate: null,
          correctionStatus: 'CURRENT',
          jurisdiction: 'United States',
          hierarchy: 'PRIMARY',
        },
      ],
      sourceSnapshots: [],
      sourceSnapshotRecords: [
        {
          id: 'source-snapshot-1',
          sourceId: 'source-1',
          previousSnapshotId: null,
          retrievedAt: '2026-08-22T01:00:00.000Z',
          sourcePublishedAt: '2025-01-10T00:00:00.000Z',
          lastVerifiedAt: '2026-08-22T01:00:00.000Z',
          hashAlgorithm: 'sha256',
          contentHash: 'c'.repeat(64),
          metadataHash: 'd'.repeat(64),
          permittedExcerpt: 'Primary outcome results posted.',
          rawSnapshotLocator: 'https://snapshots.rnawiki.test/source-snapshot-1',
        },
      ],
      presentation: {
        schemaVersion: 'programme-presentation/v1',
        mechanismSteps: [
          {
            stepKey: 'delivery',
            stepOrder: 1,
            plainTitle: 'The medicine reaches the intended cells',
            plainDescription: 'The saved source records delivery to the intended tissue.',
            technicalDescription: 'A stored technical description of tissue exposure.',
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
            stepKey: 'outcome',
            stepOrder: 3,
            plainTitle: 'A later patient effect was predicted',
            plainDescription: 'This stage was a prediction, not a measured patient outcome.',
            technicalDescription: null,
            evidenceBasis: 'PREDICTED',
            claimLinks: [{ claimId: 'claim-1', relationship: 'SUPPORTS' }],
            sources: [presentationSource],
          },
        ],
        timelineEvents: [
          {
            eventKey: 'important-result',
            eventDate: '2025-01-10',
            eventType: 'IMPORTANT_RESULT',
            dateBasis: 'ACTUAL',
            plainTitle: 'The main result changed the programme conclusion',
            plainDescription: 'The linked registry result did not show the planned outcome.',
            technicalDescription: null,
            programmeTrialId: 'trial-snapshot-1',
            sourceId: 'source-1',
            sourceSnapshotId: 'source-snapshot-1',
            claimLinks: [{ claimId: 'claim-1', relationship: 'SUPPORTS' }],
            source: presentationSource,
          },
        ],
      },
      dependencies: [],
      publicationLinks: {
        verdictClaims: [
          {
            programmeId: 'programme-1',
            verdictRevisionId: 'revision-1',
            claimId: 'verdict-claim-link-1',
            relationship: 'SUPPORTS',
          },
        ],
        evidenceNodeClaims: [
          {
            programmeId: 'programme-1',
            evidenceNodeId: 'evidence-node-1',
            claimId: 'node-claim-link-1',
            relationship: 'SUPPORTS',
          },
        ],
        interpretabilityClaims: [
          {
            programmeId: 'programme-1',
            assessmentId: 'interpretability-1',
            claimId: 'study-check-claim-link-1',
            relationship: 'SUPPORTS',
          },
        ],
        claimSources: [
          {
            programmeId: 'programme-1',
            claimId: 'claim-source-link-1',
            sourceSnapshotId: 'source-snapshot-1',
            relationship: 'SUPPORTS',
            sourceLocator: 'https://clinicaltrials.gov/study/NCT00000001',
          },
        ],
        dependencies: [
          {
            id: 'public-update-link-1',
            programmeId: 'programme-1',
            claimId: 'claim-1',
            dependentSurfaceType: 'VERDICT',
            evidenceNodeId: null,
            verdictRevisionId: 'revision-1',
            fieldPath: 'verdict.publicLabel',
            impactLevel: 'VERDICT',
          },
        ],
      },
      changes: [],
    },
    changedVsCurrent: [
      {
        path: 'publicConclusion.publicLabel',
        before: 'Earlier wording',
        after: 'This development programme did not show the planned benefit.',
        source: 'accepted-contribution',
      },
    ],
    machineReport: {
      engineVersion: 'rna-intelligence/evidence-2.0.1',
      inputDigestAlgorithm: 'sha256',
      inputDigest: INPUT_DIGEST,
      canPublish: true,
      findings: [
        {
          group: 'B',
          code: 'B_PROGRAMME_MEDICINE_MISMATCH',
          level: 'REVIEW_IMPACT',
          message: 'The programme and trial records are linked.',
          affectedEntity: { type: 'PROGRAMME', id: 'programme-1' },
          affectedField: 'drugId',
          correctiveAction: 'No action is needed.',
        },
      ],
      freshness: [],
      impactPlan: {
        affectedClaimIds: ['claim-1'],
        affectedEvidenceNodeIds: ['evidence-node-1'],
        affectedProgrammeIds: ['programme-1'],
        highestImpact: 'VERDICT',
        requiresHumanReview: true,
        preserveCurrentPublishedRevisionUntilReview: true,
      },
      humanJudgment: {
        required: true,
        verdictSelectedByEngine: false,
        statement: 'A qualified reviewer must decide what the evidence means.',
      },
    },
    reviews: [],
    adjudication: null,
  }
}

describe('CanonicalPublicationPanel publication preview', () => {
  it('requires every digest-bound public projection and every publication-link collection', () => {
    expect(hasCompleteExactPublicationPreview(completeState())).toBe(true)

    for (const field of [
      'programmeScope',
      'publicConclusion',
      'trialSnapshots',
      'evidenceNodeRecords',
      'claimRecords',
      'interpretabilityRecords',
      'sourceRecords',
      'sourceSnapshotRecords',
      'presentation',
      'dependencies',
      'changes',
      'publicationLinks',
    ] as const) {
      const incomplete = completeState()
      delete (incomplete.exactBundle as unknown as Record<string, unknown>)[field]
      expect(
        hasCompleteExactPublicationPreview(incomplete),
        `${field} must be present before signing`,
      ).toBe(false)
    }

    for (const field of [
      'verdictClaims',
      'evidenceNodeClaims',
      'interpretabilityClaims',
      'claimSources',
      'dependencies',
    ] as const) {
      const incomplete = completeState()
      delete (incomplete.exactBundle.publicationLinks as unknown as Record<string, unknown>)[field]
      expect(
        hasCompleteExactPublicationPreview(incomplete),
        `${field} links must be present before signing`,
      ).toBe(false)
    }
  })

  it('rejects a changed proposal fingerprint or automated-check fingerprint', () => {
    const changedProposal = completeState()
    changedProposal.proposalDigest = 'e'.repeat(64)
    expect(hasCompleteExactPublicationPreview(changedProposal)).toBe(false)

    const changedInputs = completeState()
    changedInputs.machineReport.inputDigest = 'f'.repeat(64)
    expect(hasCompleteExactPublicationPreview(changedInputs)).toBe(false)

    expect(hasCompleteExactPublicationPreview(null)).toBe(false)
    expect(hasCompleteExactPublicationPreview({} as WorkflowState)).toBe(false)
  })

  it('blocks review when a versioned presentation is partial or points to a different snapshot', () => {
    const missingStepSource = completeState()
    missingStepSource.exactBundle.presentation!.mechanismSteps[0]!.sources = []
    expect(hasCompleteExactPublicationPreview(missingStepSource)).toBe(false)

    const nonContiguousSteps = completeState()
    nonContiguousSteps.exactBundle.presentation!.mechanismSteps[1]!.stepOrder = 4
    expect(hasCompleteExactPublicationPreview(nonContiguousSteps)).toBe(false)

    const mismatchedTimelineSnapshot = completeState()
    mismatchedTimelineSnapshot.exactBundle.presentation!.timelineEvents[0]!.sourceSnapshotId =
      'another-snapshot'
    expect(hasCompleteExactPublicationPreview(mismatchedTimelineSnapshot)).toBe(false)

    const blankPublicWording = completeState()
    blankPublicWording.exactBundle.presentation!.mechanismSteps[0]!.plainTitle = '   '
    expect(hasCompleteExactPublicationPreview(blankPublicWording)).toBe(false)

    const invalidSourceFingerprint = completeState()
    invalidSourceFingerprint.exactBundle.presentation!.mechanismSteps[0]!.sources[0]!.contentHash =
      'not-a-fingerprint'
    expect(hasCompleteExactPublicationPreview(invalidSourceFingerprint)).toBe(false)

    const missingPresentation = completeState()
    delete missingPresentation.exactBundle.presentation
    expect(hasCompleteExactPublicationPreview(missingPresentation)).toBe(false)

    const olderCandidate = completeState()
    olderCandidate.exactBundle.publicConclusion.presentationSchemaVersion = null
    delete olderCandidate.exactBundle.presentation
    expect(hasCompleteExactPublicationPreview(olderCandidate)).toBe(true)
  })

  it('accepts a qualifying mechanism claim but rejects contradiction-only justification', () => {
    const qualified = completeState()
    qualified.exactBundle.presentation!.mechanismSteps[1]!.claimLinks = [
      { claimId: 'claim-1', relationship: 'QUALIFIES' },
    ]
    qualified.exactBundle.presentation!.mechanismSteps[1]!.sources =
      qualified.exactBundle.presentation!.mechanismSteps[1]!.sources.map((source) => ({
        ...source,
        claimBindings: source.claimBindings.map((binding) => ({
          ...binding,
          relationship: 'QUALIFIES' as const,
        })),
      }))
    expect(hasCompleteExactPublicationPreview(qualified)).toBe(true)

    const contradictionOnly = completeState()
    contradictionOnly.exactBundle.presentation!.mechanismSteps[1]!.claimLinks = [
      { claimId: 'claim-1', relationship: 'CONTRADICTS' },
    ]
    expect(hasCompleteExactPublicationPreview(contradictionOnly)).toBe(false)
  })

  it('blocks signing when a record is present but one of its full projected fields is absent', () => {
    const cases: Array<{ label: string; state: WorkflowState; record: Record<string, unknown> }> =
      []

    const programme = completeState()
    cases.push({
      label: 'programme scope',
      state: programme,
      record: programme.exactBundle.programmeScope,
    })
    const conclusion = completeState()
    cases.push({
      label: 'public conclusion',
      state: conclusion,
      record: conclusion.exactBundle.publicConclusion as unknown as Record<string, unknown>,
    })
    const trial = completeState()
    cases.push({
      label: 'trial snapshot',
      state: trial,
      record: trial.exactBundle.trialSnapshots[0] as Record<string, unknown>,
    })
    const node = completeState()
    cases.push({
      label: 'evidence step',
      state: node,
      record: node.exactBundle.evidenceNodeRecords[0] as Record<string, unknown>,
    })
    const claim = completeState()
    cases.push({
      label: 'statement',
      state: claim,
      record: claim.exactBundle.claimRecords[0] as Record<string, unknown>,
    })
    const studyCheck = completeState()
    cases.push({
      label: 'study-quality check',
      state: studyCheck,
      record: studyCheck.exactBundle.interpretabilityRecords[0] as Record<string, unknown>,
    })
    const source = completeState()
    cases.push({
      label: 'source',
      state: source,
      record: source.exactBundle.sourceRecords[0] as Record<string, unknown>,
    })
    const sourceVersion = completeState()
    cases.push({
      label: 'source version',
      state: sourceVersion,
      record: sourceVersion.exactBundle.sourceSnapshotRecords[0] as Record<string, unknown>,
    })
    const link = completeState()
    cases.push({
      label: 'publication link',
      state: link,
      record: link.exactBundle.publicationLinks.dependencies[0] as Record<string, unknown>,
    })

    const fieldToRemove = [
      'sponsor',
      'confidenceExplanation',
      'lastVerifiedAt',
      'publishedAt',
      'comparatorValue',
      'previousAssessmentId',
      'publicationDate',
      'metadataHash',
      'evidenceNodeId',
    ]
    cases.forEach((testCase, index) => {
      delete testCase.record[fieldToRemove[index] ?? 'id']
      expect(
        hasCompleteExactPublicationPreview(testCase.state),
        `${testCase.label} must include nullable fields as explicit saved values`,
      ).toBe(false)
    })
  })

  it('renders the conclusion, scope, evidence records, sources, and all relationship records', () => {
    const html = renderToStaticMarkup(React.createElement(ExactBundle, { state: completeState() }))

    for (const expected of [
      'Public conclusion and summary',
      'This development programme did not show the planned benefit.',
      'Cardiovascular outcomes programme',
      'Main cardiovascular outcomes trial',
      'The main clinical outcome was not improved.',
      'The main outcome was not significantly improved.',
      'The measured outcome matched the planned clinical question.',
      'ClinicalTrials.gov record for the main trial',
      'Supports: The source supports the reviewed mechanism statement.',
      'Mechanism stages that will appear publicly',
      'The medicine reaches the intended cells',
      'Evidence: Measured in people',
      '“Measured in people” comes from a human study',
      '“Predicted” is a reviewer-assigned expectation, not a measurement',
      'RNA Intelligence checks that the stage has a linked statement and saved source version',
      'Source events that will appear on the public timeline',
      'The main result changed the programme conclusion',
      '“planned date” is a schedule, not a completed event',
      'Saved version source-snapshot-1',
      `Source fingerprint sha256:${'c'.repeat(64)}`,
      'Open saved source version',
      'What changes from the current publication',
      'verdict-claim-link-1',
      'node-claim-link-1',
      'study-check-claim-link-1',
      'claim-source-link-1',
      'public-update-link-1',
    ]) {
      expect(html).toContain(expected)
    }
    expect(html).toContain('data-testid="canonical-presentation-preview"')
    expect(html.match(/data-testid="canonical-presentation-mechanism-stage"/g)).toHaveLength(3)
    expect(html).toContain('data-testid="canonical-presentation-timeline-event"')
  })

  it('accepts non-web canonical provenance without turning a URN into a link', () => {
    const state = completeState()
    const presentation = state.exactBundle.presentation!
    for (const source of [
      ...presentation.mechanismSteps.flatMap((step) => step.sources),
      ...presentation.timelineEvents.map((event) => event.source),
    ]) {
      source.canonicalLocator = 'urn:rnawiki:review-source:version-1'
    }

    expect(hasCompleteExactPublicationPreview(state)).toBe(true)
    const html = renderToStaticMarkup(React.createElement(ExactBundle, { state }))
    expect(html).toContain('urn:rnawiki:review-source:version-1')
    expect(html).toContain('Exact source version saved')
  })

  it('fails closed when a resolved source statement is not linked to that stage', () => {
    const state = completeState()
    const firstStep = state.exactBundle.presentation!.mechanismSteps[0]!
    firstStep.sources[0]!.claimBindings[0] = {
      ...firstStep.sources[0]!.claimBindings[0]!,
      claimId: 'a-different-claim',
    }

    expect(hasCompleteExactPublicationPreview(state)).toBe(false)
  })

  it('keeps raw review fingerprints inside clearly labelled technical details', () => {
    const html = renderToStaticMarkup(React.createElement(ExactBundle, { state: completeState() }))
    const detailsStart = html.indexOf('<details')
    const fullFingerprint = html.indexOf(`sha256:${PROPOSAL_DIGEST}`)

    expect(html).toContain('Technical review reference')
    expect(html).toContain('data-testid="canonical-review-reference"')
    expect(html).toContain('Technical audit details')
    expect(detailsStart).toBeGreaterThan(-1)
    expect(html.slice(detailsStart, html.indexOf('>', detailsStart) + 1)).not.toContain('open')
    expect(fullFingerprint).toBeGreaterThan(detailsStart)

    const source = readFileSync(
      join(process.cwd(), 'app/review-queue/CanonicalPublicationPanel.tsx'),
      'utf8',
    )
    expect(source.indexOf('Technical review reference')).toBeLessThan(
      source.indexOf('data-testid="canonical-review-form"'),
    )
    expect(source).toContain('data-testid="canonical-proposal-digest"')
    expect(source).toContain('data-testid="canonical-review-ineligible"')
    expect(source).toContain('data-testid="canonical-adjudication-ineligible"')
  })

  it('rejects delayed reads and writes after an account, version, or request change', () => {
    const current = {
      requestGeneration: 4,
      currentRequestGeneration: 4,
      requestScope: 'reviewer-1:revision-1',
      currentScope: 'reviewer-1:revision-1',
      aborted: false,
    }
    expect(isCurrentCanonicalUiRequest(current)).toBe(true)
    expect(isCurrentCanonicalUiRequest({ ...current, requestGeneration: 3 })).toBe(false)
    expect(isCurrentCanonicalUiRequest({ ...current, currentScope: 'reviewer-2:revision-1' })).toBe(
      false,
    )
    expect(isCurrentCanonicalUiRequest({ ...current, currentScope: 'reviewer-1:revision-2' })).toBe(
      false,
    )
    expect(isCurrentCanonicalUiRequest({ ...current, aborted: true })).toBe(false)
  })

  it('keeps every other reviewer field sealed until this viewer signs or review is complete', () => {
    expect(
      shouldBlindCanonicalReview({
        viewerHasReviewed: false,
        reviewQuorumFinal: false,
        decision: 'APPROVE',
      }),
    ).toBe(true)
    expect(
      shouldBlindCanonicalReview({
        viewerHasReviewed: true,
        reviewQuorumFinal: false,
        decision: 'APPROVE',
      }),
    ).toBe(false)
    expect(
      shouldBlindCanonicalReview({
        viewerHasReviewed: false,
        reviewQuorumFinal: true,
        decision: 'CHANGES_REQUESTED',
      }),
    ).toBe(false)
    expect(
      shouldBlindCanonicalReview({
        viewerHasReviewed: true,
        reviewQuorumFinal: true,
        decision: null,
      }),
    ).toBe(true)
  })
})
