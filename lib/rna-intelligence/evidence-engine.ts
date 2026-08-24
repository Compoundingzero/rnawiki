import type { EvidenceIntelligenceInput, EvidenceIntelligenceReport } from './evidence-types'
import {
  createEvidenceRuleContext,
  evidenceEngineVersionForInput,
  evidenceInputDigest,
  findingSortKey,
} from './evidence-rule-utils'
import { runGroupBProgrammeScope } from './evidence-rules-b'
import { runGroupCCitationProvenance } from './evidence-rules-c'
import { runGroupDChronology } from './evidence-rules-d'
import { runGroupEEvidenceChain } from './evidence-rules-e'
import { runGroupFVerdictConsistency } from './evidence-rules-f'
import { runGroupGPlainLanguage } from './evidence-rules-g'
import { runGroupHFreshnessDependencies } from './evidence-rules-h'
import { runPresentationRules } from './evidence-rules-presentation'

/**
 * Runs deterministic RNA Intelligence 2.0 checks for evidence Groups B-H.
 *
 * This function is intentionally separate from `runFullDeterministicSweep`, which remains the
 * existing Group A molecular/sequence API. It reads no clock and makes no database or network
 * calls. Most importantly, `canPublish` means only that the structured record cleared these
 * machine rules; it is never a judgement that a scientific conclusion is true.
 */
export function runEvidenceIntelligence(
  input: EvidenceIntelligenceInput,
): EvidenceIntelligenceReport {
  const ctx = createEvidenceRuleContext(input)

  runGroupBProgrammeScope(ctx)
  runGroupCCitationProvenance(ctx)
  runGroupDChronology(ctx)
  runGroupEEvidenceChain(ctx)
  runGroupFVerdictConsistency(ctx)
  runGroupGPlainLanguage(ctx)
  runPresentationRules(ctx)
  const { freshness, impactPlan } = runGroupHFreshnessDependencies(ctx)

  const findings = [...ctx.findings].sort((a, b) =>
    findingSortKey(a).localeCompare(findingSortKey(b)),
  )
  const blocks = findings.filter((finding) => finding.level === 'BLOCK')
  const warnings = findings.filter((finding) => finding.level === 'WARNING')
  const reviewImpacts = findings.filter((finding) => finding.level === 'REVIEW_IMPACT')

  return {
    engineVersion: evidenceEngineVersionForInput(input),
    inputDigestAlgorithm: 'sha256',
    inputDigest: evidenceInputDigest(input),
    canPublish: blocks.length === 0,
    findings,
    blocks,
    warnings,
    reviewImpacts,
    freshness,
    impactPlan,
    humanJudgment: {
      required: true,
      verdictSelectedByEngine: false,
      statement:
        'RNA Intelligence checks structure, provenance, chronology, dependencies, and rubric consistency. Human reviewers remain responsible for scientific meaning and the programme verdict.',
    },
  }
}
