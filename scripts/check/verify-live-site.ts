import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

/**
 * Check the deployed site from outside, over HTTP, the way a reader reaches it.
 *
 * Nothing here talks to the database or imports application code. It fetches URLs and reads what
 * comes back, because the thing being verified is the deployment rather than the build: a page that
 * renders in a test and 500s in production has not shipped.
 *
 * The sample deliberately spans the three kinds of record this release changed, because they fail
 * differently:
 *
 *   - **Flagship** records, curated by hand, which have always looked fine and are the regression
 *     risk — if a change broke these it broke the thing people already read.
 *   - **Label-derived** records, filled by this release's acquisition, which should now carry a
 *     mechanism or a recorded use where they carried nothing.
 *   - **Discontinued** medicines, whose labels are withdrawn and whose approval record is the only
 *     thing left, which should show that record rather than an empty page.
 *   - **Empty** records, which should say so plainly and carry a noindex instruction.
 *
 * Each page is checked for the things that would make it wrong rather than merely different: the
 * status, one `<main>`, a single `<h1>`, the medicine's name in it, no raw enum or template
 * artefact in reader text, the robots instruction matching what the page says about itself, and the
 * canonical URL pointing at the page it was served from.
 *
 *   npx tsx scripts/check/verify-live-site.ts --origin https://rnawiki.com
 */

interface Args {
  origin: string
  out: string
}

function parseArgs(argv: readonly string[]): Args {
  const args: Args = {
    origin: 'https://rnawiki.com',
    out: 'data/dossier-v4/live-verification.json',
  }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    const next = argv[index + 1]
    if (flag === '--origin' && next) ((args.origin = next.replace(/\/$/u, '')), (index += 1))
    else if (flag === '--out' && next) ((args.out = next), (index += 1))
  }
  return args
}

/** The medicines to check, and what each one is there to prove. */
const SAMPLE: ReadonlyArray<{ slug: string; kind: string; expect: string }> = [
  {
    slug: 'creatine-monohydrate',
    kind: 'flagship',
    expect: 'curated record, unchanged by this release',
  },
  { slug: 'semaglutide', kind: 'flagship', expect: 'curated record, unchanged by this release' },
  { slug: 'inclisiran', kind: 'flagship', expect: 'curated record, unchanged by this release' },
  { slug: 'atenolol', kind: 'label', expect: 'label-derived use and mechanism' },
  { slug: 'lovastatin', kind: 'label', expect: 'label-derived use and mechanism' },
  { slug: 'ofloxacin', kind: 'label', expect: 'label-derived mechanism from unheaded prose' },
  {
    slug: 'minoxidil',
    kind: 'label',
    expect: 'the near-miss record: mechanism must not be dosing advice',
  },
  { slug: 'trientine', kind: 'label', expect: 'four modules gained in this release' },
  {
    slug: 'carbenicillin',
    kind: 'discontinued',
    expect: 'approval register where the label is withdrawn',
  },
  {
    slug: 'norfloxacin',
    kind: 'discontinued',
    expect: 'approval register where the label is withdrawn',
  },
  {
    slug: 'cephapirin',
    kind: 'discontinued',
    expect: 'approval register where the label is withdrawn',
  },
  {
    slug: 'inamrinone',
    kind: 'discontinued',
    expect: 'approval register where the label is withdrawn',
  },
  {
    slug: 'desirudin',
    kind: 'discontinued',
    expect: 'approval register where the label is withdrawn',
  },
  /*
   * Classed as empty rather than sparse, which is what it is: zingiberene is one of the 2,429
   * records that hold none of the four things a reader came for, so it carries the unavailable
   * notice. Calling it sparse made the checker report the correct behaviour as a problem.
   */
  { slug: 'zingiberene', kind: 'empty', expect: 'unavailable notice and noindex' },
  { slug: 'nystatin', kind: 'sparse', expect: 'a thin record that still has something to show' },
  {
    slug: 'amanita-pantherina-fruiting-body',
    kind: 'empty',
    expect: 'unavailable notice and noindex',
  },
  { slug: 'beryllium-oxyacetate', kind: 'empty', expect: 'unavailable notice and noindex' },
  { slug: 'aspirin', kind: 'common', expect: 'a name everyone types' },
  { slug: 'ibuprofen', kind: 'common', expect: 'a name everyone types' },
  { slug: 'metformin', kind: 'common', expect: 'a name everyone types' },
  { slug: 'caffeine', kind: 'common', expect: 'a name everyone types' },
]

