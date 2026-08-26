'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowDown } from 'lucide-react'

import { focusDisclosureTarget } from '@/components/dossier/disclosure-deep-link'

interface AdvancedEvidenceDisclosureProps {
  children: ReactNode
  /** Sticky dossier section links, revealed only with the advanced evidence. */
  navigation?: ReactNode
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

/**
 * Native disclosure semantics with one progressive enhancement: direct links to a section inside
 * the closed panel open it after hydration. The children remain in the server-rendered HTML.
 */
export function AdvancedEvidenceDisclosure({
  children,
  navigation,
}: AdvancedEvidenceDisclosureProps) {
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
        focusDisclosureTarget(details, target)
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
      className="group pt-2"
    >
      <summary
        aria-controls="advanced-evidence-content"
        aria-expanded={isOpen}
        className="mx-auto mt-6 w-fit cursor-pointer list-none rounded-2xl text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66D8] focus-visible:ring-offset-4 [&::-webkit-details-marker]:hidden"
      >
        <span className="mx-auto flex min-h-[52px] w-fit items-center gap-2 rounded-full bg-[#0A66D8] px-7 text-sm font-semibold text-white shadow-[0_2px_6px_rgba(10,102,216,0.2)] transition hover:bg-[#075BBF] motion-reduce:transition-none">
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

      <div id="advanced-evidence-content">
        {isOpen && navigation}
        {children}
      </div>
    </details>
  )
}
