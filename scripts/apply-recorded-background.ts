import 'dotenv/config'
import { eq } from 'drizzle-orm'

import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import { engineFindingId, engineInputDigest, engineRunId } from '@/lib/engine-run-persistence'
import { ALL_RECORDED_BACKGROUND } from './seed-data/background'

/** Which generated corpus these envelopes came from, so a run is traceable to a release. */
const CORPUS_VERSION = 'openfda-2026-08-28'

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
  const runs: Array<{
    slug: string
    report: ReturnType<typeof runBackgroundIntelligence>
    digest: string
  }> = []
  const findingsByRule = new Map<string, number>()

  for (const [slug, background] of entries) {
    const report = runBackgroundIntelligence(background)
    runs.push({ slug, report, digest: engineInputDigest(background) })
    for (const finding of report.findings) {
      findingsByRule.set(finding.code, (findingsByRule.get(finding.code) ?? 0) + 1)
    }
    if (!report.passed) {
      failures += 1
      console.error(`[background] ${slug}: ${report.findings.length} finding(s)`)
      for (const finding of report.findings) {
        console.error(`  ${finding.code} at ${finding.path}: ${finding.message}`)
      }
    }
  }

  /*
   * A zero-record run is a failure, not a success.
   *
   * The label indexer once reported "wrote 0 labels, skipped 0" and exited 0, and the pipeline
   * treated that refusal as an answer. The same shape of mistake here would silently apply nothing
   * during a deploy and report it as done.
   */
  if (entries.length === 0) {
    console.error('[background] no envelopes to validate. Refusing to report success.')
    process.exit(1)
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

  const [{ db }, { drugs, engineValidationRuns, engineFindings }] = await Promise.all([
    import('@/db'),
    import('@/db/schema'),
  ])
  let applied = 0
  const results_applied: string[] = []
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
        results_applied.push(result.slug)
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
  /*
   * Persist the run for every record, passing or failing.
   *
   * Written after the medicine writes so `appliedAt` is truthful, and keyed by a digest of exactly
   * what the engine read, so re-applying an unchanged corpus inserts nothing while a changed
   * envelope or a new engine version creates a new historical run.
   */
  const appliedSlugs = new Set(results_applied)
  let runsPersisted = 0
  let findingsPersisted = 0
  const RUN_CHUNK = 200
  for (let start = 0; start < runs.length; start += RUN_CHUNK) {
    const chunk = runs.slice(start, start + RUN_CHUNK)
    const runRows = chunk.map(({ slug, report, digest }) => {
      const id = engineRunId({
        subjectType: 'medicine',
        subjectId: slug,
        engineFamily: 'background',
        engineVersion: report.engineVersion,
        inputDigest: digest,
      })
      return {
        id,
        subjectType: 'medicine' as const,
        subjectId: slug,
        engineFamily: 'background' as const,
        engineVersion: report.engineVersion,
        inputDigest: digest,
        corpusVersion: CORPUS_VERSION,
        status: report.passed ? ('PASSED' as const) : ('FAILED' as const),
        passed: report.passed,
        findingCount: report.findings.length,
        operation: 'apply:background',
        ...(appliedSlugs.has(slug) ? { appliedAt: new Date() } : {}),
      }
    })
    const inserted = await db
      .insert(engineValidationRuns)
      .values(runRows)
      .onConflictDoNothing()
      .returning({ id: engineValidationRuns.id })
    runsPersisted += inserted.length

    const findingRows = chunk.flatMap(({ slug, report, digest }) => {
      const runId = engineRunId({
        subjectType: 'medicine',
        subjectId: slug,
        engineFamily: 'background',
        engineVersion: report.engineVersion,
        inputDigest: digest,
      })
      return report.findings.map((finding, index) => ({
        id: engineFindingId(runId, index, {
          ruleCode: finding.code,
          level: 'BLOCK',
          fieldPath: finding.path,
          message: finding.message,
          publicationEffect: 'BLOCKED_WRITE',
        }),
        runId,
        engineFamily: 'background' as const,
        engineVersion: report.engineVersion,
        inputDigest: digest,
        subjectType: 'medicine' as const,
        subjectId: slug,
        ruleCode: finding.code,
        level: 'BLOCK',
        fieldPath: finding.path,
        message: finding.message,
        publicationEffect: 'BLOCKED_WRITE',
        corpusVersion: CORPUS_VERSION,
      }))
    })
    if (findingRows.length > 0) {
      const insertedFindings = await db
        .insert(engineFindings)
        .values(findingRows)
        .onConflictDoNothing()
        .returning({ id: engineFindings.id })
      findingsPersisted += insertedFindings.length
    }
  }

  console.log(`[background] applied ${applied} envelope(s) · ${missing} slug(s) had no row`)
  console.log(
    `[background] examined ${entries.length} · runs persisted ${runsPersisted} (new) · findings persisted ${findingsPersisted} · engine ${runs[0]?.report.engineVersion ?? 'unknown'} · corpus ${CORPUS_VERSION}`,
  )
  if (findingsByRule.size > 0) {
    console.log(
      `[background] findings by rule: ${[...findingsByRule.entries()]
        .sort()
        .map(([code, count]) => `${code}=${count}`)
        .join(', ')}`,
    )
  }
  if (applied === 0) {
    console.error('[background] applied 0 envelopes. Refusing to report success.')
    process.exit(1)
  }
  process.exit(0)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
