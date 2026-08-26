'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, User, X } from 'lucide-react'
import { useApp } from './app-context'
import { useDrugSearch } from './HomeSearch'
import { searchHitHref } from '@/lib/api-client'
import { publicMedicineTypeLabel } from '@/lib/public-medicine-language'

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, sessionActionLocked, setOpenModal } = useApp()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const isDossierView = pathname.startsWith('/d/')

  const search = useDrugSearch((hit) => {
    search.reset()
    router.push(searchHitHref(hit))
  })

  const showDropdown = search.isOpen && search.query.trim().length > 0

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 border-b border-black/[0.06] transition-all">
      <div
        className={`${isDossierView ? 'max-w-[1180px] sm:px-8' : 'max-w-4xl sm:px-6'} mx-auto px-4`}
      >
        <div className="relative flex h-14 items-center justify-between gap-3 sm:h-16">
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2 cursor-pointer select-none shrink-0">
              <span className="text-base font-bold tracking-tight text-[#1D1D1F]">
                <span className="font-serif text-[#0A66D8]">RNA</span>Wiki
              </span>
              {!isDossierView && (
                <span className="hidden sm:inline text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap shrink-0">
                  Public evidence
                </span>
              )}
            </Link>
          </div>

          <div
            className={`${mobileSearchOpen ? 'absolute inset-x-0 top-[3.75rem] block rounded-2xl border border-black/[0.08] bg-white p-2 shadow-xl' : 'hidden'} z-50 min-w-0 flex-1 sm:relative sm:inset-auto sm:top-auto sm:mx-auto sm:block sm:max-w-md sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none`}
          >
            {isDossierView && (
              <div className="relative" ref={search.containerRef}>
                <div className="flex items-center bg-[#F5F5F7] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0071E3]/20 focus-within:border-[#0071E3] rounded-full px-3 py-1.5 border border-black/[0.06] transition-all">
                  <Search
                    className="w-3.5 h-3.5 text-[#6E6E73] shrink-0 mr-1.5"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    placeholder="Search medicines, conditions, trials..."
                    value={search.query}
                    onChange={(e) => search.setQuery(e.target.value)}
                    onFocus={search.open}
                    onKeyDown={search.onKeyDown}
                    className="w-full bg-transparent text-xs text-[#1D1D1F] focus:outline-none placeholder:text-[#6E6E73] font-medium"
                    aria-label="Search by medicine, condition, gene, or protein"
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
                      className="text-[#6E6E73] hover:text-[#1D1D1F] p-0.5"
                      aria-label="Clear search"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  )}
                </div>

                {showDropdown && (
                  <div
                    id={search.listboxId}
                    role="listbox"
                    aria-label="Search results"
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-black/[0.08] shadow-xl overflow-hidden divide-y divide-black/[0.04] max-h-72 overflow-y-auto z-50 animate-fade-in animate-slide-down"
                  >
                    {search.results.length === 0 ? (
                      <div className="p-3 text-xs text-[#6E6E73] text-center">
                        {search.isSearching ? 'Searching…' : 'No matches found'}
                      </div>
                    ) : (
                      search.results.map((drug, index) => (
                        <Link
                          key={drug.slug}
                          href={searchHitHref(drug)}
                          id={search.optionId(index)}
                          role="option"
                          aria-selected={index === search.activeIndex}
                          onMouseEnter={() => search.setActiveIndex(index)}
                          onClick={search.reset}
                          className={`w-full text-left p-3 hover:bg-[#F5F5F7] transition cursor-pointer flex items-center justify-between gap-2 ${
                            index === search.activeIndex ? 'bg-[#F5F5F7]' : ''
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-[#1D1D1F]">{drug.name}</span>
                              {drug.tradeName && (
                                <span className="text-[10px] text-[#6E6E73]">
                                  ({drug.tradeName})
                                </span>
                              )}
                              <span className="text-[9px] font-semibold bg-blue-50 text-[#0071E3] px-1.5 py-0.2 rounded-full">
                                {publicMedicineTypeLabel(drug.modality)}
                              </span>
                            </div>
                            {drug.summaryContext && (
                              <div className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-wide text-[#6E6E73]">
                                {drug.summaryContext}
                              </div>
                            )}
                            <div className="mt-0.5 truncate text-[10px] text-[#6E6E73]">
                              {drug.patientFriendlyIndication}
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isDossierView && (
              <button
                type="button"
                onClick={() => setMobileSearchOpen((open) => !open)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-[#424245] hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66D8] sm:hidden"
                aria-label={mobileSearchOpen ? 'Close medicine search' : 'Search medicines'}
                aria-expanded={mobileSearchOpen}
              >
                {mobileSearchOpen ? (
                  <X className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Search className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            )}
            {sessionActionLocked ? (
              <span className="flex items-center gap-1.5 rounded-full border border-black/[0.04] bg-black/[0.03] px-3 py-1.5 text-xs font-semibold text-[#6E6E73]">
                <User className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Checking account…</span>
                <span className="sm:hidden">Checking…</span>
              </span>
            ) : currentUser ? (
              <button
                type="button"
                onClick={() => setOpenModal('account')}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#1D1D1F] bg-black/[0.04] hover:bg-black/[0.08] px-3 py-1.5 rounded-full transition cursor-pointer whitespace-nowrap shrink-0"
                aria-label={`Account for ${currentUser.name}`}
              >
                <User className="w-3.5 h-3.5 text-[#6E6E73] shrink-0" aria-hidden="true" />
                <span className="max-w-[70px] sm:max-w-[110px] truncate">{currentUser.name}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setOpenModal('auth')}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#1D1D1F] hover:text-[#0071E3] bg-black/[0.03] hover:bg-[#0071E3]/10 px-3 py-1.5 rounded-full border border-black/[0.04] hover:border-[#0071E3]/20 transition cursor-pointer whitespace-nowrap shrink-0"
              >
                <User className="w-3.5 h-3.5 text-[#0071E3] shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">Sign in</span>
                <span className="sm:hidden">Log in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
