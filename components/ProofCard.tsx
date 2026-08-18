import { PROOF_BOUNDARY_LABELS } from '@/lib/evidence'
import { formatCitation } from '@/lib/citation'
import type { ProofCardView } from '@/lib/types'
import { EvidenceSourceList } from './EvidenceSourceList'
import { CopyCitationButton } from './CopyCitationButton'
import { EmbedLink } from './EmbedLink'

// Never derive this line from publicationStatus alone — "published" describes editorial
// workflow, not scientific sign-off. Only an actual approved review from a qualified
// scientific_reviewer may say "reviewed by"; everything else must say "pending", even once
// the claim is live. Section 13: never invent a reviewer or imply clinical review that
// did not happen.
function reviewStatusCopy(claim: ProofCardView): string {
  if (claim.reviewStatus === 'needs_update') {
    return 'This claim is flagged for update — evidence may have changed since the last review.'
  }
  if (claim.reviewStatus === 're_review') {
    return 'This claim is undergoing re-review.'
  }
  if (claim.review && claim.review.decision === 'approved') {
    return 'Editorial review completed.'
  }
  return 'Editorial review completed. Independent scientific review pending.'
}

export function ProofCard({ claim, entityName }: { claim: ProofCardView; entityName: string }) {
  const lastReviewed = claim.lastReviewedAt
    ? claim.lastReviewedAt.toISOString().slice(0, 10)
    : null

  return (
    <article
      id={`claim-${claim.slug}`}
      style={{
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-surface)',
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <header>
        <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{claim.consumerQuestion}</h3>
      </header>

      <p style={{ margin: 0, fontSize: '1.02rem' }}>{claim.directAnswer}</p>

      <dl style={{ margin: 0, display: 'grid', gap: 'var(--space-3)' }}>
        <div>
          <dt style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            What was measured
          </dt>
          <dd style={{ margin: 0 }}>{claim.measuredFinding}</dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            What is being inferred
          </dt>
          <dd style={{ margin: 0 }}>{claim.inference}</dd>
        </div>
      </dl>

      <div>
        <div
          style={{
            display: 'inline-block',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            color: 'var(--color-accent-strong)',
            borderTop: '2px solid var(--color-accent)',
            paddingTop: 'var(--space-2)',
          }}
        >
          Proof Boundary — {PROOF_BOUNDARY_LABELS[claim.proofBoundaryStage]}
        </div>
        <p style={{ margin: 'var(--space-2) 0 0' }}>{claim.proofBoundaryExplanation}</p>
      </div>

      <div>
        <dt style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          What remains unknown
        </dt>
        <dd style={{ margin: 0 }}>{claim.remainingUnknown}</dd>
      </div>

      <details>
        <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
          Evidence ({claim.evidence.length} source{claim.evidence.length === 1 ? '' : 's'})
        </summary>
        <div style={{ marginTop: 'var(--space-3)' }}>
          <EvidenceSourceList evidence={claim.evidence} />
        </div>
      </details>

      <div>
        <dt style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          What evidence would move the boundary
        </dt>
        <dd style={{ margin: 0 }}>{claim.evidenceNeededNext}</dd>
      </div>

      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: 'var(--space-3)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          fontSize: '0.82rem',
          color: 'var(--color-text-faint)',
        }}
      >
        <div>
          <p style={{ margin: 0 }}>{reviewStatusCopy(claim)}</p>
          {claim.review?.reviewerName && (
            <p style={{ margin: 0 }}>
              Reviewed by {claim.review.reviewerName}
              {claim.review.reviewerCredentials ? ` (${claim.review.reviewerCredentials})` : ''}
            </p>
          )}
          {lastReviewed && <p style={{ margin: 0 }}>Last reviewed: {lastReviewed}</p>}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <CopyCitationButton text={formatCitation({
            directAnswer: claim.directAnswer,
            entitySlug: claim.entitySlug,
            claimSlug: claim.slug,
            lastReviewedAt: claim.lastReviewedAt,
          })} />
          <EmbedLink claimId={claim.id} />
        </div>
      </footer>
    </article>
  )
}
