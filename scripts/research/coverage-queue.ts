/**
 * Read-only research queue. From the repository root:
 *   node --import tsx scripts/research/coverage-queue.ts --limit 25
 *   node --import tsx scripts/research/coverage-queue.ts --slug metformin
 *
 * Writes JSON to stdout only. It does not fetch, update a record, or select a medical verdict.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { ALL_RECORDED_BACKGROUND } from '../seed-data/background/index'
import {
  buildCoverageReport,
  type InventoryPage,
  type Lane,
  type SourceCoverage,
} from './coverage-core'

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), 'utf8')) as T
}

const LANES: Lane[] = [
  'identity_review',
  'product_label_safety_review',
  'human_result_scope_review',
  'background_acquisition',
  'thin_record_review',
  'baseline_claim_review',
]

function options(argv: string[]): { limit: number; slug?: string; laneFilter?: Lane } {
  let limit = 25
  let slug: string | undefined
  let laneFilter: Lane | undefined
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    const value = argv[index + 1]
    if (flag === '--help') {
      process.stdout.write(
        'Usage: node --import tsx scripts/research/coverage-queue.ts [--limit 0..200] [--slug exact-slug] [--lane lane-name]\n',
      )
      process.exit(0)
    }
    if (flag === '--limit' && value) {
      limit = Number(value)
      index += 1
    } else if (flag === '--slug' && value) {
      slug = value
      index += 1
    } else if (flag === '--lane' && value && LANES.includes(value as Lane)) {
      laneFilter = value as Lane
      index += 1
    } else throw new Error(`Unknown or incomplete option: ${flag}`)
  }
  if (!Number.isInteger(limit) || limit < 0 || limit > 200)
    throw new Error('--limit must be an integer from 0 to 200')
  return { limit, ...(slug ? { slug } : {}), ...(laneFilter ? { laneFilter } : {}) }
}

const { limit, slug, laneFilter } = options(process.argv.slice(2))
const inventory = readJson<{ total: number; pages: InventoryPage[] }>(
  'data/dossier-v4/corpus-inventory.json',
)
if (inventory.pages.length !== inventory.total)
  throw new Error('Inventory total does not match rows')
const tierCsv = readFileSync(resolve(process.cwd(), 'data/revamp/identity/page-slugs.csv'), 'utf8')
const sourceCoverage = readJson<SourceCoverage>('data/sources/openfda-label/coverage.json')
const report = buildCoverageReport({
  pages: inventory.pages,
  backgrounds: ALL_RECORDED_BACKGROUND,
  tierCsv,
  sourceCoverage,
  limit,
  ...(slug ? { slug } : {}),
  ...(laneFilter ? { laneFilter } : {}),
})
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
