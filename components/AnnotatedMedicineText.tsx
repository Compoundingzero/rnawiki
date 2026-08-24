import type { MedicineTextContextMatch } from '@/lib/annotated-medicine-text'

export interface AnnotatedMedicineTextProps {
  as?: 'p' | 'span'
  className?: string
  contexts: readonly MedicineTextContextMatch[]
  text: string
  testId?: string
}

/**
 * Renders stored medicine wording as ordinary text. The contextual hover/tap experiment was
 * retired: first-screen language must now be understandable without an interaction.
 *
 * `contexts` remains in the temporary compatibility signature while the detailed dossier is
 * migrated away from its former annotation plumbing. It is deliberately ignored.
 */
export function AnnotatedMedicineText({
  contexts: _contexts,
  text,
  as: Element = 'p',
  className,
  testId,
}: AnnotatedMedicineTextProps) {
  return (
    <Element className={className} data-testid={testId}>
      {text}
    </Element>
  )
}
