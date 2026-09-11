/**
 * What a substance *is*, and separately, how a person can *get* it.
 *
 * The record conflates these two. `modality` holds nine values, and one of them,
 * "Nutraceutical / Botanical", carries 6,445 of the 9,859 medicines — vitamins, minerals, amino
 * acids, plant extracts and manufactured supplement ingredients all in one bucket. `approvalStatus`
 * then mixes a legal category with a supply route: "Non-FDA / Dietary Supplement" is both at once.
 *
 * The result on a page was that every non-prescription substance read as "Over-the-counter
 * medicine", which is wrong three ways. Creatine is not a medicine, a vitamin is not an
 * over-the-counter medicine, and a plant preparation is not either of them.
 *
 * So this file resolves two independent things:
 *
 *   - **Substance type.** What kind of thing it is. A monoclonal antibody stays a monoclonal
 *     antibody whether or not it is approved anywhere.
 *   - **Availability.** How it is supplied, and in which jurisdiction that was recorded. Where the
 *     record cannot support a jurisdiction, the page says availability varies by country rather
 *     than asserting one country's rule as universal.
 *
 * Every classification carries the evidence it used, so a page can show its basis and an operator
 * can see why a record landed where it did.
 */

/* ------------------------------------------------------------ substance type */

export const SUBSTANCE_TYPES = [
  {
    code: 'nutrient',
    label: 'Nutrient',
    plain: 'Something the body needs, normally obtained from food.',
  },
  {
    code: 'dietary_supplement',
    label: 'Dietary supplement',
    plain: 'Sold to add to a diet. Not assessed as a medicine before sale.',
  },
  {
    code: 'botanical',
    label: 'Plant preparation',
    plain: 'Made from a plant or part of one. The exact preparation matters.',
  },
  {
    code: 'medical_food',
    label: 'Medical food',
    plain: 'Formulated for the dietary management of a condition, under supervision.',
  },
  {
    code: 'otc_medicine',
    label: 'Over-the-counter medicine',
    plain: 'A medicine a regulator assessed and allowed to be sold without a prescription.',
  },
  {
    code: 'prescription_medicine',
    label: 'Prescription medicine',
    plain: 'A medicine a clinician has to prescribe.',
  },
  {
    code: 'biologic',
    label: 'Biologic',
    plain: 'Made by living cells rather than by chemistry. Usually injected.',
  },
  {
    code: 'monoclonal_antibody',
    label: 'Antibody medicine',
    plain: 'A made copy of an immune protein, built to stick to one target.',
  },
  { code: 'peptide', label: 'Peptide', plain: 'A short chain of protein building blocks.' },
  {
    code: 'hormone',
    label: 'Hormone',
    plain: 'A body signal, or a copy of one, that acts on tissues elsewhere.',
  },
  {
    code: 'rna_medicine',
    label: 'RNA medicine',
    plain: 'Works on the working copies of genes rather than on a protein directly.',
  },
  {
    code: 'gene_therapy',
    label: 'Gene therapy',
    plain: 'Changes or adds genetic instructions inside cells.',
  },
  {
    code: 'vaccine',
    label: 'Vaccine',
    plain: 'Trains the immune system to recognise something before it is met.',
  },
  {
    code: 'combination_product',
    label: 'Combination product',
    plain: 'More than one active substance in one product.',
  },
  {
    code: 'investigational_substance',
    label: 'Investigational substance',
    plain: 'Still being tested. Not approved as a treatment.',
  },
  {
    code: 'research_compound',
    label: 'Research compound',
    plain: 'Used in laboratories. Not developed as a treatment for people.',
  },
  {
    code: 'withdrawn_substance',
    label: 'Withdrawn substance',
    plain: 'Was available and was taken off the market.',
  },
  {
    code: 'discontinued_product',
    label: 'Discontinued product',
    plain: 'No longer made, though the substance may exist elsewhere.',
  },
  {
    code: 'unknown_type',
    label: 'Type not established',
    plain: 'RNAWiki has not resolved what kind of substance this is.',
  },
] as const

export type SubstanceTypeV4 = (typeof SUBSTANCE_TYPES)[number]['code']

export function substanceTypeLabel(code: SubstanceTypeV4): string {
  return SUBSTANCE_TYPES.find((entry) => entry.code === code)?.label ?? 'Type not established'
}

export function substanceTypePlain(code: SubstanceTypeV4): string {
  return SUBSTANCE_TYPES.find((entry) => entry.code === code)?.plain ?? ''
}

/* -------------------------------------------------------------- availability */

