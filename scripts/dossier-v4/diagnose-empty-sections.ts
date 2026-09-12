import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { sql } from 'drizzle-orm'

import { CompassPage } from '@/components/dossier/v4/CompassPage'
import { closeDatabasePool, db } from '@/db'
import { drugs } from '@/db/schema'
import { loadDossierV4Inputs } from '@/lib/dossier-v4/load'
import { buildDossierV4 } from '@/lib/dossier-v4/view-model'

/**
 * What an empty section costs the reader.
 *
 * The page renders twenty-two sections for every medicine. A section with a recorded answer prints
 * that answer; a section with nothing prints its heading, its standing explanation of what the
 * section is for, and a line saying nothing was found. The third kind is the problem: it is the same
 * two hundred words on ten thousand pages, and a reader scrolling past twenty of them learns only
 * that the page is mostly furniture.
 *
 * This renders the page, splits it at the section boundaries, and reports per section how many
 * characters it prints and how often those characters are identical to the previous medicine's. A
 * section whose text is byte-for-byte the same across the sample is printing no information at all.
 *
 *   npx tsx --tsconfig tsconfig.render-scripts.json \
 *     scripts/dossier-v4/diagnose-empty-sections.ts --sample 300
 */

const sample = Number.parseInt(process.argv[process.argv.indexOf('--sample') + 1] ?? '300', 10)

function sectionTexts(html: string): Map<string, string> {
  const out = new Map<string, string>()
  const pattern =
    /<section\b[^>]*\bid="([^"]+)"[\s\S]*?(?=<section\b|<\/div>\s*<\/div>\s*<\/div>\s*$)/giu
  for (const match of html.matchAll(pattern)) {
    const id = match[1]
    if (!id) continue
    const text = match[0]
      .replace(/<[^>]+>/gu, ' ')
      .replace(/&[a-z]+;/giu, ' ')
      .replace(/\s+/gu, ' ')
      .trim()
    out.set(id, text)
  }
  return out
}

async function main(): Promise<void> {
  const rows = await db
    .select({ slug: drugs.slug })
    .from(drugs)
    .orderBy(sql`md5(${drugs.slug})`)
    .limit(sample)

  const perSection = new Map<string, Map<string, number>>()
  let pages = 0
  let cursor = 0

  const worker = async (): Promise<void> => {
    for (;;) {
      const row = rows[cursor]
      if (!row) return
      cursor += 1
      const inputs = await loadDossierV4Inputs(row.slug)
      if (!inputs) continue
      const html = renderToStaticMarkup(
        createElement(CompassPage, { corpus: inputs.corpus, model: buildDossierV4(inputs) }),
      )
      pages += 1
      for (const [id, text] of sectionTexts(html)) {
        const counts = perSection.get(id) ?? new Map<string, number>()
        counts.set(text, (counts.get(text) ?? 0) + 1)
        perSection.set(id, counts)
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker))

  const report = [...perSection.entries()]
    .map(([id, counts]) => {
      const total = [...counts.values()].reduce((sum, count) => sum + count, 0)
      const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
      const top = sorted[0]
      const meanChars =
        [...counts.entries()].reduce((sum, [text, count]) => sum + text.length * count, 0) /
        Math.max(1, total)
      return {
        id,
        pages: total,
        distinctRenderings: counts.size,
        identicalShare: Number(((top?.[1] ?? 0) / Math.max(1, total)).toFixed(3)),
        meanCharacters: Math.round(meanChars),
        /** Characters printed per page that carry no medicine-specific information. */
        wastedCharacters: Math.round(meanChars * ((top?.[1] ?? 0) / Math.max(1, total))),
      }
    })
    .sort((a, b) => b.wastedCharacters - a.wastedCharacters)

  const outPath = resolve('data/dossier-v4/empty-section-cost.json')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, `${JSON.stringify({ pages, report }, null, 2)}\n`)

  process.stdout.write(`${pages} pages\n\n`)
  process.stdout.write('identical  distinct  chars  wasted  section\n')
  for (const row of report) {
    process.stdout.write(
      `${row.identicalShare.toFixed(3).padStart(9)}  ${String(row.distinctRenderings).padStart(
        8,
      )}  ${String(row.meanCharacters).padStart(5)}  ${String(row.wastedCharacters).padStart(
        6,
      )}  ${row.id}\n`,
    )
  }
  const wasted = report.reduce((sum, row) => sum + row.wastedCharacters, 0)
  const total = report.reduce((sum, row) => sum + row.meanCharacters, 0)
  process.stdout.write(
    `\n${wasted} of ${total} characters per page are identical across medicines (${(
      (wasted / Math.max(1, total)) *
      100
    ).toFixed(1)}%)\n`,
  )
}

void main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await closeDatabasePool()
  })
