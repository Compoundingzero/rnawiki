import type { ReviewView } from '@/lib/types'
import { readableDate, isoDate, answerCheckPoint } from '@/lib/evidence-view'

/**
 * The record's own provenance line: which version of this answer you are reading, when it was last
 * checked, and who checked it.
 *
 * BLOCKING RULE — the review sentence may not be relaxed.
 *
 * This is the successor to `reviewStatusCopy()`, which existed because the site once let
 * `publicationStatus === 'published'` produce a "reviewed" line. Publication status is editorial
 * workflow: it records that an editor finished writing, and nothing whatsoever about a scientist
 * reading the sources. The only thing that may produce an independent-review sentence is an
 * `approved` row in `reviews` for this claim, which arrives here as `review.decision === 'approved'`.
 *
 * The negative branch says "has approved", not "has reviewed", deliberately. A `rejected` or
 * `needs_changes` review did happen; saying no review took place would be a second false statement
 * in the other direction.
 *
 * No reviewer name, credential or comment is printed. A named reviewer on a page is the single
 * easiest thing on this site to fabricate, so the public record carries only the decision and its
 * date, both of which come straight from the row.
 *
 * FOURTH BLOCKING RULE — this date must be a date somebody recorded, not a date a database wrote.
 * `lastCheckedAt` is `claims.updatedAt`, a write timestamp; printed under "This answer last
 * checked" it claimed an editorial act that never happened, moved every time `db:seed` ran, and in
 * the seeded corpus printed a day later than the as-of date inside the answer's own text.
 * `checkedAt` is `claims.checkedAt`, the recorded editorial check, and it is null whenever nobody
 * has recorded one. `answerCheckPoint` picks the branch: with a recorded check the line says
 * "last checked" and prints that date; with none it says "last edited" and prints the write date,
 * which is the only honest thing `updatedAt` can support. Do not add a fallback that prints
 * `updatedAt` under the word "checked" — that is the defect, restored.
 *
 * THIRD BLOCKING RULE — this date names what it is a date OF. Two different dates on the record
 * page were both labelled "Last checked": the metadata strip's regulatory-status check date and
 * this claim's own `claims.updatedAt`, about 700px apart and a day apart in the seed corpus. On a
 * site whose whole proposition is that you can trust what it says it checked, one reader question
 * ("when was this last checked?") must not have two visible answers. So this one says "This answer
 * last checked" — it is scoped to the one claim the record belongs to — and the strip above names
 * the thing it describes instead of borrowing this label.
 *
 * The editor sentence that used to open the second paragraph is gone from here on purpose. The
 * page prints "Written and checked against the cited sources by one editor." once, in the strip
 * above, where it is true of every answer on the page; repeating it verbatim ~500px lower said
 * nothing new and made both instances read as boilerplate. What remains here is the part that is
 * specific to THIS answer and cannot be derived from the page-level line: whether an independent
 * scientific reviewer approved it, which version they approved, and when. The negative branch is
 * unchanged and is never dropped.
 *
 * SECOND BLOCKING RULE — version drift. An approval approves the text that existed when it was
 * given. `reviews.reviewedVersion` records which `claims.version` the reviewer read; it was written
 * on every review and read by nothing, so an editor bumping the version and rewriting the answer
 * left this line asserting that a reviewer approved sentences they never saw. The unqualified
 * approval sentence is now printed only when the two versions match. When they do not, the line
 * states which version was approved and that the answer has been edited since — never silence, and
 * never the unqualified claim.
 */
export function EvidenceRecordMeta({
  version,
  lastCheckedAt,
  checkedAt,
  review,
}: {
  version: number
  /** `claims.updatedAt` — a write timestamp. Only ever printed under the word "edited". */
  lastCheckedAt: Date
  /** `claims.checkedAt` — the recorded editorial check. Null when nobody recorded one. */
  checkedAt: Date | null
  review: ReviewView | null
}) {
  const approved = review?.decision === 'approved' ? review : null
  const current = approved !== null && approved.reviewedVersion === version
  const check = answerCheckPoint(checkedAt, lastCheckedAt)

  return (
    <>
      <p className="er__meta">
        Version {version} — This answer last {check.verb}{' '}
        <time dateTime={isoDate(check.date)}>{readableDate(check.date)}</time>
      </p>
      <p className="er__meta">
        {approved === null ? (
          'No independent scientific reviewer has approved this answer.'
        ) : current ? (
          <>
            An independent scientific reviewer approved this answer on{' '}
            <time dateTime={isoDate(approved.reviewDate)}>{readableDate(approved.reviewDate)}</time>.
          </>
        ) : (
          <>
            An independent scientific reviewer approved version {approved.reviewedVersion} of this answer on{' '}
            <time dateTime={isoDate(approved.reviewDate)}>{readableDate(approved.reviewDate)}</time>. It has been
            edited since.
          </>
        )}
      </p>
    </>
  )
}
