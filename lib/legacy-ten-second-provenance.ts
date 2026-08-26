import { createHash } from 'node:crypto'

import type { TenSecondAnswerCopy } from '@/lib/ten-second-answer-contract'
import type { DrugDossier } from '@/lib/types'

export const LEGACY_TEN_SECOND_ANSWER_FINGERPRINT_VERSION = 'legacy-ten-second-answer/v2' as const

export type LegacyTenSecondEvidenceDossier = Pick<
  DrugDossier,
  | 'id'
  | 'name'
  | 'tradeName'
  | 'sponsor'
  | 'targetGene'
  | 'targetProtein'
  | 'modality'
  | 'approvalStatus'
  | 'approvalYear'
  | 'indication'
  | 'patientFriendlyIndication'
  | 'conditionContext'
  | 'oneSentenceVerdict'
  | 'laymanHowItWorks'
  | 'auditConfidence'
  | 'confidenceScore'
  | 'keyAudits'
  | 'mechanismSteps'
  | 'trials'
  | 'measuredVsInferredSummary'
  | 'deliverySystem'
  | 'commonQuestions'
  | 'hasDiscrepancy'
  | 'dossierDepth'
  | 'sourceProvenance'
  | 'anatomicalSite'
>

function canonicalJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalJsonValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter((entry) => entry[1] !== undefined)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, child]) => [key, canonicalJsonValue(child)]),
    )
  }
  return value
}

/**
 * Collision-resistant binding between the exact authored first-read copy and the legacy medical
 * material it was reviewed against. Mutable community/account counters, prices and laboratory
 * instructions do not enter this surface; changing the slug, any authored word, or any identity,
 * use, evidence, safety or stored-source field changes the fingerprint.
 */
export function legacyTenSecondAnswerFingerprint(
  dossier: LegacyTenSecondEvidenceDossier,
  copy: TenSecondAnswerCopy,
): string {
  const approvedSurface = {
    version: LEGACY_TEN_SECOND_ANSWER_FINGERPRINT_VERSION,
    authoredAnswer: {
      slug: dossier.id,
      copy,
    },
    medicine: {
      slug: dossier.id,
      name: dossier.name,
      tradeName: dossier.tradeName,
      sponsor: dossier.sponsor,
      targetGene: dossier.targetGene,
      targetProtein: dossier.targetProtein,
      modality: dossier.modality,
      approvalStatus: dossier.approvalStatus,
      approvalYear: dossier.approvalYear,
      indication: dossier.indication,
      patientFriendlyIndication: dossier.patientFriendlyIndication,
      conditionContext: dossier.conditionContext,
      anatomicalSite: dossier.anatomicalSite,
    },
    evidence: {
      oneSentenceVerdict: dossier.oneSentenceVerdict,
      laymanHowItWorks: dossier.laymanHowItWorks,
      auditConfidence: dossier.auditConfidence,
      confidenceScore: dossier.confidenceScore,
      keyAudits: dossier.keyAudits,
      mechanismSteps: dossier.mechanismSteps,
      trials: dossier.trials,
      measuredVsInferredSummary: dossier.measuredVsInferredSummary,
      deliverySystem: dossier.deliverySystem,
      commonQuestions: dossier.commonQuestions,
      hasDiscrepancy: dossier.hasDiscrepancy,
      dossierDepth: dossier.dossierDepth,
      sourceProvenance: dossier.sourceProvenance,
    },
  }

  const canonical = JSON.stringify(canonicalJsonValue(approvedSurface))
  return `sha256:${createHash('sha256').update(canonical, 'utf8').digest('hex')}`
}
