import { describe, expect, it } from 'vitest'

import { contributionContentDigest } from '@/lib/contributions/digest'
import {
  contributionAdjudicationDecisionSchema,
  contributionReviewDecisionSchema,
} from '@/lib/contributions/review-validation'
import {
  deriveContributionImpactPreview,
  runContributionMachineChecks,
  type ContributionSubmissionCandidate,
  type ProgrammeDependencyForImpact,
} from '@/lib/contributions/types'
import {
  createContributionDraftSchema,
  emptyContributionActionSchema,
} from '@/lib/contributions/validation'

const dependencies: ProgrammeDependencyForImpact[] = [
  {
    claimId: 'claim-verdict',
    dependentSurfaceType: 'VERDICT',
    evidenceNodeId: null,
    verdictRevisionId: 'verdict-current',
    fieldPath: 'verdict.publicLabel',
    impactLevel: 'POSSIBLE_VERDICT_IMPACT',
  },
  {
    claimId: 'claim-node',
    dependentSurfaceType: 'EVIDENCE_NODE',
    evidenceNodeId: 'node-selected',
    verdictRevisionId: null,
    fieldPath: 'evidenceNodes.PATIENT_OUTCOME.summary',
    impactLevel: 'INTERPRETIVE_REVIEW_REQUIRED',
  },
  {
    claimId: 'claim-other-node',
    dependentSurfaceType: 'EVIDENCE_NODE',
    evidenceNodeId: 'node-other',
    verdictRevisionId: null,
    fieldPath: 'evidenceNodes.TARGET_ENGAGEMENT.summary',
    impactLevel: 'SAFETY_CRITICAL_REVIEW',
  },
]

function validChallenge(): ContributionSubmissionCandidate {
  return {
    proposalType: 'VERDICT_CHALLENGE',
    selectedField: 'verdict.publicLabel',
    proposedText: 'The measured evidence supports a narrower conclusion.',
    proposedValue: null,
    sourceType: 'PEER_REVIEWED_PUBLICATION',
    sourceLocator: 'https://doi.org/10.1000/example',
    sourceIdentifier: 'doi:10.1000/example',
    claimNature: 'MEASURED',
    evidenceNodeId: 'node-selected',
    proposedStoppedVerdict: null,
    reasoning: 'The current wording is broader than the prespecified endpoint.',
    whatWasWrongOrMissing: 'The population restriction is missing.',
    affects: 'BOTH',
    conflictsOfInterest: 'None',
    conflictsOfInterestAttested: true,
  }
}

