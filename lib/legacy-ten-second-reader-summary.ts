import type { LegacyTenSecondAnswerEvidenceBinding } from '@/lib/ten-second-answer-contract'
import { tenSecondAnswerOverride } from '@/lib/ten-second-answer-overrides'
import {
  buildLegacyReaderSummary,
  type LegacyReaderSummaryInput,
  type ReaderSummaryView,
} from '@/lib/public-medicine-language'
import type { DrugDossier } from '@/lib/types'

/**
 * Applies static copy only after `tenSecondAnswerOverride` verifies the complete live legacy
 * evidence surface. The ordinary deterministic builder remains available for unbound records and
 * tests, but it cannot select an authored override from a slug alone.
 */
export function buildLegacyDossierReaderSummary(
  drug: DrugDossier,
  input: LegacyReaderSummaryInput,
): ReaderSummaryView {
  const generated = buildLegacyReaderSummary(input)
  const bound = tenSecondAnswerOverride(drug)
  if (!bound) return generated

  const authored = bound.copy
  const whatStudiesFound = authored.whatStudiesFound ?? generated.whatStudiesFound
  const biggestLimit = authored.biggestLimit ?? generated.biggestLimit

  const summary: ReaderSummaryView = {
    ...generated,
    usedFor: authored.usedFor,
    ...(whatStudiesFound ? { whatStudiesFound } : {}),
    ...(biggestLimit ? { biggestLimit } : {}),
    ...(authored.practicalNote ? { practicalNote: authored.practicalNote } : {}),
    ...(authored.criticalSafety ? { criticalSafety: authored.criticalSafety } : {}),
    authoredEvidenceBinding: bound.evidenceBinding satisfies LegacyTenSecondAnswerEvidenceBinding,
    takeaway: whatStudiesFound ?? generated.takeaway,
    simplified: Boolean(whatStudiesFound),
  }
  // An authored override intentionally decides whether the extra route/schedule line belongs on
  // the first screen. Do not reintroduce a generated note when the reviewed override omitted it.
  if (!authored.practicalNote) delete summary.practicalNote
  return summary
}
