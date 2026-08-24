import type {
  EvidenceClaim,
  EvidenceNodeType,
  EvidenceRuleCode,
  ProgrammeVerdict,
  StudyInterpretability,
} from './evidence-types'
import type { EvidenceRuleContext } from './evidence-rule-utils'
import { addFinding, hasText, ref, sortedById, uniqueSorted } from './evidence-rule-utils'

const OPERATIONAL_STOPPING_REASONS = new Set([
  'RECRUITMENT',
  'FUNDING',
  'BUSINESS_STRATEGY',
  'ACQUISITION_OR_PORTFOLIO_REPRIORITISATION',
  'DOSE_SELECTION',
  'POPULATION_SELECTION',
  'ENDPOINT_SELECTION',
  'OPERATIONAL_EXECUTION',
  'RESULTS_UNAVAILABLE',
  'UNKNOWN',
])

function nodeState(ctx: EvidenceRuleContext, programmeId: string, type: EvidenceNodeType) {
  return ctx.input.evidenceNodes.find(
    (node) => node.programmeId === programmeId && node.type === type,
  )?.state
}

function interpretabilityIsClean(value: StudyInterpretability | undefined): boolean {
  if (!value) return false
  return [
    value.statisticalPower,
    value.populationSelection,
    value.exposureAdequacy,
    value.endpointValidity,
    value.durationAndOperationalIntegrity,
  ].every((state) => state === 'YES')
}

function interpretabilityHasProblem(value: StudyInterpretability | undefined): boolean {
  if (!value) return true
  return [
    value.statisticalPower,
    value.populationSelection,
    value.exposureAdequacy,
    value.endpointValidity,
    value.durationAndOperationalIntegrity,
  ].some((state) => state !== 'YES')
}

function completeException(verdict: ProgrammeVerdict): boolean {
  return (
    hasText(verdict.adjudicatedException?.rationale) &&
    hasText(verdict.adjudicatedException?.adjudicatorId)
  )
}

function addRubricMismatch(
  ctx: EvidenceRuleContext,
  verdict: ProgrammeVerdict,
  code: Extract<
    EvidenceRuleCode,
    | 'F_IDEA_FAILED_RUBRIC_MISMATCH'
    | 'F_MOLECULE_FAILED_RUBRIC_MISMATCH'
    | 'F_TEST_UNANSWERED_RUBRIC_MISMATCH'
  >,
  reasons: string[],
): void {
  if (completeException(verdict)) {
    addFinding(ctx, {
      level: 'REVIEW_IMPACT',
      group: 'F',
      code: 'F_ADJUDICATED_RUBRIC_EXCEPTION',
      message: `Verdict "${verdict.id}" departs from the normal ${verdict.code} rubric: ${reasons.join('; ')}.`,
      entity: ref('VERDICT', verdict.id, 'adjudicatedException'),
      field: 'adjudicatedException',
      correctiveAction:
        'Preserve the adjudicator, rationale, and independent review record with the published revision.',
    })
    return
  }

  addFinding(ctx, {
    level: 'BLOCK',
    group: 'F',
    code,
    message: `Verdict "${verdict.id}" does not meet the normal ${verdict.code} rubric: ${reasons.join('; ')}.`,
    entity: ref('VERDICT', verdict.id, 'code'),
    field: 'code',
    correctiveAction:
      'Correct the structured evidence, select a reviewer-supported verdict, or obtain adjudication with a written exception rationale.',
  })
}

function linkedClaims(ctx: EvidenceRuleContext, ids: readonly string[]): EvidenceClaim[] {
  return uniqueSorted(ids)
    .map((id) => ctx.claims.get(id))
    .filter((claim): claim is EvidenceClaim => claim !== undefined)
}

