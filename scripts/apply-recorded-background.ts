import 'dotenv/config'
import { eq } from 'drizzle-orm'

import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import { ALL_RECORDED_BACKGROUND } from './seed-data/background'

/**
 * Validates every recorded-background envelope with the deterministic background engine, then —
 * unless run with `--check` — writes each envelope onto its medicine row.
 *
 * The write touches only the `recorded_background` column, keyed by slug. Curated narrative
 * fields, reviewed programme publications, and ingested identity are never read or written, so
 * re-running is always safe. A slug with no matching medicine row is reported and skipped; it is
 * never created here.
 */
async function main() {
  const checkOnly = process.argv.includes('--check')
  const entries = Object.entries(ALL_RECORDED_BACKGROUND)
  let failures = 0

  for (const [slug, background] of entries) {
    const report = runBackgroundIntelligence(background)
    if (!report.passed) {
      failures += 1
      console.error(`[background] ${slug}: ${report.findings.length} finding(s)`)
      for (const finding of report.findings) {
        console.error(`  ${finding.code} at ${finding.path}: ${finding.message}`)
      }
    }
  }

  console.log(
    `[background] validated ${entries.length} envelope(s) with ${runBackgroundIntelligence({ version: 'medicine-background/v1', authoredAt: '2026-01-01' }).engineVersion} · ${failures} failed`,
  )
  if (failures > 0) {
    process.exit(1)
  }
  if (checkOnly) {
    return
  }

  const [{ db }, { drugs }] = await Promise.all([import('@/db'), import('@/db/schema')])
  let applied = 0
  let missing = 0
  const missingSlugs: string[] = []

  // Written in concurrent chunks rather than one statement at a time. This runs inside Railway's
  // pre-deploy step, where thousands of sequential round-trips would hold the deploy open long
  // enough to look like a hang. Each write is still its own statement keyed by slug, so a slug
  // with no row is reported exactly as before.
  const CHUNK_SIZE = 50
  for (let start = 0; start < entries.length; start += CHUNK_SIZE) {
    const chunk = entries.slice(start, start + CHUNK_SIZE)
    const results = await Promise.all(
      chunk.map(async ([slug, background]) => {
        const rows = await db
          .update(drugs)
          .set({ recordedBackground: background })
          .where(eq(drugs.slug, slug))
          .returning({ slug: drugs.slug })
        return { slug, found: rows.length > 0 }
      }),
    )
    for (const result of results) {
      if (result.found) {
        applied += 1
      } else {
        missing += 1
        missingSlugs.push(result.slug)
      }
    }
  }

  // Reported as a count plus a bounded sample: one warning per slug would bury the deploy log.
  if (missing > 0) {
    console.warn(
      `[background] ${missing} slug(s) had no medicine row, e.g. ${missingSlugs.slice(0, 10).join(', ')}`,
    )
  }
  console.log(`[background] applied ${applied} envelope(s) · ${missing} slug(s) had no row`)
  process.exit(0)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
