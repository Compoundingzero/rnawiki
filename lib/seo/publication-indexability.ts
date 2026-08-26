import { and, eq, getTableColumns, sql } from 'drizzle-orm'

import { db } from '@/db'
import {
  drugs,
  developmentProgrammes,
  medicineSlugRedirects,
  programmeCurrentPublications,
  programmeFreshnessStates,
  programmeVerdictReviews,
  programmeVerdictRevisions,
  programmeVerdictScopeSnapshots,
  programmeVerdictSourceMetadataSnapshots,
} from '@/db/schema'
import { rowToDossier, type DrugRow } from '@/lib/dossier'
import type { SourceFreshnessStatus } from '@/lib/evidence/types'
import { legacyMedicineDossierView } from '@/lib/medicine-dossier-view-model'
import { publicMedicineFilter } from '@/lib/queries/drugs'
import { explainDossierIndexability } from '@/lib/seo/dossier-indexability'
import { aggregatePublicContentFreshness, type PublicContentFreshness } from '@/lib/seo/freshness'
import {
  explainMedicineIndexability,
  type MedicineIndexabilityDecision,
  type MedicineIndexabilityIssue,
} from '@/lib/seo/indexability'

export interface MedicineIdentityIndexingRow {
  medicineId: string
  medicineName: string
  canonicalSlug: string
  isRedirectSource: boolean
}

export interface CurrentPublicationIndexingRow {
  medicineId: string
  programmeId: string
  programmeTitle: string
  reviewStatus: string | null
  publishedAt: Date | null
  reviewedAt: Date | null
  publicLabel: string | null
  plainMechanism: string | null
  bestSupportedFinding: string | null
  mainLimitation: string | null
  sourceCount: number
  independentReviewCount: number
}

export interface ProgrammeFreshnessIndexingRow {
  programmeId: string
  freshnessStatus: SourceFreshnessStatus
  nextCheckDueAt: Date | null
}

export interface MedicinePublicationIndexabilityReport {
  medicineId: string
  medicineName: string
  canonicalSlug: string
  selectedProgrammeId: string | null
  freshness: PublicContentFreshness
  decision: MedicineIndexabilityDecision
  issues: MedicineIndexabilityIssue[]
}

export interface LegacyFlagshipIndexingRow {
  medicineId: string
  drug: ReturnType<typeof rowToDossier>
  isRedirectSource: boolean
  /** Any normalized programme changes the canonical route away from `legacy_record`. */
  hasAnyProgramme: boolean
}

/**
 * The sitemap can add only the finite flagship compatibility corpus. Stub and curated imports are
 * not accepted here even if a caller accidentally supplies one: the shared pure policy repeats
 * the depth check and reports why it failed.
 */
export function buildLegacyFlagshipIndexabilityReports(
  rows: readonly LegacyFlagshipIndexingRow[],
  evaluatedAt: Date = new Date(),
): MedicinePublicationIndexabilityReport[] {
  return [...rows]
    .sort((left, right) => left.drug.id.localeCompare(right.drug.id))
    .map(({ medicineId, drug, isRedirectSource, hasAnyProgramme }) => {
      const legacyDossier = legacyMedicineDossierView(drug)
      const routeDossier = hasAnyProgramme
        ? { ...legacyDossier, bindingState: 'programme_unpublished' as const }
        : legacyDossier
      const report = explainDossierIndexability(drug, routeDossier, {
        isRedirectSource,
        evaluatedAt,
      })

      return {
        medicineId,
        medicineName: drug.name,
        canonicalSlug: drug.id,
        selectedProgrammeId: null,
        freshness: 'unknown',
        ...report,
      }
    })
}

function dateMillis(value: Date | null): number | null {
  if (!(value instanceof Date)) return null
  const millis = value.getTime()
  return Number.isFinite(millis) ? millis : null
}

/** The same default-programme order used by the canonical dossier query. */
function compareCurrentPublications(
  left: CurrentPublicationIndexingRow,
  right: CurrentPublicationIndexingRow,
): number {
  const leftPublishedAt = dateMillis(left.publishedAt)
  const rightPublishedAt = dateMillis(right.publishedAt)
  if (leftPublishedAt === null && rightPublishedAt !== null) return 1
  if (leftPublishedAt !== null && rightPublishedAt === null) return -1
  if (
    leftPublishedAt !== null &&
    rightPublishedAt !== null &&
    leftPublishedAt !== rightPublishedAt
  ) {
    return rightPublishedAt - leftPublishedAt
  }
  if (left.programmeId < right.programmeId) return -1
  if (left.programmeId > right.programmeId) return 1
  return 0
}

