import 'dotenv/config'
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { STATE_DIR } from './state'

/**
 * PHASE 5c — measure whether the results block changed how alike the pages read.
 *
 * Variants of every page are derived from one fetched HTML:
 *   before          — the page with the results section and its navigator link removed
 *   after           — the page as it now renders
 *   controlOther    — `before` plus the same volume, as contiguous passages from other pages
 *   controlSelf     — `before` plus the same volume, as contiguous passages from its own text
 *   controlShuffled — `before` plus the same volume, as tokens sampled across the corpus
 *
 * The control is the point. Any addition dilutes overlap simply by making pages longer, so a fall
 * from `before` to `after` proves nothing on its own. It counts only if it beats the fall an equal
 * volume of comparable text produces.
 *
 * Three controls, because no single one is fair on its own. `controlShuffled` was the first attempt
 * and is kept only as a bound: sampling tokens across the corpus produces word salad, which shares
 * almost no five-word sequence with anything, so it breaks positional overlap far more effectively
 * than any real writing could and no genuine content can beat it. `controlOther` is the honest
 * like-for-like — real page language, carrying the repetition real page language carries.
 * `controlSelf` isolates pure length: the page padded with more of itself changes nothing about how
 * distinctive its content is, so a fall there is the length effect alone.
 *
 *   npx tsx scripts/trial-results/phase5-measure.ts [--skip-semantic]
 */

const PAGES_DIR = join(STATE_DIR, 'pages')
const SAMPLE_PATH = join(STATE_DIR, 'phase5-samples.json')
const OUT_PATH = join(STATE_DIR, 'phase5-measurements.json')
const SEED = 'rnawiki/trial-results/overlap-control/v1'
/** 1-in-4 deterministic 5-gram sketch, used only for the 2,431-record nearest-neighbour sweep. */
const SKETCH_MODULUS = 4
/** Evenly spaced 350-word windows embedded per page-variant. */
const SEMANTIC_WINDOWS = 8
/** Pages carried into the semantic sweep; lexical and positional stay exhaustive over all 324. */
const SEMANTIC_PAGES = 150
/** Length of each contiguous run used to build a passage control. */
const PASSAGE_WORDS = 80

// --- text ---------------------------------------------------------------------------------------

function stripTags(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** The visible page text: `<main>` when present, the body otherwise. */
function mainText(html: string): string {
  const main = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html)
  return stripTags(main ? main[1]! : html)
}

/** Remove the added section and the navigator link that points at it. */
function withoutResults(html: string): string {
  return html
    .replace(
      /<section\b[^>]*\bid="trial-results"[\s\S]*?<\/section>\s*(?=<section|<\/div|<\/main)/i,
      ' ',
    )
    .replace(/<li\b[^>]*>\s*<a\b[^>]*href="#trial-results"[\s\S]*?<\/li>/gi, ' ')
    .replace(/<a\b[^>]*href="#trial-results"[\s\S]*?<\/a>/gi, ' ')
}

function tokens(text: string): string[] {
  return text.toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) ?? []
}

function hash32(value: string): number {
  let h = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    h ^= value.charCodeAt(index)
    h = Math.imul(h, 0x01000193)
  }
  return h | 0
}

function fiveGramSet(words: string[], sketch: boolean): Int32Array {
  const seen = new Set<number>()
  for (let index = 0; index + 5 <= words.length; index += 1) {
    const key = hash32(words.slice(index, index + 5).join(' '))
    if (sketch && (key >>> 0) % SKETCH_MODULUS !== 0) continue
    seen.add(key)
  }
  return Int32Array.from([...seen].sort((left, right) => left - right))
}

/** Sorted-array intersection; both inputs are sorted ascending. */
function intersectionSize(left: Int32Array, right: Int32Array): number {
  let i = 0
  let j = 0
  let hits = 0
  while (i < left.length && j < right.length) {
    const a = left[i]!
    const b = right[j]!
    if (a === b) {
      hits += 1
      i += 1
      j += 1
    } else if (a < b) i += 1
    else j += 1
  }
  return hits
}

