/**
 * Dossier v3 backfill — classify the role a substance had in every registered study the corpus
 * matched it to, and store the role-aware registry aggregate (lib/dossier-v3/trial-roles.ts).
 *
 *   npx tsx scripts/dossier-v3/backfill-trial-roles.ts --dry-run
 *   npx tsx scripts/dossier-v3/backfill-trial-roles.ts --slugs semaglutide,metformin,inclisiran,creatine-monohydrate
 *   npx tsx scripts/dossier-v3/backfill-trial-roles.ts --all --batch-size 500
 *
 * Inputs: `page_registry_studies` (the corpus's own matches, with how each name matched) and the
 * ClinicalTrials.gov snapshot the corpus was matched against (`--snapshot`, default
 * ../rnawiki-ingest-data/clinicaltrials/20260901T090005). Outputs: `page_trial_roles` (one row per
 * page × study), `page_registry_role_aggregates` (one row per page), and — for pages whose stored
 * registered-study question still carries the old "largest trial / longest" wording — a rewritten
 * `page_questions` heading, recorded first in `entity_corrections`.
 *
 * Resumable: a page whose aggregate row already carries this classifier version and snapshot date
 * is skipped unless `--force`. Observable: a summary line per batch and a JSON summary at the end.
 * Deterministic: the same inputs produce the same rows; nothing here reads a result or writes prose
 * about a medicine beyond the fixed question template.
 */
import 'dotenv/config'
import { createHash } from 'node:crypto'
import { createReadStream, existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { createInterface } from 'node:readline'

import { and, eq, inArray, sql } from 'drizzle-orm'

import { db } from '@/db'
import {
  corpusPages,
  entityCorrections,
  pageQuestions,
  pageRegistryRoleAggregates,
  pageRegistryStudies,
  pageTrialRoles,
} from '@/db/schema'
import {
  classifyTrialRole,
  registryStudyForRoles,
  roleAwareRegistryAggregate,
  TRIAL_ROLE_CLASSIFIER_VERSION,
  type LegacyMatchKind,
  type RegistryStudyForRoles,
} from '@/lib/dossier-v3/trial-roles'
import { formatDuration } from '@/scripts/corpus-20k/questions/derive'

interface Args {
  dryRun: boolean
  all: boolean
  slugs: string[]
  batchSize: number
  force: boolean
  snapshot: string
  operator: string
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    dryRun: false,
    all: false,
    slugs: [],
    batchSize: 250,
    force: false,
    snapshot: resolve(
      process.cwd(),
      '..',
      'rnawiki-ingest-data',
      'clinicaltrials',
      '20260901T090005',
    ),
    operator: process.env.USER ? `operator:${process.env.USER}` : 'operator:backfill-trial-roles',
  }
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i]
    const next = argv[i + 1]
    if (flag === '--dry-run') args.dryRun = true
    else if (flag === '--all') args.all = true
    else if (flag === '--force') args.force = true
    else if (flag === '--slugs' && next) {
      args.slugs = next
        .split(',')
        .map((slug) => slug.trim())
        .filter(Boolean)
      i += 1
    } else if (flag === '--batch-size' && next) {
      args.batchSize = Math.max(1, Number(next))
      i += 1
    } else if (flag === '--snapshot' && next) {
      args.snapshot = resolve(next)
      i += 1
    }
  }
  if (!args.all && args.slugs.length === 0) args.dryRun = true
  return args
}

function sha256(...parts: string[]): string {
  return createHash('sha256').update(parts.join('|')).digest('hex')
}

/** Read only the studies the pages need, in one streaming pass over the snapshot. */
async function loadStudies(
  snapshotDir: string,
  wanted: ReadonlySet<string>,
): Promise<Map<string, RegistryStudyForRoles>> {
  const file = join(snapshotDir, 'studies.ndjson')
  if (!existsSync(file)) throw new Error(`snapshot not found: ${file}`)
  const found = new Map<string, RegistryStudyForRoles>()
  const reader = createInterface({ input: createReadStream(file, 'utf8'), crlfDelay: Infinity })
  for await (const line of reader) {
    if (!line) continue
    const at = line.indexOf('"nctId"')
    if (at < 0) continue
    const nct = /"nctId"\s*:\s*"(NCT\d{8})"/.exec(line.slice(at, at + 40))?.[1]
    if (!nct || !wanted.has(nct)) continue
    const parsed = registryStudyForRoles(JSON.parse(line))
    if (parsed) found.set(parsed.nctId, parsed)
    if (found.size === wanted.size) break
  }
  return found
}

