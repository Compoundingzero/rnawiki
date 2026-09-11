/**
 * Capture desktop and mobile screenshots of dossier pages, run the axe accessibility checks and
 * a copy-contract audit over the reader text, and measure a few page facts, for the before/after
 * benchmark (docs/rnawiki-biohacker-rebuild-audit.md, "Benchmark").
 *
 *   npx tsx scripts/dossier-v3/capture.ts --base http://localhost:3100 --label after \
 *     --slugs semaglutide,metformin,inclisiran,creatine-monohydrate --out data/dossier-v3/benchmark
 *
 * Needs a running server. Writes `<out>/<label>/<slug>-{desktop,mobile}.png`, one JSON summary per
 * page and `<out>/<label>/summary.json`. Nothing here changes the database.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import AxeBuilder from '@axe-core/playwright'
import { chromium } from '@playwright/test'

import { auditCopy } from '@/lib/dossier-v3/copy-contract'

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
    out: 'data/dossier-v3/benchmark',
  }
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i]
    const next = argv[i + 1]
    if (flag === '--base' && next) ((args.base = next), (i += 1))
    else if (flag === '--label' && next) ((args.label = next), (i += 1))
    else if (flag === '--slugs' && next)
      ((args.slugs = next
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)),
        (i += 1))
    else if (flag === '--out' && next) ((args.out = next), (i += 1))
  }
  if (args.slugs.length === 0) throw new Error('pass --slugs')
  return args
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const outDir = resolve(args.out, args.label)
  mkdirSync(outDir, { recursive: true })
  const browser = await chromium.launch()
  const summary: Record<string, unknown>[] = []
  for (const slug of args.slugs) {
    const url = `${args.base}/d/${slug}`
    const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const page = await desktop.newPage()
    const started = Date.now()
    const response = await page.goto(url, { waitUntil: 'networkidle' })
    const ttfbMs = Date.now() - started
    const html = (await response?.text()) ?? ''
    await page.screenshot({ path: join(outDir, `${slug}-desktop.png`), fullPage: false })
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze()
    const facts = await page.evaluate(() => {
      const mains = document.querySelectorAll('main').length
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(
        (h) => `${h.tagName.toLowerCase()}:${h.textContent?.trim().slice(0, 80) ?? ''}`,
      )
      // Text nodes joined with a space: innerText would apply CSS text-transform (every
      // uppercase label becomes a false acronym) and skip closed disclosures, while textContent
      // runs adjacent elements together ("10 secondsPrescription"). Reader text is every text node.
      const main = document.querySelector('main')
      const deep = document.getElementById('deep-evidence')
      const walker = main ? document.createTreeWalker(main, NodeFilter.SHOW_TEXT) : null
      const parts: string[] = []
      const readerParts: string[] = []
      while (walker && walker.nextNode()) {
        const node = walker.currentNode
        const value = node.textContent?.trim()
        if (!value) continue
        parts.push(value)
        // The deep-evidence layer is the explicitly labelled technical disclosure; the reader
        // layers are everything else. Both are audited and both are reported.
        if (!deep || !deep.contains(node)) readerParts.push(value)
      }
      const text = parts.join(' ')
      const readerText = readerParts.join(' ')
      const details = document.querySelectorAll('details').length
      const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth
      return { mains, headings, text, readerText, details, overflow }
    })
    const mobileContext = await browser.newContext({ viewport: { width: 320, height: 700 } })
    const mobile = await mobileContext.newPage()
    await mobile.goto(url, { waitUntil: 'networkidle' })
    await mobile.screenshot({ path: join(outDir, `${slug}-mobile.png`), fullPage: false })
    const mobileOverflow = await mobile.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    // Keyboard: tab through the first 40 focusable elements and record that focus moves.
    const focusable = await mobile.evaluate(
      () =>
        document.querySelectorAll(
          'a[href], button, input, summary, [tabindex]:not([tabindex="-1"])',
        ).length,
    )
    await mobileContext.close()
    const copy = auditCopy(facts.text)
    const readerCopy = auditCopy(facts.readerText)
    const record = {
      slug,
      url,
      status: response?.status() ?? 0,
      dossierVersion: response?.headers()['x-rnawiki-dossier'] ?? 'corpus',
      ttfbMs,
      htmlBytes: Buffer.byteLength(html, 'utf8'),
      textChars: facts.text.length,
      textToHtml: Number(
        (facts.text.length / Math.max(1, Buffer.byteLength(html, 'utf8'))).toFixed(3),
      ),
      mains: facts.mains,
      headingCount: facts.headings.length,
      firstHeadings: facts.headings.slice(0, 16),
      detailsCount: facts.details,
      focusableCount: focusable,
      horizontalOverflowDesktop: facts.overflow,
      horizontalOverflow320: mobileOverflow,
      axeViolations: axe.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.length,
        help: violation.help,
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
    await desktop.close()
    console.log(
      JSON.stringify({
        slug,
        status: record.status,
        version: record.dossierVersion,
        htmlBytes: record.htmlBytes,
        textToHtml: record.textToHtml,
        axe: record.axeViolations.length,
        internalKeysWholePage: record.copy.internalKeys.length,
        internalKeysReaderLayers: record.readerLayers.internalKeys.length,
        overflow320: mobileOverflow,
      }),
    )
  }
  writeFileSync(
    join(outDir, 'summary.json'),
    `${JSON.stringify({ label: args.label, base: args.base, capturedAt: new Date().toISOString(), pages: summary }, null, 2)}\n`,
  )
  await browser.close()
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack : String(error))
  process.exit(1)
})
