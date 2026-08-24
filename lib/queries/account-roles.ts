import { eq, sql } from 'drizzle-orm'

import { db } from '@/db'
import { accountRoleEvents, users } from '@/db/schema'
import { newId } from '@/lib/ids'

export type AccountRoleErrorCode =
  'confirmation_mismatch' | 'invalid_reason' | 'target_not_found' | 'already_bootstrapped'

export class AccountRoleError extends Error {
  readonly code: AccountRoleErrorCode

  constructor(code: AccountRoleErrorCode, message: string) {
    super(message)
    this.name = 'AccountRoleError'
    this.code = code
  }
}

export interface BootstrapFirstAdminInput {
  email: string
  confirmationEmail: string
  reason: string
}

export interface BootstrapFirstAdminResult {
  userId: string
  email: string
  eventId: string
  createdAt: string
}

/**
 * Promote the first administrator and permanently close this path in one serialized transaction.
 * The target must already have an account: account creation and role assignment are deliberately
 * separate operations, so no signup field can acquire authority.
 */
export async function bootstrapFirstAdmin(
  input: BootstrapFirstAdminInput,
): Promise<BootstrapFirstAdminResult> {
  const email = input.email.trim()
  const confirmationEmail = input.confirmationEmail.trim()
  const reason = input.reason.trim()

  if (email.toLocaleLowerCase('en') !== confirmationEmail.toLocaleLowerCase('en')) {
    throw new AccountRoleError(
      'confirmation_mismatch',
      'The confirmation email must match the target account email.',
    )
  }
  if (reason.length < 8 || reason.length > 500) {
    throw new AccountRoleError(
      'invalid_reason',
      'The bootstrap reason must be between 8 and 500 characters.',
    )
  }

  return db.transaction(async (tx) => {
    // A database-wide lock is intentional: the invariant is "zero administrators", not one row.
    // Concurrent bootstrap processes therefore queue, and only the first can observe zero.
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended('rnawiki:first-admin-bootstrap', 0))`,
    )

    const existingAdmins = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.isAdmin, true))
      .limit(1)
    if (existingAdmins.length > 0) {
      throw new AccountRoleError(
        'already_bootstrapped',
        'An administrator already exists. The one-time bootstrap path is closed.',
      )
    }

    const targets = await tx
      .select({
        id: users.id,
        email: users.email,
        isAdmin: users.isAdmin,
        trustTier: users.trustTier,
      })
      .from(users)
      .where(sql`lower(${users.email}) = lower(${email})`)
      .limit(1)
      .for('update')
    const target = targets[0]
    if (!target) {
      throw new AccountRoleError(
        'target_not_found',
        'No existing account matches that email address. Create the account first.',
      )
    }

    const eventId = newId('role')
    const events = await tx
      .insert(accountRoleEvents)
      .values({
        id: eventId,
        targetUserId: target.id,
        actorUserId: target.id,
        action: 'BOOTSTRAP_ADMIN',
        previousIsAdmin: false,
        nextIsAdmin: true,
        previousTrustTier: target.trustTier,
        nextTrustTier: target.trustTier,
        reason,
      })
      .returning({ createdAt: accountRoleEvents.createdAt })

    const updated = await tx
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.id, target.id))
      .returning({ id: users.id })
    if (!updated[0] || !events[0]) {
      throw new AccountRoleError('target_not_found', 'The target account could not be promoted.')
    }

    return {
      userId: target.id,
      email: target.email,
      eventId,
      createdAt: events[0].createdAt.toISOString(),
    }
  })
}
