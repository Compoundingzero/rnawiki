import type { EntityClass } from './entity-class-types'

export type { EntityClass } from './entity-class-types'

/**
 * The fixed rule table that assigns an entity class to a record.
 *
 * Rules are evaluated top to bottom and the first match wins, so the order is the specification.
 * Every input is a stored field: the row's approval status and modality as classified by the
 * ingest, the module keys of its recorded-background envelope, its recorded composition, and the
 * counts and product types its recorded label presence carries. No rule reads free text and no
 * rule reads a name, so two records with similar names can still land in different classes when
 * their stored facts differ.
 */

export interface EntityClassInput {
  slug: string
  name: string
  modality: string
  approvalStatus: string
  backgroundModules: readonly string[]
  compositionIngredientCount: number
  isPlaceholder: boolean
  /**
   * Product types of the published labels naming this record as an active ingredient, as the
   * archive classifies them (`labelPresence.productTypesAsRecorded`). Absent when the row has no
   * recorded label presence, or when the caller does not carry label presence at all; rule 5
   * only fires when it is present.
   */
  labelProductTypes?: readonly string[]
  /** Labels declaring this record as their only active ingredient (`labelPresence.singleSubstanceLabelCount`). */
  singleSubstanceLabelCount?: number
  /** A Drugs@FDA application number is recorded (`regulatoryApproval.earliestApplicationNumber`). */
  hasRegulatoryApplication?: boolean
}

export interface EntityClassDecision {
  entityClass: EntityClass
  /** The rule that fired, in the form `rule-N: <condition>`. */
  rule: string
}

const APPROVED_STATUSES = new Set(['FDA Approved', 'Accelerated Approval', 'EMA Approved'])
const INVESTIGATIONAL_STATUSES = new Set([
  'Phase 3 Clinical Trial',
  'Phase 2 Investigational',
  'Pre-clinical / Open Source',
])
const BIOLOGIC_MODALITIES = new Set([
  'Recombinant Protein / Biologic',
  'Monoclonal Antibody (mAb)',
  'Peptide / GLP-1 Agonist',
  'CRISPR / Gene Therapy',
  'ASO (Antisense Oligonucleotide)',
  'siRNA (Small Interfering RNA)',
  'mRNA Vaccine / Therapeutic',
])
const SUPPLEMENT_MODULES = ['supplementIngredient', 'supplementMarket'] as const
const MARKETED_PRODUCT_MODULES = ['labelPresence', 'productListing', 'regulatoryApproval'] as const

/**
 * The one product type under which a substance can be listed as an "active ingredient" of a
 * product that is not a medicine in the ordinary sense. The openFDA label archive classifies every
 * label as HUMAN PRESCRIPTION DRUG, HUMAN OTC DRUG or CELLULAR THERAPY, and files cosmetics,
 * sunscreens, skin serums and similar listings under HUMAN OTC DRUG with every ingredient the
 * seller chose to declare. A cosmetic peptide or a molecular-weight fraction therefore reaches
 * this corpus with an "approved" status and a label count, while every one of those labels
 * declares it alongside several other substances and none is a prescription label.
 */
const NON_PRESCRIPTION_PRODUCT_TYPES = new Set(['HUMAN OTC DRUG'])

function hasAny(modules: readonly string[], candidates: readonly string[]): boolean {
  return candidates.some((candidate) => modules.includes(candidate))
}

/**
 * Rule 5: an approval status whose only label evidence is an ingredient listing.
 *
 * All four facts are stored, and all four are needed. A label presence must be recorded (a record
 * with no label at all may be a discontinued medicine, which rule 5 must not touch). Every label
 * must be a non-prescription product (a substance sold only inside prescription combinations,
 * such as clavulanate, keeps its class). No label may declare the record alone (a monograph
 * over-the-counter active with its own label keeps its class). And no Drugs@FDA application may
 * be recorded (an old approved medicine that survives only inside over-the-counter combinations
 * keeps its class).
 */
function isIngredientListingOnly(input: EntityClassInput): boolean {
  const types = input.labelProductTypes
  if (!types || types.length === 0) return false
  if (!types.every((type) => NON_PRESCRIPTION_PRODUCT_TYPES.has(type))) return false
  if ((input.singleSubstanceLabelCount ?? 0) > 0) return false
  if (input.hasRegulatoryApplication) return false
  return true
}

export function classifyEntity(input: EntityClassInput): EntityClassDecision {
  if (input.isPlaceholder) {
    return { entityClass: 'PLACEHOLDER', rule: 'rule-1: placeholder identity' }
  }
  if (input.compositionIngredientCount > 1) {
    return {
      entityClass: 'COMBINATION_PRODUCT',
      rule: 'rule-2: recorded composition with more than one active ingredient',
    }
  }
  if (input.approvalStatus === 'Withdrawn from Market') {
    return {
      entityClass: 'WITHDRAWN_MEDICINE',
      rule: 'rule-3: approval status Withdrawn from Market',
    }
  }
  if (input.approvalStatus === 'Controlled / No Approved Use') {
    return {
      entityClass: 'CONTROLLED_NO_APPROVED_USE',
      rule: 'rule-4: approval status Controlled / No Approved Use',
    }
  }
  if (APPROVED_STATUSES.has(input.approvalStatus) && isIngredientListingOnly(input)) {
    return {
      entityClass: 'MARKETED_PRODUCT_INGREDIENT',
      rule: 'rule-5: approved status, but every label naming it is a non-prescription product declaring it alongside other substances, and no Drugs@FDA application is recorded',
    }
  }
  if (APPROVED_STATUSES.has(input.approvalStatus)) {
    return BIOLOGIC_MODALITIES.has(input.modality)
      ? {
          entityClass: 'APPROVED_BIOLOGIC',
          rule: 'rule-6: approved status with a biologic modality',
        }
      : { entityClass: 'APPROVED_MEDICINE', rule: 'rule-7: approved status' }
  }
  if (INVESTIGATIONAL_STATUSES.has(input.approvalStatus)) {
    return {
      entityClass: 'INVESTIGATIONAL_MEDICINE',
      rule: 'rule-8: phase 2, phase 3 or pre-clinical status',
    }
  }
  if (input.approvalStatus === 'Off-Label / Compounded') {
    return {
      entityClass: 'OFF_LABEL_OR_COMPOUNDED',
      rule: 'rule-9: approval status Off-Label / Compounded',
    }
  }
  if (input.backgroundModules.includes('biologicalIdentity')) {
    return {
      entityClass: 'BOTANICAL_OR_ORGANISM_PREPARATION',
      rule: 'rule-10: recorded biological (taxonomy) identity',
    }
  }
  if (hasAny(input.backgroundModules, SUPPLEMENT_MODULES)) {
    return {
      entityClass: 'SUPPLEMENT_INGREDIENT',
      rule: 'rule-11: recorded supplement ingredient or supplement market module',
    }
  }
  if (hasAny(input.backgroundModules, MARKETED_PRODUCT_MODULES)) {
    return {
      entityClass: 'MARKETED_PRODUCT_INGREDIENT',
      rule: 'rule-12: recorded label presence, product listing or regulatory application',
    }
  }
  return {
    entityClass: 'REGISTRY_ONLY_IDENTITY',
    rule: 'rule-13: no product, supplement or organism module',
  }
}
