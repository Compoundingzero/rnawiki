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
 * no reader-facing meaning to recover. It is replaced with a phrase instead.
 *
 * Deliberately narrower than the detection pattern in the v3 copy contract, which allows spaces
 * inside a key. Over-matching is harmless when you are only flagging text; here it rewrites it, and
 * the greedy form turned "The record K1:MU72812GK0 holds this." into a sentence with three words
 * missing. A key that does contain a space, such as one built from a two-word substance name,
 * loses only its trailing word to the reader, and that word is ordinary language rather than a key.
 */
const CANONICAL_KEY = /\b(?:K[1-4]|COMBO):[A-Za-z0-9:_-]+/g

/**
 * A label record identifier, as the interaction lines carry it: `(label, set_id <uuid>)`. There is
 * no reader meaning to recover from a set identifier, so the phrase is replaced rather than
 * humanised — "set id d1cda4f7…" would be worse than the raw form. Found on seven pages by the
 * corpus validation, inside interaction text that reaches the reader layer.
 */
const LABEL_SET_ID = /,?\s*set_id\s+[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi

export function humaniseReaderText(input: string): HumanisedText {
  if (!input) return { text: input, replaced: [] }
  const replaced: string[] = []
  let text = input.replace(CANONICAL_KEY, (match) => {
    replaced.push(match.trim())
    return 'an internal record id'
  })
  text = text.replace(LABEL_SET_ID, (match) => {
    replaced.push(match.trim())
    return ''
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
