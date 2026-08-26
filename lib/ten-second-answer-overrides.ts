import { TEN_SECOND_ANSWER_OVERRIDES_A } from '@/lib/ten-second-answer-overrides-a'
import { TEN_SECOND_ANSWER_OVERRIDES_B } from '@/lib/ten-second-answer-overrides-b'
import {
  LEGACY_TEN_SECOND_ANSWER_FINGERPRINT_VERSION,
  legacyTenSecondAnswerFingerprint,
  type LegacyTenSecondEvidenceDossier,
} from '@/lib/legacy-ten-second-provenance'
import { LEGACY_TEN_SECOND_APPROVED_FINGERPRINTS } from '@/lib/ten-second-answer-evidence-fingerprints'
import type {
  LegacyTenSecondAnswerEvidenceBinding,
  TenSecondAnswerCopy,
} from '@/lib/ten-second-answer-contract'

/**
 * Human-authored first-screen copy for curated legacy dossiers. The detailed stored wording,
 * measurements, and citations remain untouched and available below the first screen.
 */
export const TEN_SECOND_ANSWER_OVERRIDES: Readonly<Record<string, TenSecondAnswerCopy>> = {
  ...TEN_SECOND_ANSWER_OVERRIDES_A,
  ...TEN_SECOND_ANSWER_OVERRIDES_B,
}

export interface BoundLegacyTenSecondAnswer {
  copy: TenSecondAnswerCopy
  evidenceBinding: LegacyTenSecondAnswerEvidenceBinding
}

/**
 * Resolves authored legacy copy only when that exact copy and the complete current medical/source
 * surface still match one reviewed corpus fingerprint. Accepting the dossier—not a slug and a
 * caller-supplied hash—prevents pairing one medicine's approval with another record or wording.
 */
export function tenSecondAnswerOverride(
  dossier: LegacyTenSecondEvidenceDossier,
): BoundLegacyTenSecondAnswer | undefined {
  const copy = TEN_SECOND_ANSWER_OVERRIDES[dossier.id]
  if (!copy) return undefined

  const fingerprint = legacyTenSecondAnswerFingerprint(dossier, copy)
  if (!LEGACY_TEN_SECOND_APPROVED_FINGERPRINTS.has(fingerprint)) return undefined

  return {
    copy,
    evidenceBinding: {
      kind: 'legacy_answer_and_evidence_fingerprint',
      version: LEGACY_TEN_SECOND_ANSWER_FINGERPRINT_VERSION,
      fingerprint,
    },
  }
}
