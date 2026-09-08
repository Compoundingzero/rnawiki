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
 *
 * The words themselves live in `lib/corpus/suppression-labels.ts`, which imports nothing, because
 * the corpus-scale renderer under `scripts/` needs the same table and must not pull the database
 * layer in to get it.
 */
import type { CorpusBlock } from '@/lib/corpus/dossier-page'
import {
  SUPPRESSION_CLASS_LABELS,
  citedSuppressionLabels,
  isUnknownClassOnly,
  unknownClassificationLine,
} from '@/lib/corpus/suppression-labels'

export {
  SUPPRESSION_CLASS_LABELS,
  citedSuppressionLabels,
  isUnknownClassOnly,
  unknownClassificationLine,
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
    facts: [],
    groups: [],
  }
}
