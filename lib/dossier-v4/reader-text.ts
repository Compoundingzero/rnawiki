/**
 * Keep internal keys out of the reader layer.
 *
 * "Internal database keys must never render publicly" is one of the defects this rebuild is not
 * allowed to reintroduce, and the v3 baseline leaks five of them on the creatine page today. Most
 * come from the pipeline, but some are in the curated prose itself: an inclisiran trial note reads
 * "`endpointMet: false` here means no result exists yet", which is a curator explaining a field
 * name to another curator inside a sentence a reader now sees.
 *
 * The fix is not to drop the sentence — that would delete a real qualification about a trial that
 * has not reported — and not to rewrite it, because nothing here may rewrite medical prose. It is
 * to render the key in words, using the same humanising the shared generator already applies to
 * stored keys. `endpointMet` becomes `endpoint met`. Direction, magnitude, population, certainty
 * and scope are all untouched; only the token changes shape.
 *
 * Every replacement is reported so an operator can fix the stored text at source.
 */
import { findInternalKeys } from '@/lib/dossier-v3/copy-contract'
import { humanizeStoredKey } from '@/lib/dossier-v3/stored-keys'

export interface HumanisedText {
  text: string
  /** The keys that were rendered in words, for the operator queue. */
  replaced: string[]
}

/**
 * A canonical identity key is never humanised into anything a reader should see, because there is
 * no reader-facing meaning to recover. It is removed along with any punctuation holding it up.
 */
const CANONICAL_KEY = /\b(?:K[1-4]|COMBO):[A-Za-z0-9:_ -]+/g

export function humaniseReaderText(input: string): HumanisedText {
  if (!input) return { text: input, replaced: [] }
  const replaced: string[] = []
  let text = input.replace(CANONICAL_KEY, (match) => {
    replaced.push(match.trim())
    return 'an internal record id'
  })
  // Longest first, so replacing a short key never breaks a longer one that contains it.
  const hits = [...new Set(findInternalKeys(text).map((hit) => hit.match))].sort(
    (left, right) => right.length - left.length,
  )
  for (const hit of hits) {
    const readable = humanizeStoredKey(hit)
    if (!readable || readable === hit) continue
    replaced.push(hit)
    text = text.split(hit).join(readable)
  }
  return { text, replaced }
}

/** The common case: the text alone. */
export function readerText(input: string | null | undefined): string {
  return input ? humaniseReaderText(input).text : ''
}

/** Humanise a list and report every key found across it. */
export function humaniseReaderList(inputs: readonly string[]): HumanisedText & { items: string[] } {
  const items: string[] = []
  const replaced: string[] = []
  for (const input of inputs) {
    const result = humaniseReaderText(input)
    items.push(result.text)
    replaced.push(...result.replaced)
  }
  return { text: items.join(' '), items, replaced: [...new Set(replaced)] }
}
