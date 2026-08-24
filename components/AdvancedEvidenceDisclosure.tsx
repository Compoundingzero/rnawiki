'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowDown } from 'lucide-react'

interface AdvancedEvidenceDisclosureProps {
  children: ReactNode
}

function currentHashTarget(details: HTMLDetailsElement): HTMLElement | null {
  const rawHash = window.location.hash.slice(1)
  if (!rawHash) return null

  let id = rawHash
  try {
    id = decodeURIComponent(rawHash)
  } catch {
    // A malformed escape sequence cannot identify a DOM element; use the literal hash instead.
  }

  const target = document.getElementById(id)
  return target && details.contains(target) ? target : null
}

function focusHashTarget(target: HTMLElement): void {
  const heading = target.matches('h1, h2, h3, h4, h5, h6')
    ? target
    : target.querySelector<HTMLElement>('h1, h2, h3, h4, h5, h6')
  const focusTarget = heading ?? target

  if (!focusTarget.matches('a, button, input, select, textarea, summary, [tabindex]')) {
    focusTarget.tabIndex = -1
  }
  focusTarget.focus({ preventScroll: true })
}

/**
 * Native disclosure semantics with one progressive enhancement: direct links to a section inside
 * the closed panel open it after hydration. The children remain in the server-rendered HTML.
 */
export function AdvancedEvidenceDisclosure({ children }: AdvancedEvidenceDisclosureProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const openForCurrentHash = () => {
      const details = detailsRef.current
      if (!details) return
      const target = currentHashTarget(details)
      if (!target) return

      details.open = true
      setIsOpen(true)
      window.requestAnimationFrame(() => {
        focusHashTarget(target)
        target.scrollIntoView({ block: 'start' })
      })
    }

    openForCurrentHash()
    window.addEventListener('hashchange', openForCurrentHash)
    return () => window.removeEventListener('hashchange', openForCurrentHash)
  }, [])

  return (
    <details
      ref={detailsRef}
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      className="group pt-1"
    >
      <summary
        aria-controls="advanced-evidence-content"
        aria-expanded={isOpen}
        className="mx-auto w-fit cursor-pointer list-none rounded-2xl text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3] focus-visible:ring-offset-4 [&::-webkit-details-marker]:hidden"
      >
        <span className="mx-auto flex min-h-12 w-fit items-center gap-2 rounded-full bg-[#0071E3] px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0077ED] motion-reduce:transition-none">
          {isOpen ? 'Hide evidence' : 'See how we know'}
          <ArrowDown
            className={`h-4 w-4 transition-transform motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </span>
        <span className="mt-2 block text-sm leading-6 text-[#6E6E73]">
          Studies, exact numbers, sources, and unanswered questions
        </span>
      </summary>

      <div id="advanced-evidence-content">{children}</div>
    </details>
  )
}