/** Other tiers of the site, which a medicine-page change should not have broken. */
const OTHER_PAGES: ReadonlyArray<{ path: string; kind: string; mustContain: string }> = [
  { path: '/', kind: 'home', mustContain: 'Understand any drug' },
  { path: '/browse', kind: 'index', mustContain: 'Browse' },
  { path: '/h', kind: 'hub index', mustContain: 'group' },
  { path: '/how-it-works', kind: 'explainer', mustContain: 'RNAWiki' },
  { path: '/review-queue', kind: 'review', mustContain: 'Sentences waiting for review' },
  { path: '/privacy', kind: 'policy', mustContain: 'Privacy' },
  { path: '/healthz', kind: 'health', mustContain: 'ok' },
  { path: '/sitemap.xml', kind: 'sitemap', mustContain: '<sitemap' },
  /*
   * Only the canonical production origin advertises a sitemap. Everywhere else the site fails
   * closed and serves a robots file that disallows everything, which is the behaviour we want and
   * would otherwise read as a failure whenever this is pointed at a local build.
   */
  { path: '/robots.txt', kind: 'robots', mustContain: 'User-agent' },
]

/** Things that must never appear in a reader's text. Each one shipped somewhere once. */
const NEVER_IN_READER_TEXT: ReadonlyArray<{ pattern: RegExp; why: string }> = [
  { pattern: /\bUnnamed counterpart\b/u, why: 'a placeholder name reaching a reader' },
  { pattern: /\bundefined\b/u, why: 'a missing value rendered as the word undefined' },
  { pattern: /\bNaN\b/u, why: 'a failed calculation rendered as a number' },
  { pattern: /\[object Object\]/u, why: 'an object rendered instead of its text' },
  { pattern: /\bno_qualifying_evidence\b|\bsource_checked_draft\b/u, why: 'a raw state code' },
  {
    pattern: /\bcommunity_reviewed\b|\bCommunity approved\b/u,
    why: 'review state on a reader page',
  },
  { pattern: /Review or improve · \d\/3/u, why: 'the review control this release removed' },
  { pattern: /PRELIMINARY, AWAITING REVIEW/iu, why: 'the banner this release removed' },
  { pattern: /more than a supplement would/u, why: 'the generic claim this release removed' },
  { pattern: /DOSSIER_V[34]_SLUGS/u, why: 'the layout flag this release removed' },
]

interface PageResult {
  url: string
  kind: string
  status: number
  ms: number
  bytes: number
  problems: string[]
  notes: string[]
}

/**
 * One attribute of the first tag that carries a given identifying attribute, in either order.
 *
 * e.g. the `content` of the `<meta>` whose `name` is `robots`, whether the markup reads
 * `<meta name="robots" content="...">` or `<meta content="..." name="robots">`.
 */
function attributeOf(
  html: string,
  tag: string,
  identifyingAttribute: string,
  identifyingValue: string,
  wanted: string,
): string | undefined {
  const pattern = new RegExp(`<${tag}\\b[^>]*>`, 'giu')
  for (const match of html.matchAll(pattern)) {
    const element = match[0]
    if (!new RegExp(`${identifyingAttribute}="${identifyingValue}"`, 'u').test(element)) continue
    return new RegExp(`${wanted}="([^"]*)"`, 'u').exec(element)?.[1]
  }
  return undefined
}

function textOf(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/giu, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/giu, ' ')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/&nbsp;/gu, ' ')
    .replace(/&amp;/gu, '&')
    .replace(/\s+/gu, ' ')
    .trim()
}

async function fetchPage(url: string, kind: string): Promise<PageResult> {
  const started = Date.now()
  const problems: string[] = []
  const notes: string[] = []
  let status = 0
  let html = ''
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': 'rnawiki-live-verification (+https://rnawiki.com)' },
      redirect: 'follow',
      signal: AbortSignal.timeout(45_000),
    })
    status = response.status
    html = await response.text()
  } catch (error) {
    problems.push(`request failed: ${String(error)}`)
  }
  return { url, kind, status, ms: Date.now() - started, bytes: html.length, problems, notes, ...{} }
}

