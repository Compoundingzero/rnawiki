/** Enhance the dossier's ordinary fragment links without making them depend on JavaScript. */
export function startDossierNav(): void {
  const navs = Array.from(document.querySelectorAll<HTMLElement>('[data-reader-nav]'))
  if (navs.length === 0) return
  document.documentElement.classList.add('reader-nav-enhanced')

  const links = navs.flatMap((nav) =>
    Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')),
  )
  const targets = links.flatMap((link) => {
    const id = link.getAttribute('href')?.slice(1)
    const target = id ? document.getElementById(id) : null
    return target ? [{ link, target }] : []
  })
  if (targets.length === 0) return

  let pending = false
  const update = (): void => {
    pending = false
    let active = targets[0]!
    for (const item of targets) {
      const scrollMargin = Number.parseFloat(getComputedStyle(item.target).scrollMarginTop) || 0
      if (item.target.getBoundingClientRect().top <= scrollMargin + 2) active = item
    }
    // A short final section cannot scroll up to the header line. At the document's end it is
    // nevertheless the section the reader reached, so do not leave the previous link marked.
    const atEnd =
      document.documentElement.scrollHeight > window.innerHeight + 8 &&
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8
    if (atEnd) active = targets[targets.length - 1]!
    for (const item of targets) {
      if (item.target === active.target) item.link.setAttribute('aria-current', 'location')
      else item.link.removeAttribute('aria-current')
    }
  }
  const scheduleUpdate = (): void => {
    if (pending) return
    pending = true
    requestAnimationFrame(update)
  }

  for (const { link, target } of targets) {
    link.addEventListener('click', () => {
      // Let the native anchor update the URL and scroll first. Then put the keyboard/screen-reader
      // cursor at the visible heading, rather than leaving it back in the contents rail.
      window.setTimeout(() => {
        const disclosure = link.closest('details')
        if (disclosure instanceof HTMLDetailsElement) disclosure.open = false
        target.scrollIntoView({ block: 'start' })
        const heading = target.querySelector<HTMLElement>('h1, h2') ?? target
        heading.tabIndex = -1
        heading.focus({ preventScroll: true })
        scheduleUpdate()
      }, 0)
    })
  }

  // The small-screen menu is a native disclosure so its links work without this script. Once
  // enhanced, give it the dismissal behaviour readers expect from a navigation dropdown.
  for (const disclosure of document.querySelectorAll<HTMLDetailsElement>('.dv4-mobile-contents')) {
    disclosure.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !disclosure.open) return
      event.preventDefault()
      disclosure.open = false
      disclosure.querySelector<HTMLElement>('summary')?.focus()
    })
    document.addEventListener('pointerdown', (event) => {
      if (disclosure.open && !disclosure.contains(event.target as Node)) disclosure.open = false
    })
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate)
  window.addEventListener('hashchange', scheduleUpdate)
  scheduleUpdate()
}
