/**
 * The contents rail's active marker.
 *
 * It reads the DOM and is handed nothing: each question block carries `data-corpus-block`, and each
 * rail link's own `href` is the fragment it points at, so the map from link to block is already in
 * the served HTML. Without this script the rail is still a working list of in-page links; the
 * marker is the only thing that does not move.
 *
 * The marker follows the block whose top has crossed the header line. An observer watching a
 * one-pixel band at that line reports the crossing itself rather than a visibility fraction, and
 * the pass on load and on hash change keeps the marker correct when a reader arrives at a fragment.
 */
const HEADER_OFFSET = 72

export function startContentsRail(): void {
  const blocks = Array.from(document.querySelectorAll<HTMLElement>('[data-corpus-block]'))
  if (blocks.length === 0) return
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>(
      '.cd-rail a[href^="#"], .cd-contents a[href^="#"]',
    ),
  )
  if (links.length === 0) return

  /** A link may address a group inside a block; the block it marks is the block that contains it. */
  const blockOf = new Map<HTMLAnchorElement, string>()
  for (const link of links) {
    const id = decodeURIComponent(link.hash.slice(1))
    const target = id ? document.getElementById(id) : null
    const owner = target?.closest<HTMLElement>('[data-corpus-block]')
    const blockId = owner?.dataset.corpusBlock ?? id
    if (blockId) blockOf.set(link, blockId)
  }

  let current = ''
  const mark = (id: string): void => {
    if (id === current) return
    current = id
    for (const link of links) {
      if (blockOf.get(link) === id) link.setAttribute('aria-current', 'true')
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

  const observer = new IntersectionObserver(update, {
    rootMargin: `-${HEADER_OFFSET}px 0px -${Math.max(0, window.innerHeight - HEADER_OFFSET - 1)}px 0px`,
    threshold: 0,
  })
  for (const block of blocks) observer.observe(block)
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()

  /** A rail link may address a row group inside a closed disclosure; open it before the jump. */
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
}
