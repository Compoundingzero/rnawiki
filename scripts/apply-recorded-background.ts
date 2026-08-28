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
  for (const [slug, background] of entries) {
    const rows = await db
      .update(drugs)
      .set({ recordedBackground: background })
      .where(eq(drugs.slug, slug))
      .returning({ slug: drugs.slug })
    if (rows.length === 0) {
      missing += 1
      console.warn(`[background] no medicine row for slug "${slug}" — skipped`)
    } else {
      applied += 1
    }
  }
  console.log(`[background] applied ${applied} envelope(s) · ${missing} slug(s) had no row`)
  process.exit(0)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
