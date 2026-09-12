/**
 * Crawl every public medicine page over HTTP and check what a reader is actually served.
 *
 * `validate-corpus.ts` builds the view model for all 10,250 pages, which is the right check for
 * what the model decides. It cannot see what the components render, and the thing this release
 * changed is exactly that: a banner that the model still knows about and the page no longer shows.
 * So this asks the server.
 *
 *   npx tsx scripts/dossier-v4/crawl-review-surface.ts --base http://localhost:3100
 *   npx tsx scripts/dossier-v4/crawl-review-surface.ts --base https://rnawiki.com --limit 200
 *
 * Exits non-zero on any page that serves the removed banner, that fails to answer, or that answers
 * as a compass page without the review control. Writes a JSON report beside the other v4 artefacts.
 */
import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { db } from '@/db'
import { corpusPages, drugs } from '@/db/schema'

/**
 * What a reader sees without opening anything.
 *
 * Content inside a closed `<details>` is removed, innermost first so nesting is handled, because
 * that is where this release deliberately moved the long provenance explanation. Checking raw HTML
 * would report the move as a failure to move it. The `<summary>` stays: it is on screen.
 */
function readerVisible(html: string): string {
  let previous = ''
  let current = html
  while (current !== previous) {
    previous = current
    current = current.replace(
      /<details(?![^>]*\sopen)[^>]*>([\s\S]*?)<\/details>/g,
      (_whole, inner: string) => {
        const summary = /<summary[^>]*>([\s\S]*?)<\/summary>/.exec(inner)
        return summary ? ` ${summary[1]} ` : ' '
      },
    )
  }
  return current
}

/** Strings a reader must never be served again. */
const REMOVED = [
  'PRELIMINARY, AWAITING REVIEW',
  'Preliminary, awaiting review',
  'Read it as a working draft',
  'nobody has signed it off yet',
  'A person wrote this into the record with the study named beside it. No reviewer has signed it off.',
  'Editorial policy',
  'Analytics choices',
  'Sign in on the front page',
]

/** Strings a compass page must carry. */
const REQUIRED_ON_COMPASS = ['dv4-review-pill', '/review-queue?slug=']

interface Args {
  base: string
  limit: number
  concurrency: number
  out: string
}

function parseArgs(argv: readonly string[]): Args {
  const args: Args = {
    base: 'http://localhost:3100',
    limit: Number.POSITIVE_INFINITY,
    concurrency: 16,
    out: 'data/dossier-v4/review-surface-crawl.json',
  }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    const next = argv[index + 1]
    if (flag === '--base' && next) ((args.base = next.replace(/\/$/, '')), (index += 1))
    else if (flag === '--limit' && next) ((args.limit = Number.parseInt(next, 10)), (index += 1))
    else if (flag === '--concurrency' && next)
      ((args.concurrency = Number.parseInt(next, 10)), (index += 1))
    else if (flag === '--out' && next) ((args.out = next), (index += 1))
  }
  return args
}

interface Finding {
  slug: string
  status: number
  problem: string
  detail: string
}

async function publicSlugs(limit: number): Promise<string[]> {
  const [corpus, legacy] = await Promise.all([
    db.select({ slug: corpusPages.slug }).from(corpusPages),
    db.select({ slug: drugs.slug }).from(drugs),
  ])
  const all = new Set<string>()
  for (const row of [...corpus, ...legacy]) if (row.slug) all.add(row.slug)
  return [...all].sort().slice(0, Number.isFinite(limit) ? limit : undefined)
}

async function checkSlug(base: string, slug: string): Promise<Finding[]> {
  let response: Response
  try {
    response = await fetch(`${base}/d/${encodeURIComponent(slug)}`, {
      headers: { 'user-agent': 'rnawiki-review-surface-crawl' },
    })
  } catch (error) {
    return [{ slug, status: 0, problem: 'unreachable', detail: String(error) }]
  }
  // A 404 or a 410 is a decision the route made on purpose; only a server error is a defect here.
  if (response.status >= 500) {
    return [{ slug, status: response.status, problem: 'server_error', detail: '' }]
  }
  if (response.status !== 200) return []

  const isCompass = response.headers.get('x-rnawiki-dossier') === 'v4'
  const html = await response.text()
  const visible = readerVisible(html)
  const findings: Finding[] = []

  for (const phrase of REMOVED) {
    if (visible.includes(phrase)) {
      findings.push({ slug, status: 200, problem: 'removed_surface_present', detail: phrase })
    }
  }
  if (isCompass) {
    for (const marker of REQUIRED_ON_COMPASS) {
      if (!html.includes(marker)) {
        findings.push({ slug, status: 200, problem: 'review_control_missing', detail: marker })
      }
    }
  }
  return findings
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const slugs = await publicSlugs(args.limit)
  process.stdout.write(`crawling ${slugs.length} pages at ${args.base}\n`)

  const findings: Finding[] = []
  let done = 0
  let compassPages = 0
  const started = Date.now()

  const worker = async (): Promise<void> => {
    for (;;) {
      const slug = slugs[done]
      if (slug === undefined) return
      done += 1
      const index = done
      const page = await checkSlug(args.base, slug)
      findings.push(...page)
      if (page.every((finding) => finding.problem !== 'unreachable')) compassPages += 0
      if (index % 500 === 0) {
        const rate = index / ((Date.now() - started) / 1000)
        process.stdout.write(
          `${index}/${slugs.length} · ${rate.toFixed(0)}/s · ${findings.length} findings\n`,
        )
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, args.concurrency) }, worker))

  const byProblem = new Map<string, number>()
  for (const finding of findings) {
    byProblem.set(finding.problem, (byProblem.get(finding.problem) ?? 0) + 1)
  }
  const report = {
    base: args.base,
    pages: slugs.length,
    compassPages,
    findings: findings.slice(0, 200),
    totals: Object.fromEntries(byProblem),
  }
  mkdirSync(dirname(resolve(args.out)), { recursive: true })
  writeFileSync(resolve(args.out), `${JSON.stringify(report, null, 2)}\n`)
  process.stdout.write(
    `${JSON.stringify({ pages: slugs.length, findings: findings.length, totals: report.totals })}\n`,
  )
  process.exitCode = findings.length === 0 ? 0 : 1
}

void main().then(async () => {
  const { closeDatabasePool } = await import('@/db')
  await closeDatabasePool()
})
