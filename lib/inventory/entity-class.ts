import type { EntityClass } from './entity-class-types'

export type { EntityClass } from './entity-class-types'

/**
 * The fixed rule table that assigns an entity class to a record.
 *
 * Rules are evaluated top to bottom and the first match wins, so the order is the specification.
 * Every input is a stored field: the row's approval status and modality as classified by the
 * ingest, the module keys of its recorded-background envelope, and its recorded composition. No
 * rule reads free text and no rule reads a name, so two records with similar names can still land
 * in different classes when their stored facts differ.
 */

export interface EntityClassInput {
  slug: string
  name: string
  modality: string
  approvalStatus: string
  backgroundModules: readonly string[]
  compositionIngredientCount: number
  isPlaceholder: boolean
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

function hasAny(modules: readonly string[], candidates: readonly string[]): boolean {
  return candidates.some((candidate) => modules.includes(candidate))
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
  if (APPROVED_STATUSES.has(input.approvalStatus)) {
    return BIOLOGIC_MODALITIES.has(input.modality)
      ? {
          entityClass: 'APPROVED_BIOLOGIC',
          rule: 'rule-5: approved status with a biologic modality',
        }
      : { entityClass: 'APPROVED_MEDICINE', rule: 'rule-6: approved status' }
  }
  if (INVESTIGATIONAL_STATUSES.has(input.approvalStatus)) {
    return {
      entityClass: 'INVESTIGATIONAL_MEDICINE',
      rule: 'rule-7: phase 2, phase 3 or pre-clinical status',
    }
  }
  if (input.approvalStatus === 'Off-Label / Compounded') {
    return {
      entityClass: 'OFF_LABEL_OR_COMPOUNDED',
      rule: 'rule-8: approval status Off-Label / Compounded',
    }
  }
  if (input.backgroundModules.includes('biologicalIdentity')) {
    return {
      entityClass: 'BOTANICAL_OR_ORGANISM_PREPARATION',
      rule: 'rule-9: recorded biological (taxonomy) identity',
    }
  }
  if (hasAny(input.backgroundModules, SUPPLEMENT_MODULES)) {
    return {
      entityClass: 'SUPPLEMENT_INGREDIENT',
      rule: 'rule-10: recorded supplement ingredient or supplement market module',
    }
  }
  if (hasAny(input.backgroundModules, MARKETED_PRODUCT_MODULES)) {
    return {
      entityClass: 'MARKETED_PRODUCT_INGREDIENT',
      rule: 'rule-11: recorded label presence, product listing or regulatory application',
    }
  }
  return {
    entityClass: 'REGISTRY_ONLY_IDENTITY',
    rule: 'rule-12: no product, supplement or organism module',
  }
}
