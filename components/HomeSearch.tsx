'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Search, X } from 'lucide-react'
import { api, searchHitHref, type SearchHit } from '@/lib/api-client'
import {
  mergeSearchResults,
  searchResultFieldCountLabel,
  searchResultTierLabel,
  type CorpusSearchResultRow,
  type SearchResultRow,
} from '@/lib/corpus/search-results'
import { publicMedicineTypeLabel } from '@/lib/public-medicine-language'
import { useOptionalApp } from './app-context'

const DEBOUNCE_MS = 180

/** What picking a row navigates to. A corpus row carries no programme binding, and says so. */
export type SearchPickTarget = Pick<SearchHit, 'slug' | 'summaryBinding'>

export interface DrugSearch {
  query: string
  setQuery: (next: string) => void
  /** Written medicine records, in the order the search returned them. */
  results: SearchHit[]
  /** Corpus records with no written record. Empty unless the caller asked for them. */
  corpusResults: CorpusSearchResultRow[]
  /** The one list a reader sees and arrows through: `results` and `corpusResults`, merged. */
  rows: SearchResultRow[]
  /** True while a request for the current query is in flight and nothing has come back yet. */
  isSearching: boolean
  isOpen: boolean
  open: () => void
  close: () => void
  reset: () => void
  activeIndex: number
  setActiveIndex: (index: number) => void
  onKeyDown: (event: ReactKeyboardEvent) => void
  containerRef: RefObject<HTMLDivElement | null>
  listboxId: string
  optionId: (index: number) => string
}

export interface DrugSearchOptions {
  /**
   * Include corpus records that have no written record in `rows`. Off by default, so a caller
   * that renders `results` alone keeps exactly the list, order and keyboard positions it had.
   */
  includeCorpusResults?: boolean
}

/** Shared server-backed combobox behavior for the home page and site header. */
export function useDrugSearch(
  onPick: (hit: SearchPickTarget) => void,
  limit = 10,
  options: DrugSearchOptions = {},
): DrugSearch {
  const includeCorpusResults = options.includeCorpusResults ?? false
  const [query, setQueryState] = useState('')
  const [results, setResults] = useState<SearchHit[]>([])
  const [corpusResults, setCorpusResults] = useState<CorpusSearchResultRow[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const reactId = useId()
  const listboxId = `drug-search-listbox-${reactId}`
  const optionId = useCallback((index: number) => `${listboxId}-option-${index}`, [listboxId])

  // Held in a ref so `onKeyDown` does not have to be rebuilt every time the caller passes a fresh
  // inline arrow function.
  const onPickRef = useRef(onPick)
  useEffect(() => {
    onPickRef.current = onPick
  })

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length === 0) {
      setResults([])
      setCorpusResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    // Discard a slow response after the query changes.
    const controller = new AbortController()
    const timer = setTimeout(() => {
      api
        .search(trimmed, limit)
        .then((data) => {
          if (controller.signal.aborted) return
          setResults(data.results)
          setCorpusResults(data.corpusResults ?? [])
          setActiveIndex(-1)
          setIsSearching(false)
        })
        .catch(() => {
          if (controller.signal.aborted) return
          setResults([])
          setCorpusResults([])
          setIsSearching(false)
        })
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, limit])

  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      const container = containerRef.current
      if (!container) return
      if (event.target instanceof Node && container.contains(event.target)) return
      setIsOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isOpen])

  // Keep the keyboard-selected row inside the scrolling panel.
  useEffect(() => {
    if (activeIndex < 0) return
    document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, optionId])

  const setQuery = useCallback((next: string) => {
    setQueryState(next)
    setIsOpen(true)
    setActiveIndex(-1)
  }, [])

  const open = useCallback(() => setIsOpen(true), [])

  const close = useCallback(() => {
    setIsOpen(false)
    setActiveIndex(-1)
  }, [])

  const reset = useCallback(() => {
    setQueryState('')
    setResults([])
    setCorpusResults([])
    setIsSearching(false)
    setIsOpen(false)
    setActiveIndex(-1)
  }, [])

  // The rendered list. Keyboard positions, option ids and Enter all read this one array, so a
  // reader arrows through exactly the rows on screen.
  const rows = useMemo(
    () => mergeSearchResults(results, includeCorpusResults ? corpusResults : []),
    [results, corpusResults, includeCorpusResults],
  )

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setActiveIndex(-1)
        return
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setIsOpen(true)
        setActiveIndex(Math.min(activeIndex + 1, rows.length - 1))
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex(Math.max(activeIndex - 1, -1))
        return
      }
      if (event.key === 'Enter') {
        // No row highlighted means "open the best match", which is what pressing Enter in a search
        // box is understood to do.
        const row = activeIndex >= 0 ? rows[activeIndex] : rows[0]
        if (!row) return
        event.preventDefault()
        onPickRef.current(row.hit)
      }
    },
    [activeIndex, rows],
  )

  return {
    query,
    setQuery,
    results,
    corpusResults,
    rows,
    isSearching,
    isOpen,
    open,
    close,
    reset,
    activeIndex,
    setActiveIndex,
    onKeyDown,
    containerRef,
    listboxId,
    optionId,
  }
}

