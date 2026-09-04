/** Print one line per site from state.json; `--json` prints the whole state. Never fetches. */
import { loadState, saveState, summarize } from './state.js'

async function main(): Promise<void> {
  const state = await loadState()
  if (process.argv.includes('--migrate')) await saveState(state)
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(state, null, 2))
    return
  }
  console.log(`phase: ${state.phase}`)
  console.log(`awaiting: ${state.awaiting ?? 'nothing'}`)
  console.log(`updated_at: ${state.updated_at}`)
  for (const line of summarize(state)) console.log(line)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
