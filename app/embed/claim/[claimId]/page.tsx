import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { claims, entities } from '@/db/schema'
import { claimAnchorUrl } from '@/lib/canonical'
import { ProofBoundaryDivider } from '@/components/ProofBoundaryDivider'

// Embeddable single-claim view. Third-party sites iframe this route directly (see
// components/EmbedCodeBox.tsx for the snippet readers copy). next.config.mjs already sends
// X-Robots-Tag: noindex for everything under /embed/:path*.
//
// NOTE for integration: this page is still wrapped by the root layout in app/layout.tsx
// (SiteHeader/SiteFooter), because Next.js App Router only supports one root <html>/<body>
// per app unless every route is moved into route groups with their own root layouts — out of
// scope for this task and not something this task may change (app/layout.tsx is a shared
// file). See filesToWireIn in this task's report for the follow-up this needs.

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

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.9em',
        padding: '1.15em 1.3em',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-sans)',
        fontSize: '15px',
        lineHeight: 1.5,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '0.72em',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--color-text-faint)',
        }}
      >
        RNAwiki · {claim.entityName}
      </p>

      <h1 style={{ margin: 0, fontSize: '1.15em', fontWeight: 650, lineHeight: 1.3 }}>{claim.consumerQuestion}</h1>

      <p style={{ margin: 0 }}>{claim.directAnswer}</p>

      <div>
        <ProofBoundaryDivider stage={claim.proofBoundaryStage} />
        <p style={{ margin: 0, fontSize: '0.92em', color: 'var(--color-text-muted)' }}>
          {claim.proofBoundaryExplanation}
        </p>
      </div>

      <div
        style={{
          marginTop: 'auto',
          paddingTop: '0.8em',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75em',
          fontSize: '0.78em',
          color: 'var(--color-text-faint)',
        }}
      >
        <span>{lastReviewed ? `Last reviewed: ${lastReviewed}` : 'Editorial review pending.'}</span>
        <a href={canonicalHref} target="_blank" rel="noopener noreferrer">
          See full evidence on RNAwiki →
        </a>
      </div>
    </div>
  )
}
