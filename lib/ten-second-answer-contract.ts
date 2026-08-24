export interface TenSecondAnswerCopy {
  /** The problem or use, written for a reader without medical training. */
  usedFor: string
  /** The strongest result supported by the stored research. */
  whatStudiesFound?: string
  /** The most important unanswered question, failure, or evidence boundary. */
  biggestLimit?: string
  /** A short route or schedule note when it materially helps the reader. */
  practicalNote?: string
  /** A medicine-specific warning that should not be hidden behind disclosure. */
  criticalSafety?: string
}

export const TEN_SECOND_FIELD_WORD_LIMITS = {
  usedFor: 24,
  whatStudiesFound: 30,
  biggestLimit: 26,
  practicalNote: 18,
  criticalSafety: 24,
} as const satisfies Record<keyof TenSecondAnswerCopy, number>

/** Purpose, result, limit, and practical note together; an urgent warning is counted separately. */
export const TEN_SECOND_NORMAL_FIELDS_WORD_LIMIT = 60

export const TEN_SECOND_FORBIDDEN_FIRST_READ =
  /\b(?:adrenal suppression|agonist|antibody|audit|biomarker|biops(?:y|ies)|composite|confidence interval|corneal deposits?|cryoprecipitate|delirium|double-blind|endpoint|hazard ratio|inhibitor|macrovascular|messenger RNA|odds ratio|open-label|percentage points?|phase\s*[1-4IVX]*|placebo|programme|randomi[sz]ed|receptor|recorded|responders?|surrogate|unbound blood concentration)\b|\b(?:CI|DNA|mRNA|NCT\d{8}|PCSK9|siRNA)\b/iu

export function tenSecondWordCount(value: string): number {
  return value.match(/[\p{L}\p{N}]+(?:[’'\-][\p{L}\p{N}]+)*/gu)?.length ?? 0
}
