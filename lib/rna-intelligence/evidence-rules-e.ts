import type { EvidenceClaim, EvidenceNode, EvidenceNodeType } from './evidence-types'
import type { EvidenceRuleContext } from './evidence-rule-utils'
import {
  addFinding,
  claimsForNode,
  duplicateValues,
  ref,
  sortedById,
  uniqueSorted,
} from './evidence-rule-utils'

const NODE_ORDER: Record<EvidenceNodeType, number> = {
  HUMAN_EXPOSURE: 0,
  USEFUL_EXPOSURE: 1,
  TARGET_ENGAGEMENT: 2,
  BIOLOGICAL_RESPONSE: 3,
  PATIENT_OUTCOME: 4,
}

function existingClaims(ctx: EvidenceRuleContext, ids: readonly string[]): EvidenceClaim[] {
  return uniqueSorted(ids)
    .map((id) => ctx.claims.get(id))
    .filter((claim): claim is EvidenceClaim => claim !== undefined)
}

function addNodeClaimMismatch(
  ctx: EvidenceRuleContext,
  node: EvidenceNode,
  claim: EvidenceClaim,
): void {
  if (claim.programmeId !== node.programmeId) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'E',
      code: 'E_NODE_CLAIM_PROGRAMME_MISMATCH',
      message: `Evidence node "${node.id}" links to claim "${claim.id}" from another programme.`,
      entity: ref('EVIDENCE_NODE', node.id, 'claimIds'),
      field: 'claimIds',
      correctiveAction: 'Link the node only to claims from the same development programme.',
      claimId: claim.id,
    })
  }
  if (claim.evidenceNodeType && claim.evidenceNodeType !== node.type) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'E',
      code: 'E_NODE_CLAIM_TYPE_MISMATCH',
      message: `Evidence node "${node.id}" links to claim "${claim.id}" classified for ${claim.evidenceNodeType}.`,
      entity: ref('EVIDENCE_NODE', node.id, 'claimIds'),
      field: 'claimIds',
      correctiveAction:
        'Link the claim to the evidence-chain node it actually measures or discusses.',
      claimId: claim.id,
    })
  }
}