/** Containment: shared sequences over the smaller page's sequences. */
function containment(left: Int32Array, right: Int32Array): number {
  const smaller = Math.min(left.length, right.length)
  if (smaller === 0) return 0
  return intersectionSize(left, right) / smaller
}

function jaccard(left: Set<string>, right: Set<string>): number {
  if (left.size === 0 && right.size === 0) return 0
  let hits = 0
  const [small, large] = left.size <= right.size ? [left, right] : [right, left]
  for (const value of small) if (large.has(value)) hits += 1
  return hits / (left.size + right.size - hits)
}

function median(values: number[]): number {
  if (values.length === 0) return Number.NaN
  const sorted = [...values].sort((left, right) => left - right)
  const middle = sorted.length >> 1
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2
}

// --- variants -----------------------------------------------------------------------------------

type Variant = 'before' | 'after' | 'controlOther' | 'controlSelf' | 'controlShuffled'

interface PageVariants {
  slug: string
  before: string[]
  after: string[]
  controlOther: string[]
  controlSelf: string[]
  controlShuffled: string[]
  added: number
}

/** A deterministic per-page stream of offsets, so every run draws the same filler. */
function offsets(slug: string): { start: number; step: number } {
  const digest = createHash('sha256').update(`${SEED}|${slug}`).digest()
  return { start: digest.readUInt32BE(0), step: 1 + (digest.readUInt32BE(4) % 9973) }
}

/** Filler made of contiguous runs, so it reads as language and repeats as language repeats. */
function passageFiller(sources: string[][], added: number, slug: string): string[] {
  if (added <= 0 || sources.length === 0) return []
  const { start, step } = offsets(slug)
  const filler: string[] = []
  let index = start
  while (filler.length < added) {
    const source = sources[index % sources.length]!
    if (source.length === 0) {
      index += step
      continue
    }
    const from = (index * 7919) % source.length
    filler.push(...source.slice(from, from + PASSAGE_WORDS))
    index += step
  }
  return filler.slice(0, added)
}

/** The first control attempt, kept only as a bound: corpus-wide token sampling, i.e. word salad. */
function shuffledFiller(pool: string[], added: number, slug: string): string[] {
  if (added <= 0 || pool.length === 0) return []
  const { start, step } = offsets(slug)
  let cursor = start % pool.length
  const filler: string[] = []
  for (let index = 0; index < added; index += 1) {
    filler.push(pool[cursor % pool.length]!)
    cursor += step
  }
  return filler
}

function loadPage(slug: string): { before: string[]; after: string[] } | null {
  const file = join(PAGES_DIR, `${slug}.html.gz`)
  if (!existsSync(file)) return null
  const html = gunzipSync(readFileSync(file)).toString('utf8')
  return {
    after: tokens(mainText(html)),
    before: tokens(mainText(withoutResults(html))),
  }
}

// --- pairwise sweep ------------------------------------------------------------------------------

interface Decomposed {
  lexical: number
  positional: number
  semantic: number | null
}

function decompose(
  pages: PageVariants[],
  variant: Variant,
  embeddings: Map<string, Float32Array> | null,
): Decomposed {
  const words = pages.map((page) => new Set(page[variant]))
  const grams = pages.map((page) => fiveGramSet(page[variant], false))
  const lexical: number[] = []
  const positional: number[] = []
  const semantic: number[] = []
  for (let i = 0; i < pages.length; i += 1) {
    for (let j = i + 1; j < pages.length; j += 1) {
      lexical.push(jaccard(words[i]!, words[j]!))
      positional.push(containment(grams[i]!, grams[j]!))
      if (embeddings) {
        const left = embeddings.get(`${variant}|${pages[i]!.slug}`)
        const right = embeddings.get(`${variant}|${pages[j]!.slug}`)
        if (left && right) {
          let dot = 0
          for (let k = 0; k < left.length; k += 1) dot += left[k]! * right[k]!
          semantic.push(dot)
        }
      }
    }
  }
  return {
    lexical: median(lexical),
    positional: median(positional),
    semantic: semantic.length > 0 ? median(semantic) : null,
  }
}