/**
 * Build the shared publication report from safe projections. `medicineId` is deliberately separate
 * from `canonicalSlug`: internal identity changes must never leak into a public URL.
 */
export function buildMedicinePublicationIndexabilityReports(
  medicineRows: readonly MedicineIdentityIndexingRow[],
  publicationRows: readonly CurrentPublicationIndexingRow[],
  freshnessRows: readonly ProgrammeFreshnessIndexingRow[],
  evaluatedAt: Date,
): MedicinePublicationIndexabilityReport[] {
  const publicationsByMedicine = new Map<string, CurrentPublicationIndexingRow[]>()
  for (const publication of publicationRows) {
    const rows = publicationsByMedicine.get(publication.medicineId) ?? []
    rows.push(publication)
    publicationsByMedicine.set(publication.medicineId, rows)
  }

  const freshnessByProgramme = new Map<string, ProgrammeFreshnessIndexingRow[]>()
  for (const freshness of freshnessRows) {
    const rows = freshnessByProgramme.get(freshness.programmeId) ?? []
    rows.push(freshness)
    freshnessByProgramme.set(freshness.programmeId, rows)
  }

  return [...medicineRows]
    .sort((left, right) => left.canonicalSlug.localeCompare(right.canonicalSlug))
    .map((medicine) => {
      const selectedPublication = [...(publicationsByMedicine.get(medicine.medicineId) ?? [])].sort(
        compareCurrentPublications,
      )[0]
      const freshness = selectedPublication
        ? aggregatePublicContentFreshness(
            freshnessByProgramme.get(selectedPublication.programmeId) ?? [],
            evaluatedAt,
          )
        : 'unknown'
      const report = explainMedicineIndexability({
        canonicalSlug: medicine.canonicalSlug,
        isRedirectSource: medicine.isRedirectSource,
        publication: selectedPublication
          ? {
              reviewStatus: selectedPublication.reviewStatus,
              publishedAt: selectedPublication.publishedAt,
              reviewedAt: selectedPublication.reviewedAt,
              publicLabel: selectedPublication.publicLabel,
              plainMechanism: selectedPublication.plainMechanism,
              bestSupportedFinding: selectedPublication.bestSupportedFinding,
              mainLimitation: selectedPublication.mainLimitation,
              sourceCount: selectedPublication.sourceCount,
              independentReviewCount: selectedPublication.independentReviewCount,
              freshness,
            }
          : null,
      })

      return {
        medicineId: medicine.medicineId,
        medicineName: medicine.medicineName,
        canonicalSlug: medicine.canonicalSlug,
        selectedProgrammeId: selectedPublication?.programmeId ?? null,
        freshness,
        ...report,
      }
    })
}

