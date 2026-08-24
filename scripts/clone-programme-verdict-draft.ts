import 'dotenv/config'

import { parseProgrammeVerdictDraftCliArgs } from '@/lib/programme-verdict-draft-cli'
import { createProgrammeVerdictDraftFromCurrentPublication } from '@/lib/queries/programme-verdict-drafts'

async function main(): Promise<void> {
  const input = parseProgrammeVerdictDraftCliArgs(process.argv.slice(2))
  const { closeDatabasePool } = await import('@/db')
  try {
    const draft = await createProgrammeVerdictDraftFromCurrentPublication(input)
    process.stdout.write(`${JSON.stringify({ draft })}\n`)
  } finally {
    await closeDatabasePool()
  }
}

main().catch((error: unknown) => {
  const candidate = error as { code?: unknown; message?: unknown }
  process.stderr.write(
    `${JSON.stringify({
      error: typeof candidate.message === 'string' ? candidate.message : 'Draft creation failed.',
      code: typeof candidate.code === 'string' ? candidate.code : 'draft_creation_failed',
    })}\n`,
  )
  process.exitCode = 1
})