function snapshotDate(snapshotDir: string): string {
  const manifest = join(snapshotDir, 'manifest.json')
  if (existsSync(manifest)) {
    const parsed = JSON.parse(readFileSync(manifest, 'utf8')) as { dataTimestamp?: string }
    const stamp = parsed.dataTimestamp?.slice(0, 10)
    if (stamp && /^\d{4}-\d{2}-\d{2}$/.test(stamp)) return stamp
  }
  const fromName = /(\d{4})(\d{2})(\d{2})T/.exec(snapshotDir)
  if (fromName) return `${fromName[1]}-${fromName[2]}-${fromName[3]}`
  throw new Error('cannot determine the snapshot date')
}

const OLD_HEADING = /largest trial \(\d+ people\) and its longest \(/

function testedHeading(name: string, testedStudies: number, matched: number): string {
  if (testedStudies === 0) {
    return `${name} was not the tested treatment in any of its ${matched} registered ${matched === 1 ? 'study' : 'studies'} — what were they?`
  }
  return `${name} was the tested treatment in ${testedStudies} registered ${testedStudies === 1 ? 'study' : 'studies'} — what did the largest measure?`
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const date = snapshotDate(args.snapshot)
  const pages = args.all
    ? await db
        .select({ key: corpusPages.key, slug: corpusPages.slug, name: corpusPages.displayName })
        .from(corpusPages)
    : await db
        .select({ key: corpusPages.key, slug: corpusPages.slug, name: corpusPages.displayName })
        .from(corpusPages)
        .where(inArray(corpusPages.slug, args.slugs.length > 0 ? args.slugs : ['__none__']))
  if (pages.length === 0) {
    console.log(JSON.stringify({ pages: 0, note: 'no page selected; pass --slugs or --all' }))
    return
  }

  const done = new Set<string>()
  if (!args.force) {
    const rows = await db
      .select({ key: pageRegistryRoleAggregates.key })
      .from(pageRegistryRoleAggregates)
      .where(
        and(
          eq(pageRegistryRoleAggregates.classifierVersion, TRIAL_ROLE_CLASSIFIER_VERSION),
          eq(pageRegistryRoleAggregates.snapshotDate, date),
        ),
      )
    for (const row of rows) done.add(row.key)
  }
  const todo = pages.filter((page) => !done.has(page.key))
  console.log(
    JSON.stringify({
      selected: pages.length,
      alreadyDone: pages.length - todo.length,
      todo: todo.length,
      snapshotDate: date,
      dryRun: args.dryRun,
    }),
  )

  const summary = {
    pagesWritten: 0,
    rolesWritten: 0,
    headingsRewritten: 0,
    studiesMissingFromSnapshot: 0,
    byRole: {} as Record<string, number>,
  }

  for (let start = 0; start < todo.length; start += args.batchSize) {
    const batch = todo.slice(start, start + args.batchSize)
    const keys = batch.map((page) => page.key)
    const matches = await db
      .select({
        key: pageRegistryStudies.key,
        nct: pageRegistryStudies.nct,
        role: pageRegistryStudies.role,
        matchedName: pageRegistryStudies.matchedName,
      })
      .from(pageRegistryStudies)
      .where(inArray(pageRegistryStudies.key, keys))
    const wanted = new Set(matches.map((row) => row.nct))
    const studies = wanted.size > 0 ? await loadStudies(args.snapshot, wanted) : new Map()
    const byKey = new Map<string, typeof matches>()
    for (const row of matches) {
      const list = byKey.get(row.key) ?? []
      list.push(row)
      byKey.set(row.key, list)
    }

    for (const page of batch) {
      const rows = byKey.get(page.key) ?? []
      const entries: Array<{
        study: RegistryStudyForRoles
        assignment: ReturnType<typeof classifyTrialRole>
      }> = []
      for (const row of rows) {
        const study = studies.get(row.nct)
        if (!study) {
          summary.studiesMissingFromSnapshot += 1
          continue
        }
        const assignment = classifyTrialRole(
          study,
          row.matchedName ? [row.matchedName] : [page.name],
          (['intervention', 'otherName', 'stored'].includes(row.role)
            ? row.role
            : 'stored') as LegacyMatchKind,
          date,
        )
        entries.push({ study, assignment })
      }
      const aggregate = roleAwareRegistryAggregate(entries, date)
      for (const [role, count] of Object.entries(aggregate.byRole)) {
        summary.byRole[role] = (summary.byRole[role] ?? 0) + (count ?? 0)
      }
      summary.pagesWritten += 1
      summary.rolesWritten += entries.length

      const questionRows = await db
        .select({
          ordinal: pageQuestions.ordinal,
          text: pageQuestions.text,
          values: pageQuestions.values,
        })
        .from(pageQuestions)
        .where(and(eq(pageQuestions.key, page.key), eq(pageQuestions.block, 'human-data')))
      const heading = questionRows.find((row) => OLD_HEADING.test(row.text))

      if (args.dryRun) {
        console.log(
          JSON.stringify({
            slug: page.slug,
            matched: aggregate.matchedStudies,
            byRole: aggregate.byRole,
            testedLargest: aggregate.tested.largest,
            testedLongest: aggregate.tested.longestCompletedWindow,
            plannedIgnored: aggregate.plannedCompletionIgnored,
            headingWouldChange: heading
              ? testedHeading(page.name, aggregate.tested.studies, aggregate.matchedStudies)
              : null,
          }),
        )
        continue
      }

      await db.transaction(async (tx) => {
        await tx.delete(pageTrialRoles).where(eq(pageTrialRoles.key, page.key))
        if (entries.length > 0) {
          await tx.insert(pageTrialRoles).values(
            entries.map(({ assignment }) => ({
              key: page.key,
              nct: assignment.nctId,
              role: assignment.role,
              basis: assignment.basis,
              administered: assignment.administered,
              supportsTestedClaim: assignment.supportsTestedClaim,
              synonymMatched: assignment.synonymMatched,
              excludedFromSizeStatistics: assignment.excludedFromSizeStatistics,
              completionIsPlanned: assignment.completionIsPlanned,
              classifierVersion: assignment.classifierVersion,
              snapshotDate: date,
            })),
          )
        }
        await tx
          .insert(pageRegistryRoleAggregates)
          .values({
            key: page.key,
            aggregate: aggregate as unknown as Record<string, unknown>,
            classifierVersion: TRIAL_ROLE_CLASSIFIER_VERSION,
            snapshotDate: date,
          })
          .onConflictDoUpdate({
            target: pageRegistryRoleAggregates.key,
            set: {
              aggregate: aggregate as unknown as Record<string, unknown>,
              classifierVersion: TRIAL_ROLE_CLASSIFIER_VERSION,
              snapshotDate: date,
              computedAt: sql`now()`,
            },
          })

        if (heading) {
          const newText = testedHeading(
            page.name,
            aggregate.tested.studies,
            aggregate.matchedStudies,
          )
          const correctionId = sha256(
            'page_questions',
            page.key,
            String(heading.ordinal),
            heading.text,
            newText,
          )
          const existing = await tx
            .select({ id: entityCorrections.id })
            .from(entityCorrections)
            .where(eq(entityCorrections.id, correctionId))
          if (existing.length === 0) {
            await tx.insert(entityCorrections).values({
              id: correctionId,
              subjectKind: 'page',
              subjectKey: page.key,
              subjectRef: `page_questions:${heading.ordinal}`,
              action: 'relabel',
              before: { text: heading.text, values: heading.values },
              after: {
                text: newText,
                values: {
                  N: aggregate.tested.largest ? String(aggregate.tested.largest.enrollment) : '',
                  duration: formatDuration(aggregate.tested.longestCompletedWindow?.days) ?? '',
                },
              },
              reason:
                'The registered-study heading counted every matched study whatever the substance was in it and measured the longest to a planned end date. It now counts studies in which the substance was the tested treatment, from the role-aware aggregate.',
              evidence: [
                {
                  source: 'page_registry_role_aggregates',
                  key: page.key,
                  classifier: TRIAL_ROLE_CLASSIFIER_VERSION,
                  snapshotDate: date,
                },
                {
                  source: 'docs/rnawiki-biohacker-rebuild-audit.md',
                  finding: 'largest/longest trial counts mention-only and planned windows',
                },
              ],
              operator: args.operator,
              ruleOrClassifierVersion: TRIAL_ROLE_CLASSIFIER_VERSION,
            })
          }
          await tx
            .update(pageQuestions)
            .set({
              text: newText,
              values: {
                ...(heading.values as Record<string, unknown>),
                N: aggregate.tested.largest ? String(aggregate.tested.largest.enrollment) : '',
                duration: formatDuration(aggregate.tested.longestCompletedWindow?.days) ?? '',
              },
            })
            .where(and(eq(pageQuestions.key, page.key), eq(pageQuestions.ordinal, heading.ordinal)))
          summary.headingsRewritten += 1
        }
      })
    }
    console.log(
      JSON.stringify({ batchDone: Math.min(start + args.batchSize, todo.length), of: todo.length }),
    )
  }
  console.log(
    JSON.stringify({ summary, classifier: TRIAL_ROLE_CLASSIFIER_VERSION, snapshotDate: date }),
  )
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.stack : String(error))
    process.exit(1)
  })
