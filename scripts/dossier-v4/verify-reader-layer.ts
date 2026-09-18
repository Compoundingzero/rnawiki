import 'dotenv/config'
import { sql } from 'drizzle-orm'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { CompassPage } from '@/components/dossier/v4/CompassPage'
import { closeDatabasePool, db } from '@/db'
import { drugs } from '@/db/schema'
import { loadDossierV4Inputs } from '@/lib/dossier-v4/load'
import { buildDossierV4 } from '@/lib/dossier-v4/view-model'

/**
 * What a reader actually meets on a medicine page, and whether any machinery reached them.
 *
 * Two things are checked, because both are reader-facing claims the page makes about itself.
 *
 * 1. **Machinery in the reader layer.** A reader must never meet an internal code. The page has a
 *    gate for exactly this (`no_raw_internal_fields`), so a string like "slug and display name
 *    present" or "A fixed RNAWiki sentence" reaching the reader layer means the check and the page
 *    disagree.
 * 2. **How long the page is when the record is empty.** A record with nothing in it should be a
 *    short page. Counted here per section, so the furniture is visible as furniture.
 *
 * Reader text is the served HTML with the body of every closed `<details>` removed, because a fold
 * is not prose a reader meets. The audit layer is cut at `id="technical-record"` for the same
 * reason the similarity measure cuts it: it is unique per medicine by construction.
 *
 *   npx tsx --tsconfig tsconfig.render-scripts.json \
 *     scripts/dossier-v4/verify-reader-layer.ts 1-2-hexanediol creatine-monohydrate
 */

const OLD_STRINGS = [
  'A fixed RNAWiki sentence',
  'slug and display name present',
  'Canonical metadata present',
]

function readerText(rendered: string): string {
  const technical = rendered.indexOf('id="technical-record"')
  let html = technical > 0 ? rendered.slice(0, technical) : rendered
  let previous = ''
  while (previous !== html) {
    previous = html
    html = html.replace(
      /(<details(?![^>]*\bopen\b)[^>]*>\s*<summary>[\s\S]*?<\/summary>)[\s\S]*?<\/details>/giu,
      '$1',
    )
  }
  return html
}

function count(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1
}

function readerSentences(html: string): number {
  const text = html
    .replace(
      /<\/?(?:h[1-6]|p|li|section|div|td|th|dt|dd|summary|figcaption|br|ul|ol|dl)\b[^>]*>/giu,
      '\u0001',
    )
    .replace(/<[^>]+>/gu, ' ')
  let total = 0
  for (const block of text.split('\u0001')) {
    for (const sentence of block.split(/(?<=[.!?])\s+/u)) {
      if (sentence.replace(/\s+/gu, ' ').trim().length >= 12) total += 1
    }
  }
  return total
}

async function main(): Promise<void> {
  const slugs = process.argv.slice(2)
  if (slugs.length === 0) throw new Error('pass at least one slug')

  for (const slug of slugs) {
    const rows = await db
      .select({ slug: drugs.slug })
      .from(drugs)
      .where(sql`${drugs.slug} = ${slug}`)
      .limit(1)
    if (rows.length === 0) {
      process.stdout.write(`${slug}\n  NOT FOUND in this database\n\n`)
      continue
    }
    const inputs = await loadDossierV4Inputs(slug)
    if (!inputs) {
      process.stdout.write(`${slug}\n  no inputs\n\n`)
      continue
    }
    const model = buildDossierV4(inputs)
    const rendered = renderToStaticMarkup(
      createElement(CompassPage, { corpus: inputs.corpus, model }),
    )
    const reader = readerText(rendered)

    const leaks = OLD_STRINGS.filter((needle) => reader.includes(needle))
    process.stdout.write(`${slug}\n`)
    process.stdout.write(`  record empty (substance.empty) : ${model.substance.empty}\n`)
    process.stdout.write(`  publication state             : ${model.publication.state}\n`)
    process.stdout.write(`  sections in the served page   : ${count(rendered, '<section')}\n`)
    process.stdout.write(`  in-page nav links             : ${count(rendered, 'href="#')}\n`)
    process.stdout.write(`  reader-facing sentences       : ${readerSentences(reader)}\n`)
    /*
     * The names a reader would recognise on the box. MedlinePlus gives these a top-level section, so
     * whether they reach a reader here is a value question rather than a formatting one.
     */
    const soldAs =
      /<strong>Sold as\.<\/strong>([^<]*)</u.exec(reader)?.[1]?.replace(/&amp;/gu, '&').trim() ?? ''
    process.stdout.write(`  names a reader sees           : ${soldAs || 'none'}\n`)
    process.stdout.write(`  purpose-rail chips            : ${count(rendered, 'data-purpose=')}\n`)
    process.stdout.write(
      `  machinery in reader layer     : ${leaks.length === 0 ? 'none' : leaks.join(' | ')}\n`,
    )
    process.stdout.write('\n')
  }

  await closeDatabasePool()
}

await main()
