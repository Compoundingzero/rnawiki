/**
 * Deterministic scope gates, applied after retrieval and before anything is shown.
 *
 * Retrieval — lexical or dense — ranks by similarity, and similarity is not identity. Two labels
 * that print nearly the same sentence about two different substances are close in every vector
 * space there is, and a reader handed the wrong substance's half-life has been given a wrong
 * number with a real citation attached. The gates below are the part of the engine that refuses
 * that, and they are ordinary code: exact name matching, a fixed population vocabulary, a fixed
 * formulation vocabulary. No model output reaches a reader without passing them.
 *
 * Two questions end in a refusal rather than a result:
 *
 *  - A name that belongs to more than one record. An ambiguous identity is not an identity, which
 *    is the same rule the record model already runs on. The candidates are named so the person can
 *    ask again.
 *  - A query naming two medicines. RNAWiki holds no medicine-to-medicine relationship and will not
 *    manufacture one by putting two records side by side, so the query is declined with the reason.
 */

import {
  FORMULATION_SCOPES,
  FORMULATION_SCOPE_LABELS,
  FORMULATION_SCOPE_WORDS,
  POPULATION_SCOPES,
  POPULATION_SCOPE_LABELS,
  POPULATION_SCOPE_WORDS,
  type EvidenceReadingUnit,
  type FormulationScope,
  type PopulationScope,
} from '@/lib/semantic/units'

export const SCOPE_GATE_VERSION = 'semantic-scope-gates/v1' as const

/**
 * The longest number of words an indexed medicine name may span in a query.
 *
 * Sized from the corpus rather than guessed: the longest canonical name here is twelve words
 * ("Streptococcus Pneumoniae Type 33f Capsular Polysaccharide Diphtheria Crm197 Protein Conjugate
 * Antigen"), and 73 records run past eight. A cap below the longest name is not a small loss of
 * recall — the long name stops matching as a whole, its component words match OTHER records
 * ("protein" is a record; so is "spice"), and a perfectly clear question about one record is
 * refused as naming two.
 */
const MAX_NAME_WORDS = 16

export interface EntityIndexEntry {
  slug: string
  name: string
  aliases?: readonly string[]
}

export interface EntityIndex {
  /** Normalized name or alias to the canonical slugs that answer to it. */
  bySurface: Map<string, string[]>
  slugs: Set<string>
}

export function normalizeSurface(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, ' ')
    .trim()
}

/**
 * Builds the surface index in two passes, canonical names before aliases.
 *
 * The precedence is not a convenience. 374 alias strings in this corpus are also another record's
 * own slug, so a single pass would make "aspirin" ambiguous because some other record lists it as
 * an alias, and the exact record a person named would stop resolving. A record's own slug and name
 * therefore claim their surface outright; an alias adds an owner only to a surface no record claims
 * as its own. A surface that several records claim canonically, or that several records only alias,
 * stays ambiguous and is refused.
 */
export function buildEntityIndex(entries: readonly EntityIndexEntry[]): EntityIndex {
  const canonical = new Map<string, Set<string>>()
  const aliased = new Map<string, Set<string>>()
  const slugs = new Set<string>()
  for (const entry of entries) {
    slugs.add(entry.slug)
    for (const surface of [entry.slug, entry.name]) {
      const key = normalizeSurface(surface)
      if (key.length < 3) continue
      const owners = canonical.get(key) ?? new Set<string>()
      owners.add(entry.slug)
      canonical.set(key, owners)
    }
  }
  for (const entry of entries) {
    for (const surface of entry.aliases ?? []) {
      const key = normalizeSurface(surface)
      if (key.length < 3 || canonical.has(key)) continue
      const owners = aliased.get(key) ?? new Set<string>()
      owners.add(entry.slug)
      aliased.set(key, owners)
    }
  }
  const bySurface = new Map<string, string[]>()
  for (const [key, owners] of [...canonical, ...aliased]) {
    bySurface.set(key, [...owners].sort())
  }
  return { bySurface, slugs }
}

