import { ImageResponse } from 'next/og'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { claims } from '@/db/schema'
import { getPublishedEntityBySlug } from '@/lib/queries/entities'
import { PROOF_BOUNDARY_LABELS } from '@/lib/evidence'
import { entityUrl } from '@/lib/canonical'

export const runtime = 'nodejs' // needs the pg pool via Drizzle, not edge-compatible
export const revalidate = 3600

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'RNAwiki — Proof Boundary summary'

// Hardcoded from app/globals.css's :root block. ImageResponse (satori) renders outside the
// browser and cannot read CSS custom properties, so these hex values must be kept in sync with
// globals.css by hand — there is no single source of truth across the two files. Light palette
// only: an OG image is generated once and served to arbitrary crawlers/readers with no way to
// know their color scheme, so it always uses the light tokens for guaranteed contrast.
const COLOR_BG = '#fbfaf7'
const COLOR_BORDER = '#dedad0'
const COLOR_TEXT = '#1c1b17'
const COLOR_TEXT_MUTED = '#56534a'
const COLOR_TEXT_FAINT = '#837e70'
const COLOR_ACCENT = '#0f5c52'
const COLOR_ACCENT_STRONG = '#0a3f39'
const COLOR_ACCENT_TINT = '#e4efec'

interface Props {
  params: Promise<{ slug: string }>
}

async function getTopPublishedClaim(entityId: number) {
  const [row] = await db
    .select({
      consumerQuestion: claims.consumerQuestion,
      directAnswer: claims.directAnswer,
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
  const boundaryLabel = topClaim ? PROOF_BOUNDARY_LABELS[topClaim.proofBoundaryStage] : null
  const reviewDate = topClaim ? (topClaim.lastReviewedAt ? topClaim.lastReviewedAt.toISOString().slice(0, 10) : 'Pending review') : null
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
          {boundaryLabel && (
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
                Proof Boundary — {boundaryLabel}
              </div>
              {reviewDate && <div style={{ display: 'flex', fontSize: 20, color: COLOR_TEXT_FAINT }}>Reviewed {reviewDate}</div>}
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
