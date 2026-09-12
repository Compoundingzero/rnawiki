import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

import { Pool } from 'pg'

import { databaseSslConfig } from '@/db/ssl'
import type { MedicineRecordedBackground } from '@/lib/background/types'

/**
 * Move newly acquired background modules from one database to another, module by module.
 *
 * The acquisition passes — `fetch-dailymed-labels.ts` and `fetch-drugsfda-approvals.ts` — ran
 * against the working database. Production holds the same 9,859 medicines and an older envelope for
 * each, so the difference is a set of modules that exist in one and not the other. This moves that
 * difference and nothing else.
 *
 * The alternative was to re-run the acquisition against production, which would have made several
 * thousand requests to openFDA to arrive at values already fetched, parsed and checked. The
 * alternative after that was to restore the working database over production, which would have
 * carried across every unrelated difference between the two, including anything a reviewer had done
 * on the live site. Neither is what is wanted. What is wanted is exactly the acquired modules.
 *
 * Three rules, all of them the same rules the acquisition scripts themselves apply:
 *
 *   1. **A module that already exists in the target is never replaced.** Not with a newer value, not
 *      with a better one. If the target holds it, something put it there, and this pass is not
 *      entitled to decide it was wrong.
 *   2. **A record marked `curated` in the target is never touched at all.** A curated record was
 *      assembled by a person. An automated pass does not edit one.
 *   3. **Only the modules named on the command line move.** Everything else in the envelope stays as
 *      the target has it, including the envelope's own `authoredAt` and `provenanceTier`.
 *
 * It is idempotent: running it twice moves nothing the second time, because after the first run the
 * target holds the module and rule 1 applies.
 *
 *   npx tsx scripts/background/transfer-acquired-modules.ts --target "<url>" --dry-run
 *   npx tsx scripts/background/transfer-acquired-modules.ts --target "<url>"
 */

/** The modules the two acquisition passes write. Nothing outside this list is considered. */
const ACQUIRED_MODULES = [
  'mechanism',
  'recordedUses',
  'safety',
  'pharmacokinetics',
  'commonAdverseReactions',
  'interactionSignals',
  'attribution',
  'productVariants',
  'molecularIdentity',
  'populationStatements',
  'labelPresence',
  'regulatoryApproval',
] as const

interface Args {
  target: string
  dryRun: boolean
  modules: string[]
  out: string
}

function parseArgs(argv: readonly string[]): Args {
  const args: Args = {
    target: '',
    dryRun: false,
    modules: [...ACQUIRED_MODULES],
    out: 'data/background/module-transfer.json',
  }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    const next = argv[index + 1]
    if (flag === '--target' && next) ((args.target = next), (index += 1))
    else if (flag === '--dry-run') args.dryRun = true
    else if (flag === '--modules' && next) ((args.modules = next.split(',')), (index += 1))
    else if (flag === '--out' && next) ((args.out = next), (index += 1))
  }
  return args
}

type Envelope = MedicineRecordedBackground & Record<string, unknown>

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  if (!args.target) throw new Error('--target <connection string> is required')

  const sourceUrl = process.env.DATABASE_URL
  if (!sourceUrl) throw new Error('DATABASE_URL must name the database the acquisition ran against')

  const source = new Pool({ connectionString: sourceUrl, ssl: databaseSslConfig(sourceUrl) })
  const target = new Pool({ connectionString: args.target, ssl: databaseSslConfig(args.target) })

  try {
    const [sourceRows, targetRows] = await Promise.all([
      source.query<{ slug: string; recorded_background: Envelope | null }>(
        'select slug, recorded_background from drugs where recorded_background is not null',
      ),
      target.query<{ slug: string; recorded_background: Envelope | null }>(
        'select slug, recorded_background from drugs where recorded_background is not null',
      ),
    ])
    const targetBySlug = new Map(targetRows.rows.map((row) => [row.slug, row.recorded_background]))
    process.stdout.write(
      `source ${sourceRows.rows.length} envelopes · target ${targetRows.rows.length} envelopes\n`,
    )

    const moved = new Map<string, number>()
    const skippedCurated: string[] = []
    const missingInTarget: string[] = []
    const updates: Array<{ slug: string; envelope: Envelope; gained: string[] }> = []

    for (const row of sourceRows.rows) {
      const from = row.recorded_background
      if (!from) continue
      const to = targetBySlug.get(row.slug)
      if (to === undefined) {
        // A medicine the target does not have. Creating one here would be a corpus change, not a
        // module transfer, and it is reported rather than performed.
        missingInTarget.push(row.slug)
        continue
      }
      if (to?.provenanceTier === 'curated') {
        skippedCurated.push(row.slug)
        continue
      }

      const gained = args.modules.filter(
        (name) => from[name] !== undefined && (to === null || to[name] === undefined),
      )
      if (gained.length === 0) continue

      const merged = { ...(to ?? {}) } as Envelope
      for (const name of gained) {
        merged[name] = from[name]
        moved.set(name, (moved.get(name) ?? 0) + 1)
      }
      updates.push({ slug: row.slug, envelope: merged, gained })
    }

    process.stdout.write(
      `${updates.length} medicines gain at least one module · ${JSON.stringify(
        Object.fromEntries([...moved.entries()].sort((a, b) => b[1] - a[1])),
        null,
        2,
      )}\n`,
    )

    if (!args.dryRun) {
      const client = await target.connect()
      try {
        await client.query('begin')
        for (const update of updates) {
          await client.query('update drugs set recorded_background = $1 where slug = $2', [
            JSON.stringify(update.envelope),
            update.slug,
          ])
        }
        await client.query('commit')
      } catch (error) {
        await client.query('rollback')
        throw error
      } finally {
        client.release()
      }
      process.stdout.write(`committed ${updates.length} updates\n`)
    }

    const report = {
      dryRun: args.dryRun,
      sourceEnvelopes: sourceRows.rows.length,
      targetEnvelopes: targetRows.rows.length,
      medicinesUpdated: updates.length,
      modulesMoved: Object.fromEntries([...moved.entries()].sort((a, b) => b[1] - a[1])),
      skippedCuratedCount: skippedCurated.length,
      missingInTargetCount: missingInTarget.length,
      missingInTargetSample: missingInTarget.slice(0, 20),
      updatedSample: updates.slice(0, 20).map((update) => ({
        slug: update.slug,
        gained: update.gained,
      })),
    }
    const outPath = resolve(args.out)
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`)
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
  } finally {
    await Promise.all([source.end(), target.end()])
  }
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
