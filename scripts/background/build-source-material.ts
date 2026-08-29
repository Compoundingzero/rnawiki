import 'dotenv/config'
import { createReadStream, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join } from 'node:path'

import {
  alternativeNames,
  normalizeContentName,
  normalizeIdentityName,
} from '@/lib/background/name-normalization'
import { runBackgroundIntelligence } from '@/lib/rna-intelligence/background-rules'
import type {
  MedicineRecordedBackground,
  RecordedRegistryIdentifiers,
  RecordedSourceMaterial,
} from '@/lib/background/types'
import { EXTRACTED_BACKGROUND } from '../seed-data/background/extracted-background.generated'

/**
 * Records what kind of material each substance is, from FDA's substance registry.
 *
 * The registry answers a question nothing else in this corpus could: whether a substance is a
 * chemical, a protein, a polymer, a mixture, or material taken from an organism — and where an
 * organism is involved, which organism and which part of it.
 *
 * The part is why this exists. Kew's Medicinal Plant Names Services holds the plant part used for
 * medicinal botanicals and cannot be used: no published licence, ClaudeBot disallowed in its
 * robots.txt, rights reserved under EU DSM Article 4. The FDA registry carries the same fact as a
 * US Government work, and carries it better, because it is the registry the labels are keyed to.
 *
 * The taxonomy module infers a part by stripping a trailing word from the row's name — "Curcuma
 * Longa Leaf" ends in "leaf" — which works and is inference. This is the registry saying so.
 *
 * IDENTITY BEFORE NAME. Where a product's own label declared which registered substance the row is,
 * that identifier selects the registry record and the row's name is not consulted at all. A name
 * match is an inference from a string; a label is the product stating what is in it, and the two
 * disagreed on 158 rows. "Aconite" is the case to remember: the label declares ACONITUM NAPELLUS,
 * the plant, while the name matches a different registered substance called ACONITE. Attaching the
 * name-matched material would have described one substance on a page that means another, which is
 * the mis-attribution this record model exists to prevent. Resolving by identity also reaches 417
 * rows whose declared substance no name in the registry matched.
 *
 * Where no label named the row, a name is matched only where it resolves to exactly ONE substance
 * record. The registry holds 167,385 substances and its names collide with each other; an ambiguous
 * identity is not an identity, which is the rule the taxonomy and identity matches already run on.
 *
 * Source: `https://download.open.fda.gov/other/substance/other-substance-0001-of-0001.json.zip`,
 * one public-domain bulk file of about 317 MB, reduced by
 * `scripts/background/index-openfda-substances.py`. No API, nothing to rate-limit.
 *
 * Usage:
 *   tsx scripts/background/build-source-material.ts <substances.ndjson>
 */

interface SubstanceLine {
  unii: string
  preferredName: string
  names: string[]
  substanceClass?: string | null
  part: string[]
  parentSubstance?: string | null
  sourceMaterialClass?: string | null
  sourceMaterialType?: string | null
  /** Cross-references, keyed by the registry's own name for each system. */
  codes?: Record<string, { code: string; url?: string | null }>
}

/**
 * The registry's cross-references, as identifiers this record already knows how to hold.
 *
 * Identifiers are pointers rather than content: recording a ChEMBL or DrugBank identifier records
 * the address of a record, which is a fact from a public-domain file, and copies nothing from
 * databases whose own licences would not permit it.
 */
function identifiersFrom(
  substance: SubstanceLine,
  retrievedAt: string,
): RecordedRegistryIdentifiers | undefined {
  const codes = substance.codes ?? {}
  const value = (system: string) => codes[system]?.code?.trim() || undefined
  const identifiers: RecordedRegistryIdentifiers = {
    unii: substance.unii,
    ...(value('CAS') ? { casNumber: value('CAS') } : {}),
    ...(value('PUBCHEM') ? { pubchemCid: value('PUBCHEM') } : {}),
    ...(value('RXCUI') ? { rxcui: value('RXCUI') } : {}),
    ...(value('INN') ? { innIdentifier: value('INN') } : {}),
    ...(value('ChEMBL') ? { chemblId: value('ChEMBL') } : {}),
    ...(value('CHEBI') ? { chebiId: value('CHEBI') } : {}),
    ...(value('SMS_ID') ? { emaSubstanceId: value('SMS_ID') } : {}),
    ...(value('ECHA (EC/EINECS)') ? { ecNumber: value('ECHA (EC/EINECS)') } : {}),
    ...(value('NCBI TAXONOMY') ? { ncbiTaxonomyId: value('NCBI TAXONOMY') } : {}),
    ...(value('DRUG BANK') ? { drugBankId: value('DRUG BANK') } : {}),
    source: {
      kind: 'FDA_UNII',
      identifier: substance.unii,
      label: `Substance registry record for ${substance.preferredName}`,
      retrievedAt,
    },
  }
  // A record holding only the identifier it is keyed by adds nothing a reader could follow.
  return Object.keys(identifiers).length > 2 ? identifiers : undefined
}

