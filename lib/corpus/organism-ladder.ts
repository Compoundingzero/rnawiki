/**
 * The organism ladder vocabulary (docs/specs/field-models.md field 2), in rung order.
 *
 * The ladder is the site's one recurring diagram: a record fills the rungs a study has reached
 * and leaves the rest open. Both the home legend and the definitions page read this list, so the
 * order and the spelling of a rung exist in one place.
 */
export interface OrganismRung {
  /** The value stored in page_fields, verbatim. */
  readonly rung: string
  /** How the rung is written in the main view. */
  readonly label: string
}

/** Lowest rung first, as the extractor records them. */
export const ORGANISM_RUNGS: readonly OrganismRung[] = [
  { rung: 'yeast', label: 'Yeast' },
  { rung: 'C. elegans', label: 'C. elegans (roundworm)' },
  { rung: 'Drosophila', label: 'Drosophila (fruit fly)' },
  { rung: 'mouse', label: 'Mouse' },
  { rung: 'rat', label: 'Rat' },
  { rung: 'dog', label: 'Dog' },
  { rung: 'NHP', label: 'Non-human primate' },
  { rung: 'human', label: 'Human' },
] as const

export interface EvidenceKind {
  readonly kind: string
  readonly label: string
  readonly meaning: string
}

/** What a filled rung was measuring, in the precedence the extractor applies. */
export const EVIDENCE_KINDS: readonly EvidenceKind[] = [
  {
    kind: 'lifespan',
    label: 'Lifespan',
    meaning: 'How long the animals lived was the recorded outcome.',
  },
  {
    kind: 'healthspan',
    label: 'Healthspan',
    meaning: 'A measure of function or disease burden over life was the recorded outcome.',
  },
  {
    kind: 'biomarker',
    label: 'Biomarker',
    meaning: 'A measured quantity in blood or tissue was the recorded outcome.',
  },
  {
    kind: 'surrogate',
    label: 'Surrogate',
    meaning: 'A stand-in measure was recorded in place of the outcome the reader cares about.',
  },
  {
    kind: 'mechanism-only',
    label: 'Mechanism only',
    meaning: 'The study recorded an effect on a pathway and no outcome in the animal.',
  },
] as const
