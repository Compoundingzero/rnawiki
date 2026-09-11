/**
 * Capture the dossier before/after benchmark at the three viewports the rebuild brief names
 * (1440x1200, 390x844, 320x800), run the axe accessibility checks at each one, audit the reader
 * copy against the plain-language contract, and record the facts a reviewer needs to tell a v3
 * page from a v4 page without reading the labels.
 *
 *   npx tsx scripts/dossier-v4/capture.ts --base http://localhost:3100 --label before \
 *     --slugs creatine-monohydrate,semaglutide,metformin,inclisiran --out data/dossier-v4/benchmark
 *
 * Needs a running server. Writes `<out>/<label>/<slug>-{desktop,mobile,narrow}.png`, one JSON
 * record per page and `<out>/<label>/summary.json`. Nothing here touches the database.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import AxeBuilder from '@axe-core/playwright'
import { chromium, type Browser, type Page } from '@playwright/test'

import { auditCopy } from '@/lib/dossier-v3/copy-contract'

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1200 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'narrow', width: 320, height: 800 },
] as const

interface Args {
  base: string
  label: string
  slugs: string[]
  out: string
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    base: 'http://localhost:3000',
    label: 'run',
    slugs: [],
    out: 'data/dossier-v4/benchmark',
  }
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i]
    const next = argv[i + 1]
    if (flag === '--base' && next) ((args.base = next), (i += 1))
    else if (flag === '--label' && next) ((args.label = next), (i += 1))
    else if (flag === '--slugs' && next)
      ((args.slugs = next
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)),
        (i += 1))
    else if (flag === '--out' && next) ((args.out = next), (i += 1))
  }
  if (args.slugs.length === 0) throw new Error('pass --slugs')
  return args
}

/**
 * Reader text is every text node under `<main>`, joined with a space. `innerText` would apply CSS
 * text-transform (every uppercase label becomes a false acronym) and skip closed disclosures;
 * `textContent` runs adjacent elements together. The technical disclosure is excluded from the
 * reader layer so the two are audited separately.
 */
async function pageFacts(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => {
    const main = document.querySelector('main')
    // The reader layer is everything outside the two explicitly labelled technical sections. Raw
    // vocabulary and record identifiers are allowed inside those and nowhere else, so the two are
    // audited separately rather than together.
    const technical = ['evidence-receipts', 'technical-record', 'deep-evidence']
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null)
    const walker = main ? document.createTreeWalker(main, NodeFilter.SHOW_TEXT) : null
    const parts: string[] = []
    const readerParts: string[] = []
    while (walker && walker.nextNode()) {
      const node = walker.currentNode
      const value = node.textContent?.trim()
      if (!value) continue
      parts.push(value)
      if (!technical.some((section) => section.contains(node))) readerParts.push(value)
    }
    const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(
      (node) => `${node.tagName.toLowerCase()}:${node.textContent?.trim().slice(0, 80) ?? ''}`,
    )
    const firstViewport = Array.from(document.querySelectorAll('h1, h2, p, li, dt')).filter(
      (node) => node.getBoundingClientRect().top < window.innerHeight,
    )
    return {
      mains: document.querySelectorAll('main').length,
      headings,
      text: parts.join(' '),
      readerText: readerParts.join(' '),
      details: document.querySelectorAll('details').length,
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      focusable: document.querySelectorAll(
        'a[href], button, input, summary, [tabindex]:not([tabindex="-1"])',
      ).length,
      // What a reviewer can see without scrolling: the structural fingerprint of the page.
      firstViewportText: firstViewport
        .map((node) => node.textContent?.trim() ?? '')
        .join(' ')
        .slice(0, 2000),
      sectionIds: Array.from(document.querySelectorAll('section[id]')).map((node) => node.id),
      landmarks: Array.from(document.querySelectorAll('[data-compass-lane]')).map((node) =>
        node.getAttribute('data-compass-lane'),
      ),
    }
  })
}

