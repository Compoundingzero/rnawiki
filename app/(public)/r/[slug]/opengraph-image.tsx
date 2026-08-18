import { ImageResponse } from 'next/og'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { claims } from '@/db/schema'
import { getPublishedEntityBySlug } from '@/lib/queries/entities'
import { plainHumanEvidence, stagePositionApplies, readableDate } from '@/lib/evidence-view'
import { entityUrl } from '@/lib/canonical'

export const runtime = 'nodejs' // needs the pg pool via Drizzle, not edge-compatible
export const revalidate = 3600

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'RNAwiki — what the evidence shows for this treatment'

// Hardcoded from app/globals.css's :root block. ImageResponse (satori) renders outside the
// browser and cannot read CSS custom properties, so these must be kept in sync by hand. They were
// left on the previous palette after the redesign, which is why a share card looked nothing like
// the page it linked to.
const COLOR_BG = '#ffffff'
const COLOR_BORDER = '#d2d2d7'
const COLOR_TEXT = '#1d1d1f'
const COLOR_TEXT_MUTED = '#6e6e73'
const COLOR_TEXT_FAINT = '#6e6e73'
const COLOR_ACCENT = '#0066cc'
const COLOR_ACCENT_STRONG = '#0052a6'
const COLOR_ACCENT_TINT = '#eef4fd'

interface Props {
  params: Promise<{ slug: string }>
}

async function getTopPublishedClaim(entityId: number) {
  const [row] = await db
    .select({
      consumerQuestion: claims.consumerQuestion,
      directAnswer: claims.directAnswer,
      claimType: claims.claimType,
      proofBoundaryStage: claims.proofBoundaryStage,
      lastReviewedAt: claims.lastReviewedAt,
    })
    .from(claims)
    .where(and(eq(claims.entityId, entityId), eq(claims.publicationStatus, 'published')))
    .orderBy(claims.displayPriority)
    .limit(1)
  return row ?? null
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

export default async function Image({ params }: Props) {
  const { slug } = await params
  const entity = await getPublishedEntityBySlug(slug)
  const topClaim = entity ? await getTopPublishedClaim(entity.id) : null

  const headline = entity ? entity.canonicalName : 'RNAwiki'
  const question = topClaim ? truncate(topClaim.consumerQuestion, 100) : null
  const bodyText = topClaim
    ? truncate(topClaim.directAnswer, 220)
    : entity
      ? truncate(entity.bottomLine, 220)
      : 'See where the evidence actually ends.'
  // Plain language, and only where a position means anything. A share card previously read
  // "Proof Boundary — Animal evidence", pushing the internal vocabulary to the widest audience
  // the site has.
  const evidenceLabel =
    topClaim && stagePositionApplies(topClaim.claimType)
      ? plainHumanEvidence(topClaim.proofBoundaryStage)
      : null
  // One complete phrase, not a label glued to a value: the fallback branch previously produced
  // "Reviewed Pending review".
  const reviewLine = topClaim
    ? topClaim.lastReviewedAt
      ? `Last checked ${readableDate(topClaim.lastReviewedAt)}`
      : 'Independent scientific review pending'
    : null
  const shortLink = entity ? entityUrl(entity.slug).replace(/^https?:\/\//, '') : 'rnawiki.com'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          background: COLOR_BG,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: COLOR_ACCENT_STRONG, letterSpacing: '-0.01em' }}>
            RNAwiki
          </div>
          <div style={{ display: 'flex', fontSize: 44, fontWeight: 700, color: COLOR_TEXT, lineHeight: 1.15 }}>
            {headline}
          </div>
          {question && <div style={{ display: 'flex', fontSize: 26, color: COLOR_TEXT_MUTED }}>{question}</div>}
          <div style={{ display: 'flex', fontSize: 30, color: COLOR_TEXT, lineHeight: 1.35 }}>{bodyText}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {evidenceLabel && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: `2px solid ${COLOR_ACCENT}`,
                  background: COLOR_ACCENT_TINT,
                  color: COLOR_ACCENT_STRONG,
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                }}
              >
                {evidenceLabel}
              </div>
              {reviewLine && <div style={{ display: 'flex', fontSize: 20, color: COLOR_TEXT_FAINT }}>{reviewLine}</div>}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: `1px solid ${COLOR_BORDER}`,
              paddingTop: '20px',
              fontSize: 22,
              color: COLOR_TEXT_FAINT,
            }}
          >
            <div style={{ display: 'flex' }}>{shortLink}</div>
            <div style={{ display: 'flex' }}>See what was measured, not just claimed.</div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
