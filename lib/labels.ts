import type { entityTypeEnum, regulatoryCategoryEnum } from '@/db/schema'

/**
 * Human-readable names for the database enums. Rendering the raw value with
 * underscores swapped for spaces produced lowercase fragments in the middle of
 * sentences ("unapproved therapeutic substance. RNAwiki documents…"), so the
 * display strings live here rather than being derived at each call site.
 */

type EntityType = (typeof entityTypeEnum.enumValues)[number]
type RegulatoryCategory = (typeof regulatoryCategoryEnum.enumValues)[number]

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  peptide: 'Peptide',
  supplement_ingredient: 'Supplement ingredient',
  investigational_medicine: 'Investigational medicine',
  approved_medicine: 'Approved medicine',
  gene_editing_treatment: 'Gene-editing treatment',
  rna_treatment: 'RNA treatment',
  other_emerging_therapy: 'Emerging therapy',
}

export const REGULATORY_CATEGORY_LABELS: Record<RegulatoryCategory, string> = {
  approved_medicine: 'Approved medicine',
  investigational_medicine: 'Investigational medicine',
  compounded_medicine: 'Compounded medicine',
  dietary_supplement: 'Dietary supplement',
  unapproved_therapeutic_substance: 'Unapproved therapeutic substance',
  withdrawn_or_restricted: 'Withdrawn or restricted',
}

/** Lowercased for use inside a running sentence. */
export function regulatoryCategoryInSentence(c: RegulatoryCategory): string {
  return REGULATORY_CATEGORY_LABELS[c].toLowerCase()
}
