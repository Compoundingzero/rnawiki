import { createHash } from 'node:crypto'

import { isPlaceholderMedicineIdentity } from '@/lib/public-data-integrity'
import { slugify } from '@/lib/ids'
import { stableJsonStringify } from '@/lib/stable-json'
import { baseMoiety, titleCaseDrugName } from '@/scripts/ingest/normalise'

import { classifyEntity } from './entity-class'
import {
  ATTRIBUTION_WARNING_CODES,
  ENTITY_CLASSES,
  INVENTORY_RESOLUTION_STATES,
  INVENTORY_RESOLVER_VERSION,
  type AttributionWarning,
  type AttributionWarningCode,
  type EntityClass,
  type IdentitySource,
  type InventoryResolution,
  type InventoryResolutionState,
  type InventoryResolutionSummary,
} from './types'

/**
 * The pure inventory resolver.
 *
 * Merges use exactly one kind of evidence: two records whose names are identical once every
 * non-alphanumeric character is removed. That is the only automatic identity claim this project
 * makes, because it is the only one that is true by construction. A shared registry identifier is
 * recorded as a warning and nothing more: the transcribed tier matched several identifiers by name,
 * and the corpus holds salt/parent pairs, biosimilar suffix families and combination/ingredient
 * pairs that share an identifier while being different marketed things. Salts, hydrates,
 * stereoisomers, metabolites, formulations, combinations, brands, botanical preparations,
 * organisms, biologics, vaccines and RNA constructs are therefore never merged here.
 *
 * `ALIAS_OF_CANONICAL_ENTITY` is reserved for a row whose recorded name the owner-curated identity
 * ledger confirms as an alias of another row. Version 1 never assigns it on its own, so the count is
 * zero unless a ledger row says otherwise.
 */

export interface InventoryRowInput {
  id: string
  slug: string
  name: string
  tradeName: string | null
  dossierDepth: 'stub' | 'curated' | 'flagship'
  modality: string
  approvalStatus: string
  aliases: ReadonlyArray<{ alias: string; kind: string }>
  /** Module keys of the recorded-background envelope, sorted. */
  backgroundModules: readonly string[]
  compositionIngredientCount: number
  registryIdentifiers: Partial<
    Record<'pubchemCid' | 'casNumber' | 'unii' | 'rxcui' | 'ncbiTaxonomyId', string>
  >
  biologicalIdentityTaxonomyId: string | null
  supplementIngredientGroupId: string | null
  fdaApplicationNumber: string | null
  sampleProductNdcs: readonly string[]
  sampleLabelSetIds: readonly string[]
}

export interface RedirectLedgerRow {
  oldSlug: string
  targetDrugId: string
  reason: string
  /** Owner rationale. Rows this resolver wrote start with its own version string. */
  rationale?: string
}

/** A ledger row the resolver itself wrote is evidence of a duplicate, not an owner decision. */
function isResolverAuthoredLedgerRow(entry: RedirectLedgerRow): boolean {
  return typeof entry.rationale === 'string' && entry.rationale.startsWith('inventory-resolution/')
}

export interface InventoryResolutionResult {
  resolutions: InventoryResolution[]
  summary: InventoryResolutionSummary
}

const SLUG_SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u
const DEPTH_RANK: Record<InventoryRowInput['dossierDepth'], number> = {
  flagship: 3,
  curated: 2,
  stub: 1,
}

/** The one merge key: the recorded name with every non-alphanumeric character removed. */
export function exactNameKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/gu, '')
}