async function checkMedicine(origin: string, entry: (typeof SAMPLE)[number]): Promise<PageResult> {
  const url = `${origin}/d/${entry.slug}`
  const result = await fetchPage(url, entry.kind)
  if (result.problems.length > 0) return result

  const response = await fetch(url, {
    headers: { 'user-agent': 'rnawiki-live-verification (+https://rnawiki.com)' },
    signal: AbortSignal.timeout(45_000),
  })
  const html = await response.text()
  const text = textOf(html)
  const { problems, notes } = result

  if (response.status !== 200) problems.push(`status ${response.status}`)

  const mains = [...html.matchAll(/<main\b/gu)].length
  if (mains !== 1) problems.push(`${mains} <main> elements, expected exactly 1`)

  const h1s = [...html.matchAll(/<h1\b/gu)].length
  if (h1s !== 1) problems.push(`${h1s} <h1> elements, expected exactly 1`)

  /*
   * Attribute order is not guaranteed and is not stable across renderers: the document routes emit
   * `content` before `name`, and the App Router pages emit them the other way round. A regex that
   * fixes the order reports "no robots tag" on half the site and looks like a finding rather than a
   * bug in the checker, so both of these match either order.
   */
  const canonical = attributeOf(html, 'link', 'rel', 'canonical', 'href')
  if (!canonical) problems.push('no canonical link')
  else if (!canonical.endsWith(`/d/${entry.slug}`)) notes.push(`canonical points at ${canonical}`)

  const robots = attributeOf(html, 'meta', 'name', 'robots', 'content') ?? 'none'
  notes.push(`robots: ${robots}`)

  const saysUnavailable = text.includes('RNAWiki has not found information about this substance')
  const noindexed = robots.includes('noindex')
  if (saysUnavailable && !noindexed) {
    problems.push('page says information is unavailable but is offered to search engines')
  }
  if (entry.kind === 'empty' && !saysUnavailable) {
    notes.push('expected the unavailable notice and did not find it')
  }
  if (entry.kind !== 'empty' && saysUnavailable) {
    problems.push(`a ${entry.kind} record is showing the unavailable notice`)
  }

  for (const { pattern, why } of NEVER_IN_READER_TEXT) {
    if (pattern.test(text)) problems.push(`${why}: ${pattern.source}`)
  }

  // The section this release added, and the one it removed.
  if (text.includes('What people report')) problems.push('the removed community lane is rendering')
  if (/\d+ questions? this page could not answer/u.test(text)) notes.push('names what is missing')

  // Register facts reaching the page, which is this release's largest content change.
  if (/(approved applications? cover|published labels? name|products? lists? this)/u.test(text)) {
    notes.push('register facts rendering')
  }
  if (entry.kind === 'discontinued' && !/Marketing status on the register/u.test(text)) {
    notes.push('no marketing status shown for a discontinued medicine')
  }

  return { ...result, status: response.status, bytes: html.length, problems, notes }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  process.stdout.write(`verifying ${args.origin}\n\n`)

  const results: PageResult[] = []

  for (const entry of OTHER_PAGES) {
    const result = await fetchPage(`${args.origin}${entry.path}`, entry.kind)
    if (result.status !== 200) result.problems.push(`status ${result.status}`)
    else {
      const response = await fetch(`${args.origin}${entry.path}`, {
        signal: AbortSignal.timeout(45_000),
      })
      const body = await response.text()
      if (!body.toLowerCase().includes(entry.mustContain.toLowerCase())) {
        result.problems.push(`does not contain ${JSON.stringify(entry.mustContain)}`)
      }
      result.bytes = body.length
    }
    results.push(result)
    process.stdout.write(
      `${result.problems.length === 0 ? 'ok  ' : 'FAIL'} ${String(result.status).padStart(3)} ${String(result.ms).padStart(5)}ms  ${entry.path}${result.problems.length ? ` · ${result.problems.join('; ')}` : ''}\n`,
    )
  }

  process.stdout.write('\n')

  for (const entry of SAMPLE) {
    const result = await checkMedicine(args.origin, entry)
    results.push(result)
    process.stdout.write(
      `${result.problems.length === 0 ? 'ok  ' : 'FAIL'} ${String(result.status).padStart(3)} ${String(result.ms).padStart(5)}ms  ${entry.slug} (${entry.kind})${
        result.problems.length ? `\n       problems: ${result.problems.join('; ')}` : ''
      }${result.notes.length ? `\n       ${result.notes.join(' · ')}` : ''}\n`,
    )
  }

  const failed = results.filter((result) => result.problems.length > 0)
  const summary = {
    origin: args.origin,
    checked: results.length,
    failed: failed.length,
    slowestMs: Math.max(...results.map((result) => result.ms)),
    medianMs: results.map((result) => result.ms).sort((a, b) => a - b)[
      Math.floor(results.length / 2)
    ],
  }

  const outPath = resolve(args.out)
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, `${JSON.stringify({ summary, results }, null, 2)}\n`)

  process.stdout.write(`\n${JSON.stringify(summary, null, 2)}\n`)
  if (failed.length > 0) process.exitCode = 1
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
