import { z } from 'zod'

const cliSchema = z
  .object({
    programmeId: z.string().trim().min(1).max(64),
    actorUserId: z.string().trim().min(1).max(64),
    conflictsOfInterest: z.string().trim().min(1).max(4_000),
  })
  .strict()

export type ProgrammeVerdictDraftCliOptions = z.infer<typeof cliSchema>

export function parseProgrammeVerdictDraftCliArgs(
  argv: readonly string[],
): ProgrammeVerdictDraftCliOptions {
  const values = new Map<string, string>()
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (!flag?.startsWith('--') || value === undefined || value.startsWith('--')) {
      throw new Error(
        'Usage: --programme-id <id> --actor-user-id <id> --conflicts-of-interest <statement>',
      )
    }
    if (values.has(flag)) throw new Error(`Duplicate option: ${flag}`)
    values.set(flag, value)
  }
  const known = new Set(['--programme-id', '--actor-user-id', '--conflicts-of-interest'])
  const unknown = [...values.keys()].find((flag) => !known.has(flag))
  if (unknown) throw new Error(`Unknown option: ${unknown}`)
  return cliSchema.parse({
    programmeId: values.get('--programme-id'),
    actorUserId: values.get('--actor-user-id'),
    conflictsOfInterest: values.get('--conflicts-of-interest'),
  })
}
