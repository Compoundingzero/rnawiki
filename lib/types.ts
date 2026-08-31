// Legacy medicine-record types retained during the programme-model rollout.

export type DrugModality =
  | 'Small Molecule'
  | 'Peptide / GLP-1 Agonist'
  | 'Monoclonal Antibody (mAb)'
  | 'siRNA (Small Interfering RNA)'
  | 'ASO (Antisense Oligonucleotide)'
  | 'mRNA Vaccine / Therapeutic'
  | 'CRISPR / Gene Therapy'
  | 'Recombinant Protein / Biologic'
  | 'Nutraceutical / Botanical'

export type RnaModality = DrugModality

export const DRUG_MODALITIES: DrugModality[] = [
  'Small Molecule',
  'Peptide / GLP-1 Agonist',
  'Monoclonal Antibody (mAb)',
  'siRNA (Small Interfering RNA)',
  'ASO (Antisense Oligonucleotide)',
  'mRNA Vaccine / Therapeutic',
  'CRISPR / Gene Therapy',
  'Recombinant Protein / Biologic',
  'Nutraceutical / Botanical',
]

export type ApprovalStatus =
  | 'FDA Approved'
  | 'EMA Approved'
  | 'Phase 3 Clinical Trial'
  | 'Phase 2 Investigational'
  | 'Off-Label / Compounded'
  | 'Non-FDA / Dietary Supplement'
  | 'Accelerated Approval'
  | 'Pre-clinical / Open Source'
  /**
   * Scheduled by a drug authority with no approved medical use in the United States: LSD,
   * psilocybin, heroin, MDMA outside its trials. The reference's eight statuses were written for a
   * six-drug demo and had nowhere honest to put these, and 'Off-Label / Compounded' would have
   * implied a prescribing route that does not exist. A drug reference that omits the scheduled
   * substances omits the ones readers have the fewest reliable places to look up.
   */
  | 'Controlled / No Approved Use'
  /**
   * Approved once and pulled: rofecoxib, sibutramine, cerivastatin. These are the clearest
   * conclusion_shift records in medicine and describing them as approved would be false.
   */
  | 'Withdrawn from Market'

export const APPROVAL_STATUSES: ApprovalStatus[] = [
  'FDA Approved',
  'EMA Approved',
  'Phase 3 Clinical Trial',
  'Phase 2 Investigational',
  'Off-Label / Compounded',
  'Non-FDA / Dietary Supplement',
  'Accelerated Approval',
  'Pre-clinical / Open Source',
  'Controlled / No Approved Use',
  'Withdrawn from Market',
]

export type AuditConfidence =
  'High Confidence' | 'Moderate / Debated' | 'Inference Overreach Found' | 'Rigorous Replicated'

export interface AuditPoint {
  id: string
  category: 'measured' | 'inferred' | 'failed' | 'conclusion_shift'
  title: string
  laymanSummary: string
  technicalDetails: string
  evidenceSource: string
  doi?: string
  measuredMetric?: string
  inferredClaim?: string
  auditFlag?: 'verified' | 'caution' | 'retracted' | 'contested'
}

export interface ClinicalTrialRecord {
  trialId: string
  phase: string
  sampleSize: number
  primaryEndpoint: string
  /**
   * Explicit result state. `endpointMet: false` in the legacy corpus meant both "not met" and
   * "not reported"; this field removes that scientifically consequential ambiguity.
   */
  endpointStatus?: 'met' | 'not_met' | 'not_reported'
  endpointMet: boolean
  statisticalPValue: string
  unreportedAdverseSignals?: string
  independentReplicationStatus:
    'Replicated' | 'Partially Replicated' | 'Unreplicated' | 'Failed to Replicate'
}

export interface MechanismStep {
  step: number
  title: string
  laymanDesc: string
  molecularDetail: string
  iconName: string
  visualStage:
    'delivery' | 'cellular_entry' | 'target_binding' | 'catalytic_action' | 'therapeutic_result'
}

export interface CommunityNote {
  id: string
  author: string
  /** Current public profile handle. Omitted after the account is deleted. */
  authorHandle?: string
  role: string
  date: string
  content: string
  upvotes: number
  authorUserId?: string
  hasUpvoted?: boolean
  orcid?: string
}

export interface PricingTransparency {
  synthesisCostPerDose: string
  retailPricePerDoseOrYear: string
  markupEstimate: string
  openPatentNotes: string
  synthesisComplexity: 'Low' | 'Moderate' | 'High'
}

export interface NaturalFoodSubstitute {
  name: string
  activeCompound?: string
  biologicalMechanism?: string
  mechanism?: string
  evidenceStrength?: 'High Clinical Proof' | 'Moderate Evidence' | 'Supportive' | string
  evidenceLevel?: string
  dailyUsage: string
  monthlyCost: string
}

export interface ConventionalSubstitute {
  name: string
  class?: string
  howItCompares?: string
  comparisonToDrug?: string
  typicalCost: string
  prosAndCons?: string
}

export interface HomeRemedy {
  name: string
  action: string
  patientImpact: string
  clinicalPrecaution: string
}

export interface DrugSubstitutes {
  summary: string
  conventionalRx: ConventionalSubstitute[]
  naturalFoods: NaturalFoodSubstitute[]
  homeRemedies: HomeRemedy[]
}

export type ProtocolPhase =
  'QC' | 'Synthesis' | 'Purification' | 'Conjugation' | 'Cellular_Delivery' | 'Assay_Quantification'

export const PROTOCOL_PHASES: ProtocolPhase[] = [
  'QC',
  'Synthesis',
  'Purification',
  'Conjugation',
  'Cellular_Delivery',
  'Assay_Quantification',
]

