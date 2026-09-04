/** Set the design study's phase pointer and what it is waiting on: `--phase <text> [--awaiting <text>]`. */
import { setPhase } from './state.js'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const phase = arg('phase')
if (!phase) throw new Error('--phase is required')
await setPhase(phase, arg('awaiting') ?? null)
console.log(`phase=${phase} awaiting=${arg('awaiting') ?? 'nothing'}`)
