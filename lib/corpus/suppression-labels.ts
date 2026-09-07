/**
 * The reader-facing words for an R2 suppression class (docs/specs/suppression-classes.md,
 * "Ordinary-language labels").
 *
 * `S1`…`S10` are storage tokens. `docs/specs/phase4-generators.md` §7 forbids one in prose, and the
 * Phase 1 reading found the stub path printing them, so the table lives in a module with no imports
 * of its own: the corpus-scale renderer under `scripts/` and the React template under `lib/` both
 * read it, and neither carries a second copy that could drift from the spec.
 */

/** The exact label the spec fixes for each class. */
export const SUPPRESSION_CLASS_LABELS: Readonly<Record<string, string>> = {
  S1: 'a World Health Organization therapeutic class such as cancer medicines, immune suppressants, opioids or general anaesthetics',
  S2: 'a controlled-substance schedule in Singapore, the United States, Australia or the United Kingdom',
  S3: 'a label warning about harm to a developing baby, or a pregnancy-prevention programme',
  S4: 'a list of cytotoxic or otherwise hazardous medicines',
  S5: 'a United States programme that restricts how the medicine is supplied and who may supply it',
  S6: 'a boxed warning, the strongest warning a United States label carries',
  S7: 'a route a clinician administers, such as an injection into a vein or into the spine',
  S8: 'a register record of withdrawal or suspension for a safety reason',
  S9: 'a long-acting injection, an insulin, or another injected hormone adjusted by measurement',
  S10: 'no classification found in the registers checked',
}

/** S1-S9 are the classes a register positively recorded; S10 is the absence of one. */
const CITED_CLASS = /^S[1-9]$/

/**
 * The classes on this record that a register positively stated, in the spec's own order, each as
 * the words a reader sees. Empty where the record carries only S10 or nothing at all.
 */
export function citedSuppressionLabels(classes: readonly string[]): string[] {
  const seen = new Set<string>()
  for (const code of classes) {
    if (CITED_CLASS.test(code) && code in SUPPRESSION_CLASS_LABELS) seen.add(code)
  }
  return [...seen]
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
    .map((code) => SUPPRESSION_CLASS_LABELS[code] as string)
}

/** True where the record's only recorded class is the unknown one. */
export function isUnknownClassOnly(classes: readonly string[]): boolean {
  return classes.length > 0 && classes.every((code) => code === 'S10')
}

/**
 * The single line an S10-only record carries in place of a block: it has no classification to
 * state, and saying so is not the same as saying nothing was found to worry about.
 *
 * It lives here, in the module that imports nothing, because the corpus-scale renderer under
 * `scripts/` writes the same line and must not pull the database layer in to get its words.
 */
export function unknownClassificationLine(): string {
  return 'No classification is recorded for this compound in the registers checked.'
}
