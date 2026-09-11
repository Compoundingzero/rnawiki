/**
 * Load the inputs the dossier v4 view model needs, and decide which slugs it serves.
 *
 * v4 reads everything v3 reads, plus the curated legacy record and the approved first-read answer
 * bound to it. The legacy record is loaded through the same public reader the rest of the site
 * uses, so a record the site would not show anonymously is not shown here either.
 *
 * The flag is checked before the v3 flag in the route. Unset it and the next request falls back to
 * v3, and unsetting both restores the corpus document. No database change is needed to roll back.
 */
import { getPublicDrugBySlug } from '@/lib/queries/drugs'
import { corpusFromLegacyRecord } from './legacy-shim'
import { loadDossierV3Inputs } from '@/lib/dossier-v3/load'
import { tenSecondAnswerOverride } from '@/lib/ten-second-answer-overrides'

import { buildDossierV4, type DossierV4Inputs, type DossierV4ViewModel } from './view-model'

export async function loadDossierV4Inputs(slug: string): Promise<DossierV4Inputs | null> {
  const [v3, legacyRecord] = await Promise.all([
    loadDossierV3Inputs(slug),
    getPublicDrugBySlug(slug),
  ])
  // The override resolves only when the authored copy and the record's current medical surface
  // still match one approved fingerprint. A changed record drops the answer rather than carrying
  // a stale one forward, which is the behaviour we want on a page that leads with it.
  const boundAnswer = legacyRecord ? (tenSecondAnswerOverride(legacyRecord) ?? null) : null

  if (v3) return { ...v3, legacyRecord, boundAnswer }

  /*
   * No corpus page. Rather than hand the reader back to the previous design, build a corpus-shaped
   * record from the legacy row and run the same pipeline over it. Every list on it is honestly
   * empty, and the compass renders an absence with its reason, which is the truth about a record
   * the corpus has not processed.
   */
  if (!legacyRecord) return null
  return {
    corpus: corpusFromLegacyRecord(legacyRecord, slug),
    claims: [],
    fieldStates: [],
    roleAggregate: null,
    registryConditions: [],
    registryCompletedNoResults: [],
    corrections: [],
    legacy: {
      modality: legacyRecord.modality ?? null,
      approvalStatus: legacyRecord.approvalStatus ?? null,
      indication: legacyRecord.indication ?? null,
      entityClass: null,
      sourceProvenance: legacyRecord.sourceProvenance ?? [],
    },
    fields: {},
    reviewedConclusionState: null,
    hubs: [],
    now: new Date(),
    legacyRecord,
    boundAnswer,
  }
}

export async function loadDossierV4(slug: string): Promise<DossierV4ViewModel | null> {
  const inputs = await loadDossierV4Inputs(slug)
  return inputs ? buildDossierV4(inputs) : null
}

/**
 * The slugs the v4 compass is switched on for. Same grammar as the v3 flag: a comma list, a
 * prefix ending in `*`, or `*`/`all` for every page.
 */
export function dossierV4Enabled(slug: string): boolean {
  const raw = process.env.DOSSIER_V4_SLUGS?.trim()
  if (!raw) return false
  if (raw === '*' || raw.toLowerCase() === 'all') return true
  const wanted = slug.toLowerCase()
  return raw
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .some((item) => (item.endsWith('*') ? wanted.startsWith(item.slice(0, -1)) : item === wanted))
}
