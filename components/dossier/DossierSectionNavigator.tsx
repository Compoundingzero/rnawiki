'use client'

/**
 * The floating section navigator, which is also this page's coverage map and its feedback entry.
 *
 * The reader problem it solves is not "there is no table of contents". It is that a medicine page
 * leads with what it cannot say and buries what it can. Everything a reader might want sits two
 * clicks deep behind two closed disclosures, and on a median record the first screen is three
 * non-answers, so a reader who would have been well served by the archive counts, the taxonomy or
 * the recorded uses closes the tab before finding out those exist.
 *
 * A jump list alone would not fix that, because the reader still cannot tell which destinations are
 * worth the jump. So every row carries the section's COVERAGE STATE, and the states are the same
 * ones the evidence model already distinguishes rather than a new vocabulary invented for the UI:
 *
 *   answered         the section holds recorded content
 *   conflicting      independent sources give readings that do not overlap, and both are kept
 *   stale            a source behind this section has changed since the value was recorded
 *   not documented   no source in this corpus fills this section
 *   restricted       material exists but is not published at this boundary
 *
 * `conflicting` is the one worth naming. The corpus holds hundreds of fields where independent
 * manufacturer labels print numbers that do not overlap, kept side by side with neither marked
 * wrong. That is the strongest thing this record can say, and until this control existed it was
 * reachable only by scrolling into the right module. A reader can now see it from the first screen.
 *
 * The control never says a section is empty in a way that reads as reassurance or as alarm. "Not
 * documented" is a fact about this corpus, and the panel says so in those words.
 */

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { ListTree, MessageSquare, X } from 'lucide-react'

import { useApp } from '@/components/app-context'

export type DossierSectionCoverage =
  'answered' | 'conflicting' | 'stale' | 'not_documented' | 'restricted'

export interface DossierNavigatorSection {
  /** The DOM id to scroll to. Must exist on the page or the row is not rendered. */
  id: string
  /** Plain-language label. Never a field name and never an enum. */
  label: string
  coverage: DossierSectionCoverage
  /**
   * Every problem this section carries. `coverage` collapses these to the one shown as the row's
   * state; this keeps both so a section that is conflicting AND stale badges both.
   */
  issues?: readonly ('conflicting' | 'stale')[]
  /** Optional count shown beside the label, e.g. how many readings disagree. */
  count?: number
}

export interface DossierSectionNavigatorProps {
  sections: readonly DossierNavigatorSection[]
  /** Shown in the panel header so a reader knows which record they are navigating. */
  medicineName: string
}

/**
 * Reader-facing wording for each state, and the dot colour.
 *
 * The wording is the part that matters. "Not documented" is chosen over "unknown" because a reader
 * reads "unknown" as a property of the medicine, and it is a property of this corpus.
 */
const COVERAGE_PRESENTATION: Record<
  DossierSectionCoverage,
  { dot: string; text: string; label: string }
> = {
  answered: { dot: 'bg-[#2E6B45]', text: 'text-[#6E6E73]', label: 'Recorded' },
  conflicting: { dot: 'bg-[#A85B1F]', text: 'text-[#A85B1F]', label: 'Sources differ' },
  stale: { dot: 'bg-[#8A6D1F]', text: 'text-[#8A6D1F]', label: 'Source has changed' },
  not_documented: { dot: 'bg-[#C7C7CC]', text: 'text-[#8E8E93]', label: 'Not documented here' },
  restricted: { dot: 'bg-[#C7C7CC]', text: 'text-[#8E8E93]', label: 'Not published here' },
}

/** A recorded answer stays useful and reachable while its source is waiting for rechecking. */
export function dossierSectionHasContent(section: DossierNavigatorSection): boolean {
  return (
    section.coverage === 'answered' ||
    section.coverage === 'conflicting' ||
    section.coverage === 'stale'
  )
}

/** Sections a reader can actually go somewhere useful from. Drives the badge on the closed button. */
export function countDossierSectionsWithContent(
  sections: readonly DossierNavigatorSection[],
): number {
  return sections.filter(dossierSectionHasContent).length
}

