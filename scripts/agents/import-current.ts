import 'dotenv/config'

import { loadCurrentAgentPackage } from './load-current-package'

async function main(): Promise<void> {
  const loaded = loadCurrentAgentPackage()
  console.log(
    `[agent-import] validated ${loaded.manifest.artifacts.length} current runs, ${loaded.manifest.totals.candidates} candidates, corpus ${loaded.manifest.corpusDigest.slice(0, 12)}`,
  )
  if (process.argv.includes('--check')) return

  const [{ closeDatabasePool }, { importCurrentAgentPackage, MissingAgentSubjectsError }] =
    await Promise.all([import('@/db'), import('@/lib/agents/persistence')])
  try {
    const report = await importCurrentAgentPackage(loaded)
    console.log(
      `[agent-import] ${report.runs} runs · ${report.candidatesInPackage} candidates · ${report.candidatesInserted} new occurrences · ${report.membershipsInserted} new memberships · ${report.currentPointersChanged} current pointers changed · ${report.decisionsInvented} decisions invented`,
    )
    const byAgent = new Map<string, number>()
    for (const row of report.counts) {
      byAgent.set(row.agent, (byAgent.get(row.agent) ?? 0) + row.count)
    }
    for (const [agent, count] of [...byAgent].sort()) {
      console.log(`[agent-import] ${agent.padEnd(38)} ${String(count).padStart(4)} active`)
    }
  } catch (error) {
    if (error instanceof MissingAgentSubjectsError) {
      console.error(
        `[agent-import] refusing activation: ${error.missingSubjects.length} medicine subject(s) are missing`,
      )
    }
    throw error
  } finally {
    await closeDatabasePool()
  }
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
