// The contribution gate: what happens to an edit after the deterministic engine has swept it.
//
// Two independent questions, answered in this order and never merged:
//   1. Is the submitted structure internally valid? (the engine — machine, reproducible)
//   2. Has this account earned the right to skip the review queue? (trust tier — social, earned)
// Order matters. A trusted account cannot publish a broken structure, and a new account's correct
// structure is not thrown away — it waits for a person.

import { eq, sql } from 'drizzle-orm'
import type { Db } from '@/db'
import { users } from '@/db/schema'
import {
  canAutoPublish,
  tierForAcceptedEdits,
  TRUST_TIER_THRESHOLDS,
  type RevisionStatus,
  type TrustTier,
} from '@/lib/types'

// The thresholds and the tier function live in lib/types.ts so the client bundle can render a
// progress line without importing Drizzle. Re-exported here so contribution code has one import.
export { canAutoPublish, tierForAcceptedEdits }
export { TRUST_TIER_THRESHOLDS, TRUST_TIERS, AUTO_PUBLISH_TIERS } from '@/lib/types'

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

/** The three terminal states an edit can land in at submission time. */
export type EditOutcome = Extract<
  RevisionStatus,
  'machine_rejected' | 'published' | 'pending_review'
>

export interface EditRoutingDecision {
  outcome: EditOutcome
  /** Shown to the contributor verbatim, so it says what happened and why. */
  reason: string
}

/**
 * Where a submitted edit goes.
 *
 * The engine check comes FIRST, before trust is even read. A failed sweep means the submission
 * contradicts itself — a sequence with illegal bases, a protocol graph with a dependency cycle —
 * and no amount of standing makes that publishable. Sending it to the review queue instead would
 * spend a reviewer's attention on something a machine already proved wrong, which is how review
 * queues die. `machine_rejected` is a rejection, not a deferral.
 */
export function decideEditRouting(args: {
  enginePassed: boolean
  tier: TrustTier
  isAdmin: boolean
}): EditRoutingDecision {
  if (!args.enginePassed) {
    return {
      outcome: 'machine_rejected',
      reason:
        'The structure check failed, so this edit was rejected automatically. Fix the errors ' +
        'listed in the report and submit again — no reviewer was asked to look at it.',
    }
  }

  if (args.isAdmin) {
    return {
      outcome: 'published',
      reason: 'Published immediately: administrator edits do not wait for review.',
    }
  }

  if (canAutoPublish(args.tier)) {
    return {
      outcome: 'published',
      reason: `Published immediately: the structure check passed and ${TIER_LABEL[
        args.tier
      ].toLowerCase()} edits do not wait for review. Every edit stays in the public history.`,
    }
  }

  return {
    outcome: 'pending_review',
    reason:
      'The structure check passed, so this edit is queued for a reviewer. Once ' +
      `${TRUST_TIER_THRESHOLDS.trusted} of your edits have been accepted, edits like this one ` +
      'publish straight away.',
  }
}

// ---------------------------------------------------------------------------
// Counters
// ---------------------------------------------------------------------------

/**
 * A database handle that is either `db` or a transaction from `db.transaction(...)`.
 *
 * Picking the two methods used, rather than naming `NodePgDatabase`, is what makes a transaction
 * assignable: a transaction is not a `NodePgDatabase` (it has no `$client`), but it carries the
 * same `select` and `update`. tests/unit/trust.test.ts pins that assignability at compile time.
 */
export type TrustDb = Pick<Db, 'select' | 'update'>

export interface TrustCounterResult {
  acceptedEditCount: number
  rejectedEditCount: number
  trustTier: TrustTier
  /** The previous tier when this edit caused a promotion, otherwise null. */
  promotedFrom: TrustTier | null
}

/**
 * Increment the accepted-edit counter and re-derive the tier.
 *
 * Call inside the same transaction that publishes the revision: an accepted edit that does not
 * move the counter is an unpaid debt, and a counter moved for an edit that failed to apply
 * inflates standing. The increment is done as `accepted_edit_count + 1` in SQL rather than
 * read-modify-write in TypeScript so two edits accepted at the same instant cannot lose one
 * another's increment.
 *
 * Returns null when no row matched — an anonymous contribution, or an account deleted between
 * submission and review. Callers should treat that as "nothing to credit", not as an error.
 */