export interface EntityMention {
  /** The exact words in the query that matched. */
  surface: string
  /** Canonical slugs answering to that surface, sorted. More than one means ambiguous. */
  slugs: string[]
  startWord: number
  endWord: number
}

/**
 * Every indexed name the query contains, longest match first, without overlaps.
 *
 * Longest-first matters: "metformin hydrochloride extended-release" must not be read as the record
 * "metformin" plus stray words when a record carries the longer name.
 */
export function findEntityMentions(
  query: string,
  index: EntityIndex,
  blockedWords: ReadonlySet<number> = new Set(),
): EntityMention[] {
  const words = normalizeSurface(query).split(' ').filter(Boolean)
  const mentions: EntityMention[] = []
  const claimed = new Set<number>(blockedWords)
  for (let span = Math.min(MAX_NAME_WORDS, words.length); span >= 1; span -= 1) {
    for (let start = 0; start + span <= words.length; start += 1) {
      let overlaps = false
      for (let at = start; at < start + span; at += 1) if (claimed.has(at)) overlaps = true
      if (overlaps) continue
      const surface = words.slice(start, start + span).join(' ')
      const owners = index.bySurface.get(surface)
      if (!owners) continue
      for (let at = start; at < start + span; at += 1) claimed.add(at)
      mentions.push({ surface, slugs: owners, startWord: start, endWord: start + span })
    }
  }
  return mentions.sort((left, right) => left.startWord - right.startWord)
}

/** The query with every matched medicine name removed, so scope words are read from the rest. */
export function queryWithoutEntities(query: string, mentions: readonly EntityMention[]): string {
  const words = normalizeSurface(query).split(' ').filter(Boolean)
  const drop = new Set<number>()
  for (const mention of mentions) {
    for (let at = mention.startWord; at < mention.endWord; at += 1) drop.add(at)
  }
  return words.filter((_, index) => !drop.has(index)).join(' ')
}

/**
 * Scope phrases of two or more words, longest first.
 *
 * These are read out of a query BEFORE any name is matched, and the reason is a real collision in
 * this corpus: it holds supplement-ingredient records named "Liver" and "Kidney". Without this
 * step, "studied in liver impairment" names a record and a stray word rather than a population
 * scope, and the gate refuses a perfectly clear question. A phrase from a fixed closed vocabulary
 * is a scope. A bare "liver" is left alone, so the record named Liver stays reachable.
 */
const MULTI_WORD_SCOPE_PHRASES: readonly string[] = [
  ...Object.values(POPULATION_SCOPE_WORDS).flat(),
  ...Object.values(FORMULATION_SCOPE_WORDS).flat(),
]
  .map((word) => normalizeSurface(word))
  .filter((word) => word.includes(' '))
  .sort(
    (left, right) => right.split(' ').length - left.split(' ').length || left.localeCompare(right),
  )

function scopePhraseWords(words: readonly string[]): Set<number> {
  const claimed = new Set<number>()
  for (const phrase of MULTI_WORD_SCOPE_PHRASES) {
    const parts = phrase.split(' ')
    for (let start = 0; start + parts.length <= words.length; start += 1) {
      let matches = true
      for (let at = 0; at < parts.length; at += 1) {
        if (words[start + at] !== parts[at] || claimed.has(start + at)) matches = false
      }
      if (!matches) continue
      for (let at = 0; at < parts.length; at += 1) claimed.add(start + at)
    }
  }
  return claimed
}

function scopesIn<T extends string>(
  text: string,
  vocabulary: Readonly<Record<T, readonly string[]>>,
  order: readonly T[],
): T[] {
  const padded = ` ${text} `
  return order.filter((scope) => vocabulary[scope].some((word) => padded.includes(` ${word} `)))
}

export const SCOPE_REFUSAL_CODES = ['AMBIGUOUS_ENTITY', 'TWO_MEDICINES'] as const
export type ScopeRefusalCode = (typeof SCOPE_REFUSAL_CODES)[number]

export interface ScopeRefusal {
  code: ScopeRefusalCode
  /** Ordinary-language reason, naming the candidates or the two records. */
  explanation: string
  candidates: string[]
}