export const AVAILABILITY_STATES = [
  {
    code: 'sold_without_prescription',
    label: 'Sold without a prescription',
    plain: 'Available to buy directly where it is sold.',
    supervision: 'not_usually',
  },
  {
    code: 'prescription_only',
    label: 'Prescription only',
    plain: 'A clinician has to prescribe it.',
    supervision: 'required',
  },
  {
    code: 'clinician_administered',
    label: 'Given by a clinician',
    plain: 'Administered by a health professional rather than taken at home.',
    supervision: 'required',
  },
  {
    code: 'investigational',
    label: 'Still being tested',
    plain: 'Available in studies, not as a treatment.',
    supervision: 'required',
  },
  {
    code: 'withdrawn',
    label: 'Withdrawn',
    plain: 'Taken off the market.',
    supervision: 'required',
  },
  {
    code: 'unavailable',
    label: 'Not available',
    plain: 'No route to obtain it is recorded.',
    supervision: 'unknown',
  },
  {
    code: 'varies_by_jurisdiction',
    label: 'Varies by country',
    plain: 'Availability and regulation vary by country.',
    supervision: 'unknown',
  },
  {
    code: 'unresolved',
    label: 'Not established',
    plain: 'RNAWiki has not resolved how this is supplied.',
    supervision: 'unknown',
  },
] as const

export type AvailabilityState = (typeof AVAILABILITY_STATES)[number]['code']
export type SupervisionLevelV4 = (typeof AVAILABILITY_STATES)[number]['supervision']

export function availabilityLabel(code: AvailabilityState): string {
  return AVAILABILITY_STATES.find((entry) => entry.code === code)?.label ?? 'Not established'
}

export function availabilityPlain(code: AvailabilityState): string {
  return AVAILABILITY_STATES.find((entry) => entry.code === code)?.plain ?? ''
}

export function supervisionFor(code: AvailabilityState): SupervisionLevelV4 {
  return AVAILABILITY_STATES.find((entry) => entry.code === code)?.supervision ?? 'unknown'
}

/** The sentence a page uses when it cannot name one country's rule. */
export const VARIES_BY_COUNTRY = 'Availability and regulation vary by country.'

/* ------------------------------------------------------------- the evidence */

export interface SubstanceInputs {
  /** The legacy modality string, one of nine recorded values. */
  modality?: string | null
  /** The legacy approval-status string. */
  approvalStatus?: string | null
  /** The corpus identity class, where the record has one. */
  entityClass?: string | null
  displayName: string
  /** Other recorded names, used only to spot a plant or a combination. */
  synonyms?: readonly string[]
  controlled?: boolean
  withdrawn?: boolean
  suppressed?: boolean
  /** Jurisdictions with a recorded register row, such as US or EU. */
  registeredJurisdictions?: readonly string[]
  /**
   * The corpus supervision classes a register positively recorded, S1 to S9. These are not an
   * editorial decision: S6 is a boxed warning, S7 a route a clinician administers, S9 a
   * long-acting injection or an injected hormone adjusted by measurement.
   */
  supervisionClasses?: readonly string[]
  /** Recorded route strings, used to spot an injected or infused product. */
  routes?: readonly string[]
  atcCodes?: readonly string[]
}

export interface SubstanceClassification {
  type: SubstanceTypeV4
  typeLabel: string
  /** Why the type was chosen, in words a reader could check. */
  typeBasis: string
  availability: AvailabilityState
  availabilityLabel: string
  availabilityBasis: string
  supervision: SupervisionLevelV4
  /**
   * Whether the availability statement is tied to named jurisdictions. When it is not, the page
   * says availability varies by country rather than asserting one country's rule.
   */
  jurisdictions: string[]
  jurisdictionConfidence: 'named' | 'none'
}

/* ------------------------------------------------------------- type rules */

/**
 * Nutrients the body requires. Deliberately a list rather than a pattern: "vitamin" appears in
 * product names that are not vitamins, and a pattern would sweep those in.
 */
const NUTRIENT_PATTERNS: readonly RegExp[] = [
  /\bvitamin [abcdek]\b/i,
  /\bvitamin b\d{1,2}\b/i,
  /\b(?:retinol|thiamine?|riboflavin|niacin|niacinamide|pantothenic|pyridoxine|biotin|folate|folic acid|cobalamin|ascorbic acid|cholecalciferol|ergocalciferol|tocopherol|menaquinone|phylloquinone)\b/i,
  /\b(?:calcium|magnesium|potassium|sodium|iron|zinc|copper|selenium|iodine|manganese|chromium|molybdenum|phosphorus)\b/i,
  /\b(?:leucine|isoleucine|valine|lysine|methionine|threonine|tryptophan|phenylalanine|histidine|arginine|glutamine|glycine|taurine|carnitine)\b/i,
  /\b(?:omega-?3|epa|dha|linoleic acid|alpha-linolenic)\b/i,
  /\bcholine\b/i,
]

