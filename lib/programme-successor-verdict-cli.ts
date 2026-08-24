import { z } from 'zod'

const valueSchema = z
  .object({
    bundleFile: z.string().trim().min(1),
    actorUserId: z.string().trim().min(1).max(64),
    commit: z.boolean(),
  })
  .strict()

export type ProgrammeSuccessorVerdictCliOptions = z.infer<typeof valueSchema>

export const PROGRAMME_SUCCESSOR_VERDICT_CLI_USAGE =
  '--bundle-file <json-path> --actor-user-id <steward-or-admin-id> [--commit]'

export function parseProgrammeSuccessorVerdictCliArgs(
  argv: readonly string[],
): ProgrammeSuccessorVerdictCliOptions {
  const values = new Map<string, string>()
  let commit = false
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    if (flag === '--commit') {
      if (commit) throw new Error('Duplicate option: --commit')
      commit = true
      continue
    }
    if (flag !== '--bundle-file' && flag !== '--actor-user-id') {
      throw new Error(
        `Unknown option: ${flag ?? '<missing>'}. Usage: ${PROGRAMME_SUCCESSOR_VERDICT_CLI_USAGE}`,
      )
    }
    if (values.has(flag)) throw new Error(`Duplicate option: ${flag}`)
    const value = argv[index + 1]
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${flag}. Usage: ${PROGRAMME_SUCCESSOR_VERDICT_CLI_USAGE}`)
    }
    values.set(flag, value)
    index += 1
  }
  return valueSchema.parse({
    bundleFile: values.get('--bundle-file'),
    actorUserId: values.get('--actor-user-id'),
    commit,
  })
}