export interface HomeSearchProps {
  popular: SearchHit[]
}

export function HomeSearch({ popular }: HomeSearchProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const restoredInitialFocusRef = useRef(false)
  const sessionActionLocked = useOptionalApp()?.sessionActionLocked ?? false

  const search = useDrugSearch(
    (hit) => {
      search.reset()
      router.push(searchHitHref(hit))
    },
    10,
    { includeCorpusResults: true },
  )

  const showDropdown = search.isOpen && search.query.trim().length > 0

  useEffect(() => {
    if (sessionActionLocked || restoredInitialFocusRef.current) return

    const input = inputRef.current
    if (!input) return
    if (document.activeElement === input) {
      restoredInitialFocusRef.current = true
      return
    }

    // The initial account check temporarily makes the application tree inert, which prevents the
    // native `autoFocus` from taking effect. Restore the established search-first experience only
    // when focus is still on the document itself; never steal it from something the reader chose.
    if (
      document.activeElement === null ||
      document.activeElement === document.body ||
      document.activeElement === document.documentElement
    ) {
      input.focus()
      restoredInitialFocusRef.current = true
    }
  }, [sessionActionLocked])

  return (
    <div className="relative pt-2 space-y-3" ref={search.containerRef}>
      <div className="flex items-center bg-white rounded-2xl border-2 border-[#0071E3] shadow-[0_12px_36px_rgba(0,113,227,0.12)] p-2 sm:p-2.5 pl-4 transition-all focus-within:ring-4 focus-within:ring-[#0071E3]/20">
        <Search className="w-5 h-5 text-[#0071E3] shrink-0 mr-2.5" aria-hidden="true" />

        <input
          ref={inputRef}
          type="text"
          autoFocus
          placeholder="Search medicine, condition, gene, or protein..."
          value={search.query}
          onChange={(e) => search.setQuery(e.target.value)}
          onFocus={search.open}
          onKeyDown={search.onKeyDown}
          className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-[#1D1D1F] py-1.5 focus:outline-none placeholder:text-[#6E6E73] font-medium"
          aria-label="Search by medicine, condition, gene, or protein"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={search.listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            search.activeIndex >= 0 ? search.optionId(search.activeIndex) : undefined
          }
        />

        {search.query ? (
          <button
            type="button"
            onClick={() => {
              search.reset()
              inputRef.current?.focus()
            }}
            className="text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] px-2.5 py-1.5 rounded-lg bg-black/[0.05] hover:bg-black/[0.08] transition cursor-pointer shrink-0 ml-1"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="flex items-center gap-1 bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition cursor-pointer shrink-0 shadow-xs ml-1 active:scale-95"
          >
            <span>Search</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          id={search.listboxId}
          role="listbox"
          aria-label="Search results"
          className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-black/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.14)] overflow-hidden divide-y divide-black/[0.04] max-h-80 overflow-y-auto z-50 text-left animate-fade-in animate-slide-down"
        >
          <HomeSearchResults search={search} />
        </div>
      )}

      {/* Space-Saving Clean Inline Triggers */}
      {popular.length > 0 && (
        <div className="flex items-center justify-center gap-2 text-xs text-[#6E6E73] pt-1 flex-wrap">
          <span>Popular:</span>
          {popular.slice(0, 4).map((drug, index, shown) => (
            <span key={drug.slug} className="flex items-center gap-2">
              <Link
                href={searchHitHref(drug)}
                className="text-[#0066CC] hover:underline font-semibold cursor-pointer transition"
              >
                {drug.name}
              </Link>
              {/* The reference hard-coded `index < 3`, which leaves a trailing bullet whenever the
                  ledger holds fewer than four. Server data can be short, so it counts the row. */}
              {index < shown.length - 1 && <span className="text-black/20">&bull;</span>}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * The dropdown's result list.
 *
 * One list, two kinds of row. A written medicine record prints what it always printed — name,
 * trade name, kind of medicine, the programme context that supplied its summary, and what it is
 * used for. A corpus record has no written record behind it, so it prints only what the corpus
 * recorded: the name, which set of records it belongs to, and, for a Development record, how many
 * of its fields hold a value. Nothing is filled in for it.
 */
export function HomeSearchResults({ search }: { search: DrugSearch }) {
  if (search.rows.length === 0) {
    return (
      <div className="p-6 text-xs sm:text-sm text-[#6E6E73] text-center">
        {search.isSearching ? (
          <>Searching…</>
        ) : (
          <>No matching medicines found for &quot;{search.query}&quot;.</>
        )}
      </div>
    )
  }

  return (
    <>
      {search.rows.map((row, index) =>
        row.kind === 'legacy' ? (
          <HomeSearchMedicineRow
            key={row.slug}
            drug={row.hit}
            row={row}
            index={index}
            search={search}
          />
        ) : (
          <HomeSearchCorpusRow key={row.slug} row={row} index={index} search={search} />
        ),
      )}
    </>
  )
}

const ROW_CLASS =
  'w-full text-left p-4 hover:bg-[#F5F5F7] transition cursor-pointer flex items-center justify-between group gap-2'

function TierNote({ row }: { row: SearchResultRow }) {
  const fields = searchResultFieldCountLabel(row)
  return (
    <span className="text-[10px] font-semibold text-[#6E6E73] shrink-0">
      {searchResultTierLabel(row.tier)}
      {fields ? ` · ${fields}` : ''}
    </span>
  )
}

function HomeSearchMedicineRow({
  drug,
  row,
  index,
  search,
}: {
  drug: SearchHit
  row: SearchResultRow
  index: number
  search: DrugSearch
}) {
  return (
    <Link
      href={searchHitHref(drug)}
      id={search.optionId(index)}
      role="option"
      aria-selected={index === search.activeIndex}
      onMouseEnter={() => search.setActiveIndex(index)}
      onClick={search.reset}
      className={`${ROW_CLASS} ${index === search.activeIndex ? 'bg-[#F5F5F7]' : ''}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-[#1D1D1F] group-hover:text-[#0071E3] transition">
            {drug.name}
          </span>
          {drug.tradeName && <span className="text-xs text-[#6E6E73]">({drug.tradeName})</span>}
          <span className="text-[10px] font-semibold bg-blue-50 text-[#0071E3] px-2 py-0.5 rounded-full shrink-0">
            {publicMedicineTypeLabel(drug.modality)}
          </span>
          <TierNote row={row} />
        </div>
        {drug.summaryContext && (
          <div className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-wide text-[#6E6E73]">
            {drug.summaryContext}
          </div>
        )}
        <div className="mt-0.5 truncate text-xs text-[#6E6E73]">
          {drug.patientFriendlyIndication}
        </div>
      </div>
      <ArrowRight
        className="w-4 h-4 text-[#6E6E73] group-hover:text-[#0071E3] group-hover:translate-x-0.5 transition shrink-0 ml-2"
        aria-hidden="true"
      />
    </Link>
  )
}

function HomeSearchCorpusRow({
  row,
  index,
  search,
}: {
  row: Extract<SearchResultRow, { kind: 'corpus' }>
  index: number
  search: DrugSearch
}) {
  return (
    <Link
      href={`/d/${encodeURIComponent(row.slug)}`}
      // A Development record is not indexed and keeps few inbound links (R6).
      rel={row.tier === 3 ? 'nofollow' : undefined}
      id={search.optionId(index)}
      role="option"
      aria-selected={index === search.activeIndex}
      onMouseEnter={() => search.setActiveIndex(index)}
      onClick={search.reset}
      className={`${ROW_CLASS} ${index === search.activeIndex ? 'bg-[#F5F5F7]' : ''}`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-[#1D1D1F] group-hover:text-[#0071E3] transition">
            {row.hit.name}
          </span>
          <TierNote row={row} />
        </div>
      </div>
      <ArrowRight
        className="w-4 h-4 text-[#6E6E73] group-hover:text-[#0071E3] group-hover:translate-x-0.5 transition shrink-0 ml-2"
        aria-hidden="true"
      />
    </Link>
  )
}
