'use client'

import { PlainLanguageText, type PlainLanguageTextProps } from '@/components/InlineTermExplanation'
import { annotateMedicineText, type MedicineTextContextMatch } from '@/lib/annotated-medicine-text'

export interface AnnotatedMedicineTextProps extends Omit<
  PlainLanguageTextProps,
  'children' | 'parts'
> {
  contexts: readonly MedicineTextContextMatch[]
  text: string
}

/**
 * Adds definitions to exact, explicitly supplied phrases while preserving every character of the
 * stored sentence. It does not guess terms and it never rewrites medical wording.
 */
export function AnnotatedMedicineText({
  contexts,
  text,
  ...textProps
}: AnnotatedMedicineTextProps) {
  const parts = annotateMedicineText(text, contexts)
  if (!parts.some((part) => typeof part !== 'string')) {
    const { as: Element = 'p', className, testId } = textProps
    return (
      <Element className={className} data-testid={testId}>
        {text}
      </Element>
    )
  }

  return <PlainLanguageText {...textProps} parts={parts} />
}
