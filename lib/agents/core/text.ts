/**
 * TF-IDF vectorisation of recorded mechanism text.
 *
 * The corpus is roughly 1,200 mechanism statements totalling on the order of 10^5 tokens. That is
 * the right size for TF-IDF with a truncated SVD and several orders of magnitude too small to
 * train word embeddings on — word2vec and fastText need 10^8-10^9 tokens before their vectors mean
 * anything, and fitting them here would produce confident-looking noise. Sparse term vectors it is.
 *
 * The vocabulary, document frequencies and the resulting basis are all corpus-dependent: adding a
 * medicine shifts every vector. They are therefore frozen into the agent's output and versioned
 * with it, so a cluster a person reviewed can be reproduced exactly rather than approximately.
 */

/**
 * English function words plus the boilerplate that regulatory prose repeats in every document.
 * Terms like "mechanism", "action" and "clinical" appear in nearly every mechanism statement and
 * carry no discriminative signal, so leaving them in mostly measures document length.
 */
const STOPWORDS = new Set([
  'the',
  'and',
  'with',
  'that',
  'for',
  'are',
  'its',
  'which',
  'not',
  'from',
  'has',
  'have',
  'been',
  'this',
  'these',
  'those',
  'was',
  'were',
  'may',
  'can',
  'also',
  'other',
  'both',
  'than',
  'such',
  'when',
  'while',
  'after',
  'before',
  'into',
  'through',
  'via',
  'per',
  'been',
  'being',
  'their',
  'they',
  'them',
  'there',
  'where',
  'what',
  'how',
  'who',
  'whom',
  'whose',
  'all',
  'any',
  'each',
  'more',
  'most',
  'some',
  'only',
  'own',
  'same',
  'very',
  'but',
  'nor',
  'because',
  'mechanism',
  'action',
  'clinical',
  'pharmacology',
  'known',
  'unknown',
  'thought',
  'believed',
  'presumed',
  // The hedge labels use when a mechanism is not settled: "the precise mechanism is not fully
  // understood but may involve ...". Without these, medicines group by the shape of the hedge
  // rather than by what follows it, which produced one group held together by "exerts, precise,
  // involve" whose members otherwise had nothing in common.
  'precise',
  'exact',
  'exerts',
  'exert',
  'involve',
  'involves',
  'involved',
  'fully',
  'understood',
  'unclear',
  'elucidated',
  'remains',
  'postulated',
  'hypothesized',
  'hypothesised',
  'contribute',
  'contributes',
  'responsible',
  'attributed',
  'primarily',
  'partly',
  'appears',
  'appear',
  'shown',
  'demonstrated',
  'studies',
  'study',
  'vitro',
  'vivo',
  'human',
  'humans',
  'patient',
  'patients',
  'drug',
  'medicine',
  'product',
  'tablet',
  'dose',
  'doses',
  'treatment',
  'therapy',
  'therapeutic',
  'effect',
  'effects',
  'activity',
  'concentration',
  'concentrations',
  'following',
  'administration',
  'approximately',
  'about',
  'however',
  'although',
])

/** Tokens shorter than this are noise; longer than this are usually artefacts of bad spacing. */
const MIN_TOKEN = 3
const MAX_TOKEN = 40

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z0-9-]{2,}/gu) ?? []).filter(
    (token) => token.length >= MIN_TOKEN && token.length <= MAX_TOKEN && !STOPWORDS.has(token),
  )
}

export interface TfIdfModel {
  /** Term to its column index. Frozen with the model. */
  vocabulary: Map<string, number>
  /** Inverse document frequency per column, aligned to `vocabulary`. */
  idf: Float64Array
  documentCount: number
  minDocumentFrequency: number
}

export interface SparseVector {
  indices: Int32Array
  values: Float64Array
}

/**
 * Fits the vocabulary and IDF over a document set.
 *
 * Terms below `minDocumentFrequency` are dropped: a term appearing in one document cannot group
 * anything, and keeping the long tail of them inflates the vocabulary by an order of magnitude for
 * no gain in structure.
 */
export function fitTfIdf(documents: readonly string[], minDocumentFrequency = 3): TfIdfModel {
  const documentFrequency = new Map<string, number>()
  for (const document of documents) {
    for (const term of new Set(tokenize(document))) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1)
    }
  }
  const kept = [...documentFrequency.entries()]
    .filter(([, count]) => count >= minDocumentFrequency)
    .map(([term]) => term)
    .sort()
  const vocabulary = new Map(kept.map((term, index) => [term, index]))
  const idf = new Float64Array(kept.length)
  for (let index = 0; index < kept.length; index += 1) {
    // Smoothed IDF, as in scikit-learn: a term in every document still gets a positive weight
    // rather than exactly zero, which keeps vectors from collapsing on small corpora.
    const frequency = documentFrequency.get(kept[index]!)!
    idf[index] = Math.log((1 + documents.length) / (1 + frequency)) + 1
  }
  return { vocabulary, idf, documentCount: documents.length, minDocumentFrequency }
}

/** Sublinear term frequency, IDF weighting, L2 normalisation. Empty documents give empty vectors. */
export function transform(model: TfIdfModel, document: string): SparseVector {
  const counts = new Map<number, number>()
  for (const term of tokenize(document)) {
    const column = model.vocabulary.get(term)
    if (column !== undefined) counts.set(column, (counts.get(column) ?? 0) + 1)
  }
  const indices = [...counts.keys()].sort((left, right) => left - right)
  const values = indices.map((column) => (1 + Math.log(counts.get(column)!)) * model.idf[column]!)
  const norm = Math.hypot(...values)
  return {
    indices: Int32Array.from(indices),
    values: Float64Array.from(norm > 0 ? values.map((value) => value / norm) : values),
  }
}

/** Cosine similarity of two L2-normalised sparse vectors, by merge over sorted indices. */
export function cosine(left: SparseVector, right: SparseVector): number {
  let total = 0
  let l = 0
  let r = 0
  while (l < left.indices.length && r < right.indices.length) {
    const li = left.indices[l]!
    const ri = right.indices[r]!
    if (li === ri) {
      total += left.values[l]! * right.values[r]!
      l += 1
      r += 1
    } else if (li < ri) l += 1
    else r += 1
  }
  return total
}

/** The highest-weighted terms in a vector, which is how a cluster describes itself. */
export function topTerms(
  model: TfIdfModel,
  vector: SparseVector,
  limit: number,
): Array<{ term: string; weight: number }> {
  const byIndex = new Map([...model.vocabulary].map(([term, index]) => [index, term]))
  return [...vector.indices]
    .map((column, position) => ({
      term: byIndex.get(column) ?? String(column),
      weight: vector.values[position]!,
    }))
    .sort((left, right) => right.weight - left.weight)
    .slice(0, limit)
}
