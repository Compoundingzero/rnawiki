import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { ALL_RECORDED_BACKGROUND } from '../seed-data/background'
import { authoredStrings, findForbiddenPhrases } from '@/lib/agents/core/types'
import type { AgentCorpusEntry } from '@/lib/agents/core/types'
import { AGENT_RUN_SEED, DATASET_AGENTS } from './registry'

/**
 * Runs every dataset agent over the recorded corpus and writes each run to disk.
 *
 * Output goes to JSON under `data/agents/` rather than into the database, so a change in the corpus
 * shows up as a diff a person can read. That is the whole reason these are files: an agent whose
 * output changed silently would be indistinguishable from an agent whose method changed.
 *
 * The run date is supplied rather than read from the clock inside any agent, and the seed is fixed,
 * so the same corpus always produces the same output. Re-running proves it.
 *
 * Usage:
 *   npx tsx scripts/agents/run-agents.ts [--date=YYYY-MM-DD] [--check]
 *
 * `--check` runs every agent and reports, without writing anything.
 */

function medicineName(slug: string): string {
  return slug.replace(/-/gu, ' ')
}

async function main() {
  const checkOnly = process.argv.includes('--check')
  const dateFlag = process.argv.find((value) => value.startsWith('--date='))
  const runDate = dateFlag
    ? dateFlag.slice('--date='.length)
    : new Date().toISOString().slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(runDate)) {
    console.error(`[agents] --date must be YYYY-MM-DD, got "${runDate}"`)
    process.exit(1)
  }

  const corpus: AgentCorpusEntry[] = Object.entries(ALL_RECORDED_BACKGROUND).map(
    ([slug, background]) => ({ slug, name: medicineName(slug), background }),
  )
  console.log(`[agents] ${corpus.length} records · seed ${AGENT_RUN_SEED} · run date ${runDate}`)

  const outDir = join(process.cwd(), 'data', 'agents')
  if (!checkOnly) mkdirSync(outDir, { recursive: true })

  let violations = 0
  let queued = 0

  for (const agent of DATASET_AGENTS) {
    const run = agent.run({ corpus, seed: AGENT_RUN_SEED, runDate })

    // The boundary is checked on every run, not only in tests, because the corpus changes and a
    // string built from corpus content could cross a line no fixture would have caught.
    const offending = authoredStrings({
      output: run.output,
      queue: run.queue,
      caveats: run.caveats,
    }).flatMap((text) => findForbiddenPhrases(text).map((pattern) => `${pattern} :: ${text}`))
    if (offending.length > 0) {
      violations += offending.length
      console.error(`[agents] ${agent.name} produced forbidden phrasing:`)
      for (const entry of offending.slice(0, 5)) console.error(`    ${entry.slice(0, 200)}`)
    }

    queued += run.queue?.length ?? 0
    const serialized = `${JSON.stringify(run, null, 2)}\n`
    console.log(
      `[agents] ${agent.name.padEnd(38)} v${run.version.padEnd(8)} ${String(run.coverage.used).padStart(5)}/${run.coverage.considered} used · ${String(run.queue?.length ?? 0).padStart(4)} queued · ${(serialized.length / 1024).toFixed(0)} KB`,
    )
    if (!checkOnly) {
      writeFileSync(join(outDir, `${agent.name}.json`), serialized)
    }
  }

  console.log(`[agents] ${queued} item(s) routed to people · ${violations} boundary violation(s)`)
  if (violations > 0) process.exit(1)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
