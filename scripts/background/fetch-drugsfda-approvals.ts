import 'dotenv/config'
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { eq, sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { drugs } from '@/db/schema'
import type { MedicineRecordedBackground } from '@/lib/background/types'

/**
 * Fill the approval record for medicines whose label is no longer published.
 *
 * The label pass reached 172 medicines and left 1,026 approved ones with nothing. Sampling them
 * showed two causes, and only one of them is an absence. Cetostearyl alcohol and palmitoyl
 * tetrapeptide-7 are cosmetic ingredients that the corpus classified as approved drugs; no drug
 * label exists and none should. Carbenicillin, inamrinone, cephapirin, desirudin, norfloxacin and
 * copanlisib are different: every one was approved, and every one has been discontinued. openFDA's
 * label endpoint carries labels that are currently published, and DailyMed's search does the same,
 * so a discontinued medicine returns nothing from both while its approval is a matter of record.
 *
 * Drugs@FDA holds that record. Searching `products.active_ingredients.name` rather than
 * `openfda.generic_name` is what reaches it — the openFDA cross-reference is built from current
 * labels and is empty for exactly these medicines, which is why the first pass missed them.
 *
 * What this stores is what the register states: the application numbers, the sponsor, the kinds of
 * application, the marketing statuses and the earliest approval date. No prose, no mechanism, no
 * summary. A discontinued medicine's page gains a true statement about its approval and marketing
 * status rather than staying blank, and nothing about how it works is invented to go with it.
 *
 *   npx tsx scripts/background/fetch-drugsfda-approvals.ts --limit 50 --dry-run
 *   npx tsx scripts/background/fetch-drugsfda-approvals.ts --concurrency 4
 */

interface Args {
  limit: number
  concurrency: number
  dryRun: boolean
  out: string
}

function parseArgs(argv: readonly string[]): Args {
  const args: Args = {
    limit: Number.POSITIVE_INFINITY,
    concurrency: 4,
    dryRun: false,
    out: 'data/background/drugsfda-acquisition.ndjson',
  }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    const next = argv[index + 1]
    if (flag === '--limit' && next) ((args.limit = Number.parseInt(next, 10)), (index += 1))
    else if (flag === '--concurrency' && next)
      ((args.concurrency = Number.parseInt(next, 10)), (index += 1))
    else if (flag === '--dry-run') args.dryRun = true
    else if (flag === '--out' && next) ((args.out = next), (index += 1))
  }
  return args
}

async function getJson<T>(url: string, attempt = 0): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': 'rnawiki-background-acquisition (+https://rnawiki.com)' },
      signal: AbortSignal.timeout(45_000),
    })
    if (response.status === 404) return null
    if (response.status === 429 || response.status >= 500) {
      if (attempt >= 3) return null
      await new Promise((done) => setTimeout(done, 2000 * (attempt + 1)))
      return getJson<T>(url, attempt + 1)
    }
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    if (attempt >= 2) return null
    await new Promise((done) => setTimeout(done, 1500 * (attempt + 1)))
    return getJson<T>(url, attempt + 1)
  }
}

interface DrugsFdaApplication {
  application_number?: string
  sponsor_name?: string
  products?: Array<{
    brand_name?: string
    marketing_status?: string
    active_ingredients?: Array<{ name?: string }>
  }>
  submissions?: Array<{
    submission_type?: string
    submission_status?: string
    submission_status_date?: string
  }>
}

async function applicationsFor(name: string): Promise<DrugsFdaApplication[]> {
  const quoted = `"${name.replace(/"/gu, ' ').trim()}"`
  for (const field of ['products.active_ingredients.name', 'products.brand_name']) {
    const body = await getJson<{ results?: DrugsFdaApplication[] }>(
      `https://api.fda.gov/drug/drugsfda.json?search=${field}:${encodeURIComponent(quoted)}&limit=20`,
    )
    const results = body?.results ?? []
    if (results.length > 0) return results
  }
  return []
}

/** Only applications whose active ingredient actually matches; a brand search can be loose. */
function matching(applications: DrugsFdaApplication[], name: string): DrugsFdaApplication[] {
  const wanted = name.trim().toLowerCase()
  return applications.filter((application) =>
    (application.products ?? []).some((product) =>
      (product.active_ingredients ?? []).some(
        (ingredient) => (ingredient.name ?? '').trim().toLowerCase() === wanted,
      ),
    ),
  )
}

interface RegulatoryApproval {
  source: { kind: string; label: string; identifier: string; retrievedAt: string }
  applicationCount: number
  sampleApplicationNumbers: string[]
  earliestApplicationNumber?: string
  earliestSponsorAsRecorded?: string
  applicationKindsAsRecorded: string[]
  marketingStatusesAsRecorded: string[]
  earliestOriginalApprovalDate?: string
}

