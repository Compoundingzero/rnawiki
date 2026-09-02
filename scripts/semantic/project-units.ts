import 'dotenv/config'
import { createHash } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { evidenceReadingUnits } from '@/db/schema'
import type { MedicineRecordedBackground } from '@/lib/background/types'
import type { SectionAssessment } from '@/lib/dossier-completion/types'
import { DOSSIER_SECTION_IDS, type DossierSectionId } from '@/lib/dossier-completion/types'
import {
  SEMANTIC_PROJECTOR_VERSION,
  UNIT_ASSERTIONS,
  UNIT_KINDS,
  projectEvidenceUnits,
  projectionInputDigest,
  type EvidenceReadingUnit,
  type ProjectorSearchInput,
  type UnitAssertion,
} from '@/lib/semantic/units'

/**
 * Projects every canonical record into evidence reading units and reconciles the stored rows.
 *
 * Idempotent by construction. A unit id is a digest of the reading's exact content, so a record
 * whose inputs did not move re-projects to exactly the ids already stored and is skipped without a
 * write. Where the inputs DID move, the stored id set and the fresh id set differ, and the record is
 * reconciled: rows no longer projected are deleted, the rest are upserted. Comparing id sets rather
 * than a stored input digest reaches the same rows and keeps the table free of a bookkeeping column
 * that would itself need to be kept true. `projectionInputDigest` is still computed, and the run
 * digest over all of them goes into the summary so two runs can be compared.
 *
 *   npx tsx scripts/semantic/project-units.ts [--check] [--slugs=a,b] [--limit=N]
 */

const CHUNK = 200

function flag(name: string): string | undefined {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3)
}

interface DrugRow {
  id: string
  slug: string
  name: string
  recorded_background: MedicineRecordedBackground | null
  sections: SectionAssessment[] | null
  searches: ProjectorSearchInput[] | null
}

function emptyCounts<T extends string>(keys: readonly T[]): Record<T, number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>
}

async function loadChunk(afterSlug: string, take: number): Promise<DrugRow[]> {
  const result = await db.execute(sql`
    select d.id, d.slug, d.name, d.recorded_background,
      a.sections as sections,
      coalesce(
        (select jsonb_agg(jsonb_build_object(
            'searchKind', s.search_kind,
            'sourceIdentifier', s.source_identifier,
            'query', s.query,
            'requestedAt', to_char(s.requested_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
            'status', s.status,
            'resultCount', s.result_count,
            'matched', s.matched,
            'error', s.error
          ) order by s.search_kind)
         from source_search_records s where s.drug_id = d.id),
        '[]'::jsonb) as searches
    from drugs d
    join inventory_resolutions r on r.drug_id = d.id and r.resolution_status = 'CANONICAL_ENTITY'
    left join dossier_completion_assessments a on a.drug_id = d.id
    where d.slug > ${afterSlug}
    order by d.slug
    limit ${take}
  `)
  return result.rows as unknown as DrugRow[]
}