/** Per-page nearest neighbour: the highest five-gram containment against any other page. */
function nearestNeighbours(pages: PageVariants[], variant: Variant, sketch: boolean): number[] {
  const grams = pages.map((page) => fiveGramSet(page[variant], sketch))
  const best = new Float64Array(pages.length)
  for (let i = 0; i < pages.length; i += 1) {
    for (let j = i + 1; j < pages.length; j += 1) {
      const score = containment(grams[i]!, grams[j]!)
      if (score > best[i]!) best[i] = score
      if (score > best[j]!) best[j] = score
    }
    if (i % 250 === 0 && i > 0)
      console.log(`[phase5c]   nearest neighbour ${variant}: ${i}/${pages.length}`)
  }
  return [...best]
}

async function embed(
  pages: PageVariants[],
  variants: readonly Variant[],
): Promise<Map<string, Float32Array>> {
  const { pipeline, env } = await import('@huggingface/transformers')
  env.cacheDir = '/Users/admin/rnawiki-ingest-data/models'
  env.allowRemoteModels = false
  const extractor = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5')
  const out = new Map<string, Float32Array>()
  let done = 0
  for (const page of pages) {
    for (const variant of variants) {
      // A page is far longer than the model's window, and the results block sits near its end, so
      // embedding only the head would be blind to the change. Every window is embedded and pooled.
      // Evenly spaced windows across the whole page rather than every window: embedding every
      // 350-word window of 324 pages in three variants took hours on CPU. Spacing them keeps the
      // end of the page — where the results block sits — inside the sample, which a head-only or
      // truncated embedding would miss, at a fraction of the cost.
      const words = page[variant]
      const windows = Math.min(SEMANTIC_WINDOWS, Math.max(1, Math.ceil(words.length / 350)))
      const stride = Math.max(1, Math.floor((words.length - 350) / Math.max(1, windows - 1)))
      const chunks: string[] = []
      for (let index = 0; index < windows; index += 1) {
        const start = Math.min(index * stride, Math.max(0, words.length - 350))
        chunks.push(words.slice(start, start + 350).join(' '))
      }
      // Batched: one call per page-variant rather than one per window. Sequential calls made the
      // sweep take hours; the pooled vector is identical either way.
      const pooled = new Float64Array(384)
      for (let start = 0; start < chunks.length; start += 32) {
        const output = await extractor(chunks.slice(start, start + 32), {
          pooling: 'mean',
          normalize: true,
        })
        const data = output.data as Float32Array
        const rows = data.length / 384
        for (let row = 0; row < rows; row += 1) {
          for (let k = 0; k < 384; k += 1) pooled[k]! += data[row * 384 + k]!
        }
      }
      let norm = 0
      for (let k = 0; k < pooled.length; k += 1) norm += pooled[k]! * pooled[k]!
      norm = Math.sqrt(norm) || 1
      const vector = new Float32Array(384)
      for (let k = 0; k < vector.length; k += 1) vector[k] = pooled[k]! / norm
      out.set(`${variant}|${page.slug}`, vector)
    }
    done += 1
    if (done % 25 === 0) console.log(`[phase5c]   embedded ${done}/${pages.length} pages`)
  }
  return out
}

