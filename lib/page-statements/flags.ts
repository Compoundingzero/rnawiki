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
 * compass itself, and it is why none of this needs a migration to undo.
 *
 * Unset means on. There is one medicine layout and no variable selecting it, so there is nothing
 * for these to follow: review is part of the product, and these exist to withdraw a layer of it
 * when something is wrong rather than to stage a rollout.
 *
 * None of them reaches a reader's medicine page. The review surface lives at `/review-queue` and
 * nowhere else, so what these withdraw is what a member can do there.
 */
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

/** Whether the review queue and its API accept work at all. On unless withdrawn. */
export function communityReviewSurfaceEnabled(): boolean {
  return !switchedOff(PAGE_STATEMENT_FLAGS.review)
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
