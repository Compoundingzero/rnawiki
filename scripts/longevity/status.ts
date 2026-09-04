/** Print the longevity model's resumable state; `--json` prints the whole file; `--migrate` rewrites it in the current schema. Never fetches. */
import { loadState, saveState } from './state.js'

async function main(): Promise<void> {
  const state = await loadState()
  if (process.argv.includes('--migrate')) await saveState(state)
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(state, null, 2))
    return
  }
  console.log(`phase: ${state.phase}`)
  console.log(`corpus: ${state.corpus}`)
  console.log(`completed: ${state.completed.join(', ') || 'none'}`)
  console.log(`awaiting: ${state.awaiting ?? 'nothing'}`)
  console.log(`cursor: ${JSON.stringify(state.cursor)}`)
  console.log(`counts: ${JSON.stringify(state.counts)}`)
  console.log(`batches: ${state.batches.length}`)
  console.log(`legal gate entries: ${Object.keys(state.legalGate).length}`)
  console.log(`updated_at: ${state.updated_at}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
