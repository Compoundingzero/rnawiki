import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { drugs } from '@/db/schema'
import { loadDossierV4Inputs } from '@/lib/dossier-v4/load'
import { buildDossierV4 } from '@/lib/dossier-v4/view-model'

/**
 * Which slot on the page is repeating itself.
 *
 * The similarity measurement says how much of a page is that medicine's own. It does not say where
 * the sameness lives, and the fix depends entirely on that: a heading repeating across every page is
 * the template working, an answer slot repeating across every page is either a template that ignores
 * the medicine's data or a medicine with no data. This attributes every sentence to the slot that
 * produced it and reports, per slot, how many distinct values it took across the sample.
 *
 * A slot with one distinct value across 600 medicines is furniture. A slot that could differ and
 * does not is the defect.
 *
 *   npx tsx scripts/dossier-v4/diagnose-page-sameness.ts --sample 600
 */

const sample = Number.parseInt(process.argv[process.argv.indexOf('--sample') + 1] ?? '600', 10)

interface SlotValue {
  slot: string
  value: string
}

function slotValues(model: ReturnType<typeof buildDossierV4>): SlotValue[] {
  const out: SlotValue[] = [
    { slot: 'hero.simpleAction', value: model.hero.simpleAction.text },
    { slot: 'hero.actionDetail', value: model.hero.actionDetail.text },
    { slot: 'hero.whyPeopleCare', value: model.hero.whyPeopleCare.text },
    { slot: 'hero.strongestGoalResult', value: model.hero.strongestGoalResult.text },
    { slot: 'hero.principalUncertainty', value: model.hero.principalUncertainty.text },
    { slot: 'hero.bodyLocation', value: model.hero.bodyLocation.text },
    { slot: 'hero.immediateChange', value: model.hero.immediateChange.text },
    { slot: 'hero.outcomeType', value: model.hero.outcomeType },
    { slot: 'hero.supervision', value: model.hero.supervision },
  ]
  for (const section of model.sections) {
    out.push({ slot: `section:${section.id}.reason`, value: section.reason })
  }
  for (const card of model.humanResults.cards) {
    out.push({
      slot: `humanResult:${card.id}`,
      value: `${card.population} · ${card.absoluteResult}`,
    })
  }
  for (const entry of model.unknowns.entries) {
    out.push({ slot: 'unknown.reason', value: entry.reason })
    out.push({ slot: 'unknown.evidenceNeeded', value: entry.evidenceNeeded })
  }
  for (const node of model.journey.nodes) {
    out.push({ slot: `journey:${node.id}`, value: node.label })
  }
  for (const question of model.nextQuestions) {
    out.push({ slot: 'nextQuestion', value: question.question })
  }
  return out.filter((entry) => (entry.value ?? '').trim().length > 0)
}

async function main(): Promise<void> {
  const rows = await db
    .select({ slug: drugs.slug })
    .from(drugs)
    .orderBy(sql`md5(${drugs.slug})`)
    .limit(sample)

  const perSlot = new Map<string, Map<string, number>>()
  let pages = 0
  let cursor = 0

  const worker = async (): Promise<void> => {
    for (;;) {
      const row = rows[cursor]
      if (!row) return
      cursor += 1
      const inputs = await loadDossierV4Inputs(row.slug)
      if (!inputs) continue
      pages += 1
      for (const { slot, value } of slotValues(buildDossierV4(inputs))) {
        const counts = perSlot.get(slot) ?? new Map<string, number>()
        counts.set(value, (counts.get(value) ?? 0) + 1)
        perSlot.set(slot, counts)
      }
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker))

  const report = [...perSlot.entries()]
    .map(([slot, counts]) => {
      const total = [...counts.values()].reduce((sum, count) => sum + count, 0)
      const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
      const top = sorted[0]
      return {
        slot,
        pagesShowingIt: total,
        distinctValues: counts.size,
        /** 1.0 means every page prints the same words in this slot. */
        topValueShare: Number(((top?.[1] ?? 0) / Math.max(1, total)).toFixed(3)),
        topValue: (top?.[0] ?? '').slice(0, 120),
      }
    })
    .sort((a, b) => b.topValueShare - a.topValueShare || b.pagesShowingIt - a.pagesShowingIt)

  const outPath = resolve('data/dossier-v4/page-sameness-by-slot.json')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, `${JSON.stringify({ pages, report }, null, 2)}\n`)

  process.stdout.write(`${pages} pages\n\n`)
  process.stdout.write('share  distinct  pages  slot · most common value\n')
  for (const row of report) {
    process.stdout.write(
      `${row.topValueShare.toFixed(3)}  ${String(row.distinctValues).padStart(6)}  ${String(
        row.pagesShowingIt,
      ).padStart(5)}  ${row.slot} · ${row.topValue}\n`,
    )
  }
}

void main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await closeDatabasePool()
  })
