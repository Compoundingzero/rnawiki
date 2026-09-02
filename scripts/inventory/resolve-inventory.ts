import 'dotenv/config'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { sql } from 'drizzle-orm'

import { closeDatabasePool, db } from '@/db'
import {
  resolveInventory,
  type InventoryRowInput,
  type RedirectLedgerRow,
} from '@/lib/inventory/resolve'
import { stableJsonStringify } from '@/lib/stable-json'

/**
 * Resolves every `drugs` row into exactly one inventory state and writes the deterministic audit
 * artifacts. `--check` regenerates the artifacts in memory and fails if the checked-in files differ.
 *
 *   npx tsx scripts/inventory/resolve-inventory.ts            write data/inventory/*
 *   npx tsx scripts/inventory/resolve-inventory.ts --check    verify without writing
 *   npx tsx scripts/inventory/resolve-inventory.ts --out-dir=<dir>
 */

interface RawRow {
  id: string
  slug: string
  name: string
  trade_name: string | null
  dossier_depth: 'stub' | 'curated' | 'flagship'
  modality: string
  approval_status: string
  aliases: Array<{ alias: string; kind: string }>
  modules: string[]
  composition_count: number
  registry_identifiers: Record<string, unknown> | null
  taxonomy_id: string | null
  dsld_group: string | null
  fda_application: string | null
  ndcs: string[] | null
  label_ids: string[] | null
}

function flag(name: string): string | undefined {
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3)
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

export async function loadInventoryRows(): Promise<{
  rows: InventoryRowInput[]
  ledger: RedirectLedgerRow[]
}> {
  const result = await db.execute(sql`
    select d.id, d.slug, d.name, d.trade_name, d.dossier_depth, d.modality, d.approval_status,
      coalesce((select jsonb_agg(jsonb_build_object('alias', a.alias, 'kind', a.kind) order by lower(a.alias), a.kind)
                from drug_aliases a where a.drug_id = d.id), '[]'::jsonb) as aliases,
      coalesce((select jsonb_agg(k order by k) from jsonb_object_keys(coalesce(d.recorded_background, '{}'::jsonb)) k), '[]'::jsonb) as modules,
      jsonb_array_length(coalesce(d.recorded_background->'composition'->'ingredients', '[]'::jsonb)) as composition_count,
      d.recorded_background->'registryIdentifiers' as registry_identifiers,
      d.recorded_background->'biologicalIdentity'->'source'->>'identifier' as taxonomy_id,
      d.recorded_background->'supplementIngredient'->'source'->>'identifier' as dsld_group,
      d.recorded_background->'regulatoryApproval'->>'earliestApplicationNumber' as fda_application,
      d.recorded_background->'productListing'->'sampleProductNdcs' as ndcs,
      d.recorded_background->'labelPresence'->'sampleLabelIds' as label_ids
    from drugs d
    order by d.slug
  `)
  const rows = (result.rows as unknown as RawRow[]).map((row): InventoryRowInput => {
    const registry = row.registry_identifiers ?? {}
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      tradeName: row.trade_name,
      dossierDepth: row.dossier_depth,
      modality: row.modality,
      approvalStatus: row.approval_status,
      aliases: row.aliases,
      backgroundModules: row.modules,
      compositionIngredientCount: Number(row.composition_count ?? 0),
      registryIdentifiers: Object.fromEntries(
        (['pubchemCid', 'casNumber', 'unii', 'rxcui', 'ncbiTaxonomyId'] as const)
          .map((key) => [key, stringOrNull(registry[key])] as const)
          .filter((entry): entry is readonly [typeof entry[0], string] => entry[1] !== null),
      ),
      biologicalIdentityTaxonomyId: stringOrNull(row.taxonomy_id),
      supplementIngredientGroupId: stringOrNull(row.dsld_group),
      fdaApplicationNumber: stringOrNull(row.fda_application),
      sampleProductNdcs: Array.isArray(row.ndcs) ? row.ndcs.filter((v): v is string => typeof v === 'string') : [],
      sampleLabelSetIds: Array.isArray(row.label_ids)
        ? row.label_ids.filter((v): v is string => typeof v === 'string')
        : [],
    }
  })
  const ledgerResult = await db.execute(sql`
    select old_slug, target_drug_id, reason, rationale from medicine_slug_redirects order by old_slug
  `)
  const ledger = (
    ledgerResult.rows as Array<{ old_slug: string; target_drug_id: string; reason: string; rationale: string }>
  ).map((row) => ({
    oldSlug: row.old_slug,
    targetDrugId: row.target_drug_id,
    reason: row.reason,
    rationale: row.rationale,
  }))
  return { rows, ledger }
}

export function renderInventoryArtifacts(result: ReturnType<typeof resolveInventory>): Map<string, string> {
  const files = new Map<string, string>()
  files.set(
    'inventory-resolution.ndjson',
    `${result.resolutions.map((resolution) => stableJsonStringify(resolution)).join('\n')}\n`,
  )
  files.set('inventory-resolution-summary.json', `${JSON.stringify(result.summary, null, 2)}\n`)
  return files
}

async function main(): Promise<void> {
  const checkOnly = process.argv.includes('--check')
  const outDir = flag('out-dir') ?? join(process.cwd(), 'data', 'inventory')
  try {
    const { rows, ledger } = await loadInventoryRows()
    const result = resolveInventory(rows, ledger)
    const files = renderInventoryArtifacts(result)
    const { summary } = result
    console.log(
      `[inventory] ${summary.originalInventoryCount} original records = ${summary.canonicalEntities} canonical + ${summary.aliasesOrDuplicatesRedirected} alias/duplicate redirects + ${summary.historicalRedirects} historical redirects + ${summary.justifiedGoneIdentities} gone + ${summary.manualReviewRequired} manual review · balanced=${summary.accountingBalanced}`,
    )
    if (!summary.accountingBalanced) {
      throw new Error('inventory accounting does not balance')
    }
    if (checkOnly) {
      const stale: string[] = []
      for (const [name, bytes] of files) {
        const path = join(outDir, name)
        if (!existsSync(path) || readFileSync(path, 'utf8') !== bytes) stale.push(name)
      }
      if (stale.length > 0) throw new Error(`inventory artifacts are stale: ${stale.join(', ')}`)
      console.log('[inventory] artifacts match the database')
      return
    }
    mkdirSync(outDir, { recursive: true })
    for (const [name, bytes] of files) writeFileSync(join(outDir, name), bytes)
    console.log(`[inventory] wrote ${files.size} artifact(s) to ${outDir}`)
  } finally {
    await closeDatabasePool()
  }
}

if (process.argv[1]?.endsWith('resolve-inventory.ts')) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  })
}
