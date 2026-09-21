/*
 * Sweep every medicine page and report what per-drug content it actually carries.
 *
 * The question this answers: does a page hold anything specific to its own substance, or does it
 * render a shape with nothing in it? It builds the view model only and never renders HTML, so it can
 * cover the whole corpus rather than a sample.
 *
 *   npx tsx --tsconfig tsconfig.render-scripts.json scripts/dossier-v4/sweep-drug-pages.ts [limit] [concurrency]
 *
 * Writes data/dossier-v4/drug-page-sweep.ndjson and prints counts.
 */
import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { loadDossierV4Inputs } from '@/lib/dossier-v4/load'
import { buildDossierV4 } from '@/lib/dossier-v4/view-model'

interface Row {
  slug: string
  tier: number | null
  indexable: boolean | null
}

interface Finding {
  slug: string
  tier: number | null
  empty: boolean
  score: number
  sectionsRendered: number
  sectionsTotal: number
  cards: number
  snapshots: number
  journeyNodes: number
  mechanismSteps: number
  measurementMode: string
  /** Reasons the record can answer at all. Empty means it cannot. */
  answerRoutes: string[]
}

const limit = Number(process.argv[2] ?? '0')
const concurrency = Math.max(1, Number(process.argv[3] ?? '6'))

function answerRoutes(m: ReturnType<typeof buildDossierV4>, mechanismSteps: number): string[] {
  const routes: string[] = []
  if (m.humanResults.trialSnapshots.length > 0) routes.push('registry-trial')
  if (m.hero.strongestGoalResult.origin === 'reviewed_claim') routes.push('reviewed-claim')
  if (m.hero.simpleAction.origin === 'stored_source') routes.push('label-sentence')
  if (mechanismSteps > 0) routes.push('authored-mechanism')
  if (m.humanResults.cards.length > 0) routes.push('curated-card')
  return routes
}

async function main(): Promise<void> {
  const result = await db.execute(sql`
    select d.slug as slug, p.tier as tier, p.indexable as indexable
    from drugs d
    left join corpus_pages p on p.slug = d.slug
    where d.slug is not null
    order by d.slug
  `)
  const all = result.rows as unknown as Row[]
  const rows = limit > 0 ? all.slice(0, limit) : all
  process.stdout.write(`pages to sweep: ${rows.length} of ${all.length}\n`)

  const findings: Finding[] = []
  let cursor = 0
  let done = 0
  async function worker(): Promise<void> {
    for (;;) {
      const index = cursor++
      if (index >= rows.length) return
      const row = rows[index]
      if (!row) continue
      try {
        const inputs = await loadDossierV4Inputs(row.slug)
        if (!inputs) continue
        const model = buildDossierV4(inputs)
        const mechanismSteps = (inputs.legacyRecord?.mechanismSteps ?? []).length
        const shown = model.sections.filter((section) => section.state !== 'no_qualifying_evidence')
        findings.push({
          slug: row.slug,
          tier: row.tier ?? null,
          empty: model.substance.empty,
          score: model.substance.score,
          sectionsRendered: shown.length,
          sectionsTotal: model.sections.length,
          cards: model.humanResults.cards.length,
          snapshots: model.humanResults.trialSnapshots.length,
          journeyNodes: model.journey.nodes.length,
          mechanismSteps,
          measurementMode: model.measurement.mode,
          answerRoutes: answerRoutes(model, mechanismSteps),
        })
      } catch (error) {
        process.stdout.write(`  FAILED ${row.slug}: ${String(error).slice(0, 120)}\n`)
      }
      done += 1
      if (done % 250 === 0) process.stdout.write(`  ${done}/${rows.length}\n`)
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()))

  findings.sort((a, b) => a.slug.localeCompare(b.slug))
  const out = resolve('data/dossier-v4/drug-page-sweep.ndjson')
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, findings.map((finding) => JSON.stringify(finding)).join('\n') + '\n')

  const total = findings.length
  const empty = findings.filter((finding) => finding.empty).length
  const noRoute = findings.filter((finding) => finding.answerRoutes.length === 0).length
  const noSections = findings.filter(
    (finding) => finding.empty && finding.journeyNodes === 0 && finding.cards === 0,
  ).length
  process.stdout.write(`\nswept ${total} pages -> ${out}\n`)
  process.stdout.write(
    `  substance.empty true          : ${empty} (${((100 * empty) / total).toFixed(1)}%)\n`,
  )
  process.stdout.write(`  no route to any answer at all  : ${noRoute}\n`)
  process.stdout.write(`  empty AND no mechanism/card    : ${noSections}\n`)

  const byRoute = new Map<string, number>()
  for (const finding of findings) {
    for (const route of finding.answerRoutes) byRoute.set(route, (byRoute.get(route) ?? 0) + 1)
  }
  process.stdout.write('  pages by available route:\n')
  for (const [route, count] of [...byRoute.entries()].sort((a, b) => b[1] - a[1])) {
    process.stdout.write(`    ${route.padEnd(18)} ${count}\n`)
  }
}

await main()
await closeDatabasePool()
