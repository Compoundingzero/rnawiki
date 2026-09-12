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
import { loadPageStatementOverlay } from '@/lib/queries/page-statements'
import { corpusFromLegacyRecord } from './legacy-shim'
import { loadDossierV3Inputs } from '@/lib/dossier-v3/load'
import { tenSecondAnswerOverride } from '@/lib/ten-second-answer-overrides'

import { buildDossierV4, type DossierV4Inputs, type DossierV4ViewModel } from './view-model'

export async function loadDossierV4Inputs(slug: string): Promise<DossierV4Inputs | null> {
  const [v3, legacyRecord] = await Promise.all([
    loadDossierV3Inputs(slug),
    getPublicDrugBySlug(slug),
  ])
  /*
   * Wordings three members approved, read fresh on every request. This is what makes an approved
   * revision reach a reader with no deployment: the route is force-dynamic and nothing caches the
   * document, so the next request after the publishing transaction shows the new sentence.
   */
  /*
   * Wordings members approved, read fresh on every request.
   *
   * The page shows the approved text and says nothing about the approval: no count, no label, no
   * control. A reader meets the medicine, and the review that produced the wording is visible at
   * /review-queue where the work happens. What the overlay never carries across is the evidence
   * state — three people agreeing on words does not move an animal result to a human one.
   */
  const statementOverlay = await loadPageStatementOverlay(slug, legacyRecord)
  // The override resolves only when the authored copy and the record's current medical surface
  // still match one approved fingerprint. A changed record drops the answer rather than carrying
  // a stale one forward, which is the behaviour we want on a page that leads with it.
  const boundAnswer = legacyRecord ? (tenSecondAnswerOverride(legacyRecord) ?? null) : null

  if (v3) return { ...v3, legacyRecord, boundAnswer, statementOverlay }

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
    statementOverlay,
  }
}

export async function loadDossierV4(slug: string): Promise<DossierV4ViewModel | null> {
  const inputs = await loadDossierV4Inputs(slug)
  return inputs ? buildDossierV4(inputs) : null
}
