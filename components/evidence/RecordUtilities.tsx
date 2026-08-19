import Link from 'next/link'
import { formatCitation } from '@/lib/citation'
import type { ProofCardView } from '@/lib/types'
import { CopyCitationButton } from '../CopyCitationButton'
import { EmbedCodeBox } from '../EmbedCodeBox'

/**
 * Ways to take this record somewhere else: cite it, download it, embed it, correct it.
 *
 * Deliberately last, deliberately closed, deliberately quiet. None of these is a primary action —
 * the reader came to find out how far the evidence goes, not to publish anything, and a prominent
 * "Copy" button competing with the evidence would be the site asking for distribution in the middle
 * of an answer. Nothing here uses `.btn--primary`; the action colour is reserved for controls, not
 * for decoration.
 *
 * This is level 2 and the last permitted level. Everything inside it — the citation button, the
 * JSON link, the embed block, the corrections link — renders inline. `EmbedCodeBox` used to bring
 * its own <details> and made a third level; it does not any more, and nothing added here may.
 *
 * `er__utilities` exists so print can drop the whole block: on paper "copy", "embed" and "download"
 * are instructions for a machine the reader is not holding, while the evidence above them still
 * has to print in full.
 */
export function RecordUtilities({ claim }: { claim: ProofCardView }) {
  return (
    <details className="disclosure disclosure--inline er__utilities">
      <summary>More ways to use this record</summary>
      <div className="disclosure__body stack">
        <div className="tools">
          <CopyCitationButton
            text={formatCitation({
              directAnswer: claim.directAnswer,
              entitySlug: claim.entitySlug,
              claimSlug: claim.slug,
              lastCheckedAt: claim.lastCheckedAt,
              checkedAt: claim.checkedAt,
              // The same predicate the record's own provenance line applies, including the
              // version check: a citation pasted onto someone else's page may not say "reviewed"
              // about text no reviewer read. The REVIEW's own date travels with it, so the
              // "reviewed" branch cannot fall back to a database write timestamp — see the note on
              // CitableClaim.approvedReviewDate.
              approvedReviewDate:
                claim.review?.decision === 'approved' && claim.review.reviewedVersion === claim.version
                  ? claim.review.reviewDate
                  : null,
            })}
          />
          {/* The same record the page renders, as the machine-readable copy. Documented in
              docs/open-evidence-record.md, so a reader who wants the data does not have to
              scrape the page for it. */}
          <a className="btn btn--quiet" href={`/api/v1/claims/${claim.id}`}>
            Download record as JSON
          </a>
          <Link className="btn btn--quiet" href={`/corrections?entity=${claim.entitySlug}&claim=${claim.slug}`}>
            Report an issue
          </Link>
        </div>

        <EmbedCodeBox claimId={claim.id} claimQuestion={claim.consumerQuestion} />
      </div>
    </details>
  )
}