export async function recordAcceptedEdit(
  handle: TrustDb,
  userId: string,
): Promise<TrustCounterResult | null> {
  const rows = await handle
    .update(users)
    .set({ acceptedEditCount: sql`${users.acceptedEditCount} + 1` })
    .where(eq(users.id, userId))
    .returning({
      acceptedEditCount: users.acceptedEditCount,
      rejectedEditCount: users.rejectedEditCount,
      trustTier: users.trustTier,
    })

  const row = rows[0]
  if (!row) return null

  const nextTier = tierForAcceptedEdits(row.acceptedEditCount)
  if (nextTier === row.trustTier) {
    return {
      acceptedEditCount: row.acceptedEditCount,
      rejectedEditCount: row.rejectedEditCount,
      trustTier: row.trustTier,
      promotedFrom: null,
    }
  }

  // Second statement rather than a CASE expression in the first: the thresholds are TypeScript
  // constants, and computing the tier in SQL would mean maintaining a copy of them there.
  // `tierForAcceptedEdits` stays the only place the boundaries are written down.
  await handle.update(users).set({ trustTier: nextTier }).where(eq(users.id, userId))

  return {
    acceptedEditCount: row.acceptedEditCount,
    rejectedEditCount: row.rejectedEditCount,
    trustTier: nextTier,
    promotedFrom: row.trustTier,
  }
}

/**
 * Increment the rejected-edit counter.
 *
 * A rejection never demotes. The tier is a function of accepted edits alone
 * (`tierForAcceptedEdits`), so a contributor who tries hard things and is sometimes wrong keeps
 * the standing their accepted work earned. The rejected count exists so reviewers can see a
 * pattern — many rejections against few acceptances — not so the system can punish automatically.
 */
export async function recordRejectedEdit(
  handle: TrustDb,
  userId: string,
): Promise<TrustCounterResult | null> {
  const rows = await handle
    .update(users)
    .set({ rejectedEditCount: sql`${users.rejectedEditCount} + 1` })
    .where(eq(users.id, userId))
    .returning({
      acceptedEditCount: users.acceptedEditCount,
      rejectedEditCount: users.rejectedEditCount,
      trustTier: users.trustTier,
    })

  const row = rows[0]
  if (!row) return null

  return {
    acceptedEditCount: row.acceptedEditCount,
    rejectedEditCount: row.rejectedEditCount,
    trustTier: row.trustTier,
    promotedFrom: null,
  }
}

// ---------------------------------------------------------------------------
// Labels for the interface — plain English, no internal vocabulary.
// ---------------------------------------------------------------------------

export const TIER_LABEL: Record<TrustTier, string> = {
  new: 'New contributor',
  contributor: 'Contributor',
  trusted: 'Trusted editor',
  steward: 'Steward',
}

// Built from the thresholds rather than typed out, so a changed number cannot leave the interface
// telling readers something the code no longer does.
export const TIER_DESCRIPTION: Record<TrustTier, string> = {
  new: 'Your edits are read by a person before they appear on the site.',
  contributor:
    `${TRUST_TIER_THRESHOLDS.contributor} of your edits have been accepted. ` +
    'Edits still wait for a reviewer.',
  trusted:
    `${TRUST_TIER_THRESHOLDS.trusted} of your edits have been accepted. ` +
    'Edits that pass the automatic check now appear straight away.',
  steward:
    `${TRUST_TIER_THRESHOLDS.steward} of your edits have been accepted. ` +
    'Edits appear straight away and are listed in the public history for anyone to check.',
}

/**
 * The same four levels described to someone who does not have any of them yet.
 *
 * TIER_DESCRIPTION is written to the person who holds the tier, which is right in the account panel
 * and wrong in a table explaining all four to a reader with no edits at all — there it says
 * "3 of your edits have been accepted" to someone who has made none.
 */
export const TIER_SUMMARY: Record<TrustTier, string> = {
  new: 'Everyone starts here. A person reads your edit before it goes on the site.',
  contributor: 'You have had a few edits accepted. A person still reads each one.',
  trusted: 'Your edits go up as soon as the automatic check passes. No waiting.',
  steward: "Same as above, and you can approve other people's edits.",
}

/** The tier above `tier`, or null at the top. */
const NEXT_TIER: Record<TrustTier, TrustTier | null> = {
  new: 'contributor',
  contributor: 'trusted',
  trusted: 'steward',
  steward: null,
}

/** Accepted edits still needed for the next tier, or null at the top. */
export function editsUntilNextTier(
  acceptedEdits: number,
): { tier: TrustTier; remaining: number } | null {
  const next = NEXT_TIER[tierForAcceptedEdits(acceptedEdits)]
  if (next === null) return null
  return { tier: next, remaining: Math.max(0, TRUST_TIER_THRESHOLDS[next] - acceptedEdits) }
}
