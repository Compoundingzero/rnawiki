import { entityUrl } from './canonical'
import { answerCheckPoint } from './evidence-view'

export interface CitableClaim {
  directAnswer: string
  entitySlug: string
  claimSlug: string
  /** `claims.updatedAt`. Always present, which is why the citation always carries a date. */
  lastCheckedAt: Date
  /**
   * `claims.checkedAt` — the recorded editorial check, null when nobody recorded one. It decides
   * between "checked" and "edited" below; see lib/evidence-view.ts `answerCheckPoint`.
   */
  checkedAt: Date | null
  /**
   * The `reviewDate` of an `approved` row in `reviews` covering the version of this claim being
   * cited — the same predicate EvidenceRecordMeta uses — and `null` in every other case: no
   * review, a rejected one, a needs-changes one, or an approval of an older version.
   *
   * A DATE, not a boolean, and that is the fix for a real defect. This used to be
   * `independentlyReviewed: boolean`, and the citation then printed `lastCheckedAt` — which is
   * `claims.updatedAt` — beside the word "reviewed". So the record's own provenance line said
   * "approved this answer on 15 January 2026" while the citation control on the same page said
   * "RNAwiki, reviewed 2026-08-18", off a database write clock. It is wrong by construction, not by
   * coincidence: publishClaim rewrites updatedAt after the approval with no version bump, so the
   * printed date is always at or after the true review date and drifts further on every later
   * write. Carrying the date makes the wrong one unreachable.
   */
  approvedReviewDate: Date | null
}

/**
 * "Copy with source" text (spec section 15). The caveat lives inside directAnswer already —
 * this function must never split the claim from its qualifier, only append attribution.
 *
 * BLOCKING RULE — the verb. This is the one string on the site designed to be pasted onto pages
 * RNAwiki does not control, so it may not over-claim by a single word.
 *
 * It used to read "RNAwiki, reviewed <claims.lastReviewedAt>", which was wrong twice over.
 * `lastReviewedAt` is stamped by the review queue on EVERY decision, rejected and needs-changes
 * included, so a claim a reviewer had rejected emitted "reviewed <the rejection date>". And with no
 * review at all the date fell back to the literal string "pending review", so every record page
 * shipped four copies of "RNAwiki, reviewed pending review".
 *
 * So: a fact about RNAwiki's own record by default, upgraded to "reviewed <date>" only for a claim
 * carrying a current approved review.
 *
 * The default verb is chosen, not fixed, and this is the third version of that decision. It was
 * "checked <claims.updatedAt>" — but `updatedAt` is a database write timestamp, so a citation
 * pasted onto someone else's page asserted an editorial check on a day when a row was written.
 * `checkedAt` is the recorded editorial check; when it is null the citation says "edited" and
 * carries the write date, which is the only claim `updatedAt` can support. The date printed always
 * belongs to the verb printed beside it.
 *
 * That rule applies to the "reviewed" branch too, and used not to: it kept the review verb and took
 * the date from `lastCheckedAt`. `approvedReviewDate` is now the only date that branch can print.
 */
export function formatCitation(claim: CitableClaim): string {
  const check = answerCheckPoint(claim.checkedAt, claim.lastCheckedAt)
  const verb = claim.approvedReviewDate ? 'reviewed' : check.verb
  const date = (claim.approvedReviewDate ?? check.date).toISOString().slice(0, 10)
  const url = `${entityUrl(claim.entitySlug)}#claim-${claim.claimSlug}`
  return `${claim.directAnswer} RNAwiki, ${verb} ${date}: ${url}`
}