export interface ScopeGateResult {
  /** Present when the query cannot be answered as asked. `kept` is empty when it is. */
  refusal: ScopeRefusal | null
  /** The one record the query named, when it named exactly one. */
  slug: string | null
  populationScope: PopulationScope | null
  formulationScope: FormulationScope | null
  kept: EvidenceReadingUnit[]
  /** Why each dropped unit was dropped, keyed by unit id. */
  dropped: Map<string, string>
  gateVersion: typeof SCOPE_GATE_VERSION
}

/**
 * Applies the gates to a ranked result set.
 *
 * Order is fixed: identity first, then population, then formulation. Identity applies to every unit,
 * absences included — another record's absence is still another record's. Past that point a unit
 * recording an absence is never dropped: an absence is the answer a scoped question most often has,
 * and dropping it would turn "the sources record nothing for children" into an empty result.
 */
export function applyScopeGates(
  query: string,
  units: readonly EvidenceReadingUnit[],
  index: EntityIndex,
): ScopeGateResult {
  const queryWords = normalizeSurface(query).split(' ').filter(Boolean)
  const mentions = findEntityMentions(query, index, scopePhraseWords(queryWords))
  const named = new Set(
    mentions.flatMap((mention) => (mention.slugs.length === 1 ? mention.slugs : [])),
  )
  const ambiguous = mentions.find((mention) => mention.slugs.length > 1)
  const dropped = new Map<string, string>()

  if (named.size > 1) {
    const candidates = [...named].sort()
    return {
      refusal: {
        code: 'TWO_MEDICINES',
        explanation: `This query names ${candidates.length} records (${candidates.join(', ')}). RNAWiki records each medicine on its own and holds no relationship between any two of them, so it cannot answer a question that spans them. Ask about one record at a time.`,
        candidates,
      },
      slug: null,
      populationScope: null,
      formulationScope: null,
      kept: [],
      dropped,
      gateVersion: SCOPE_GATE_VERSION,
    }
  }

  if (named.size === 0 && ambiguous) {
    return {
      refusal: {
        code: 'AMBIGUOUS_ENTITY',
        explanation: `The name "${ambiguous.surface}" answers to more than one record (${ambiguous.slugs.join(', ')}). Name one of them exactly; a guess here would attach one record's sources to another.`,
        candidates: [...ambiguous.slugs],
      },
      slug: null,
      populationScope: null,
      formulationScope: null,
      kept: [],
      dropped,
      gateVersion: SCOPE_GATE_VERSION,
    }
  }

  const slug = named.size === 1 ? [...named][0]! : null
  const rest = queryWithoutEntities(query, mentions)
  const populations = scopesIn(rest, POPULATION_SCOPE_WORDS, POPULATION_SCOPES)
  const formulations = scopesIn(rest, FORMULATION_SCOPE_WORDS, FORMULATION_SCOPES)
  const populationScope = populations.length === 1 ? populations[0]! : null
  const formulationScope = formulations.length === 1 ? formulations[0]! : null

  const kept = units.filter((unit) => {
    if (slug && unit.canonicalSlug !== slug) {
      dropped.set(unit.id, `belongs to ${unit.canonicalSlug}, not ${slug}`)
      return false
    }
    if (unit.assertion === 'ABSENT') return true
    if (populationScope && unit.populationScope !== populationScope) {
      dropped.set(
        unit.id,
        `not recorded for ${POPULATION_SCOPE_LABELS[populationScope]} (unit scope: ${unit.populationScope ?? 'none'})`,
      )
      return false
    }
    if (formulationScope && unit.formulationScope !== formulationScope) {
      dropped.set(
        unit.id,
        `not recorded for ${FORMULATION_SCOPE_LABELS[formulationScope]} (unit scope: ${unit.formulationScope ?? 'none'})`,
      )
      return false
    }
    return true
  })

  return {
    refusal: null,
    slug,
    populationScope,
    formulationScope,
    kept,
    dropped,
    gateVersion: SCOPE_GATE_VERSION,
  }
}