export interface LaboratoryProtocolStep {
  id: string
  stepNumber: number
  phase: ProtocolPhase
  name: string
  description: string
  dependsOnStepId?: string
  reagentsAndBuffer: string
}

export type StructureType =
  | 'rna_sequence'
  | 'small_molecule_smiles'
  | 'peptide_sequence'
  | 'antibody_structure'
  | 'generic_formula'

export interface MolecularSchema {
  structureType?: StructureType
  sequence5to3?: string
  smilesString?: string
  chemicalFormula?: string
  molecularWeight?: string
  logP?: number
  targetReceptorAffinity?: string

  // Specific to RNA
  complementaryStrand?: string
  gcContentPercent?: number
  sequenceLengthNt?: number
  readingFrameValid?: boolean
  startCodonFound?: boolean
  stopCodonFound?: boolean
  mfeDeltaG?: number // kcal/mol
  wobblePairsCount?: number

  // Verification
  isMachineVerified: boolean
  verificationHash?: string
  lastVerifiedTimestamp?: string
  laboratoryWorkflow: LaboratoryProtocolStep[]
}

export interface ConditionContext {
  conditionExplainer: string
  whyItMatters: string
  whoTakesThis: string
  clinicalGoals?: string
}

export interface CommonQuestion {
  q: string
  a: string
  auditNote?: string
}

export interface MeasuredVsInferredSummary {
  strictlyMeasured: string[]
  unsupportedInferences: string[]
  whatFailedInitially: string[]
  realWorldOutcome: string[]
}

export interface DeliverySystem {
  type: string
  description: string
  safetyProfile: string
}

export interface DrugDossier {
  id: string
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
  confidenceScore: number // 0 - 100
  pricing?: PricingTransparency
  /** medicine-background/v1 envelope of recorded label/registry facts; see lib/background/types. */
  recordedBackground?: import('./background/types').MedicineRecordedBackground
  /**
   * Operational state derived from exact persisted source bindings. Kept outside the immutable
   * recorded envelope so a failed fetch or a checker run can never rewrite medical content.
   */
  sourceFreshness?: readonly import('./dossier-question-issues').StaleSourceSummary[]
  substitutes?: DrugSubstitutes
  molecularSchema?: MolecularSchema
  auditPointsCount: {
    measured: number
    inferred: number
    failed: number
    conclusionShift: number
  }
  keyAudits: AuditPoint[]
  mechanismSteps: MechanismStep[]
  trials: ClinicalTrialRecord[]
  measuredVsInferredSummary: MeasuredVsInferredSummary
  deliverySystem: DeliverySystem
  commonQuestions: CommonQuestion[]
  communityNotes?: CommunityNote[]
  recentAuditDate: string
  /** A scientific, regulatory, or source-record discrepancy documented by the dossier. */
  hasDiscrepancy: boolean

  // Persistence and provenance additions.
  /** Depth of the record. `stub` entries are ingested identity/regulatory facts awaiting curation. */
  dossierDepth?: 'stub' | 'curated' | 'flagship'
  /** Where the identity-layer facts came from, e.g. "openFDA Drugs@FDA", "NIH ODS". */
  sourceProvenance?: string[]
  /** Anatomical or cellular site of action, shown on the mechanism carousel. */
  anatomicalSite?: string
  revisionCount?: number
  lastEditedAt?: string
  lastEditedBy?: string
  isMachineVerifiedStructure?: boolean
  viewCount?: number
}

export type ViewMode = 'home' | 'drug'

export type UserPerspective = 'everyday' | 'technical'

export interface CommentUser {
  id: string
  name: string
  email: string
  handle?: string
  orcid?: string
  trustTier?: TrustTier
  acceptedEditCount?: number
  noteCount?: number
  isAdmin?: boolean
  joinedDate?: string
}

// ---------------------------------------------------------------------------
// Contribution model — how the open-source community layer works.
// ---------------------------------------------------------------------------

/** Editorial standing retained for attribution and reviewer eligibility. */
export type TrustTier = 'new' | 'contributor' | 'trusted' | 'steward'

export type DoctorVerificationState = 'none' | 'pending' | 'verified' | 'rejected'

export type RevisionStatus = 'published' | 'pending_review' | 'rejected' | 'machine_rejected'

export type LegacyIdentityCorrectionField = 'name' | 'tradeName'

export interface LegacyIdentityCorrectionDetail {
  field: LegacyIdentityCorrectionField
  previousValue: string | null
  proposedValue: string | null
  sourceUrl: string
  sourceTitle: string
}

export interface LegacyRevisionQuarantine {
  reasonCode: 'pre_0011_unsafe_pending'
  systemReason: string
  quarantinedAt: string
}

export interface Revision {
  id: string
  drugId: string
  drugName: string
  drugSlug: string
  authorUserId: string | null
  authorName: string
  authorOrcid?: string
  authorTrustTier: TrustTier
  status: RevisionStatus
  summary: string
  identityCorrection: LegacyIdentityCorrectionDetail | null
  quarantine: LegacyRevisionQuarantine | null
  /** Field-level diff: what changed, from what, to what. */
  changedFields: RevisionFieldChange[]
  /** Historical field retained for old broad revisions; identity corrections always store null. */
  engineReport: unknown
  /** Historical structure-check fields. New identity corrections always store false/null. */
  machineVerified: boolean
  verificationHash: string | null
  createdAt: string
  reviewedAt?: string | null
  reviewedByName?: string | null
  reviewNote?: string | null
}

export interface RevisionFieldChange {
  field: string
  label: string
  before: string
  after: string
}

export interface FeedbackSubmission {
  id: string
  type: 'suggestion' | 'correction' | 'request'
  message: string
  email?: string
  drugSlug?: string
  createdAt: string
}
