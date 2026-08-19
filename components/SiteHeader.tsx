'use client'

// The sticky frosted header, ported from the reference wireframe (src/components/Header.tsx).
//
// Three divergences, each forced by the move from a two-view single-page demo to a real routed
// site, and none of them visual:
//
//  1. `currentView` becomes `usePathname()`. The wireframe swapped the logo for a back-link on a
//     state variable; here the URL is the state, and a dossier lives at /d/[slug].
//  2. The centre search box queries the server. It filtered a six-item array in the wireframe;
//     the corpus is ~8,000+ records, so it debounces, discards stale answers and supports the
//     arrow keys — see `useDrugSearch` in ./HomeSearch.
//  3. The verified-physician pill is gated on `isVerifiedPhysician(user)`, never `user.isDoctor`.
//     `isDoctor` only records that someone said they were a doctor. The blue check has to mean a
//     steward looked at the credential, or it means nothing.

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Search, Stethoscope, User, X } from 'lucide-react'
import { isVerifiedPhysician, useApp } from './app-context'
import { useDrugSearch } from './HomeSearch'

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, setOpenModal } = useApp()

  // A dossier page is the only place the wireframe showed the nav search box, and the only place
  // it showed the back-link instead of the logo.
  const isDossierView = pathname.startsWith('/d/')

  const search = useDrugSearch((hit) => {
    search.reset()
    router.push(`/d/${hit.slug}`)
  })

  const showDropdown = search.isOpen && search.query.trim().length > 0

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 border-b border-black/[0.06] transition-all">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* 1. Left: Logo & Back Button */}
          <div className="flex items-center gap-3 shrink-0">
            {isDossierView ? (
              // A real navigation, so a real link: the wireframe's <button onClick> could not be
              // opened in a new tab, middle-clicked, or read as a link by a screen reader.
              <Link
                href="/"
                className="flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] hover:text-[#0077ED] transition cursor-pointer group py-1.5 whitespace-nowrap shrink-0"
              >
                <ArrowLeft
                  className="w-4 h-4 group-hover:-translate-x-0.5 transition shrink-0"
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">All Medicines</span>
                <span className="sr-only sm:hidden">All Medicines</span>
              </Link>
            ) : (
              <Link href="/" className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                <span className="text-base font-bold tracking-tight text-[#1D1D1F]">
                  RNA<span className="text-[#0071E3]">wiki</span>
                  <span className="text-[11px] font-normal text-[#86868B]">.com</span>
                </span>
                <span className="hidden sm:inline text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap shrink-0">
                  Open Science
                </span>
              </Link>
            )}
          </div>

          {/* 2. Center: Top Banner Search Bar (Visible on Drug Page) */}
          <div className="flex-1 max-w-md mx-auto relative min-w-0">
            {isDossierView && (
              <div className="relative" ref={search.containerRef}>
                <div className="flex items-center bg-[#F5F5F7] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0071E3]/20 focus-within:border-[#0071E3] rounded-full px-3 py-1.5 border border-black/[0.06] transition-all">
                  <Search className="w-3.5 h-3.5 text-[#86868B] shrink-0 mr-1.5" aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Search medicine or target..."
                    value={search.query}
                    onChange={(e) => search.setQuery(e.target.value)}
                    onFocus={search.open}
                    onKeyDown={search.onKeyDown}
                    className="w-full bg-transparent text-xs text-[#1D1D1F] focus:outline-none placeholder:text-[#86868B] font-medium"
                    aria-label="Search medicine or target"
                    role="combobox"
                    aria-expanded={showDropdown}
                    aria-controls={search.listboxId}
                    aria-autocomplete="list"
                    aria-activedescendant={
                      search.activeIndex >= 0 ? search.optionId(search.activeIndex) : undefined
                    }
                  />
                  {search.query && (
                    <button
                      type="button"
                      onClick={() => search.reset()}
                      className="text-[#86868B] hover:text-[#1D1D1F] p-0.5"
                      aria-label="Clear search"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {/* Dropdown in Nav Header */}
                {showDropdown && (
                  <div
                    id={search.listboxId}
                    role="listbox"
                    aria-label="Search results"
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-black/[0.08] shadow-xl overflow-hidden divide-y divide-black/[0.04] max-h-72 overflow-y-auto z-50 animate-fade-in animate-slide-down"
                  >
                    {search.results.length === 0 ? (
                      <div className="p-3 text-xs text-[#86868B] text-center">
                        {/* Network latency the wireframe's in-memory filter did not have: saying
                            "no matches" before the answer arrives states something untrue. */}
                        {search.isSearching ? 'Searching…' : 'No matches found'}
                      </div>
                    ) : (
                      search.results.map((drug, index) => (
                        <button
                          key={drug.slug}
                          type="button"
                          id={search.optionId(index)}
                          role="option"
                          aria-selected={index === search.activeIndex}
                          onMouseEnter={() => search.setActiveIndex(index)}
                          onClick={() => {
                            search.reset()
                            router.push(`/d/${drug.slug}`)
                          }}
                          className={`w-full text-left p-3 hover:bg-[#F5F5F7] transition cursor-pointer flex items-center justify-between gap-2 ${
                            index === search.activeIndex ? 'bg-[#F5F5F7]' : ''
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-[#1D1D1F]">{drug.name}</span>
                              {drug.tradeName && (
                                <span className="text-[10px] text-[#86868B]">
                                  ({drug.tradeName})
                                </span>
                              )}
                              <span className="text-[9px] font-semibold bg-blue-50 text-[#0071E3] px-1.5 py-0.2 rounded-full">
                                {drug.modality}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#6E6E73] truncate">
                              {drug.patientFriendlyIndication}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Right: Doctor / Contributor Log-in */}
          <div className="flex items-center gap-2 shrink-0">
            {isVerifiedPhysician(currentUser) && currentUser ? (
              <button
                type="button"
                onClick={() => setOpenModal('auth')}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#0071E3] bg-[#0071E3]/10 hover:bg-[#0071E3]/15 px-3 py-1.5 rounded-full border border-[#0071E3]/20 transition cursor-pointer whitespace-nowrap shrink-0"
                aria-label={`Account for ${currentUser.name}, verified physician`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0071E3] shrink-0" aria-hidden="true" />
                <span className="max-w-[80px] sm:max-w-[120px] truncate">{currentUser.name}</span>
                <span className="text-[10px] opacity-85 font-bold shrink-0">MD ✓</span>
              </button>
            ) : currentUser ? (
              <button
                type="button"
                onClick={() => setOpenModal('auth')}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#1D1D1F] bg-black/[0.04] hover:bg-black/[0.08] px-3 py-1.5 rounded-full transition cursor-pointer whitespace-nowrap shrink-0"
                aria-label={`Account for ${currentUser.name}`}
              >
                <User className="w-3.5 h-3.5 text-[#86868B] shrink-0" aria-hidden="true" />
                <span className="max-w-[70px] sm:max-w-[110px] truncate">{currentUser.name}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setOpenModal('auth')}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#1D1D1F] hover:text-[#0071E3] bg-black/[0.03] hover:bg-[#0071E3]/10 px-3 py-1.5 rounded-full border border-black/[0.04] hover:border-[#0071E3]/20 transition cursor-pointer whitespace-nowrap shrink-0"
              >
                <Stethoscope className="w-3.5 h-3.5 text-[#0071E3] shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Doctor &amp; Contributor Log-in</span>
                <span className="sm:hidden">Log in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
