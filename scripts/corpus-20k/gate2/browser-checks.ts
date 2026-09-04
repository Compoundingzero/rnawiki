/**
 * Gate 2 browser checks (docs/specs/dossier-template.md, "Measurable checks for Gate 2").
 *
 * For each of the seven samples, at 320 px and at desktop width:
 *   heading order            h1 -> h2 (question) -> h3 (revealed group), no level skipped
 *   contrast                 body text >= 7:1, grey rows >= 4.5:1, measured against the painted
 *                            background behind each element
 *   keyboard                 every <details> summary, rail link and provenance anchor is
 *                            reachable by Tab and paints a visible focus ring
 *   horizontal overflow      documentElement.scrollWidth <= innerWidth
 *   badge in flow below 480  the Qn badge is not in the left margin at 320 px
 *   live text-to-HTML        document.body.innerText / document.documentElement.outerHTML
 *
 * And, separately, the FROZEN home search bar: the bar and input bounding boxes on / at 1440,
 * 375 and 320 px, compared with the committed baseline. Any difference is a Gate 2 STOP.
 *
 *   npx tsx scripts/corpus-20k/gate2/browser-checks.ts --base http://localhost:3111 \
 *     --slugs <tsv> --out data/corpus-20k/gate2/browser-checks.json
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import { chromium, type Page } from '@playwright/test'

/** The committed baseline for the frozen home search bar (corpus-20k worklog, constraints). */
const FROZEN_BAR_BASELINE: Record<
  string,
  {
    bar: { x: number; y: number; width: number; height: number }
    input: { x: number; y: number; width: number; height: number }
  }
> = {
  '1440': {
    bar: { x: 456, y: 369, width: 528, height: 60 },
    input: { x: 498, y: 381, width: 371.77, height: 36 },
  },
  '375': {
    bar: { x: 16, y: 269.5, width: 343, height: 52 },
    input: { x: 64, y: 279.5, width: 188.89, height: 32 },
  },
  '320': {
    bar: { x: 16, y: 292.25, width: 288, height: 52 },
    input: { x: 64, y: 302.25, width: 133.89, height: 32 },
  },
}
const FROZEN_BAR_DOM_PATH = 'body>div[3]>main>div>section>div[1]>div>input[1]'
/** Sub-pixel layout noise; anything above this is a real geometry change. */
const BAR_TOLERANCE = 0.5

