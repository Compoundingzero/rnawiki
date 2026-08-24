// Minimal home page. The server supplies the featured record, popular searches, and exact database
// counts; the search box is the only client-side part.

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { HomeSearch } from './HomeSearch'
import type { SearchHit } from '@/lib/api-client'
import {
  toPublicMedicineCardView,
  type PublicMedicineProjection,
} from '@/lib/public-medicine-projection'
import { publicApprovalStatusLabel, publicMedicineTypeLabel } from '@/lib/public-medicine-language'
import type { DrugDossier } from '@/lib/types'

export interface CorpusStats {
  /** Every record in the corpus, including records not yet moved to the programme model. */
  total: number
  programmes: number
  reviewedProgrammes: number
}

export interface HomeViewProps {
  /** Null on an empty database: the hero and search render, the spotlight section does not. */
  featured: DrugDossier | null
  /** The only source of programme conclusions rendered by the featured card. */
  featuredProjection: PublicMedicineProjection | null
  popular: SearchHit[]
  corpusStats: CorpusStats
}

/** Keep long lists of brand names from overwhelming the featured heading. */
function tradeNameHeadline(tradeName: string, limit = 2): string {
  const names = tradeName
    .split('/')
    .map((name) => name.trim())
    .filter(Boolean)
  if (names.length <= limit) return names.join(' / ')
  return `${names.slice(0, limit).join(' / ')} +${names.length - limit} more`
}

export function HomeView({ featured, featuredProjection, popular, corpusStats }: HomeViewProps) {
  const showCorpusLine = corpusStats.total > 0
  const featuredCard = featuredProjection ? toPublicMedicineCardView(featuredProjection) : null

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

      {(featured || showCorpusLine) && (
        <section className="space-y-3">
          {featured && (
            <>
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#6E6E73]">
                  Featured medicine
                </span>
                <span className="rounded-full border border-black/[0.08] bg-white px-2.5 py-0.5 text-xs font-semibold text-[#424245]">
                  {publicApprovalStatusLabel(featured.approvalStatus)}
                </span>
              </div>

              <Link
                href={featuredCard ? featuredCard.href : `/d/${featured.id}`}
                className="group block bg-white hover:bg-[#FAFAFC] rounded-3xl p-6 sm:p-8 border border-black/[0.08] hover:border-[#0071E3]/40 shadow-[0_2px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,113,227,0.08)] transition-all cursor-pointer space-y-5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight group-hover:text-[#0071E3] transition">
                      {featured.name}{' '}
                      {featured.tradeName && (
                        <span
                          className="text-lg text-[#6E6E73] font-normal"
                          title={featured.tradeName}
                        >
                          ({tradeNameHeadline(featured.tradeName)})
                        </span>
                      )}
                    </h2>
                    <span className="text-xs font-bold text-[#0066CC] bg-blue-50 px-3 py-1 rounded-full border border-[#0071E3]/20 shrink-0">
                      {publicMedicineTypeLabel(featured.modality)}
                    </span>
                  </div>

                  {featuredCard?.context && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#6E6E73]">
                      {featuredCard.context}
                    </p>
                  )}
                  {featuredCard?.summary.text && (
                    <p className="text-sm text-[#1D1D1F] font-medium leading-snug">
                      {featuredCard.summary.text}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-black/[0.05] text-xs sm:text-sm font-bold text-[#0071E3]">
                  <span>Open medicine summary</span>
                  <div className="flex items-center gap-1 group-hover:translate-x-1 transition">
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            </>
          )}

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
      )}
    </div>
  )
}
