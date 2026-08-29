import 'dotenv/config'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { normalizeContentName, normalizeIdentityName } from '@/lib/background/name-normalization'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import type { MedicineRecordedBackground, RecordedRegulatoryApproval } from '@/lib/background/types'

/**
 * Records when a substance first entered regulated use, from the Drugs@FDA application register.
 *
 * The corpus could say what a medicine is and what its label states, and nothing at all about when
 * it was approved. A date orients a reader more than almost anything else on a page: a substance
 * first approved in 1952 and one first approved last year are different kinds of thing before a
 * word is said about either.
 *
 * Every value is a fact about an application record. An approval is a regulatory event, not a
 * statement that a medicine works, and a discontinued marketing status is not a statement that it
 * failed — products are withdrawn for commercial reasons constantly, and the record says so rather
 * than letting the word carry an implication.
 *
 * The count is of approved applications whose products declare this substance, combinations
 * included. That is deliberate, and the recorded wording matches it: the earliest approval of a
 * product CONTAINING the substance. Narrowing to single-ingredient products would answer a
 * different and less useful question, and unlike a pharmacologic class there is nothing here that
 * could be attributed to the wrong ingredient — an approval date belongs to the application.
 *
 * Source: `https://download.open.fda.gov/drug/drugsfda/drug-drugsfda-0001-of-0001.json.zip`, one
 * public-domain bulk file of about 9 MB. No API, nothing to rate-limit.
 *
 * Usage:
 *   tsx scripts/background/build-regulatory-approval.ts <drug-drugsfda.json>
 */

interface Application {
  application_number?: string
  sponsor_name?: string
  products?: {
    active_ingredients?: { name?: string }[]
    marketing_status?: string
  }[]
  submissions?: {
    submission_type?: string
    submission_status?: string
    submission_status_date?: string
  }[]
}

interface Approval {
  applicationCount: number
  earliestDate?: string
  earliestApplication?: string
  earliestSponsor?: string
  kinds: Set<string>
  marketingStatuses: Set<string>
  sampleApplicationNumbers: string[]
}

const MAX_SAMPLE_APPLICATIONS = 8
const MAX_LIST_VALUES = 8

interface MedicineRow {
  slug: string
  name: string
}

function medicineRows(): MedicineRow[] {
  const dir = join(process.cwd(), 'data', 'drugs')
  const rows: MedicineRow[] = []
  for (const file of readdirSync(dir)
    .filter((name) => name.endsWith('.ndjson'))
    .sort()) {
    for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
      if (!line.trim()) continue
      const record = JSON.parse(line) as { id?: string; name?: string }
      if (record.id && record.name) rows.push({ slug: record.id, name: record.name })
    }
  }
  return rows
}

/** "ANDA076220" -> "ANDA". Anything else is left out rather than guessed at. */
function applicationKind(applicationNumber: string): string | undefined {
  const match = /^(NDA|ANDA|BLA)\d+$/u.exec(applicationNumber)
  return match?.[1]
}

