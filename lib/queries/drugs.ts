// Reads and writes for the `drugs` table. Every public page server-renders from this file, so the
// shape of the queries here is the shape of the site's latency.
//
// Two habits run through it:
//  - Never `select()` with no argument. The generated `search_vector` column is a tsvector of the
//    whole record; it exists for the GIN index and nothing renders it, so `drugColumns` omits it
//    and every read stays roughly the size of the row a reader actually sees.
//  - One round trip per page section. Notes come back in the same pass as the drug, totals come
//    back in the same pass as the page of results.

import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  ilike,
  inArray,
  notInArray,
  or,
  sql,
} from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
import { db, type Db } from '@/db'
import {
  developmentProgrammes,
  drugAliases,
  drugs,
  medicineSlugRedirects,
  programmeCurrentPublications,
  programmeTrials,
  programmeVerdictScopeSnapshots,
} from '@/db/schema'
import { rowToDossier, type DrugRow } from '@/lib/dossier'
import { currentBackgroundDriftSummaries } from '@/lib/background/source-freshness'
import {
  cleanPublicLabelFields,
  PUBLIC_PLACEHOLDER_MEDICINE_NAMES,
  PUBLIC_PLACEHOLDER_MEDICINE_SLUGS,
} from '@/lib/public-data-integrity'
import {
  bindPublicSearchSummaries,
  type PublicSearchSummaryBinding,
} from '@/lib/queries/public-search-hit-projection'
import type { ApprovalStatus, DrugDossier, DrugModality } from '@/lib/types'
import {
  getCompletionAssessmentForDrug,
  getInventoryResolutionForDrug,
  getTrialRegistrationsForDrug,
} from './dossier-completion'
import { listNotesForDrug } from './notes'

/**
 * The transaction handle Drizzle hands a `db.transaction` callback. Derived from the callback's
 * own signature rather than spelled out with `PgTransaction<...>` generics, so it cannot drift
 * from the driver configuration in db/index.ts. Exported because every write path in
 * lib/queries/* needs to name it.
 */
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0]

/** Every drugs column except the generated tsvector. See the note at the top of the file. */
// Rest-sibling omit: `searchVector` is bound only so the spread can leave it behind.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { searchVector, ...drugColumns } = getTableColumns(drugs)

/** Rows with placeholder identities are retained internally for cleanup but never published. */
export const publicMedicineFilter = and(
  notInArray(drugs.slug, [...PUBLIC_PLACEHOLDER_MEDICINE_SLUGS]),
  notInArray(sql<string>`lower(btrim(${drugs.name}))`, [...PUBLIC_PLACEHOLDER_MEDICINE_NAMES]),
)

/**
 * Public collection surfaces must not rediscover an identity whose slug now redirects elsewhere.
 * Keep this separate from `publicMedicineFilter`: direct dossier and resolver lookups deliberately
 * retain those rows so the owner-curated redirect ledger can win and preserve the audit trail.
 */
export const publicMedicineDiscoveryFilter = and(
  publicMedicineFilter,
  sql<boolean>`not exists (
    select 1
    from ${medicineSlugRedirects}
    where ${medicineSlugRedirects.oldSlug} = ${drugs.slug}
  )`,
)

export type DossierDepth = DrugRow['dossierDepth']

/**
 * The lean projection for lists and search results: enough to render a result row and link to it,
 * and none of the jsonb. A search for a common word can match hundreds of records; sending the
 * full dossier payload for each is how a search box becomes a megabyte.
 */
export interface SearchHit {
  slug: string
  name: string
  tradeName: string | null
  modality: DrugModality
  approvalStatus: ApprovalStatus
  patientFriendlyIndication: string
  dossierDepth: DossierDepth
  summaryBinding?: PublicSearchSummaryBinding
  /** Plain scope label for the compact summary, selected by the same public projection. */
  summaryContext?: string | null
}

