import type { Metadata } from 'next'
import { AppShell } from '@/components/AppShell'
import { HomeView } from '@/components/HomeView'
import {
  countDrugs,
  countProgrammeEvidence,
  getFeaturedDrug,
  getPopularDrugs,
} from '@/lib/queries/drugs'
import { getPublicMedicineProjections } from '@/lib/queries/public-medicine-projection'
import { buildLegacyMedicineProjection } from '@/lib/public-medicine-projection'
import { getCurrentUser } from '@/lib/session'

// Railway's build container cannot resolve `postgres.railway.internal` — that hostname exists only
// at runtime, inside the deployed network. A DB-backed route with no dynamic segment is a
// prerender candidate, so without this the production build fails here while passing locally.
export const dynamic = 'force-dynamic'

const POPULAR_LIMIT = 4

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [user, featured, popular, total, programmeCounts] = await Promise.all([
    getCurrentUser(),
    getFeaturedDrug(),
    getPopularDrugs(POPULAR_LIMIT),
    countDrugs(),
    countProgrammeEvidence(),
  ])
  const featuredProjection = featured
    ? ((await getPublicMedicineProjections([featured.id])).get(featured.id) ??
      buildLegacyMedicineProjection({
        medicineSlug: featured.id,
        patientFriendlyIndication: featured.patientFriendlyIndication,
        indication: featured.indication,
      }))
    : null

  return (
    <AppShell initialUser={user}>
      <HomeView
        featured={featured}
        featuredProjection={featuredProjection}
        popular={popular}
        corpusStats={{
          total,
          programmes: programmeCounts.programmes,
          reviewedProgrammes: programmeCounts.reviewedProgrammes,
        }}
      />
    </AppShell>
  )
}