function buildApproval(
  applications: DrugsFdaApplication[],
  retrievedAt: string,
): RegulatoryApproval | null {
  const numbers = [
    ...new Set(
      applications.flatMap((application) =>
        application.application_number ? [application.application_number] : [],
      ),
    ),
  ].sort()
  if (numbers.length === 0) return null

  const kinds = [
    ...new Set(numbers.map((number) => number.replace(/\d+$/u, '')).filter(Boolean)),
  ].sort()
  const statuses = [
    ...new Set(
      applications.flatMap((application) =>
        (application.products ?? []).flatMap((product) =>
          product.marketing_status ? [product.marketing_status] : [],
        ),
      ),
    ),
  ].sort()

  const approvalDates = applications
    .flatMap((application) => application.submissions ?? [])
    .filter(
      (submission) =>
        submission.submission_type === 'ORIG' && submission.submission_status === 'AP',
    )
    .flatMap((submission) =>
      submission.submission_status_date ? [submission.submission_status_date] : [],
    )
    .sort()

  const earliest = numbers[0]
  const sponsor = applications.find(
    (application) => application.application_number === earliest,
  )?.sponsor_name

  return {
    source: {
      kind: 'FDA_DRUGSFDA',
      label: 'Drugs@FDA application register',
      identifier: earliest ?? numbers[0]!,
      retrievedAt,
    },
    applicationCount: numbers.length,
    sampleApplicationNumbers: numbers.slice(0, 8),
    ...(earliest ? { earliestApplicationNumber: earliest } : {}),
    ...(sponsor ? { earliestSponsorAsRecorded: sponsor } : {}),
    applicationKindsAsRecorded: kinds,
    marketingStatusesAsRecorded: statuses,
    ...(approvalDates[0] ? { earliestOriginalApprovalDate: approvalDates[0] } : {}),
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const retrievedAt = new Date().toISOString().slice(0, 10)

  const rows = await db
    .select({ slug: drugs.slug, name: drugs.name, background: drugs.recordedBackground })
    .from(drugs)
    .where(
      sql`${drugs.approvalStatus}::text in ('FDA Approved','Accelerated Approval','Withdrawn from Market','EMA Approved','Controlled / No Approved Use')
        and (${drugs.recordedBackground} is null
             or not jsonb_exists(${drugs.recordedBackground}, 'regulatoryApproval'))`,
    )
    .orderBy(drugs.slug)

  const only = process.argv.includes('--slug')
    ? process.argv[process.argv.indexOf('--slug') + 1]
    : undefined
  const selected = only ? rows.filter((row) => row.slug === only) : rows
  const targets = selected.slice(0, Number.isFinite(args.limit) ? args.limit : undefined)
  process.stdout.write(`${targets.length} medicines to try · concurrency ${args.concurrency}\n`)

  const outPath = resolve(args.out)
  mkdirSync(dirname(outPath), { recursive: true })
  if (!existsSync(outPath)) writeFileSync(outPath, '')

  const counts = new Map<string, number>()
  const statusSeen = new Map<string, number>()
  let cursor = 0
  let done = 0
  const started = Date.now()

  const worker = async (): Promise<void> => {
    for (;;) {
      const target = targets[cursor]
      if (!target) return
      cursor += 1
      const applications = matching(await applicationsFor(target.name), target.name)
      const approval = buildApproval(applications, retrievedAt)
      done += 1
      const status = approval ? 'filled' : 'no_application'
      counts.set(status, (counts.get(status) ?? 0) + 1)
      for (const marketing of approval?.marketingStatusesAsRecorded ?? []) {
        statusSeen.set(marketing, (statusSeen.get(marketing) ?? 0) + 1)
      }
      appendFileSync(
        outPath,
        `${JSON.stringify({
          slug: target.slug,
          name: target.name,
          status,
          applications: approval?.sampleApplicationNumbers ?? [],
          marketing: approval?.marketingStatusesAsRecorded ?? [],
        })}\n`,
      )
      if (!args.dryRun && approval) {
        const existing = (target.background ?? null) as MedicineRecordedBackground | null
        // A curated record is never overwritten by an automated pass.
        if (existing?.provenanceTier === 'curated') continue
        const merged = {
          ...(existing ?? {
            version: 'medicine-background/v1',
            authoredAt: retrievedAt,
            provenanceTier: 'transcribed',
          }),
          regulatoryApproval: approval,
        } as unknown as MedicineRecordedBackground
        await db
          .update(drugs)
          .set({ recordedBackground: merged })
          .where(eq(drugs.slug, target.slug))
      }
      if (done % 50 === 0) {
        const rate = done / ((Date.now() - started) / 1000)
        process.stdout.write(
          `${done}/${targets.length} · ${rate.toFixed(1)}/s · ${JSON.stringify(Object.fromEntries(counts))}\n`,
        )
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, args.concurrency) }, worker))

  const summary = {
    attempted: targets.length,
    byOutcome: Object.fromEntries([...counts.entries()].sort((a, b) => b[1] - a[1])),
    marketingStatuses: Object.fromEntries([...statusSeen.entries()].sort((a, b) => b[1] - a[1])),
    report: args.out,
  }
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
  writeFileSync(
    resolve('data/background/drugsfda-acquisition-summary.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
  )
}

void main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await closeDatabasePool()
  })
