import type {
  ApprovalStatus,
  AuditConfidence,
  AuditPoint,
  ClinicalTrialRecord,
  CommonQuestion,
  ConditionContext,
  DeliverySystem,
  DrugModality,
  DrugSubstitutes,
  LaboratoryProtocolStep,
  MeasuredVsInferredSummary,
  MechanismStep,
  PricingTransparency,
  StructureType,
} from '@/lib/types'

/**
 * The shape a curated flagship dossier is written in.
 *
 * This is deliberately NOT `DrugDossier`. A seed file is written by a person from sources, so it
 * carries the things a person must supply and none of the things the database derives: no id, no
 * slug, no audit-point counts, no revision count, no verification hash. Anything derived that a
 * seed file could state is a chance for the file and the database to disagree.
 *
 * EVERY citation in a seed file must be a real, checkable DOI, PMID, NCT number or regulatory URL,
 * verified at the time of writing. An invented DOI is the single worst thing this repository could
 * publish: it is indistinguishable from a real one to a reader, and it makes every other citation
 * on the site suspect. If a fact cannot be sourced, leave the field out and say so in the file.
 */
export interface SeedDossier {
  /** URL slug. Lowercase, hyphenated, stable — changing it breaks every inbound link. */
  slug: string
  name: string
  tradeName?: string
  sponsor: string
  targetGene: string
  targetProtein: string
  modality: DrugModality
  approvalStatus: ApprovalStatus
  approvalYear?: number
  indication: string
  patientFriendlyIndication: string

  conditionContext?: ConditionContext
  oneSentenceVerdict: string
  laymanHowItWorks: string

  auditConfidence: AuditConfidence
  /**
   * 0-100. It is NOT a computed probability and must never be presented as one — it is the
   * editorial reading of how settled the evidence is, and the UI labels it accordingly.
   */
  confidenceScore: number

  /** Where the drug acts, e.g. "Liver hepatocyte cytoplasm". Shown on the mechanism carousel. */
  anatomicalSite?: string

  pricing?: SeedPricing
  substitutes?: DrugSubstitutes
  molecularSchema?: SeedMolecularSchema

  keyAudits: AuditPoint[]
  mechanismSteps: MechanismStep[]
  trials: ClinicalTrialRecord[]
  measuredVsInferredSummary: MeasuredVsInferredSummary
  deliverySystem: DeliverySystem
  commonQuestions: CommonQuestion[]

  recentAuditDate: string
  hasDiscrepancy: boolean

  /**
   * Every source consulted, as a checkable reference. Not decoration: the pricing and audit claims
   * on a flagship page are the ones a reader is most likely to challenge.
   */
  sources: SeedSource[]
}

export interface SeedSource {
  label: string
  /** A DOI, PMID, NCT id, or a regulatory URL. Must resolve. */
  identifier: string
  kind: 'doi' | 'pmid' | 'nct' | 'url' | 'regulatory'
}

export interface SeedPricing extends PricingTransparency {
  /**
   * Where the synthesis-cost figure comes from. Cost-of-production estimates are published
   * research (Hill et al. and successors), not common knowledge, and a number without its source
   * is a number a reader cannot check. Required whenever pricing is present.
   */
  costSource: SeedSource
  priceSource: SeedSource
}

export interface SeedMolecularSchema {
  structureType: StructureType
  sequence5to3?: string
  smilesString?: string
  chemicalFormula?: string
  molecularWeight?: string
  targetReceptorAffinity?: string
  laboratoryWorkflow: LaboratoryProtocolStep[]
  /** Where the sequence or structure was taken from. Required when either is present. */
  structureSource?: SeedSource
}
