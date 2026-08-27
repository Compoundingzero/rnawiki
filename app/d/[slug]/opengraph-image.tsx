import { ImageResponse } from 'next/og'

import { programmeEvidenceMedicineDossierView } from '@/lib/programme-dossier-view'
import { getPublicDrugBySlug, resolvePublicMedicineRoute } from '@/lib/queries/drugs'
import { getProgrammeEvidenceByMedicineSlug } from '@/lib/queries/programme-evidence'
import {
  dossierDiscoveryProjection,
  dossierSocialPreview,
  type DossierSocialPreview,
} from '@/lib/seo/metadata'

export const alt = 'RNAWiki medicine evidence record'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const dynamic = 'force-dynamic'

const FALLBACK_PREVIEW: DossierSocialPreview = {
  reviewedAnswer: false,
  badgeLabel: 'Medicine evidence record',
  finding: null,
}

/**
 * The card derives from the exact discovery projection behind the route's meta description: the
 * same canonical route resolution, the same default-programme dossier view and the same shared
 * fail-closed indexability policy. The image therefore cannot claim a reviewed answer, or quote a
 * finding, that the page's own description would refuse for the same URL.
 */
async function loadSocialPreview(
  slug: string,
): Promise<{ name: string | null; preview: DossierSocialPreview }> {
  const route = await resolvePublicMedicineRoute(slug)
  if (!route) return { name: null, preview: FALLBACK_PREVIEW }

  const [drug, programmeEvidence] = await Promise.all([
    getPublicDrugBySlug(route.canonicalSlug),
    getProgrammeEvidenceByMedicineSlug(route.canonicalSlug, null),
  ])
  if (!drug) return { name: null, preview: FALLBACK_PREVIEW }

  const dossier = programmeEvidence
    ? programmeEvidenceMedicineDossierView(drug, programmeEvidence)
    : null
  return {
    name: drug.name,
    preview: dossierSocialPreview(dossierDiscoveryProjection(drug, dossier).input),
  }
}

export default async function DossierOpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { name, preview } = await loadSocialPreview(slug)

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
            color: preview.reviewedAnswer ? '#067647' : '#6e6e73',
            padding: '10px 18px',
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          {preview.badgeLabel}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1040 }}>
        <div style={{ fontSize: 70, lineHeight: 1.05, fontWeight: 800, letterSpacing: '-2.5px' }}>
          {name ?? 'Medicine evidence'}
        </div>
        <div style={{ color: '#424245', fontSize: 29, lineHeight: 1.35 }}>
          {preview.finding ?? 'What the evidence shows — and what it does not yet prove.'}
        </div>
      </div>
      <div style={{ color: '#6e6e73', fontSize: 22 }}>
        Evidence, trial results &amp; what remains unknown · rnawiki.com
      </div>
    </div>,
    size,
  )
}
