/** Log a decision: `--what "<text>" [--why "<text>"] [--by Felix]`, or set the next step: `--next-step "<text>" --next-command "<cmd>" [--phase <p>]`. */
import { addDecision, setNext } from './state.js'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const what = arg('what')
if (what) await addDecision(what, arg('why'), arg('by'))
const step = arg('next-step')
if (step)
  await setNext(
    {
      step,
      command: arg('next-command') ?? '',
      ...(arg('next-note') ? { note: arg('next-note') } : {}),
    },
    arg('phase'),
  )
console.log('ok')