export const searchHitColumns = {
  slug: drugs.slug,
  name: drugs.name,
  tradeName: drugs.tradeName,
  modality: drugs.modality,
  approvalStatus: drugs.approvalStatus,
  patientFriendlyIndication: drugs.patientFriendlyIndication,
  dossierDepth: drugs.dossierDepth,
}

export const publicSearchHitReadColumns = {
  ...searchHitColumns,
  sourceLabelIndication: drugs.indication,
}

export function cleanPublicSearchHitRows(
  rows: ReadonlyArray<SearchHit & { sourceLabelIndication: string }>,
): SearchHit[] {
  return rows.map(({ sourceLabelIndication, ...row }) => ({
    ...row,
    patientFriendlyIndication: cleanPublicLabelFields({
      medicineSlug: row.slug,
      indication: sourceLabelIndication,
      patientFriendlyIndication: row.patientFriendlyIndication,
    }).patientFriendlyIndication,
  }))
}

/**
 * Curated records first, then the deepest-read ones. Used wherever a list has no better ordering
 * than "what is worth reading". The trailing slug keeps the order total, so page 2 of a paginated
 * list cannot repeat or skip a row that ties on every other key.
 */
const curationRank = sql`case ${drugs.dossierDepth} when 'flagship' then 0 when 'curated' then 1 else 2 end`

// ---------------------------------------------------------------------------
// Single record
// ---------------------------------------------------------------------------

/**
 * The dossier page's whole read: one query for the drug, one for its published notes. The notes
 * query resolves `hasUpvoted` for the viewer inside its own single statement (lib/queries/notes.ts)
 * — the naive version of that is a lookup per note, which is fine with three notes and quietly
 * fatal with three hundred.
 */
export async function getDrugBySlug(
  slug: string,
  viewerUserId?: string,
): Promise<DrugDossier | null> {
  const row = await getPublicDrugRowBySlug(slug)
  if (!row) return null

  const [notes, driftedSources, completionAssessment, inventoryResolution, trialRegistrations] =
    await Promise.all([
      listNotesForDrug(row.id, viewerUserId),
      currentBackgroundDriftSummaries({
        drugId: row.id,
        slug: row.slug,
        background: row.recordedBackground,
      }),
      getCompletionAssessmentForDrug(row.id),
      getInventoryResolutionForDrug(row.id),
      getTrialRegistrationsForDrug(row.id),
    ])
  return rowToDossier(row, {
    notes,
    driftedSources,
    completionAssessment: completionAssessment ?? undefined,
    inventoryResolution: inventoryResolution ?? undefined,
    trialRegistrations: trialRegistrations ?? undefined,
  })
}

async function getPublicDrugRowBySlug(slug: string): Promise<DrugRow | null> {
  const rows = await db
    .select(drugColumns)
    .from(drugs)
    .where(and(publicMedicineFilter, eq(drugs.slug, slug)))
    .limit(1)
  return rows[0] ?? null
}

/**
 * Anonymous public record read for metadata, social cards and other machine-facing surfaces.
 * Community-note vote state is viewer-specific, so those surfaces must not load it or vary by a
 * session cookie.
 */
export async function getPublicDrugBySlug(slug: string): Promise<DrugDossier | null> {
  const row = await getPublicDrugRowBySlug(slug)
  if (!row) return null
  const [driftedSources, completionAssessment, inventoryResolution, trialRegistrations] =
    await Promise.all([
      currentBackgroundDriftSummaries({
        drugId: row.id,
        slug: row.slug,
        background: row.recordedBackground,
      }),
      getCompletionAssessmentForDrug(row.id),
      getInventoryResolutionForDrug(row.id),
      getTrialRegistrationsForDrug(row.id),
    ])
  return rowToDossier(row, {
    driftedSources,
    completionAssessment: completionAssessment ?? undefined,
    inventoryResolution: inventoryResolution ?? undefined,
    trialRegistrations: trialRegistrations ?? undefined,
  })
}

