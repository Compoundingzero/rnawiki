// The home page body, ported from the master reference wireframe (src/components/HomeView.tsx).
//
// Layout, spacing, section order, copy, colours and icons are the reference's: the same
// `max-w-xl` column, the same `space-y-16 sm:space-y-24` rhythm, the same hero, the same
// "Featured Today" card down to the two-up price panel and the ArrowRight footer row.
//
// It is a server component. The reference held the whole ledger in the browser and filtered it on
// every keystroke; here the featured record, the popular row and the corpus counts are resolved by
// the page's server component and passed in, so the home page is real HTML before any JavaScript
// runs. The only interactive part — the search box — is its own client component.
//
// Divergences, all sanctioned (CLAUDE.md), none of them visual:
//
//  1. The wireframe picked its spotlight with `drugs.find((d) => d.id === 'inclisiran')`. The
//     server picks it now (`getFeaturedDrug`), and it can legitimately be null on an empty
//     database — so the featured section is conditional instead of assuming `drugs[0]` exists.
//  2. The hard-coded price fallbacks are DELETED. The reference printed `'$5.00 / dose'` and
//     `'$3,250 / dose'` whenever `pricing` was missing, which invents a number under a real
//     medicine's name. Missing pricing now renders the same panel shape reading
//     "Not yet documented", with a quiet way in to fix it.
//  3. The card is a `next/link`, not a `<div onClick>`, so it can be opened in a new tab,
//     middle-clicked, focused, and announced as a link.
//  4. One added line of real corpus statistics, counted by `count(*)` — never an estimate.

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { HomeSearch } from './HomeSearch'
import type { SearchHit } from '@/lib/api-client'
import type { DrugDossier } from '@/lib/types'

export interface CorpusStats {
  /** Every record in the corpus, stubs included. */
  total: number
  flagship: number
  curated: number
}

export interface HomeViewProps {
  /** Null on an empty database. The hero and search still render; the spotlight section does not. */
  featured: DrugDossier | null
  popular: SearchHit[]
  corpusStats: CorpusStats
}