export function runGroupFVerdictConsistency(ctx: EvidenceRuleContext): void {
  for (const verdict of sortedById(ctx.input.verdicts)) {
    if (
      verdict.adjudicatedException !== undefined &&
      (!hasText(verdict.adjudicatedException.rationale) ||
        !hasText(verdict.adjudicatedException.adjudicatorId))
    ) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'F',
        code: 'F_ADJUDICATED_EXCEPTION_INCOMPLETE',
        message: `Verdict "${verdict.id}" records an exception without both a rationale and adjudicator.`,
        entity: ref('VERDICT', verdict.id, 'adjudicatedException'),
        field: 'adjudicatedException',
        correctiveAction:
          'Record the adjudicator identity and their written reason, or remove the incomplete exception.',
      })
    }

    if (!verdict.programmeId) continue
    const programme = ctx.programmes.get(verdict.programmeId)
    if (!programme) continue

    const support = linkedClaims(ctx, verdict.supportingClaimIds)
    for (const claim of support) {
      if (claim.programmeId !== programme.id) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'F',
          code: 'F_VERDICT_SUPPORT_CLAIM_SCOPE_MISMATCH',
          message: `Verdict "${verdict.id}" is supported by claim "${claim.id}" from another programme.`,
          entity: ref('VERDICT', verdict.id, 'supportingClaimIds'),
          field: 'supportingClaimIds',
          correctiveAction: 'Use only claims scoped to the programme evaluated by this verdict.',
          claimId: claim.id,
        })
      }
    }

    for (const claim of linkedClaims(ctx, verdict.contradictoryClaimIds)) {
      if (claim.programmeId !== programme.id) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'F',
          code: 'F_VERDICT_CONTRADICTORY_CLAIM_SCOPE_MISMATCH',
          message: `Verdict "${verdict.id}" is contradicted by claim "${claim.id}" from another programme.`,
          entity: ref('VERDICT', verdict.id, 'contradictoryClaimIds'),
          field: 'contradictoryClaimIds',
          correctiveAction: 'Use only contradictory claims scoped to the programme under review.',
          claimId: claim.id,
        })
      }
    }

    for (const claim of linkedClaims(ctx, verdict.candidateLimitationClaimIds)) {
      if (claim.programmeId !== programme.id) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'F',
          code: 'F_VERDICT_CANDIDATE_CLAIM_SCOPE_MISMATCH',
          message: `Verdict "${verdict.id}" uses candidate-limitation claim "${claim.id}" from another programme.`,
          entity: ref('VERDICT', verdict.id, 'candidateLimitationClaimIds'),
          field: 'candidateLimitationClaimIds',
          correctiveAction:
            'Use only candidate-specific limitations from the programme under review.',
          claimId: claim.id,
        })
      }
    }

    const interpretability = programme.studyInterpretability
    for (const [criterion, claimIds] of Object.entries(
      interpretability?.supportingClaimIdsByCriterion ?? {},
    )) {
      const field = `studyInterpretability.supportingClaimIdsByCriterion.${criterion}`
      if (claimIds.length === 0) {
        addFinding(ctx, {
          level: 'BLOCK',
          group: 'F',
          code: 'F_INTERPRETABILITY_UNSUPPORTED',
          message: `Programme "${programme.id}" records ${criterion} without supporting evidence.`,
          entity: ref('PROGRAMME', programme.id, field),
          field,
          correctiveAction:
            'Link the evidence used to answer this study-interpretability question.',
        })
      }
      for (const claimId of uniqueSorted(claimIds)) {
        const claim = ctx.claims.get(claimId)
        if (!claim) {
          addFinding(ctx, {
            level: 'BLOCK',
            group: 'F',
            code: 'F_INTERPRETABILITY_CLAIM_NOT_FOUND',
            message: `Programme "${programme.id}" links ${criterion} to missing claim "${claimId}".`,
            entity: ref('PROGRAMME', programme.id, field),
            field,
            correctiveAction:
              'Restore the immutable claim or update this supporting evidence link.',
            claimId,
          })
        } else if (claim.programmeId !== programme.id) {
          addFinding(ctx, {
            level: 'BLOCK',
            group: 'F',
            code: 'F_INTERPRETABILITY_CLAIM_SCOPE_MISMATCH',
            message: `Programme "${programme.id}" uses ${criterion} evidence from another programme.`,
            entity: ref('PROGRAMME', programme.id, field),
            field,
            correctiveAction:
              'Use only evidence from the programme whose study design is being assessed.',
            claimId,
          })
        }
      }
    }

    if (
      support.length > 0 &&
      support.every((claim) => claim.stoppingReason === true || claim.nature === 'SPONSOR_REPORTED')
    ) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'F',
        code: 'F_STOPPING_REASON_ONLY',
        message: `Verdict "${verdict.id}" is supported only by stopping-reason statements or statements from the study sponsor.`,
        entity: ref('VERDICT', verdict.id, 'supportingClaimIds'),
        field: 'supportingClaimIds',
        correctiveAction:
          'Keep the stopping reason separate and link scientific evidence before publishing a failure verdict.',
      })
    }

    if (
      verdict.code !== 'TEST_UNANSWERED' &&
      support.length > 0 &&
      support.every((claim) => claim.nature === 'UNKNOWN')
    ) {
      addFinding(ctx, {
        level: 'BLOCK',
        group: 'F',
        code: 'F_UNKNOWN_USED_AS_FAILURE_EVIDENCE',
        message: `Verdict "${verdict.id}" treats unknown evidence as proof of failure.`,
        entity: ref('VERDICT', verdict.id, 'supportingClaimIds'),
        field: 'supportingClaimIds',
        correctiveAction:
          'Keep the conclusion unanswered until measured, regulatory, or reviewed evidence supports a failure classification.',
      })
    }

    const trials = ctx.input.trials.filter((trial) => trial.programmeId === programme.id)
    const resultsUnavailable = trials.some((trial) => trial.resultsStatus !== 'AVAILABLE')
    const usefulExposure = nodeState(ctx, programme.id, 'USEFUL_EXPOSURE')
    const targetEngagement = nodeState(ctx, programme.id, 'TARGET_ENGAGEMENT')
    const biologicalResponse = nodeState(ctx, programme.id, 'BIOLOGICAL_RESPONSE')
    const patientOutcome = nodeState(ctx, programme.id, 'PATIENT_OUTCOME')
    const candidateClaims = linkedClaims(ctx, verdict.candidateLimitationClaimIds)
    const sourcedCandidateLimitation = candidateClaims.some((claim) => claim.sourceIds.length > 0)
    const downstreamUnanswered = [targetEngagement, biologicalResponse, patientOutcome].some(
      (state) => state === 'UNKNOWN' || state === 'NOT_MEASURED' || state === undefined,
    )
    const operationalStop = programme.stoppingReasonCategory
      ? OPERATIONAL_STOPPING_REASONS.has(programme.stoppingReasonCategory)
      : false

    if (verdict.code === 'IDEA_FAILED') {
      const reasons: string[] = []
      if (usefulExposure !== 'CONFIRMED') reasons.push('useful exposure is not confirmed')
      if (targetEngagement !== 'CONFIRMED' && biologicalResponse !== 'CONFIRMED') {
        reasons.push('neither target engagement nor the intended biological response is confirmed')
      }
      if (!interpretabilityIsClean(programme.studyInterpretability)) {
        reasons.push('the study is not fully interpretable')
      }
      if (patientOutcome !== 'CONTRADICTED') {
        reasons.push('the expected patient outcome is not contradicted')
      }
      if (candidateClaims.length > 0) reasons.push('a candidate-specific limitation is recorded')
      if (resultsUnavailable) reasons.push('primary results are unavailable')
      if (reasons.length > 0) {
        addRubricMismatch(ctx, verdict, 'F_IDEA_FAILED_RUBRIC_MISMATCH', reasons)
      }
    }

    if (verdict.code === 'MOLECULE_FAILED') {
      const reasons: string[] = []
      if (!sourcedCandidateLimitation) {
        reasons.push('no sourced candidate-specific limitation is linked')
      }
      if (!downstreamUnanswered) {
        reasons.push('the biological hypothesis appears to have been cleanly tested downstream')
      }
      if (reasons.length > 0) {
        addRubricMismatch(ctx, verdict, 'F_MOLECULE_FAILED_RUBRIC_MISMATCH', reasons)
      }
    }

    if (verdict.code === 'TEST_UNANSWERED') {
      const hasUnansweredBasis =
        interpretabilityHasProblem(programme.studyInterpretability) ||
        resultsUnavailable ||
        operationalStop ||
        downstreamUnanswered
      if (!hasUnansweredBasis) {
        addRubricMismatch(ctx, verdict, 'F_TEST_UNANSWERED_RUBRIC_MISMATCH', [
          'no major interpretability problem, unavailable result, operational stop, or unanswered downstream node is recorded',
        ])
      }
    }
  }
}
