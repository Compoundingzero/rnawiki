import 'dotenv/config'
import { createReadStream, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { join } from 'node:path'

import type { MedicineRecordedBackground } from '@/lib/background/types'

/**
 * Settles rows where the substance registry and the taxonomy match name different organisms.
 *
 * Two sources reach an organism by different routes. `biologicalIdentity` matches the row's NAME
 * against the taxonomy. `registryIdentifiers.ncbiTaxonomyId` is a cross-reference carried by the
 * substance registry record the row was IDENTIFIED as. When the two identifiers differ, one of
 * three things is true, and only the taxonomy's own tables can say which:
 *
 *   RETIRED   The registry's identifier is no longer a live node. NCBI retires and merges nodes as
 *             classification changes; hepatitis C virus is 11103 in older records and 3052230 since
 *             the virus was renamed to Orthohepacivirus hominis. Same organism, stale pointer.
 *   RANK      One identifier sits above the other in the tree — the Euphorbia genus above Euphorbia
 *             hirta, Lavandula angustifolia above its own subspecies. Different precision about the
 *             same lineage, not a disagreement about what the organism is.
 *   DISTINCT  Neither of the above: two organisms in different parts of the tree, sharing a name.
 *             Cowslip is Primula veris in England and Caltha palustris — a different family — in
 *             American usage. Mugwort is Artemisia vulgaris or Artemisia douglasiana depending on
 *             who is speaking.
 *
 * What each case does:
 *
 *   RETIRED and RANK keep the recorded organism, which carries the lineage, rank and common names a
 *   reader actually sees, and drop the cross-reference identifier. A pointer that resolves to a
 *   different page than the organism shown beside it is worse than no pointer.
 *
 *   DISTINCT drops the recorded organism and keeps the cross-reference. The organism was matched
 *   from the row's name and a second, identity-based source contradicts it; the honest position is
 *   that this corpus does not know which plant the row means. Naming the wrong plant on a medicine
 *   page is the failure this whole record model exists to prevent, and a missing lineage is not.
 *
 * This is deliberately not an engine rule. The engine is deterministic, self-contained code with no
 * access to the taxonomy tables, and a rule that cannot tell a retired node from a different plant
 * would be wrong in the direction of accusation on most of what it flagged.
 *
 * Usage:
 *   tsx scripts/background/reconcile-organism-identity.ts <nodes.dmp> <names.dmp>
 */

type Verdict = 'RETIRED' | 'RANK' | 'DISTINCT'

interface Disagreement {
  slug: string
  recorded: string
  crossReference: string
  scientificName: string
  verdict: Verdict
  crossReferenceName?: string
}

const REGISTRY_DIR = join(process.cwd(), 'data', 'registries')

function loadRegistry(name: string): Record<string, MedicineRecordedBackground> {
  return JSON.parse(readFileSync(join(REGISTRY_DIR, name), 'utf8')) as Record<
    string,
    MedicineRecordedBackground
  >
}

/** The parent of every live node, which is all that is needed to walk a lineage upward. */
async function readParents(path: string): Promise<Map<string, string>> {
  const parents = new Map<string, string>()
  const reader = createInterface({
    input: createReadStream(path, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  for await (const line of reader) {
    const [child, parent] = line.split('|', 2).map((field) => field.trim())
    if (child && parent) parents.set(child, parent)
  }
  return parents
}

/** Scientific names for the handful of identifiers a run actually reports on. */
async function readNames(path: string, wanted: Set<string>): Promise<Map<string, string>> {
  const names = new Map<string, string>()
  const reader = createInterface({
    input: createReadStream(path, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })
  for await (const line of reader) {
    const fields = line.split('|').map((field) => field.trim())
    const [taxon, name, , kind] = fields
    if (!taxon || !name || kind !== 'scientific name') continue
    if (wanted.has(taxon)) names.set(taxon, name)
  }
  return names
}

/** Whether either identifier lies on the other's path to the root. */
function sharesLineage(parents: Map<string, string>, left: string, right: string): boolean {
  const climb = (from: string): Set<string> => {
    const seen = new Set<string>()
    let at: string | undefined = from
    while (at && at !== '1' && !seen.has(at)) {
      seen.add(at)
      at = parents.get(at)
    }
    return seen
  }
  return climb(left).has(right) || climb(right).has(left)
}

async function main() {
  const nodesPath = process.argv[2]
  const namesPath = process.argv[3]
  if (!nodesPath || !namesPath) {
    console.error(
      'usage: tsx scripts/background/reconcile-organism-identity.ts <nodes.dmp> <names.dmp>',
    )
    process.exit(1)
  }

  const biology = loadRegistry('biological-identity.json')
  const material = loadRegistry('source-material.json')

  // Every row where both sources name an organism and the identifiers differ.
  const disputed: { slug: string; recorded: string; crossReference: string }[] = []
  for (const [slug, background] of Object.entries(biology)) {
    const source = background.biologicalIdentity?.source
    if (source?.kind !== 'NCBI_TAXONOMY') continue
    const crossReference = material[slug]?.registryIdentifiers?.ncbiTaxonomyId
    if (!crossReference || crossReference === source.identifier) continue
    disputed.push({ slug, recorded: source.identifier, crossReference })
  }
  console.log(`[organism] ${disputed.length} row(s) where the two sources name different organisms`)
  if (disputed.length === 0) return

  const parents = await readParents(nodesPath)
  const wanted = new Set(disputed.flatMap((row) => [row.recorded, row.crossReference]))
  const names = await readNames(namesPath, wanted)

  const findings: Disagreement[] = disputed.map((row) => {
    // A cross-reference that no longer names a live node is a pointer the taxonomy has retired.
    const live = names.has(row.crossReference)
    const verdict: Verdict = !live
      ? 'RETIRED'
      : sharesLineage(parents, row.recorded, row.crossReference)
        ? 'RANK'
        : 'DISTINCT'
    return {
      ...row,
      scientificName: biology[row.slug]?.biologicalIdentity?.scientificName ?? '',
      verdict,
      ...(names.get(row.crossReference)
        ? { crossReferenceName: names.get(row.crossReference) }
        : {}),
    }
  })

  let droppedCrossReference = 0
  let droppedOrganism = 0
  for (const finding of findings) {
    if (finding.verdict === 'DISTINCT') {
      // The recorded organism came from the row's name and a second source contradicts it. Removing
      // it leaves the substance identified and the organism unstated, which is what is true.
      delete biology[finding.slug]?.biologicalIdentity
      if (biology[finding.slug] && !biology[finding.slug]!.biologicalIdentity) {
        delete biology[finding.slug]
      }
      droppedOrganism += 1
    } else {
      delete material[finding.slug]?.registryIdentifiers?.ncbiTaxonomyId
      droppedCrossReference += 1
    }
  }

  for (const finding of findings) {
    const named = finding.crossReferenceName ?? 'a node the taxonomy has retired'
    console.log(
      `[organism] ${finding.verdict.padEnd(8)} ${finding.slug} · recorded ${finding.scientificName} (${finding.recorded}) · cross-reference ${named} (${finding.crossReference})`,
    )
  }

  writeFileSync(
    join(REGISTRY_DIR, 'biological-identity.json'),
    `${JSON.stringify(biology, null, 1)}\n`,
  )
  writeFileSync(
    join(REGISTRY_DIR, 'source-material.json'),
    `${JSON.stringify(material, null, 1)}\n`,
  )
  console.log(
    `[organism] dropped ${droppedCrossReference} stale cross-reference(s) and ${droppedOrganism} contradicted organism record(s)`,
  )
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
