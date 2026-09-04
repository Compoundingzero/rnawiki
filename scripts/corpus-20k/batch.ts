/** Record one completed batch (idempotent on phase+step+batch): --phase 0 --step chembl-molecules --batch 1 --file data/corpus-20k/raw/chembl/molecules-0001.json --records 1000 [--note ...] [--cursor '{"page":2}'] ; --done <step> marks a step complete; --next-step/--next-command set the resume pointer. */
import { createHash } from 'node:crypto'
import { promises as fs } from 'node:fs'
import { recordBatch, markCompleted, setNext } from './state.js'

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 ? process.argv[i + 1] : undefined
}

const file = arg('file')
if (file) {
  const buf = await fs.readFile(file)
  await recordBatch(
    {
      phase: arg('phase') ?? '?',
      step: arg('step') ?? '?',
      batch: Number(arg('batch') ?? 0),
      file,
      sha256: createHash('sha256').update(buf).digest('hex'),
      records: Number(arg('records') ?? 0),
      at: new Date().toISOString(),
      ...(arg('note') ? { note: arg('note') } : {}),
    },
    arg('cursor') ? (JSON.parse(arg('cursor') as string) as Record<string, unknown>) : undefined,
  )
}
const done = arg('done')
if (done) await markCompleted(done)
const step = arg('next-step')
if (step)
  await setNext(
    {
      step,
      command: arg('next-command') ?? '',
      ...(arg('next-note') ? { note: arg('next-note') } : {}),
    },
    arg('phase-name'),
  )
console.log('ok')