/** Lean identity for generated social cards; avoids loading the dossier's JSONB sections. */
export async function getPublicMedicineNameBySlug(slug: string): Promise<string | null> {
  const rows = await db
    .select({ name: drugs.name })
    .from(drugs)
    .where(and(publicMedicineFilter, eq(drugs.slug, slug)))
    .limit(1)
  return rows[0]?.name ?? null
}

export interface PublicMedicineRouteResolution {
  canonicalSlug: string
  matchedBy: 'canonical' | 'case' | 'alias' | 'historical'
}

type DirectMedicineRouteResolution =
  { kind: 'resolved'; resolution: PublicMedicineRouteResolution } | { kind: 'missing' | 'invalid' }

const MAX_ALIAS_OWNER_CANDIDATES = 100

/** Resolve only a stored slug or its owner-curated terminal ledger target; never consult aliases. */
async function resolveDirectMedicineRoute(
  normalized: string,
  requestedSlug: string,
): Promise<DirectMedicineRouteResolution> {
  // Ledger existence is authoritative even when its target has since become nonpublic. Query the
  // mapping first, without a target visibility filter; otherwise a hidden target makes the join
  // disappear and the retained old row can incorrectly win the direct-slug fallback.
  const historicalRows = await db
    .select({ targetDrugId: medicineSlugRedirects.targetDrugId })
    .from(medicineSlugRedirects)
    .where(eq(medicineSlugRedirects.oldSlug, normalized))
    .limit(1)
  const historicalTargetId = historicalRows[0]?.targetDrugId
  if (historicalTargetId) {
    const targetRows = await db
      .select({ canonicalSlug: drugs.slug })
      .from(drugs)
      .where(and(publicMedicineFilter, eq(drugs.id, historicalTargetId)))
      .limit(1)
    const historical = targetRows[0]?.canonicalSlug
    if (!historical) return { kind: 'invalid' }
    if (historical === normalized) return { kind: 'invalid' }
    const chainedRows = await db
      .select({ oldSlug: medicineSlugRedirects.oldSlug })
      .from(medicineSlugRedirects)
      .where(eq(medicineSlugRedirects.oldSlug, historical))
      .limit(1)
    if (chainedRows[0]) return { kind: 'invalid' }
    return {
      kind: 'resolved',
      resolution: { canonicalSlug: historical, matchedBy: 'historical' },
    }
  }

  const directRows = await db
    .select({ slug: drugs.slug })
    .from(drugs)
    .where(and(publicMedicineFilter, sql`lower(${drugs.slug}) = ${normalized}`))
    .limit(1)
  const direct = directRows[0]?.slug
  if (!direct) return { kind: 'missing' }
  return {
    kind: 'resolved',
    resolution: {
      canonicalSlug: direct,
      matchedBy: direct === requestedSlug ? 'canonical' : 'case',
    },
  }
}

/**
 * Resolve one reader-facing medicine identity without exposing the internal primary key.
 *
 * An owner-curated historical mapping takes precedence even while an old audit row remains. After
 * that, exact and case-only slug matches win. A medicine alias is accepted only when every matching
 * owner resolves to one terminal public record; ambiguous aliases deliberately return null instead
 * of guessing which medical entity the reader meant.
 */
