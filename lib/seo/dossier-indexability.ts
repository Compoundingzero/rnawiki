import type { MedicineDossierViewModel } from '@/lib/medicine-dossier-view-model'
import {
  explainMedicineIndexability,
  resolveLegacyPublicContentDate,
  type CanonicalRecordIndexingInput,
} from '@/lib/seo/indexability'
import type { DrugDossier } from '@/lib/types'

function date(value: string | undefined): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isFinite(parsed.getTime()) ? parsed : null
}

function legacySourceCount(drug: DrugDossier, dossier: MedicineDossierViewModel): number {
  return new Set(
    [...dossier.sources.map((source) => source.label), ...(drug.sourceProvenance ?? [])].flatMap(
      (value) => {
        const normalized = value?.trim()
        return normalized ? [normalized] : []
      },
    ),
  ).size
}

/**
 * Scalar identity/completeness projection carried on the dossier itself. A record with no stored
 * inventory resolution is not offered the canonical-record path at all; a record with a resolution
 * but no completeness assessment is offered it and fails it, which is the reportable state.
 */
export function canonicalRecordProjection(drug: DrugDossier): CanonicalRecordIndexingInput | null {
  const resolution = drug.inventoryResolution
  if (!resolution) return null
  const assessment = drug.completionAssessment
  return {
    resolutionStatus: resolution.resolutionStatus,
    assessmentStatus: assessment?.status ?? null,
    contentChangedAt: assessment ? date(assessment.contentChangedAt) : null,
    applicableSectionCount: assessment?.applicableSectionCount ?? 0,
    terminalSectionCount: assessment?.terminalSectionCount ?? 0,
  }
}

export interface DossierIndexabilityOptions {
  /** Sitemap projection repeats the canonical redirect-ledger check; route reads are pre-resolved. */
  isRedirectSource?: boolean
  /** Stable evaluation clock for sitemap/report generation and deterministic tests. */
  evaluatedAt?: Date
  /**
   * Explicit canonical-record projection for callers that read the scalar columns directly rather
   * than materializing the assessment JSONB onto the dossier. Omit to derive it from the record.
   */
  canonicalRecord?: CanonicalRecordIndexingInput | null
}

/** Route/sitemap adapter for the single shared pure policy and its auditable reason list. */
export function explainDossierIndexability(
  drug: DrugDossier,
  dossier: MedicineDossierViewModel,
  options: DossierIndexabilityOptions = {},
) {
  const publication =
    dossier.bindingState === 'published_programme' && dossier.conclusion
      ? {
          reviewStatus: 'PUBLISHED',
          publishedAt: date(dossier.review.publishedAt),
          reviewedAt: date(dossier.review.reviewedAt),
          publicLabel: dossier.conclusion.publicLabel,
          plainMechanism: dossier.mechanismSummary.change ?? null,
          // Use the exact stored programme summary. Reader copy may intentionally withhold or
          // reshape this field when its statement-level citation cannot be rendered safely.
          bestSupportedFinding: dossier.mechanismSummary.observed ?? null,
          mainLimitation: dossier.readerSummary.biggestLimit ?? dossier.mainLimitation ?? null,
          sourceCount: dossier.sources.length,
          independentReviewCount: dossier.conclusion.independentReviewCount,
          freshness: dossier.freshness,
        }
      : null

  const legacy =
    publication === null &&
    (dossier.bindingState === 'legacy_record' || dossier.bindingState === 'programme_unpublished')
      ? {
          bindingState: dossier.bindingState,
          dossierDepth: drug.dossierDepth ?? null,
          authoredEvidenceBinding: dossier.readerSummary.authoredEvidenceBinding ?? null,
          usedFor: dossier.readerSummary.usedFor ?? null,
          bestSupportedFinding: dossier.readerSummary.whatStudiesFound ?? null,
          mainLimitation: dossier.readerSummary.biggestLimit ?? dossier.mainLimitation ?? null,
          sourceCount: legacySourceCount(drug, dossier),
          publicContentDate: resolveLegacyPublicContentDate(
            drug.lastEditedAt,
            drug.recentAuditDate,
            options.evaluatedAt,
          ),
        }
      : null

  return explainMedicineIndexability({
    canonicalSlug: dossier.slug || drug.id,
    // Public dossier routing resolves owner-curated historical slugs before loading this model.
    isRedirectSource: options.isRedirectSource ?? false,
    publication,
    legacy,
    canonicalRecord:
      options.canonicalRecord === undefined
        ? canonicalRecordProjection(drug)
        : options.canonicalRecord,
  })
}

export function decideDossierIndexability(
  drug: DrugDossier,
  dossier: MedicineDossierViewModel,
  options: DossierIndexabilityOptions = {},
) {
  return explainDossierIndexability(drug, dossier, options).decision
}