export function DossierSectionNavigator({ sections, medicineName }: DossierSectionNavigatorProps) {
  const { setOpenModal } = useApp()
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const panelId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const withContent = useMemo(() => countDossierSectionsWithContent(sections), [sections])
  const conflicting = useMemo(
    () => sections.filter((section) => section.coverage === 'conflicting').length,
    [sections],
  )
  const stale = useMemo(
    () => sections.filter((section) => section.issues?.includes('stale')).length,
    [sections],
  )

  /*
   * Scroll spy. Rendered content lives inside closed <details> elements, so a section can be present
   * in the document and have zero height; `isIntersecting` handles that correctly where a naive
   * offset comparison would pick the wrong row.
   */
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null)
    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: 0 },
    )
    for (const element of elements) observer.observe(element)
    return () => observer.disconnect()
  }, [sections])

  /* Escape closes and returns focus to the trigger, which is where a keyboard reader expects it. */
  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open])

  /**
   * Opens the disclosure that contains the target before scrolling to it.
   *
   * Without this, a jump into a closed `<details>` scrolls to a collapsed element and the reader
   * lands on the section heading with nothing under it, which reads as a broken link. The target
   * itself is opened too, because a background row is a `<details>` carrying its own anchor id.
   */
  const goToSection = useCallback((id: string) => {
    const target = document.getElementById(id)
    if (!target) return
    /*
     * Start at the target, not its parent. A background row IS a <details> with the anchor id on it,
     * so opening only the ancestors leaves the destination itself collapsed and the reader lands on
     * a closed summary — the exact broken-link feeling this function exists to prevent.
     */
    let node: HTMLElement | null = target
    while (node) {
      if (node instanceof HTMLDetailsElement) node.open = true
      node = node.parentElement
    }
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    /* Move the reading position too, so a screen reader and the keyboard follow the eye. */
    target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
    setOpen(false)
  }, [])

  if (sections.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end p-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:p-0">
      <div className="pointer-events-auto flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
        {open && (
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-label={`Sections of the ${medicineName} record`}
            className="max-h-[min(70vh,32rem)] w-full overflow-y-auto rounded-2xl border border-black/[0.08] bg-white/97 shadow-[0_8px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:w-[22rem]"
          >
            <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-black/[0.06] bg-white/95 px-4 py-3 backdrop-blur-xl">
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[#1D1D1F]">On this page</p>
                <p className="mt-0.5 text-[11px] leading-4 text-[#6E6E73]">
                  {withContent} of {sections.length} sections hold recorded content
                  {conflicting > 0 ? ` · ${conflicting} where sources differ` : ''}
                  {stale > 0 ? ` · ${stale} needing a source recheck` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  triggerRef.current?.focus()
                }}
                className="-mr-1 -mt-1 rounded-full p-1.5 text-[#6E6E73] transition hover:bg-[#F5F5F7] hover:text-[#1D1D1F] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3]"
                aria-label="Close section list"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <ul className="p-1.5">
              {sections.map((section) => {
                const presentation = COVERAGE_PRESENTATION[section.coverage]
                const reachable = dossierSectionHasContent(section)
                const isActive = activeId === section.id
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => goToSection(section.id)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] ${
                        isActive ? 'bg-[#0071E3]/[0.07]' : 'hover:bg-[#F5F5F7]'
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${presentation.dot}`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-[13px] leading-5 ${
                            reachable ? 'font-medium text-[#1D1D1F]' : 'text-[#8E8E93]'
                          }`}
                        >
                          {section.label}
                          {typeof section.count === 'number' && section.count > 0 && (
                            <span className="ml-1.5 text-[11px] font-normal tabular-nums text-[#6E6E73]">
                              {section.count}
                            </span>
                          )}
                        </span>
                        <span className={`block text-[11px] leading-4 ${presentation.text}`}>
                          {presentation.label}
                          {/* Both facts survive: a section can disagree AND need rechecking. */}
                          {section.issues?.includes('stale') &&
                            section.coverage === 'conflicting' && (
                              <span className="ml-1.5 text-[#8A6D1F]">
                                · {COVERAGE_PRESENTATION.stale.label}
                              </span>
                            )}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="border-t border-black/[0.06] p-1.5">
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setOpenModal('feedback')
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition hover:bg-[#F5F5F7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3]"
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-[#0071E3]" aria-hidden="true" />
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium leading-5 text-[#1D1D1F]">
                    Report something wrong on this page
                  </span>
                  <span className="block text-[11px] leading-4 text-[#6E6E73]">
                    Goes to a person, with this record attached
                  </span>
                </span>
              </button>
            </div>
          </div>
        )}

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          className="ml-auto flex min-h-11 items-center gap-2 rounded-full border border-black/[0.08] bg-white/95 px-4 py-2.5 text-[#1D1D1F] shadow-[0_2px_14px_rgba(0,0,0,0.1)] backdrop-blur-md transition hover:border-[#0071E3]/30 hover:text-[#0071E3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071E3] active:scale-95"
        >
          <ListTree className="h-4 w-4 shrink-0 text-[#0071E3]" aria-hidden="true" />
          <span className="text-[12px] font-semibold">
            {open ? 'Close' : 'Sections & feedback'}
          </span>
          {!open && conflicting > 0 && (
            <span
              className="rounded-full bg-[#A85B1F]/12 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[#A85B1F]"
              title={`${conflicting} sections where recorded sources differ`}
            >
              {conflicting}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
