import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { claims, entities } from '@/db/schema'
import { claimAnchorUrl } from '@/lib/canonical'
import { PROOF_BOUNDARY_LABELS, PROOF_BOUNDARY_STAGES, stageRank } from '@/lib/evidence'

// Embeddable single-claim view. Third-party sites iframe this route directly (see
// components/EmbedCodeBox.tsx for the snippet readers copy). next.config.mjs already sends
// X-Robots-Tag: noindex for everything under /embed/:path*.
//
// Self-contained by construction: it inherits no site chrome, depends on no page container
// (.wrap, .shell), sizes everything relatively so it reads at any iframe width, and ships no
// client JavaScript. It borrows only the primitives from app/globals.css that carry the
// identity — the specimen label and the mono metadata voice.

export const revalidate = 3600

interface Props {
  params: Promise<{ claimId: string }>
}

async function getEmbeddableClaim(claimId: number) {
  const [row] = await db
    .select({
      id: claims.id,
      slug: claims.slug,
      consumerQuestion: claims.consumerQuestion,
      directAnswer: claims.directAnswer,
      proofBoundaryStage: claims.proofBoundaryStage,
      proofBoundaryExplanation: claims.proofBoundaryExplanation,
      lastReviewedAt: claims.lastReviewedAt,
      claimStatus: claims.publicationStatus,
      entitySlug: entities.slug,
      entityName: entities.canonicalName,
      entityStatus: entities.publicationStatus,
    })
    .from(claims)
    .innerJoin(entities, eq(claims.entityId, entities.id))
    .where(eq(claims.id, claimId))
    .limit(1)

  if (!row) return null
  // Both the claim and its entity must be public — a published claim on an unpublished
  // entity (or vice versa) has no canonical page to link back to and must not be embeddable.
  if (row.claimStatus !== 'published' || row.entityStatus !== 'published') return null
  return row
}

function parseClaimId(raw: string): number | null {
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) return null
  return id
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { claimId } = await params
  const id = parseClaimId(claimId)
  if (id === null) return {}
  const claim = await getEmbeddableClaim(id)
  if (!claim) return {}
  return { title: claim.consumerQuestion }
}

export default async function EmbedClaimPage({ params }: Props) {
  const { claimId } = await params
  const id = parseClaimId(claimId)
  if (id === null) notFound()

  const claim = await getEmbeddableClaim(id)
  if (!claim) notFound()

  const lastReviewed = claim.lastReviewedAt ? claim.lastReviewedAt.toISOString().slice(0, 10) : null
  const canonicalHref = claimAnchorUrl(claim.entitySlug, claim.slug)
  const stage = stageRank(claim.proofBoundaryStage) + 1

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        background: 'var(--surface)',
        color: 'var(--ink)',
        padding: 'var(--s5)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s4)',
      }}
    >
      <p className="eyebrow">RNAwiki · {claim.entityName}</p>

      <h1
        className="h3"
        style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--size-h3)', letterSpacing: '-0.008em' }}
      >
        {claim.consumerQuestion}
      </h1>

      <p style={{ fontSize: 'var(--size-small)', lineHeight: 'var(--leading-body)', color: 'var(--ink-soft)' }}>
        {claim.directAnswer}
      </p>

      <dl className="speclabel">
        <div className="speclabel__row">
          <dt className="speclabel__key">Evidence stops at</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            {PROOF_BOUNDARY_LABELS[claim.proofBoundaryStage]} — stage {stage} of {PROOF_BOUNDARY_STAGES.length}
          </dd>
        </div>
        <div className="speclabel__row">
          <dt className="speclabel__key">Because</dt>
          <dd className="speclabel__val" style={{ margin: 0 }}>
            {claim.proofBoundaryExplanation}
          </dd>
        </div>
      </dl>

      <p className="metaline" style={{ marginTop: 'auto', paddingTop: 'var(--s3)' }}>
        <span>{lastReviewed ? `Last reviewed ${lastReviewed}` : 'Editorial review pending'}</span>
        <a href={canonicalHref} target="_blank" rel="noopener noreferrer">
          Full record on RNAwiki ↗
        </a>
      </p>
    </div>
  )
}