function aliasSlug(alias: string): string {
  return alias
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function contentDigest(row: InventoryRowInput): string {
  return sha256(stableJsonStringify(row))
}

function identitySources(row: InventoryRowInput): IdentitySource[] {
  const sources: IdentitySource[] = []
  const registry = row.registryIdentifiers
  if (registry.unii) {
    sources.push({ kind: 'UNII', identifier: registry.unii, path: 'recordedBackground.registryIdentifiers.unii' })
  }
  if (registry.casNumber) {
    sources.push({ kind: 'CAS', identifier: registry.casNumber, path: 'recordedBackground.registryIdentifiers.casNumber' })
  }
  if (registry.pubchemCid) {
    sources.push({ kind: 'PUBCHEM_CID', identifier: registry.pubchemCid, path: 'recordedBackground.registryIdentifiers.pubchemCid' })
  }
  if (registry.rxcui) {
    sources.push({ kind: 'RXCUI', identifier: registry.rxcui, path: 'recordedBackground.registryIdentifiers.rxcui' })
  }
  const taxonomy = registry.ncbiTaxonomyId ?? row.biologicalIdentityTaxonomyId
  if (taxonomy) {
    sources.push({
      kind: 'NCBI_TAXONOMY',
      identifier: taxonomy,
      path: registry.ncbiTaxonomyId
        ? 'recordedBackground.registryIdentifiers.ncbiTaxonomyId'
        : 'recordedBackground.biologicalIdentity.source.identifier',
    })
  }
  if (row.supplementIngredientGroupId) {
    sources.push({
      kind: 'DSLD_INGREDIENT_GROUP',
      identifier: row.supplementIngredientGroupId,
      path: 'recordedBackground.supplementIngredient.source.identifier',
    })
  }
  if (row.fdaApplicationNumber) {
    sources.push({
      kind: 'FDA_APPLICATION',
      identifier: row.fdaApplicationNumber,
      path: 'recordedBackground.regulatoryApproval.earliestApplicationNumber',
    })
  }
  for (const ndc of [...row.sampleProductNdcs].sort()) {
    sources.push({ kind: 'FDA_NDC', identifier: ndc, path: 'recordedBackground.productListing.sampleProductNdcs' })
  }
  for (const setId of [...row.sampleLabelSetIds].sort()) {
    sources.push({ kind: 'FDA_LABEL_SET', identifier: setId, path: 'recordedBackground.labelPresence.sampleLabelIds' })
  }
  return sources
}

/** Higher ranks first. Fully deterministic: the last tie-break is the slug itself. */
function compareCanonicalPreference(left: InventoryRowInput, right: InventoryRowInput): number {
  const depth = DEPTH_RANK[right.dossierDepth] - DEPTH_RANK[left.dossierDepth]
  if (depth !== 0) return depth
  const modules = right.backgroundModules.length - left.backgroundModules.length
  if (modules !== 0) return modules
  const leftNatural = left.slug === slugify(left.name) ? 1 : 0
  const rightNatural = right.slug === slugify(right.name) ? 1 : 0
  if (leftNatural !== rightNatural) return rightNatural - leftNatural
  if (left.slug.length !== right.slug.length) return left.slug.length - right.slug.length
  return left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0
}

function emptyCounts<K extends string>(keys: readonly K[]): Record<K, number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<K, number>
}

