import 'dotenv/config'

import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import {
  PROGRAMME_FIRST_VERDICT_CLI_USAGE,
  parseProgrammeFirstVerdictCliArgs,
} from '@/lib/programme-first-verdict-cli'
import { authorFirstProgrammeVerdictDraft } from '@/lib/queries/programme-first-verdict-authoring'

async function main(): Promise<void> {
  const options = parseProgrammeFirstVerdictCliArgs(process.argv.slice(2))
  const bundlePath = resolve(process.cwd(), options.bundleFile)
  const raw = await readFile(bundlePath, 'utf8')
  const bundle: unknown = JSON.parse(raw)
  const { closeDatabasePool } = await import('@/db')
  try {
    const result = await authorFirstProgrammeVerdictDraft({
      actorUserId: options.actorUserId,
      bundle,
      commit: options.commit,
    })
    process.stdout.write(`${JSON.stringify({ result })}\n`)
  } finally {
    await closeDatabasePool()
  }
}

main().catch((error: unknown) => {
  const candidate = error as { code?: unknown; message?: unknown }
  process.stderr.write(
    `${JSON.stringify({
      error:
        typeof candidate.message === 'string'
          ? candidate.message
          : 'First canonical draft authoring failed.',
      code: typeof candidate.code === 'string' ? candidate.code : 'first_draft_authoring_failed',
      usage: PROGRAMME_FIRST_VERDICT_CLI_USAGE,
    })}\n`,
  )
  process.exitCode = 1
})
