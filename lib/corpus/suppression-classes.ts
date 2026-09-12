/**
 * The reader-facing words for an R2 suppression class (docs/specs/suppression-classes.md,
 * "Ordinary-language labels", as §15(1) of docs/specs/phase4-generators.md fixed them).
 *
 * `S1`…`S10` are storage tokens. The corpus records them on the page row, with the evidence and
 * the source that put each of them there, so the derivation can decide which sections exist; a
 * reader never meets one. Everything a page says about its own classification is built here, from
 * the classes the suppression pass recorded, the evidence rows it recorded beside them, and
 * nothing else: this module reads no label text, judges no compound and never softens a class into
 * a milder one. A class the spec does not list is dropped rather than printed, because printing it
 * would put a token on the page, and a class whose evidence carries no source produces no clause.
 *
 * The words themselves live in `lib/corpus/suppression-labels.ts`, which imports nothing, because
 * the corpus-scale renderer under `scripts/` needs the same clauses and must not pull the database
 * layer in to get them.
 */
import type { CorpusBlock } from '@/lib/corpus/dossier-page'
import {
  SUPPRESSION_CLASS_LABELS,
  citedSuppressionLabels,
  isUnknownClassOnly,
  supervisionClauses,
  unknownClassificationLine,
  type SuppressionEvidence,
  type SupervisionClause,
  type SupervisionContext,
} from '@/lib/corpus/suppression-labels'

export {
  SUPPRESSION_CLASS_LABELS,
  citedSuppressionLabels,
  isUnknownClassOnly,
  supervisionClauses,
  unknownClassificationLine,
}
export type { SuppressionEvidence, SupervisionClause, SupervisionContext }

/** The supervision block's question, worded exactly as the derivation words it on a full page. */
export function supervisionQuestion(name: string): string {
  return `Why does ${name} carry a supervision requirement?`
}

/**
 * The block's body: one sentence per recorded class, each naming that class's own evidence and the
 * source that stated it (§15(1)). Neither the sentences nor their order is written per page: the
 * order is the class order the spec fixes, and each sentence is assembled from a recorded value.
 */
export function supervisionParagraphs(
  classes: readonly string[],
  evidence: readonly SuppressionEvidence[],
  context: SupervisionContext = {},
): string[] {
  return supervisionClauses(classes, evidence, context).map((clause) => clause.text)
}

/**
 * The supervision block for a record that has no question rows to carry one.
 *
 * A record with questions already has this block: the derivation puts the supervision question
 * first and the loader builds it like any other. A record below the stub floor has no question
 * rows at all, so the block is assembled here from the same recorded classes, the same evidence
 * and the same words. `undefined` where there is nothing to state — an unsuppressed record, one
 * whose only class is the unknown one, or one whose recorded classes carry no evidence with a
 * source, which is the case §15(1) says renders no clause.
 */
export function supervisionBlock(
  displayName: string,
  classes: readonly string[],
  evidence: readonly SuppressionEvidence[],
  context: SupervisionContext = {},
): CorpusBlock | undefined {
  const paragraphs = supervisionParagraphs(classes, evidence, context)
  if (paragraphs.length === 0) return undefined
  return {
    id: 'q1',
    badge: 'Q1',
    ordinal: 0,
    block: 'supervision',
    template: 'supervision',
    question: supervisionQuestion(displayName),
    // §16(1): one list item per recorded class, in the order S1–S9, exactly as the question-block
    // path paints them. A record below the stub floor states the same clauses in the same shape.
    paragraphs: paragraphs.map((sentence) => ({
      text: sentence,
      interpretation: false,
      listItem: true as const,
    })),
    facts: [],
    groups: [],
  }
}
