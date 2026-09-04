/**
 * The supervision statement (disclosure spec item 6; R2).
 *
 * A suppressed compound leads with the regulator's classification as the first question block, not
 * as a banner over the page: the reader meets it in the same shape as every other answer, in
 * ordinary words, with the register that states it. Nothing here decides that a page is suppressed
 * and nothing here writes the classification; the block is the derivation's own `supervision`
 * question, rendered with the neutral warning tint the colour budget allows.
 */
import type { CorpusBlock } from '@/lib/corpus/dossier-page'
import { QuestionBlock } from './QuestionBlock'

export function SupervisionBlock({ block, name }: { block: CorpusBlock; name: string }) {
  if (block.block !== 'supervision') return null
  return <QuestionBlock block={block} name={name} />
}
