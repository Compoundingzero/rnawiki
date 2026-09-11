/**
 * Let the compass render a medicine that has no corpus page.
 *
 * `loadDossierV3Inputs` begins at `loadCorpusDossier` and returns null when the corpus does not
 * hold the slug. v4 loads on top of it, so until now v4 could not render such a record at all and
 * the route forwarded it to the previous React dossier. In this database that is 8,552 of the 9,859
 * medicines, so "every public medicine uses v4" was not reachable by any flag setting.
 *
 * The fix is not a second rendering path. A second path would drift, and the safety rules the view
 * model enforces would have to be written twice. Instead this builds a `CorpusDossier`-shaped
 * record from the legacy row, with every list honestly empty, and the whole existing pipeline runs
 * against it unchanged.
 *
 * What a shimmed record deliberately does not have:
 *
 *   - generated question blocks, because the corpus never generated any for it;
 *   - a registry aggregate, because no registry pass matched it;
 *   - identifiers, relations or hub membership, because those are corpus products.
 *
 * Those absences are the truth about the record, and the compass already renders an absence with
 * its reason. The shim's job is to make the page load, not to make it look full.
 */
import type { CorpusDossier, CorpusSourceRow, CorpusSynonymGroup } from '@/lib/corpus/dossier-page'
import type { DrugDossier } from '@/lib/types'

/**
 * The synthetic key. It is not an identity key and must never reach a reader: a shimmed record has
 * no question blocks, which is the only place the corpus surface prints a key, and the corpus-wide
 * validation asserts the prefix appears in no rendered page.
 */
export const LEGACY_KEY_PREFIX = 'LEGACY:'

export function legacyShimKey(slug: string): string {
  return `${LEGACY_KEY_PREFIX}${slug}`
}

export function isLegacyShimKey(key: string): boolean {
  return key.startsWith(LEGACY_KEY_PREFIX)
}

function sourceRows(drug: DrugDossier): CorpusSourceRow[] {
  const rows: CorpusSourceRow[] = []
  for (const entry of drug.sourceProvenance ?? []) {
    const doi = /\(?(10\.\d{4,9}\/[^\s)]+)\)?/.exec(entry)?.[1]
    rows.push({
      kind: 'curated-record',
      register: 'Recorded on the curated record',
      id: doi ?? entry.slice(0, 80),
      ...(doi ? { href: `https://doi.org/${doi}` } : {}),
      title: entry,
    } as CorpusSourceRow)
  }
  for (const audit of drug.keyAudits ?? []) {
    rows.push({
      kind: 'curated-audit',
      register: 'Recorded on the curated record',
      id: audit.doi ?? audit.id,
      ...(audit.doi ? { href: `https://doi.org/${audit.doi}` } : {}),
      title: audit.evidenceSource,
    } as CorpusSourceRow)
  }
  // Same study cited twice is one row to a reader.
  const seen = new Set<string>()
  return rows.filter((row) => {
    const key = `${row.id}|${row.title ?? ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function synonymGroups(drug: DrugDossier): CorpusSynonymGroup[] {
  const trade = drug.tradeName?.trim()
  if (!trade) return []
  return [{ kind: 'trade', label: 'Trade name', names: [trade] }]
}

/**
 * Build a corpus-shaped record from a legacy row.
 *
 * `indexable` is false without exception. A record the corpus has not processed has not passed the
 * identity and source gates that decide indexing, and shimming one into existence must not quietly
 * grant it a place in search.
 */
export function corpusFromLegacyRecord(drug: DrugDossier, slug: string): CorpusDossier {
  const withdrawn = /withdrawn/i.test(drug.approvalStatus ?? '')
  return {
    key: legacyShimKey(slug),
    slug,
    displayName: drug.name,
    model: 'LEGACY',
    tier: 0,
    pageType: withdrawn ? 'withdrawn' : 'clinical',
    indexable: false,
    suppressed: false,
    suppressionClasses: [],
    suppressionEvidence: [],
    withdrawn,
    presentFieldCount: 0,
    applicableFieldCount: 0,
    synonyms: synonymGroups(drug),
    register: 'curated record',
    ...(drug.recentAuditDate ? { lastVerified: drug.recentAuditDate } : {}),
    humanData: (drug.trials ?? []).length > 0,
    ladder: [],
    blocks: [],
    registerEvents: [],
    identifiers: [],
    relations: [],
    hubs: [],
    sources: sourceRows(drug),
    licenceNotes: [],
    registeredStudies: 0,
    controlled: /controlled/i.test(drug.approvalStatus ?? ''),
    controlledBasis: [],
    registration: [],
    controlledSchedules: [],
    interactions: {
      lines: [],
      sourcesChecked: [],
      totals: {},
      predictedOnly: false,
    },
    computedSections: [],
    formOfNotes: [],
    relationNotes: [],
  } as unknown as CorpusDossier
}
