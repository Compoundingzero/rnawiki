import { and, eq, getTableColumns, sql } from 'drizzle-orm'

import { db } from '@/db'
import {
  dossierCompletionAssessments,
  drugs,
  developmentProgrammes,
  inventoryResolutions,
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
import type { InventoryResolutionState } from '@/lib/inventory/types'
import { publicMedicineFilter } from '@/lib/queries/drugs'
import { explainDossierIndexability } from '@/lib/seo/dossier-indexability'
import { aggregatePublicContentFreshness, type PublicContentFreshness } from '@/lib/seo/freshness'
import {
  explainMedicineIndexability,
  type CanonicalRecordIndexingInput,
  type MedicineIndexabilityDecision,
  type MedicineIndexabilityIssue,
} from '@/lib/seo/indexability'

export interface MedicineIdentityIndexingRow {
  medicineId: string
  medicineName: string
  canonicalSlug: string
  isRedirectSource: boolean
  /** Scalar identity/completeness projection, when the caller read it alongside the identity. */
  canonicalRecord?: CanonicalRecordIndexingInput | null
}

/** The XML sitemap protocol allows at most this many URLs in one sitemap file. */
export const SITEMAP_MAX_URLS = 50_000

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
  canonicalRecord?: CanonicalRecordIndexingInput | null
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
    .map(({ medicineId, drug, isRedirectSource, hasAnyProgramme, canonicalRecord }) => {
      const legacyDossier = legacyMedicineDossierView(drug)
      const routeDossier = hasAnyProgramme
        ? { ...legacyDossier, bindingState: 'programme_unpublished' as const }
        : legacyDossier
      const report = explainDossierIndexability(drug, routeDossier, {
        isRedirectSource,
        evaluatedAt,
        ...(canonicalRecord === undefined ? {} : { canonicalRecord }),
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

export interface CanonicalRecordIndexingRow {
  medicineId: string
  medicineName: string
  canonicalSlug: string
  isRedirectSource: boolean
  resolutionStatus: InventoryResolutionState | null
  assessmentStatus: 'COMPLETE' | 'INCOMPLETE' | null
  contentChangedAt: Date | null
  applicableSectionCount: number | null
  terminalSectionCount: number | null
}

/** Build the scalar policy input. A row with no inventory resolution is not offered the path. */
export function toCanonicalRecordInput(
  row: Pick<
    CanonicalRecordIndexingRow,
    | 'resolutionStatus'
    | 'assessmentStatus'
    | 'contentChangedAt'
    | 'applicableSectionCount'
    | 'terminalSectionCount'
  >,
): CanonicalRecordIndexingInput | null {
  if (row.resolutionStatus === null) return null
  return {
    resolutionStatus: row.resolutionStatus,
    assessmentStatus: row.assessmentStatus,
    contentChangedAt: row.contentChangedAt,
    applicableSectionCount: row.applicableSectionCount ?? 0,
    terminalSectionCount: row.terminalSectionCount ?? 0,
  }
}

/**
 * Reports for the canonical-record path. These rows carry no publication and no legacy answer, so
 * the shared policy either admits the record on its resolved identity and stated section states or
 * reports exactly which of those two is missing.
 */
export function buildCanonicalRecordIndexabilityReports(
  rows: readonly CanonicalRecordIndexingRow[],
): MedicinePublicationIndexabilityReport[] {
  return [...rows]
    .sort((left, right) => left.canonicalSlug.localeCompare(right.canonicalSlug))
    .map((row) => {
      const report = explainMedicineIndexability({
        canonicalSlug: row.canonicalSlug,
        isRedirectSource: row.isRedirectSource,
        publication: null,
        canonicalRecord: toCanonicalRecordInput(row),
      })
      return {
        medicineId: row.medicineId,
        medicineName: row.medicineName,
        canonicalSlug: row.canonicalSlug,
        selectedProgrammeId: null,
        freshness: 'unknown' as const,
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
        canonicalRecord: medicine.canonicalRecord ?? null,
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

/**
 * The only completeness columns any discovery surface reads. Section prose, source refs and the
 * resolver's evidence arrays are JSONB and stay in the database: a search decision is made from
 * identity and counts, never from what a section says.
 */
const CANONICAL_RECORD_COLUMNS = {
  resolutionStatus: inventoryResolutions.resolutionStatus,
  assessmentStatus: dossierCompletionAssessments.status,
  contentChangedAt: dossierCompletionAssessments.contentChangedAt,
  applicableSectionCount: dossierCompletionAssessments.applicableSectionCount,
  terminalSectionCount: dossierCompletionAssessments.terminalSectionCount,
} as const

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

  const [identityRows, publicationRows, freshnessRows] = await Promise.all([
    db
      .select({
        medicineId: drugs.id,
        medicineName: drugs.name,
        canonicalSlug: drugs.slug,
        isRedirectSource,
        ...CANONICAL_RECORD_COLUMNS,
      })
      .from(drugs)
      .leftJoin(inventoryResolutions, eq(inventoryResolutions.drugId, drugs.id))
      .leftJoin(dossierCompletionAssessments, eq(dossierCompletionAssessments.drugId, drugs.id))
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

  const medicineRows: MedicineIdentityIndexingRow[] = identityRows.map((row) => ({
    medicineId: row.medicineId,
    medicineName: row.medicineName,
    canonicalSlug: row.canonicalSlug,
    isRedirectSource: row.isRedirectSource,
    canonicalRecord: toCanonicalRecordInput(row),
  }))

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
      ...CANONICAL_RECORD_COLUMNS,
    })
    .from(drugs)
    .leftJoin(inventoryResolutions, eq(inventoryResolutions.drugId, drugs.id))
    .leftJoin(dossierCompletionAssessments, eq(dossierCompletionAssessments.drugId, drugs.id))
    .where(and(publicMedicineFilter, eq(drugs.dossierDepth, 'flagship')))

  return buildLegacyFlagshipIndexabilityReports(
    rows.map(
      ({
        isRedirectSource: redirect,
        hasAnyProgramme: programme,
        resolutionStatus,
        assessmentStatus,
        contentChangedAt,
        applicableSectionCount,
        terminalSectionCount,
        ...row
      }) => ({
        medicineId: row.id,
        drug: rowToDossier(row as DrugRow),
        isRedirectSource: redirect,
        hasAnyProgramme: programme,
        canonicalRecord: toCanonicalRecordInput({
          resolutionStatus,
          assessmentStatus,
          contentChangedAt,
          applicableSectionCount,
          terminalSectionCount,
        }),
      }),
    ),
    evaluatedAt,
  )
}

/**
 * Load the canonical-record path from scalar columns only. Every public medicine identity is read,
 * including the ones the shared policy will exclude, so the projection stays auditable and a
 * duplicate, redirected or unassessed row is visibly refused rather than silently absent.
 */
export async function loadCanonicalRecordIndexabilityReports(): Promise<
  MedicinePublicationIndexabilityReport[]
> {
  const isRedirectSource = sql<boolean>`exists(
    select 1
    from ${medicineSlugRedirects}
    where ${medicineSlugRedirects.oldSlug} = ${drugs.slug}
  )`

  const rows = await db
    .select({
      medicineId: drugs.id,
      medicineName: drugs.name,
      canonicalSlug: drugs.slug,
      isRedirectSource,
      ...CANONICAL_RECORD_COLUMNS,
    })
    .from(drugs)
    .leftJoin(inventoryResolutions, eq(inventoryResolutions.drugId, drugs.id))
    .leftJoin(dossierCompletionAssessments, eq(dossierCompletionAssessments.drugId, drugs.id))
    .where(publicMedicineFilter)

  return buildCanonicalRecordIndexabilityReports(rows)
}

/**
 * Merge the three report sets into exactly one report per medicine. A medicine with a current
 * publication is described by its publication report, a flagship without one by its legacy report,
 * and everything else by its canonical-record report. All three sets are built from the same pure
 * policy with the same canonical-record projection, so the winning report cannot disagree with a
 * losing one about whether the URL may be indexed.
 */
export function mergeMedicineSitemapReports(
  publicationReports: readonly MedicinePublicationIndexabilityReport[],
  legacyReports: readonly MedicinePublicationIndexabilityReport[],
  canonicalRecordReports: readonly MedicinePublicationIndexabilityReport[],
): MedicinePublicationIndexabilityReport[] {
  const merged = new Map<string, MedicinePublicationIndexabilityReport>()
  for (const report of publicationReports) {
    if (report.selectedProgrammeId === null) continue
    merged.set(report.medicineId, report)
  }
  for (const report of [...legacyReports, ...canonicalRecordReports]) {
    if (merged.has(report.medicineId)) continue
    merged.set(report.medicineId, report)
  }
  return [...merged.values()].sort((left, right) =>
    left.canonicalSlug.localeCompare(right.canonicalSlug),
  )
}

/** Shared sitemap projection: current publications, the bound flagship cohort, canonical records. */
export async function loadMedicineSitemapIndexabilityReports(
  evaluatedAt = new Date(),
): Promise<MedicinePublicationIndexabilityReport[]> {
  const [publicationReports, legacyReports, canonicalRecordReports] = await Promise.all([
    loadMedicinePublicationIndexabilityReports(evaluatedAt),
    loadLegacyFlagshipIndexabilityReports(evaluatedAt),
    loadCanonicalRecordIndexabilityReports(),
  ])

  return mergeMedicineSitemapReports(publicationReports, legacyReports, canonicalRecordReports)
}
