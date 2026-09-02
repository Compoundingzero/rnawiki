/**
 * The canonical inventory contract.
 *
 * Every original `drugs` row receives exactly one resolution. The public site then serves one
 * canonical dossier per canonical entity, a permanent redirect for a duplicate or alias row, or a
 * justified 410 for an identity that was never a medicine. Nothing here authors medical content:
 * a resolution is a statement about record identity, made from exact stored evidence, and the
 * artifact that records it is regenerated deterministically from the same inputs.
 */

export const INVENTORY_RESOLVER_VERSION = 'inventory-resolution/v1' as const

export const INVENTORY_RESOLUTION_STATES = [
  'CANONICAL_ENTITY',
  'ALIAS_OF_CANONICAL_ENTITY',
  'DUPLICATE_OF_CANONICAL_ENTITY',
  'HISTORICAL_REDIRECT',
  'INVALID_IDENTITY_GONE',
  'MANUAL_IDENTITY_REVIEW_REQUIRED',
] as const
export type InventoryResolutionState = (typeof INVENTORY_RESOLUTION_STATES)[number]

/**
 * What kind of thing a record is, decided by a fixed rule table over stored fields. The class
 * selects which dossier sections apply; it is never a quality ranking.
 */
export { ENTITY_CLASSES, type EntityClass } from './entity-class-types'
import type { EntityClass } from './entity-class-types'

export const IDENTITY_CONFIDENCE_STATES = [
  /** At least one registry identifier is recorded on the row itself. */
  'REGISTRY_IDENTIFIER_RECORDED',
  /** The row is identified by its recorded name alone. */
  'NAME_ONLY',
  /** The row is a placeholder and identifies nothing. */
  'PLACEHOLDER',
] as const
export type IdentityConfidenceState = (typeof IDENTITY_CONFIDENCE_STATES)[number]

export const IDENTITY_SOURCE_KINDS = [
  'UNII',
  'CAS',
  'PUBCHEM_CID',
  'RXCUI',
  'NCBI_TAXONOMY',
  'DSLD_INGREDIENT_GROUP',
  'FDA_APPLICATION',
  'FDA_NDC',
  'FDA_LABEL_SET',
] as const
export type IdentitySourceKind = (typeof IDENTITY_SOURCE_KINDS)[number]

export interface IdentitySource {
  kind: IdentitySourceKind
  identifier: string
  /** Where on the record the identifier was read from, as a JSON path. */
  path: string
}

export const ATTRIBUTION_WARNING_CODES = [
  /** Another record carries the same registry identifier; not merge evidence. */
  'SHARED_REGISTRY_IDENTIFIER',
  /** A recorded alias of this row spells another row's canonical slug. */
  'ALIAS_SHADOWED_BY_CANONICAL_SLUG',
  /** The recorded name is a salt or hydrate form of another record's name. */
  'SALT_OR_HYDRATE_FORM_OF_ANOTHER_RECORD',
  /** The row holds no recorded-background envelope at all. */
  'NO_RECORDED_BACKGROUND',
  /** Identity rests on the name alone; no registry identifier was recorded. */
  'NAME_ONLY_IDENTITY',
  /** The duplicate row holds recorded modules that the canonical row does not. */
  'DUPLICATE_HOLDS_UNMERGED_MODULES',
] as const
export type AttributionWarningCode = (typeof ATTRIBUTION_WARNING_CODES)[number]

export interface AttributionWarning {
  code: AttributionWarningCode
  detail: string
  relatedSlugs?: string[]
}

export interface InventoryResolution {
  originalRecordId: string
  originalSlug: string
  originalName: string
  /** Every recorded alias string, sorted, so the artifact is self-contained. */
  aliases: string[]
  entityClass: EntityClass
  /** The rule from the fixed class table that fired, for audit. */
  entityClassRule: string
  canonicalEntityId: string
  canonicalSlug: string
  resolutionStatus: InventoryResolutionState
  /** Present exactly when the status is a redirecting one. Always a canonical slug, one hop. */
  redirectTarget: string | null
  identitySources: IdentitySource[]
  identityConfidenceState: IdentityConfidenceState
  attributionWarnings: AttributionWarning[]
  /** Deterministic evidence for a non-canonical status, so a reader can check the decision. */
  resolutionEvidence: string[]
  /** SHA-256 over the exact stored input fields this resolution was computed from. */
  contentDigest: string
  resolverVersion: typeof INVENTORY_RESOLVER_VERSION
}

export interface InventoryResolutionSummary {
  resolverVersion: typeof INVENTORY_RESOLVER_VERSION
  /** SHA-256 over every resolution's content digest in slug order. */
  inputDigest: string
  originalInventoryCount: number
  byStatus: Record<InventoryResolutionState, number>
  byEntityClass: Record<EntityClass, number>
  canonicalEntities: number
  aliasesOrDuplicatesRedirected: number
  historicalRedirects: number
  justifiedGoneIdentities: number
  manualReviewRequired: number
  /** originalInventoryCount === canonical + redirected + historical + gone + manual. */
  accountingBalanced: boolean
  warningCounts: Record<AttributionWarningCode, number>
}
