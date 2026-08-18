import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { claims, entities } from '@/db/schema'
import { claimAnchorUrl } from '@/lib/canonical'
import { isoDate, readableDate } from '@/lib/evidence-view'
import { EvidenceReach } from '@/components/EvidenceReach'

// Embeddable single-claim view. Third-party sites iframe this route directly (see
// components/EmbedCodeBox.tsx for the snippet readers copy). next.config.mjs already sends
// X-Robots-Tag: noindex for everything under /embed/:path*.
//
// Self-contained by construction: it inherits no site chrome, depends on no page container, sizes
// everything relatively so it reads at any iframe width, and ships no client JavaScript. It uses
// only primitives from app/globals.css.

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

  const canonicalHref = claimAnchorUrl(claim.entitySlug, claim.slug)
  const reviewed = claim.lastReviewedAt

  return (
    <div className="embed">
      <p className="small muted">RNAwiki · {claim.entityName}</p>

      <h1 style={{ fontSize: '1.375rem', marginTop: 'var(--s2)' }}>{claim.consumerQuestion}</h1>

      <p style={{ marginTop: 'var(--s3)' }}>{claim.directAnswer}</p>

      <div style={{ marginTop: 'var(--s5)' }}>
        <EvidenceReach stage={claim.proofBoundaryStage} />
      </div>

      <div className="detail-block" style={{ marginTop: 'var(--s5)' }}>
        <p className="detail-block__h">Why it stops there</p>
        <p className="muted small">{claim.proofBoundaryExplanation}</p>
      </div>

      <p className="small muted" style={{ marginTop: 'var(--s5)' }}>
        {reviewed && (
          <>
            Checked <time dateTime={isoDate(reviewed)}>{readableDate(reviewed)}</time>.{' '}
          </>
        )}
        <a href={canonicalHref} target="_blank" rel="noopener noreferrer">
          Read the full record on RNAwiki
        </a>
      </p>
    </div>
  )
}