function option(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`)
  return index >= 0 ? process.argv[index + 1] : undefined
}

type Sample = { key: string; slug: string; tier: string }

async function readSamples(path: string): Promise<Sample[]> {
  const text = await readFile(path, 'utf8')
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => {
      const [key, slug, tier] = line.split('\t')
      return { key: key ?? '', slug: slug ?? key ?? '', tier: tier ?? '' }
    })
}

/* ----------------------------------------------------------------------------- in-page checks */

const PAGE_AUDIT = `() => {
  const round = (n) => Math.round(n * 1000) / 1000

  /* --- painted background behind an element ------------------------------------------------ */
  const paintedBackground = (element) => {
    let node = element
    while (node && node !== document.documentElement) {
      const colour = getComputedStyle(node).backgroundColor
      const parts = colour.match(/[\\d.]+/g)
      if (parts && (parts.length < 4 || Number(parts[3]) > 0)) {
        return [Number(parts[0]), Number(parts[1]), Number(parts[2])]
      }
      node = node.parentElement
    }
    return [255, 255, 255]
  }
  const channel = (v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  const luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  const contrast = (a, b) => {
    const la = luminance(a)
    const lb = luminance(b)
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
  }
  const rgbOf = (value) => {
    const parts = value.match(/[\\d.]+/g)
    return parts ? [Number(parts[0]), Number(parts[1]), Number(parts[2])] : [0, 0, 0]
  }

  /* --- heading order ------------------------------------------------------------------------ */
  const main = document.querySelector('main')
  const headings = [...main.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
    level: Number(h.tagName.slice(1)),
    text: (h.textContent || '').trim().slice(0, 90),
  }))
  let headingOrderOk = headings.length > 0 && headings[0].level === 1
  let previous = 0
  const headingProblems = []
  for (const heading of headings) {
    if (previous && heading.level > previous + 1) {
      headingOrderOk = false
      headingProblems.push(\`h\${previous} -> h\${heading.level}: \${heading.text}\`)
    }
    previous = heading.level
  }
  const h1Count = headings.filter((h) => h.level === 1).length

  /* --- contrast ----------------------------------------------------------------------------- */
  const measure = (selector) => {
    const rows = []
    for (const element of main.querySelectorAll(selector)) {
      if (!(element.textContent || '').trim()) continue
      const style = getComputedStyle(element)
      if (style.visibility === 'hidden' || style.display === 'none') continue
      rows.push({
        selector,
        ratio: round(contrast(rgbOf(style.color), paintedBackground(element))),
        colour: style.color,
        text: (element.textContent || '').trim().slice(0, 50),
      })
    }
    return rows
  }
  const bodyRows = [...measure('p.cd-paragraph'), ...measure('h1.cd-title'), ...measure('h2.cd-question')]
  const greyRows = [
    ...measure('.cd-row-value'),
    ...measure('.cd-row-label'),
    ...measure('.cd-row-id'),
    ...measure('.cd-source-line'),
    ...measure('.cd-row-dates'),
    ...measure('.cd-licence'),
    ...measure('.cd-badges li'),
    ...measure('.cd-synonyms dd'),
    ...measure('.cd-synonyms dt'),
  ]
  const minOf = (rows) => (rows.length ? Math.min(...rows.map((r) => r.ratio)) : null)
  const worst = (rows, limit) =>
    rows.filter((r) => r.ratio < limit).sort((a, b) => a.ratio - b.ratio).slice(0, 5)

  /* --- overflow ----------------------------------------------------------------------------- */
  const scrollWidth = document.documentElement.scrollWidth
  const overflowing = [...main.querySelectorAll('*')]
    .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
    .slice(0, 5)
    .map((el) => el.className || el.tagName)

  /* --- badge position at narrow widths ------------------------------------------------------ */
  const firstBadge = main.querySelector('.cd-badge')
  const firstBlockBody = main.querySelector('.cd-block-body')
  const badgeInFlow =
    firstBadge && firstBlockBody
      ? firstBadge.getBoundingClientRect().left >= firstBlockBody.getBoundingClientRect().left - 2
      : null

  /* --- empty elements and placeholder phrases ----------------------------------------------- */
  const PLACEHOLDER = /\\b(lorem ipsum|tbd|todo|coming soon|placeholder|xxx|n\\/a|undefined|null|\\[object object\\]|nan)\\b/i
  const emptyElements = [...main.querySelectorAll('h1,h2,h3,h4,p,li,dd,dt,td,th,summary,a,button')]
    .filter((el) => {
      if (el.getAttribute('aria-hidden') === 'true') return false
      if (el.querySelector('img,svg,input,select,textarea')) return false
      return (el.textContent || '').trim().length === 0
    })
    .map((el) => \`\${el.tagName.toLowerCase()}.\${el.className || ''}\`)
  const bodyText = document.body.innerText || ''
  const placeholderHits = (bodyText.match(PLACEHOLDER) || []).slice(0, 3)

  /* --- text to HTML, in the browser after hydration ------------------------------------------ */
  const innerTextLength = bodyText.replace(/\\s+/g, ' ').trim().length
  const outerHtmlLength = document.documentElement.outerHTML.length

  /* --- what must be keyboard reachable ------------------------------------------------------- */
  const focusTargets = {
    details: main.querySelectorAll('details > summary').length,
    railLinks: document.querySelectorAll('a.cd-rail-link').length,
    anchors: main.querySelectorAll('a.cd-anchor').length,
  }

  /* --- suppression: no seed 1/2/6 block, supervision first ----------------------------------- */
  const blocks = [...main.querySelectorAll('[data-block]')].map((el) => el.getAttribute('data-block'))
  const questionBlocks = [...main.querySelectorAll('section.cd-block')].map((el) =>
    el.getAttribute('data-block'),
  )

  return {
    headings,
    h1Count,
    headingOrderOk,
    headingProblems,
    contrast: {
      bodyMin: minOf(bodyRows),
      bodyMeasured: bodyRows.length,
      bodyUnder7: worst(bodyRows, 7),
      greyMin: minOf(greyRows),
      greyMeasured: greyRows.length,
      greyUnder45: worst(greyRows, 4.5),
    },
    scrollWidth,
    innerWidth: window.innerWidth,
    horizontalOverflow: scrollWidth > window.innerWidth + 1,
    overflowing,
    badgeInFlow,
    emptyElements,
    placeholderHits,
    innerTextLength,
    outerHtmlLength,
    liveTextToHtml: outerHtmlLength ? round(innerTextLength / outerHtmlLength) : null,
    focusTargets,
    blocks,
    questionBlocks,
  }
}`

/** Tab through the page and record which of the required targets received focus with a ring. */
async function keyboardWalk(page: Page): Promise<Record<string, unknown>> {
  await page.evaluate(() => {
    const body = document.querySelector('body')
    if (body) body.focus()
  })
  await page.keyboard.press('Tab')
  const seen = { details: 0, railLinks: 0, anchors: 0, noRing: [] as string[] }
  for (let step = 0; step < 400; step += 1) {
    const state = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null
      if (!active || active === document.body) return null
      const style = getComputedStyle(active)
      const ring =
        style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
          ? true
          : style.boxShadow !== 'none'
      return {
        tag: active.tagName.toLowerCase(),
        className: typeof active.className === 'string' ? active.className : '',
        inMain: Boolean(active.closest('main')),
        ring,
        label: (active.textContent || '').trim().slice(0, 40),
      }
    })
    if (state) {
      const classes = state.className.split(/\s+/)
      if (state.tag === 'summary') seen.details += 1
      if (classes.includes('cd-rail-link')) seen.railLinks += 1
      if (classes.includes('cd-anchor')) seen.anchors += 1
      const required =
        state.tag === 'summary' || classes.includes('cd-rail-link') || classes.includes('cd-anchor')
      if (required && !state.ring && seen.noRing.length < 5) {
        seen.noRing.push(`${state.tag}.${state.className}: ${state.label}`)
      }
    }
    await page.keyboard.press('Tab')
  }
  return seen
}

/** Measured in the page as a source string: tsx injects helpers into inline arrow functions. */
const BAR_AUDIT = `() => {
  const round = (n) => Math.round(n * 100) / 100
  const input = document.querySelector('main input[type="text"], main input[type="search"], main input')
  if (!input) return null
  const barElement = input.closest('div')
  const box = (el) => {
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: round(r.x), y: round(r.y), width: round(r.width), height: round(r.height) }
  }
  const pathOf = (el) => {
    const parts = []
    let node = el
    while (node && node.tagName.toLowerCase() !== 'html') {
      const parent = node.parentElement
      if (!parent) break
      const siblings = [...parent.children].filter((c) => c.tagName === node.tagName)
      const index = siblings.indexOf(node) + 1
      parts.unshift(siblings.length > 1 ? node.tagName.toLowerCase() + '[' + index + ']' : node.tagName.toLowerCase())
      node = parent
    }
    return parts.join('>')
  }
  return { bar: box(barElement), input: box(input), domPath: pathOf(input) }
}`

async function main(): Promise<void> {
  const base = option('base') ?? 'http://localhost:3111'
  const slugsPath = resolve(option('slugs') ?? 'data/corpus-20k/gate2/lists/samples.tsv')
  const outPath = resolve(option('out') ?? 'data/corpus-20k/gate2/browser-checks.json')
  const samples = await readSamples(slugsPath)

  const browser = await chromium.launch()
  const results: Record<string, unknown> = { base, samples: {}, homeSearchBar: {} }

  try {
    /* ---- the seven samples, at 320 px and at desktop -------------------------------------- */
    for (const sample of samples) {
      const perWidth: Record<string, unknown> = {}
      for (const [label, size] of [
        ['desktop', { width: 1440, height: 900 }],
        ['w320', { width: 320, height: 720 }],
      ] as const) {
        const context = await browser.newContext({ viewport: size })
        const page = await context.newPage()
        await page.goto(`${base}/d/${sample.slug}`, { waitUntil: 'load' })
        await page.waitForTimeout(600)
        const audit = await page.evaluate(`(${PAGE_AUDIT})()`)
        const keyboard = await keyboardWalk(page)
        perWidth[label] = { ...(audit as object), keyboard }
        await context.close()
      }
      ;(results.samples as Record<string, unknown>)[sample.slug] = perWidth
      process.stdout.write(`checked ${sample.slug}\n`)
    }

    /* ---- the frozen home search bar -------------------------------------------------------- */
    const bar: Record<string, unknown> = {}
    for (const width of [1440, 375, 320]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } })
      const page = await context.newPage()
      await page.goto(`${base}/`, { waitUntil: 'load' })
      await page.waitForTimeout(600)
      const measured = await page.evaluate(`(${BAR_AUDIT})()`)
      bar[String(width)] = measured
      await context.close()
    }
    results.homeSearchBar = {
      measured: bar,
      baseline: FROZEN_BAR_BASELINE,
      domPathBaseline: FROZEN_BAR_DOM_PATH,
      tolerance: BAR_TOLERANCE,
    }
  } finally {
    await browser.close()
  }

  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, JSON.stringify(results, null, 1), 'utf8')
  process.stdout.write(`wrote ${outPath}\n`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