/** Words that mark a plant preparation, including the part and the preparation method. */
const BOTANICAL_PATTERNS: readonly RegExp[] = [
  /\b(?:leaf|leaves|root|bark|stem|flower|seed|fruit|berry|rhizome|whole plant|aerial parts?|pollen|resin|husk|peel|hull|sprout)\b/i,
  /\b(?:extract|tincture|decoction|infusion|powdered herb|dried herb)\b/i,
  /\b(?:herb|herbal|botanical)\b/i,
]

/**
 * A Latin binomial. The species is matched in either case because the corpus title-cases its plant
 * names: the record says "Melilotus Officinalis", not "Melilotus officinalis". Nutrients are
 * resolved before this runs, so a two-word mineral salt such as "Calcium Ascorbate" is claimed by
 * the nutrient list first and never reaches here.
 */
const BINOMIAL = /\b[A-Z][a-z]{3,}\s+[A-Za-z][a-z]{3,}\b/

const COMBINATION_PATTERNS: readonly RegExp[] = [
  /\band\b.*\bcombination\b/i,
  /\bcombination\b/i,
  /\s\+\s/,
  /\b\w+\/\w+\b.*\b(?:tablet|capsule|injection)\b/i,
]

const VACCINE_PATTERNS: readonly RegExp[] = [/\bvaccine\b/i, /\btoxoid\b/i, /\bimmuni[sz]ation\b/i]

const HORMONE_PATTERNS: readonly RegExp[] = [
  /\b(?:insulin|testosterone|oestrogen|estrogen|progesterone|thyroxine|levothyroxine|cortisol|hydrocortisone|melatonin|oxytocin|glucagon|somatropin|growth hormone)\b/i,
]