async function captureViewport(
  browser: Browser,
  url: string,
  outDir: string,
  slug: string,
  viewport: (typeof VIEWPORTS)[number],
): Promise<Record<string, unknown>> {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
  })
  const page = await context.newPage()
  const started = Date.now()
  const response = await page.goto(url, { waitUntil: 'networkidle' })
  const ttfbMs = Date.now() - started
  const html = (await response?.text()) ?? ''
  await page.screenshot({ path: join(outDir, `${slug}-${viewport.name}.png`), fullPage: false })
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()
  const facts = await pageFacts(page)
  await context.close()
  return {
    viewport: viewport.name,
    width: viewport.width,
    height: viewport.height,
    status: response?.status() ?? 0,
    dossierVersion: response?.headers()['x-rnawiki-dossier'] ?? 'corpus',
    ttfbMs,
    htmlBytes: Buffer.byteLength(html, 'utf8'),
    axeViolations: axe.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      nodes: violation.nodes.length,
      help: violation.help,
    })),
    ...facts,
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const outDir = resolve(args.out, args.label)
  mkdirSync(outDir, { recursive: true })
  const browser = await chromium.launch()
  const summary: Record<string, unknown>[] = []
  for (const slug of args.slugs) {
    const url = `${args.base}/d/${slug}`
    const shots: Record<string, unknown>[] = []
    for (const viewport of VIEWPORTS) {
      shots.push(await captureViewport(browser, url, outDir, slug, viewport))
    }
    const desktop = shots[0] as Record<string, unknown>
    const copy = auditCopy(String(desktop.text ?? ''))
    const readerCopy = auditCopy(String(desktop.readerText ?? ''))
    const record = {
      slug,
      url,
      dossierVersion: desktop.dossierVersion,
      status: desktop.status,
      headingCount: (desktop.headings as string[]).length,
      firstHeadings: (desktop.headings as string[]).slice(0, 24),
      sectionIds: desktop.sectionIds,
      lanes: desktop.landmarks,
      firstViewportText: desktop.firstViewportText,
      mains: desktop.mains,
      detailsCount: desktop.details,
      focusableCount: desktop.focusable,
      viewports: shots.map((shot) => ({
        viewport: shot.viewport,
        overflow: shot.overflow,
        scrollWidth: shot.scrollWidth,
        clientWidth: shot.clientWidth,
        axeViolations: shot.axeViolations,
        htmlBytes: shot.htmlBytes,
      })),
      readerLayers: {
        internalKeys: readerCopy.internalKeys.map((hit) => hit.match).slice(0, 20),
        forbiddenPhrases: readerCopy.forbiddenPhrases.map((hit) => hit.match),
        unscopedCertainty: readerCopy.unscopedCertainty.map((hit) => hit.match),
        sentences: readerCopy.sentences.sentences,
        over20: readerCopy.sentences.over20,
        over30: readerCopy.sentences.over30,
        undefinedAcronyms: readerCopy.undefinedAcronyms.slice(0, 40),
      },
      copy: {
        internalKeys: copy.internalKeys.map((hit) => hit.match).slice(0, 20),
        forbiddenPhrases: copy.forbiddenPhrases.map((hit) => hit.match),
        unscopedCertainty: copy.unscopedCertainty.map((hit) => hit.match),
        sentences: copy.sentences.sentences,
        over20: copy.sentences.over20,
        over30: copy.sentences.over30,
        undefinedAcronyms: copy.undefinedAcronyms.slice(0, 40),
      },
    }
    writeFileSync(join(outDir, `${slug}.json`), `${JSON.stringify(record, null, 2)}\n`)
    summary.push(record)
    console.log(
      JSON.stringify({
        slug,
        version: record.dossierVersion,
        headings: record.headingCount,
        sections: (record.sectionIds as string[]).length,
        overflow320: (record.viewports as Record<string, unknown>[])[2]?.overflow,
        axe: (record.viewports as Record<string, unknown>[]).reduce(
          (total, shot) => total + (shot.axeViolations as unknown[]).length,
          0,
        ),
        internalKeysReader: record.readerLayers.internalKeys.length,
      }),
    )
  }
  writeFileSync(
    join(outDir, 'summary.json'),
    `${JSON.stringify(
      { label: args.label, base: args.base, capturedAt: new Date().toISOString(), pages: summary },
      null,
      2,
    )}\n`,
  )
  await browser.close()
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exit(1)
})
