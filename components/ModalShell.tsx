'use client'

import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { X } from 'lucide-react'

// `[tabindex="-1"]` is excluded on purpose: the panel itself carries it so it can be focused
// programmatically, and it must not become a Tab stop.
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/** Visible, focusable descendants in document order. Hidden nodes have no client rects. */
function focusableWithin(root: HTMLElement | null): HTMLElement[] {
  if (!root) return []
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (node) => node.getClientRects().length > 0 && node.getAttribute('aria-hidden') !== 'true',
  )
}

export interface ModalShellProps {
  isOpen: boolean
  onClose: () => void
  /** Prevent every built-in close path while a request that may change server session state runs. */
  closeDisabled?: boolean
  /** `id` of the heading that names this dialog. Exactly one element must carry it at a time. */
  labelledBy: string
  /** Restricted to generated Tailwind widths. */
  maxWidth?: 'max-w-sm' | 'max-w-md' | 'max-w-lg' | 'max-w-2xl'
  scrim?: 'standard' | 'soft' | 'deep'
  /** `none` is for dialogs that render their own close control. */
  closeButton?: 'standard' | 'inset' | 'none'
  children: ReactNode
}

const SCRIM_CLASSES: Record<'standard' | 'soft' | 'deep', string> = {
  standard: 'p-3 sm:p-4 bg-black/40 backdrop-blur-sm',
  soft: 'p-4 bg-black/30 backdrop-blur-md',
  deep: 'p-3 sm:p-6 bg-black/50 backdrop-blur-sm',
}

const CLOSE_POSITION: Record<'standard' | 'inset', string> = {
  standard: 'top-4 right-4 bg-black/[0.04] hover:bg-black/[0.08]',
  inset: 'top-5 right-5 bg-black/[0.05] hover:bg-black/[0.09]',
}

export function ModalShell({
  isOpen,
  onClose,
  closeDisabled = false,
  labelledBy,
  maxWidth = 'max-w-md',
  scrim = 'standard',
  closeButton = 'standard',
  children,
}: ModalShellProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  // A press that starts inside the panel and ends on the backdrop — a text selection dragged out —
  // must not close the dialog. Only a press that both starts and ends on the backdrop counts.
  const pressStartedOnBackdrop = useRef(false)

  // Escape is bound at the document rather than on the backdrop element: after a click on the
  // backdrop, focus can sit on <body>, and a React key handler on the backdrop would never see it.
  useEffect(() => {
    if (!isOpen) return
    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape' && !closeDisabled) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [closeDisabled, isOpen, onClose])

  // Scroll lock, opening focus, and returning focus to whatever opened the dialog. The return is
  // the part a reader on a keyboard actually feels: without it, closing drops them at the top of
  // the document instead of back on the button they pressed.
  useEffect(() => {
    if (!isOpen) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const panel = panelRef.current
    const first = focusableWithin(panel)[0]
    ;(first ?? panel)?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      opener?.focus()
    }
  }, [isOpen])

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return
    const nodes = focusableWithin(panelRef.current)
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (!first || !last) {
      // Nothing to move to; keep the focus where it is rather than letting it leave the dialog.
      event.preventDefault()
      return
    }
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === panelRef.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }, [])

  const handleBackdropMouseDown = useCallback((event: MouseEvent<HTMLDivElement>) => {
    pressStartedOnBackdrop.current = event.target === event.currentTarget
  }, [])

  const handleBackdropClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (
        !closeDisabled &&
        event.target === event.currentTarget &&
        pressStartedOnBackdrop.current
      ) {
        onClose()
      }
      pressStartedOnBackdrop.current = false
    },
    [closeDisabled, onClose],
  )

  if (!isOpen) return null

  return (
    // The backdrop's click handler is a mouse convenience only. Escape and the labelled close
    // button are the controls that carry the behaviour for everyone else, so the backdrop needs no
    // role of its own.
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${SCRIM_CLASSES[scrim]} animate-fade-in`}
      onKeyDown={handleKeyDown}
      onMouseDown={handleBackdropMouseDown}
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        // Keep tall dialogs reachable on short viewports.
        className={`bg-white rounded-3xl ${maxWidth} w-full shadow-2xl border border-black/[0.08] relative max-h-[calc(100dvh-1.5rem)] overflow-y-auto focus:outline-none`}
      >
        {closeButton !== 'none' && (
          <button
            type="button"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label="Close"
            className={`absolute z-10 w-7 h-7 rounded-full ${CLOSE_POSITION[closeButton]} text-[#1D1D1F] flex items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer shrink-0`}
          >
            <X className={closeButton === 'inset' ? 'w-3.5 h-3.5' : 'w-4 h-4'} aria-hidden="true" />
          </button>
        )}

        {children}
      </div>
    </div>
  )
}
