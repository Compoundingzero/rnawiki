/** Print the corpus-20k resumable state. `--json` prints everything. Never fetches. */
import { loadState, saveState } from './state.js'

const state = await loadState()
if (process.argv.includes('--migrate')) await saveState(state)
if (process.argv.includes('--json')) {
  console.log(JSON.stringify(state, null, 2))
} else {
  console.log(`phase: ${state.phase}`)
  console.log(
    `next: ${state.next.step} → ${state.next.command}${state.next.note ? ` (${state.next.note})` : ''}`,
  )
  console.log(`completed: ${state.completed.join(', ') || 'none'}`)
  console.log(`awaiting: ${state.awaiting ?? 'nothing'}`)
  console.log(`counts: ${JSON.stringify(state.counts)}`)
  console.log(
    `batches: ${state.batches.length}; gates: ${Object.keys(state.gates).join(', ') || 'none'}; legal gate entries: ${Object.keys(state.legalGate).length}`,
  )
  console.log(`updated_at: ${state.updated_at}`)
}
