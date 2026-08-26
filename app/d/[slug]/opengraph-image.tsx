import { ImageResponse } from 'next/og'

import { getPublicMedicineNameBySlug } from '@/lib/queries/drugs'
import { getPublicMedicineProjections } from '@/lib/queries/public-medicine-projection'

export const alt = 'RNAWiki medicine evidence record'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const dynamic = 'force-dynamic'

export default async function DossierOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [medicineName, projections] = await Promise.all([
    getPublicMedicineNameBySlug(slug),
    getPublicMedicineProjections([slug]),
  ])
  const summary = projections.get(slug)?.cardSummary
  const reviewed = summary?.kind === 'reviewed_programme'
  const finding = reviewed ? summary.text : undefined

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'linear-gradient(145deg, #eaf4ff 0%, #f5f5f7 58%, #ffffff 100%)',
        color: '#1d1d1f',
        padding: '70px 78px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#0071e3', fontSize: 28, fontWeight: 800 }}>RNAWiki</div>
        <div
          style={{
            border: '1px solid rgba(0,113,227,.25)',
            borderRadius: 999,
            background: 'rgba(255,255,255,.8)',
            color: reviewed ? '#067647' : '#6e6e73',
            padding: '10px 18px',
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {reviewed ? 'Reviewed evidence answer' : 'Medicine evidence record'}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1040 }}>
        <div style={{ fontSize: 70, lineHeight: 1.05, fontWeight: 800, letterSpacing: '-2.5px' }}>
          {medicineName ?? 'Medicine evidence'}
        </div>
        <div style={{ color: '#424245', fontSize: 29, lineHeight: 1.35 }}>
          {finding ?? 'What the evidence shows — and what it does not yet prove.'}
        </div>
      </div>
      <div style={{ color: '#6e6e73', fontSize: 22 }}>
        Evidence, trial results &amp; what remains unknown · rnawiki.com
      </div>
    </div>,
    size,
  )
}