/** Local copies of two one-line helpers that are file-private in DrugDossierView.tsx. */
function hasText(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * "$3,250 / dose (list price)" -> "$3,250 / dose". The reference wrote this inline as
 * `.split('(')[0]?.trim()`; under `noUncheckedIndexedAccess` that element is possibly undefined,
 * so falling back to the whole string is explicit.
 */
function priceHeadline(value: string): string {
  const head = value.split('(')[0]
  return (head ?? value).trim()
}

export function HomeView({ featured, popular, corpusStats }: HomeViewProps) {
  // "Full dossier" means curated or flagship. A stub is an ingested name and a regulatory status,
  // which is not a dossier, and counting it as one would overstate what this site actually holds.
  const documented = corpusStats.flagship + corpusStats.curated
  const showCorpusLine = corpusStats.total > 0

  const synthesisCost = hasText(featured?.pricing?.synthesisCostPerDose)
    ? featured?.pricing?.synthesisCostPerDose
    : null
  const retailPrice = hasText(featured?.pricing?.retailPricePerDoseOrYear)
    ? priceHeadline(featured?.pricing?.retailPricePerDoseOrYear ?? '')
    : null

  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16 sm:space-y-24 animate-fade-in">
      {/* 1. Spacious, Pure Minimalist Hero & Main Search CTA */}
      <section className="text-center space-y-6 sm:space-y-8">
        {/* Main Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1D1D1F] leading-tight">
            Understand any medicine <br />
            in <span className="text-[#0071E3]">10 seconds</span>.
          </h1>

          <p className="text-sm sm:text-base text-[#6E6E73] max-w-md mx-auto leading-relaxed">
            All drugs operate through RNA. We publish the chemical formulas, clinical proof, and real
            manufacturing costs.
          </p>
        </div>

        {/* Grand Spotlight Search Bar (Unmissable Main CTA) — the reference's search box, its
            dropdown and its "Popular:" row, all of which now query the server. */}
        <HomeSearch popular={popular} />
      </section>

      {/* 2. Apple-Clean Featured Medicine Card */}
      {(featured || showCorpusLine) && (
        <section className="space-y-3">
          {featured && (
            <>
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#86868B]">
                  Featured Today
                </span>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {featured.approvalStatus}
                </span>
              </div>

              {/* `drug.id` IS the public slug — see the note in `rowToDossier` (lib/dossier.ts). */}
              <Link
                href={`/d/${featured.id}`}
                className="group block bg-white hover:bg-[#FAFAFC] rounded-3xl p-6 sm:p-8 border border-black/[0.08] hover:border-[#0071E3]/40 shadow-[0_2px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,113,227,0.08)] transition-all cursor-pointer space-y-5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight group-hover:text-[#0071E3] transition">
                      {featured.name}{' '}
                      {featured.tradeName && (
                        <span className="text-lg text-[#86868B] font-normal">
                          ({featured.tradeName})
                        </span>
                      )}
                    </h2>
                    <span className="text-xs font-bold text-[#0071E3] bg-blue-50 px-3 py-1 rounded-full border border-[#0071E3]/20 shrink-0">
                      {featured.modality}
                    </span>
                  </div>

                  {/* An unwritten verdict renders as nothing rather than as an empty line of
                      emphasis. Absence is absence. */}
                  {hasText(featured.oneSentenceVerdict) && (
                    <p className="text-sm text-[#1D1D1F] font-medium leading-snug">
                      {featured.oneSentenceVerdict}
                    </p>
                  )}
                </div>

                {/* Simple Clean Price Pill. The reference fell back to '$5.00 / dose' and
                    '$3,250 / dose' here; those are deleted. An undocumented cost says so. */}
                <div className="flex items-center justify-between bg-[#F5F5F7] group-hover:bg-blue-50/50 p-4 rounded-2xl transition text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#86868B] block">
                      Synthesis Cost
                    </span>
                    <span
                      className={`text-sm font-bold font-mono block ${
                        synthesisCost ? 'text-emerald-800' : 'text-[#86868B]'
                      }`}
                    >
                      {synthesisCost ?? 'Not yet documented'}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-black/[0.08]" />
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#86868B] block">
                      Retail Price
                    </span>
                    <span
                      className={`text-sm font-bold font-mono block ${
                        retailPrice ? 'text-[#1D1D1F]' : 'text-[#86868B]'
                      }`}
                    >
                      {retailPrice ?? 'Not yet documented'}
                    </span>
                  </div>
                </div>

                {/* The way in to fix it. A `<span>`, not an `<a>`: this card already is a link to
                    the dossier where the pricing editor lives, and an anchor inside an anchor is
                    invalid HTML that browsers resolve unpredictably. */}
                {(!synthesisCost || !retailPrice) && (
                  <span className="block text-[11px] font-bold text-[#0071E3] group-hover:underline">
                    Add it
                  </span>
                )}

                {/* Action Link */}
                <div className="flex items-center justify-between pt-2 border-t border-black/[0.05] text-xs sm:text-sm font-bold text-[#0071E3]">
                  <span>Read 10-Second Dossier</span>
                  <div className="flex items-center gap-1 group-hover:translate-x-1 transition">
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            </>
          )}

          {/* Real counts from `count(*)`, never an estimate. The last clause is dropped when there
              is nothing left awaiting a contributor, rather than printing a claim that is false. */}
          {showCorpusLine && (
            <p className="px-1 text-[11px] text-[#86868B] leading-relaxed">
              {corpusStats.total.toLocaleString()} medicines indexed &middot;{' '}
              {documented.toLocaleString()} with a full dossier
              {documented < corpusStats.total && <> &middot; everything else awaiting a contributor</>}
            </p>
          )}
        </section>
      )}
    </div>
  )
}