function main(): void {
  const path = process.argv[2]
  if (!path) {
    console.error('usage: tsx scripts/background/build-regulatory-approval.ts <drug-drugsfda.json>')
    process.exit(1)
  }

  const rows = medicineRows()
  const wanted = new Map<string, string>()
  for (const row of rows) {
    for (const key of [normalizeContentName(row.name), normalizeIdentityName(row.name)]) {
      if (key.length >= 3 && !wanted.has(key)) wanted.set(key, row.slug)
    }
  }
  console.log(`[approvals] ${rows.length} medicine row(s) · ${wanted.size} name key(s) sought`)

  const payload = JSON.parse(readFileSync(path, 'utf8')) as { results: Application[] }
  const approvals = new Map<string, Approval>()
  const stats = { applications: payload.results.length, matched: 0, withApprovalDate: 0 }

  for (const application of payload.results) {
    const number = application.application_number
    if (!number) continue
    const kind = applicationKind(number)

    // The original approval, which is the date a reader means by "when was it approved". Later
    // supplements approve changes to an existing product rather than the product itself.
    let earliest: string | undefined
    for (const submission of application.submissions ?? []) {
      if (submission.submission_type !== 'ORIG') continue
      if (submission.submission_status !== 'AP') continue
      const date = submission.submission_status_date
      if (date && /^\d{8}$/u.test(date) && (!earliest || date < earliest)) earliest = date
    }

    const matched = new Set<string>()
    const statuses = new Set<string>()
    for (const product of application.products ?? []) {
      if (product.marketing_status) statuses.add(product.marketing_status)
      for (const ingredient of product.active_ingredients ?? []) {
        const name = ingredient.name
        if (!name) continue
        const slug =
          wanted.get(normalizeContentName(name)) ?? wanted.get(normalizeIdentityName(name))
        if (slug) matched.add(slug)
      }
    }
    if (matched.size === 0) continue
    stats.matched += 1
    if (earliest) stats.withApprovalDate += 1

    for (const slug of matched) {
      const held = approvals.get(slug) ?? {
        applicationCount: 0,
        kinds: new Set<string>(),
        marketingStatuses: new Set<string>(),
        sampleApplicationNumbers: [],
      }
      held.applicationCount += 1
      if (kind) held.kinds.add(kind)
      for (const status of statuses) held.marketingStatuses.add(status)
      if (earliest && (!held.earliestDate || earliest < held.earliestDate)) {
        held.earliestDate = earliest
        held.earliestApplication = number
        held.earliestSponsor = application.sponsor_name
      }
      if (held.sampleApplicationNumbers.length < MAX_SAMPLE_APPLICATIONS) {
        held.sampleApplicationNumbers.push(number)
      }
      approvals.set(slug, held)
    }
  }

  const retrievedAt = new Date().toISOString().slice(0, 10)
  const dataset: Record<string, MedicineRecordedBackground> = {}
  const written = { records: 0, withDate: 0, engineRejected: 0 }

  for (const [slug, approval] of approvals) {
    if (approval.sampleApplicationNumbers.length === 0) continue
    // A date and the application that carried it are recorded together or not at all: a date with
    // nothing to look up is an assertion about regulatory history.
    const hasBoth = Boolean(approval.earliestDate && approval.earliestApplication)
    const recorded: RecordedRegulatoryApproval = {
      applicationCount: approval.applicationCount,
      ...(hasBoth
        ? {
            earliestOriginalApprovalDate: approval.earliestDate!,
            earliestApplicationNumber: approval.earliestApplication!,
            ...(approval.earliestSponsor
              ? { earliestSponsorAsRecorded: approval.earliestSponsor }
              : {}),
          }
        : {}),
      applicationKindsAsRecorded: [...approval.kinds].sort(),
      marketingStatusesAsRecorded: [...approval.marketingStatuses].sort().slice(0, MAX_LIST_VALUES),
      sampleApplicationNumbers: approval.sampleApplicationNumbers,
      source: {
        kind: 'FDA_DRUGSFDA',
        identifier: approval.earliestApplication ?? approval.sampleApplicationNumbers[0]!,
        label: 'Drugs@FDA application register',
        retrievedAt,
      },
    }
    const background: MedicineRecordedBackground = {
      version: 'medicine-background/v1',
      authoredAt: retrievedAt,
      provenanceTier: 'transcribed',
      regulatoryApproval: recorded,
    }
    const report = runBackgroundIntelligence(background)
    if (!report.passed) {
      written.engineRejected += 1
      if (written.engineRejected <= 3) {
        console.error(
          `[approvals] rejected ${slug}: ${report.findings.map((f) => `${f.code} at ${f.path}`).join(', ')}`,
        )
      }
      continue
    }
    if (hasBoth) written.withDate += 1
    dataset[slug] = background
    written.records += 1
  }

  const outPath = join(process.cwd(), 'data', 'registries', 'regulatory-approval.json')
  writeFileSync(outPath, `${JSON.stringify(dataset, null, 1)}\n`)
  console.log(`[approvals] ${JSON.stringify({ ...stats, ...written })}`)
  console.log(`[approvals] wrote ${written.records} record(s) to ${outPath}`)
}

main()