export async function resolvePublicMedicineRoute(
  requestedSlug: string,
): Promise<PublicMedicineRouteResolution | null> {
  const normalized = requestedSlug.trim().toLowerCase()
  if (!normalized) return null

  // Deliberate URL history wins over a still-retained identity row. This is what lets an owner
  // merge or rename a public record without deleting its audit data. Reject a target that is also
  // an old slug: canonical redirects must be one hop, and a bad ledger row must fail closed rather
  // than create a redirect chain or loop.
  const direct = await resolveDirectMedicineRoute(normalized, requestedSlug)
  if (direct.kind === 'resolved') return direct.resolution
  if (direct.kind === 'invalid') return null

  const aliasRows = await db
    .selectDistinct({ slug: drugs.slug })
    .from(drugAliases)
    .innerJoin(drugs, eq(drugAliases.drugId, drugs.id))
    .where(
      and(
        publicMedicineFilter,
        sql`trim(both '-' from regexp_replace(lower(${drugAliases.alias}), '[^a-z0-9]+', '-', 'g')) = ${normalized}`,
      ),
    )
    .orderBy(asc(drugs.slug))
    .limit(MAX_ALIAS_OWNER_CANDIDATES + 1)

  // Resolve every alias owner through the same terminal-ledger contract before deciding whether
  // the alias is unique. Two retained owners that both merge into one canonical medicine are one
  // destination; a chain, corrupt owner, oversized candidate set, or two terminal identities
  // fails closed instead of emitting an alias -> old slug -> target redirect chain.
  if (aliasRows.length === 0 || aliasRows.length > MAX_ALIAS_OWNER_CANDIDATES) return null
  const terminalSlugs = new Set<string>()
  for (const alias of aliasRows) {
    const terminal = await resolveDirectMedicineRoute(alias.slug.toLowerCase(), alias.slug)
    if (terminal.kind !== 'resolved') return null
    terminalSlugs.add(terminal.resolution.canonicalSlug)
    if (terminalSlugs.size > 1) return null
  }

  const canonicalSlug = terminalSlugs.values().next().value
  return typeof canonicalSlug === 'string' ? { canonicalSlug, matchedBy: 'alias' } : null
}

/** Internal-id lookup, for write paths that already hold a `drugs.id` (revision review). */
export async function getDrugById(id: string): Promise<DrugDossier | null> {
  const rows = await db.select(drugColumns).from(drugs).where(eq(drugs.id, id)).limit(1)
  const row = rows[0]
  return row ? rowToDossier(row) : null
}

/** Resolves a public slug to the internal primary key without loading the record. */
export async function getDrugIdBySlug(slug: string): Promise<string | null> {
  const rows = await db
    .select({ id: drugs.id })
    .from(drugs)
    .where(and(publicMedicineFilter, eq(drugs.slug, slug)))
    .limit(1)
  return rows[0]?.id ?? null
}

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

export interface ListDrugsOptions {
  limit: number
  offset: number
  modality?: DrugModality
  approvalStatus?: ApprovalStatus
  depth?: DossierDepth
  /** `curation` (default) reads best-first; `name` is alphabetical; `popular` is most-read first. */
  sort?: 'curation' | 'name' | 'popular'
}

export interface ListDrugsResult {
  items: DrugDossier[]
  total: number
}

/** Hard ceiling on a page size, so a hand-edited `?limit=100000` cannot ask for the whole table. */
const MAX_PAGE_SIZE = 100

/**
 * A page of records plus the total the filter matched.
 *
 * Returns whole dossiers, because the browse cards read the verdict, the pricing headline and the
 * audit counts — assembling those from a lean projection would mean a second query per card. The
 * page size is capped instead (`MAX_PAGE_SIZE`), and the genuinely lean paths, `searchDrugs` and
 * `getPopularDrugs`, exist for the places that only need a name and a link.
 */
