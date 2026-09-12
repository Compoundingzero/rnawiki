/**
 * The switches that turn community review off, one layer at a time.
 *
 * Four things can be withdrawn separately, in the order a problem would usually be found:
 *
 *   1. automatic publication — stop the third approval from changing a page, keep everything else;
 *   2. review decisions — stop approvals being recorded, leave open proposals readable;
 *   3. proposals — stop new ones arriving, leave the ones in flight reviewable;
 *   4. the whole surface — the public control disappears and every write path refuses.
 *
 * Each is read per request from the environment, so turning one off is a variable change and a
 * restart, never a deployment. That is the same rollback `DOSSIER_V4_SLUGS` already gives the
 * compass itself, and it is why none of this needs a migration to undo.
 *
 * Unset means "follow the compass". The review surface exists for a medicine exactly when the
 * compass does, so on a deployment where `DOSSIER_V4_SLUGS` is unset — which is every deployment
 * today — this whole feature is inert without anyone having to remember a second variable.
 */
import { dossierV4Enabled } from '@/lib/dossier-v4/load'

export const PAGE_STATEMENT_FLAGS = {
  /** The whole feature. `off` withdraws the control and refuses every write. */
  review: 'DOSSIER_COMMUNITY_REVIEW',
  /** New proposals. `off` leaves open ones reviewable and stops more arriving. */
  proposals: 'DOSSIER_REVIEW_PROPOSALS',
  /** Review decisions: approve, request changes, reject, withdraw. */
  decisions: 'DOSSIER_REVIEW_DECISIONS',
  /** Publishing on the third approval. `off` records the approval and leaves the page alone. */
  autopublish: 'DOSSIER_REVIEW_AUTOPUBLISH',
} as const

/*
 * There is deliberately no environment setting for the number of approvals. Three is written into
 * `page_statement_review_states` as a CHECK and frozen per row when the row is created, so a
 * variable that appeared to change it would either be ignored or would produce a row the database
 * refuses. A setting that looks configurable and is not is worse than no setting.
 */

function switchedOff(name: string): boolean {
  const raw = process.env[name]?.trim().toLowerCase()
  return raw === 'off' || raw === 'false' || raw === '0' || raw === 'no'
}

function switchedOn(name: string): boolean {
  const raw = process.env[name]?.trim().toLowerCase()
  return raw === 'on' || raw === 'true' || raw === '1' || raw === 'yes'
}

/**
 * Whether the review surface exists for one medicine.
 *
 * Unset follows the compass flag. `on` enables it for every medicine regardless, which is the
 * setting to use if the compass is ever rolled back without withdrawing review work already in
 * flight. `off` withdraws it everywhere.
 */
export function communityReviewEnabled(slug: string): boolean {
  if (switchedOff(PAGE_STATEMENT_FLAGS.review)) return false
  if (switchedOn(PAGE_STATEMENT_FLAGS.review)) return true
  return dossierV4Enabled(slug)
}

/** Whether the review queue and its API accept work at all, independent of any one medicine. */
export function communityReviewSurfaceEnabled(): boolean {
  if (switchedOff(PAGE_STATEMENT_FLAGS.review)) return false
  if (switchedOn(PAGE_STATEMENT_FLAGS.review)) return true
  // Follows the compass: any allowlist at all means the surface is live for the pages it covers.
  return Boolean(process.env.DOSSIER_V4_SLUGS?.trim())
}

export function proposalsEnabled(): boolean {
  return communityReviewSurfaceEnabled() && !switchedOff(PAGE_STATEMENT_FLAGS.proposals)
}

export function reviewDecisionsEnabled(): boolean {
  return communityReviewSurfaceEnabled() && !switchedOff(PAGE_STATEMENT_FLAGS.decisions)
}

/**
 * Whether a third approval publishes.
 *
 * Off is a real state, not a broken one: the approval is still recorded and the proposal still
 * resolves to `approved`. What stops is the pointer moving, so an operator who suspects the
 * publishing path can freeze it without losing the review work that has already been done.
 */
export function autoPublishEnabled(): boolean {
  return communityReviewSurfaceEnabled() && !switchedOff(PAGE_STATEMENT_FLAGS.autopublish)
}