export function runGroupEEvidenceChain(ctx: EvidenceRuleContext): void {
  for (const duplicate of duplicateValues(ctx.input.evidenceNodes.map((node) => node.id))) {
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'E',
      code: 'E_DUPLICATE_NODE_ID',
      message: `More than one evidence node uses the identifier "${duplicate}".`,
      entity: ref('EVIDENCE_NODE', duplicate, 'id'),
      field: 'id',
      correctiveAction: 'Assign each evidence-chain node a stable unique identifier.',
    })
  }

  const nodeTypeKeys = ctx.input.evidenceNodes.map(
    (node) => `${node.programmeId}\u0000${node.type}`,
  )
  for (const duplicate of duplicateValues(nodeTypeKeys)) {
    const [programmeId = duplicate, nodeType = 'UNKNOWN'] = duplicate.split('\u0000')
    addFinding(ctx, {
      level: 'BLOCK',
      group: 'E',
      code: 'E_DUPLICATE_NODE_TYPE',
      message: `Programme "${programmeId}" has more than one mutable ${nodeType} evidence node.`,
      entity: ref('PROGRAMME', programmeId, 'evidenceNodes'),
      field: 'evidenceNodes',
      correctiveAction:
        'Keep one current node revision per evidence-chain stage and preserve older revisions separately.',
    })
  }

  for (const node of sortedById(ctx.input.evidenceNodes)) {
    if (!ctx.programmes.has(node.programmeId)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'E',
        code: 'E_NODE_PROGRAMME_NOT_FOUND',
        message: `Evidence node "${node.id}" links to missing programme "${node.programmeId}".`,
        entity: ref('EVIDENCE_NODE', node.id, 'programmeId'),
        field: 'programmeId',
        correctiveAction: 'Link the node to a stored development programme.',
      })
    }

    const allIds = uniqueSorted([...node.supportingClaimIds, ...node.contradictingClaimIds])
    if (node.visible && allIds.length === 0) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'E',
        code: 'E_VISIBLE_NODE_WITHOUT_CLAIM',
        message: `Visible evidence node "${node.id}" has no corresponding evidence or absence claim.`,
        entity: ref('EVIDENCE_NODE', node.id, 'claimIds'),
        field: 'claimIds',
        correctiveAction:
          'Link a measured, reported, judgement, or explicit unknown claim before showing this state.',
      })
    }

    for (const claimId of allIds) {
      const claim = ctx.claims.get(claimId)
      if (!claim) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'E',
          code: 'E_NODE_CLAIM_NOT_FOUND',
          message: `Evidence node "${node.id}" links to missing claim "${claimId}".`,
          entity: ref('EVIDENCE_NODE', node.id, 'claimIds'),
          field: 'claimIds',
          correctiveAction: 'Restore the immutable claim revision or remove the invalid link.',
          claimId,
        })
      } else {
        addNodeClaimMismatch(ctx, node, claim)
      }
    }

    const supporting = existingClaims(ctx, node.supportingClaimIds)
    const contradicting = existingClaims(ctx, node.contradictingClaimIds)
    // Supporting/contradicting meaning belongs to the canonical node-claim link, not to the
    // claim's result direction (INCREASE/DECREASE/etc.). These normalized ID lists represent the
    // link relationship supplied by the persistence adapter.
    const hasSupportingRelationship = supporting.length > 0
    const hasContradictingRelationship = contradicting.length > 0
    const hasSupportingEvidence = supporting.some((claim) => claim.nature !== 'UNKNOWN')
    const hasContradictingEvidence = contradicting.some((claim) => claim.nature !== 'UNKNOWN')

    for (const claimId of uniqueSorted(node.supportingClaimIds).filter((id) =>
      node.contradictingClaimIds.includes(id),
    )) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'E',
        code: 'E_CLAIM_LINKED_AS_SUPPORT_AND_CONTRADICTION',
        message: `Evidence node "${node.id}" links claim "${claimId}" as both supporting and contradicting.`,
        entity: ref('EVIDENCE_NODE', node.id, 'claimIds'),
        field: 'claimIds',
        correctiveAction:
          'Choose the canonical node-claim relationship for this claim, or add separate claims for distinct findings.',
        claimId,
      })
    }

    if (node.state === 'CONFIRMED' && !hasSupportingEvidence) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'E',
        code: 'E_CONFIRMED_WITHOUT_SUPPORT',
        message: `Evidence node "${node.id}" is confirmed without a supporting claim.`,
        entity: ref('EVIDENCE_NODE', node.id, 'state'),
        field: 'state',
        correctiveAction:
          'Link a supporting claim or change the node to the evidence state the record supports.',
      })
    }

    if (node.state === 'CONTRADICTED' && !hasContradictingEvidence) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'E',
        code: 'E_CONTRADICTED_WITHOUT_EVIDENCE',
        message: `Evidence node "${node.id}" is contradicted without a contradiction claim.`,
        entity: ref('EVIDENCE_NODE', node.id, 'state'),
        field: 'state',
        correctiveAction:
          'Link the result that contradicts the expected finding or use an unknown state.',
      })
    }

    if (node.state === 'MIXED' && (!hasSupportingEvidence || !hasContradictingEvidence)) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'E',
        code: 'E_MIXED_WITHOUT_BOTH_DIRECTIONS',
        message: `Evidence node "${node.id}" is mixed without both supporting and contradicting claims.`,
        entity: ref('EVIDENCE_NODE', node.id, 'state'),
        field: 'state',
        correctiveAction: 'Reserve MIXED for genuinely conflicting evidence and link both sides.',
      })
    }

    if (node.state === 'UNKNOWN' && node.presentedAsPositive === true) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'E',
        code: 'E_UNKNOWN_PRESENTED_AS_POSITIVE',
        message: `Unknown evidence node "${node.id}" is presented as positive evidence.`,
        entity: ref('EVIDENCE_NODE', node.id, 'presentedAsPositive'),
        field: 'presentedAsPositive',
        correctiveAction:
          'Use the unknown visual and text treatment; do not imply that absence of evidence confirms the claim.',
      })
    }

    if (node.state === 'NOT_MEASURED' && node.presentedAsNegative === true) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'E',
        code: 'E_NOT_MEASURED_PRESENTED_AS_NEGATIVE',
        message: `Not-measured evidence node "${node.id}" is presented as a negative finding.`,
        entity: ref('EVIDENCE_NODE', node.id, 'presentedAsNegative'),
        field: 'presentedAsNegative',
        correctiveAction:
          'State that the outcome was not measured; do not label it failed or contradicted.',
      })
    }

    if (node.type === 'TARGET_ENGAGEMENT' && node.state === 'CONFIRMED') {
      const hasDirectEvidence = supporting.some(
        (claim) => claim.nature === 'MEASURED' || claim.nature === 'REGULATORY_FINDING',
      )
      if (!hasDirectEvidence) {
        addFinding(ctx, {
          level: 'WARNING',
          group: 'E',
          code: 'E_TARGET_ENGAGEMENT_ASSUMED',
          message: `Target engagement node "${node.id}" is confirmed without a measured or regulatory claim.`,
          entity: ref('EVIDENCE_NODE', node.id, 'state'),
          field: 'state',
          correctiveAction: 'Label target engagement as inferred or link the direct measurement.',
        })
      }
    }

    if (hasSupportingRelationship && hasContradictingRelationship) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'E',
        code: 'E_MATERIALLY_CONFLICTING_CLAIMS',
        message: `Evidence node "${node.id}" contains both supporting and contradicting claims.`,
        entity: ref('EVIDENCE_NODE', node.id, 'claimIds'),
        field: 'claimIds',
        correctiveAction: 'Expose both sides and require a reviewer to explain the current state.',
      })
    }
  }

  for (const programme of sortedById(ctx.input.programmes)) {
    const programmeNodes = ctx.input.evidenceNodes.filter(
      (node) => node.programmeId === programme.id,
    )
    const exposureFailure = programmeNodes.find(
      (node) => node.type === 'USEFUL_EXPOSURE' && node.state === 'CONTRADICTED',
    )
    if (!exposureFailure) continue

    for (const downstream of programmeNodes
      .filter(
        (node) =>
          NODE_ORDER[node.type] > NODE_ORDER.USEFUL_EXPOSURE &&
          (node.state === 'CONFIRMED' || node.state === 'MIXED'),
      )
      .sort((a, b) => a.id.localeCompare(b.id))) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'E',
        code: 'E_DOWNSTREAM_ASSERTED_AFTER_EXPOSURE_FAILURE',
        message: `Node "${downstream.id}" is confirmed despite useful exposure being contradicted upstream.`,
        entity: ref('EVIDENCE_NODE', downstream.id, 'state'),
        field: 'state',
        correctiveAction:
          'Check whether the downstream result came from another dose, population, or candidate and make that scope explicit.',
      })
    }
  }

  for (const claim of sortedById(ctx.input.claims)) {
    if (
      claim.outcomeType === 'SURROGATE' &&
      (claim.evidenceNodeType === 'PATIENT_OUTCOME' || claim.presentedAsPatientBenefit === true)
    ) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'E',
        code: 'E_SURROGATE_PRESENTED_AS_PATIENT_OUTCOME',
        message: `Claim "${claim.id}" presents a surrogate result as patient benefit.`,
        entity: ref('CLAIM', claim.id, 'outcomeType'),
        field: 'outcomeType',
        correctiveAction:
          'Label the surrogate endpoint and avoid implying that it proves how patients felt, functioned, or survived.',
        claimId: claim.id,
      })
    }

    if (
      claim.endpointHierarchy === 'EXPLORATORY' &&
      (claim.outcomeType === 'PATIENT_OUTCOME' || claim.presentedAsPatientBenefit === true) &&
      claim.exploratoryNatureDisclosed !== true
    ) {
      addFinding(ctx, {
        level: 'WARNING',
        group: 'E',
        code: 'E_EXPLORATORY_BENEFIT_UNDISCLOSED',
        message: `Claim "${claim.id}" presents exploratory patient-benefit evidence without saying it was exploratory.`,
        entity: ref('CLAIM', claim.id, 'exploratoryNatureDisclosed'),
        field: 'exploratoryNatureDisclosed',
        correctiveAction: 'Disclose the endpoint hierarchy next to the result.',
        claimId: claim.id,
      })
    }
  }

  // `claimsForNode` is intentionally exercised here as a final referential consistency pass. It
  // also ensures a node cannot hide a claim in one list merely because the other list was checked.
  for (const node of sortedById(ctx.input.evidenceNodes)) void claimsForNode(ctx, node)
}
