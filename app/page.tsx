// The home page — the reference wireframe's `currentView === 'home'` branch, as a route.
//
// The wireframe assembled this view from a six-item array in localStorage: the featured card was
// `drugs.find((d) => d.id === 'inclisiran')` and the "Popular:" row was `drugs.slice(0, 4)`. There
// is no local ledger here and no hard-coded spotlight, so both come from the database, ordered by
// curation depth and reads (`lib/queries/drugs.ts`).

import type { Metadata } from 'next'
import { AppShell } from '@/components/AppShell'
import { HomeView } from '@/components/HomeView'
import { countByDepth, countDrugs, getFeaturedDrug, getPopularDrugs } from '@/lib/queries/drugs'
import { getCurrentUser } from '@/lib/session'

// Railway's build container cannot resolve `postgres.railway.internal` — that hostname exists only
// at runtime, inside the deployed network. A DB-backed route with no dynamic segment is a
// prerender candidate, so without this the production build fails here while passing locally.
export const dynamic = 'force-dynamic'

/** The reference showed four names on the "Popular:" row. */
const POPULAR_LIMIT = 4

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  // One round trip each, in parallel: the home page's five reads are independent, and awaiting
  // them in sequence would add four round trips of latency to the first paint for no benefit.
  const [user, featured, popular, total, depth] = await Promise.all([
    getCurrentUser(),
    getFeaturedDrug(),
    getPopularDrugs(POPULAR_LIMIT),
    countDrugs(),
    countByDepth(),
  ])

  return (
    <AppShell initialUser={user}>
      {/* Every number here is a real `count(*)`. Nothing on this page is a stored estimate, a
          rounded headline figure or a placeholder — see `countDrugs` / `countByDepth`. */}
      <HomeView
        featured={featured}
        popular={popular}
        corpusStats={{ total, flagship: depth.flagship, curated: depth.curated }}
      />
    </AppShell>
  )
}
