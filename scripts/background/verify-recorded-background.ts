import 'dotenv/config'

import { closeDatabasePool } from '@/db'
import { runBackgroundFreshness } from '@/lib/background/source-freshness'

/**
 * Bounded durable recorded-background freshness worker.
 *
 * It re-derives exact source-to-assertion bindings from the current database envelopes, schedules
 * the least recently attempted source identities, persists every fetch outcome, and evaluates an
 * assertion only after a successful exact fetch. Confirmed drift creates a human review candidate;
 * it never rewrites a medicine, chooses a source, or changes a conclusion. Operational failures are
 * history, not drift, and do not make the command fail merely because a source was unreachable.
 */

function integerFlag(name: string, fallback: number): number {
  const index = process.argv.indexOf(name)
  if (index < 0) return fallback
  const value = Number(process.argv[index + 1])
  if (!Number.isInteger(value)) throw new TypeError(`${name} requires an integer.`)
  return value
}

function assertKnownArguments(): void {
  const flagsWithValues = new Set(['--limit', '--concurrency', '--max-runtime-minutes'])
  for (let index = 2; index < process.argv.length; index += 1) {
    const argument = process.argv[index]!
    if (!flagsWithValues.has(argument)) throw new TypeError(`Unknown argument: ${argument}`)
    if (!process.argv[index + 1]) throw new TypeError(`${argument} requires a value.`)
    index += 1
  }
}

async function main(): Promise<void> {
  assertKnownArguments()
  const limit = integerFlag('--limit', 25)
  const concurrency = integerFlag('--concurrency', 4)
  const maxRuntimeMinutes = integerFlag('--max-runtime-minutes', 20)
  const summary = await runBackgroundFreshness({
    limit,
    concurrency,
    maxRuntimeMs: maxRuntimeMinutes * 60_000,
  })

  console.log(
    `[background.verify] sources current=${summary.currentSourceCount} ` +
      `selected=${summary.selectedSourceCount} processed=${summary.processedSourceCount} ` +
      `bindings=${summary.bindingCount} boundedStop=${summary.stoppedAtRuntimeBound}`,
  )
  console.log(`[background.fetch] ${JSON.stringify(summary.fetchCounts)}`)
  console.log(
    `[background.assertion] ${JSON.stringify(summary.assertionCounts)} ` +
      `reviewCandidates=${summary.candidatesEmitted}`,
  )
}

void main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Background freshness failed.'
    console.error(`[background.verify.failed] ${message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await closeDatabasePool()
  })