function classifyType(inputs: SubstanceInputs): { type: SubstanceTypeV4; basis: string } {
  const name = inputs.displayName
  const modality = (inputs.modality ?? '').toLowerCase()
  const entityClass = (inputs.entityClass ?? '').toUpperCase()
  const approval = (inputs.approvalStatus ?? '').toLowerCase()
  const names = [name, ...(inputs.synonyms ?? [])].join(' · ')

  /*
   * Withdrawal comes from the approval status or the identity class, never from the corpus page
   * flag alone. 336 corpus pages carry that flag while their approval status reads "FDA Approved":
   * the flag marks a page whose *product or indication* was withdrawn, not a substance that is off
   * the market. Reading it as a substance state would have told a reader that 336 currently
   * approved medicines are withdrawn.
   */
  if (entityClass === 'WITHDRAWN_MEDICINE' || /withdrawn/.test(approval)) {
    return {
      type: 'withdrawn_substance',
      basis: 'The approval record marks this as withdrawn from market.',
    }
  }

  // Modality is the most reliable single field where it is specific.
  if (/monoclonal antibody|\bmab\b/.test(modality) || entityClass === 'ANTIBODY') {
    return { type: 'monoclonal_antibody', basis: 'The record names this as a monoclonal antibody.' }
  }
  if (/crispr|gene therapy/.test(modality)) {
    return { type: 'gene_therapy', basis: 'The record names this as a gene therapy.' }
  }
  if (/sirna|antisense|oligonucleotide|\baso\b/.test(modality)) {
    return { type: 'rna_medicine', basis: 'The record names this as an RNA medicine.' }
  }
  if (/mrna/.test(modality)) {
    return VACCINE_PATTERNS.some((pattern) => pattern.test(names))
      ? { type: 'vaccine', basis: 'The record names this as a messenger RNA vaccine.' }
      : { type: 'rna_medicine', basis: 'The record names this as a messenger RNA product.' }
  }
  if (VACCINE_PATTERNS.some((pattern) => pattern.test(names))) {
    return { type: 'vaccine', basis: 'The recorded name identifies this as a vaccine.' }
  }
  if (/peptide|glp-1/.test(modality)) {
    return HORMONE_PATTERNS.some((pattern) => pattern.test(names))
      ? { type: 'hormone', basis: 'A peptide that copies or replaces a body signal.' }
      : { type: 'peptide', basis: 'The record names this as a peptide.' }
  }
  if (/recombinant protein|biologic/.test(modality) || entityClass === 'APPROVED_BIOLOGIC') {
    return HORMONE_PATTERNS.some((pattern) => pattern.test(names))
      ? { type: 'hormone', basis: 'A recombinant protein that replaces a body signal.' }
      : { type: 'biologic', basis: 'The record names this as a biologic.' }
  }
  if (HORMONE_PATTERNS.some((pattern) => pattern.test(names))) {
    return { type: 'hormone', basis: 'The recorded name identifies this as a hormone.' }
  }

  /*
   * The bucket that mattered most. "Nutraceutical / Botanical" covers 6,445 records and hides three
   * different things. A plant preparation is decided by its identity class, its Latin name or a
   * named plant part; a nutrient by a fixed list of substances a body requires; everything else
   * that is sold as a supplement is a dietary supplement and is not called a medicine.
   */
  const looksBotanical =
    entityClass === 'BOTANICAL_OR_ORGANISM_PREPARATION' ||
    BINOMIAL.test(name) ||
    BOTANICAL_PATTERNS.some((pattern) => pattern.test(names))
  const looksNutrient = NUTRIENT_PATTERNS.some((pattern) => pattern.test(name))

  if (/nutraceutical|botanical/.test(modality) || entityClass === 'SUPPLEMENT_INGREDIENT') {
    if (looksBotanical && !looksNutrient) {
      return {
        type: 'botanical',
        basis: 'A plant preparation: the record names a species, a plant part or an extract.',
      }
    }
    if (looksNutrient) {
      return {
        type: 'nutrient',
        basis: 'A substance the body requires, normally obtained from food.',
      }
    }
    return {
      type: 'dietary_supplement',
      basis: 'Sold as a supplement. No regulator assessed it as a medicine before sale.',
    }
  }

  if (entityClass === 'COMBINATION' || COMBINATION_PATTERNS.some((pattern) => pattern.test(name))) {
    return {
      type: 'combination_product',
      basis: 'The recorded name describes more than one active substance.',
    }
  }

  if (/pre-clinical|open source/.test(approval) || entityClass === 'RESEARCH_COMPOUND') {
    return {
      type: 'research_compound',
      basis: 'The record places this before human testing.',
    }
  }
  if (/phase \d|investigational/.test(approval) || entityClass === 'INVESTIGATIONAL_MEDICINE') {
    return {
      type: 'investigational_substance',
      basis: 'The record places this in clinical testing.',
    }
  }
  if (/approved/.test(approval) || entityClass === 'APPROVED_MEDICINE') {
    // Approved medicines split by supply route, which the availability rules resolve below.
    return { type: 'prescription_medicine', basis: 'A regulator approved this as a medicine.' }
  }
  if (/off-label|compounded/.test(approval)) {
    return {
      type: 'prescription_medicine',
      basis: 'Used outside its approved use, or prepared by a compounding pharmacy.',
    }
  }
  /*
   * No modality and no useful approval field. Before giving up, the name itself is read: a record
   * called "Manganese Lactate" is a nutrient whatever the record forgot to say.
   */
  if (looksNutrient) {
    return {
      type: 'nutrient',
      basis: 'The recorded name identifies a substance the body requires.',
    }
  }
  if (looksBotanical) {
    return { type: 'botanical', basis: 'The recorded name identifies a plant or a plant part.' }
  }
  return {
    type: 'unknown_type',
    basis: 'No recorded field settles what kind of substance this is.',
  }
}

/* ------------------------------------------------------ availability rules */

const INJECTED = /\b(?:inject|infus|intravenous|subcutaneous|intramuscular|implant|infusion)\b/i

