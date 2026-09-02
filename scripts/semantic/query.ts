import 'dotenv/config'

import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import { lexicalSearch, rowToUnit } from '@/lib/semantic/lexical'
import {
  createUnitLookupSource,
  isDossierSectionId,
  isSilenceQuestionId,
  lookupSection,
  lookupSilenceQuestion,
  populationBoundary,
} from '@/lib/semantic/lookups'
import { buildEntityIndex } from '@/lib/semantic/scope-gates'
import { answerEvidenceQuery } from '@/lib/semantic/search'
import { POPULATION_SCOPES, type PopulationScope } from '@/lib/semantic/units'

/**
 * Operator entry point for the evidence engine. Not wired to any page.
 *
 * Three modes, all read-only:
 *
 *   npx tsx scripts/semantic/query.ts "half-life of metformin"
 *   npx tsx scripts/semantic/query.ts --entity=metformin --section=pharmacokinetics
 *   npx tsx scripts/semantic/query.ts --entity=metformin --question=population_pediatric
 *   npx tsx scripts/semantic/query.ts --entity=metformin --population=PEDIATRIC
 *
 * The free-text mode runs lexical retrieval and the scope gates. The other three are deterministic
 * lookups that use no retrieval at all, and they are the right tool whenever the record and the
 * question are both known.
 */

function flag(name: string): string | undefined {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3)
}

async function loadUnitsForSlug(slug: string) {
  const result = await db.execute(sql`
    select id, drug_id, canonical_slug, unit_kind, assertion, section_id, field_path,
      population_scope, formulation_scope, text, source_refs, comparison_state,
      projector_version, content_digest, 0 as score
    from evidence_reading_units where canonical_slug = ${slug} order by id
  `)
  return (result.rows as unknown as Parameters<typeof rowToUnit>[0][]).map(rowToUnit)
}

async function resolveSlug(nameOrSlug: string): Promise<string[]> {
  const result = await db.execute(sql`
    select distinct d.slug from drugs d
    join inventory_resolutions r on r.drug_id = d.id and r.resolution_status = 'CANONICAL_ENTITY'
    left join drug_aliases a on a.drug_id = d.id
    where lower(d.slug) = lower(${nameOrSlug})
       or lower(d.name) = lower(${nameOrSlug})
       or lower(a.alias) = lower(${nameOrSlug})
    order by d.slug
  `)
  return (result.rows as unknown as Array<{ slug: string }>).map((row) => row.slug)
}

function print(value: unknown): void {
  console.log(JSON.stringify(value, null, 2))
}

async function main(): Promise<void> {
  const entity = flag('entity')
  const section = flag('section')
  const question = flag('question')
  const population = flag('population')
  const free = process.argv
    .slice(2)
    .filter((value) => !value.startsWith('--'))
    .join(' ')

  try {
    if (entity) {
      const slugs = await resolveSlug(entity)
      const units = slugs.length === 1 ? await loadUnitsForSlug(slugs[0]!) : []
      const aliases = new Map<string, string[]>([
        [
          entity
            .toLowerCase()
            .replace(/[^a-z0-9]+/gu, ' ')
            .trim(),
          slugs,
        ],
      ])
      const source = createUnitLookupSource(units, aliases)
      if (question) {
        if (!isSilenceQuestionId(question)) throw new Error(`unknown question id: ${question}`)
        print(lookupSilenceQuestion(source, entity, question))
        return
      }
      if (population) {
        if (!(POPULATION_SCOPES as readonly string[]).includes(population)) {
          throw new Error(`unknown population scope: ${population}`)
        }
        print(populationBoundary(source, entity, population as PopulationScope))
        return
      }
      if (section) {
        if (!isDossierSectionId(section)) throw new Error(`unknown section id: ${section}`)
        print(lookupSection(source, entity, section))
        return
      }
      throw new Error('pass --section, --question or --population alongside --entity')
    }

    if (free.trim().length === 0) {
      throw new Error('pass a query, or --entity with --section, --question or --population')
    }

    const entityRows = await db.execute(sql`
      select d.slug, d.name,
        coalesce((select jsonb_agg(a.alias order by a.alias) from drug_aliases a where a.drug_id = d.id), '[]'::jsonb) as aliases
      from drugs d
      join inventory_resolutions r on r.drug_id = d.id and r.resolution_status = 'CANONICAL_ENTITY'
      order by d.slug
    `)
    const index = buildEntityIndex(
      entityRows.rows as unknown as Array<{ slug: string; name: string; aliases: string[] }>,
    )
    const answer = await answerEvidenceQuery(free, {
      retrieve: async (query, limit) => lexicalSearch(query, { limit }),
      entityIndex: index,
    })
    print({
      query: answer.query,
      status: answer.status,
      refusal: answer.refusal,
      slug: answer.slug,
      populationScope: answer.populationScope,
      formulationScope: answer.formulationScope,
      engineVersion: answer.engineVersion,
      units: answer.units.map((hit) => ({
        id: hit.unit.id,
        score: hit.score,
        assertion: hit.unit.assertion,
        sectionId: hit.unit.sectionId,
        fieldPath: hit.unit.fieldPath,
        text: hit.unit.text,
        sourceRefs: hit.unit.sourceRefs,
      })),
      absences: answer.absences.map((unit) => ({
        id: unit.id,
        sectionId: unit.sectionId,
        text: unit.text,
        sourceRefs: unit.sourceRefs,
      })),
    })
  } finally {
    await closeDatabasePool()
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