async function main(): Promise<void> {
  const skipSemantic = process.argv.includes('--skip-semantic')
  const samples = JSON.parse(readFileSync(SAMPLE_PATH, 'utf8')) as {
    corpus: string[]
    affected: string[]
    allAffected: string[]
  }

  const cache = new Map<string, { before: string[]; after: string[] }>()
  const load = (slug: string) => {
    if (!cache.has(slug)) {
      const page = loadPage(slug)
      if (page) cache.set(slug, page)
    }
    return cache.get(slug)
  }

  function buildSet(slugs: string[]): PageVariants[] {
    const loaded = slugs.flatMap((slug) => {
      const page = load(slug)
      return page ? [{ slug, ...page }] : []
    })
    const pool = loaded.flatMap((page) => page.before.filter((_, index) => index % 37 === 0))
    return loaded.map((page, index) => {
      const added = Math.max(0, page.after.length - page.before.length)
      // Passages come from every OTHER page, so the control never borrows the page's own wording.
      const others = loaded.filter((_, other) => other !== index).map((other) => other.before)
      return {
        slug: page.slug,
        before: page.before,
        after: page.after,
        added,
        controlOther: [...page.before, ...passageFiller(others, added, page.slug)],
        controlSelf: [...page.before, ...passageFiller([page.before], added, page.slug)],
        controlShuffled: [...page.before, ...shuffledFiller(pool, added, page.slug)],
      }
    })
  }

  const report: Record<string, unknown> = { measuredAt: new Date().toISOString() }

  for (const [name, slugs] of [
    ['affected', samples.affected],
    ['corpus', samples.corpus],
  ] as const) {
    const pages = buildSet(slugs)
    const gained = pages.filter((page) => page.added > 0)
    console.log(
      `[phase5c] ${name}: ${pages.length} pages · ${gained.length} gained text · median words added ${median(gained.map((page) => page.added)) || 0}`,
    )
    const semanticPages = pages.slice(0, SEMANTIC_PAGES)
    const embeddings = skipSemantic
      ? null
      : await embed(semanticPages, ['before', 'after', 'controlOther', 'controlSelf'])
    report[name] = {
      pages: pages.length,
      pagesThatGainedText: gained.length,
      medianWordsAdded: median(gained.map((page) => page.added)) || 0,
      medianWordsBefore: median(pages.map((page) => page.before.length)),
      pairs: (pages.length * (pages.length - 1)) / 2,
      semanticPages: skipSemantic ? 0 : semanticPages.length,
      before: decompose(pages, 'before', null),
      after: decompose(pages, 'after', null),
      controlOther: decompose(pages, 'controlOther', null),
      controlSelf: decompose(pages, 'controlSelf', null),
      controlShuffled: decompose(pages, 'controlShuffled', null),
      semantic: embeddings
        ? {
            before: decompose(semanticPages, 'before', embeddings).semantic,
            after: decompose(semanticPages, 'after', embeddings).semantic,
            controlOther: decompose(semanticPages, 'controlOther', embeddings).semantic,
            controlSelf: decompose(semanticPages, 'controlSelf', embeddings).semantic,
          }
        : null,
      nearestNeighbour: {
        before: median(nearestNeighbours(pages, 'before', false)),
        after: median(nearestNeighbours(pages, 'after', false)),
        controlOther: median(nearestNeighbours(pages, 'controlOther', false)),
        controlSelf: median(nearestNeighbours(pages, 'controlSelf', false)),
      },
    }
    writeFileSync(OUT_PATH, JSON.stringify(report, null, 2))
  }

  // Movement across every affected record, using the sketch so the full sweep is tractable.
  const all = buildSet(samples.allAffected)
  console.log(`[phase5c] all affected: ${all.length} pages · nearest-neighbour sweep`)
  const before = nearestNeighbours(all, 'before', true)
  const after = nearestNeighbours(all, 'after', true)
  const control = nearestNeighbours(all, 'controlOther', true)
  const moved = after.map((value, index) => before[index]! - value)
  report.allAffected = {
    pages: all.length,
    pagesThatGainedText: all.filter((page) => page.added > 0).length,
    method: `five-gram containment, 1-in-${SKETCH_MODULUS} deterministic sketch, nearest neighbour among all ${all.length}`,
    medianNearestNeighbour: {
      before: median(before),
      after: median(after),
      control: median(control),
    },
    belowSeventyBefore: before.filter((value) => value < 0.7).length,
    belowSeventyAfter: after.filter((value) => value < 0.7).length,
    belowSeventyControl: control.filter((value) => value < 0.7).length,
    unmoved: moved.filter((value) => Math.abs(value) < 1e-9).length,
    medianFall: median(moved),
    medianFallControl: median(control.map((value, index) => before[index]! - value)),
  }
  writeFileSync(OUT_PATH, JSON.stringify(report, null, 2))
  console.log(`[phase5c] wrote ${OUT_PATH}`)
  console.log(JSON.stringify(report.allAffected, null, 2))
}

main().catch((error: unknown) => {
  console.error(`[phase5c] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
