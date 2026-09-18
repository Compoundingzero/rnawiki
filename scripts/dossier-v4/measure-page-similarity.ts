import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { drugs } from '@/db/schema'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { CompassPage } from '@/components/dossier/v4/CompassPage'
import { loadDossierV4Inputs } from '@/lib/dossier-v4/load'
import { buildDossierV4 } from '@/lib/dossier-v4/view-model'

/**
 * How much of a medicine page is about that medicine.
 *
 * Two pages of a reference work will always share wording: the section headings, the framing
 * sentences, the safety furniture. That is the template doing its job. What matters is whether
 * anything underneath it is different, and a site where every page reads the same is a site with one
 * page repeated ten thousand times.
 *
 * This renders the real page body — `CompassPage`, the component the route puts inside the document
 * shell — and reads the sentences out of its HTML. The shell itself is left out because it cannot
 * render outside the Next.js compiler (it loads webfonts through `next/font`), and because its
 * contents are the site header, footer and `<head>`: identical on every page by design, so counting
 * them would only pad the boilerplate share with furniture that is not the medicine page's. An earlier version measured the view model instead and was wrong in a way worth recording: the
 * model carries a `reason` string per section that the navigator uses and the page never prints, so
 * twenty-two identical strings per page were counted as reader text. What a reader sees is the only
 * thing worth measuring.
 *
 * So each page's reader text is split into three parts, by counting how many other pages print the
 * same sentence:
 *
 *   - **boilerplate** — a sentence printed on more than half of all pages. Headings, the page
 *     promise, the not-medical-advice line. Fixed furniture, and not a defect.
 *   - **shared** — a sentence printed on more than one page but fewer than half. Mostly absence
 *     lines: "Not recorded", "No reviewer has signed it off". These are the ones worth watching,
 *     because a page made mostly of them is a page with nothing in it.
 *   - **specific** — a sentence printed on exactly one page in the corpus. This medicine's own.
 *
 * The fix for a low specific share is never to reword the shared sentences per drug. That is filler
 * with extra steps and it would defeat the measurement rather than the problem. It is either to
 * fetch the missing data, or to change the template so the medicine's own data drives the page.
 *
 * The repository compiles JSX with `jsx: preserve`, which leaves it for the Next.js compiler and
 * leaves a standalone `tsx` run with no JSX runtime at all. `tsconfig.render-scripts.json` is the
 * same configuration with the automatic runtime switched on, for the two scripts that render
 * components outside Next:
 *
 *   npx tsx --tsconfig tsconfig.render-scripts.json \
 *     scripts/dossier-v4/measure-page-similarity.ts --sample 600 --label before
 */

interface Args {
  sample: number
  label: string
  concurrency: number
  out: string
}

function parseArgs(argv: readonly string[]): Args {
  const args: Args = {
    sample: 600,
    label: 'run',
    concurrency: 6,
    out: 'data/dossier-v4/page-similarity',
  }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    const next = argv[index + 1]
    if (flag === '--sample' && next) ((args.sample = Number.parseInt(next, 10)), (index += 1))
    else if (flag === '--label' && next) ((args.label = next), (index += 1))
    else if (flag === '--concurrency' && next)
      ((args.concurrency = Number.parseInt(next, 10)), (index += 1))
    else if (flag === '--out' && next) ((args.out = next), (index += 1))
  }
  return args
}

/**
 * The sentences a reader meets, taken out of the served HTML.
 *
 * Script, style and the JSON-LD block are removed first: they are machine text, and the structured
 * data repeats the visible text almost exactly, so leaving them in would double-count everything.
 * Block-level tags become sentence breaks, because a heading and the paragraph under it are not one
 * sentence however the markup runs them together.
 */
