import 'dotenv/config'

import { ADMIN_BOOTSTRAP_USAGE, parseAdminBootstrapArgs } from '@/lib/admin-bootstrap-cli'

async function main(): Promise<void> {
  const input = parseAdminBootstrapArgs(process.argv.slice(2))
  const [{ bootstrapFirstAdmin }, { closeDatabasePool }] = await Promise.all([
    import('@/lib/queries/account-roles'),
    import('@/db'),
  ])

  try {
    const result = await bootstrapFirstAdmin(input)
    console.log(
      JSON.stringify({
        outcome: 'first_admin_bootstrapped',
        userId: result.userId,
        email: result.email,
        eventId: result.eventId,
        createdAt: result.createdAt,
      }),
    )
  } finally {
    await closeDatabasePool()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  console.error(ADMIN_BOOTSTRAP_USAGE)
  process.exitCode = 1
})
