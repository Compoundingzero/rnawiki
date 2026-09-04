'use client'

/**
 * The rail's active marker, and the only client component on a corpus dossier.
 *
 * It takes no props: everything it needs is already in the server HTML (`data-corpus-block` on each
 * question, `data-corpus-rail` on each rail link), so no field data is copied into the RSC payload
 * to drive it. Without JavaScript the rail is still a working list of in-page links; the marker is
 * the only thing that does not move.
 *
 * The marker follows the block whose top has crossed the header line, with no lag: an observer
 * watching a one-pixel band at that line reports the crossing itself rather than a visibility
 * fraction, and the fallback pass on load and on hash change keeps the marker correct when the
 * reader arrives at a fragment rather than at the top of the page.
 */
import { useEffect } from 'react'

const HEADER_OFFSET = 72

export function ContentsRailMarker() {
  useEffect(() => {
    const blocks = Array.from(document.querySelectorAll<HTMLElement>('[data-corpus-block]'))
    if (blocks.length === 0) return
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-corpus-rail]'))
    if (links.length === 0) return

    let current = ''
    const mark = (id: string): void => {
      if (id === current) return
      current = id
      for (const link of links) {
        const matches = link.dataset.corpusRail === id
        if (matches) link.setAttribute('aria-current', 'true')
        else link.removeAttribute('aria-current')
      }
    }

    const active = (): string => {
      let found = blocks[0]?.dataset.corpusBlock ?? ''
      for (const block of blocks) {
        if (block.getBoundingClientRect().top - HEADER_OFFSET <= 0) {
          found = block.dataset.corpusBlock ?? found
        }
      }
      return found
    }

    const update = (): void => mark(active())

    // A one-pixel band on the header line: an entry crossing it is the event, not a ratio.
    const observer = new IntersectionObserver(update, {
      rootMargin: `-${HEADER_OFFSET}px 0px -${Math.max(0, window.innerHeight - HEADER_OFFSET - 1)}px 0px`,
      threshold: 0,
    })
    for (const block of blocks) observer.observe(block)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()

    // A rail link may address a row group inside a closed disclosure; open it before the jump.
    const openTarget = (): void => {
      const id = decodeURIComponent(window.location.hash.slice(1))
      if (!id) return
      const target = document.getElementById(id)
      if (!target) return
      let parent: HTMLElement | null = target.closest('details')
      while (parent instanceof HTMLDetailsElement) {
        parent.open = true
        parent = parent.parentElement?.closest('details') ?? null
      }
      target.scrollIntoView({ block: 'start' })
    }
    window.addEventListener('hashchange', openTarget)
    openTarget()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('hashchange', openTarget)
    }
  }, [])

  return null
}
