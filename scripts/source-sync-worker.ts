import 'dotenv/config'

import { closeDatabasePool, db } from '@/db'
import { runBackgroundFreshness } from '@/lib/background/source-freshness'
import { runDueClinicalTrialsSourceBatch } from '@/lib/evidence/clinical-trials-source-sync'
import { queryDueClinicalTrialsSources } from '@/lib/evidence/clinical-trials-source-sync-drizzle'
import { monitorClinicalTrialsSource } from '@/lib/evidence/source-monitor-drizzle'

/**
 * The one private Railway cron entry point. Both workloads are deterministic, bounded and write
 * observations/review work only. Neither one authors or rewrites medical content.
 */
async function main(): Promise<void> {
  try {
    const clinicalTrials = await runDueClinicalTrialsSourceBatch({
      limit: 25,
      concurrency: 4,
      dependencies: {
        queryDueSources: (input) => queryDueClinicalTrialsSources(db, input),
        monitorSource: (input) => monitorClinicalTrialsSource({ database: db, ...input }),
      },
    })

    // A failed ClinicalTrials item is still persisted before this continues. Background source
    // freshness is independent review coverage and must not be skipped because one registry item
    // needs its configured retry.
    const recordedBackground = await runBackgroundFreshness({
      limit: 25,
      concurrency: 4,
      maxRuntimeMs: 20 * 60_000,
    })

    process.stdout.write(
      `${JSON.stringify({
        schemaVersion: 'rnawiki-source-sync/v1',
        clinicalTrials: {
          counts: clinicalTrials.counts,
          startedAt: clinicalTrials.startedAt,
          finishedAt: clinicalTrials.finishedAt,
        },
        recordedBackground: {
          currentSourceCount: recordedBackground.currentSourceCount,
          selectedSourceCount: recordedBackground.selectedSourceCount,
          processedSourceCount: recordedBackground.processedSourceCount,
          bindingCount: recordedBackground.bindingCount,
          fetchCounts: recordedBackground.fetchCounts,
          assertionCounts: recordedBackground.assertionCounts,
          candidatesEmitted: recordedBackground.candidatesEmitted,
          stoppedAtRuntimeBound: recordedBackground.stoppedAtRuntimeBound,
        },
      })}\n`,
    )

    // Drift and temporary background-source unavailability are handled review/operational states.
    // A genuine ClinicalTrials monitor failure remains a batch failure so its existing retry runs.
    if (clinicalTrials.counts.failed > 0) process.exitCode = 1
  } finally {
    await closeDatabasePool()
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Source sync failed.'
  process.stderr.write(`[source-sync.failed] ${message.slice(0, 2_000)}\n`)
  process.exitCode = 1
})