export function resolveInventory(
  inputRows: readonly InventoryRowInput[],
  ledger: readonly RedirectLedgerRow[],
): InventoryResolutionResult {
  const rows = [...inputRows].sort((left, right) => (left.slug < right.slug ? -1 : left.slug > right.slug ? 1 : 0))
  const byId = new Map(rows.map((row) => [row.id, row]))
  const bySlug = new Map(rows.map((row) => [row.slug, row]))
  // Owner-curated rows decide first. Rows this resolver wrote on an earlier run are re-derived from
  // the same exact-name rule, so the artifact keeps saying "duplicate" rather than "historical".
  const ledgerByOldSlug = new Map(
    ledger.filter((entry) => !isResolverAuthoredLedgerRow(entry)).map((entry) => [entry.oldSlug, entry]),
  )
  const resolverLedgerByOldSlug = new Map(
    ledger.filter(isResolverAuthoredLedgerRow).map((entry) => [entry.oldSlug, entry]),
  )

  const placeholder = new Map(
    rows.map((row) => [row.id, isPlaceholderMedicineIdentity({ slug: row.slug, name: row.name })]),
  )

  // Group exact-name duplicates among rows that are neither placeholders nor ledger sources.
  const byNameKey = new Map<string, InventoryRowInput[]>()
  for (const row of rows) {
    if (placeholder.get(row.id) || ledgerByOldSlug.has(row.slug)) continue
    const key = exactNameKey(row.name)
    if (!key) continue
    const group = byNameKey.get(key) ?? []
    group.push(row)
    byNameKey.set(key, group)
  }
  const duplicateWinner = new Map<string, InventoryRowInput>()
  const duplicatesOf = new Map<string, InventoryRowInput[]>()
  for (const group of byNameKey.values()) {
    if (group.length < 2) continue
    const ordered = [...group].sort(compareCanonicalPreference)
    const winner = ordered[0]!
    duplicatesOf.set(winner.id, ordered.slice(1))
    for (const loser of ordered.slice(1)) duplicateWinner.set(loser.id, winner)
  }

  // Shared registry identifiers, alias shadowing and salt forms are warnings, never merges.
  const identifierOwners = new Map<string, string[]>()
  for (const row of rows) {
    if (placeholder.get(row.id)) continue
    for (const source of identitySources(row)) {
      if (source.kind === 'FDA_NDC' || source.kind === 'FDA_LABEL_SET') continue
      const key = `${source.kind}:${source.identifier}`
      const owners = identifierOwners.get(key) ?? []
      owners.push(row.slug)
      identifierOwners.set(key, owners)
    }
  }
  const byBaseName = new Map<string, InventoryRowInput>()
  for (const row of rows) {
    if (!placeholder.get(row.id)) byBaseName.set(exactNameKey(row.name), row)
  }

  const resolutions: InventoryResolution[] = rows.map((row) => {
    const isPlaceholder = placeholder.get(row.id) === true
    const aliases = [...new Set(row.aliases.map((entry) => entry.alias.trim()).filter(Boolean))].sort()
    const sources = identitySources(row)
    const classification = classifyEntity({
      slug: row.slug,
      name: row.name,
      modality: row.modality,
      approvalStatus: row.approvalStatus,
      backgroundModules: row.backgroundModules,
      compositionIngredientCount: row.compositionIngredientCount,
      isPlaceholder,
    })
    const warnings: AttributionWarning[] = []
    const evidence: string[] = []
    let status: InventoryResolutionState = 'CANONICAL_ENTITY'
    let canonical: InventoryRowInput = row

    if (isPlaceholder) {
      status = 'INVALID_IDENTITY_GONE'
      evidence.push(`placeholder identity: slug "${row.slug}", name "${row.name}"`)
    } else if (ledgerByOldSlug.has(row.slug)) {
      const entry = ledgerByOldSlug.get(row.slug)!
      const target = byId.get(entry.targetDrugId)
      if (
        !target ||
        placeholder.get(target.id) ||
        target.id === row.id ||
        ledgerByOldSlug.has(target.slug)
      ) {
        status = 'MANUAL_IDENTITY_REVIEW_REQUIRED'
        evidence.push(
          `identity ledger row for "${row.slug}" points to ${entry.targetDrugId}, which is missing, a placeholder, itself, or another ledger source`,
        )
      } else {
        status = 'HISTORICAL_REDIRECT'
        canonical = target
        evidence.push(`owner-curated identity ledger (${entry.reason}): "${row.slug}" -> "${target.slug}"`)
      }
    } else if (!SLUG_SHAPE.test(row.slug)) {
      status = 'MANUAL_IDENTITY_REVIEW_REQUIRED'
      evidence.push(`slug "${row.slug}" is not a normalized public slug`)
    } else if (duplicateWinner.has(row.id)) {
      const winner = duplicateWinner.get(row.id)!
      status = 'DUPLICATE_OF_CANONICAL_ENTITY'
      canonical = winner
      evidence.push(
        `identical name after removing non-alphanumeric characters ("${exactNameKey(row.name)}"): "${row.name}" and "${winner.name}"`,
      )
      const priorLedger = resolverLedgerByOldSlug.get(row.slug)
      if (priorLedger && priorLedger.targetDrugId !== winner.id) {
        status = 'MANUAL_IDENTITY_REVIEW_REQUIRED'
        canonical = row
        evidence.push(
          `an earlier resolver-written ledger row points "${row.slug}" at ${priorLedger.targetDrugId}, not at "${winner.slug}"`,
        )
      } else if (priorLedger) {
        evidence.push('a resolver-written redirect ledger row already records this duplicate')
      }
      for (const source of sources) {
        const shared = winner.registryIdentifiers[source.kind === 'UNII' ? 'unii' : source.kind === 'PUBCHEM_CID' ? 'pubchemCid' : source.kind === 'CAS' ? 'casNumber' : source.kind === 'RXCUI' ? 'rxcui' : 'ncbiTaxonomyId']
        if (shared && shared === source.identifier) {
          evidence.push(`both records carry ${source.kind} ${source.identifier}`)
        }
      }
      const unmerged = row.backgroundModules.filter(
        (module) => !winner.backgroundModules.includes(module) && !['version', 'authoredAt', 'provenanceTier'].includes(module),
      )
      if (unmerged.length > 0) {
        warnings.push({
          code: 'DUPLICATE_HOLDS_UNMERGED_MODULES',
          detail: `recorded modules not present on the canonical record: ${unmerged.join(', ')}`,
          relatedSlugs: [winner.slug],
        })
      }
    } else if (resolverLedgerByOldSlug.has(row.slug)) {
      status = 'MANUAL_IDENTITY_REVIEW_REQUIRED'
      evidence.push(
        `a resolver-written ledger row redirects "${row.slug}", but the exact-name rule no longer finds a duplicate; a person must retire or confirm the ledger row`,
      )
    } else if (duplicatesOf.has(row.id)) {
      evidence.push(
        `canonical record for exact-name duplicates: ${duplicatesOf
          .get(row.id)!
          .map((duplicate) => `"${duplicate.slug}"`)
          .join(', ')}`,
      )
    }

    if (!isPlaceholder) {
      for (const source of sources) {
        if (source.kind === 'FDA_NDC' || source.kind === 'FDA_LABEL_SET') continue
        const owners = identifierOwners.get(`${source.kind}:${source.identifier}`) ?? []
        const others = owners.filter((slug) => slug !== row.slug && slug !== canonical.slug)
        if (others.length > 0) {
          warnings.push({
            code: 'SHARED_REGISTRY_IDENTIFIER',
            detail: `${source.kind} ${source.identifier} is also recorded on ${others.length} other record(s); not used as merge evidence`,
            relatedSlugs: others,
          })
        }
      }
      for (const alias of aliases) {
        const shadowed = bySlug.get(aliasSlug(alias))
        if (shadowed && shadowed.id !== row.id && shadowed.id !== canonical.id) {
          warnings.push({
            code: 'ALIAS_SHADOWED_BY_CANONICAL_SLUG',
            detail: `alias "${alias}" spells the canonical slug of another record`,
            relatedSlugs: [shadowed.slug],
          })
        }
      }
      const moiety = titleCaseDrugName(baseMoiety(row.name.toUpperCase()))
      if (moiety && exactNameKey(moiety) !== exactNameKey(row.name)) {
        const parent = byBaseName.get(exactNameKey(moiety))
        if (parent && parent.id !== row.id) {
          warnings.push({
            code: 'SALT_OR_HYDRATE_FORM_OF_ANOTHER_RECORD',
            detail: `"${row.name}" reduces to "${moiety}", which is recorded separately; not merged`,
            relatedSlugs: [parent.slug],
          })
        }
      }
      if (row.backgroundModules.length === 0) {
        warnings.push({ code: 'NO_RECORDED_BACKGROUND', detail: 'no recorded-background envelope on this row' })
      }
      if (sources.length === 0) {
        warnings.push({ code: 'NAME_ONLY_IDENTITY', detail: 'no registry identifier is recorded on this row' })
      }
    }

    const redirecting = isRedirectingResolution(status)

    return {
      originalRecordId: row.id,
      originalSlug: row.slug,
      originalName: row.name,
      aliases,
      entityClass: classification.entityClass,
      entityClassRule: classification.rule,
      canonicalEntityId: canonical.id,
      canonicalSlug: canonical.slug,
      resolutionStatus: status,
      redirectTarget: redirecting ? canonical.slug : null,
      identitySources: sources,
      identityConfidenceState: isPlaceholder
        ? 'PLACEHOLDER'
        : sources.length > 0
          ? 'REGISTRY_IDENTIFIER_RECORDED'
          : 'NAME_ONLY',
      attributionWarnings: warnings.sort((left, right) =>
        `${left.code}${left.detail}`.localeCompare(`${right.code}${right.detail}`),
      ),
      resolutionEvidence: evidence,
      contentDigest: contentDigest(row),
      resolverVersion: INVENTORY_RESOLVER_VERSION,
    }
  })

  const byStatus = emptyCounts(INVENTORY_RESOLUTION_STATES)
  const byEntityClass = emptyCounts(ENTITY_CLASSES)
  const warningCounts = emptyCounts(ATTRIBUTION_WARNING_CODES)
  for (const resolution of resolutions) {
    byStatus[resolution.resolutionStatus] += 1
    byEntityClass[resolution.entityClass] += 1
    for (const warning of resolution.attributionWarnings) warningCounts[warning.code] += 1
  }
  const canonicalEntities = byStatus.CANONICAL_ENTITY
  const redirected = byStatus.ALIAS_OF_CANONICAL_ENTITY + byStatus.DUPLICATE_OF_CANONICAL_ENTITY
  const summary: InventoryResolutionSummary = {
    resolverVersion: INVENTORY_RESOLVER_VERSION,
    inputDigest: sha256(resolutions.map((resolution) => resolution.contentDigest).join('\n')),
    originalInventoryCount: resolutions.length,
    byStatus,
    byEntityClass,
    canonicalEntities,
    aliasesOrDuplicatesRedirected: redirected,
    historicalRedirects: byStatus.HISTORICAL_REDIRECT,
    justifiedGoneIdentities: byStatus.INVALID_IDENTITY_GONE,
    manualReviewRequired: byStatus.MANUAL_IDENTITY_REVIEW_REQUIRED,
    accountingBalanced:
      resolutions.length ===
      canonicalEntities +
        redirected +
        byStatus.HISTORICAL_REDIRECT +
        byStatus.INVALID_IDENTITY_GONE +
        byStatus.MANUAL_IDENTITY_REVIEW_REQUIRED,
    warningCounts,
  }
  return { resolutions, summary }
}

export function isRedirectingResolution(status: InventoryResolutionState): boolean {
  return (
    status === 'DUPLICATE_OF_CANONICAL_ENTITY' ||
    status === 'ALIAS_OF_CANONICAL_ENTITY' ||
    status === 'HISTORICAL_REDIRECT'
  )
}

export type { AttributionWarningCode, EntityClass }
