/**
 * The reader-facing words for an R2 suppression class (docs/specs/suppression-classes.md,
 * "Ordinary-language labels").
 *
 * `S1`…`S10` are storage tokens. The corpus records them on the page row so the derivation can
 * decide which sections exist; a reader never meets one. Everything a page says about its own
 * classification is built here, from the classes the suppression pass recorded and from nothing
 * else: this module reads no label text, judges no compound and never softens a class into a
 * milder one. A class the spec does not list is dropped rather than printed, because printing it
 * would put a token on the page.
 */
import type { CorpusBlock } from '@/lib/corpus/dossier-page'

/** The exact label the spec fixes for each class. */
export const SUPPRESSION_CLASS_LABELS: Readonly<Record<string, string>> = {
  S1: 'a World Health Organization therapeutic class such as cancer medicines, immune suppressants, opioids or general anaesthetics',
  S2: 'a controlled-substance schedule in the United States, the United Kingdom or Singapore',
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

/** The supervision block's question, worded exactly as the derivation words it on a full page. */
export function supervisionQuestion(name: string): string {
  return `Why does ${name} carry a supervision requirement?`
}

/**
 * The block's body: what the registers put this record in, then what the record therefore does not
 * hold. Both sentences are assembled from the recorded classes; neither is written per page.
 */
export function supervisionParagraphs(name: string, labels: readonly string[]): string[] {
  if (labels.length === 0) return []
  const single = labels.length === 1
  const count = single ? 'one classification given' : `${labels.length} classifications given`
  return [
    `A register records ${name} in ${count} under medical supervision: ${labels.join('; ')}.`,
    `Because of ${single ? 'that classification' : 'those classifications'}, this record holds no ` +
      'bioavailability, self-experiment design or time-to-signal section.',
  ]
}

/**
 * The single line an S10-only record carries in place of a block: it has no classification to
 * state, and saying so is not the same as saying nothing was found to worry about.
 */
export function unknownClassificationLine(): string {
  return 'No classification is recorded for this compound in the registers checked.'
}

/**
 * The supervision block for a record that has no question rows to carry one.
 *
 * A record with questions already has this block: the derivation puts the supervision question
 * first and the loader builds it like any other. A record below the stub floor has no question
 * rows at all, so the block is assembled here from the same recorded classes and the same words.
 * `undefined` where there is nothing to state — an unsuppressed record, or one whose only class is
 * the unknown one.
 *
 * Neither sentence is an interpretation and neither carries an anchor: the classification is a
 * property of the record rather than of one stored source row, and manufacturing a citation for it
 * would be exactly the untruth the anchoring rule exists to prevent.
 */
export function supervisionBlock(
  displayName: string,
  classes: readonly string[],
): CorpusBlock | undefined {
  const labels = citedSuppressionLabels(classes)
  if (labels.length === 0) return undefined
  return {
    id: 'q1',
    badge: 'Q1',
    ordinal: 0,
    block: 'supervision',
    template: 'supervision',
    question: supervisionQuestion(displayName),
    paragraphs: supervisionParagraphs(displayName, labels).map((sentence) => ({
      text: sentence,
      interpretation: false,
    })),
    groups: [],
  }
}
