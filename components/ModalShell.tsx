'use client'

// The one dialog the four modals are built from.
//
// The master reference wireframe repeated the same backdrop-and-panel markup in four files, with
// no role, no focus handling and no Escape key: a mouse could open and close them and nothing else
// could. The markup here is the reference's, class for class — fixed backdrop, centred rounded-3xl
// white panel, the absolute top-right X — with the keyboard and screen-reader behaviour a dialog
// owes a reader added around it. None of that changes a pixel.
//
// The reference used two slightly different backdrops (bg-black/40 backdrop-blur-sm on the
// verification and feedback modals, bg-black/30 backdrop-blur-md on the account and guide ones).
// One primitive cannot honour both, so it carries the first, which is the pair the product opens
// most often.

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
  /** `id` of the heading that names this dialog. Exactly one element must carry it at a time. */
  labelledBy: string
  /**
   * Typed as the three widths the ported modals use rather than as a free string, so a width that
   * Tailwind never generated cannot be passed in.
   */
  maxWidth?: 'max-w-sm' | 'max-w-md' | 'max-w-lg' | 'max-w-2xl'
  /**
   * Which of the reference's three backdrops to paint.
   *
   * The wireframe did not use one scrim. AccountModal and QuickGuideModal sit on a lighter, more
   * heavily blurred one; the editor sits on a darker one with a wider desktop inset; the two small
   * dialogs sit between them. A single shared value would have quietly restyled three of the five
   * dialogs, so the shell takes the variant instead of imposing a default.
   */
  scrim?: 'standard' | 'soft' | 'deep'
  /**
   * `inset` places the close button 4px further in, matching AccountModal and QuickGuideModal.
   * `none` suppresses it entirely, for the editor, which carries its own close control inside its
   * top bar rather than floating one over the content.
   */
  closeButton?: 'standard' | 'inset' | 'none'
  children: ReactNode
}

/** The reference's three backdrops, kept as literal class strings so Tailwind generates them. */
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
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

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
      if (event.target === event.currentTarget && pressStartedOnBackdrop.current) onClose()
      pressStartedOnBackdrop.current = false
    },
    [onClose],
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
        // The reference clipped the panel with overflow-hidden, which on a short viewport makes the
        // bottom of a tall dialog unreachable. Scrolling inside the panel keeps the same look and
        // makes the content reachable; the height cap is the viewport minus the backdrop padding.
        className={`bg-white rounded-3xl ${maxWidth} w-full shadow-2xl border border-black/[0.08] relative max-h-[calc(100dvh-1.5rem)] overflow-y-auto focus:outline-none`}
      >
        {closeButton !== 'none' && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`absolute z-10 w-7 h-7 rounded-full ${CLOSE_POSITION[closeButton]} text-[#1D1D1F] flex items-center justify-center transition cursor-pointer shrink-0`}
          >
            {/* The reference sizes this glyph differently per dialog: w-4 in the verification
                modal, w-3.5 in the others. `inset` is the pair that also sits 4px further in. */}
            <X className={closeButton === 'inset' ? 'w-3.5 h-3.5' : 'w-4 h-4'} aria-hidden="true" />
          </button>
        )}

        {children}
      </div>
    </div>
  )
}
