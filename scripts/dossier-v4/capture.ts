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

import { auditCopy, sentenceStats } from '@/lib/dossier-v3/copy-contract'

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

    /*
     * Text is collected per block, not as one run of text nodes.
     *
     * Joining every text node with a space makes a table row read as one sentence: the creatine
     * goal matrix produced a "131-word sentence" that is nine separate cells a reader meets one at
     * a time. That inflated the over-30-word count on both the v3 and the v4 surface and hid the
     * genuinely long sentences underneath it. Each block's text is terminated before the next one
     * starts, so the sentence audit counts sentences a reader could actually read aloud.
     *
     * Written as one iterative walk with an explicit stack rather than a recursive helper: esbuild
     * names function expressions and injects a `__name` helper that does not exist in the page.
     */
    const BLOCK =
      'P,LI,TD,TH,DT,DD,H1,H2,H3,H4,H5,H6,SUMMARY,FIGCAPTION,CAPTION,BLOCKQUOTE,LABEL,LEGEND'
    const blockTags = new Set(BLOCK.split(','))
    const blockSelector = BLOCK.toLowerCase().split(',').join(',')
    const allBlocks: string[] = []
    const readerBlocks: string[] = []
    const stack: Element[] = main ? [main] : []
    while (stack.length > 0) {
      const node = stack.pop()
      if (!node) continue
      /*
       * A block counts only when it holds no other block. A list item that contains four
       * paragraphs is a container, not a sentence: taking its whole text merged a stage label, a
       * step title, a description and an evidence note into one forty-word "sentence" that no
       * reader meets as one.
       */
      const isLeafBlock = blockTags.has(node.tagName) && node.querySelector(blockSelector) === null
      if (isLeafBlock) {
        /*
         * Text nodes joined with a space, not `textContent`. `textContent` runs adjacent elements
         * together with no separator, which invented words: a cell holding "Not recorded" beside a
         * screen-reader sentence beginning "Harms were not..." produced the token "recordedHarms",
         * which then failed the internal-key check as a camelCase key that nobody had written.
         */
        const pieces: string[] = []
        const inner = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
        while (inner.nextNode()) {
          // Decorative glyphs are hidden from the accessibility tree and are not reader copy. They
          // also break the sentence splitter, which needs a capital after a full stop.
          const owner = inner.currentNode.parentElement
          if (owner && owner.closest('[aria-hidden="true"]')) continue
          const piece = inner.currentNode.textContent?.trim()
          if (piece) pieces.push(piece)
        }
        const value = pieces.join(' ').replace(/\s+/g, ' ').trim()
        if (value) {
          const terminated = /[.!?:;]$/.test(value) ? value : `${value}.`
          allBlocks.push(terminated)
          if (!technical.some((section) => section.contains(node))) readerBlocks.push(terminated)
        }
        continue
      }
      const children = node.children
      for (let index = children.length - 1; index >= 0; index -= 1) {
        const child = children[index]
        if (child) stack.push(child)
      }
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
      text: allBlocks.join(' '),
      readerText: readerBlocks.join(' '),
      blocks: allBlocks,
      readerBlocks,
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
    /*
     * Sentence length is counted per block, not over the joined page.
     *
     * `splitSentences` only breaks when the next character is a capital or a digit, so a list of
     * lowercase registry terms after a paragraph reads as one sentence of forty words that nobody
     * ever meets. A reader meets one block at a time, so each block is audited on its own and the
     * counts are summed.
     */
    const blockStats = (
      blocks: unknown,
    ): { sentences: number; over20: number; over30: number; longest: string[] } => {
      const list = Array.isArray(blocks) ? (blocks as string[]) : []
      let sentences = 0
      let over20 = 0
      let over30 = 0
      const longest: Array<{ words: number; text: string }> = []
      for (const block of list) {
        const stats = sentenceStats(block, 1)
        sentences += stats.sentences
        over20 += stats.over20
        over30 += stats.over30
        const top = stats.longest?.[0]
        if (top) longest.push(top)
      }
      longest.sort((left, right) => right.words - left.words)
      return {
        sentences,
        over20,
        over30,
        longest: longest
          .filter((entry) => entry.words > 30)
          .slice(0, 12)
          .map((entry) => `${entry.words}: ${entry.text.slice(0, 200)}`),
      }
    }
    const readerSentences = blockStats(desktop.readerBlocks)
    const pageSentences = blockStats(desktop.blocks)
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
        sentences: readerSentences.sentences,
        over20: readerSentences.over20,
        over30: readerSentences.over30,
        longestOver30: readerSentences.longest,
        undefinedAcronyms: readerCopy.undefinedAcronyms.slice(0, 40),
      },
      copy: {
        internalKeys: copy.internalKeys.map((hit) => hit.match).slice(0, 20),
        forbiddenPhrases: copy.forbiddenPhrases.map((hit) => hit.match),
        unscopedCertainty: copy.unscopedCertainty.map((hit) => hit.match),
        sentences: pageSentences.sentences,
        over20: pageSentences.over20,
        over30: pageSentences.over30,
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