export async function listDrugs(opts: ListDrugsOptions): Promise<ListDrugsResult> {
  const limit = Math.max(1, Math.min(MAX_PAGE_SIZE, Math.trunc(opts.limit)))
  const offset = Math.max(0, Math.trunc(opts.offset))

  const filters = [
    opts.modality ? eq(drugs.modality, opts.modality) : undefined,
    opts.approvalStatus ? eq(drugs.approvalStatus, opts.approvalStatus) : undefined,
    opts.depth ? eq(drugs.dossierDepth, opts.depth) : undefined,
  ].filter((f) => f !== undefined)
  const where =
    filters.length > 0
      ? and(publicMedicineDiscoveryFilter, ...filters)
      : publicMedicineDiscoveryFilter

  const order =
    opts.sort === 'name'
      ? [asc(drugs.name), asc(drugs.slug)]
      : opts.sort === 'popular'
        ? [desc(drugs.viewCount), asc(drugs.name), asc(drugs.slug)]
        : [curationRank, desc(drugs.viewCount), asc(drugs.name), asc(drugs.slug)]

  // `count(*) over ()` returns the pre-limit total on every row, so the list and its total cost
  // one round trip instead of two.
  const rows = await db
    .select({ ...drugColumns, total: sql<number>`count(*) over ()`.mapWith(Number) })
    .from(drugs)
    .where(where)
    .orderBy(...order)
    .limit(limit)
    .offset(offset)

  // The extra `total` property on each row is ignored by `rowToDossier`, which reads named fields.
  const items = rows.map((row) => rowToDossier(row))

  // The window function reports nothing when the page is empty, which happens for an offset past
  // the end of the result set. A page that renders "0 of 0" for a filter with 40 matches is a bug
  // a reader hits by clicking "next" once too often, so fall back to a real count.
  const total = rows[0]?.total ?? (offset > 0 ? await countDrugs(where) : 0)
  return { items, total }
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/**
 * Escapes the LIKE metacharacters so a query of `100%` searches for the literal text rather than
 * matching every row. Backslash is Postgres's default LIKE escape character.
 */
function likePrefixPattern(input: string): string {
  return `${input.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`
}

function likeContainsPattern(input: string): string {
  return `%${input.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`
}

/**
 * Full-text search with a prefix fallback.
 *
 * `websearch_to_tsquery` handles the phrases and negations a person actually types, and
 * `ts_rank_cd` ranks by how densely the matched lexemes cluster. On its own it answers nothing for
 * a partial word: `metf` is not a lexeme of `metformin`, so the tsquery matches zero rows and a
 * reader four keystrokes into a drug name sees "no results". The ILIKE prefix arm covers exactly
 * that case, and the ordering puts a name-prefix match above a body-text match — someone typing
 * `metf` wants the drug, not every dossier that mentions it.
 */
export async function searchDrugs(query: string, limit: number): Promise<SearchHit[]> {
  const trimmed = query.trim()
  if (trimmed.length === 0) return []
  const capped = Math.max(1, Math.min(MAX_PAGE_SIZE, Math.trunc(limit)))

  const tsQuery = sql`websearch_to_tsquery('english', ${trimmed})`
  const prefix = likePrefixPattern(trimmed)
  const contains = likeContainsPattern(trimmed)
  const lowered = trimmed.toLowerCase()

  // The alias join is what makes "paracetamol" find acetaminophen and "ozempic" find semaglutide.
  // EXISTS rather than a LEFT JOIN: a drug with twelve aliases must not come back twelve times,
  // and the planner can stop at the first matching alias instead of materialising all of them.
  // An exact alias and a name prefix share a tier on purpose, so the depth ordering below decides
  // between them. openFDA lists "Creatine" as an ingredient spelling on a product whose moiety
  // normalised to Creatine Gluconate; with the alias on its own higher tier, that stub outranked
  // the written Creatine Monohydrate dossier for the query "creatine". Ranking the two routes
  // together means a page someone wrote wins, which is what the reader wanted either way.
  //
  // Split deliberately. An EXACT alias hit means the reader typed another official name for this
  // substance — "paracetamol" for acetaminophen — and deserves to rank near an exact name match.
  // A PREFIX hit on an alias means far less: "creatine" prefix-matches the alias "Creatine
  // Leucine", and when both routes shared one tier that stub outranked the written Creatine
  // Monohydrate dossier. A prefix alias belongs with the other prefix matches.
  const aliasExact = sql`exists (
    select 1 from ${drugAliases}
    where ${drugAliases.drugId} = ${drugs.id} and lower(${drugAliases.alias}) = ${lowered}
  )`
  const aliasPrefix = sql`exists (
    select 1 from ${drugAliases}
    where ${drugAliases.drugId} = ${drugs.id} and lower(${drugAliases.alias}) like ${prefix.toLowerCase()}
  )`
  const programmeMatch = sql`exists (
    select 1 from ${developmentProgrammes}
    where ${developmentProgrammes.drugId} = ${drugs.id}
      and (
        ${developmentProgrammes.title} ilike ${contains}
        or ${developmentProgrammes.indication} ilike ${contains}
        or ${developmentProgrammes.targetPopulation} ilike ${contains}
        or ${developmentProgrammes.sponsor} ilike ${contains}
      )
  )`
  const trialMatch = sql`exists (
    select 1 from ${programmeTrials}
    inner join ${developmentProgrammes}
      on ${developmentProgrammes.id} = ${programmeTrials.programmeId}
    where ${developmentProgrammes.drugId} = ${drugs.id}
      and ${programmeTrials.trialIdentifier} ilike ${prefix}
  )`

  const hits = await db
    .select(publicSearchHitReadColumns)
    .from(drugs)
    .where(
      and(
        publicMedicineDiscoveryFilter,
        or(
          sql`${drugs.searchVector} @@ ${tsQuery}`,
          ilike(drugs.name, prefix),
          ilike(drugs.tradeName, prefix),
          aliasPrefix,
          programmeMatch,
          trialMatch,
        ),
      ),
    )
    .orderBy(
      // Exact name first. Without this tier, typing "creatine" ranks Creatine Gluconate level with
      // Creatine, because both satisfy the prefix test, and the substance the reader asked for is
      // buried among its own derivatives.
      sql`case
        when lower(${drugs.name}) = ${lowered} then 0
        when lower(${drugs.tradeName}) = ${lowered} then 1
        when ${aliasExact} then 2
        when ${drugs.name} ilike ${prefix} then 2
        when ${drugs.tradeName} ilike ${prefix} then 3
        when ${aliasPrefix} then 4
        when ${trialMatch} then 5
        when ${programmeMatch} then 6
        else 7
      end`,
      // Among equally-ranked matches, a page with content beats a shorter name. Typing "creatine"
      // was returning Creatine-Leucine and Creatine Gluconate — ingested stubs that happen to be
      // short — ahead of the written Creatine Monohydrate dossier. A reader searching a substance
      // wants the page someone wrote about it.
      sql`case ${drugs.dossierDepth} when 'flagship' then 0 when 'curated' then 1 else 2 end`,
      // Then the shorter name, which is the more general substance: "Vitamin D" before
      // "Vitamin D (Ergocalciferol)".
      sql`length(${drugs.name})`,
      sql`ts_rank_cd(${drugs.searchVector}, ${tsQuery}) desc`,
      desc(drugs.viewCount),
      asc(drugs.name),
      asc(drugs.slug),
    )
    .limit(capped)

  return bindPublicSearchSummaries(cleanPublicSearchHitRows(hits))
}

// ---------------------------------------------------------------------------
// Home page
// ---------------------------------------------------------------------------

/**
 * The spotlight record. Flagship with the most reads, else any flagship, else the most-read
 * curated record — all three preferences expressed as one ordering, so it is one query.
 *
 * Stubs are excluded by the filter, not by a check afterwards: the home page's most prominent card
 * must never be an ingested name with an empty body.
 */
export async function getFeaturedDrug(): Promise<DrugDossier | null> {
  const rows = await db
    .select(drugColumns)
    .from(drugs)
    .where(and(publicMedicineDiscoveryFilter, inArray(drugs.dossierDepth, ['flagship', 'curated'])))
    .orderBy(curationRank, desc(drugs.viewCount), asc(drugs.name), asc(drugs.slug))
    .limit(1)

  const row = rows[0]
  return row ? rowToDossier(row) : null
}

/** The "Popular:" row under the search box. Curated records only — a stub is not worth a click. */
export async function getPopularDrugs(limit: number): Promise<SearchHit[]> {
  const capped = Math.max(1, Math.min(MAX_PAGE_SIZE, Math.trunc(limit)))
  const hits = await db
    .select(publicSearchHitReadColumns)
    .from(drugs)
    .where(and(publicMedicineDiscoveryFilter, inArray(drugs.dossierDepth, ['flagship', 'curated'])))
    .orderBy(desc(drugs.viewCount), asc(drugs.name), asc(drugs.slug))
    .limit(capped)
  return bindPublicSearchSummaries(cleanPublicSearchHitRows(hits))
}

/** Honest programme coverage counts for restrained corpus copy on the home page. */
export async function countProgrammeEvidence(): Promise<{
  programmes: number
  reviewedProgrammes: number
}> {
  // Published programmes belong to the medicine captured in their immutable reviewed scope, even
  // if somebody later moves the live staging row. Unpublished programmes still use their current
  // live owner. The same discovery predicate then excludes placeholders and redirect sources from
  // both headline counts.
  const effectiveMedicineId = sql<string>`coalesce(
    ${programmeVerdictScopeSnapshots.drugId},
    ${developmentProgrammes.drugId}
  )`
  const rows = await db
    .select({
      programmes: count(developmentProgrammes.id),
      reviewedProgrammes: count(programmeVerdictScopeSnapshots.verdictRevisionId),
    })
    .from(developmentProgrammes)
    .leftJoin(
      programmeCurrentPublications,
      eq(programmeCurrentPublications.programmeId, developmentProgrammes.id),
    )
    .leftJoin(
      programmeVerdictScopeSnapshots,
      and(
        eq(
          programmeVerdictScopeSnapshots.verdictRevisionId,
          programmeCurrentPublications.verdictRevisionId,
        ),
        eq(programmeVerdictScopeSnapshots.programmeId, developmentProgrammes.id),
      ),
    )
    .innerJoin(drugs, eq(drugs.id, effectiveMedicineId))
    .where(publicMedicineDiscoveryFilter)

  return {
    programmes: rows[0]?.programmes ?? 0,
    reviewedProgrammes: rows[0]?.reviewedProgrammes ?? 0,
  }
}

// ---------------------------------------------------------------------------
// Counters
// ---------------------------------------------------------------------------

/**
 * Records one page view. Deliberately swallows its own failure: a view counter is the least
 * important thing on the page, and a dead connection or a lock timeout must not turn a readable
 * dossier into an error screen. Callers can safely `void incrementViewCount(slug)`.
 *
 * `updated_at` is untouched on purpose — being read is not being edited, and the revision history
 * would otherwise show a change nobody made.
 */
export async function incrementViewCount(slug: string): Promise<void> {
  try {
    await db
      .update(drugs)
      .set({ viewCount: sql`${drugs.viewCount} + 1` })
      .where(eq(drugs.slug, slug))
  } catch (error) {
    console.warn('[queries/drugs] view count increment failed for %s:', slug, error)
  }
}

/** Real `count(*)`, for the home page's corpus statistics. Nothing here is a stored estimate. */
export async function countDrugs(where?: SQL): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(drugs)
    .where(where ? and(publicMedicineDiscoveryFilter, where) : publicMedicineDiscoveryFilter)
  return rows[0]?.value ?? 0
}

export type DepthCounts = Record<NonNullable<DossierDepth>, number>

/** Records per curation depth, in one grouped query. Absent groups are zero, never omitted. */
export async function countByDepth(): Promise<DepthCounts> {
  const rows = await db
    .select({ depth: drugs.dossierDepth, value: count() })
    .from(drugs)
    .where(publicMedicineDiscoveryFilter)
    .groupBy(drugs.dossierDepth)

  const counts: DepthCounts = { stub: 0, curated: 0, flagship: 0 }
  for (const row of rows) counts[row.depth] = row.value
  return counts
}