describe('programme contribution deterministic boundary', () => {
  it('unions the exact current-verdict field with the selected evidence-node dependencies', () => {
    const preview = deriveContributionImpactPreview({
      proposalType: 'VERDICT_CHALLENGE',
      selectedField: 'verdict.publicLabel',
      evidenceNodeId: 'node-selected',
      currentVerdictRevisionId: 'verdict-current',
      dependencies,
    })

    expect(preview.affectedClaimIds).toEqual(['claim-node', 'claim-verdict'])
    expect(preview.matchedDependencyCount).toBe(2)
    expect(preview.highestImpactLevel).toBe('POSSIBLE_VERDICT_IMPACT')
    expect(preview.affectedClaimIds).not.toContain('claim-other-node')
  })

  it('requires a persisted same-programme node for a verdict challenge', () => {
    const candidate = validChallenge()
    const impactPreview = deriveContributionImpactPreview({
      proposalType: candidate.proposalType,
      selectedField: candidate.selectedField!,
      evidenceNodeId: candidate.evidenceNodeId,
      currentVerdictRevisionId: 'verdict-current',
      dependencies,
    })

    expect(
      runContributionMachineChecks({
        candidate,
        programmeStatus: 'ACTIVE',
        hasCurrentVerdict: true,
        evidenceNodeExistsInProgramme: true,
        impactPreview,
      }).passed,
    ).toBe(true)
    expect(
      runContributionMachineChecks({
        candidate,
        programmeStatus: 'ACTIVE',
        hasCurrentVerdict: true,
        evidenceNodeExistsInProgramme: false,
        impactPreview,
      }).checks,
    ).toContainEqual(expect.objectContaining({ code: 'evidence_node_scope', status: 'FAIL' }))
  })

  it('keeps correction and challenge target classes separate', () => {
    const correction = { ...validChallenge(), proposalType: 'CORRECTION' as const }
    const checks = runContributionMachineChecks({
      candidate: correction,
      programmeStatus: 'ACTIVE',
      hasCurrentVerdict: true,
      evidenceNodeExistsInProgramme: true,
      impactPreview: deriveContributionImpactPreview({
        proposalType: correction.proposalType,
        selectedField: correction.selectedField!,
        evidenceNodeId: correction.evidenceNodeId,
        currentVerdictRevisionId: 'verdict-current',
        dependencies,
      }),
    })
    expect(checks.checks).toContainEqual(
      expect.objectContaining({ code: 'proposal_target_matches_type', status: 'FAIL' }),
    )
  })

  it('rejects a verdict-code target outside a stopped/withdrawn programme', () => {
    const candidate = {
      ...validChallenge(),
      selectedField: 'verdict.verdictCode' as const,
      proposedStoppedVerdict: 'MOLECULE_FAILED' as const,
    }
    const checks = runContributionMachineChecks({
      candidate,
      programmeStatus: 'ACTIVE',
      hasCurrentVerdict: true,
      evidenceNodeExistsInProgramme: true,
      impactPreview: deriveContributionImpactPreview({
        proposalType: candidate.proposalType,
        selectedField: candidate.selectedField,
        evidenceNodeId: candidate.evidenceNodeId,
        currentVerdictRevisionId: 'verdict-current',
        dependencies,
      }),
    })
    expect(checks.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'stopped_verdict_scope', status: 'FAIL' }),
        expect.objectContaining({ code: 'stopped_verdict_target', status: 'FAIL' }),
      ]),
    )
  })

  it('hashes canonical content independently of object key insertion order', () => {
    expect(contributionContentDigest({ b: 2, a: { d: 4, c: 3 } })).toBe(
      contributionContentDigest({ a: { c: 3, d: 4 }, b: 2 }),
    )
    expect(contributionContentDigest({ a: 1 })).toMatch(/^[0-9a-f]{64}$/)
  })

  it('strictly rejects caller-supplied machine output and submission provenance', () => {
    expect(
      emptyContributionActionSchema.safeParse({ machineChecks: { passed: true } }).success,
    ).toBe(false)
    expect(
      createContributionDraftSchema.safeParse({
        proposalType: 'CORRECTION',
        impactPreview: { affectedClaimIds: ['invented-claim'] },
        contentDigest: 'a'.repeat(64),
      }).success,
    ).toBe(false)
  })

  it('does not treat empty structured replacements as proposed content', () => {
    expect(
      createContributionDraftSchema.safeParse({
        proposalType: 'VERDICT_CHALLENGE',
        proposedValue: '',
      }).success,
    ).toBe(false)
    expect(
      createContributionDraftSchema.safeParse({
        proposalType: 'VERDICT_CHALLENGE',
        proposedValue: [],
      }).success,
    ).toBe(false)

    const candidate = {
      ...validChallenge(),
      selectedField: 'verdict.whatRemainsUnknown' as const,
      proposedText: null,
      proposedValue: [] as string[],
    }
    const checks = runContributionMachineChecks({
      candidate,
      programmeStatus: 'ACTIVE',
      hasCurrentVerdict: true,
      evidenceNodeExistsInProgramme: true,
      impactPreview: deriveContributionImpactPreview({
        proposalType: candidate.proposalType,
        selectedField: candidate.selectedField,
        evidenceNodeId: candidate.evidenceNodeId,
        currentVerdictRevisionId: 'verdict-current',
        dependencies,
      }),
    })
    expect(checks.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'proposed_content_present', status: 'FAIL' }),
        expect.objectContaining({ code: 'proposed_value_shape', status: 'FAIL' }),
      ]),
    )
  })

  it('requires an actionable note for adverse reviews and rejects server-owned decision fields', () => {
    const common = {
      expertiseTags: ['BIOSTATISTICS'] as const,
      independenceAttested: true as const,
      conflictsOfInterest: 'None declared',
      conflictsOfInterestAttested: true as const,
    }
    expect(
      contributionReviewDecisionSchema.safeParse({ ...common, decision: 'APPROVE' }).success,
    ).toBe(true)
    expect(
      contributionReviewDecisionSchema.safeParse({ ...common, decision: 'CHANGES_REQUESTED' })
        .success,
    ).toBe(false)
    expect(
      contributionReviewDecisionSchema.safeParse({
        ...common,
        decision: 'REJECT',
        reviewNote: 'The cited source does not support the replacement.',
      }).success,
    ).toBe(true)
    expect(
      contributionReviewDecisionSchema.safeParse({
        ...common,
        decision: 'APPROVE',
        contentDigest: 'a'.repeat(64),
        reviewerUserId: 'caller-controlled',
      }).success,
    ).toBe(false)
    expect(
      contributionAdjudicationDecisionSchema.safeParse({
        decision: 'APPROVE',
        rationale: 'Both reviews were weighed against the frozen source and scope.',
        expertiseTags: ['CLINICAL_DEVELOPMENT'],
        conflictsOfInterest: 'None declared',
        conflictsOfInterestAttested: true,
        resolvedAt: new Date().toISOString(),
      }).success,
    ).toBe(false)
  })
})
