import 'dotenv/config'

import { inArray, sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { drugs } from '@/db/schema'
import {
  applyExactReleaseA1Repair,
  RELEASE_A1_SELF_CERTIFICATION_REPAIRS,
  type ReleaseA1RepairableColumn,
} from '@/lib/release-a1-self-certification-repairs'

const EDITOR_LABEL = 'RNAWiki Release A.1 exact editorial repair'

type RepairRow = Pick<
  typeof drugs.$inferSelect,
  | 'id'
  | 'slug'
  | 'conditionContext'
  | 'substitutes'
  | 'keyAudits'
  | 'measuredVsInferredSummary'
  | 'commonQuestions'
>

function cloneColumn(value: unknown): unknown {
  return value === null || value === undefined ? value : structuredClone(value)
}

function columnValue(row: RepairRow, column: ReleaseA1RepairableColumn): unknown {
  return row[column]
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')
  const unexpected = process.argv.slice(2).filter((argument) => argument !== '--apply')
  if (unexpected.length > 0) {
    throw new Error(`Unknown argument(s): ${unexpected.join(', ')}`)
  }

  const slugs = [...new Set(RELEASE_A1_SELF_CERTIFICATION_REPAIRS.map((repair) => repair.slug))]
  const summary = await db.transaction(async (tx) => {
    const rows = await tx
      .select({
        id: drugs.id,
        slug: drugs.slug,
        conditionContext: drugs.conditionContext,
        substitutes: drugs.substitutes,
        keyAudits: drugs.keyAudits,
        measuredVsInferredSummary: drugs.measuredVsInferredSummary,
        commonQuestions: drugs.commonQuestions,
      })
      .from(drugs)
      .where(inArray(drugs.slug, slugs))
      .for('update')

    const bySlug = new Map(rows.map((row) => [row.slug, row]))
    const missing = slugs.filter((slug) => !bySlug.has(slug))
    if (missing.length > 0) {
      throw new Error(`Release A.1 repair medicines are missing: ${missing.join(', ')}`)
    }

    let appliedFragments = 0
    let alreadyAppliedFragments = 0
    let updatedMedicines = 0

    for (const slug of slugs) {
      const row = bySlug.get(slug)
      if (!row) throw new Error(`Release A.1 repair medicine disappeared: ${slug}`)
      const next: RepairRow = {
        ...row,
        conditionContext: cloneColumn(row.conditionContext) as RepairRow['conditionContext'],
        substitutes: cloneColumn(row.substitutes) as RepairRow['substitutes'],
        keyAudits: cloneColumn(row.keyAudits) as RepairRow['keyAudits'],
        measuredVsInferredSummary: cloneColumn(
          row.measuredVsInferredSummary,
        ) as RepairRow['measuredVsInferredSummary'],
        commonQuestions: cloneColumn(row.commonQuestions) as RepairRow['commonQuestions'],
      }
      let changed = false
      for (const repair of RELEASE_A1_SELF_CERTIFICATION_REPAIRS.filter(
        (candidate) => candidate.slug === slug,
      )) {
        const state = applyExactReleaseA1Repair(columnValue(next, repair.column), repair)
        if (state === 'applied') {
          appliedFragments += 1
          changed = true
        } else {
          alreadyAppliedFragments += 1
        }
      }

      if (!changed || !apply) continue
      const editedAt = new Date()
      await tx
        .update(drugs)
        .set({
          conditionContext: next.conditionContext,
          substitutes: next.substitutes,
          keyAudits: next.keyAudits,
          measuredVsInferredSummary: next.measuredVsInferredSummary,
          commonQuestions: next.commonQuestions,
          revisionCount: sql`${drugs.revisionCount} + 1`,
          lastEditedAt: editedAt,
          lastEditedBy: EDITOR_LABEL,
          updatedAt: editedAt,
        })
        .where(inArray(drugs.id, [row.id]))
      updatedMedicines += 1
    }

    return { appliedFragments, alreadyAppliedFragments, updatedMedicines }
  })

  console.log(
    `[release-a1.copy-repair] mode=${apply ? 'apply' : 'check'} ` +
      `repairs=${RELEASE_A1_SELF_CERTIFICATION_REPAIRS.length} ` +
      `wouldApply=${summary.appliedFragments} alreadyApplied=${summary.alreadyAppliedFragments} ` +
      `medicinesUpdated=${summary.updatedMedicines}`,
  )
}

void main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await closeDatabasePool()
  })