function classifyAvailability(
  inputs: SubstanceInputs,
  type: SubstanceTypeV4,
): { availability: AvailabilityState; basis: string } {
  const approval = (inputs.approvalStatus ?? '').toLowerCase()
  const jurisdictions = inputs.registeredJurisdictions ?? []
  const routes = (inputs.routes ?? []).join(' ')

  /*
   * The supervision classes are a register's recorded classification, not an editorial decision.
   *
   * An earlier version of this file read the page's suppressed flag as "RNAWiki holds this record
   * back" and answered "not established". That took semaglutide — carrying S9, an injected hormone
   * adjusted by measurement — and told a reader RNAWiki had not resolved how it is supplied. Each
   * class makes supervision more certain, not less: S6 is a boxed warning, S7 a route a clinician
   * administers, S8 a recorded withdrawal, S9 an injected hormone.
   */
  const classes = inputs.supervisionClasses ?? []
  const clinicianRoute = classes.includes('S7') || classes.includes('S9')
  const supervised = classes.some((code) => /^S[1-9]$/.test(code))

  if (/withdrawn/.test(approval)) {
    return {
      availability: 'withdrawn',
      basis: 'The approval record marks this as withdrawn from market.',
    }
  }
  if (classes.includes('S8')) {
    return {
      availability: 'withdrawn',
      basis: 'A register recorded a withdrawal or suspension for a safety reason.',
    }
  }
  /*
   * The page flag and the approval status disagree on hundreds of records. Neither is asserted over
   * the other: the page says availability varies and names the disagreement, which is true and is
   * what a reader can act on.
   */
  if (inputs.withdrawn && /approved/.test(approval)) {
    return {
      availability: 'varies_by_jurisdiction',
      basis:
        'The record is marked as withdrawn in one place and approved in another. RNAWiki has not resolved which applies where.',
    }
  }
  if (inputs.withdrawn) {
    return {
      availability: 'varies_by_jurisdiction',
      basis:
        'A product or use on this record was withdrawn. Whether the substance is available elsewhere is unresolved.',
    }
  }
  if (/controlled \/ no approved use/.test(approval)) {
    return {
      availability: 'unavailable',
      basis: 'The approval record places this under control with no approved use.',
    }
  }
  if (/pre-clinical|open source|phase \d|investigational/.test(approval)) {
    return {
      availability: 'investigational',
      basis: 'The record places this in testing, not in supply.',
    }
  }
  if (/dietary supplement|non-fda/.test(approval)) {
    // A supplement carrying a register classification is not an ordinary supplement.
    if (supervised) {
      return {
        availability: clinicianRoute ? 'clinician_administered' : 'prescription_only',
        basis:
          'Sold as a supplement, and a register recorded a classification that restricts supply.',
      }
    }
    return {
      availability:
        jurisdictions.length > 0 ? 'sold_without_prescription' : 'varies_by_jurisdiction',
      basis:
        jurisdictions.length > 0
          ? `Recorded as sold without a prescription in ${jurisdictions.join(', ')}.`
          : 'Sold as a supplement where the record was written. No jurisdiction is recorded here.',
    }
  }
  if (/approved/.test(approval) || /off-label|compounded/.test(approval)) {
    if (
      clinicianRoute ||
      INJECTED.test(routes) ||
      type === 'monoclonal_antibody' ||
      type === 'gene_therapy'
    ) {
      return {
        availability: 'clinician_administered',
        basis:
          jurisdictions.length > 0
            ? `Approved in ${jurisdictions.join(', ')} and given by a health professional.`
            : 'Given by a health professional. No jurisdiction is recorded here.',
      }
    }
    return {
      availability: 'prescription_only',
      basis:
        jurisdictions.length > 0
          ? `Approved as a prescription medicine in ${jurisdictions.join(', ')}.`
          : 'Approved as a medicine. No jurisdiction is recorded on this record.',
    }
  }
  if (inputs.controlled || supervised) {
    return {
      availability: clinicianRoute ? 'clinician_administered' : 'prescription_only',
      basis: 'A register recorded a classification that restricts how this is supplied.',
    }
  }
  return {
    availability: 'unresolved',
    basis: 'No register row or approval field settles how this is supplied.',
  }
}

/**
 * Resolve what a substance is and how it is supplied, as two separate answers.
 *
 * Neither answer is allowed to imply the other. A supplement is not an over-the-counter medicine
 * because it is sold without a prescription, and an antibody stays an antibody whether or not any
 * regulator has approved it.
 */
export function classifySubstance(inputs: SubstanceInputs): SubstanceClassification {
  const { type, basis: typeBasis } = classifyType(inputs)
  const { availability, basis: availabilityBasis } = classifyAvailability(inputs, type)
  const jurisdictions = [...(inputs.registeredJurisdictions ?? [])]
  return {
    type,
    typeLabel: substanceTypeLabel(type),
    typeBasis,
    availability,
    availabilityLabel: availabilityLabel(availability),
    availabilityBasis,
    supervision: supervisionFor(availability),
    jurisdictions,
    jurisdictionConfidence: jurisdictions.length > 0 ? 'named' : 'none',
  }
}

/** Whether a page of this kind may offer a self-experiment planner at all. */
export function planningEligibleType(type: SubstanceTypeV4): boolean {
  return (
    type === 'nutrient' ||
    type === 'dietary_supplement' ||
    type === 'botanical' ||
    type === 'otc_medicine'
  )
}
