import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { claims, entities } from '@/db/schema'
import { claimAnchorUrl } from '@/lib/canonical'
import { isoDate, readableDate, answerCheckPoint, stagePositionApplies } from '@/lib/evidence-view'
import { EvidenceReach } from '@/components/EvidenceReach'
import { parsePublicId } from '@/lib/public-ids'

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
      // Needed for the same reason every other surface selects it: an evidence position is
      // meaningless for a regulatory, access or mechanism claim, and this route syndicates to
      // sites RNAwiki does not control. See stagePositionApplies in lib/evidence-view.ts.
      claimType: claims.claimType,
      proofBoundaryStage: claims.proofBoundaryStage,
      proofBoundaryExplanation: claims.proofBoundaryExplanation,
      // `claims.updatedAt`, the same field the record page and the citation string call
      // "last checked". NOT `lastReviewedAt`, which this route used to print as "Checked": the
      // review queue stamps that column on every decision, rejected and needs-changes included,
      // so a claim a reviewer had REJECTED published "Checked <the rejection date>" onto third-
      // party sites. lib/citation.ts carries the long version of this note.
      lastCheckedAt: claims.updatedAt,
      checkedAt: claims.checkedAt,
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

// Shared with /api/v1/claims/[claimId] on purpose: this route had the identical defect, and this
// one is the route third-party sites iframe, so an out-of-range id here produced a 500 inside
// somebody else's page. See lib/public-ids.ts.
const parseClaimId = parsePublicId

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
  const check = answerCheckPoint(claim.checkedAt, claim.lastCheckedAt)

  return (
    <div className="embed">
      <p className="small muted">RNAwiki · {claim.entityName}</p>

      <h1 style={{ fontSize: '1.375rem', marginTop: 'var(--s2)' }}>{claim.consumerQuestion}</h1>

      <p style={{ marginTop: 'var(--s3)' }}>{claim.directAnswer}</p>

      {/* Gated exactly as on the record page, homepage, search, browse and the OG image. An
          unguarded ladder previously filled to "a medicines regulator reviewed the evidence and
          approved it" underneath "what does getting treated actually involve" — a logistics
          answer credited to a regulator, on the one surface that renders inside other people's
          pages. */}
      {stagePositionApplies(claim.claimType) && (
        <div style={{ marginTop: 'var(--s5)' }}>
          <EvidenceReach stage={claim.proofBoundaryStage} />
        </div>
      )}

      <div className="detail-block" style={{ marginTop: 'var(--s5)' }}>
        <p className="detail-block__h">Why it stops there</p>
        <p className="muted small">{claim.proofBoundaryExplanation}</p>
      </div>

      {/* Same rule as the record page: `updatedAt` is a write timestamp and may only be printed
          under "edited". `answerCheckPoint` picks the branch — see lib/evidence-view.ts. This
          string travels onto sites RNAwiki does not control, so it may not over-claim by a word. */}
      <p className="small muted" style={{ marginTop: 'var(--s5)' }}>
        This answer last {check.verb}{' '}
        <time dateTime={isoDate(check.date)}>{readableDate(check.date)}</time>.{' '}
        <a href={canonicalHref} target="_blank" rel="noopener noreferrer">
          Read the full record on RNAwiki
        </a>
      </p>
    </div>
  )
}