async function main(): Promise<void> {
  const checkOnly = process.argv.includes('--check')
  const onlySlugs = new Set(
    (flag('slugs') ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  )
  const limit = Number(flag('limit') ?? Number.POSITIVE_INFINITY)
  const outDir = join(process.cwd(), 'data', 'semantic')

  const byKind = emptyCounts(UNIT_KINDS)
  const byAssertion = emptyCounts(UNIT_ASSERTIONS)
  const bySection = Object.fromEntries(
    DOSSIER_SECTION_IDS.map((id) => [id, emptyCounts(UNIT_ASSERTIONS)]),
  ) as Record<DossierSectionId, Record<UnitAssertion, number>>
  const digests: string[] = []

  let records = 0
  let recordsWithoutAssessment = 0
  let projected = 0
  let unchangedRecords = 0
  let changedRecords = 0
  let inserted = 0
  let deleted = 0
  let afterSlug = ''

  try {
    for (;;) {
      if (records >= limit) break
      const chunk = await loadChunk(afterSlug, CHUNK)
      if (chunk.length === 0) break
      afterSlug = chunk[chunk.length - 1]!.slug

      const selected = chunk.filter((row) => onlySlugs.size === 0 || onlySlugs.has(row.slug))
      if (selected.length === 0) continue

      const projections = new Map<string, EvidenceReadingUnit[]>()
      for (const row of selected) {
        if (records >= limit) break
        records += 1
        if (!row.sections) recordsWithoutAssessment += 1
        const input = {
          drug: {
            id: row.id,
            canonicalSlug: row.slug,
            name: row.name,
            recordedBackground: row.recorded_background,
          },
          sections: row.sections ?? [],
          searches: row.searches ?? [],
        }
        const units = projectEvidenceUnits(input)
        projections.set(row.id, units)
        digests.push(projectionInputDigest(input))
        projected += units.length
        for (const unit of units) {
          byKind[unit.unitKind] += 1
          byAssertion[unit.assertion] += 1
          bySection[unit.sectionId][unit.assertion] += 1
        }
      }

      const drugIds = [...projections.keys()]
      if (drugIds.length === 0) continue
      const storedResult = await db.execute(sql`
        select drug_id, id from evidence_reading_units
        where drug_id in (${sql.join(
          drugIds.map((id) => sql`${id}`),
          sql`, `,
        )})
      `)
      const stored = new Map<string, Set<string>>()
      for (const row of storedResult.rows as unknown as Array<{ drug_id: string; id: string }>) {
        const set = stored.get(row.drug_id) ?? new Set<string>()
        set.add(row.id)
        stored.set(row.drug_id, set)
      }

      for (const [drugId, units] of projections) {
        const priorIds = stored.get(drugId) ?? new Set<string>()
        const nextIds = new Set(units.map((unit) => unit.id))
        const stale = [...priorIds].filter((id) => !nextIds.has(id))
        const fresh = units.filter((unit) => !priorIds.has(unit.id))
        if (stale.length === 0 && fresh.length === 0) {
          unchangedRecords += 1
          continue
        }
        changedRecords += 1
        deleted += stale.length
        inserted += fresh.length
        if (checkOnly) continue
        if (stale.length > 0) {
          await db.execute(sql`
            delete from evidence_reading_units
            where drug_id = ${drugId} and id in (${sql.join(
              stale.map((id) => sql`${id}`),
              sql`, `,
            )})
          `)
        }
        for (let start = 0; start < units.length; start += 100) {
          const batch = units.slice(start, start + 100).map((unit) => ({
            id: unit.id,
            drugId: unit.drugId,
            canonicalSlug: unit.canonicalSlug,
            unitKind: unit.unitKind,
            assertion: unit.assertion,
            sectionId: unit.sectionId,
            fieldPath: unit.fieldPath,
            populationScope: unit.populationScope,
            formulationScope: unit.formulationScope,
            text: unit.text,
            sourceRefs: unit.sourceRefs as unknown as Array<Record<string, string>>,
            comparisonState: unit.comparisonState,
            projectorVersion: unit.projectorVersion,
            contentDigest: unit.contentDigest,
          }))
          if (batch.length === 0) continue
          await db
            .insert(evidenceReadingUnits)
            .values(batch)
            .onConflictDoUpdate({
              target: evidenceReadingUnits.id,
              set: {
                canonicalSlug: sql`excluded.canonical_slug`,
                sectionId: sql`excluded.section_id`,
                fieldPath: sql`excluded.field_path`,
                populationScope: sql`excluded.population_scope`,
                formulationScope: sql`excluded.formulation_scope`,
                sourceRefs: sql`excluded.source_refs`,
                comparisonState: sql`excluded.comparison_state`,
                projectorVersion: sql`excluded.projector_version`,
                contentDigest: sql`excluded.content_digest`,
              },
            })
        }
      }

      if (records % 1000 < CHUNK) {
        console.log(`[semantic] ${records} record(s) projected · ${projected} unit(s)`)
      }
    }

    const orphanResult = await db.execute(sql`
      select count(*)::int as count from evidence_reading_units u
      where not exists (
        select 1 from inventory_resolutions r
        where r.drug_id = u.drug_id and r.resolution_status = 'CANONICAL_ENTITY'
      )
    `)
    const orphans = (orphanResult.rows as unknown as Array<{ count: number }>)[0]?.count ?? 0

    const summary = {
      projectorVersion: SEMANTIC_PROJECTOR_VERSION,
      records,
      recordsWithoutAssessment,
      units: projected,
      byKind,
      byAssertion,
      bySection,
      unchangedRecords,
      changedRecords,
      unitsInserted: inserted,
      unitsDeleted: deleted,
      unitsForNonCanonicalRecords: orphans,
      inputDigest: createHash('sha256').update(digests.join('\n')).digest('hex'),
      check: checkOnly,
    }

    console.log(
      `[semantic] ${records} record(s) · ${projected} unit(s) · ${unchangedRecords} unchanged · ${changedRecords} changed · ${inserted} written · ${deleted} removed`,
    )
    console.log(`[semantic] by kind ${JSON.stringify(byKind)}`)
    console.log(`[semantic] by assertion ${JSON.stringify(byAssertion)}`)

    // A check run never writes the summary: the file records what IS stored, and a check run has
    // deliberately not stored anything.
    if (onlySlugs.size === 0 && !Number.isFinite(limit) && !checkOnly) {
      mkdirSync(outDir, { recursive: true })
      writeFileSync(join(outDir, 'units-summary.json'), `${JSON.stringify(summary, null, 2)}\n`)
      console.log(`[semantic] wrote ${join(outDir, 'units-summary.json')}`)
    }
    if (checkOnly && changedRecords > 0) {
      process.exitCode = 1
      console.error(`[semantic] ${changedRecords} record(s) differ from their stored units`)
    }
  } finally {
    await closeDatabasePool()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
