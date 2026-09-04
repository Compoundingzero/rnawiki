/**
 * Record the orchestrator's confirmation (or correction) of legal-gate decisions, after the
 * independent skeptic pass. Input: a JSON file mapping site key → { decision, reason }.
 * Writes the decision into state.sites[key].legalGate and mirrors it into legal-gate.json.
 *
 *   npx tsx scripts/design-study/confirm-gate.ts --file data/design-study/legal-gate-confirmations.json
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { loadState, updateSite, DATA_DIR, type LegalDecision } from './state.js'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

interface Confirmation {
  decision: LegalDecision
  reason: string
}

async function main(): Promise<void> {
  const file = arg('file')
  if (!file) throw new Error('--file <json> is required')
  const confirmations = JSON.parse(await fs.readFile(file, 'utf8')) as Record<string, Confirmation>
  const state = await loadState()
  const gatePath = path.join(DATA_DIR, 'legal-gate.json')
  const gate = JSON.parse(await fs.readFile(gatePath, 'utf8')) as {
    sites: Array<Record<string, unknown> & { key: string }>
  }
  const stamp = new Date().toISOString().slice(0, 10)
  for (const [key, c] of Object.entries(confirmations)) {
    const site = state.sites[key]
    if (!site?.legalGate) throw new Error(`${key} has no legal gate record to confirm`)
    const proposed = site.legalGate.decision
    const reason = `${c.reason} — confirmed by the orchestrator on ${stamp} after the independent skeptic check${proposed !== c.decision ? ` (gate proposed "${proposed}")` : ''}`
    await updateSite(key, {
      legalGate: { ...site.legalGate, decision: c.decision, reason },
      status:
        c.decision === 'blocked' ? 'blocked' : site.status === 'blocked' ? 'pending' : site.status,
    })
    const entry = gate.sites.find((s) => s.key === key)
    if (entry) {
      entry.decision = c.decision
      entry.reason = reason
      entry.proposedDecision = entry.proposedDecision ?? proposed
    }
    console.log(`${key}: ${proposed} -> ${c.decision}`)
  }
  await fs.writeFile(gatePath, `${JSON.stringify(gate, null, 2)}\n`, 'utf8')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
