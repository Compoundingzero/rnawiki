import { TEN_SECOND_ANSWER_OVERRIDES_A } from '@/lib/ten-second-answer-overrides-a'
import { TEN_SECOND_ANSWER_OVERRIDES_B } from '@/lib/ten-second-answer-overrides-b'
import type { TenSecondAnswerCopy } from '@/lib/ten-second-answer-contract'

/**
 * Human-authored first-screen copy for curated legacy dossiers. The detailed stored wording,
 * measurements, and citations remain untouched and available below the first screen.
 */
export const TEN_SECOND_ANSWER_OVERRIDES: Readonly<Record<string, TenSecondAnswerCopy>> = {
  ...TEN_SECOND_ANSWER_OVERRIDES_A,
  ...TEN_SECOND_ANSWER_OVERRIDES_B,
}

export function tenSecondAnswerOverride(
  medicineSlug: string | undefined,
): TenSecondAnswerCopy | undefined {
  return medicineSlug ? TEN_SECOND_ANSWER_OVERRIDES[medicineSlug] : undefined
}