function readerSentences(rendered: string): string[] {
  /*
   * The audit layer is cut off here, and the cut is the point of the measurement rather than a
   * convenience. "The full record, for auditing" prints every stored source row, registry
   * identifier and trial number for that medicine, so it is unique per medicine by construction —
   * counting it would score a page as highly specific on the strength of a list of accession
   * numbers behind a closed disclosure. What is being asked is whether the prose a reader meets is
   * about this medicine, so the prose a reader meets is what is counted.
   */
  const technical = rendered.indexOf('id="technical-record"')
  const html = technical > 0 ? rendered.slice(0, technical) : rendered
  /*
   * A closed `<details>` is a fold, not a paragraph, and its body is not prose a reader meets.
   *
   * This was counted, and it is what made the page look three times longer than the first read. On
   * one thin record "Nothing in this record points to this reason." appeared eleven times in the
   * document and zero times in front of a reader, because all eleven sit behind a single closed
   * summary reading "Other reasons RNAWiki checked and found nothing for (11)". Measured against the
   * served HTML, 24 `<details>` elements rendered and none carried `open`.
   *
   * The summary is kept: it is visible, and it is what names what the fold holds.
   */
  const visibleHtml = html.replace(
    /(<details(?![^>]*\bopen\b)[^>]*>\s*<summary>[\s\S]*?<\/summary>)[\s\S]*?<\/details>/giu,
    '$1',
  )
  const visible = visibleHtml
    .replace(/<script\b[\s\S]*?<\/script>/giu, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/giu, ' ')
    .replace(
      /<\/?(?:h[1-6]|p|li|section|div|td|th|dt|dd|summary|figcaption|br)\b[^>]*>/giu,
      '\u0001',
    )
    .replace(/<[^>]+>/gu, ' ')
    .replace(/&nbsp;/gu, ' ')
    .replace(/&amp;/gu, '&')
    .replace(/&lt;/gu, '<')
    .replace(/&gt;/gu, '>')
    .replace(/&quot;/gu, '"')
    .replace(/&#(\d+);/gu, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)))

  return visible
    .split('\u0001')
    .flatMap((block) => block.split(/(?<=[.!?])\s+/u))
    .map((sentence) => sentence.replace(/\s+/gu, ' ').trim())
    .filter((sentence) => sentence.length >= 12)
}

interface PageMeasure {
  slug: string
  sentences: string[]
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))

  const rows = await db
    .select({ slug: drugs.slug })
    .from(drugs)
    // A stable pseudo-random sample: the same slugs before and after, so the two runs compare.
    .orderBy(sql`md5(${drugs.slug})`)
    .limit(args.sample)

  process.stdout.write(`rendering ${rows.length} pages\n`)

  const pages: PageMeasure[] = []
  let cursor = 0
  const worker = async (): Promise<void> => {
    for (;;) {
      const row = rows[cursor]
      if (!row) return
      cursor += 1
      try {
        const inputs = await loadDossierV4Inputs(row.slug)
        if (!inputs) continue
        const html = renderToStaticMarkup(
          createElement(CompassPage, { corpus: inputs.corpus, model: buildDossierV4(inputs) }),
        )
        pages.push({ slug: row.slug, sentences: readerSentences(html) })
      } catch (error) {
        if (process.env.SIMILARITY_DEBUG) console.error(row.slug, error)
        // A page that cannot render is a separate defect; the corpus validation reports it.
      }
      if (pages.length % 100 === 0) process.stdout.write(`${pages.length}/${rows.length}\n`)
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, args.concurrency) }, worker))

  const frequency = new Map<string, number>()
  for (const page of pages) {
    for (const sentence of new Set(page.sentences)) {
      frequency.set(sentence, (frequency.get(sentence) ?? 0) + 1)
    }
  }

  const half = pages.length / 2
  const shares = pages.map((page) => {
    const unique = [...new Set(page.sentences)]
    let boilerplate = 0
    let shared = 0
    let specific = 0
    for (const sentence of unique) {
      const count = frequency.get(sentence) ?? 1
      if (count > half) boilerplate += 1
      else if (count > 1) shared += 1
      else specific += 1
    }
    const total = Math.max(1, unique.length)
    return {
      slug: page.slug,
      sentences: unique.length,
      boilerplate: boilerplate / total,
      shared: shared / total,
      specific: specific / total,
    }
  })

  const mean = (pick: (share: (typeof shares)[number]) => number): number =>
    shares.reduce((sum, share) => sum + pick(share), 0) / Math.max(1, shares.length)

  const sortedSpecific = shares.map((share) => share.specific).sort((a, b) => a - b)
  const percentile = (fraction: number): number =>
    sortedSpecific[
      Math.min(sortedSpecific.length - 1, Math.floor(fraction * sortedSpecific.length))
    ] ?? 0

  const summary = {
    label: args.label,
    pages: pages.length,
    meanBoilerplateShare: Number(mean((share) => share.boilerplate).toFixed(4)),
    meanSharedShare: Number(mean((share) => share.shared).toFixed(4)),
    meanSpecificShare: Number(mean((share) => share.specific).toFixed(4)),
    specificShareDistribution: {
      p10: Number(percentile(0.1).toFixed(4)),
      p25: Number(percentile(0.25).toFixed(4)),
      median: Number(percentile(0.5).toFixed(4)),
      p75: Number(percentile(0.75).toFixed(4)),
      p90: Number(percentile(0.9).toFixed(4)),
    },
    pagesWithNoSpecificSentence: shares.filter((share) => share.specific === 0).length,
    meanSpecificSentencesPerPage: Number(
      (
        shares.reduce((sum, share) => sum + share.specific * share.sentences, 0) /
        Math.max(1, shares.length)
      ).toFixed(1),
    ),
    meanSentencesPerPage: Number(
      (
        shares.reduce((sum, share) => sum + share.sentences, 0) / Math.max(1, shares.length)
      ).toFixed(1),
    ),
    /** The sentences printed on the most pages, so a reader of the report can see the furniture. */
    mostRepeatedSentences: [...frequency.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([sentence, count]) => ({ count, sentence: sentence.slice(0, 110) })),
  }

  const outPath = resolve(`${args.out}-${args.label}.json`)
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, `${JSON.stringify({ summary, shares }, null, 2)}\n`)
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
}

void main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await closeDatabasePool()
  })
