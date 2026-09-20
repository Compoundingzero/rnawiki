import type { Metadata } from 'next'
import { AppShell } from '@/components/AppShell'
import { HomeView } from '@/components/HomeView'
import { countDrugs, countProgrammeEvidence, getPopularDrugs } from '@/lib/queries/drugs'
import { listHomepageContributorSpotlight } from '@/lib/queries/homepage-contributor-spotlight'
import { serialiseJsonLd, siteJsonLdGraph } from '@/lib/json-ld'
import { configuredPublicUrl } from '@/lib/seo/deployment'
import { getCurrentUser } from '@/lib/session'
import { goalIndex } from '@/lib/dossier-v3/goal-pages'
import '@/lib/corpus/tokens.css'

// Railway's build container cannot resolve `postgres.railway.internal` — that hostname exists only
// at runtime, inside the deployed network. A DB-backed route with no dynamic segment is a
// prerender candidate, so without this the production build fails here while passing locally.
export const dynamic = 'force-dynamic'

const POPULAR_LIMIT = 4
const siteUrl = configuredPublicUrl('/')

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [user, popular, total, programmeCounts, contributorSpotlight, goals] = await Promise.all([
    getCurrentUser(),
    getPopularDrugs(POPULAR_LIMIT),
    countDrugs(),
    countProgrammeEvidence(),
    listHomepageContributorSpotlight(),
    goalIndex(),
  ])
  const jsonLd = siteJsonLdGraph({ siteUrl })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serialiseJsonLd(jsonLd) }}
      />
      <AppShell initialUser={user}>
        <HomeView
          contributorSpotlight={contributorSpotlight}
          availableGoals={[...goals.byGoal.entries()]
            .filter(([, rows]) => rows.length > 0)
            .map(([code]) => code)}
          popular={popular}
          corpusStats={{
            total,
            programmes: programmeCounts.programmes,
            reviewedProgrammes: programmeCounts.reviewedProgrammes,
          }}
        />
      </AppShell>
    </>
  )
}
