import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { drugs } from '@/db/schema'
import { loadDossierV4Inputs } from '@/lib/dossier-v4/load'
import { buildDossierV4 } from '@/lib/dossier-v4/view-model'

/**
 * Walk every medicine's view model and refuse the ways a stored value reaches a reader unrendered.
 *
 * Written because a twenty-page sample found `[object Object]` on seven of the most-read medicines
 * on the site — aspirin, ibuprofen, metformin, caffeine, lovastatin, semaglutide, inclisiran — under
 * the heading "How fast the body clears it". A sample that happened to miss those seven would have
 * reported the page clean, and the release would have shipped it.
 *
 * So this does not sample. It builds all 9,859 models and looks at every string in each one. That is
 * affordable because building a model touches the database and not the renderer, and it is the only
 * way to be able to say the corpus is clean rather than that the pages checked were.
 *
 * The patterns are the ways a value fails silently rather than loudly: an object stringified, a
 * missing value printed as the word, a failed arithmetic, a template that was never filled, a raw
 * enum, and an identifier where a name belongs. Each one has shipped somewhere once.
 *
 *   npx tsx scripts/check/scan-reader-text.ts
 */

/** Each pattern, with what it means when it matches — the message is the finding. */
const FORBIDDEN: ReadonlyArray<{ pattern: RegExp; why: string }> = [
  { pattern: /\[object [A-Z]/u, why: 'an object rendered instead of its text' },
  { pattern: /\bundefined\b/u, why: 'a missing value rendered as the word "undefined"' },

  { pattern: /\bNaN\b/u, why: 'a failed calculation rendered as a number' },
  { pattern: /\$\{/u, why: 'a template placeholder that was never filled' },
  { pattern: /\bUnnamed counterpart\b/u, why: 'a placeholder name reaching a reader' },
  {
    pattern:
      /\b(?:no_qualifying_evidence|source_checked_draft|not_applicable|feature_not_enabled|awaiting_review|pipeline_failure|reviewed_content)\b/u,
    why: 'a raw section-state code',
  },
  {
    pattern:
      /\b(?:reviewed_claim|approved_first_read|authored_record|stored_source|derived_count|contract_sentence|community_reviewed)\b/u,
    why: 'a raw statement-origin code',
  },
  { pattern: /\b(?:US_FDA|EU_EMA|UK_MHRA)\b/u, why: 'a raw jurisdiction code' },
  {
    pattern:
      /\b(?:FDA_LABEL|FDA_UNII|FDA_NDC|FDA_DRUGSFDA|NCBI_TAXONOMY|DAILYMED|DSLD|PUBCHEM|RXNORM|CLINICALTRIALS|EMA_SMPC)\b/u,
    why: 'a raw source-kind code',
  },
  {
    pattern:
      /\b(?:PREGNANCY|LACTATION|PAEDIATRIC|GERIATRIC|RENAL_IMPAIRMENT|HEPATIC_IMPAIRMENT)\b/u,
    why: 'a raw population code',
  },
  { pattern: /\bTRIAL_PROTOCOL\b|\bLABEL_SCHEDULE\b/u, why: 'a raw titration-basis code' },
  { pattern: /\b(?:SCIENTIFIC_NAME|COMMON_NAME)\b/u, why: 'a raw name-match code' },
]

/**
 * Where a raw identifier is allowed, and where it is not.
 *
 * The technical record at the foot of a page is explicitly the place record ids, digests and raw
 * vocabulary may appear — the project's copy rules say so. The fields walked here are the reader
 * layer above it, so anything found is in the wrong place by definition.
 */
const READER_FIELDS = [
  'pagePromise',
  'hero',
  'sections',
  'fingerprint',
  'humanResults',
  'staircase',
  'journey',
  'experience',
  'timeline',
  'applicability',
  'noResponse',
  'practical',
  'safety',
  'stack',
  'formCheck',
  'measurement',
  'alternatives',
  'claimDecoder',
  'unknowns',
  'story',
  'changes',
  'nextQuestions',
  'recordedIdentity',
  'concepts',
  'identity',
  'publication',
  'searchedRegisters',
] as const

interface Finding {
  slug: string
  path: string
  why: string
  text: string
}

function walk(value: unknown, path: string, into: Finding[], slug: string): void {
  if (typeof value === 'string') {
    for (const { pattern, why } of FORBIDDEN) {
      if (pattern.test(value)) {
        into.push({ slug, path, why, text: value.slice(0, 160) })
        return
      }
    }
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${path}[${index}]`, into, slug))
    return
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      /*
       * Fields that hold a code by design rather than reader text.
       *
       * `state` and `origin` are enums the page renders through `sectionStateLabel` and
       * `ORIGIN_SHORT`; walking them reported 950,846 findings on the first run, all of them the
       * model doing exactly what it should. A citation carries an identifier for the same reason —
       * it is the label beside it that has to be a name.
       */
      if (['id', 'sources', 'citation', 'state', 'origin', 'code', 'facet'].includes(key)) continue
      walk(item, `${path}.${key}`, into, slug)
    }
  }
}

async function main(): Promise<void> {
  const rows = await db
    .select({ slug: drugs.slug })
    .from(drugs)
    .orderBy(sql`md5(${drugs.slug})`)
  process.stdout.write(`scanning ${rows.length} medicines\n`)

  const findings: Finding[] = []
  let scanned = 0
  let cursor = 0

  const worker = async (): Promise<void> => {
    for (;;) {
      const row = rows[cursor]
      if (!row) return
      cursor += 1
      const inputs = await loadDossierV4Inputs(row.slug)
      if (!inputs) continue
      const model = buildDossierV4(inputs) as unknown as Record<string, unknown>
      scanned += 1
      if (scanned % 1000 === 0) process.stdout.write(`${scanned}/${rows.length}\n`)
      for (const field of READER_FIELDS) {
        walk(model[field], field, findings, row.slug)
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, worker))

  const byWhy = new Map<string, Finding[]>()
  for (const finding of findings) {
    byWhy.set(finding.why, [...(byWhy.get(finding.why) ?? []), finding])
  }

  const summary = {
    scanned,
    findings: findings.length,
    medicinesAffected: new Set(findings.map((finding) => finding.slug)).size,
    byReason: Object.fromEntries(
      [...byWhy.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .map(([why, list]) => [
          why,
          {
            count: list.length,
            medicines: new Set(list.map((finding) => finding.slug)).size,
            example: `${list[0]?.slug} · ${list[0]?.path} · ${list[0]?.text}`,
          },
        ]),
    ),
  }

  const outPath = resolve('data/dossier-v4/reader-text-scan.json')
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(
    outPath,
    `${JSON.stringify({ summary, findings: findings.slice(0, 500) }, null, 2)}\n`,
  )
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
  if (findings.length > 0) process.exitCode = 1
}

void main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await closeDatabasePool()
  })