/** Load the editor/sitemap projection without selecting legacy dossier JSONB or unsafe fields. */
export async function loadMedicinePublicationIndexabilityReports(
  evaluatedAt = new Date(),
): Promise<MedicinePublicationIndexabilityReport[]> {
  const sourceCount = sql<number>`(
    select count(*)
    from ${programmeVerdictSourceMetadataSnapshots}
    where ${programmeVerdictSourceMetadataSnapshots.verdictRevisionId} = ${programmeVerdictRevisions.id}
  )`.mapWith(Number)
  const independentReviewCount = sql<number>`(
    select count(distinct ${programmeVerdictReviews.reviewerUserId})
    from ${programmeVerdictReviews}
    where ${programmeVerdictReviews.verdictRevisionId} = ${programmeVerdictRevisions.id}
      and ${programmeVerdictReviews.isIndependent} = true
  )`.mapWith(Number)
  const isRedirectSource = sql<boolean>`exists(
    select 1
    from ${medicineSlugRedirects}
    where ${medicineSlugRedirects.oldSlug} = ${drugs.slug}
  )`

  const [medicineRows, publicationRows, freshnessRows] = await Promise.all([
    db
      .select({
        medicineId: drugs.id,
        medicineName: drugs.name,
        canonicalSlug: drugs.slug,
        isRedirectSource,
      })
      .from(drugs)
      .where(publicMedicineFilter),
    db
      .select({
        medicineId: programmeVerdictScopeSnapshots.drugId,
        programmeId: programmeVerdictScopeSnapshots.programmeId,
        programmeTitle: programmeVerdictScopeSnapshots.title,
        reviewStatus: programmeVerdictRevisions.reviewStatus,
        publishedAt: programmeCurrentPublications.publishedAt,
        reviewedAt: programmeVerdictRevisions.reviewedAt,
        publicLabel: programmeVerdictRevisions.publicLabel,
        plainMechanism: programmeVerdictRevisions.plainMechanism,
        bestSupportedFinding: programmeVerdictRevisions.bestSupportedFinding,
        mainLimitation: programmeVerdictRevisions.mainLimitation,
        sourceCount,
        independentReviewCount,
      })
      .from(programmeCurrentPublications)
      .innerJoin(
        programmeVerdictRevisions,
        and(
          eq(programmeVerdictRevisions.id, programmeCurrentPublications.verdictRevisionId),
          eq(programmeVerdictRevisions.programmeId, programmeCurrentPublications.programmeId),
        ),
      )
      .innerJoin(
        programmeVerdictScopeSnapshots,
        and(
          eq(
            programmeVerdictScopeSnapshots.verdictRevisionId,
            programmeCurrentPublications.verdictRevisionId,
          ),
          eq(programmeVerdictScopeSnapshots.programmeId, programmeCurrentPublications.programmeId),
        ),
      )
      .innerJoin(drugs, eq(drugs.id, programmeVerdictScopeSnapshots.drugId))
      .where(publicMedicineFilter),
    db
      .select({
        programmeId: programmeFreshnessStates.programmeId,
        freshnessStatus: programmeFreshnessStates.freshnessStatus,
        nextCheckDueAt: programmeFreshnessStates.nextCheckDueAt,
      })
      .from(programmeFreshnessStates)
      .innerJoin(
        programmeCurrentPublications,
        eq(programmeCurrentPublications.programmeId, programmeFreshnessStates.programmeId),
      )
      .innerJoin(
        programmeVerdictScopeSnapshots,
        and(
          eq(
            programmeVerdictScopeSnapshots.verdictRevisionId,
            programmeCurrentPublications.verdictRevisionId,
          ),
          eq(programmeVerdictScopeSnapshots.programmeId, programmeFreshnessStates.programmeId),
        ),
      )
      .innerJoin(drugs, eq(drugs.id, programmeVerdictScopeSnapshots.drugId))
      .where(publicMedicineFilter),
  ])

  return buildMedicinePublicationIndexabilityReports(
    medicineRows,
    publicationRows,
    freshnessRows,
    evaluatedAt,
  )
}

/**
 * Load only full flagship JSONB records for the legacy compatibility path. The 9,000+ imported
 * stub/curated rows are never materialized here; their identity-only presence cannot make them
 * search eligible.
 */
export async function loadLegacyFlagshipIndexabilityReports(
  evaluatedAt = new Date(),
): Promise<MedicinePublicationIndexabilityReport[]> {
  // Rest-sibling omit keeps the generated tsvector server-side while retaining the exact legacy
  // evidence surface needed to recompute the approved v2 answer fingerprint.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { searchVector, ...legacyFlagshipDrugColumns } = getTableColumns(drugs)
  const isRedirectSource = sql<boolean>`exists(
    select 1
    from ${medicineSlugRedirects}
    where ${medicineSlugRedirects.oldSlug} = ${drugs.slug}
  )`
  const hasAnyProgramme = sql<boolean>`exists(
    select 1
    from ${developmentProgrammes}
    where ${developmentProgrammes.drugId} = ${drugs.id}
  )`

  const rows = await db
    .select({
      ...legacyFlagshipDrugColumns,
      isRedirectSource,
      hasAnyProgramme,
    })
    .from(drugs)
    .where(and(publicMedicineFilter, eq(drugs.dossierDepth, 'flagship')))

  return buildLegacyFlagshipIndexabilityReports(
    rows.map(({ isRedirectSource: redirect, hasAnyProgramme: programme, ...row }) => ({
      medicineId: row.id,
      drug: rowToDossier(row as DrugRow),
      isRedirectSource: redirect,
      hasAnyProgramme: programme,
    })),
    evaluatedAt,
  )
}

/** Shared sitemap projection: current publications plus only the bound flagship legacy cohort. */
export async function loadMedicineSitemapIndexabilityReports(
  evaluatedAt = new Date(),
): Promise<MedicinePublicationIndexabilityReport[]> {
  const [publicationReports, legacyReports] = await Promise.all([
    loadMedicinePublicationIndexabilityReports(evaluatedAt),
    loadLegacyFlagshipIndexabilityReports(evaluatedAt),
  ])

  // Identity-only rows have no chance of entering the sitemap and need not be retained in memory.
  // Flagships with any normalized programme are present in `legacyReports` only as an auditable
  // noindex decision, so an incomplete programme can never fall back to a legacy search result.
  return [
    ...publicationReports.filter((report) => report.selectedProgrammeId !== null),
    ...legacyReports,
  ]
}
