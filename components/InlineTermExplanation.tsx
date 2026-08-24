'use client'

import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'

import type { PublicMedicineContextItem } from '@/lib/public-medicine-context'

type OpenReason = 'hover' | 'focus' | 'pinned'

interface ActiveExplanation {
  context: PublicMedicineContextItem
  instanceId: string
  reason: OpenReason
}

interface OpenInlineTermController {
  close: () => void
  controllerId: string
}

interface InlineTermController {
  active: ActiveExplanation | null
  close: () => void
  controllerId: string
  panelId: string
  show: (next: ActiveExplanation) => void
}

const InlineTermControllerContext = createContext<InlineTermController | null>(null)

/**
 * Page-wide coordination without a page-wide listener for every sentence.
 *
 * Only an interaction can populate this reference, so it is never shared between server renders.
 * Keeping it outside React also lets independently rendered sentence groups close one another
 * without turning every dormant explanation into a document event subscriber.
 */
let openInlineTermController: OpenInlineTermController | null = null

function readableId(prefix: string, reactId: string) {
  return `${prefix}-${reactId.replaceAll(':', '')}`
}

function useInlineTermController(prefix: string, enabled = true): InlineTermController {
  const reactId = useId()
  const controllerId = readableId(prefix, reactId)
  const panelId = `${controllerId}-explanation`
  const [active, setActive] = useState<ActiveExplanation | null>(null)

  const close = useCallback(() => {
    if (openInlineTermController?.controllerId === controllerId) {
      openInlineTermController = null
    }
    setActive(null)
  }, [controllerId])

  const show = useCallback(
    (next: ActiveExplanation) => {
      if (openInlineTermController && openInlineTermController.controllerId !== controllerId) {
        openInlineTermController.close()
      }

      openInlineTermController = { close, controllerId }
      setActive(next)
    },
    [close, controllerId],
  )

  useEffect(() => {
    if (!enabled || !active) return

    function closeOnOutsidePress(event: PointerEvent) {
      const pressWasInsideThisController = event.composedPath().some((node) => {
        return node instanceof HTMLElement && node.dataset.inlineTermController === controllerId
      })
      if (!pressWasInsideThisController) close()
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('pointerdown', closeOnOutsidePress)
    document.addEventListener('keydown', closeOnEscape)

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [active, close, controllerId, enabled])

  useEffect(() => {
    if (!enabled) return

    return () => {
      if (openInlineTermController?.controllerId === controllerId) {
        openInlineTermController = null
      }
    }
  }, [controllerId, enabled])

  return useMemo(
    () => ({ active, close, controllerId, panelId, show }),
    [active, close, controllerId, panelId, show],
  )
}

interface ExplanationPanelProps {
  controller: InlineTermController
}

function ExplanationPanel({ controller }: ExplanationPanelProps) {
  const { active } = controller
  const panelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (active?.reason !== 'pinned' || !window.matchMedia('(pointer: coarse)').matches) return

    const frame = window.requestAnimationFrame(() => {
      const panel = panelRef.current
      if (!panel) return
      const bounds = panel.getBoundingClientRect()
      const isOutsideView = bounds.top < 0 || bounds.bottom > window.innerHeight
      if (isOutsideView) panel.scrollIntoView({ behavior: 'auto', block: 'nearest' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [active])

  return (
    <span
      ref={panelRef}
      id={controller.panelId}
      role="tooltip"
      aria-live="polite"
      hidden={!active}
      className={`${
        active ? 'block' : 'hidden'
      } relative mt-2.5 w-fit max-w-full break-words rounded-[11px] border border-black/[0.07] bg-[#F5F5F7]/90 px-3 py-2 text-left text-[#424245] shadow-[0_2px_8px_rgba(0,0,0,0.035)] [overflow-wrap:anywhere] sm:max-w-[30rem]`}
      data-inline-term-controller={controller.controllerId}
      data-inline-term-panel=""
    >
      {active ? (
        <>
          <span
            aria-hidden="true"
            className="absolute -top-[5px] left-4 h-2.5 w-2.5 rotate-45 border-l border-t border-black/[0.07] bg-[#F5F5F7]"
          />
          <span className="block text-sm font-semibold leading-[1.45] text-[#1D1D1F]">
            {active.context.plainMeaning}
          </span>
          <span className="mt-1 block text-sm font-normal leading-[1.55]">
            {active.context.definition}
          </span>
          <span className="mt-1.5 block text-[11px] font-medium leading-4 text-[#6E6E73]">
            In technical writing · {active.context.technicalTerm}
          </span>
        </>
      ) : null}
    </span>
  )
}

interface InlineTermExplanationGroupProps {
  children: ReactNode
  noScriptContexts?: readonly PublicMedicineContextItem[]
}

/**
 * Keeps one compact explanation beneath a complete sentence.
 *
 * This deliberately uses a small in-flow note rather than an overlay: unfamiliar language receives
 * context close to where it appears without hiding the next line, escaping a narrow viewport, or
 * visually competing with the dossier's result and evidence cards.
 */
export function InlineTermExplanationGroup({
  children,
  noScriptContexts = [],
}: InlineTermExplanationGroupProps) {
  const controller = useInlineTermController('inline-term-group')

  return (
    <InlineTermControllerContext.Provider value={controller}>
      {children}
      <ExplanationPanel controller={controller} />
      {noScriptContexts.length > 0 && (
        <noscript>
          <span className="mt-2 block text-sm leading-6 text-[#6E6E73]">
            {noScriptContexts.map((context, index) => (
              <span key={context.key} className="block">
                {index === 0 ? 'Plain explanations: ' : ''}
                {context.technicalTerm}: {context.plainMeaning}. {context.definition}
              </span>
            ))}
          </span>
        </noscript>
      )}
    </InlineTermControllerContext.Provider>
  )
}

export interface InlineTermExplanationProps {
  children: string
  context: PublicMedicineContextItem
  testId?: string
}

/**
 * Explains one intentionally authored phrase without interrupting the sentence around it.
 *
 * Mouse hover and keyboard focus give a temporary preview. Click, keyboard activation, or a tap
 * pins the explanation until the reader activates the phrase again, presses Escape, presses
 * elsewhere, or opens another explained phrase. The native button and a noscript explanation keep
 * the meaning available without relying on hover alone.
 */
export function InlineTermExplanation({ children, context, testId }: InlineTermExplanationProps) {
  const reactId = useId()
  const instanceId = readableId('inline-term', reactId)
  const assistiveId = `${instanceId}-assistive`
  const groupedController = useContext(InlineTermControllerContext)
  const standaloneController = useInlineTermController(
    'inline-term-controller',
    groupedController === null,
  )
  const controller = groupedController ?? standaloneController
  const active = controller.active?.instanceId === instanceId ? controller.active : null
  const isOpen = active !== null

  function open(reason: OpenReason) {
    controller.show({ context, instanceId, reason })
  }

  function handlePointerEnter(event: ReactPointerEvent<HTMLSpanElement>) {
    if (event.pointerType !== 'touch' && active?.reason !== 'pinned') open('hover')
  }

  function handlePointerLeave(event: ReactPointerEvent<HTMLSpanElement>) {
    if (event.pointerType !== 'touch' && active?.reason === 'hover') controller.close()
  }

  function handleActivation() {
    if (active?.reason === 'pinned') {
      controller.close()
      return
    }
    open('pinned')
  }

  return (
    <>
      <span
        className="relative inline"
        data-context-key={context.key}
        data-inline-term-controller={controller.controllerId}
        data-testid={testId}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        <button
          type="button"
          className="-mx-0.5 inline cursor-help rounded-[0.3em] px-0.5 font-[inherit] text-[inherit] underline decoration-[#0071E3]/45 decoration-dotted underline-offset-[0.22em] transition-colors hover:bg-[#0071E3]/[0.07] hover:decoration-[#0071E3] focus-visible:bg-[#0071E3]/[0.08] motion-reduce:transition-none"
          aria-expanded={isOpen}
          aria-controls={controller.panelId}
          aria-describedby={`${assistiveId}${isOpen ? ` ${controller.panelId}` : ''}`}
          onFocus={() => {
            if (active?.reason !== 'pinned') open('focus')
          }}
          onBlur={() => {
            if (active?.reason === 'focus') controller.close()
          }}
          onClick={handleActivation}
        >
          {children}
          <span className="sr-only"> — show a short explanation</span>
        </button>

        <span id={assistiveId} hidden>
          {context.plainMeaning}. You may see this written as {context.technicalTerm}.
        </span>

        {groupedController ? null : (
          <noscript>
            <span className="ml-1 text-[0.9em] text-[#6E6E73]">
              ({context.plainMeaning}; you may see: {context.technicalTerm}. {context.definition})
            </span>
          </noscript>
        )}
      </span>

      {groupedController ? null : <ExplanationPanel controller={standaloneController} />}
    </>
  )
}

export type PlainLanguageTextPart =
  | string
  | {
      text: string
      context: PublicMedicineContextItem
      key?: string
    }

export interface PlainLanguageTextProps {
  as?: 'p' | 'span' | 'li'
  children?: ReactNode
  className?: string
  parts: readonly PlainLanguageTextPart[]
  testId?: string
}

/** Renders a reviewed sentence whose explained phrases were selected deliberately by an author. */
export function PlainLanguageText({
  as: Element = 'p',
  children,
  className,
  parts,
  testId,
}: PlainLanguageTextProps) {
  const noScriptContexts = Array.from(
    new Map(
      parts.flatMap((part) =>
        typeof part === 'string' ? [] : [[part.context.key, part.context] as const],
      ),
    ).values(),
  )

  return (
    <Element className={className} data-testid={testId}>
      <InlineTermExplanationGroup noScriptContexts={noScriptContexts}>
        {parts.map((part, index) => {
          if (typeof part === 'string') return <Fragment key={`text-${index}`}>{part}</Fragment>

          return (
            <InlineTermExplanation
              key={part.key ?? `${part.context.key}-${index}`}
              context={part.context}
            >
              {part.text}
            </InlineTermExplanation>
          )
        })}
        {children}
      </InlineTermExplanationGroup>
    </Element>
  )
}
