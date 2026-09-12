import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import AxeBuilder from '@axe-core/playwright'
import { chromium, type Page } from '@playwright/test'

/**
 * Run the accessibility rules against the deployed site, in a real browser, at three widths.
 *
 * The browser suite already runs axe against pages served from a local build. This runs it against
 * what is actually deployed, which is a different question: a stylesheet that failed to upload, a
 * font that does not load, or a content-security header that blocks something all change contrast,
 * focus visibility and reading order without changing a single line of code.
 *
 * Three widths because the failures differ. 320 px is the narrowest the project supports and is where
 * overflow and target size go wrong. 768 px is where a two-column layout collapses. 1440 px is where
 * most people read it.
 *
 * WCAG 2.2 AA is the standard checked. Automated rules catch perhaps a third of what matters — they
 * cannot tell whether a heading describes its section or whether alternative text is true — so a
 * clean run here is a floor rather than a certificate.
 *
 *   npx tsx scripts/check/audit-live-accessibility.ts --origin https://rnawiki.com
 */

interface Args {
  origin: string
  out: string
}

function parseArgs(argv: readonly string[]): Args {
  const args: Args = {
    origin: 'https://rnawiki.com',
    out: 'data/dossier-v4/live-accessibility.json',
  }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    const next = argv[index + 1]
    if (flag === '--origin' && next) ((args.origin = next.replace(/\/$/u, '')), (index += 1))
    else if (flag === '--out' && next) ((args.out = next), (index += 1))
  }
  return args
}

/** One page of each kind, because a template is only as accessible as its emptiest instance. */
const PATHS: ReadonlyArray<{ path: string; why: string }> = [
  { path: '/', why: 'the home page, which is the frozen search-first layout' },
  { path: '/browse', why: 'the medicine index' },
  { path: '/d/creatine-monohydrate', why: 'a full curated record' },
  { path: '/d/atenolol', why: 'a label-derived record' },
  { path: '/d/carbenicillin', why: 'a discontinued medicine, carrying only an approval record' },
  { path: '/d/zingiberene', why: 'a sparse record, which is mostly the absence block' },
  { path: '/d/beryllium-oxyacetate', why: 'an empty record, which is the unavailable notice' },
  { path: '/review-queue', why: 'the only way into review, reached from every footer' },
  { path: '/how-it-works', why: 'the explainer' },
]

const WIDTHS = [320, 768, 1440] as const

interface Violation {
  id: string
  impact: string
  help: string
  nodes: number
  sample: string
}

interface Result {
  path: string
  width: number
  status: number
  violations: Violation[]
  /** Serious structural facts, checked here because a screen reader depends on them. */
  landmarks: { mains: number; h1s: number; headingOrderBreaks: number }
  horizontalOverflow: boolean
}

async function headingOrderBreaks(page: Page): Promise<number> {
  return page.evaluate(() => {
    const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((node) =>
      Number.parseInt(node.tagName.slice(1), 10),
    )
    let breaks = 0
    for (let index = 1; index < levels.length; index += 1) {
      // Going deeper by more than one level skips a heading and leaves a gap in the outline.
      if ((levels[index] ?? 0) - (levels[index - 1] ?? 0) > 1) breaks += 1
    }
    return breaks
  })
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  process.stdout.write(`auditing ${args.origin} at ${WIDTHS.join(', ')} px\n\n`)

  const browser = await chromium.launch()
  const results: Result[] = []

  try {
    for (const width of WIDTHS) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        colorScheme: 'light',
        reducedMotion: 'reduce',
        userAgent: 'rnawiki-live-accessibility (+https://rnawiki.com)',
      })
      const page = await context.newPage()

      for (const entry of PATHS) {
        const response = await page.goto(`${args.origin}${entry.path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 45_000,
        })
        const status = response?.status() ?? 0

        const axe = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze()

        const violations: Violation[] = axe.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact ?? 'unknown',
          help: violation.help,
          nodes: violation.nodes.length,
          sample: (violation.nodes[0]?.html ?? '').slice(0, 120),
        }))

        const landmarks = {
          mains: await page.locator('main').count(),
          h1s: await page.locator('h1').count(),
          headingOrderBreaks: await headingOrderBreaks(page),
        }
        const horizontalOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
        )

        results.push({ path: entry.path, width, status, violations, landmarks, horizontalOverflow })

        const serious = violations.filter(
          (violation) => violation.impact === 'serious' || violation.impact === 'critical',
        )
        const flag =
          serious.length === 0 && !horizontalOverflow && landmarks.mains === 1 ? 'ok  ' : 'FAIL'
        process.stdout.write(
          `${flag} ${String(width).padStart(4)}px ${entry.path}` +
            `${serious.length ? ` · ${serious.length} serious: ${serious.map((v) => v.id).join(', ')}` : ''}` +
            `${horizontalOverflow ? ' · scrolls sideways' : ''}` +
            `${landmarks.mains !== 1 ? ` · ${landmarks.mains} <main>` : ''}` +
            `${landmarks.h1s !== 1 ? ` · ${landmarks.h1s} <h1>` : ''}` +
            `${landmarks.headingOrderBreaks ? ` · ${landmarks.headingOrderBreaks} heading-level skips` : ''}\n`,
        )
      }
      await context.close()
    }
  } finally {
    await browser.close()
  }

  const serious = results.flatMap((result) =>
    result.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    ),
  )
  const summary = {
    origin: args.origin,
    pagesChecked: results.length,
    seriousOrCritical: serious.length,
    allViolations: results.reduce((total, result) => total + result.violations.length, 0),
    pagesThatScrollSideways: results.filter((result) => result.horizontalOverflow).length,
    pagesWithoutExactlyOneMain: results.filter((result) => result.landmarks.mains !== 1).length,
    pagesWithHeadingSkips: results.filter((result) => result.landmarks.headingOrderBreaks > 0)
      .length,
    byRule: Object.fromEntries(
      [
        ...results
          .flatMap((result) => result.violations)
          .reduce(
            (counts, violation) => counts.set(violation.id, (counts.get(violation.id) ?? 0) + 1),
            new Map<string, number>(),
          ),
      ].sort((a, b) => b[1] - a[1]),
    ),
  }

  const outPath = resolve(args.out)
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, `${JSON.stringify({ summary, results }, null, 2)}\n`)
  process.stdout.write(`\n${JSON.stringify(summary, null, 2)}\n`)

  if (serious.length > 0 || summary.pagesThatScrollSideways > 0) process.exitCode = 1
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
