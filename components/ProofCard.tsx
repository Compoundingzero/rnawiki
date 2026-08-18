import Link from 'next/link'
import { PROOF_BOUNDARY_LABELS } from '@/lib/evidence'
import { formatCitation } from '@/lib/citation'
import type { ProofCardView } from '@/lib/types'
import { CopyCitationButton } from './CopyCitationButton'
import { EmbedCodeBox } from './EmbedCodeBox'
import { EvidenceTrace } from './evidence/EvidenceTrace'
import { EvidenceLadder } from './evidence/EvidenceLadder'

// Never derive this line from publicationStatus alone — "published" describes editorial
// workflow, not scientific sign-off. Only an actual approved review from a qualified
// scientific_reviewer may say "reviewed by"; everything else says "pending", even once live.
function reviewStatusCopy(claim: ProofCardView): string {
  if (claim.reviewStatus === 'needs_update') {
    return 'Flagged for update — evidence may have changed since the last review.'
  }
  if (claim.reviewStatus === 're_review') return 'Undergoing re-review.'
  if (claim.review && claim.review.decision === 'approved') return 'Editorial review completed.'
  return 'Editorial review completed. Independent scientific review pending.'
}

/**
 * A claim record. Not a card in the decorative sense — a ruled block with a fixed
 * reading order: question, answer, what was measured, what is inferred, where the
 * evidence stops, what is still unknown.
 */
export function ProofCard({ claim, entityName }: { claim: ProofCardView; entityName: string }) {
  const lastReviewed = claim.lastReviewedAt ? claim.lastReviewedAt.toISOString().slice(0, 10) : null

  return (
    <article id={`claim-${claim.slug}`} aria-label={`${entityName}: ${claim.consumerQuestion}`}>
      <h3 className="h2" style={{ marginBottom: 'var(--s3)' }}>
        {claim.consumerQuestion}
      </h3>

      <p className="lead" style={{ color: 'var(--ink)', marginBottom: 'var(--s5)' }}>
        {claim.directAnswer}
        <EvidenceTrace evidence={claim.evidence} label={claim.consumerQuestion} />
      </p>

      <div style={{ marginBottom: 'var(--s5)' }}>
        <EvidenceLadder stage={claim.proofBoundaryStage} />
      </div>

      <dl className="speclabel speclabel--prose">
        <div className="speclabel__row">
          <dt className="speclabel__key">Measured</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            {claim.measuredFinding}
          </dd>
        </div>
        <div className="speclabel__row">
          <dt className="speclabel__key">Inferred</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            {claim.inference}
          </dd>
        </div>
        <div className="speclabel__row">
          <dt className="speclabel__key">Boundary</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            {PROOF_BOUNDARY_LABELS[claim.proofBoundaryStage]} — {claim.proofBoundaryExplanation}
          </dd>
        </div>
        <div className="speclabel__row">
          <dt className="speclabel__key">Unknown</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            {claim.remainingUnknown}
          </dd>
        </div>
        <div className="speclabel__row">
          <dt className="speclabel__key">Would move it</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            {claim.evidenceNeededNext}
          </dd>
        </div>
      </dl>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--s4)',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'var(--s4)',
        }}
      >
        <div className="metaline">
          <span>{reviewStatusCopy(claim)}</span>
          {claim.review?.reviewerName && (
            <span>
              Reviewed by <b>{claim.review.reviewerName}</b>
              {claim.review.reviewerCredentials ? ` (${claim.review.reviewerCredentials})` : ''}
            </span>
          )}
          {lastReviewed && (
            <span>
              Last reviewed <b>{lastReviewed}</b>
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 'var(--s2)' }}>
          <CopyCitationButton
            text={formatCitation({
              directAnswer: claim.directAnswer,
              entitySlug: claim.entitySlug,
              claimSlug: claim.slug,
              lastReviewedAt: claim.lastReviewedAt,
            })}
          />
          <EmbedCodeBox claimId={claim.id} claimQuestion={claim.consumerQuestion} />
          <Link
            href={`/corrections?entity=${claim.entitySlug}&claim=${claim.slug}`}
            className="drawer__close"
            style={{ textDecoration: 'none' }}
          >
            Report an issue
          </Link>
        </div>
      </div>
    </article>
  )
}
