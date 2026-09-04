// Minimal home page. The server supplies the popular searches and exact database counts; the
// search box is the only client-side part.
//
// The search bar above is frozen: its component, its props and its position in the section are
// unchanged. Everything below it is the corpus entry: the organism-ladder legend (the recurring
// diagram of a record), the five facet indexes of the browse spec, then the counts line.

import Link from 'next/link'

import { FacetNav } from '@/app/browse/facet-view'

import { HomeSearch } from './HomeSearch'
import { OrganismLadderLegend } from './corpus/OrganismLadderLegend'
import { HomepageContributorSpotlight } from './home/HomepageContributorSpotlight'
import type { SearchHit } from '@/lib/api-client'
import type { HomepageContributorSpotlightView } from '@/lib/homepage-contributor-spotlight'

export interface CorpusStats {
  /** Every record in the corpus, including records not yet moved to the programme model. */
  total: number
  programmes: number
  reviewedProgrammes: number
}

export interface HomeViewProps {
  contributorSpotlight: HomepageContributorSpotlightView
  popular: SearchHit[]
  corpusStats: CorpusStats
}

const LADDER_HEADING_ID = 'home-organism-ladder'

export function HomeView({ contributorSpotlight, popular, corpusStats }: HomeViewProps) {
  const showCorpusLine = corpusStats.total > 0

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16 sm:space-y-24 animate-fade-in">
      <section className="text-center space-y-6 sm:space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1D1D1F] leading-tight">
            Understand any drug <br />
            in <span className="text-[#0071E3]">10 seconds</span>.
          </h1>

          <p className="text-sm sm:text-base text-[#6E6E73] max-w-md mx-auto leading-relaxed">
            See what it changes in the body, what human studies found, and what is still unknown.
          </p>
        </div>

        <HomeSearch popular={popular} />
      </section>

      <div className="space-y-10">
        <section className="space-y-4" aria-labelledby={LADDER_HEADING_ID}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-1">
            <h2
              id={LADDER_HEADING_ID}
              className="text-lg font-semibold tracking-tight"
              style={{ fontFamily: 'var(--corpus-serif)', color: 'var(--corpus-ink-0)' }}
            >
              Organism ladder
            </h2>
            <Link
              href="/definitions"
              className="text-xs font-semibold underline underline-offset-2"
              style={{ color: 'var(--corpus-ink-2)' }}
            >
              Definitions
            </Link>
          </div>

          <OrganismLadderLegend className="block h-auto w-full max-w-[22rem] px-1" />
        </section>

        <section className="space-y-4">
          <div className="px-1">
            <FacetNav />
          </div>

          {showCorpusLine && (
            <p className="px-1 text-[11px] text-[#6E6E73] leading-relaxed">
              {corpusStats.total.toLocaleString()} medicine records
              {corpusStats.programmes > 0 && (
                <>
                  {' '}
                  &middot; {corpusStats.programmes.toLocaleString()} specific medicine uses recorded
                </>
              )}
              {corpusStats.reviewedProgrammes > 0 && (
                <>
                  {' '}
                  &middot; {corpusStats.reviewedProgrammes.toLocaleString()} with reviewed
                  conclusions
                </>
              )}
            </p>
          )}
        </section>
      </div>

      <HomepageContributorSpotlight spotlight={contributorSpotlight} />
    </div>
  )
}
