import 'dotenv/config'

import { runDueClinicalTrialsSourceBatch } from '@/lib/evidence/clinical-trials-source-sync'
import { parseClinicalTrialsSourceSyncArgs } from '@/lib/evidence/clinical-trials-source-sync-cli'
import { queryDueClinicalTrialsSources } from '@/lib/evidence/clinical-trials-source-sync-drizzle'
import { monitorClinicalTrialsSource } from '@/lib/evidence/source-monitor-drizzle'

async function main(): Promise<void> {
  const options = parseClinicalTrialsSourceSyncArgs(process.argv.slice(2))
  const { closeDatabasePool, db } = await import('@/db')
  try {
    const summary = await runDueClinicalTrialsSourceBatch({
      ...options,
      dependencies: {
        queryDueSources: (input) => queryDueClinicalTrialsSources(db, input),
        monitorSource: (input) => monitorClinicalTrialsSource({ database: db, ...input }),
      },
    })
    process.stdout.write(`${JSON.stringify(summary)}\n`)
    if (summary.counts.failed > 0) process.exitCode = 1
  } finally {
    await closeDatabasePool()
  }
}

main().catch((error: unknown) => {
  const candidate = error as { code?: unknown; message?: unknown }
  const fatal = {
    schemaVersion: 'clinical-trials-source-sync/v1',
    fatal: true,
    errorCode:
      typeof candidate?.code === 'string' && candidate.code.trim()
        ? candidate.code.trim().slice(0, 120)
        : 'SOURCE_SYNC_FATAL',
    errorMessage:
      typeof candidate?.message === 'string' && candidate.message.trim()
        ? candidate.message.trim().slice(0, 2_000)
        : 'ClinicalTrials.gov source sync failed without an error message.',
  }
  process.stdout.write(`${JSON.stringify(fatal)}\n`)
  process.exitCode = 1
})
