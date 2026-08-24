'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface MedicineBackgroundDisclosureProps {
  children: ReactNode
}

function nestedHashTarget(details: HTMLDetailsElement): HTMLElement | null {
  const rawHash = window.location.hash.slice(1)
  if (!rawHash) return null
  let id = rawHash
  try {
    id = decodeURIComponent(rawHash)
  } catch {
    // A malformed hash cannot be decoded; its literal value may still identify an element.
  }
  const target = document.getElementById(id)
  return target && details.contains(target) ? target : null
}

function focusSection(target: HTMLElement): void {
  const focusTarget = target.querySelector<HTMLElement>('h1, h2, h3, h4, h5, h6') ?? target
  if (!focusTarget.matches('a, button, input, select, textarea, summary, [tabindex]')) {
    focusTarget.tabIndex = -1
  }
  focusTarget.focus({ preventScroll: true })
}

/** Native closed-by-default background with deep-link opening as a hydration enhancement. */
export function MedicineBackgroundDisclosure({ children }: MedicineBackgroundDisclosureProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const openForHash = () => {
      const details = detailsRef.current
      if (!details) return
      const target = nestedHashTarget(details)
      if (!target) return
      details.open = true
      setIsOpen(true)
      window.requestAnimationFrame(() => {
        focusSection(target)
        target.scrollIntoView({ block: 'start' })
      })
    }

    openForHash()
    window.addEventListener('hashchange', openForHash)
    return () => window.removeEventListener('hashchange', openForHash)
  }, [])

  return (
    <details
      ref={detailsRef}
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      className="group/background overflow-hidden rounded-[22px] border border-black/[0.08] bg-white"
    >
      <summary
        aria-controls="medicine-background-content"
        aria-expanded={isOpen}
        className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-[#1D1D1F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071E3] sm:px-6 [&::-webkit-details-marker]:hidden"
      >
        More about this medicine
        <span
          className={`shrink-0 text-xl font-normal text-[#0066CC] transition-transform motion-reduce:transition-none ${
            isOpen ? 'rotate-45' : ''
          }`}
          aria-hidden="true"
        >
          +
        </span>
      </summary>
      <div
        id="medicine-background-content"
        className="border-t border-black/[0.07] bg-[#F5F5F7] px-4 pb-6 sm:px-6"
      >
        {children}
      </div>
    </details>
  )
}