interface MedicineRow {
  slug: string
  name: string
}

function medicineRows(): MedicineRow[] {
  const dir = join(process.cwd(), 'data', 'drugs')
  const rows: MedicineRow[] = []
  for (const file of readdirSync(dir)
    .filter((name) => name.endsWith('.ndjson'))
    .sort()) {
    for (const line of readFileSync(join(dir, file), 'utf8').split('\n')) {
      if (!line.trim()) continue
      const record = JSON.parse(line) as { id?: string; name?: string }
      if (record.id && record.name) rows.push({ slug: record.id, name: record.name })
    }
  }
  return rows
}

/**
 * The substance each row's label declared, where one did.
 *
 * Read from the label-derived records only, never from the merged dataset — this script writes into
 * that dataset, and a build that reads its own previous output stops being reproducible.
 */
function declaredIdentities(): Map<string, string> {
  const known = new Map<string, string>()
  for (const [slug, background] of Object.entries(EXTRACTED_BACKGROUND)) {
    const unii = background.registryIdentifiers?.unii
    if (unii && /^[A-Z0-9]{10}$/u.test(unii)) known.set(slug, unii)
  }
  return known
}

async function main() {
  const path = process.argv[2]
  if (!path) {
    console.error('usage: tsx scripts/background/build-source-material.ts <substances.ndjson>')
    process.exit(1)
  }

  const rows = medicineRows()
  const declared = declaredIdentities()
  const wantedUniis = new Set(declared.values())
  const wanted = new Set<string>()
  for (const row of rows) {
    for (const candidate of alternativeNames(row.name)) {
      for (const key of [normalizeContentName(candidate), normalizeIdentityName(candidate)]) {
        if (key.length >= 3) wanted.add(key)
      }
    }
  }
  console.log(
    `[material] ${rows.length} medicine row(s) · ${declared.size} declared identity(ies) · ${wanted.size} name key(s) sought`,
  )

  /**
   * Two indexes, kept apart, and that separation is the whole fix.
   *
   * Merging them made unambiguous names look ambiguous. The content form strips salt words, so
   * "ACETAZOLAMIDE" and "ACETAZOLAMIDE SODIUM" collapse to one key held by two different registered
   * substances — and the one-substance rule then dropped both. Acetazolamide, aldosterone and
   * altretamine are ordinary drugs that this corpus could not say a single word about for exactly
   * that reason.
   *
   * The identity form keeps salt words, so it resolves each of them to one substance. It is tried
   * first, and the content form only answers where identity found nothing.
   */
  const byIdentity = new Map<string, Map<string, SubstanceLine>>()
  const byContent = new Map<string, Map<string, SubstanceLine>>()
  /** Registry records wanted by identifier. A UNII names one substance, so no ambiguity can arise. */
  const byUnii = new Map<string, SubstanceLine>()
  let read = 0
  const reader = createInterface({
    input: createReadStream(path, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  for await (const line of reader) {
    if (!line.trim()) continue
    read += 1
    const substance = JSON.parse(line) as SubstanceLine
    if (wantedUniis.has(substance.unii)) byUnii.set(substance.unii, substance)
    for (const name of [substance.preferredName, ...substance.names]) {
      for (const [index, key] of [
        normalizeIdentityName(name),
        normalizeContentName(name),
      ].entries()) {
        if (!wanted.has(key)) continue
        const target = index === 0 ? byIdentity : byContent
        const held = target.get(key) ?? new Map<string, SubstanceLine>()
        if (!held.has(substance.unii)) held.set(substance.unii, substance)
        target.set(key, held)
      }
    }
    if (read % 50_000 === 0) console.log(`[material] ${read} substance record(s) read`)
  }
  console.log(`[material] ${read} substance record(s) read`)

  const resolvedIdentity = new Map<string, SubstanceLine>()
  const resolvedContent = new Map<string, SubstanceLine>()
  let ambiguous = 0
  for (const [key, byUnii] of byIdentity) {
    if (byUnii.size === 1) resolvedIdentity.set(key, [...byUnii.values()][0]!)
  }
  for (const [key, byUnii] of byContent) {
    if (byUnii.size === 1) resolvedContent.set(key, [...byUnii.values()][0]!)
    else if (!resolvedIdentity.has(key)) ambiguous += 1
  }
  const resolved = new Map<string, SubstanceLine>([...resolvedContent, ...resolvedIdentity])

  const retrievedAt = new Date().toISOString().slice(0, 10)
  const dataset: Record<string, MedicineRecordedBackground> = {}
  const stats = {
    substances: read,
    resolvedByDeclaredIdentity: 0,
    declaredIdentityNotInRegistry: 0,
    namesAmbiguous: ambiguous,
    namesResolvedByIdentity: resolvedIdentity.size,
    namesResolvedByContent: resolvedContent.size,
    noClass: 0,
    partWithoutParent: 0,
    engineRejected: 0,
    withPart: 0,
    withIdentifiers: 0,
    written: 0,
  }

  for (const row of rows) {
    // The declared identity settles it where there is one, and the name is not consulted.
    let substance: SubstanceLine | undefined
    const declaredUnii = declared.get(row.slug)
    if (declaredUnii) {
      substance = byUnii.get(declaredUnii)
      if (substance) stats.resolvedByDeclaredIdentity += 1
      else stats.declaredIdentityNotInRegistry += 1
    }
    // Alternatives are tried longest first, so the most specific name a title offers wins. Reached
    // only where no label declared the substance: a name must never overrule a declared identity.
    if (!substance && !declaredUnii) {
      for (const candidate of alternativeNames(row.name)) {
        substance =
          resolved.get(normalizeContentName(candidate)) ??
          resolved.get(normalizeIdentityName(candidate))
        if (substance) break
      }
    }
    if (!substance) continue
    const substanceClass = substance.substanceClass?.trim()
    if (!substanceClass) {
      stats.noClass += 1
      continue
    }
    const parent = substance.parentSubstance?.trim()
    const parts = substance.part.filter((value) => value.trim().length > 0)
    // A part with no organism beside it states half a fact, and the engine refuses it. Dropping the
    // part rather than the record keeps the substance class, which is worth having on its own.
    const keepParts = parts.length > 0 && Boolean(parent)
    if (parts.length > 0 && !parent) stats.partWithoutParent += 1

    const material: RecordedSourceMaterial = {
      substanceClassAsRecorded: substanceClass,
      ...(substance.sourceMaterialClass
        ? { sourceMaterialClassAsRecorded: substance.sourceMaterialClass }
        : {}),
      ...(substance.sourceMaterialType
        ? { sourceMaterialTypeAsRecorded: substance.sourceMaterialType }
        : {}),
      ...(parent ? { parentSubstanceAsRecorded: parent } : {}),
      partsAsRecorded: keepParts ? parts : [],
      source: {
        kind: 'FDA_UNII',
        identifier: substance.unii,
        label: `Substance registry record for ${substance.preferredName}`,
        retrievedAt,
      },
    }
    const identifiers = identifiersFrom(substance, retrievedAt)
    if (identifiers) stats.withIdentifiers += 1
    const background: MedicineRecordedBackground = {
      version: 'medicine-background/v1',
      authoredAt: retrievedAt,
      provenanceTier: 'transcribed',
      sourceMaterial: material,
      ...(identifiers ? { registryIdentifiers: identifiers } : {}),
    }
    const report = runBackgroundIntelligence(background)
    if (!report.passed) {
      stats.engineRejected += 1
      if (stats.engineRejected <= 3) {
        console.error(
          `[material] rejected ${row.slug}: ${report.findings.map((f) => `${f.code} at ${f.path}`).join(', ')}`,
        )
      }
      continue
    }
    if (keepParts) stats.withPart += 1
    dataset[row.slug] = background
    stats.written += 1
  }

  const outPath = join(process.cwd(), 'data', 'registries', 'source-material.json')
  writeFileSync(outPath, `${JSON.stringify(dataset, null, 1)}\n`)
  console.log(`[material] ${JSON.stringify(stats)}`)
  console.log(`[material] wrote ${stats.written} record(s) to ${outPath}`)
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
